from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import pdfplumber

# Output fields expected by the app. Extra fields are intentionally not written by default.
FIELDS = [
    "Nr",
    "OLSDI",
    "Raionul/Municipiul",
    "Tipul instituției de învățământ",
    "Denumirea instituției de învățământ",
    "Codul specialității",
    "Denumirea specialității",
]

# PDF columns that may be useful for validation / future UI filters.
OPTIONAL_FIELDS = [
    "total_posts",
    "specialists_higher",
    "specialists_vocational",
    "language_ro",
    "language_ru",
    "environment_urban",
    "environment_rural",
]

TABLE_SETTINGS = {
    "vertical_strategy": "lines",
    "horizontal_strategy": "lines",
    "intersection_tolerance": 6,
    "snap_tolerance": 4,
    "join_tolerance": 4,
}

# Canonical spellings for names that often appear uppercase, compacted or without diacritics.
CITY_FIXES = {
    "BALTI": "Bălți",
    "BĂLȚI": "Bălți",
    "BĂLŢI": "Bălți",
    "CHISINAU": "Chișinău",
    "CHIȘINĂU": "Chișinău",
    "CHIŞINĂU": "Chișinău",
    "STEFANVODA": "Ștefan Vodă",
    "ȘTEFANVODĂ": "Ștefan Vodă",
    "ŞTEFANVODĂ": "Ștefan Vodă",
    "ȘTEFAN VODĂ": "Ștefan Vodă",
    "ŞTEFAN VODĂ": "Ștefan Vodă",
    "UTAGAGAUZIA": "UTA Găgăuzia",
    "UTAGĂGĂUZIA": "UTA Găgăuzia",
    "UTA GAGAUZIA": "UTA Găgăuzia",
    "UTA GĂGĂUZIA": "UTA Găgăuzia",
}

# Common OCR / source typos from Moldovan educational vacancy PDFs.
TEXT_FIXES = {
    "insttituției": "instituției",
    "muncipiul": "municipiul",
    "Basarabesca": "Basarabeasca",
    "Gimnaiziul": "Gimnaziul",
    "Matemetica": "Matematică",
    "Atrenament": "Antrenament",
}


@dataclass(frozen=True)
class ExtractStats:
    pages: int
    tables: int
    rows_seen: int
    rows_extracted: int
    skipped_without_required_fields: int
    duplicate_ids: int


def clean_text(value: Any, *, keep_newlines: bool = False) -> str:
    """Normalize whitespace and remove PDF extraction artefacts."""
    if value is None:
        return ""
    text = str(value).replace("\r", "\n").replace("\ufffe", "-")
    for wrong, right in TEXT_FIXES.items():
        text = text.replace(wrong, right)
    if keep_newlines:
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
        return "\n".join(line for line in lines if line).strip()
    return re.sub(r"\s+", " ", text).strip()


def strip_diacritics(text: str) -> str:
    return "".join(
        ch for ch in unicodedata.normalize("NFKD", text)
        if not unicodedata.combining(ch)
    )


def compact_key(text: str) -> str:
    text = strip_diacritics(clean_text(text)).upper()
    return re.sub(r"[^A-Z0-9]+", "", text)


def normalize_header(value: Any) -> str:
    text = strip_diacritics(clean_text(value)).lower()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def normalize_city(value: str) -> str:
    city = clean_text(value)
    city = re.sub(r"^(OLSD[ÎI]|OLDS[ÎI]|OLS[ÎI]|DGETS|DETS)\s+", "", city, flags=re.IGNORECASE)
    city = re.sub(r"^(mun\.|municipiul|r-nul|raionul)\s+", "", city, flags=re.IGNORECASE)
    city = city.strip(" ,.;:-")

    key = compact_key(city)
    fixed = CITY_FIXES.get(key) or CITY_FIXES.get(city.upper())
    if fixed:
        return fixed

    # Preserve already-correct mixed case. Title-case only all-uppercase values.
    if city.isupper():
        return city.title()
    return city


def infer_city(record: dict[str, str]) -> str:
    """Prefer explicit district/municipality; fallback to OLSDÎ column used by 2026 PDF."""
    explicit = record.get("Raionul/Municipiul", "")
    if explicit:
        return normalize_city(explicit)
    olsdi = record.get("OLSDI", "")
    return normalize_city(olsdi)


