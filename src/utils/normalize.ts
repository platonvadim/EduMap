import { SpecialtyCategory } from '../types';

/**
 * Normalization utilities for Moldovan teacher vacancy data.
 *
 * Important distinction:
 * - Display normalization keeps useful qualifiers like (Logoped), (Psiholog), etc.
 * - Search/category normalization may remove punctuation/diacritics but must not lose meaning.
 */

type NormalizeSpecialtyOptions = {
  /**
   * Use only for search keys / aggressive deduplication.
   * For UI labels keep this false, because parentheses often contain the actual role.
   */
  removeParentheses?: boolean;
};

const TYPO_FIXES: Array<[RegExp, string]> = [
  [/Psihopedgog/gi, 'Psihopedagog'],
  [/Psihopedgogie/gi, 'Psihopedagogie'],
  [/muncipiul/gi, 'municipiul'],
  [/insttituției/gi, 'instituției'],
  [/insttituției/gi, 'instituției'],
  [/insttituției/gi, 'instituției'],
  [/instituţia/gi, 'instituția'],
  [/instituţie/gi, 'instituție'],
  [/învățămînt/gi, 'învățământ'],
  [/Educător/gi, 'Educator'],
  [/Atrenament/gi, 'Antrenament'],
  [/Matemetică/gi, 'Matematică'],
  [/\bMatematica\b/gi, 'Matematică'],
  [/\bFizica\b/gi, 'Fizică'],
  [/\bInformatica\b/gi, 'Informatică'],
  [/\bChimia\b/gi, 'Chimie'],
  [/\bCimia\b/gi, 'Chimie'],
  [/\bBiologia\b/gi, 'Biologie'],
  [/\bBilogie\b/gi, 'Biologie'],
  [/\bGeografia\b/gi, 'Geografie'],
  [/\bIstoria\b/gi, 'Istorie'],
];

const DISPLAY_LABEL_FIXES: Record<string, string> = {
  stefanvoda: 'Ștefan Vodă',
  balti: 'Bălți',
  chisinau: 'Chișinău',
  utagagauzia: 'UTA Găgăuzia',
  gagauzia: 'UTA Găgăuzia',
  institutieeducatietimpurie: 'Instituție de educație timpurie',
  institutiedeeducatietimpurie: 'Instituție de educație timpurie',
  institutiedeeducatiatimpurie: 'Instituție de educație timpurie',
  gradinitadecopii: 'Grădiniță de copii',
  cresagradinitadecopii: 'Creșă-grădiniță',
  centruldecreatiealcopiilor: 'Centrul de creație al copiilor',
  complexeducational: 'Complex educațional',
  scoalaspeciala: 'Școală specială',
  gimnaziugradinita: 'Gimnaziu-grădiniță',
  gimnaziugradinită: 'Gimnaziu-grădiniță',
};

function cleanWhitespace(raw: string): string {
  return raw.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function applyCommonFixes(value: string): string {
  let str = value;

  for (const [pattern, replacement] of TYPO_FIXES) {
    str = str.replace(pattern, replacement);
  }

  return str
    .replace(/[„”]/g, '"')
    .replace(/[«»]/g, '"')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ș/g, 's')
    .replace(/Ș/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ț/g, 't')
    .replace(/Ț/g, 'T')
    .replace(/ţ/g, 't')
    .replace(/Ţ/g, 'T');
}

export function normalizeSpecialty(raw: string, options: NormalizeSpecialtyOptions = {}): string {
  if (!raw) return '';

  let str = cleanWhitespace(raw);

  if (options.removeParentheses) {
    str = str.replace(/\s*\([^)]*\)\s*/g, ' ');
  }

  return applyCommonFixes(str);
}

export function normalizeInstitution(raw: string): string {
  if (!raw) return '';
  return applyCommonFixes(cleanWhitespace(raw));
}

export function normalizeDisplayLabel(raw: string): string {
  if (!raw) return 'Nespecificat';

  let str = cleanWhitespace(raw).replace(/^,\s*/, '');
  const compact = removeDiacritics(str).toLowerCase().replace(/[\s\-_.,()]+/g, '');

  if (DISPLAY_LABEL_FIXES[compact]) return DISPLAY_LABEL_FIXES[compact];

  str = str.replace(/([a-zăâîșşțţ])([A-ZĂÂÎȘŞȚŢ])/g, '$1 $2');
  return applyCommonFixes(str);
}

export function truncateLabel(label: string, max = 28): string {
  if (!label) return '';
  if (max <= 1) return '…';
  return label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
}

function categoryKey(raw: string): string {
  return removeDiacritics(normalizeSpecialty(raw, { removeParentheses: false })).toLowerCase();
}

export function categorizeSpecialty(normalizedName: string): SpecialtyCategory {
  const lower = categoryKey(normalizedName);

  // Order matters. Psihopedagogie contains "pedagogie", so psychology/support roles must be checked first.
  if (/psihopedagogie|psihologie|psiholog|logoped|cadru didactic de sprijin|cadru de sprijin/.test(lower)) {
    return 'psihologie';
  }

  if (/matematica|informatica|fizica|chimie/.test(lower)) {
    return 'matematica';
  }

  if (/limba|literatura|engleza|franceza|rusa|germana|ucraineana|bulgara|gagauza|limbi straine/.test(lower)) {
    return 'limbi';
  }

  if (/biologie|geografie(?! istorica)|stiinta|stiinte|ecologie/.test(lower)) {
    return 'stiinte';
  }

  if (/invatator|invatamant primar|pedagogie prescolara|pedagogie in invatamantul primar|educator|educatie timpurie|educatie prescolara/.test(lower)) {
    return 'pedagogie';
  }

  if (/muzica|conducator muzical|arte|arta|desen|educatie plastica|educatie artistica|educatie tehnologica|tehnologica/.test(lower)) {
    return 'arte';
  }

  if (/educatie fizica|sport|antrenament sportiv|antrenor|cultura fizica/.test(lower)) {
    return 'sport';
  }

  if (/istorie|istoria romanilor|educatie pentru societate|educatie civica|filosofie|cultura civica|geografie istorica/.test(lower)) {
    return 'istorie';
  }

  return 'altele';
}
