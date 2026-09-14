'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Sparkles } from 'lucide-react';
import DemoSimulatorBar from '@/components/DemoSimulatorBar';
import CustomerClaimForm from '@/components/CustomerClaimForm';

export default function ClaimPage() {
  const [simulatedShopId, setSimulatedShopId] = useState<string | null>('shop-brew');
  const [detectedShopName, setDetectedShopName] = useState<string>('Brew & Bean Cafe');
  const [resolutionMethod, setResolutionMethod] = useState<string>('GEOFENCE');

  const handleSelectSimulation = (shopId: string | null, label: string) => {
    setSimulatedShopId(shopId);
  };

  const handleShopResolved = (name: string, method: string) => {
    setDetectedShopName(name);
    setResolutionMethod(method);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffaf0]">
      {/* Top Demo Proximity Simulator Bar */}
      <div className="hidden">
        <DemoSimulatorBar
          currentSimulatedShopId={simulatedShopId}
          onSelectSimulation={handleSelectSimulation}
          detectedShopName={detectedShopName}
          resolutionMethod={resolutionMethod}
        />
      </div>

      {/* Main Interactive Customer Container */}
      <div className="flex-1 flex items-center justify-center px-7 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-7">
            <h1 className="text-[30px] font-black tracking-[-0.04em] text-[#142033] sm:text-[34px]">Start earning free rewards!</h1>
            <div className="mt-1 text-2xl">✨</div>
            <p className="mt-5 text-base text-[#667085]">Enter your details - amazing rewards await!</p>
          </div>

          <div className="mb-8 grid grid-cols-2 rounded-full bg-[#efefeb] p-1 shadow-inner">
            <div className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-[#152238] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#d08f8a]" /> Customer
            </div>
            <Link href="/merchant/login" className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-[#737b8a] transition hover:text-[#152238]">
              <Building2 className="h-4 w-4 text-[#d08f8a]" /> Business
            </Link>
          </div>

          <CustomerClaimForm
            simulatedShopId={simulatedShopId}
            onShopResolved={handleShopResolved}
          />
        </div>
      </div>

      <p className="pb-5 text-center text-xs text-[#667085]">By proceeding, you agree to Kutio&apos;s <span className="font-semibold text-[#b20d18]">T&amp;C</span> and <span className="font-semibold text-[#b20d18]">Privacy Policy</span></p>
    </div>
  );
}
