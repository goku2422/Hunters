'use client';

import React from 'react';
import { Compass, MapPin, Radio, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface DemoSimulatorBarProps {
  currentSimulatedShopId: string | null;
  onSelectSimulation: (shopId: string | null, label: string) => void;
  detectedShopName?: string;
  resolutionMethod?: string;
}

export default function DemoSimulatorBar({
  currentSimulatedShopId,
  onSelectSimulation,
  detectedShopName,
  resolutionMethod,
}: DemoSimulatorBarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border-b border-indigo-500/30">
      <div className="max-w-4xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Common QR Proximity Simulator
              </span>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                All shops share the <strong>same printed QR</strong>. Test auto-shop resolution below:
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs text-indigo-300 hover:text-white bg-white/10 px-2 py-1 rounded"
          >
            <span>{isOpen ? 'Collapse' : 'Test Shops'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-2.5 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onSelectSimulation('shop-brew', 'Shop A (Brew & Bean Cafe)')}
                className={`text-left p-2 rounded-lg border text-xs transition-all ${
                  currentSimulatedShopId === 'shop-brew'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 font-semibold text-white">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shop A: Brew & Bean</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Connaught Place, Delhi</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectSimulation('shop-urban', 'Shop B (Urban Trend Fashion)')}
                className={`text-left p-2 rounded-lg border text-xs transition-all ${
                  currentSimulatedShopId === 'shop-urban'
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 font-semibold text-white">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shop B: Urban Trend</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">CyberHub, Gurugram</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectSimulation('shop-pizza', 'Shop C (Gourmet Pizza Hub)')}
                className={`text-left p-2 rounded-lg border text-xs transition-all ${
                  currentSimulatedShopId === 'shop-pizza'
                    ? 'bg-rose-500/30 border-rose-400 text-rose-200 ring-1 ring-rose-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 font-semibold text-white">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Shop C: Gourmet Pizza</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Indiranagar, Bengaluru</div>
              </button>

              <button
                type="button"
                onClick={() => onSelectSimulation(null, 'Real Device GPS / Counter Session')}
                className={`text-left p-2 rounded-lg border text-xs transition-all ${
                  currentSimulatedShopId === null
                    ? 'bg-blue-500/30 border-blue-400 text-blue-200 ring-1 ring-blue-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 font-semibold text-white">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Live GPS / Counter</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Auto-Detect Device</div>
              </button>
            </div>

            {detectedShopName && (
              <div className="mt-2 flex items-center justify-between text-[11px] bg-white/5 px-2.5 py-1 rounded border border-white/10">
                <span className="text-slate-300">
                  Active Resolver: <span className="font-semibold text-emerald-400">{detectedShopName}</span>
                </span>
                <span className="text-slate-400">
                  Method: <span className="text-indigo-300 uppercase font-mono">{resolutionMethod || 'AUTO'}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
