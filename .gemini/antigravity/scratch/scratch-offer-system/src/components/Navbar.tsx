'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Store, ShieldCheck, QrCode } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/claim' || pathname.startsWith('/customer')) {
    return null;
  }

  const isCustomer = pathname === '/' || pathname === '/claim';
  const isMerchant = pathname.startsWith('/merchant');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Scratch<span className="text-amber-500">Ease</span></span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">Common QR Network</span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
          <Link
            href="/claim"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isCustomer
              ? 'bg-amber-500 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Customer Scan</span>
          </Link>

          <Link
            href="/merchant/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isMerchant
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <Store className="h-4 w-4" />
            <span>Merchant Portal</span>
          </Link>

          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isAdmin && !pathname.includes('qr-stand')
              ? 'bg-slate-900 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </Link>

          <Link
            href="/admin/qr-stand"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${pathname.includes('qr-stand')
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Acrylic Stand</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
