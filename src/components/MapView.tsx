import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import { useStore } from '../store/useStore';
import { cityCoordinates } from '../data/cityCoordinates';
import { useVacancyStats } from '../hooks/useVacancyStats';

// Maps GADM NAME_1 → our canonical city key in the vacancy data
const GADM_TO_CITY: Record<string, string> = {
  'AneniiNoi':   'Anenii Noi',
  'Basarabeasca':'Basarabeasca',
  'Briceni':     'Briceni',
  'Bălţi':       'Bălți',
  'Cahul':       'Cahul',
  'Calarasi':    'Călărași',
  'Cantemir':    'Cantemir',
  'Causeni':     'Căușeni',
  'Chişinău':    'Chișinău',
  'Cimişlia':    'Cimișlia',
  'Criuleni':    'Criuleni',
  'Donduseni':   'Dondușeni',
  'Drochia':     'Drochia',
  'Dubăsari':    'Dubăsari',
  'Edineţ':      'Edineț',
  'Floreşti':    'Florești',
  'Făleşti':     'Fălești',
  'Glodeni':     'Glodeni',
  'Hîncesti':    'Hîncești',
  'Ialoveni':    'Ialoveni',
  'Leova':       'Leova',
  'Nisporeni':   'Nisporeni',
  'Ocniţa':      'Ocnița',
  'Orhei':       'Orhei',
  'Rezina':      'Rezina',
  'Rîşcani':     'Rîșcani',
  'Soroca':      'Soroca',
  'Străşeni':    'Strășeni',
  'Sîngerei':    'Sîngerei',
  'Taraclia':    'Taraclia',
  'Teleneşti':   'Telenești',
  'Ungheni':     'Ungheni',
  'Şoldăneşti':  'Șoldănești',
  'ŞtefanVoda':  'Ștefan Vodă',
  // These won't match our data — shown as grey
  'Bender':       null as unknown as string,
  'Găgăuzia':     null as unknown as string,
  'Transnistria':  null as unknown as string,
};

function resolveName(feature: Feature): string | null {
  const name = (feature.properties?.NAME_1 ?? '') as string;
  const mapped = GADM_TO_CITY[name];
  return mapped ?? null;
}

function getDistrictColor(count: number, max: number, isSelected: boolean): string {
  if (isSelected) return '#1d4ed8';
  if (count === 0) return '#e8eaf0';
  const t = Math.min(count / max, 1);
  if (t < 0.15) return '#dbeafe';
  if (t < 0.35) return '#bfdbfe';
  if (t < 0.60) return '#93c5fd';
  if (t < 0.80) return '#60a5fa';
  return '#2563eb';
}

function createLabelIcon(city: string, count: number, isSelected: boolean) {
  const bg        = isSelected
    ? '#1d4ed8'
    : 'rgba(255,255,255,0.94)';
  const textColor = isSelected ? '#ffffff' : '#1e1b4b';
  const border    = isSelected ? 'transparent' : 'rgba(37,99,235,0.25)';
  const badgeBg   = isSelected ? 'rgba(255,255,255,0.25)' : '#2563eb';
  const badgeText = '#ffffff';
  const shadow    = isSelected
    ? '0 4px 18px rgba(37,99,235,0.45), 0 1px 4px rgba(0,0,0,0.15)'
    : '0 2px 10px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)';

  const short = city.length > 12 ? city.slice(0, 12) + '…' : city;

  const html = `<div style="
    display:inline-flex;align-items:center;gap:5px;
    background:${bg};border:1.5px solid ${border};border-radius:999px;
    padding:3px 6px 3px 9px;box-shadow:${shadow};cursor:pointer;
    white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;
    pointer-events:auto;backdrop-filter:blur(8px);
  ">
    <span style="font-size:11px;font-weight:${isSelected ? 700 : 600};color:${textColor};letter-spacing:-0.01em;line-height:1">${short}</span>
    <span style="display:inline-flex;align-items:center;justify-content:center;
      background:${badgeBg};color:${badgeText};border-radius:999px;
      font-size:10px;font-weight:700;min-width:19px;height:18px;padding:0 4px;line-height:1">
      ${count}
    </span>
  </div>`;

  return L.divIcon({ html, className: '', iconAnchor: [0, 0] });
}

