'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowPopup(false);
    
    try {
      const res = await fetch(buildApiUrl('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404 || data.message === 'No user exists, please register first') {
          setShowPopup(true);
          throw new Error('User not found');
        }
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token (usually in cookies or context, using localStorage for stub)
      localStorage.setItem('nwxt_token', data.token);
      localStorage.setItem('nwxt_user', JSON.stringify(data.user));
      
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-4 relative">
      {/* Missing User Popup Overlay */}
      {showPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
          <div className="max-w-sm w-full bg-[#1a2742] rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_30px_90px_rgba(0,0,0,0.5)] border border-[#8faec8]/20">
            <div className="w-16 h-16 rounded-full bg-[#FF385C]/10 flex items-center justify-center mb-5">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No User Found</h2>
            <p className="text-[15px] text-[#8faec8] mb-8 leading-relaxed">
              No user exists with this email address. Please register first to continue.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowPopup(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all text-sm"
              >
                Close
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="flex-1 py-3.5 rounded-2xl font-bold text-[#090e17] bg-[#00b5d8] hover:opacity-90 transition-all text-sm"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl rounded-[32px] p-10 shadow-2xl sm:p-14" style={{ backgroundColor: '#3b4353' }}>
        <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">Login</h1>
        <p className="mb-10 text-[15px] font-medium leading-relaxed" style={{ color: '#c0cce0' }}>
          Welcome back. Log in to your NWXT app account.
        </p>

        {error && <div className="mb-6 rounded-xl bg-red-500/20 px-4 py-3 text-red-100 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-[14px] border-none px-5 py-4 text-[15px] font-medium text-white outline-none transition-all placeholder:text-white/30 focus:ring-2 focus:ring-[#00b5d8]"
              style={{ backgroundColor: '#090e17' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-[14px] border-none px-5 py-4 text-[15px] font-medium text-white outline-none transition-all placeholder:text-white/30 focus:ring-2 focus:ring-[#00b5d8]"
              style={{ backgroundColor: '#090e17' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-[14px] px-6 py-4 text-[15px] font-bold text-[#090e17] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
            style={{ backgroundColor: '#00b5d8' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
