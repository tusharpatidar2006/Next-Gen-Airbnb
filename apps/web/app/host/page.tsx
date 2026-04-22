'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { buildApiUrl } from '../../lib/api';

type Property = {
  id: string;
  title: string;
  description?: string;
  photos: string; // JSON string
  price: number;
  location: string;
  size?: string;
  features?: string; // JSON string
  services?: string; // JSON string
  createdAt: string;
};

const FEATURES_OPTIONS = ['Pool', 'WiFi', 'Parking', 'AC', 'Kitchen', 'Gym', 'Garden', 'Balcony', 'Fireplace', 'Hot Tub'];
const SERVICES_OPTIONS = ['Daily Cleaning', 'Breakfast Included', 'Airport Pickup', 'Concierge', 'Laundry', 'Chef on Request'];

export default function HostDashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', size: '',
    features: [] as string[], services: [] as string[], photos: [] as string[]
  });

  useEffect(() => {
    const saved = localStorage.getItem('nwxt_user');
    if (saved) setUser(JSON.parse(saved));
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const token = localStorage.getItem('nwxt_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(buildApiUrl('/host/properties'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function toggleFeature(f: string) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
    }));
  }

  function toggleService(s: string) {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s]
    }));
  }

  function handlePhotoUrl(url: string) {
    if (url && !form.photos.includes(url)) {
      setForm(prev => ({ ...prev, photos: [...prev.photos, url] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.price || !form.location) {
      showToast('Please fill in title, price and location');
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem('nwxt_token');
    try {
      const res = await fetch(buildApiUrl('/host/properties'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          photos: form.photos,
          price: Number(form.price),
          location: form.location,
          size: form.size,
          features: form.features,
          services: form.services,
        })
      });
      if (!res.ok) throw new Error('Failed to create');
      showToast('✅ Property listed successfully!');
      setForm({ title: '', description: '', price: '', location: '', size: '', features: [], services: [], photos: [] });
      setShowForm(false);
      fetchProperties();
    } catch (err) {
      showToast('❌ Failed to create property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('nwxt_token');
    try {
      await fetch(buildApiUrl(`/host/properties/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      showToast('Property removed.');
    } catch (err) {
      showToast('Failed to delete property.');
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #d4e4f7 100%)' }}>
        <div className="text-center rounded-2xl bg-white p-12 shadow-xl">
          <div className="text-5xl mb-4">🏡</div>
          <h2 className="text-2xl font-bold text-[#1a2742] mb-2">Please login first</h2>
          <p className="text-[#8faec8] mb-6">You need to be logged in to access the host dashboard.</p>
          <Link href="/login" className="rounded-full bg-[#1a2742] px-8 py-3 font-bold text-white hover:bg-black transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%)' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-[#1a2742] px-6 py-3 text-white shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a2742] text-lg font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1a2742]">Host Dashboard</h1>
                <p className="text-[13px] text-[#8faec8]">Welcome back, {user.name} · Manage your listed properties</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-full border border-[#1a2742]/20 px-5 py-2.5 text-sm font-semibold text-[#1a2742] hover:bg-white transition-colors">
              ← Back to Explore
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-[#1a2742] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0f1a2e] transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              + List a Property
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Properties', value: properties.length, icon: '🏠' },
            { label: 'Avg. Price / Night', value: properties.length ? `₹${Math.round(properties.reduce((a, p) => a + p.price, 0) / properties.length).toLocaleString()}` : '—', icon: '💰' },
            { label: 'Locations', value: [...new Set(properties.map(p => p.location))].length, icon: '📍' },
            { label: 'Photos Uploaded', value: properties.reduce((a, p) => a + (JSON.parse(p.photos || '[]')).length, 0), icon: '📸' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm border border-white/50">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-extrabold text-[#1a2742]">{stat.value}</div>
              <div className="text-[13px] text-[#8faec8]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#8faec8]">Loading your properties...</div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-white py-20 text-center border border-dashed border-[#8faec8]/40">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-bold text-[#1a2742] mb-2">No properties listed yet</h3>
            <p className="text-[#8faec8] mb-6">Start hosting by listing your first property.</p>
            <button onClick={() => setShowForm(true)} className="rounded-full bg-[#1a2742] px-8 py-3 font-bold text-white hover:bg-black transition-colors">
              + List your first property
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map(property => {
              const photos = JSON.parse(property.photos || '[]') as string[];
              const features = property.features ? JSON.parse(property.features) as string[] : [];
              const services = property.services ? JSON.parse(property.services) as string[] : [];
              return (
                <div key={property.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8f4fd]">
                    {photos[0] ? (
                      <img src={photos[0]} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">🏠</div>
                    )}
                    {photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                        +{photos.length - 1} photos
                      </div>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(property.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 shadow-md z-20"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#1a2742] leading-tight line-clamp-2">{property.title}</h3>
                      <span className="shrink-0 text-base font-bold text-[#1a2742]">₹{property.price.toLocaleString()}<span className="text-[11px] font-normal text-[#8faec8]">/n</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#8faec8]">
                      <span>📍</span> {property.location}
                      {property.size && <><span className="mx-1">·</span><span>📐 {property.size}</span></>}
                    </div>
                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {features.slice(0, 4).map(f => (
                          <span key={f} className="rounded-full bg-[#e8f4fd] px-2.5 py-0.5 text-[11px] text-[#1a2742] font-medium">{f}</span>
                        ))}
                        {features.length > 4 && <span className="rounded-full bg-[#e8f4fd] px-2.5 py-0.5 text-[11px] text-[#8faec8]">+{features.length - 4}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-xl font-bold text-[#1a2742] mb-2">Remove this property?</h3>
            <p className="text-[#8faec8] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-full border border-[#1a2742]/20 px-4 py-2.5 font-semibold text-[#1a2742] hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 rounded-full bg-red-500 px-4 py-2.5 font-bold text-white hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Slide-Over Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 bg-white px-7 pt-6 pb-4 border-b border-gray-100 z-10 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#1a2742]">🏡 List a Property</h2>
              <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a2742] mb-1.5">Property Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Sea-view Villa in Goa"
                  className="w-full rounded-xl border border-[#8faec8]/30 px-4 py-3 text-[15px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 bg-[#f8fafc] placeholder-[#8faec8]"
                />
              </div>

              {/* Location + Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#1a2742] mb-1.5">Location *</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="Calangute, Goa"
                    className="w-full rounded-xl border border-[#8faec8]/30 px-4 py-3 text-[15px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 bg-[#f8fafc] placeholder-[#8faec8]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#1a2742] mb-1.5">Price / Night (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="8500"
                    className="w-full rounded-xl border border-[#8faec8]/30 px-4 py-3 text-[15px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 bg-[#f8fafc] placeholder-[#8faec8]"
                  />
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a2742] mb-1.5">Size</label>
                <input value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                  placeholder="e.g. 3 BHK · 2200 sq ft"
                  className="w-full rounded-xl border border-[#8faec8]/30 px-4 py-3 text-[15px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 bg-[#f8fafc] placeholder-[#8faec8]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a2742] mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Describe your property, ambiance, unique features..."
                  className="w-full rounded-xl border border-[#8faec8]/30 px-4 py-3 text-[15px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 bg-[#f8fafc] placeholder-[#8faec8] resize-none"
                />
              </div>

              {/* Photo URLs */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a2742] mb-1.5">Photos (paste URL and press Enter)</label>
                <div className="flex gap-2">
                  <input
                    id="photo-url-input"
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl border border-[#8faec8]/30 px-4 py-3 text-[14px] text-[#1a2742] outline-none focus:ring-2 focus:ring-[#1a2742]/20 bg-[#f8fafc] placeholder-[#8faec8]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        handlePhotoUrl(input.value.trim());
                        input.value = '';
                      }
                    }}
                  />
                  <button type="button" onClick={() => {
                    const input = document.getElementById('photo-url-input') as HTMLInputElement;
                    handlePhotoUrl(input.value.trim());
                    input.value = '';
                  }} className="rounded-xl bg-[#1a2742] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0f1a2e] transition-colors">
                    Add
                  </button>
                </div>
                {form.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {form.photos.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="h-16 w-24 rounded-lg object-cover border border-[#8faec8]/20" />
                        <button type="button" onClick={() => setForm(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }))}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a2742] mb-2">Features & Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {FEATURES_OPTIONS.map(f => (
                    <button key={f} type="button" onClick={() => toggleFeature(f)}
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-all ${form.features.includes(f) ? 'bg-[#1a2742] text-white border-[#1a2742]' : 'border-[#8faec8]/30 text-[#1a2742] hover:bg-[#f0f4ff]'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a2742] mb-2">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleService(s)}
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-all ${form.services.includes(s) ? 'bg-[#00b5d8] text-white border-[#00b5d8]' : 'border-[#8faec8]/30 text-[#1a2742] hover:bg-[#f0f4ff]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-[#1a2742]/20 py-3 font-semibold text-[#1a2742] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-[#1a2742] py-3 font-bold text-white hover:bg-[#0f1a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                  {submitting ? 'Listing...' : '🏡 List Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
