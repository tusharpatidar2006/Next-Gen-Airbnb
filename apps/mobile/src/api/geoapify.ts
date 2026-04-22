import { GEOAPIFY_API_KEY } from './keys';

export type GeoapifyPoint = {
  lat: number;
  lon: number;
  formatted?: string;
};

export function hasGeoapifyApiKey() {
  return Boolean(GEOAPIFY_API_KEY && GEOAPIFY_API_KEY !== 'your_geoapify_api_key_here');
}

export async function geocodeLocation(searchText: string) {
  if (!hasGeoapifyApiKey() || !searchText.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    text: searchText,
    format: 'json',
    filter: 'countrycode:in',
    apiKey: GEOAPIFY_API_KEY,
  });

  const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Geoapify geocoding failed with status ${response.status}`);
  }

  const data = await response.json();
  const result = data?.results?.[0];

  if (!result || typeof result.lat !== 'number' || typeof result.lon !== 'number') {
    return null;
  }

  return {
    lat: result.lat,
    lon: result.lon,
    formatted: result.formatted,
  } satisfies GeoapifyPoint;
}

export function buildGeoapifyStaticMapUrl({
  center,
  width = 900,
  height = 520,
  zoom = 12,
}: {
  center: GeoapifyPoint;
  width?: number;
  height?: number;
  zoom?: number;
}) {
  if (!hasGeoapifyApiKey()) {
    return null;
  }

  const params = new URLSearchParams({
    style: 'osm-carto',
    width: String(width),
    height: String(height),
    center: `lonlat:${center.lon},${center.lat}`,
    zoom: String(zoom),
    marker: `lonlat:${center.lon},${center.lat};color:#ff385c;size:large`,
    apiKey: GEOAPIFY_API_KEY,
  });

  return `https://maps.geoapify.com/v1/staticmap?${params.toString()}`;
}
