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
      <div className="my-3 p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-3 text-xs font-semibold shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <div className="font-extrabold text-sm text-emerald-950">🎯 Stamp collected successfully!</div>
          <div className="text-emerald-700 text-[11px] mt-0.5">Your visit has been recorded on your stamp card.</div>
        </div>
      </div>
    );
  }

  return null;
}
