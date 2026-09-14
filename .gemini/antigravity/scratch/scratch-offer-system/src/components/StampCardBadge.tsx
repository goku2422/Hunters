"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";

interface StampCardBadgeProps {
  stampCount: number;
  targetStamps?: number;
  shopName: string;
  xpEarned?: number;
}

export default function StampCardBadge({
  stampCount = 1,
  targetStamps = 5,
  shopName,
  xpEarned = 10,
}: StampCardBadgeProps) {
  const currentStamp = Math.min(Math.max(1, stampCount), targetStamps);
  const remainingStamps = Math.max(0, targetStamps - currentStamp);

  return (
    <div className="w-full bg-[#fdf8f4] rounded-3xl p-6 shadow-xl border border-amber-900/10 text-center flex flex-col items-center mb-5 font-sans animate-fade-in">
      {/* Central Stamp Checkmark Badge */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full bg-[#7a0c1e] border-4 border-dashed border-[#a61c31] flex items-center justify-center shadow-lg shadow-[#7a0c1e]/20 transition-transform hover:scale-105">
          <Check className="w-12 h-12 text-white stroke-[3.5]" />
        </div>
        {/* Number Badge Overlay */}
        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-md border-2 border-[#7a0c1e] flex items-center justify-center font-black text-[#7a0c1e] text-base">
          {currentStamp}
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 justify-center">
        Stamp #{currentStamp} Collected! 🎉
      </h3>

      {/* Shop Name */}
      <p className="text-xs font-semibold text-slate-500 mt-1 mb-4">
        at <span className="text-slate-800 font-bold">{shopName}</span>
      </p>

      {/* Pill Badges Container */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full max-w-xs mb-5">
        {/* Remaining Stamps Pill */}
        <div className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#f6e9e6] border border-[#e8d5d1] text-[#7a0c1e] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#a61c31] animate-pulse" />
          <span>
            {remainingStamps > 0
              ? `${remainingStamps} more stamp${remainingStamps > 1 ? "s" : ""} until reward!`
              : "🎉 Reward unlocked!"}
          </span>
        </div>

        {/* XP Pill */}
        <div className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#f6e9e6] border border-[#e8d5d1] text-[#7a0c1e] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#a61c31]" />
          <span>+{xpEarned} XP</span>
        </div>
      </div>

      {/* 5-Stamp Visual Tracker Row */}
      <div className="w-full max-w-xs pt-3 border-t border-amber-900/10">
        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
          Your Loyalty Progress ({currentStamp}/{targetStamps})
        </div>
        <div className="flex items-center justify-between gap-2">
          {Array.from({ length: targetStamps }).map((_, idx) => {
            const stampNum = idx + 1;
            const isDone = stampNum <= currentStamp;
            return (
              <div
                key={idx}
                className={`flex-1 aspect-square rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? "bg-[#7a0c1e] text-white shadow-sm ring-2 ring-[#7a0c1e]/30 scale-105"
                    : "bg-amber-100/40 text-amber-900/40 border-2 border-dashed border-amber-900/20"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stampNum}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}