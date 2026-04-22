'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Umbrella, Building2, Home, TrainFront, ChevronLeft, ChevronRight, Plus, Minus, Search, X } from 'lucide-react';
import { buildApiUrl } from '../lib/api';

/* ─────────────────────────────────────────────
   Colour tokens (matches the pastel image)
   ─────────────────────────────────────────── */
// Lavender  : #d4e4f7
// Cream     : #faf5dc
// Sage      : #d8e9d4
// Steel blue: #8faec8
// Dark navy : #1a2742  (text / headers)
// Mid navy  : #2c3e5e  (subtext)

type CategoryId = 'homes' | 'experiences' | 'agents' | 'services';

type ListingItem = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  price: string;
  rating: string;
  badge: string;
  image: string;
  category: CategoryId;
};

type Section = { id: string; title: string; items: ListingItem[] };

/* ─────────── Categories ─────────── */
const categories: {
  id: CategoryId;
  icon: string;
  label: string;
  badge?: string;
  aiTag?: boolean;
}[] = [
  { id: 'homes', icon: '🏠', label: 'Homes' },
  { id: 'experiences', icon: '🧳', label: 'Experiences', badge: 'NEW' },
  { id: 'agents', icon: '🤖', label: 'AI Agents', badge: 'NEW' },
  { id: 'services', icon: '🛎️', label: 'Services', badge: 'NEW', aiTag: true },
];

/* ─────────── Home photo pool (Unsplash) ─────────── */
const homePhotos = [
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1390971284633-8a13fde9d3aa?auto=format&fit=crop&w=900&q=80',
];

