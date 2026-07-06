# EduMap Moldova

EduMap Moldova is an interactive web application for exploring teaching vacancies in Moldova by district, institution, and specialty.

The project helps users quickly understand where teaching positions are available, filter vacancies by subject category, and browse vacancy cards on an interactive map.

## Features

- Interactive Moldova map with district-level vacancy data
- Vacancy filtering by specialty category
- Search and browse teaching vacancies by district, institution, and specialty
- Normalized Romanian labels for districts, institutions, and specialties
- Responsive UI for desktop and mobile use
- Dark/light theme support
- Static deployment support for subdirectories such as `/edumap/`

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet / React Leaflet
- Zustand
- Fuse.js
- Recharts
- Framer Motion

## Project Structure

```txt
.
├── public/
│   └── data/
│       ├── moldova-districts.json
│       └── vacante_by_city.json
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── types.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

Use Node.js 20+.

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

By default, the app runs on:

```txt
http://localhost:5173
```

### Type-check the project

```bash
npm run typecheck
```

### Build for production

```bash
npm run build
```

The current Vite configuration outputs the production build to:

```txt
dist/public/
```

### Preview the production build

```bash
npm run serve
```

## Deployment

### Deploy to the root of a domain

Build normally:

```bash
npm run build
```

Upload the contents of:

```txt
dist/public/
```

to your website root.

### Deploy to `https://platon.md/edumap/`

The app must be built with the base path `/edumap/`.

#### Windows PowerShell

```powershell
$env:BASE_PATH="/edumap/"
npm run build
```

#### Windows CMD

```cmd
set BASE_PATH=/edumap/ && npm run build
```

#### macOS / Linux

```bash
BASE_PATH=/edumap/ npm run build
```

Then upload the contents of:

```txt
dist/public/
```

to:

```txt
public_html/edumap/
```

The final structure should look like this:

```txt
public_html/edumap/index.html
public_html/edumap/assets/
public_html/edumap/data/vacante_by_city.json
public_html/edumap/data/moldova-districts.json
```

Do not upload the folder as `public_html/edumap/dist/public/`. Upload only the files inside `dist/public/`.

## Data Files

The app expects these files to be available in the public data directory:

```txt
public/data/vacante_by_city.json
public/data/moldova-districts.json
```

In production, they should be reachable at:

```txt
/edumap/data/vacante_by_city.json
/edumap/data/moldova-districts.json
```

for a subdirectory deployment.

## Updating Vacancy Data

If the project includes a PDF parser script, the typical flow is:

```bash
python update_vacancies_from_pdf.py posturi_didactice_vacante_30_06_2026.pdf --out public/data/vacante_by_city.json
```

After updating the JSON data, rebuild the app:

```bash
npm run typecheck
npm run build
```

## Common Blank Page Fixes

If the deployed site shows a blank page, check these first:

1. The app was built with the correct base path.
2. The uploaded files are from inside `dist/public/`, not the folder itself.
3. The JSON files are accessible in the browser.
4. Browser DevTools Console has no missing asset errors.

For `https://platon.md/edumap/`, these URLs should open:

```txt
https://platon.md/edumap/data/vacante_by_city.json
https://platon.md/edumap/data/moldova-districts.json
```

## Recommended Scripts

For easier cross-platform deployment, add `cross-env`:

```bash
npm install -D cross-env
```

Then add this script to `package.json`:

```json
{
  "scripts": {
    "build:platon": "cross-env BASE_PATH=/edumap/ vite build --config vite.config.ts"
  }
}
```

After that, build with:

```bash
npm run build:platon
```

## License

No license has been specified yet.
