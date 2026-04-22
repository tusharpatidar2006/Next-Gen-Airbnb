'use client';

import Link from 'next/link';
import { ArrowLeft, Star, Heart, Share, MapPin, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAuthToken } from '../../../lib/auth';
import { buildApiUrl, getGeoapifyApiKey } from '../../../lib/api';
import { buildGeoapifyStaticMapUrl, geocodeLocation } from '../../../lib/geoapify';
import { listingsData } from '../../../data/listings';
import { getHostProfileForListing } from '../../../lib/listing-hosts';

const MAP_PLACEHOLDER = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80'; 

export default function ListingDetail({ params }: { params: { id: string } }) {
  const [isSaved, setIsSaved] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [propertyMapUrl, setPropertyMapUrl] = useState<string | null>(null);
  const [propertyMapLoading, setPropertyMapLoading] = useState(false);
  
  const [showPayment, setShowPayment] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<null | 'processing' | 'success'>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [payMethod, setPayMethod] = useState<'card'|'upi'>('card');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(buildApiUrl('/listings'));
        if (res.ok) {
          const data = await res.json();
          // Attempt to find in DB
          const dbItem = data.listings?.find((p: any) => p.id === params.id);
          if (dbItem) {
            const photos = Array.isArray(dbItem.photos) ? dbItem.photos : [];
            const photoUrl = photos[0] || 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1200&q=80';
            
            setListing({
              id: dbItem.id,
              title: dbItem.title,
              subtitle: dbItem.description || dbItem.size || 'Premium stay',
              location: dbItem.location,
              price: dbItem.price,
              rating: '4.95',
              image: photoUrl,
              fromDb: true
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch from DB', err);
      }
      
      // Fallback to seeded catalog item
      let item = listingsData.find(i => i.id === params.id);
      if (!item) {
        item = {
          id: params.id,
          title: 'Beautiful Property',
          subtitle: 'Premium stay',
          location: 'India',
          price: '₹10,000',
          rating: '4.85',
          image: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1200&q=80',
          category: 'homes',
        };
      }
      setListing({
        ...item,
        price: typeof item.price === 'number' ? item.price : Number(String(item.price).replace(/[^0-9.]/g, '')) || 10000,
        fromDb: false,
      });
      setLoading(false);
    };

    fetchListing();
  }, [params.id]);

  useEffect(() => {
    const apiKey = getGeoapifyApiKey();
    if (!listing?.location || !apiKey) {
      setPropertyMapUrl(null);
      return;
    }

    let cancelled = false;

    const loadPropertyMap = async () => {
      setPropertyMapLoading(true);
      try {
        const point = await geocodeLocation(`${listing.location}, India`, apiKey);
        if (!cancelled) {
          setPropertyMapUrl(
            point
              ? buildGeoapifyStaticMapUrl({
                  center: point,
                  markers: [point],
                  width: 1200,
                  height: 520,
                  zoom: 12,
                  apiKey,
                })
              : null
          );
        }
      } finally {
        if (!cancelled) {
          setPropertyMapLoading(false);
        }
      }
    };

    loadPropertyMap();

    return () => {
      cancelled = true;
    };
  }, [listing?.location]);

  const handleBooking = async () => {
    if (payMethod === 'card' && (!cardNumber || !expiry || !cvv)) {
       alert("Please enter payment details");
       return;
    }
    const token = getAuthToken();
    if (!token) {
      alert("Please login first to book a property!");
      return;
    }

    setBookingStatus('processing');
    
    // If it's a DB item, call the backend booking endpoint
    if (listing.fromDb) {
      try {
        const res = await fetch(buildApiUrl('/bookings'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            propertyId: listing.id,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            amount: listing.price * 2,
            paymentMethod: payMethod === 'upi' ? 'UPI' : 'CREDIT_CARD'
          })
        });
        
        if (res.ok) {
           setBookingStatus('success');
        } else {
           const errData = await res.json();
           alert('Booking Failed: ' + (errData.message || 'Unknown error'));
           setBookingStatus(null);
        }
      } catch (e) {
        console.error(e);
        alert('Network Error connecting to backend');
        setBookingStatus(null);
      }
    } else {
       // Mock booking for mock items
       setTimeout(() => {
         setBookingStatus('success');
       }, 2000);
    }
  };

  if (loading || !listing) return <div className="p-10 text-center">Loading property...</div>;
  const host = getHostProfileForListing(listing);

  return (
    <div className="min-h-screen bg-white text-[#1a2742] pb-32 relative">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-[#8faec8]/20 bg-white/95 px-6 py-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-75">
          <ArrowLeft size={20} />
          <span>Back to Explore</span>
        </Link>
        <div className="flex gap-4">
          <button className="flex items-center gap-1.5 text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
            <Share size={18} /> <span className="hidden sm:inline">Share</span>
          </button>
          <button onClick={() => setIsSaved(!isSaved)} className="flex items-center gap-1.5 text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
            <Heart size={18} fill={isSaved ? '#FF385C' : 'transparent'} color={isSaved ? '#FF385C' : 'currentColor'} /> 
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </nav>

      {/* ── Header Image ── */}
      <div className="w-full h-[40vh] md:h-[60vh] relative bg-gray-200">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
      </div>

      <main className="mx-auto max-w-5xl px-6 pt-10">
        
        {/* ── Title Row ── */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{listing.title}</h1>
            <h2 className="text-xl font-medium text-[#2c3e5e] mb-4">{listing.subtitle}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-[15px] font-semibold">
              <span className="flex items-center gap-1">
                <Star size={16} className="fill-[#1a2742]" /> {listing.rating}
              </span>
              <span className="underline decoration-[#8faec8] cursor-pointer">158 reviews</span>
              <span className="flex items-center gap-1 underline decoration-[#8faec8] cursor-pointer">
                <MapPin size={16} /> {listing.location}
              </span>
            </div>
          </div>
          
          {/* Desktop Floating Reserve Box (hidden on mobile) */}
          <div className="hidden md:block w-80 shrink-0 p-6 rounded-2xl border border-[#8faec8]/20 shadow-[0_20px_40px_rgba(26,39,66,0.08)] sticky top-28 bg-white">
             <div className="text-2xl font-bold mb-4">₹{(listing.price).toLocaleString()} <span className="text-base font-medium text-[#8faec8]">night</span></div>
             <div className="border border-[#8faec8]/30 rounded-xl flex flex-col mb-4 overflow-hidden">
                <div className="flex border-b border-[#8faec8]/30">
                  <div className="p-3 border-r border-[#8faec8]/30 flex-1">
                    <div className="text-[10px] font-bold uppercase text-[#1a2742]">Check-in</div>
                    <div className="text-sm mt-0.5">Apr 24, 2026</div>
                  </div>
                  <div className="p-3 flex-1">
                    <div className="text-[10px] font-bold uppercase text-[#1a2742]">Checkout</div>
                    <div className="text-sm mt-0.5">Apr 26, 2026</div>
                  </div>
                </div>
                <div className="p-3">
                    <div className="text-[10px] font-bold uppercase text-[#1a2742]">Guests</div>
                    <div className="text-sm mt-0.5">4 guests</div>
                </div>
             </div>
             <button onClick={() => setShowPayment(true)} className="w-full bg-[#FF385C] text-white font-bold py-3.5 rounded-xl hover:bg-[#E31C5F] transition-colors">
               Reserve
             </button>
             <p className="text-center text-xs text-[#8faec8] mt-3">You won't be charged yet</p>
          </div>
        </div>

        <div className="my-10 h-px bg-[#8faec8]/20 w-full md:w-2/3" />

        {/* ── Capacities ── */}
        <div className="md:w-2/3">
          <h3 className="text-lg font-semibold mb-2">Entire place</h3>
          <p className="text-[#2c3e5e]">4 guests · 2 bedrooms · 2 beds · 2 bathrooms</p>
        </div>

        <div className="my-10 h-px bg-[#8faec8]/20 w-full md:w-2/3" />

        {/* ── Host Block ── */}
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold mb-6">Meet your host</h2>
          
          <div className="bg-[#f8f9fb] rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start border border-[#f1f1f1]">
            <div className="flex flex-col items-center flex-none w-48 text-center bg-white p-6 rounded-[24px] shadow-[0_8px_20px_rgba(26,39,66,0.06)]">
              <img src={host.avatar} className="w-24 h-24 rounded-full object-cover mb-3" alt={`${host.name} avatar`} />
              <div className="text-2xl font-extrabold tracking-tight">{host.name}</div>
              <div className="text-sm font-medium text-[#8faec8] mb-4">Host</div>
            </div>

            <div className="flex-1">
               <ul className="space-y-3 text-[15px] mb-6">
                 <li className="flex items-center gap-3"><span className="text-xl">💼</span> My work: Lawyer</li>
                 <li className="flex items-center gap-3"><span className="text-xl">🗣</span> Speaks English and Hindi</li>
                 <li className="flex items-center gap-3"><span className="text-xl">Reviews</span> {host.reviews} guest reviews</li>
                 <li className="flex items-center gap-3"><span className="text-xl">Years</span> Hosting for {host.yearsHosting} years</li>
               </ul>
               <p className="text-[#2c3e5e] leading-relaxed mb-6">
                  {host.bio}
               </p>
            </div>
          </div>
        </div>

        <div className="my-10 h-px bg-[#8faec8]/20 w-full md:w-2/3" />

        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold mb-3">Where you'll be</h2>
          <p className="text-[#2c3e5e] mb-5">{listing.location}, India</p>

          <div className="relative overflow-hidden rounded-[28px] border border-[#d4e4f7] bg-[#f8f9fb]">
            <img
              src={propertyMapUrl || MAP_PLACEHOLDER}
              alt={`${listing.location} map`}
              className="h-[320px] w-full object-cover"
            />

            {propertyMapLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/65 text-sm font-semibold text-[#1a2742]">
                Loading Geoapify map...
              </div>
            ) : null}

            <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-4 py-3 text-center text-sm font-bold text-white">
              Exact location provided after booking
            </div>
          </div>
        </div>

      </main>

      {/* ── Mobile Sticky Reserve Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#8faec8]/20 p-4 pb-6 flex items-center justify-between z-40">
         <div>
           <div className="font-bold text-lg">₹{(listing.price).toLocaleString()} <span className="text-sm font-medium">night</span></div>
           <div className="text-xs underline text-[#8faec8]">Apr 24 - 26</div>
         </div>
         <button onClick={() => setShowPayment(true)} className="bg-[#FF385C] text-white font-bold px-8 py-3 rounded-xl">
           Reserve
         </button>
      </div>
      
      {/* ── PAYMENT MODAL ── */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden relative">
              {bookingStatus === 'success' ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6">✅</div>
                  <h2 className="text-3xl font-bold text-[#1a2742] mb-3">Booking Confirmed!</h2>
                  <p className="text-[#8faec8] mb-8 leading-relaxed">Your stay at {listing.title} is fully secured. The host will contact you shortly with check-in instructions.</p>
                  <button onClick={() => { setShowPayment(false); setBookingStatus(null); }} className="w-full bg-[#1a2742] text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                     <h3 className="text-xl font-bold">Secure Payment</h3>
                     <button onClick={() => setShowPayment(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold">✕</button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex gap-4 mb-6 p-4 bg-[#f8f9fb] rounded-xl border border-gray-100">
                       <img src={listing.image} className="w-20 h-20 object-cover rounded-lg" alt="Thumbnail" />
                       <div className="flex-1">
                          <div className="font-bold text-[#1a2742] line-clamp-1">{listing.title}</div>
                          <div className="text-sm text-[#8faec8] mb-2">2 nights • Apr 24 - 26</div>
                          <div className="font-bold">Total: ₹{(listing.price * 2).toLocaleString()}</div>
                       </div>
                    </div>

                    <div className="flex bg-[#f1f5f9] rounded-xl p-1 mb-6">
                       <button onClick={() => setPayMethod('card')} className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${payMethod === 'card' ? 'bg-white shadow-sm text-[#1a2742]' : 'text-[#8faec8] hover:text-[#1a2742]'}`}>Debit / Credit Card</button>
                       <button onClick={() => setPayMethod('upi')} className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${payMethod === 'upi' ? 'bg-white shadow-sm text-[#1a2742]' : 'text-[#8faec8] hover:text-[#1a2742]'}`}>UPI / QR</button>
                    </div>

                    {payMethod === 'card' ? (
                      <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-semibold mb-1 text-[#1a2742]">Card Number</label>
                           <input value={cardNumber} onChange={e=>setCardNumber(e.target.value)} type="text" placeholder="0000 0000 0000 0000" className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-all bg-white" />
                         </div>
                         <div className="flex gap-4">
                           <div className="flex-1">
                             <label className="block text-sm font-semibold mb-1 text-[#1a2742]">Expiry Date</label>
                             <input value={expiry} onChange={e=>setExpiry(e.target.value)} type="text" placeholder="MM/YY" className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-all bg-white" />
                           </div>
                           <div className="flex-1">
                             <label className="block text-sm font-semibold mb-1 text-[#1a2742]">CVV</label>
                             <input value={cvv} onChange={e=>setCvv(e.target.value)} type="password" placeholder="123" className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-all bg-white" />
                           </div>
                         </div>
                      </div>
                    ) : (
                      <div className="bg-[#18181b] rounded-[20px] p-6 flex flex-col items-center">
                         <div className="flex items-center gap-3 mb-6 w-full justify-center">
                            <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-[9px] text-white font-black tracking-wider">SBI</div>
                            <span className="text-white font-medium text-15px">State Bank of India - 0948</span>
                         </div>
                         <div className="relative w-52 h-52 bg-white p-2.5 rounded-xl mb-6 shadow-xl">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(`upi://pay?pa=sbi.merchants@sbi&pn=NextGenAI Properties&am=${listing.price * 2}&cu=INR`)}`} className="w-full h-full object-contain" alt="QR Code" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#18181b] border-[3px] border-white rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">पे</div>
                         </div>
                         <button className="text-[#c084fc] font-semibold text-sm hover:text-purple-300 transition-colors">View UPI details</button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-[#f8f9fb]">
                     <button
                       onClick={handleBooking}
                       disabled={bookingStatus === 'processing'}
                       className="w-full bg-[#FF385C] disabled:bg-[#FF385C]/60 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E31C5F] transition-colors"
                     >
                       {bookingStatus === 'processing' ? 'Processing...' : `Pay ₹${(listing.price * 2).toLocaleString()}`}
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
      
    </div>
  );
}