/* ─────────── Data: big rows of photos ─────────── */
const sections: Section[] = [
  {
    id: 'pune',
    title: 'Popular homes in Pune',
    items: [
      { id: 'pn1', title: 'Modern Loft in Koregaon Park', subtitle: 'Designer duplex with terrace', location: 'Pune City', price: '₹8,200 / night', rating: '4.92', badge: 'Guest favourite', category: 'homes', image: homePhotos[0] },
      { id: 'pn2', title: 'Villa in Aundh', subtitle: 'Smart home with pool & garden', location: 'Aundh', price: '₹12,500 / night', rating: '4.87', badge: 'Superhost', category: 'homes', image: homePhotos[1] },
      { id: 'pn3', title: 'Bungalow in Baner', subtitle: 'Quiet neighbourhood, fiber WiFi', location: 'Baner', price: '₹6,900 / night', rating: '4.78', badge: 'Top rated', category: 'homes', image: homePhotos[2] },
      { id: 'pn4', title: 'Penthouse in Viman Nagar', subtitle: 'Sky view, rooftop terrace', location: 'Viman Nagar', price: '₹15,000 / night', rating: '4.96', badge: 'Luxury pick', category: 'homes', image: homePhotos[3] },
      { id: 'pn5', title: 'Apartment in Wakad', subtitle: 'Cosy 2BHK near tech hubs', location: 'Wakad', price: '₹5,400 / night', rating: '4.73', badge: 'Value stay', category: 'homes', image: homePhotos[4] },
      { id: 'pn6', title: 'Farmhouse in Lavasa', subtitle: 'Hill retreat, 40 min from Pune', location: 'Lavasa', price: '₹18,000 / night', rating: '4.95', badge: 'Rare find', category: 'homes', image: homePhotos[5] },
      { id: 'pn7', title: 'Studio in Hinjewadi', subtitle: 'Minutes from IT parks', location: 'Hinjewadi', price: '₹3,800 / night', rating: '4.60', badge: 'Quick access', category: 'homes', image: homePhotos[6] },
      { id: 'pn8', title: 'Heritage Villa in Deccan', subtitle: '100-year colonial bungalow', location: 'Deccan Gymkhana', price: '₹22,000 / night', rating: '4.98', badge: 'Heritage gem', category: 'homes', image: homePhotos[7] },
      { id: 'pn-exp', title: 'Prototype Weekend', subtitle: 'Live founder retreat', location: 'Pimpri-Chinchwad', price: '₹6,768 / session', rating: '4.98', badge: 'Creator pick', category: 'experiences', image: homePhotos[8] },
      { id: 'pn-agent', title: 'Prompt Pilot Agent', subtitle: 'Booking assistant for smart guest flows', location: 'Pune City', price: '₹8,559 setup', rating: '4.96', badge: 'Agent ready', category: 'agents', image: homePhotos[9] },
      { id: 'pn-svc', title: 'AI Concierge Setup', subtitle: 'Custom itinerary + check-in flow', location: 'Pune City', price: '₹20,083 package', rating: '4.86', badge: 'Hot right now', category: 'services', image: homePhotos[0] },
    ],
  },
  {
    id: 'goa',
    title: 'Available in North Goa this weekend',
    items: [
      { id: 'ga1', title: 'Beach House in Calangute', subtitle: 'Seconds from the shore', location: 'Calangute', price: '₹11,000 / night', rating: '4.93', badge: 'Beachfront', category: 'homes', image: homePhotos[1] },
      { id: 'ga2', title: 'Villa in Siolim', subtitle: 'Infinity pool + sunset views', location: 'Siolim', price: '₹24,000 / night', rating: '4.97', badge: 'Guest favourite', category: 'homes', image: homePhotos[2] },
      { id: 'ga3', title: 'Apartment in Candolim', subtitle: 'Modern 2BR, walk to beach', location: 'Candolim', price: '₹7,800 / night', rating: '4.81', badge: 'Sea breeze', category: 'homes', image: homePhotos[3] },
      { id: 'ga4', title: 'Cottage in Anjuna', subtitle: 'Bohemian vibes, lush garden', location: 'Anjuna', price: '₹5,500 / night', rating: '4.76', badge: 'Chill zone', category: 'homes', image: homePhotos[4] },
      { id: 'ga5', title: 'Treehouse in Assagao', subtitle: 'Canopy living, hammock porch', location: 'Assagao', price: '₹9,200 / night', rating: '4.88', badge: 'Unique stay', category: 'homes', image: homePhotos[5] },
      { id: 'ga6', title: 'Mansion in Porvorim', subtitle: 'Colonial estate, 8 rooms', location: 'Porvorim', price: '₹38,000 / night', rating: '4.99', badge: 'Grand estate', category: 'homes', image: homePhotos[6] },
      { id: 'ga7', title: 'Studio in Panaji', subtitle: 'City-centre, heritage quarter', location: 'Panaji', price: '₹4,100 / night', rating: '4.66', badge: 'City break', category: 'homes', image: homePhotos[7] },
      { id: 'ga8', title: 'Shack Villa in Morjim', subtitle: 'Turtle beach front', location: 'Morjim', price: '₹14,300 / night', rating: '4.90', badge: 'Eco stay', category: 'homes', image: homePhotos[8] },
      { id: 'ga-exp', title: 'Goa Build Retreat', subtitle: 'Open lounge for team sessions', location: 'Goa', price: '₹10,728 / retreat', rating: '4.98', badge: 'Team ready', category: 'experiences', image: homePhotos[9] },
      { id: 'ga-agent', title: 'Host Brain Agent', subtitle: 'Automated guest responses', location: 'Candolim', price: '₹11,712 bundle', rating: '4.91', badge: 'Best seller', category: 'agents', image: homePhotos[0] },
      { id: 'ga-svc', title: 'Host Automation Service', subtitle: 'Sprint planning + automations', location: 'Candolim', price: '₹12,437 bundle', rating: '4.84', badge: 'Top host', category: 'services', image: homePhotos[1] },
    ],
  },
  {
    id: 'mumbai',
    title: 'Weekend escapes near Mumbai',
    items: [
      { id: 'mb1', title: 'Sea-view Flat in Bandra', subtitle: 'Steps from Bandstand promenade', location: 'Bandra West', price: '₹13,500 / night', rating: '4.89', badge: 'Sea view', category: 'homes', image: homePhotos[2] },
      { id: 'mb2', title: 'Penthouse in Juhu', subtitle: 'Beach & Bollywood vibes', location: 'Juhu', price: '₹28,000 / night', rating: '4.96', badge: 'VIP pick', category: 'homes', image: homePhotos[3] },
      { id: 'mb3', title: 'Cottage in Alibaug', subtitle: 'Island escape, ferry ride from Gateway', location: 'Alibaug', price: '₹9,800 / night', rating: '4.82', badge: 'Island life', category: 'homes', image: homePhotos[4] },
      { id: 'mb4', title: 'Villa in Lonavala', subtitle: 'Misty hills, fireplace nights', location: 'Lonavala', price: '₹16,000 / night', rating: '4.91', badge: 'Hill retreat', category: 'homes', image: homePhotos[5] },
      { id: 'mb5', title: 'Farmhouse in Karjat', subtitle: 'River-side with rope bridge', location: 'Karjat', price: '₹21,000 / night', rating: '4.94', badge: 'Nature stay', category: 'homes', image: homePhotos[6] },
      { id: 'mb6', title: 'Studio in Powai', subtitle: 'Lakeside, tech-park adjacent', location: 'Powai', price: '₹4,600 / night', rating: '4.68', badge: 'Smart deal', category: 'homes', image: homePhotos[7] },
      { id: 'mb7', title: 'Apartment in Worli', subtitle: 'Skyline views, sea link close', location: 'Worli', price: '₹19,000 / night', rating: '4.93', badge: 'Skyline gem', category: 'homes', image: homePhotos[8] },
      { id: 'mb8', title: 'Bungalow in Mahabaleshwar', subtitle: 'Strawberry valley panorama', location: 'Mahabaleshwar', price: '₹11,500 / night', rating: '4.85', badge: 'Scenic beauty', category: 'homes', image: homePhotos[9] },
      { id: 'mb-exp', title: 'Mumbai Street Food Tour', subtitle: 'AI-curated local food trail', location: 'South Mumbai', price: '₹2,499 / person', rating: '4.97', badge: 'Foodie pick', category: 'experiences', image: homePhotos[0] },
      { id: 'mb-agent', title: 'City Navigator Agent', subtitle: 'Real-time local recommendations', location: 'Mumbai', price: '₹6,200 setup', rating: '4.88', badge: 'City guide', category: 'agents', image: homePhotos[1] },
      { id: 'mb-svc', title: 'Smart Butler Service', subtitle: 'Transfers, dining, experiences booked', location: 'Mumbai', price: '₹15,000 bundle', rating: '4.92', badge: 'Full service', category: 'services', image: homePhotos[2] },
    ],
  },
  {
    id: 'bangalore',
    title: 'Tech-friendly stays in Bangalore',
    items: [
      { id: 'bl1', title: 'Loft in Indiranagar', subtitle: 'Indie cafes at your doorstep', location: 'Indiranagar', price: '₹7,200 / night', rating: '4.88', badge: 'Creator fav', category: 'homes', image: homePhotos[3] },
      { id: 'bl2', title: 'Villa in Whitefield', subtitle: 'Gated community, 4BHK pool home', location: 'Whitefield', price: '₹18,500 / night', rating: '4.93', badge: 'Tech enclave', category: 'homes', image: homePhotos[4] },
      { id: 'bl3', title: 'Apartment in Koramangala', subtitle: 'Startup hub, coworking nearby', location: 'Koramangala', price: '₹5,900 / night', rating: '4.75', badge: 'Work-friendly', category: 'homes', image: homePhotos[5] },
      { id: 'bl4', title: 'Estate in Nandi Hills', subtitle: 'Weekend mountain escape', location: 'Nandi Hills', price: '₹12,000 / night', rating: '4.91', badge: 'Hill station', category: 'homes', image: homePhotos[6] },
      { id: 'bl5', title: 'Studio in HSR Layout', subtitle: 'Minimalist, fibre 1Gbps', location: 'HSR Layout', price: '₹3,200 / night', rating: '4.63', badge: 'Budget pick', category: 'homes', image: homePhotos[7] },
      { id: 'bl6', title: 'Bungalow in Sarjapur', subtitle: 'Spacious with private garden', location: 'Sarjapur', price: '₹8,700 / night', rating: '4.80', badge: 'Family stay', category: 'homes', image: homePhotos[8] },
      { id: 'bl7', title: 'Penthouse in UB City', subtitle: 'Luxury high-rise, concierge', location: 'UB City', price: '₹32,000 / night', rating: '4.99', badge: 'Ultra luxury', category: 'homes', image: homePhotos[9] },
      { id: 'bl8', title: 'Farmstay in Chikmagalur', subtitle: 'Coffee estate bungalow', location: 'Chikmagalur', price: '₹14,000 / night', rating: '4.94', badge: 'Brew retreat', category: 'homes', image: homePhotos[0] },
      { id: 'bl-exp', title: 'Bangalore Brew Trail', subtitle: 'Craft beer + local eats tour', location: 'CBR Road', price: '₹3,200 / person', rating: '4.89', badge: 'Social fix', category: 'experiences', image: homePhotos[1] },
      { id: 'bl-agent', title: 'Startup Scout Agent', subtitle: 'Co-working space finder', location: 'Bangalore', price: '₹9,500 setup', rating: '4.93', badge: 'Builder pick', category: 'agents', image: homePhotos[2] },
      { id: 'bl-svc', title: 'Tech Nomad Bundle', subtitle: 'Desk, stays & networking curated', location: 'Bangalore', price: '₹25,000 bundle', rating: '4.90', badge: 'All-in-one', category: 'services', image: homePhotos[3] },
    ],
  },
];

