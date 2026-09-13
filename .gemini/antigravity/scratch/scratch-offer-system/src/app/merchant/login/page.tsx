'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('brew@shop.com');
  const [password, setPassword] = useState('shop123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Login failed. Please check credentials.');
        return;
      }

      router.push('/merchant/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Failed to communicate with server.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-61px)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Merchant Counter Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log in to manage scratch card claims and accept customer discounts.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Store Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <span>Signing In...</span> : (
              <>
                <span>Access Cashier Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick 1-Click Demo Logins
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => quickLogin('brew@shop.com', 'shop123')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-slate-800">Shop A: Brew & Bean Cafe</span>
                <div className="text-[11px] text-slate-500">brew@shop.com • Connaught Place</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Select
              </span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('urban@shop.com', 'shop123')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-slate-800">Shop B: Urban Trend Fashion</span>
                <div className="text-[11px] text-slate-500">urban@shop.com • DLF CyberHub</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Select
              </span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('pizza@shop.com', 'shop123')}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-xs flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-slate-800">Shop C: Gourmet Pizza Hub</span>
                <div className="text-[11px] text-slate-500">pizza@shop.com • Bengaluru</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Select
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
