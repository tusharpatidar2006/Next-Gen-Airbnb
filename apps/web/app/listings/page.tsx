'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buildApiUrl } from '../../lib/api';

type Listing = {
  id: string;
  title: string;
  description?: string;
  photos: string[];
  price: number;
  location: string;
  size?: string;
  features: string[];
  services: string[];
  createdAt: string;
  host: { id: string; hostName: string };
};

const ALL_FEATURES = ['Pool', 'WiFi', 'Parking', 'AC', 'Kitchen', 'Gym', 'Garden', 'Balcony', 'Fireplace', 'Hot Tub'];

function ListingsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters — pre-fill from URL query
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');

  // Wishlist
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load initial locations
  useEffect(() => {
    fetch(buildApiUrl('/listings/locations'))
      .then(r => r.json())
      .then(d => setLocations(d.locations || []))
      .catch(console.error);
  }, []);

  // Load wishlist
  useEffect(() => {
    const token = localStorage.getItem('nwxt_token');
    if (token) {
      fetch(buildApiUrl('/wishlist'), { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.wishlist) setFavorites(new Set(d.wishlist)); })
        .catch(console.error);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedLocation) params.set('location', selectedLocation);
      if (selectedFeatures.length) params.set('features', selectedFeatures.join(','));
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await fetch(buildApiUrl(`/listings?${params.toString()}`));
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedLocation, selectedFeatures, minPrice, maxPrice]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function toggleFeature(f: string) {
    setSelectedFeatures(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  }

  async function toggleFav(id: string) {
    const token = localStorage.getItem('nwxt_token');
    setFavorites(cur => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (token) {
      await fetch(buildApiUrl('/wishlist/toggle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: id })
      }).catch(console.error);
    }
  }

  function clearFilters() {
    setSearch('');
    setSelectedLocation('');
    setSelectedFeatures([]);
    setMinPrice('');
    setMaxPrice('');
  }

  const hasFilters = search || selectedLocation || selectedFeatures.length || minPrice || maxPrice;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 50%, #f5f0ff 100%)' }}>
      {/* Page Header */}
      <div className="border-b border-white/60 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8faec8]">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, location, description..."
                className="w-full rounded-full border border-[#8faec8]/30 bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 shadow-sm"
              />
            </div>

            {/* Location filter */}
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="rounded-full border border-[#8faec8]/30 bg-white px-4 py-2.5 text-[14px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 shadow-sm min-w-[160px]"
            >
              <option value="">📍 All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            {/* Price range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="₹ Min"
                className="w-24 rounded-full border border-[#8faec8]/30 bg-white px-3 py-2.5 text-[13px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 shadow-sm"
              />
              <span className="text-[#8faec8] text-sm">–</span>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="₹ Max"
                className="w-24 rounded-full border border-[#8faec8]/30 bg-white px-3 py-2.5 text-[13px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 shadow-sm"
              />
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-500 font-semibold hover:bg-red-100 transition-colors whitespace-nowrap">
                Clear ✕
              </button>
            )}
          </div>

          {/* Feature pills */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {ALL_FEATURES.map(f => (
              <button key={f} onClick={() => toggleFeature(f)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium border transition-all ${selectedFeatures.includes(f) ? 'bg-[#1a2742] text-white border-[#1a2742]' : 'bg-white text-[#1a2742] border-[#8faec8]/30 hover:bg-[#f0f4ff]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a2742]">
              {selectedLocation ? `Properties in ${selectedLocation}` : 'All Listed Properties'}
            </h1>
            <p className="text-[13px] text-[#8faec8] mt-0.5">
              {loading ? 'Searching...' : `${total} propert${total !== 1 ? 'ies' : 'y'} found`}
              {selectedFeatures.length > 0 && ` · with ${selectedFeatures.join(', ')}`}
            </p>
          </div>
          <Link href="/host" className="rounded-full bg-[#1a2742] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f1a2e] transition-colors shadow-md">
            + List Your Property
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white overflow-hidden">
                <div className="aspect-[4/3] bg-[#e8f4fd]" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-[#e8f4fd] rounded w-3/4" />
                  <div className="h-3 bg-[#e8f4fd] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl bg-white py-24 text-center border border-dashed border-[#8faec8]/40 shadow-sm">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-bold text-[#1a2742] mb-2">No properties found</h3>
            <p className="text-[#8faec8] mb-6">
              {hasFilters ? 'Try adjusting your filters.' : 'No properties have been listed yet.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="rounded-full bg-[#1a2742] px-8 py-3 font-bold text-white hover:bg-black transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map(listing => (
              <div key={listing.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8f4fd]">
                  {listing.photos[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">🏠</div>
                  )}

                  {listing.photos.length > 1 && (
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                      📸 {listing.photos.length} photos
                    </div>
                  )}

                  {/* Heart */}
                  <button
                    onClick={() => toggleFav(listing.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow transition-all hover:scale-110"
                  >
                    <svg viewBox="0 0 32 32" className={`h-4 w-4 transition-colors ${favorites.has(listing.id) ? 'fill-[#FF385C] stroke-[#FF385C]' : 'fill-transparent stroke-[#1a2742]'} stroke-[2.5px]`}>
                      <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.67c-1.8 0-3.38.7-4.5 2.14a5.2 5.2 0 0 0-1.82 3.65h-1.36a5.2 5.2 0 0 0-1.82-3.65C12.38 5.03 10.8 4.33 9 4.33A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" />
                    </svg>
                  </button>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#1a2742] leading-tight line-clamp-2 flex-1">{listing.title}</h3>
                    <span className="shrink-0 font-bold text-[#1a2742] text-[15px]">
                      ₹{listing.price.toLocaleString()}
                      <span className="text-[11px] font-normal text-[#8faec8]">/n</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[13px] text-[#8faec8]">
                    <span>📍</span>
                    <span>{listing.location}</span>
                    {listing.size && <><span className="mx-1">·</span><span>📐 {listing.size}</span></>}
                  </div>

                  {listing.description && (
                    <p className="text-[13px] text-[#8faec8] line-clamp-2">{listing.description}</p>
                  )}

                  {/* Features */}
                  {listing.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {listing.features.slice(0, 3).map(f => (
                        <span key={f} className="rounded-full bg-[#e8f4fd] px-2.5 py-0.5 text-[11px] font-medium text-[#1a2742]">{f}</span>
                      ))}
                      {listing.features.length > 3 && (
                        <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[11px] text-[#8faec8]">+{listing.features.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Services */}
                  {listing.services.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[12px] text-[#00b5d8] pt-0.5">
                      <span>✔</span>
                      <span>{listing.services.slice(0, 2).join(' · ')}{listing.services.length > 2 ? ` +${listing.services.length - 2}` : ''}</span>
                    </div>
                  )}

                  {/* Host */}
                  <div className="mt-1 flex items-center gap-2 border-t border-[#8faec8]/10 pt-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a2742] text-[10px] font-bold text-white">
                      {listing.host.hostName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[12px] text-[#8faec8]">Hosted by <span className="font-semibold text-[#1a2742]">{listing.host.hostName}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading properties...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
