'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Sparkles, MapPin, Store, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Shop, Claim, IdentificationMethod } from '@/types';
import ScratchCard from './ScratchCard';

interface CustomerClaimFormProps {
  simulatedShopId: string | null;
  onShopResolved: (shopName: string, method: string) => void;
}

export default function CustomerClaimForm({
  simulatedShopId,
  onShopResolved,
}: CustomerClaimFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [resolvedShop, setResolvedShop] = useState<Shop | null>(null);
  const [resolutionMethod, setResolutionMethod] = useState<IdentificationMethod>('GEOFENCE');
  const [distanceMeters, setDistanceMeters] = useState<number | undefined>(undefined);
  const [resolutionMsg, setResolutionMsg] = useState<string>('Detecting store location...');
  const [isResolving, setIsResolving] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);

  // Intelligent Shop Resolution Trigger
  const resolveCurrentShop = useCallback(async (simId: string | null) => {
    setIsResolving(true);
    setErrorMsg(null);

    let lat: number | undefined;
    let lng: number | undefined;
    let accuracy: number | undefined;

    // If no simulation override, try browser GPS
    if (!simId && typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        accuracy = position.coords.accuracy;
      } catch (err) {
        console.log('GPS denied or timed out; falling back to Counter Session matching', err);
      }
    }

    try {
      const res = await fetch('/api/resolve-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          accuracy,
          simulatedShopId: simId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.shop) {
        setResolvedShop(data.shop);
        setResolutionMethod(data.method || 'GEOFENCE');
        setDistanceMeters(data.distanceMeters);
        setResolutionMsg(data.message || `Connected to ${data.shop.name}`);
        onShopResolved(data.shop.name, data.method || 'GEOFENCE');
      } else {
        setResolutionMsg('No active store detected nearby.');
      }
    } catch (err) {
      console.error('Resolution failed:', err);
      setResolutionMsg('Unable to connect to merchant network.');
    } finally {
      setIsResolving(false);
    }
  }, [onShopResolved]);

  // Re-run resolution when simulation changes
  useEffect(() => {
    resolveCurrentShop(simulatedShopId);
  }, [simulatedShopId, resolveCurrentShop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!resolvedShop) {
      setErrorMsg('No shop could be identified. Please ensure you are inside a partner shop.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobile,
          shopId: resolvedShop.id,
          identificationMethod: resolutionMethod,
          distanceMeters,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isDuplicate && data.existingClaim) {
          localStorage.setItem('drutoCustomer', JSON.stringify({ name: name.trim(), mobile: cleanMobile }));
          router.push('/customer/dashboard');
        } else {
          setErrorMsg(data.message || 'Failed to submit claim.');
        }
        return;
      }

      if (data.success && data.claim) {
        localStorage.setItem('drutoCustomer', JSON.stringify({ name: name.trim(), mobile: cleanMobile }));
        router.push('/customer/dashboard');
      }
    } catch (err) {
      console.error('Claim submission error:', err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If claim is active, render ScratchCard
  if (activeClaim) {
    return (
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <ScratchCard claim={activeClaim} onStatusUpdated={(updated) => setActiveClaim(updated)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card */}
      <div className="bg-transparent p-0">

        {/* Header Badge */}
        <div className="hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>In-Store Customer Scratch Card</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Claim Your <span className="text-amber-500">10% Flat OFF</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Scan common QR, enter your details & scratch to reveal discount.
          </p>
        </div>

        {/* Store Resolution Auto-Indicator */}
        <div className="hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm mt-0.5">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Identified Shop
                </span>
                {isResolving ? (
                  <span className="text-[11px] text-amber-600 font-medium animate-pulse">
                    Connecting...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-Resolved
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {resolvedShop ? resolvedShop.name : 'Searching nearby counter...'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{resolvedShop ? resolvedShop.address : resolutionMsg}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#172238]">
              Your Name
            </label>
            <div className="relative">
              <div className="hidden">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full rounded-2xl border-0 bg-[#efefed] px-4 py-4 text-base text-[#172238] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#c98280]/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#172238]">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
                required
                className="w-full rounded-2xl border-0 bg-[#efefed] px-4 py-4 pl-14 text-base tracking-wider text-[#172238] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#c98280]/30"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#8a909b]">No OTP required. Your number is used to save your rewards.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isResolving || !resolvedShop}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c98280] px-4 py-4 text-base font-bold text-white shadow-lg shadow-[#c98280]/20 transition-all hover:bg-[#b96f6d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Connecting to Cashier...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Continue to Rewards</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Anti-Fraud Guarantee */}
        <div className="hidden">
          <span className="flex items-center gap-1">
            🔒 SSL Encrypted
          </span>
          <span>•</span>
          <span>⚡ Instant In-Store Claim</span>
          <span>•</span>
          <span>1 Per Day</span>
        </div>
      </div>
    </div>
  );
}