def field_for_header(header: str) -> str | None:
    h = normalize_header(header)

    if h in {"nr", "n r", "numar"} or ("codul" in h and "funct" in h):
        return "Nr"
    if "olsdi" in h or "ol sdi" in h:
        return "OLSDI"
    if "raion" in h or "municip" in h:
        return "Raionul/Municipiul"
    if "tipul" in h and ("institut" in h or "inst" in h):
        return "Tipul instituției de învățământ"
    if "denumirea" in h and "institut" in h:
        return "Denumirea instituției de învățământ"
    if "codul" in h and ("special" in h or "discipl" in h):
        return "Codul specialității"
    if "denumirea" in h and "special" in h:
        return "Denumirea specialității"
    if "total" in h and "posturi" in h:
        return "total_posts"
    if "studii superioare" in h:
        return "specialists_higher"
    if "studii" in h and ("profesion" in h or "tehnice" in h):
        return "specialists_vocational"
    if h == "romana":
        return "language_ro"
    if h == "rusa":
        return "language_ru"
    if "urban" in h:
        return "environment_urban"
    if "rural" in h:
        return "environment_rural"
    return None


def merge_header_rows(rows: list[list[Any]], start: int) -> list[str]:
    """Merge a main header row with the next subheader row for split table headings."""
    main = rows[start]
    extra = rows[start + 1] if start + 1 < len(rows) else []
    width = max(len(main), len(extra))
    merged: list[str] = []
    last_main = ""
    for index in range(width):
        primary = clean_text(main[index] if index < len(main) else "")
        secondary = clean_text(extra[index] if index < len(extra) else "")
        if primary:
            last_main = primary
        # pdfplumber puts subheaders under empty cells for grouped headings.
        base = primary or last_main
        merged.append(clean_text(f"{base} {secondary}"))
    return merged


def detect_header(rows: list[list[Any]], index: int) -> tuple[dict[int, str] | None, int]:
    candidates = [
        [clean_text(cell) for cell in rows[index]],
        merge_header_rows(rows, index),
    ]

    best: dict[int, str] = {}
    for candidate in candidates:
        mapping: dict[int, str] = {}
        used: set[str] = set()
        for col, cell in enumerate(candidate):
            field = field_for_header(cell)
            if field and field not in used:
                mapping[col] = field
                used.add(field)
        if len(mapping) > len(best):
            best = mapping

    required = {
        "Nr",
        "OLSDI",
        "Tipul instituției de învățământ",
        "Denumirea instituției de învățământ",
        "Codul specialității",
        "Denumirea specialității",
    }
    if required.issubset(set(best.values())):
        # Skip the second subheader row when we detected a merged header.
        return best, 1
    return None, 0


def row_to_record(row: list[Any], mapping: dict[int, str], *, keep_newlines: bool = False) -> dict[str, str]:
    record = {field: "" for field in FIELDS + OPTIONAL_FIELDS}
    for index, field in mapping.items():
        if index < len(row):
            record[field] = clean_text(row[index], keep_newlines=keep_newlines)
    if not record["Raionul/Municipiul"]:
        record["Raionul/Municipiul"] = infer_city(record)
    return record


def looks_like_data_row(record: dict[str, str]) -> bool:
    row_id = record.get("Nr", "")
    if not re.match(r"^[A-Z]?\d{3,5}$", row_id):
        return False
    return bool(
        record.get("OLSDI")
        and record.get("Denumirea instituției de învățământ")
        and record.get("Codul specialității")
        and record.get("Denumirea specialității")
    )


def dedupe_records(records: Iterable[dict[str, str]]) -> tuple[list[dict[str, str]], int]:
    result: list[dict[str, str]] = []
    seen: set[str] = set()
    duplicates = 0
    for record in records:
        row_id = record.get("Nr", "")
        if row_id in seen:
            duplicates += 1
            continue
        seen.add(row_id)
        result.append(record)
    return result, duplicates


