import { SpecialtyCategory } from '../types';

export function normalizeSpecialty(raw: string): string {
  if (!raw) return "";
  let str = raw;
  // Replace \n and \r with space
  str = str.replace(/[\n\r]+/g, " ");
  // Remove content in parentheses
  str = str.replace(/\s*\([^)]*\)\s*/g, " ");
  // Collapse multiple spaces
  str = str.replace(/\s+/g, " ");
  // Trim
  str = str.trim();
  // Fix typos
  str = str.replace(/Psihopedgog/gi, "Psihopedagog");
  str = str.replace(/muncipiul/gi, "municipiul");
  str = str.replace(/\bMatematica\b/g, "Matematică");
  str = str.replace(/\bFizica\b/g, "Fizică");
  str = str.replace(/\bInformatica\b/g, "Informatică");
  str = str.replace(/\bCimia\b/gi, "Chimie");
  str = str.replace(/\bBilogie\b/gi, "Biologie");
  str = str.replace(/\s*\/\s*/g, " / ");
  return str;
}

export function normalizeInstitution(raw: string): string {
  if (!raw) return "";
  let str = raw;
  str = str.replace(/[\n\r]+/g, " ");
  str = str.replace(/\s+/g, " ");
  return str.trim();
}

export function normalizeDisplayLabel(raw: string): string {
  if (!raw) return "Nespecificat";

  let str = raw.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim();
  str = str.replace(/^,\s*/, "");

  const compact = removeDiacritics(str).toLowerCase().replace(/[\s-]+/g, "");

  const known: Record<string, string> = {
    stefanvoda: "Ștefan Vodă",
    utagagauzia: "UTA Găgăuzia",
    gagauzia: "UTA Găgăuzia",
    institutieeducatietimpurie: "Instituție de educație timpurie",
    institutiedeeducatietimpurie: "Instituție de educație timpurie",
    institutiedeeducatiatimpurie: "Instituție de educație timpurie",
    gradinitadecopii: "Grădiniță de copii",
    cresagradinitadecopii: "Creșă-grădiniță",
    centruldecreatiealcopiilor: "Centrul de creație al copiilor",
    complexeducational: "Complex educațional",
    scoalaspeciala: "Școală specială",
    gimnaziugradinita: "Gimnaziu-grădiniță",
  };

  if (known[compact]) return known[compact];

  str = str.replace(/([a-zăâîșț])([A-ZĂÂÎȘȚ])/g, "$1 $2");
  str = str.replace(/\bMatematica\b/g, "Matematică");
  str = str.replace(/\bFizica\b/g, "Fizică");
  str = str.replace(/\bInformatica\b/g, "Informatică");
  str = str.replace(/\s*\/\s*/g, " / ");
  return str;
}

export function truncateLabel(label: string, max = 28): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function removeDiacritics(str: string): string {
  return str
    .replace(/ș/g, 's')
    .replace(/Ș/g, 'S')
    .replace(/ț/g, 't')
    .replace(/Ț/g, 'T')
    .replace(/ă/g, 'a')
    .replace(/Ă/g, 'A')
    .replace(/î/g, 'i')
    .replace(/Î/g, 'I')
    .replace(/â/g, 'a')
    .replace(/Â/g, 'A');
}

export function categorizeSpecialty(normalizedName: string): SpecialtyCategory {
  const lower = normalizedName.toLowerCase();
  if (/matematică|matematica|informatică|informatica|fizică|fizica|chimie/i.test(lower)) return 'matematica';
  if (/limba română|limba engleză|limba franceză|limba rusă|limba germană|limbi străine|limba/i.test(lower)) return 'limbi';
  if (/biologie|geografie(?! istorică)|știință|stiinta|ecologie/i.test(lower)) return 'stiinte';
  if (/învățământ primar|invatamant primar|pedagogie|educație(?! fizică| plastică| artistică| civică)|educatie/i.test(lower)) return 'pedagogie';
  if (/psihopedagogie|psihologie/i.test(lower)) return 'psihologie';
  if (/muzică|muzica|arte|educație plastică|educatie plastica|educație artistică|educatie artistica|desen/i.test(lower)) return 'arte';
  if (/educație fizică|educatie fizica|sport|cultură fizică|cultura fizica/i.test(lower)) return 'sport';
  if (/istorie|geografie istorică|educație civică|educatie civica|filosofie|cultură civică/i.test(lower)) return 'istorie';
  return 'altele';
}