function FlyToCity() {
  const { selectedCity, flyToCity, setFlyToCity } = useStore();
  const map = useMap();

  // Fly when a city is selected from the map
  useEffect(() => {
    if (selectedCity && cityCoordinates[selectedCity]) {
      map.flyTo(cityCoordinates[selectedCity], 11, { duration: 1.2 });
    }
  }, [selectedCity, map]);

  // Fly when triggered from a card button (sidebar already closed)
  useEffect(() => {
    if (flyToCity && cityCoordinates[flyToCity]) {
      map.flyTo(cityCoordinates[flyToCity], 11, { duration: 1.2 });
      setFlyToCity(null);
    }
  }, [flyToCity, map, setFlyToCity]);

  return null;
}

function DistrictLayer({
  geoData,
  cityCounts,
  selectedCity,
  maxCount,
  onDistrictClick,
}: {
  geoData: GeoJsonObject;
  cityCounts: Record<string, number>;
  selectedCity: string | null;
  maxCount: number;
  onDistrictClick: (city: string) => void;
}) {
  const styleFeature = useCallback(
    (feature?: Feature) => {
      if (!feature) return {};
      const city  = resolveName(feature);
      const count = city ? (cityCounts[city] ?? 0) : 0;
      const isSelected = city !== null && city === selectedCity;
      return {
        fillColor:   getDistrictColor(count, maxCount, isSelected),
        fillOpacity: isSelected ? 0.80 : count > 0 ? 0.55 : 0.25,
        color:       isSelected ? '#1d4ed8' : '#94a3b8',
        weight:      isSelected ? 2.5 : 1,
      };
    },
    [cityCounts, selectedCity, maxCount]
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const city  = resolveName(feature);
      const count = city ? (cityCounts[city] ?? 0) : 0;
      const path  = layer as L.Path;

      path.on('mouseover', () => {
        if (city !== selectedCity) path.setStyle({ fillOpacity: 0.75, weight: 2 });
      });
      path.on('mouseout', () => {
        if (city !== selectedCity) path.setStyle({ fillOpacity: count > 0 ? 0.55 : 0.25, weight: 1 });
      });
      path.on('click', () => {
        if (city) onDistrictClick(city);
      });

      if (city) {
        const label = count > 0
          ? `<strong>${city}</strong><br/>${count} vacanțe`
          : `<strong>${city}</strong><br/>Fără vacanțe`;
        path.bindTooltip(
          `<div style="font-family:-apple-system,sans-serif;font-size:12px;line-height:1.5">${label}</div>`,
          { sticky: true, opacity: 0.95 }
        );
      }
    },
    [cityCounts, selectedCity, onDistrictClick]
  );

  return (
    <GeoJSON
      key={selectedCity ?? '__none__'}
      data={geoData}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}

export function MapView() {
  const { setSelectedCity, selectedCity } = useStore();
  const { cityCounts } = useVacancyStats();
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  const maxCount = useMemo(
    () => Math.max(...Object.values(cityCounts), 1),
    [cityCounts]
  );

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/moldova-districts.json`)
      .then(r => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  const cityEntries = useMemo(
    () => Object.entries(cityCoordinates).filter(([c]) => (cityCounts[c] ?? 0) > 0),
    [cityCounts]
  );

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[47.1, 28.5]}
        zoom={8}
        className="w-full h-full bg-slate-50 dark:bg-slate-900"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        {geoData && (
          <DistrictLayer
            geoData={geoData}
            cityCounts={cityCounts}
            selectedCity={selectedCity}
            maxCount={maxCount}
            onDistrictClick={setSelectedCity}
          />
        )}

        {/* City name + vacancy count labels */}
        {cityEntries.map(([city, coords]) => {
          const count      = cityCounts[city] ?? 0;
          const isSelected = selectedCity === city;
          return (
            <Marker
              key={`${city}-${isSelected}`}
              position={coords}
              icon={createLabelIcon(city, count, isSelected)}
              eventHandlers={{ click: () => setSelectedCity(city) }}
            />
          );
        })}

        <FlyToCity />
      </MapContainer>

      {/* Legend — desktop only */}
      <div className="hidden md:block absolute bottom-5 left-3 z-[1000] glass rounded-2xl p-3.5 text-xs shadow-lg">
        <p className="font-bold text-foreground mb-2.5 text-[11px] uppercase tracking-widest">Vacanțe / raion</p>
        <div className="space-y-2">
          {[
            { color: '#e8eaf0', label: 'Fără vacanțe' },
            { color: '#dbeafe', label: 'Puține' },
            { color: '#93c5fd', label: 'Mediu' },
            { color: '#60a5fa', label: 'Ridicat' },
            { color: '#2563eb', label: 'Foarte ridicat' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-4 h-3 rounded-[4px] inline-block shrink-0" style={{ background: color }} />
              <span className="text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
