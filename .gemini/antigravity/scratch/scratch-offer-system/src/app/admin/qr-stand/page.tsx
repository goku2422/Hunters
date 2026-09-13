'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, QrCode, Printer, ShieldCheck } from 'lucide-react';
import AcrylicStandPreview from '@/components/AcrylicStandPreview';

export default function QrStandPage() {
  const [claimUrl, setClaimUrl] = useState('http://localhost:3000/claim');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClaimUrl(`${window.location.origin}/claim`);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="mb-6 flex items-center justify-between no-print">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Acrylic Stand Print Studio</span>
          </div>
        </div>

        {/* Explain the Commercial Acrylic Display */}
        <div className="mb-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center no-print">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Universal QR Code Manufacturing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Physical Acrylic QR Stand Display
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1.5">
            This identical acrylic stand can be mass-produced and sold to hundreds of shops. Every customer who scans it is automatically paired with the shop they are standing in.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl">
            <span>Target Common URL:</span>
            <span className="font-bold text-indigo-600">{claimUrl}</span>
          </div>
        </div>

        {/* The Stand Component */}
        <div className="bg-slate-200/60 p-6 sm:p-10 rounded-3xl border border-slate-300 shadow-inner flex justify-center">
          <AcrylicStandPreview claimUrl={claimUrl} brandName="ScratchEase Retail Network" />
        </div>
      </div>
    </div>
  );
}