def extract_records(pdf_path: Path, *, keep_newlines: bool = False) -> tuple[list[dict[str, str]], ExtractStats]:
    records: list[dict[str, str]] = []
    header: dict[int, str] | None = None
    tables_count = 0
    rows_seen = 0
    skipped = 0

    with pdfplumber.open(pdf_path) as pdf:
        pages_count = len(pdf.pages)
        for page_number, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables(TABLE_SETTINGS)
            tables_count += len(tables)
            for table in tables:
                index = 0
                while index < len(table):
                    row = table[index]
                    rows_seen += 1
                    if not row or not any(clean_text(cell) for cell in row):
                        index += 1
                        continue

                    maybe_header, skip_next = detect_header(table, index)
                    if maybe_header:
                        header = maybe_header
                        index += 1 + skip_next
                        continue

                    if not header:
                        index += 1
                        continue

                    record = row_to_record(row, header, keep_newlines=keep_newlines)
                    if looks_like_data_row(record):
                        record["_page"] = str(page_number)
                        records.append(record)
                    else:
                        skipped += 1
                    index += 1

    records, duplicates = dedupe_records(records)
    stats = ExtractStats(
        pages=pages_count,
        tables=tables_count,
        rows_seen=rows_seen,
        rows_extracted=len(records),
        skipped_without_required_fields=skipped,
        duplicate_ids=duplicates,
    )
    return records, stats


def vacancy_from_record(record: dict[str, str], *, include_stats: bool = False) -> dict[str, Any]:
    city = infer_city(record)
    vacancy: dict[str, Any] = {
        "id": record["Nr"],
        "city": city,
        "olsdi": record["OLSDI"],
        "institution_type": record["Tipul instituției de învățământ"],
        "institution": record["Denumirea instituției de învățământ"],
        "specialty_code": record["Codul specialității"],
        "specialty_name": record["Denumirea specialității"],
    }
    if include_stats:
        for field in OPTIONAL_FIELDS:
            if record.get(field) != "":
                vacancy[field] = int(record[field]) if record[field].isdigit() else record[field]
        vacancy["source_page"] = int(record["_page"])
    return vacancy


def to_vacancy_json(records: list[dict[str, str]], *, include_stats: bool = False) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        city = infer_city(record)
        grouped[city].append(vacancy_from_record(record, include_stats=include_stats))
    return dict(sorted(grouped.items(), key=lambda item: strip_diacritics(item[0]).lower()))


def print_report(data: dict[str, list[dict[str, Any]]], stats: ExtractStats) -> None:
    rows = sum(len(items) for items in data.values())
    print(f"Pages: {stats.pages}")
    print(f"Tables: {stats.tables}")
    print(f"Rows seen: {stats.rows_seen}")
    print(f"Extracted vacancies: {rows}")
    print(f"Cities/districts: {len(data)}")
    if stats.duplicate_ids:
        print(f"Duplicate IDs skipped: {stats.duplicate_ids}")
    print("Top 10 cities/districts:")
    for city, items in sorted(data.items(), key=lambda item: len(item[1]), reverse=True)[:10]:
        print(f"  {city}: {len(items)}")


def dump_text(pdf_path: Path, pages: int) -> None:
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages[:pages], start=1):
            print(f"--- PAGE {page_number} ---")
            print(page.extract_text(layout=True) or "")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract Moldovan teaching vacancies from the official PDF into JSON grouped by city/district."
    )
    parser.add_argument("pdf", type=Path, help="Path to the source PDF")
    parser.add_argument("--out", type=Path, default=Path("public/data/vacante_by_city.json"))
    parser.add_argument("--dry-run", action="store_true", help="Parse and print a report without writing JSON")
    parser.add_argument("--dump-text", action="store_true", help="Print extracted text for debugging")
    parser.add_argument("--dump-pages", type=int, default=3, help="How many pages to print with --dump-text")
    parser.add_argument("--include-stats", action="store_true", help="Include count/language/environment columns in each vacancy")
    parser.add_argument("--keep-newlines", action="store_true", help="Keep line breaks inside long cell values")
    parser.add_argument("--compact", action="store_true", help="Write compact JSON instead of pretty JSON")
    parser.add_argument("--min-rows", type=int, default=1, help="Fail if fewer rows are extracted")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not args.pdf.exists():
        raise SystemExit(f"PDF not found: {args.pdf}")

    if args.dump_text:
        dump_text(args.pdf, args.dump_pages)
        return

    records, stats = extract_records(args.pdf, keep_newlines=args.keep_newlines)
    data = to_vacancy_json(records, include_stats=args.include_stats)
    print_report(data, stats)

    rows = sum(len(items) for items in data.values())
    if rows < args.min_rows:
        raise SystemExit(f"Only {rows} rows extracted; expected at least {args.min_rows}.")

    if args.dry_run:
        return

    args.out.parent.mkdir(parents=True, exist_ok=True)
    if args.compact:
        payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
    else:
        payload = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    args.out.write_text(payload, encoding="utf-8")
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("Interrupted")
