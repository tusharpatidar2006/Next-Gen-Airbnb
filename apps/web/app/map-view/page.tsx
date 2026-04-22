import GeoapifyMap from '../../components/GeoapifyMap';
import Link from 'next/link';

const stats = [
  { label: 'Properties', value: '2,400+' },
  { label: 'Cities', value: '18' },
  { label: 'AI Agents', value: '340+' },
  { label: 'Avg Rating', value: '4.89 ★' },
];

export default function MapViewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      {/* Page card */}
      <div className="map-page rounded-[36px] p-8">
        <div className="space-y-8">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#8faec8' }}>
                Interactive Map
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight" style={{ color: '#1a2742' }}>
                Explore stays across India
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7" style={{ color: '#2c3e5e' }}>
                Every property now uses its own listing location. Add a{' '}
                <code className="rounded bg-[#d4e4f7] px-1.5 py-0.5 text-sm">NEXT_PUBLIC_GEOAPIFY_API_KEY</code>{' '}
                to geocode locations and render the Geoapify map.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/"
                className="btn-secondary rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95">
                ← Back home
              </Link>
              <Link href="/dashboard"
                className="btn-primary rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95">
                Open dashboard
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-[20px] px-5 py-4 text-center"
                style={{ background: 'rgba(212,228,247,0.55)', border: '1px solid rgba(143,174,200,0.22)' }}>
                <p className="text-2xl font-bold" style={{ color: '#1a2742' }}>{s.value}</p>
                <p className="mt-1 text-xs font-medium" style={{ color: '#8faec8' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-[28px]"
            style={{ border: '1px solid rgba(212,228,247,0.50)' }}>
            <GeoapifyMap />
          </div>

          {/* Info grid */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="map-card rounded-[26px] p-6">
              <h2 className="text-xl font-bold" style={{ color: '#1a2742' }}>Property mode</h2>
              <ul className="mt-4 space-y-2.5 text-sm" style={{ color: '#2c3e5e' }}>
                {[
                  'Each property is geocoded from its own location string',
                  'The selected property is centered on the map',
                  'Markers come from Geoapify static maps',
                  'The property list updates the map on click',
                ].map(t => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#8faec8]">✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="map-card rounded-[26px] p-6">
              <h2 className="text-xl font-bold" style={{ color: '#1a2742' }}>Live mode</h2>
              <ul className="mt-4 space-y-2.5 text-sm" style={{ color: '#2c3e5e' }}>
                {[
                  'Add NEXT_PUBLIC_GEOAPIFY_API_KEY to .env.local',
                  'Geoapify geocodes each listing location in India',
                  'Static map markers are rendered from those coordinates',
                  'Set NEXT_PUBLIC_API_BASE_URL for backend auth',
                ].map(t => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#8faec8]">→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
