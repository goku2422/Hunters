'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Claim } from '@/types';

import StampCardBadge from './StampCardBadge';

interface ScratchCardProps {
  claim: Claim;
  onStatusUpdated?: (updatedClaim: Claim) => void;
}

export default function ScratchCard({ claim: initialClaim, onStatusUpdated }: ScratchCardProps) {
  const [claim, setClaim] = useState<Claim>(initialClaim);
  const [stampCount, setStampCount] = useState<number>(1);
  const [targetStamps, setTargetStamps] = useState<number>(5);
  const [xpEarned, setXpEarned] = useState<number>(10);
  const [isRevealed, setIsRevealed] = useState(initialClaim.scratchRevealed);
  const [scratchPercent, setScratchPercent] = useState(initialClaim.scratchRevealed ? 100 : 0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Poll for live merchant accept/reject status
  useEffect(() => {
    setClaim(initialClaim);
  }, [initialClaim]);

  useEffect(() => {
    // Poll claim status every 2 seconds while PENDING
    if (claim.status !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/claims/${claim.id}`);
        const data = await res.json();
        if (data.success && data.claim) {
          if (data.stampCount) setStampCount(data.stampCount);
          if (data.targetStamps) setTargetStamps(data.targetStamps);
          if (data.xpEarned) setXpEarned(data.xpEarned);

          if (data.claim.status !== claim.status) {
            setClaim(data.claim);
            if (onStatusUpdated) onStatusUpdated(data.claim);
            if (data.claim.status === 'ACCEPTED') {
              // Celebrate when cashier accepts
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

  // Canvas Scratch Card Drawing
  useEffect(() => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width;
    const h = rect.height;

    // 1. Draw Metallic Gold Scratch Coating
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#d97706'); // amber-600
    gradient.addColorStop(0.25, '#fbbf24'); // amber-400
    gradient.addColorStop(0.5, '#f59e0b'); // amber-500
    gradient.addColorStop(0.75, '#fef08a'); // light gold shimmer
    gradient.addColorStop(1, '#b45309'); // deep bronze

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Add subtle textured pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < w; i += 20) {
      for (let j = 0; j < h; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.beginPath();
          ctx.arc(i, j, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Draw Scratch Card Call to Action Text
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ RUB / SCRATCH HERE ✨', w / 2, h / 2 - 8);

    ctx.fillStyle = '#92400e';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Reveal your in-store 10% discount', w / 2, h / 2 + 16);

    // Scratching Handler Functions
    const getPos = (e: MouseEvent | TouchEvent) => {
      const b = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: clientX - b.left,
        y: clientY - b.top,
      };
    };

    const scratch = (pos: { x: number; y: number }) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
      ctx.fill();

      // Check scratched percentage
      checkScratchedPercent();
    };

    const checkScratchedPercent = () => {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const totalPixels = imgData.data.length / 4;
        let clearPixels = 0;

        // Sample every 32nd pixel for performance
        const step = 32;
        for (let i = 3; i < imgData.data.length; i += 4 * step) {
          if (imgData.data[i] === 0) {
            clearPixels++;
          }
        }

        const pct = Math.round((clearPixels / (totalPixels / step)) * 100);
        setScratchPercent(pct);

        if (pct >= 40 && !isRevealed) {
          triggerReveal();
        }
      } catch (err) {
        console.error('Error calculating scratch:', err);
      }
    };

    const triggerReveal = async () => {
      setIsRevealed(true);
      setScratchPercent(100);

      // Fireworks confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      // Notify backend
      try {
        await fetch(`/api/claims/${claim.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scratchRevealed: true }),
        });
      } catch (err) {
        console.error('Error marking scratch revealed:', err);
      }
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      isDrawingRef.current = true;
      scratch(getPos(e));
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      if (e.cancelable) e.preventDefault();
      scratch(getPos(e));
    };

    const onEnd = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);

      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isRevealed, claim.id]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Loyalty Stamp Collected Badge Header */}
      {claim.status === 'ACCEPTED' && (
        <StampCardBadge
          stampCount={stampCount}
          targetStamps={targetStamps}
          shopName={claim.shopName}
          xpEarned={xpEarned}
        />
      )}

      {/* Scratch Box Wrapper */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-50 to-white p-5 shadow-xl shadow-amber-500/10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">In-Store Scratch Offer</span>
              <div className="text-xs text-slate-600 font-medium">{claim.shopName}</div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-300">
            {claim.claimCode}
          </span>
        </div>

        {/* Scratch Area */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex flex-col items-center justify-center text-white p-6 select-none">
          
          {/* Revealed Secret Underneath */}
          <div className="text-center z-0 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>OFFER UNLOCKED</span>
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              10% FLAT OFF
            </div>
            <p className="text-xs text-amber-100 mt-1 max-w-[220px]">
              Instant deduction applied directly to your dining / shopping bill!
            </p>
            <div className="mt-3 bg-white text-amber-900 font-mono font-bold text-sm px-4 py-1.5 rounded-xl shadow-md border border-amber-200">
              CODE: {claim.claimCode}
            </div>
          </div>

          {/* The Foil Canvas & Lock Overlay */}
          {!isRevealed && claim.status === 'PENDING' && (
            <div className="absolute inset-0 z-20 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 flex flex-col items-center justify-center p-6 text-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 animate-pulse">
                <Clock className="w-6 h-6 text-yellow-200" />
              </div>
              <h4 className="text-base font-black text-white">Merchant Approval Pending</h4>
              <p className="text-xs text-amber-100 mt-1 max-w-[230px]">
                Upar shop counter par merchant aapki request verify kar raha hai. <strong>Accept hone ke baad scratch card unlock hoga!</strong>
              </p>
              <div className="mt-3 text-[11px] font-mono bg-black/20 text-amber-200 px-3 py-1 rounded-full border border-amber-400/30">
                Code: {claim.claimCode}
              </div>
            </div>
          )}

          {!isRevealed && claim.status === 'ACCEPTED' && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10 transition-opacity duration-500"
            />
          )}
        </div>

        {/* Scratch Guidance / Percentage */}
        {claim.status === 'PENDING' ? (
          <div className="mt-3 text-center text-xs font-semibold text-amber-700 animate-pulse">
            ⏳ Waiting for merchant to click &quot;Accept&quot;...
          </div>
        ) : !isRevealed ? (
          <div className="mt-3 flex items-center justify-between text-xs text-amber-800">
            <span>✨ Ungli se rub / scratch karke offer reveal karo!</span>
            <span className="font-semibold">{scratchPercent}% scratched</span>
          </div>
        ) : (
          <div className="mt-3 text-center text-xs font-semibold text-emerald-700">
            🎉 Offer revealed! Present to cashier below:
          </div>
        )}


      </div>
    </div>
  );
}
