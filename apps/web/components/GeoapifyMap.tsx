'use client';

import { useEffect, useMemo, useState } from 'react';
import { listingsData } from '../data/listings';
import { buildApiUrl, getGeoapifyApiKey } from '../lib/api';
import { buildGeoapifyStaticMapUrl, geocodeLocation, type GeoapifyPoint } from '../lib/geoapify';

type MapListing = {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
};

function normalizePrice(value: unknown) {
  if (typeof value === 'number') {
    return `₹${value.toLocaleString()}`;
  }

  return String(value ?? '₹0');
}

export default function GeoapifyMap() {
  const apiKey = getGeoapifyApiKey();
  const [listings, setListings] = useState<MapListing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoPoints, setGeoPoints] = useState<Record<string, GeoapifyPoint>>({});
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    const fallbackListings = listingsData.map((item) => ({
      id: item.id,
      title: item.title,
      location: item.location,
      price: item.price,
      image: item.image,
    }));

    const loadListings = async () => {
      setLoading(true);
      try {
        const response = await fetch(buildApiUrl('/listings'));
        const data = await response.json();
        const apiListings = Array.isArray(data?.listings)
          ? data.listings.map((item: any) => ({
              id: item.id,
              title: item.title,
              location: item.location,
              price: normalizePrice(item.price),
              image:
                (Array.isArray(item.photos) && item.photos[0]) ||
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
            }))
          : [];

        const merged = [...apiListings, ...fallbackListings].filter(
          (item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index
        );

        setListings(merged);
        setSelectedId((current) => current ?? merged[0]?.id ?? null);
      } catch {
        setListings(fallbackListings);
        setSelectedId((current) => current ?? fallbackListings[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const uniqueLocations = useMemo(
    () => Array.from(new Map(listings.map((listing) => [listing.location, listing])).values()),
    [listings]
  );

  useEffect(() => {
    if (!apiKey || uniqueLocations.length === 0) {
      return;
    }

    let cancelled = false;

    const loadGeoPoints = async () => {
      setGeoLoading(true);

      try {
        const resolvedEntries = await Promise.all(
          uniqueLocations.map(async (listing) => {
            const point = await geocodeLocation(`${listing.location}, India`, apiKey);
            return point ? ([listing.location, point] as const) : null;
          })
        );

        if (!cancelled) {
          setGeoPoints(
            Object.fromEntries(
              resolvedEntries.filter(
                (entry): entry is readonly [string, GeoapifyPoint] => entry !== null
              )
            )
          );
        }
      } finally {
        if (!cancelled) {
          setGeoLoading(false);
        }
      }
    };

    loadGeoPoints();

    return () => {
      cancelled = true;
    };
  }, [apiKey, uniqueLocations]);

  const selectedListing = listings.find((listing) => listing.id === selectedId) ?? listings[0] ?? null;
  const selectedPoint = selectedListing ? geoPoints[selectedListing.location] : null;
  const markerPoints = uniqueLocations
    .map((listing) => geoPoints[listing.location])
    .filter((point): point is GeoapifyPoint => Boolean(point));

  const mapImageUrl =
    selectedPoint &&
    buildGeoapifyStaticMapUrl({
      center: selectedPoint,
      markers: markerPoints,
      width: 1280,
      height: 760,
      zoom,
      apiKey,
    });

  if (!apiKey) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#8faec8]/40 bg-white px-6 py-12 text-center">
        <h3 className="text-2xl font-bold text-[#1a2742]">Geoapify key required</h3>
        <p className="mt-3 text-sm text-[#2c3e5e]">
          Add <code>70e83ffaeb2349e8b2188bf8521b4c9f</code> to <code>apps/web/.env.local</code> to render
          property locations on the map.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="rounded-[28px] bg-white px-6 py-12 text-center text-[#2c3e5e]">Loading property map...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="relative overflow-hidden rounded-[28px] border border-[#d4e4f7] bg-[#f8fbff]">
        {mapImageUrl ? (
          <img
            src={mapImageUrl}
            alt={selectedListing ? `${selectedListing.location} map` : 'Property map'}
            className="h-[520px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[520px] items-center justify-center px-8 text-center text-[#2c3e5e]">
            {geoLoading ? 'Resolving property coordinates from Geoapify...' : 'No coordinates available yet.'}
          </div>
        )}

        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl bg-white/92 px-3 py-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(5, current - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4e4f7] text-xl font-bold text-[#1a2742] transition hover:bg-[#eef4fb] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Zoom out map"
            disabled={!mapImageUrl || zoom <= 5}
          >
            -
          </button>
          <div className="min-w-[74px] text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8faec8]">Zoom</p>
            <p className="text-sm font-bold text-[#1a2742]">{zoom}x</p>
          </div>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(18, current + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4e4f7] text-xl font-bold text-[#1a2742] transition hover:bg-[#eef4fb] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Zoom in map"
            disabled={!mapImageUrl || zoom >= 18}
          >
            +
          </button>
        </div>

        <div className="absolute bottom-4 left-4 rounded-2xl bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8faec8]">Selected property</p>
          <p className="mt-1 text-sm font-bold text-[#1a2742]">{selectedListing?.title ?? 'Choose a property'}</p>
          <p className="mt-1 text-xs text-[#2c3e5e]">{selectedListing?.location ?? 'India'}</p>
          <p className="mt-2 text-[11px] text-[#2c3e5e]">Use + / - to adjust map precision around the property.</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#d4e4f7] bg-white p-4">
        <h3 className="text-lg font-bold text-[#1a2742]">Property locations</h3>
        <p className="mt-1 text-sm text-[#2c3e5e]">Every property uses its own listing location with Geoapify geocoding.</p>

        <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {listings.map((listing) => {
            const isActive = listing.id === selectedListing?.id;
            return (
              <button
                key={listing.id}
                type="button"
                onClick={() => setSelectedId(listing.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  isActive
                    ? 'border-[#1a2742] bg-[#eef4fb]'
                    : 'border-[#d4e4f7] bg-white hover:bg-[#f8fbff]'
                }`}
              >
                <img src={listing.image} alt={listing.title} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1a2742]">{listing.title}</p>
                  <p className="mt-1 truncate text-xs text-[#2c3e5e]">{listing.location}</p>
                  <p className="mt-1 text-xs font-semibold text-[#1a2742]">{listing.price}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
