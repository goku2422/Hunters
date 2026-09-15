'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import { Claim } from '@/types';

interface ScratchCardProps {
  claim: Claim;
  onStatusUpdated?: (updatedClaim: Claim) => void;
}

export default function ScratchCard({ claim: initialClaim, onStatusUpdated }: ScratchCardProps) {
  const [claim, setClaim] = useState<Claim>(initialClaim);

  useEffect(() => {
    setClaim(initialClaim);
  }, [initialClaim]);

  // Poll claim status every 2 seconds while PENDING in the background
  useEffect(() => {
    if (claim.status !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/claims/' + claim.id);
        const data = await res.json();
        if (data.success && data.claim) {
          if (data.claim.status !== claim.status) {
            setClaim(data.claim);
            if (onStatusUpdated) onStatusUpdated(data.claim);
            if (data.claim.status === 'ACCEPTED') {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll claim status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [claim.id, claim.status, onStatusUpdated]);

  if (claim.status === 'ACCEPTED') {
    return (
      <div className={`my-3 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm ${
        claim.isRedeemed || claim.is8thStampReward
          ? 'bg-amber-50 text-amber-950 border border-amber-300'
          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
      }`}>
        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${claim.isRedeemed || claim.is8thStampReward ? 'text-amber-600' : 'text-emerald-600'}`} />
        <div>
          <div className="font-extrabold text-sm">
            {claim.isRedeemed ? '🎁 Free Treat Redeemed & Enjoyed!' : '🎯 Stamp collected successfully!'}
          </div>
          <div className={`text-[11px] mt-0.5 ${claim.isRedeemed ? 'text-amber-800' : 'text-emerald-700'}`}>
            {claim.isRedeemed ? 'Your cashier has verified and redeemed your reward.' : 'Your visit has been recorded on your stamp card.'}
          </div>
        </div>
      </div>
    );
  }

  if (claim.is8thStampReward || claim.rewardCode) {
    return (
      <div className="my-3 p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30 border-2 border-amber-300 text-center">
        <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2 border border-white/30">
          🎁 8th Stamp Reward Code
        </span>
        <h3 className="text-lg font-black tracking-tight">{claim.offerTitle || 'Free Reward Treat'}</h3>
        <p className="text-xs text-amber-100 mt-1 font-medium">Show this secret coupon code at the counter:</p>
        
        <div className="my-3 py-2 px-4 bg-white text-slate-900 rounded-2xl font-mono text-xl font-black tracking-widest shadow-inner border-2 border-amber-400 inline-block">
          {claim.rewardCode || 'TREAT-8821'}
        </div>

        <p className="text-[11px] text-amber-100 font-semibold animate-pulse">
          ⏳ Waiting for cashier to click "Mark as Redeemed"...
        </p>
      </div>
    );
  }

  return null;
}
