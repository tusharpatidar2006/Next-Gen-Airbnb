import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../api/config';

// Fallback memory storage to prevent Expo Go native module crashes
let _token: string | null = null;
export const MemoryStorage = {
  getItem: async (key: string) => _token,
  setItem: async (key: string, val: string) => { _token = val; },
  removeItem: async (key: string) => { _token = null; }
};

interface User {
  id: string;
  name?: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  wishlistIds: string[];
  setUser: (user: User | null) => void;
  setToken: (v: string | null) => void;
  logout: () => Promise<void>;
  checkToken: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (listingId: string) => Promise<{ ok: boolean; added?: boolean; message?: string }>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    if (token) {
      refreshWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [token]);

  const checkToken = async () => {
    try {
      const storedToken = await MemoryStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const res = await fetch(`${API_BASE_URL}/profile`, { 
            headers: { Authorization: `Bearer ${storedToken}` } 
        });
        if (res.ok) {
           const data = await res.json();
           setUser(data);
        } else {
           await MemoryStorage.removeItem('token');
           setToken(null);
           setWishlistIds([]);
        }
      }
    } catch(e) {}
  };

  const refreshWishlist = async () => {
    const activeToken = token ?? await MemoryStorage.getItem('token');
    if (!activeToken) {
      setWishlistIds([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setWishlistIds(Array.isArray(data.wishlist) ? data.wishlist : []);
      }
    } catch (e) {}
  };

  const toggleWishlist = async (listingId: string) => {
    const activeToken = token ?? await MemoryStorage.getItem('token');
    if (!activeToken) {
      return { ok: false, message: 'Please log in to save wishlists.' };
    }

    const alreadySaved = wishlistIds.includes(listingId);
    setWishlistIds(prev =>
      alreadySaved ? prev.filter(id => id !== listingId) : [...prev, listingId]
    );

    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ listingId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Wishlist update failed');
      }

      return { ok: true, added: data.status === 'added' };
    } catch (e: any) {
      setWishlistIds(prev =>
        alreadySaved ? [...prev, listingId] : prev.filter(id => id !== listingId)
      );
      return { ok: false, message: e?.message || 'Wishlist update failed' };
    }
  };

  const logout = async () => {
    await MemoryStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWishlistIds([]);
  };

  return (
    <AuthContext.Provider value={{ user, token, wishlistIds, setUser, setToken, logout, checkToken, refreshWishlist, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};
