import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schoolsPath = path.join(__dirname, '../schools.json');
const publicDir = path.join(__dirname, '../public');

const rawData = fs.readFileSync(schoolsPath, 'utf8');
const data = JSON.parse(rawData);

// 1. Generate catalog.md
let catalogMd = '# Catalogul Vacanțelor Didactice din Republica Moldova\n\n';
catalogMd += 'Acest document conține lista completă a instituțiilor și posturilor vacante, optimizată pentru LLMs.\n\n';

const schools = data.schools;

// Group schools by district/locality
const grouped = {};
for (const school of schools) {
  if (!school.vacancies || school.vacancies.length === 0) continue;
  
  const location = [school.locality, school.district].filter(Boolean).join(', ') || 'Necunoscut';
  if (!grouped[location]) grouped[location] = [];
  grouped[location].push(school);
}

// Sort locations alphabetically
const locations = Object.keys(grouped).sort();

for (const loc of locations) {
  catalogMd += `## ${loc}\n\n`;
  
  // Sort schools alphabetically within location
  grouped[loc].sort((a, b) => a.name.localeCompare(b.name));
  
  for (const school of grouped[loc]) {
    catalogMd += `### ${school.name}\n`;
    if (school.address) catalogMd += `- **Adresă:** ${school.address}\n`;
    if (school.phone) catalogMd += `- **Telefon:** ${school.phone}\n`;
    catalogMd += `- **Locuri vacante:**\n`;
    for (const vacancy of school.vacancies) {
      catalogMd += `  - ${vacancy.specialty_name} (Cod: ${vacancy.specialty_code || 'N/A'})\n`;
    }
    catalogMd += '\n';
  }
}

fs.writeFileSync(path.join(publicDir, 'catalog.md'), catalogMd);

// 2. Generate llms.txt
const llmsTxt = `# EduMap Moldova

> O hartă interactivă cu locurile vacante din sistemul educațional din Republica Moldova.

EduMap este o platformă dedicată cadrelor didactice, pentru a găsi posturi vacante în școlile, liceele și grădinițele din Moldova. Datele sunt agregate din sursele oficiale ale Ministerului Educației (MEC).

## Structura Datelor

- [Catalogul Vacanțelor (Markdown)](/edumap/catalog.md): O listă completă, text-only, a tuturor posturilor vacante curente grupate pe localități și instituții, gata pentru a fi analizată de asistenții AI.

## Contact și Surse
- Surse oficiale: https://mec.gov.md
`;

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt);
console.log('LLMs files (llms.txt and catalog.md) generated successfully in public/.');
