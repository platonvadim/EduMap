# EduMap project memory

Last updated: 2026-07-11

## Product goal

EduMap Moldova is a React/Vite map and catalog for Moldovan educational institutions and teaching vacancies. The primary map view defaults to institutions with published vacancies, while users can opt into all schools, filter the map, inspect city statistics, browse a catalog, and navigate from a vacancy card back to its map marker.

The visible UI is Romanian. User requests and collaboration may be in Russian.

## Stack and verification

- React 19, TypeScript, Vite 7.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Wouter for routing.
- Zustand for global state.
- Leaflet and React Leaflet for the map.
- Fuse.js for vacancy search.
- Radix/shadcn-derived local UI primitives.
- Framer Motion for existing transitions.

Run after changes:

```text
npm run typecheck
npm run build
```

The sandbox may block Vite/esbuild from reading the config. If `npm run build` reports access denied for `vite.config.ts`, rerun with the required elevated permission. A large chunk warning is currently expected because `schools.json` is bundled.

## Important files

- `schools.json`: 1,147 institutions parsed from `https://ctice.md/harta/` with names, coordinates, type, district, locality, address, phone, language, grades, student count, source HTML/text.
- `public/data/vacante_by_city.json`: current vacancy source grouped by city/territory.
- `src/components/MapView.tsx`: school markers, approximate institution markers, map filters, statistics, legend, geolocation, distance filtering, map popups, unmapped/approximate vacancy modal.
- `src/hooks/useSchoolData.ts`: normalizes and matches vacancies to schools by city and institution-name similarity.
- `src/components/CitySidebar.tsx`: right-side city or selected-school panel.
- `src/components/VacancyCard.tsx`: vacancy card and navigation back to the mapped institution.
- `src/pages/HomePage.tsx`: map page, loading/error states, text-search result overlay.
- `src/pages/CatalogPage.tsx`: card-based vacancy/school catalog with contextual search and filters.
- `src/components/Layout.tsx`: desktop/mobile navigation, contextual search, theme control, interactive onboarding tour.
- `src/store/useStore.ts`: shared filters, selection, map target, location and display state.
- `src/components/FilterChips.tsx`: discipline categories.
- `src/utils/normalize.ts`: Romanian/Moldovan normalization and specialty categorization.

## Routes and navigation

- `/`: map.
- `/catalog`: vacancies and schools catalog.
- `/insights`: analytics.
- `/contact`: contact page.

Desktop and mobile navigation both expose Map, Catalog, Analytics and Contact. Search is contextual:

- On `/`, it searches map vacancies and opens the map-page result overlay.
- On `/catalog`, it filters the active catalog tab.
- Switching to Map or Catalog clears the previous query to avoid cross-page confusion.

## School and vacancy matching

`useSchoolData(vacancies)` loads all schools from `schools.json`, normalizes names, requires a city/district/locality match, then matches institution names using token overlap with a threshold of 0.55. Each returned school has `vacancies: Vacancy[]`.

Do not invent exact coordinates. Vacancy records do not reliably contain addresses or coordinates. Vacancies that cannot be matched to a coordinate-backed school are grouped by institution and shown as orange, dashed, approximate markers around the relevant city center from `cityCoordinates`. The deterministic offset prevents all approximate institutions from overlapping. Their popup explicitly states that the position is approximate.

`VacancyCard` sets `mapTargetInstitution`, resets filters, navigates to `/`, and `FlyToSchool` moves to either an exact school marker or an approximate institution marker.

## Map behavior

- No administrative polygon fill or clickable district layer remains.
- The map is constrained to Moldova with bounded panning and minimum zoom.
- Exact schools with vacancies are green.
- Exact schools without published vacancies are gray.
- Institutions without exact coordinates are orange and dashed.
- User location is blue.
- Default mode shows only institutions with vacancies.
- `Toate școlile` reveals schools without vacancies.
- The map fills all available layout space; avoid restoring bottom padding to the main map container.

## Left map toolbar

The left toolbar is a content-sized panel on desktop and a collapsible bottom panel on mobile. It has an internal scrollbar and must not exceed the available viewport/map height.

It contains:

- Toggle between institutions with vacancies and all schools.
- City/district selector. Selecting a city updates the map, flies to the city, and opens the right city panel. Selecting all Moldova closes it.
- Collapsible discipline tags.
- Multi-select institution types.
- Statistics.
- Map legend.
- User-location request and distance selector.
- Reset action.

Default institution types are:

- `lyceum`
- `gymnasium`
- `primary_school`

Optional types:

- `kindergarten`
- `other_school`

Institution-type classification for vacancy-only institutions is based on normalized `institution_type` text. Kindergarten detection includes `gradin`, `cresa`, `educatie timpurie`, and `prescolar`.

Toolbar statistics update with city, discipline, institution-type, and distance filters:

- Total schools.
- Total vacant positions.
- Schools with vacant positions.
- Positions with approximate location.

The approximate-location statistic is clickable and opens a responsive modal listing institution, specialty, city, and institution type. The modal closes by its close button, backdrop click, or Escape.

## Right panel

`selectedCity` opens the right panel. `selectedInstitution` optionally narrows it to one school. Clicking `Vezi locurile vacante` in a school popup sets both values so only vacancies belonging to that school appear.

On desktop the panel is floating, 360px wide, and capped at 540px for a selected school or 680px for city analytics. Do not restore the previous full-height 420px sidebar. Mobile remains a bottom sheet.

## Catalog

The catalog uses cards rather than a wide table because institution and specialty names are long and the product is mobile-first.

Tabs:

- `Locuri vacante`: vacancy cards.
- `Școli`: institution cards.

Filters include city, school type, and schools with vacancies. Results initially render 48 cards and load 48 more on demand.

## Interactive onboarding

The tour is implemented in `Layout.tsx` and stored under `edumap-tour-completed` in localStorage.

- It starts automatically only for a first-time user.
- It can be skipped and reopened through the `?` button.
- If reopened outside the map, the app navigates to `/` first.
- It is a real coach-mark flow: the rest of the UI is dimmed, a target is highlighted, clicks pass through to that target, and action steps advance only after the highlighted control is clicked.
- Tour selectors use `data-tour` attributes. Preserve these when moving controls.
- Mobile and desktop may target different visible elements through comma-separated selectors and visible-element detection.

## UX and copy conventions

- User-facing Romanian terminology is `Locuri vacante`, not `Vacanțe` or unaccented `vacante`.
- Keep the blue primary accent and existing light/dark theme tokens.
- Keep the map as the primary visual surface.
- Mobile controls must account for `env(safe-area-inset-bottom)`.
- Avoid permanent overlays that cover the map.
- Keep focus-visible states and keyboard closing for dialogs.
- Geolocation is requested only after an explicit user click.
- Exact and approximate positions must always be visually and textually distinguishable.

## Known limitations

- The school source is older than the vacancy source and does not include every kindergarten or non-school institution.
- Institution matching remains heuristic because names differ between datasets.
- Approximate markers indicate only a city/territory area, not a street address.
- Distance filtering cannot be exact for approximate markers.
- `schools.json` is large and contributes to a large production chunk warning.

## Safe future improvements

- Move `schools.json` into a lazily fetched public data artifact to reduce the initial bundle.
- Add a reviewed alias table for institutions that fail heuristic matching.
- Add exact coordinates only from an authoritative geocoding/address source and record provenance plus confidence.
- Add component tests for matching, map filters, contextual search, and tour target progression.
