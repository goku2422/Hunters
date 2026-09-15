'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Sparkles, Printer, Download, QrCode as QrIcon, CheckCircle2 } from 'lucide-react';

interface AcrylicStandPreviewProps {
  claimUrl?: string;
  brandName?: string;
}

export default function AcrylicStandPreview({
  claimUrl = 'http://localhost:3000/claim',
  brandName = 'ScratchEase Network',
}: AcrylicStandPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let effectiveUrl = claimUrl;
    if (typeof window !== 'undefined' && effectiveUrl.includes('localhost')) {
      effectiveUrl = effectiveUrl.replace(/http:\/\/localhost:\d+/, window.location.origin);
    }
    // Generate high resolution QR code data URL
    QRCode.toDataURL(effectiveUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a', // deep slate
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [claimUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Bar */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Acrylic Artwork</span>
        </button>
        <a
          href={qrDataUrl}
          download="common-qr-display.png"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm border border-slate-300 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Save QR Graphic</span>
        </a>
      </div>

      {/* The Physical Acrylic Stand Tent Card Mockup */}
      <div className="relative max-w-sm w-full mx-auto print:max-w-none print:w-full">
        {/* Acrylic 3D Gloss / Shadow Box */}
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/90 via-white/50 to-slate-200 shadow-2xl border-4 border-slate-300/60 backdrop-blur-md">
          
          {/* Inner Tent Card Insert */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center border border-slate-200 shadow-inner">
            
            {/* Header Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In-Store Exclusive</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              SCAN TO WIN <span className="text-amber-500 block">10% FLAT OFF</span>
            </h2>

            <p className="text-xs text-slate-500 mt-2 font-medium">
              Instant scratch & save on your bill today!
            </p>

            {/* QR Code Container with High-Contrast Scanning Frame */}
            <div className="my-5 p-3.5 bg-slate-900 rounded-2xl shadow-xl border-2 border-amber-400">
              <div className="bg-white p-3 rounded-xl">
                <img
                  src={qrDataUrl || '/counter-qr.png'}
                  alt="Common QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>
            </div>

            {/* Universal QR Guarantee */}
            <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-200 mb-4 max-w-full truncate">
              {claimUrl}
            </div>

            {/* 3 Simple Instructions */}
            <div className="w-full space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px] flex-shrink-0">
                  1
                </span>
                <span>Scan this QR code with any phone camera</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px] flex-shrink-0">
                  2
                </span>
                <span>Enter your Name & Mobile Number</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px] flex-shrink-0">
                  3
                </span>
                <span>Scratch card & show 10% code to cashier</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between w-full pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Universal Stand Display</span>
              <span>10% Discount Valid</span>
            </div>
          </div>
        </div>

        {/* Acrylic Stand Base Feet (Realistic 3D look) */}
        <div className="mx-auto w-4/5 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-b-xl shadow-lg border border-slate-300 no-print" />
      </div>
    </div>
  );
}
