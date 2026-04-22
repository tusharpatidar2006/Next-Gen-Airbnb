import '../styles/globals.css';
import type { Metadata } from 'next';
import { ReactQueryProvider } from './providers';
import Link from 'next/link';
import ProfileMenu from '../components/ProfileMenu';

export const metadata: Metadata = {
  title: 'Next-Gen Ai',
  description: 'Premium stays, intelligent agents and AI-powered services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: '#f2f4f8', color: '#1a2742' }}>
        <ReactQueryProvider>
          <div className="flex min-h-screen flex-col">

            {/* ── Header ── */}
            <header className="site-header sticky top-0 z-40">
              <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-10">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a2742] overflow-hidden">
                    <img src="/icon.png" alt="Next-Gen Ai Icon" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold tracking-[-0.03em]" style={{ color: '#1a2742' }}>
                      Next-Gen Ai
                    </p>
                    <p className="text-xs" style={{ color: '#8faec8' }}>Smart stays · Web &amp; Mobile</p>
                  </div>
                </Link>

                {/* Nav */}
                <nav className="hidden items-center gap-6 text-[14px] font-medium lg:flex">
                  {[
                    { href: '/', label: 'Homes' },
                    { href: '/listings', label: 'Browse' },
                    { href: '/map-view', label: 'Map View' },
                  ].map(l => (
                    <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
                  ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 relative">

                  
                  <ProfileMenu />
                </div>
              </div>
            </header>

            {/* ── Main ── */}
            <main className="flex-1">{children}</main>

            {/* ── Footer ── */}
            <footer className="site-footer">
              <div className="mx-auto flex max-w-[1520px] flex-col gap-3 px-4 py-6 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
                <p>© 2025 Next-Gen Ai · Smart stays for web and mobile.</p>
                <div className="flex flex-wrap gap-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <span>Next.js 14</span>
                  <span>Expo Mobile</span>
                  <span>Geoapify Maps</span>
                  <span>TanStack Query</span>
                </div>
              </div>
            </footer>

          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
