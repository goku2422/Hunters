'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Store, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

function MerchantLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('brew@shop.com');
  const [password, setPassword] = useState('shop123');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'NotRegistered') {
      setErrorMsg('Yeh Gmail account kisi bhi shop se registered nahi hai. Admin se contact karo.');
    } else if (error === 'Deactivated') {
      setErrorMsg('Aapka merchant account deactivate kar diya gaya hai.');
    } else if (error) {
      setErrorMsg('Google login mein koi error aaya. Dobara try karo.');
    }
  }, [searchParams]);

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
      setErrorMsg('Failed to communicate with server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      await signIn('google', { callbackUrl: '/merchant/dashboard' });
    } catch (err) {
      setErrorMsg('Google login mein error aaya. Dobara try karo.');
      setIsGoogleLoading(false);
    }
  };

  const quickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B0F17] text-white selection:bg-purple-900 selection:text-purple-200 relative overflow-hidden">
      {/* Background Neon Purple Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#161D2F] rounded-3xl border border-violet-500/30 shadow-2xl shadow-purple-950/40 p-6 sm:p-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 mb-3 border border-purple-400/30">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Merchant Counter Portal</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Log in to manage scratch card claims and approve customer visits.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-violet-500/30 hover:border-purple-500/50 bg-[#0B0F17] hover:bg-[#121826] font-semibold text-sm text-slate-200 transition-all active:scale-95 disabled:opacity-50 mb-4"
        >
          {isGoogleLoading ? (
            <span className="text-slate-400">Redirecting to Google...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-violet-500/20" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-violet-500/20" />
        </div>

        {/* Email + Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Store Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] text-white rounded-xl border border-violet-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm font-medium transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] text-white rounded-xl border border-violet-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm font-medium transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-purple-400/30"
          >
            {isLoading ? <span>Signing In...</span> : (
              <>
                <span>Access Cashier Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-violet-500/20">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">Quick 1-Click Demo Logins</div>
          <div className="space-y-2">
            {[
              { label: 'Shop A: Brew & Bean Cafe', email: 'brew@shop.com', sub: 'Connaught Place' },
              { label: 'Shop B: Urban Trend Fashion', email: 'urban@shop.com', sub: 'DLF CyberHub' },
              { label: 'Shop C: Gourmet Pizza Hub', email: 'pizza@shop.com', sub: 'Bengaluru' },
            ].map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => quickLogin(demo.email, 'shop123')}
                className="w-full p-2.5 rounded-xl border border-violet-500/20 bg-[#0B0F17] hover:bg-[#121826] text-left text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-200">{demo.label}</span>
                  <div className="text-[11px] text-slate-400">{demo.email} • {demo.sub}</div>
                </div>
                <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">Select</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center"><span>Loading...</span></div>}>
      <MerchantLoginInner />
    </Suspense>
  );
}