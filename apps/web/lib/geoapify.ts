import { getGeoapifyApiKey } from './api';

export type GeoapifyPoint = {
  lat: number;
  lon: number;
  formatted?: string;
};

export type StaticMapMarker = GeoapifyPoint & {
  color?: string;
  size?: 'small' | 'medium' | 'large';
};

export async function geocodeLocation(searchText: string, apiKey = getGeoapifyApiKey()) {
  if (!apiKey || !searchText.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    text: searchText,
    format: 'json',
    filter: 'countrycode:in',
    apiKey,
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
  markers,
  width = 1200,
  height = 700,
  zoom = 11,
  apiKey = getGeoapifyApiKey(),
}: {
  center: GeoapifyPoint;
  markers?: StaticMapMarker[];
  width?: number;
  height?: number;
  zoom?: number;
  apiKey?: string;
}) {
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    style: 'osm-carto',
    width: String(width),
    height: String(height),
    center: `lonlat:${center.lon},${center.lat}`,
    zoom: String(zoom),
    apiKey,
  });

  (markers ?? []).forEach((marker) => {
    params.append(
      'marker',
      `lonlat:${marker.lon},${marker.lat};color:${marker.color ?? '#ff385c'};size:${marker.size ?? 'medium'}`
    );
  });

  return `https://maps.geoapify.com/v1/staticmap?${params.toString()}`;
}
