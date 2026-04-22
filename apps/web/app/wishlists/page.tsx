'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listingsData } from '../../data/listings';
import { buildApiUrl } from '../../lib/api';

export default function WishlistPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const token = localStorage.getItem('nwxt_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(buildApiUrl('/wishlist'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.wishlist) {
          setFavorites(data.wishlist);
        }
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, []);

  async function toggleFav(id: string) {
    const token = localStorage.getItem('nwxt_token');
    
    // Optimistic offline update (immediately remove from UI)
    setFavorites(cur => cur.filter(fav => fav !== id));

    if (token) {
      try {
        await fetch(buildApiUrl('/wishlist/toggle'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ listingId: id })
        });
      } catch(err) {
        console.error('Failed to update wishlist', err);
        // If it fails, add it back
        setFavorites(cur => [...cur, id]);
      }
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading Wishlists...</div>;
  }

  // Filter listings based on what user has in favorites
  const wishlistItems = listingsData.filter(listing => favorites.includes(listing.id));

  return (
    <div className="mx-auto max-w-[1520px] px-4 py-10 sm:px-6 lg:px-10">
      <h1 className="mb-8 text-3xl font-extrabold text-[#1a2742]">Your Wishlists</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="rounded-2xl border border-[#8faec8]/20 bg-white p-12 text-center">
          <h2 className="text-xl font-bold text-[#1a2742] mb-2">No trips saved yet</h2>
          <p className="text-[#8faec8] mb-6">As you search, tap the heart icon to save your favourite places to stay or things to do.</p>
          <Link href="/" className="rounded-[14px] bg-[#1a2742] px-6 py-3 font-bold text-white transition-all hover:bg-black">
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative flex flex-col gap-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                
                {item.badge && (
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1a2742] backdrop-blur-md">
                    {item.badge}
                  </div>
                )}

                <button 
                  onClick={() => toggleFav(item.id)}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
                >
                   <svg viewBox="0 0 32 32" className="h-5 w-5 fill-[#FF385C] stroke-white stroke-[2px] transition-colors"><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.67c-1.8 0-3.38.7-4.5 2.14a5.2 5.2 0 0 0-1.82 3.65h-1.36a5.2 5.2 0 0 0-1.82-3.65C12.38 5.03 10.8 4.33 9 4.33A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" /></svg>
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1a2742] truncate mr-2">{item.location}</h3>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span>★</span> {item.rating}
                  </div>
                </div>
                <p className="text-[15px] text-[#8faec8] line-clamp-1">{item.title}</p>
                <div className="mt-1 text-[15px]">
                  <span className="font-semibold text-[#1a2742]">{item.price}</span> <span className="text-[#8faec8]">/ night</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
