'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '../../lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(buildApiUrl('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Auto login or redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-[32px] p-10 shadow-2xl sm:p-14" style={{ backgroundColor: '#3b4353' }}>
        <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">Register</h1>
        <p className="mb-10 text-[15px] font-medium leading-relaxed" style={{ color: '#c0cce0' }}>
          Create a new account for the NWXT app. This page connects to the auth stub endpoint in Sprint 1.
        </p>

        {error && <div className="mb-6 rounded-xl bg-red-500/20 px-4 py-3 text-red-100 text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="rounded-[14px] border-none px-5 py-4 text-[15px] font-medium text-white outline-none transition-all placeholder:text-white/30 focus:ring-2 focus:ring-[#00b5d8]"
              style={{ backgroundColor: '#090e17' }}
            />
          </div>

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
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