/* ════════════════════════════════════════════
   SearchBar
═══════════════════════════════════════════ */
function SearchBar({
  searchWhere, setSearchWhere,
  searchWhen,  setSearchWhen,
  searchWho,   setSearchWho,
  onSearch,
}: {
  searchWhere: string; setSearchWhere: (v: string) => void;
  searchWhen: string;  setSearchWhen: (v: string) => void;
  searchWho: string;   setSearchWho: (v: string) => void;
  onSearch: () => void;
}) {
  const [activePopover, setActivePopover] = useState<'where' | 'when' | 'who' | null>(null);

  // Close popover when clicking outside
  const searchBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allLocs = useMemo(() => {
    const map = new Map<string, { label: string; subtitle: string; type: string }>();
    sections.forEach(s => s.items.forEach(it => {
      if (!map.has(it.location)) {
        let type = 'location';
        if (it.badge.toLowerCase().includes('beach') || it.subtitle.toLowerCase().includes('beach')) type = 'beach';
        else if (it.location.toLowerCase().includes('city') || it.subtitle.toLowerCase().includes('city')) type = 'city';
        else if (it.title.toLowerCase().includes('apartment') || it.title.toLowerCase().includes('studio')) type = 'location';
        else if (it.category === 'homes') type = 'neighbourhood';
        
        map.set(it.location, { label: it.location, subtitle: s.title, type });
      }
    }));
    return Array.from(map.values());
  }, []);

  const locationSuggestions = useMemo(() => {
    if (!searchWhere) return allLocs.slice(0, 5);
    const lower = searchWhere.toLowerCase();
    return allLocs.filter(l => l.label.toLowerCase().includes(lower) || l.subtitle.toLowerCase().includes(lower)).slice(0, 6);
  }, [searchWhere, allLocs]);

  const [dateTab, setDateTab] = useState<'dates'|'flexible'>('dates');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  function handleSelectDate(dateStr: string) {
    setSelectedDateStr(dateStr);
    setSearchWhen(dateStr);
    // Removed setActivePopover(null) so the user can see their selection
  }

  function renderMonth(monthName: string, days: number, emptyStart: number) {
    const cells = [];
    const totalCells = Math.ceil((days + emptyStart) / 7) * 7;
    for (let i = 0; i < totalCells; i++) {
      if (i < emptyStart || i >= emptyStart + days) {
        cells.push(<span key={i} />);
      } else {
        const dayStr = i - emptyStart + 1;
        const dateStr = `${monthName} ${dayStr}`;
        const isPast = monthName === 'April' && dayStr < 17;
        if (isPast) {
           cells.push(<span key={i} className="py-2.5 text-[#8faec8]/30">{dayStr}</span>);
        } else {
           const isSelected = selectedDateStr === dateStr;
           cells.push(
             <button key={i} type="button" onClick={(e) => { e.stopPropagation(); handleSelectDate(dateStr); }} 
                className={`py-2.5 rounded-full ring-1 ring-inset transition-colors ${isSelected ? 'bg-[#1a2742] text-white ring-transparent' : 'ring-transparent hover:bg-[#f2f4f8]'}`}>
               {dayStr}
             </button>
           );
        }
      }
    }
    return cells;
  }
  
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });

  function adjustGuest(type: keyof typeof guests, delta: number) {
    setGuests(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  }

  // Effect to sync Who input with guests logic
  useEffect(() => {
    const totalGuests = guests.adults + guests.children;
    let str = '';
    if (totalGuests > 0) str += `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
    if (guests.infants > 0) str += `${str ? ', ' : ''}${guests.infants} infant${guests.infants > 1 ? 's' : ''}`;
    if (guests.pets > 0) str += `${str ? ', ' : ''}${guests.pets} pet${guests.pets > 1 ? 's' : ''}`;
    setSearchWho(str);
  }, [guests, setSearchWho]);

  return (
    <div ref={searchBarRef} className={`search-bar mx-auto mt-8 relative flex w-full max-w-[850px] flex-col rounded-full shadow-[0_20px_60px_rgba(26,39,66,0.18)] transition-all duration-300 md:flex-row ${activePopover ? 'bg-[#ebebeb] border-transparent' : 'bg-white'}`}>
      
      {/* Where Input */}
      <div 
        onClick={() => setActivePopover('where')}
        className={`flex flex-1 flex-col justify-center px-8 py-3.5 cursor-pointer rounded-full transition-all hover:bg-black/5 ${activePopover === 'where' ? 'bg-white shadow-lg pointer-events-none' : ''}`}
      >
        <span className="text-[12px] font-bold tracking-[0.05em] text-[#1a2742]">Where</span>
        {activePopover === 'where' ? (
          <form className="flex items-center gap-2 mt-0.5" onSubmit={e => { e.preventDefault(); onSearch(); setActivePopover(null); }}>
            <input 
              autoFocus
              value={searchWhere} 
              onChange={e => setSearchWhere(e.target.value)}
              placeholder="Search destinations"
              className="w-full bg-transparent text-[15px] font-medium text-[#1a2742] outline-none placeholder:text-[#8faec8] pointer-events-auto" 
            />
            {searchWhere && (
              <button type="button" onClick={(e) => { e.stopPropagation(); setSearchWhere(''); }} className="pointer-events-auto text-[#8faec8] hover:text-[#1a2742]">
                <X size={16} />
              </button>
            )}
          </form>
        ) : (
          <div className="mt-0.5 text-[15px] font-medium text-[#1a2742] truncate">
            {searchWhere || <span className="text-[#8faec8]">Search destinations</span>}
          </div>
        )}
      </div>

      <div className="hidden md:block w-[1px] bg-[#8faec8]/25 my-4" />

      {/* When Input */}
      <div 
        onClick={() => setActivePopover('when')}
        className={`flex flex-1 flex-col justify-center px-8 py-3.5 cursor-pointer rounded-full transition-all hover:bg-black/5 ${activePopover === 'when' ? 'bg-white shadow-lg pointer-events-none' : ''}`}
      >
        <span className="text-[12px] font-bold tracking-[0.05em] text-[#1a2742]">When</span>
        <div className="mt-0.5 text-[15px] font-medium text-[#1a2742] truncate pointer-events-auto">
          {searchWhen || <span className="text-[#8faec8]">Add dates</span>}
        </div>
      </div>

      <div className="hidden md:block w-[1px] bg-[#8faec8]/25 my-4" />

      {/* Who Input */}
      <div 
        onClick={() => setActivePopover('who')}
        className={`flex flex-1 items-center justify-between pl-8 pr-2 py-2 cursor-pointer rounded-full transition-all hover:bg-black/5 ${activePopover === 'who' ? 'bg-white shadow-lg pointer-events-none' : ''}`}
      >
        <div className="flex flex-col justify-center pointer-events-auto min-w-0 pr-2">
          <span className="text-[12px] font-bold tracking-[0.05em] text-[#1a2742]">Who</span>
          <div className="mt-0.5 text-[15px] font-medium text-[#1a2742] truncate pointer-events-auto">
            {searchWho || <span className="text-[#8faec8]">Add guests</span>}
          </div>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); setActivePopover(null); onSearch(); }} aria-label="Search"
          className="flex h-12 min-w-[100px] flex-none items-center justify-center gap-2 rounded-full text-[16px] font-bold shadow-[0_8px_24px_rgba(26,39,66,0.30)] pointer-events-auto bg-[#1a2742] hover:bg-[#2c3e5e] text-white transition-colors">
          <Search size={18} strokeWidth={3} />
          <span className="hidden lg:inline mr-2">Search</span>
        </button>
      </div>

      {/* ── Popovers ── */}
      {activePopover === 'where' && (
        <div className="absolute top-[calc(100%+16px)] left-0 w-full md:w-[420px] bg-white rounded-[32px] p-6 shadow-[0_30px_90px_rgba(26,39,66,0.18)] z-50 animate-rise-in border border-[#8faec8]/10 cursor-default">
          <div className="flex flex-col">
            {locationSuggestions.map((item, idx) => (
              <button key={idx} type="button" onClick={(e) => { e.stopPropagation(); setSearchWhere(item.label); setActivePopover(null); }} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#f2f4f8] transition-colors text-left group">
                <div className="w-12 h-12 rounded-xl bg-[#f2f4f8] group-hover:bg-white flex items-center justify-center flex-none border border-[#8faec8]/15 text-[#1a2742]">
                  {item.type === 'location' && <MapPin size={22} />}
                  {item.type === 'beach' && <Umbrella size={22} />}
                  {item.type === 'city' && <Building2 size={22} />}
                  {item.type === 'neighbourhood' && <Home size={22} />}
                  {item.type === 'train' && <TrainFront size={22} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-[#1a2742]">{item.label}</span>
                  {item.subtitle && <span className="text-[13px] text-[#8faec8] mt-0.5">{item.subtitle}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activePopover === 'when' && (
        <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[850px] bg-white rounded-[32px] p-8 pb-6 shadow-[0_30px_90px_rgba(26,39,66,0.18)] z-50 animate-rise-in border border-[#8faec8]/10 cursor-default">
          <div className="flex justify-center mb-8">
            <div className="flex bg-[#ebebeb] rounded-full p-1 w-[300px]">
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setDateTab('dates'); }} 
                className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${dateTab === 'dates' ? 'bg-white shadow text-[#1a2742]' : 'text-[#1a2742]/60 hover:text-[#1a2742]'}`}
              >
                Dates
              </button>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setDateTab('flexible'); }}
                className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${dateTab === 'flexible' ? 'bg-white shadow text-[#1a2742]' : 'text-[#1a2742]/60 hover:text-[#1a2742]'}`}
              >
                Flexible
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-4 mb-6">
            <button type="button" className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] transition-colors"><ChevronLeft size={18} /></button>
            <div className="flex-1 flex justify-center gap-32 pointer-events-none">
              <span className="text-[16px] font-bold ml-12">April 2026</span>
              <span className="text-[16px] font-bold mr-12">May 2026</span>
            </div>
            <button type="button" className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] transition-colors"><ChevronRight size={18} /></button>
          </div>

          <div className="flex gap-12 px-6">
            {/* April Calendar Mock */}
            <div className="flex-1">
              <div className="grid grid-cols-7 mb-4 text-center text-[12px] font-medium text-[#8faec8]">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-y-2 text-center text-[14px] font-medium text-[#1a2742]">
                {renderMonth('April', 30, 3)}
              </div>
            </div>

            {/* May Calendar Mock */}
            <div className="flex-1">
              <div className="grid grid-cols-7 mb-4 text-center text-[12px] font-medium text-[#8faec8]">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-y-2 text-center text-[14px] font-medium text-[#1a2742]">
                {renderMonth('May', 31, 5)}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 text-[14px]">
            <button type="button" className="px-5 py-2.5 rounded-full border border-black/80 font-medium hover:bg-black/5 transition-colors">Exact dates</button>
            <button type="button" className="px-5 py-2.5 rounded-full border border-[#8faec8]/30 font-medium hover:border-black/80 transition-colors">± 1 day</button>
            <button type="button" className="px-5 py-2.5 rounded-full border border-[#8faec8]/30 font-medium hover:border-black/80 transition-colors">± 2 days</button>
            <button type="button" className="px-5 py-2.5 rounded-full border border-[#8faec8]/30 font-medium hover:border-black/80 transition-colors">± 3 days</button>
            <button type="button" className="px-5 py-2.5 rounded-full border border-[#8faec8]/30 font-medium hover:border-black/80 transition-colors">± 7 days</button>
            <button type="button" className="px-5 py-2.5 rounded-full border border-[#8faec8]/30 font-medium hover:border-black/80 transition-colors">± 14 days</button>
          </div>
        </div>
      )}

      {activePopover === 'who' && (
        <div className="absolute top-[calc(100%+16px)] right-0 w-[420px] bg-white rounded-[32px] p-8 shadow-[0_30px_90px_rgba(26,39,66,0.18)] z-50 animate-rise-in border border-[#8faec8]/10 cursor-default">
          <div className="flex flex-col gap-6">
            
            {/* Adults */}
            <div className="flex items-center justify-between pb-6 border-b border-[#8faec8]/15">
              <div>
                <div className="text-[16px] font-semibold text-[#1a2742]">Adults</div>
                <div className="text-[14px] text-[#8faec8] mt-1">Ages 13 or above</div>
              </div>
              <div className="flex items-center gap-4">
                <button aria-label="Decrease Adults" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('adults', -1); }} disabled={guests.adults === 0} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] disabled:opacity-30 disabled:hover:border-[#8faec8]/30 disabled:hover:text-[#8faec8] transition-colors"><Minus size={16} /></button>
                <span className="w-4 text-center text-[16px] text-[#1a2742]">{guests.adults}</span>
                <button aria-label="Increase Adults" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('adults', 1); }} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] transition-colors"><Plus size={16} /></button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between pb-6 border-b border-[#8faec8]/15">
              <div>
                <div className="text-[16px] font-semibold text-[#1a2742]">Children</div>
                <div className="text-[14px] text-[#8faec8] mt-1">Ages 2–12</div>
              </div>
              <div className="flex items-center gap-4">
                <button aria-label="Decrease Children" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('children', -1); }} disabled={guests.children === 0} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] disabled:opacity-30 disabled:hover:border-[#8faec8]/30 disabled:hover:text-[#8faec8] transition-colors"><Minus size={16} /></button>
                <span className="w-4 text-center text-[16px] text-[#1a2742]">{guests.children}</span>
                <button aria-label="Increase Children" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('children', 1); }} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] transition-colors"><Plus size={16} /></button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between pb-6 border-b border-[#8faec8]/15">
              <div>
                <div className="text-[16px] font-semibold text-[#1a2742]">Infants</div>
                <div className="text-[14px] text-[#8faec8] mt-1">Under 2</div>
              </div>
              <div className="flex items-center gap-4">
                <button aria-label="Decrease Infants" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('infants', -1); }} disabled={guests.infants === 0} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] disabled:opacity-30 disabled:hover:border-[#8faec8]/30 disabled:hover:text-[#8faec8] transition-colors"><Minus size={16} /></button>
                <span className="w-4 text-center text-[16px] text-[#1a2742]">{guests.infants}</span>
                <button aria-label="Increase Infants" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('infants', 1); }} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] transition-colors"><Plus size={16} /></button>
              </div>
            </div>

            {/* Pets */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[16px] font-semibold text-[#1a2742]">Pets</div>
                <a href="#" className="text-[14px] font-medium text-[#8faec8] mt-1 underline hover:text-[#1a2742] transition-colors block">Bringing a service animal?</a>
              </div>
              <div className="flex items-center gap-4">
                <button aria-label="Decrease Pets" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('pets', -1); }} disabled={guests.pets === 0} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] disabled:opacity-30 disabled:hover:border-[#8faec8]/30 disabled:hover:text-[#8faec8] transition-colors"><Minus size={16} /></button>
                <span className="w-4 text-center text-[16px] text-[#1a2742]">{guests.pets}</span>
                <button aria-label="Increase Pets" type="button" onClick={(e) => { e.stopPropagation(); adjustGuest('pets', 1); }} className="w-8 h-8 rounded-full border border-[#8faec8]/30 flex items-center justify-center text-[#8faec8] hover:border-[#1a2742] hover:text-[#1a2742] transition-colors"><Plus size={16} /></button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Feature Strip
═══════════════════════════════════════════ */
function FeatureStrip() {
  return (
    <div className="feature-strip mt-10 grid gap-4 rounded-[32px] p-5 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { icon: '🧠', label: 'AI stay assistant' },
        { icon: '✨', label: 'Smart recommendations' },
        { icon: '⚡', label: 'Instant trip summaries' },
        { icon: '🎙️', label: 'Voice-based search' },
      ].map(f => (
        <div key={f.label} className="feature-chip flex items-center gap-3 rounded-[22px] px-5 py-4 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-xl">{f.icon}</span>
          {f.label}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   Listing Card
═══════════════════════════════════════════ */
function ListingCard({ item, isFav, onFav, onCardClick }: {
  item: ListingItem; isFav: boolean;
  onFav: (id: string) => void;
  onCardClick: (loc: string) => void;
}) {
  return (
    <Link href={`/listings/${item.id}`} className="card min-w-[270px] max-w-[270px] flex-none rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(26,39,66,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_42px_rgba(26,39,66,0.20)] block">
      {/* Image */}
      <div className="group relative overflow-hidden">
        <div className="block w-full focus-visible:outline-2">
          <img alt={item.title} src={item.image} loading="lazy"
            className="h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-108" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Badge */}
        <span className="absolute left-3 top-3 badge rounded-full px-3 py-1 text-[11px] font-bold">
          {item.badge}
        </span>
        {/* Favourite */}
        <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); onFav(item.id); }}
          aria-label={isFav ? 'Remove favourite' : 'Add favourite'}
          className={`fav-btn absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all duration-200 hover:scale-115 active:scale-90 ${isFav ? 'fav-active' : 'fav-idle'}`}>
          {isFav ? '♥' : '♡'}
        </button>
      </div>
      {/* Info */}
      <div className="card-body px-4 py-4">
        <h3 className="card-title truncate text-[15px] font-semibold leading-5">{item.title}</h3>
        <p className="card-sub mt-1 truncate text-[13px]">{item.subtitle}</p>
        <p className="card-loc mt-0.5 text-xs">{item.location}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="card-price text-[13px] font-semibold">{item.price}</span>
          <span className="card-rating flex items-center gap-1 text-[12px]">★ {item.rating}</span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════
   Section row
═══════════════════════════════════════════ */
function SectionRow({ section, favorites, onFav, onCardClick, onScroll, registerScroller }: {
  section: Section; favorites: Set<string>;
  onFav: (id: string) => void; onCardClick: (loc: string) => void;
  onScroll: (id: string, dir: 'left' | 'right') => void;
  registerScroller: (id: string, el: HTMLDivElement | null) => void;
}) {
  return (
    <section className="space-y-5 animate-rise-in">
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-title text-xl font-semibold tracking-tight sm:text-2xl">{section.title}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => onScroll(section.id, 'left')} aria-label="Scroll left"
            className="scroll-btn flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90">←</button>
          <button type="button" onClick={() => onScroll(section.id, 'right')} aria-label="Scroll right"
            className="scroll-btn flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90">→</button>
        </div>
      </div>
      <div ref={el => registerScroller(section.id, el)}
        className="scrollbar-hide flex gap-5 overflow-x-auto pb-3"
        style={{ scrollSnapType: 'x mandatory' }}>
        {section.items.map(item => (
          <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
            <ListingCard item={item} isFav={favorites.has(item.id)} onFav={onFav} onCardClick={onCardClick} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   Toast
═══════════════════════════════════════════ */
function Toast({ msg }: { msg: string }) {
  return (
    <div role="status" aria-live="polite"
      className="toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-[0_12px_36px_rgba(26,39,66,0.22)] animate-toast">
      {msg}
    </div>
  );
}

/* ════════════════════════════════════════════
   HomePage
═══════════════════════════════════════════ */
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('homes');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhen, setSearchWhen]  = useState('');
  const [searchWho, setSearchWho]   = useState('');
  const [toast, setToast] = useState('');
  const [toastKey, setToastKey] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg); setToastKey(k => k + 1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(''), 2800);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const filteredSections = useMemo(() => {
    const w = searchWhere.trim().toLowerCase();
    const d = searchWhen.trim().toLowerCase();
    const g = searchWho.trim().toLowerCase();
    return sections.map(s => ({
      ...s,
      items: s.items.filter(item => {
        const catOk   = item.category === activeCategory;
        const whereOk = !w || item.title.toLowerCase().includes(w) || item.subtitle.toLowerCase().includes(w) || item.location.toLowerCase().includes(w);
        const whenOk  = true; // Mock: properties don't have explicit dates, so skip filtering so they still show up
        const whoOk   = true; // Mock: properties don't describe max guests, skip filtering
        return catOk && whereOk && whenOk && whoOk;
      }),
    })).filter(s => s.items.length > 0);
  }, [activeCategory, searchWhere, searchWhen, searchWho]);

  useEffect(() => {
    // Fetch initial wishlist if logged in
    const token = localStorage.getItem('nwxt_token');
    if (token) {
      fetch(buildApiUrl('/wishlist'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.wishlist) setFavorites(new Set(data.wishlist));
      })
      .catch(console.error);
    }
  }, []);

  async function toggleFav(id: string) {
    const token = localStorage.getItem('nwxt_token');
    
    // Optimistic offline update
    setFavorites(cur => {
      const next = new Set(cur);
      if (next.has(id)) { next.delete(id); showToast('Removed from favourites.'); }
      else               { next.add(id);    showToast('Saved to favourites ♥'); }
      return next;
    });

    if (token) {
      try {
        await fetch(buildApiUrl('/wishlist/toggle'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ listingId: id })
        });
      } catch(err) {
        console.error('Failed to sync wishlist to backend', err);
      }
    } else {
      showToast('Login to persist your favorites!');
    }
  }

  function scrollSection(id: string, dir: 'left' | 'right') {
    sectionRefs.current[id]?.scrollBy({ left: dir === 'left' ? -308 : 308, behavior: 'smooth' });
  }

  function registerScroller(id: string, el: HTMLDivElement | null) {
    sectionRefs.current[id] = el;
  }

  function handleSearch() {
    // Build query string and redirect to real DB listings page
    const params = new URLSearchParams();
    if (searchWhere.trim()) params.set('search', searchWhere.trim());
    window.location.href = `/listings?${params.toString()}`;
  }

  function handleCategory(id: CategoryId, label: string) {
    setActiveCategory(id); showToast(`Switched to ${label}.`);
  }

  function handleCardClick(loc: string) {
    setSearchWhere(loc); showToast(`Focused on ${loc}.`);
  }

  useEffect(() => {
    const fn = ((e: Event) => handleCardClick((e as CustomEvent<string>).detail)) as EventListener;
    window.addEventListener('nextgen:focus-location', fn);
    return () => window.removeEventListener('nextgen:focus-location', fn);
  }, []);

  return (
    <>
      {toast && <Toast key={toastKey} msg={toast} />}

      <div className="page-bg min-h-screen pb-24">

        {/* ═══ Hero ═══ */}
        <section className="hero-section border-b border-[#8faec8]/20">
          <div className="mx-auto max-w-[1520px] px-4 pb-14 pt-8 sm:px-6 lg:px-10">

            {/* Category tabs */}
            <div className="flex flex-wrap items-end justify-center gap-5 animate-fade-in sm:gap-10">
              {categories.map(cat => {
                const active = cat.id === activeCategory;
                return (
                  <button key={cat.id} type="button" onClick={() => handleCategory(cat.id, cat.label)}
                    aria-pressed={active}
                    className={`cat-tab group relative flex items-center gap-2.5 border-b-[3px] px-2 pb-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 ${
                      active ? 'cat-tab-active border-[#1a2742]' : 'border-transparent hover:border-[#8faec8]/60'
                    }`}>
                    <span className="relative">
                      <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{cat.icon}</span>
                      {cat.aiTag && (
                        <span title="AI Agent powered"
                          className="ai-tag absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ring-2 transition-transform duration-300 group-hover:scale-110">
                          🤖
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col items-start leading-tight">
                      {cat.badge && <span className="new-badge mb-1 rounded-full px-2 py-0.5 text-[8px] font-bold tracking-[0.16em]">{cat.badge}</span>}
                      <span>{cat.label}</span>
                    </span>
                    {active && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#1a2742] shadow-[0_0_8px_rgba(26,39,66,0.4)]" />}
                  </button>
                );
              })}
            </div>

            {/* Search bar */}
            <div className="animate-rise-in relative z-50">
              <SearchBar
                searchWhere={searchWhere} setSearchWhere={setSearchWhere}
                searchWhen={searchWhen}   setSearchWhen={setSearchWhen}
                searchWho={searchWho}     setSearchWho={setSearchWho}
                onSearch={handleSearch}
              />
            </div>

            {/* Hero card */}
            <div className="animate-rise-in hero-card mt-10 flex flex-wrap items-center justify-between gap-6 rounded-[36px] px-8 py-8">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8faec8]">Next-Gen Ai</p>
                <h1 className="hero-title mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                  Premium stays, intelligent agents &amp; AI-powered services
                </h1>
                <p className="hero-sub mt-4 max-w-2xl text-base leading-7">
                  AI-curated homes, automated host tools, and real-time booking agents — built for the next generation of travel.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard"
                  className="btn-primary rounded-full px-7 py-3 text-sm font-bold shadow-[0_8px_24px_rgba(26,39,66,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(26,39,66,0.28)] active:scale-95">
                  Open dashboard
                </Link>
                <Link href="/map-view"
                  className="btn-secondary rounded-full px-7 py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95">
                  Explore map →
                </Link>
              </div>
            </div>

            {/* Feature strip */}
            <div className="animate-rise-in"><FeatureStrip /></div>
          </div>
        </section>

        {/* ═══ Listings ═══ */}
        <section className="mx-auto max-w-[1520px] space-y-16 px-4 py-16 sm:px-6 lg:px-10">
          {filteredSections.length > 0 ? (
            filteredSections.map(s => (
              <SectionRow key={s.id} section={s} favorites={favorites}
                onFav={toggleFav} onCardClick={handleCardClick}
                onScroll={scrollSection} registerScroller={registerScroller} />
            ))
          ) : (
            <div className="empty-state animate-rise-in rounded-[32px] p-12 text-center">
              <p className="text-5xl">🔍</p>
              <h2 className="empty-title mt-5 text-2xl font-bold">No matches found</h2>
              <p className="empty-sub mt-3 text-base">Try a different category or clear your search.</p>
              <button type="button"
                onClick={() => { setSearchWhere(''); setSearchWhen(''); setSearchWho(''); showToast('Filters cleared ✓'); }}
                className="btn-primary mt-6 rounded-full px-7 py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95">
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
