'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { buildApiUrl } from '../lib/api';

export default function ProfileMenu() {
  const [user, setUser] = useState<{ id: string, name: string, email: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nwxt_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      const token = localStorage.getItem('nwxt_token');
      if (token) {
        fetch(buildApiUrl('/wishlist'), {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
          if (data.wishlist) setWishlistCount(data.wishlist.length);
        })
        .catch(console.error);
      }
    }
  }, [isOpen, user]);

  const handleLogout = () => {
    localStorage.removeItem('nwxt_user');
    localStorage.removeItem('nwxt_token');
    setUser(null);
    setIsOpen(false);
    window.location.reload();
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-3">
        {/* Profile Circle - Directs to login if not logged in */}
        <div 
          onClick={() => { if (!user) window.location.href='/login'; }}
          className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-full bg-[#222222] text-[16px] font-medium text-white transition-opacity hover:opacity-85"
        >
          {user ? initial : '👤'}
        </div>
        
        {/* Hamburger Menu Circle */}
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f3f4f6] transition-colors hover:bg-[#e5e7eb] shadow-sm"
        >
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{display: 'block', fill: 'none', height: 16, width: 16, stroke: '#222222', strokeWidth: 3, overflow: 'visible'}}><g fill="none" fillRule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg>
        </button>
      </div>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+16px)] w-[260px] rounded-[16px] bg-white py-3 shadow-[0_12px_28px_rgba(0,0,0,0.12)] border border-[#8faec8]/15 z-50 animate-in fade-in zoom-in duration-200">
          
          <div className="flex flex-col">
            {user ? (
              <>
                <Link href="/wishlists" className="px-5 py-3 hover:bg-[#f7f7f9] text-[15px] font-semibold text-[#1a2742] transition-colors flex justify-between items-center" onClick={() => setIsOpen(false)}>
                  <span>Wishlists</span>
                  {wishlistCount !== null && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a2742] text-[11px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <div className="h-[1px] w-full bg-[#8faec8]/20 my-2" />
                <Link href="/host" className="px-5 py-3 hover:bg-[#f7f7f9] transition-colors group flex items-start justify-between" onClick={() => setIsOpen(false)}>
                  <div>
                    <div className="text-[15px] font-semibold text-[#FF385C]">Become a Host 🏠</div>
                    <div className="text-[13px] text-[#8faec8] mt-0.5 leading-snug">List your property and start earning.</div>
                  </div>
                </Link>
                <div className="h-[1px] w-full bg-[#8faec8]/20 my-2" />
                <Link href="/dashboard" className="px-5 py-3 hover:bg-[#f7f7f9] text-[15px] text-[#1a2742] transition-colors">
                  Profile
                </Link>
                <Link href="/dashboard" className="px-5 py-3 hover:bg-[#f7f7f9] text-[15px] text-[#1a2742] transition-colors">
                  Account settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-5 py-3 hover:bg-[#f7f7f9] text-[15px] font-semibold text-[#1a2742] transition-colors" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="px-5 py-3 hover:bg-[#f7f7f9] text-[15px] font-semibold text-[#1a2742] transition-colors" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
                <div className="h-[1px] w-full bg-[#8faec8]/20 my-2" />
              </>
            )}

            <Link href="/dashboard" className="px-5 py-3 hover:bg-[#f7f7f9] text-[15px] text-[#1a2742] transition-colors">
              Help Centre
            </Link>
            
            {user && (
              <>
                <div className="h-[1px] w-full bg-[#8faec8]/20 my-2" />
                <button 
                  type="button" 
                  onClick={handleLogout} 
                  className="w-full text-left px-5 py-3 hover:bg-[#f7f7f9] text-[15px] text-red-500 font-semibold transition-colors"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
