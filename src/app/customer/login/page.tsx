'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, ArrowRight, AlertCircle, Loader2, Sparkles, Store } from 'lucide-react';

function CustomerLoginInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/customer/dashboard';

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        // Pre-fill if already saved in localStorage
        const savedName = localStorage.getItem('customer_name');
        const savedMobile = localStorage.getItem('customer_mobile');
        if (savedName) setName(savedName);
        if (savedMobile) setMobile(savedMobile);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        const trimmedName = name.trim();
        if (!trimmedName || trimmedName.length < 2) {
            setErrorMsg('Please enter your full name (at least 2 characters).');
            return;
        }

        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        if (cleanMobile.length !== 10) {
            setErrorMsg('Please enter a valid 10-digit mobile number.');
            return;
        }

        setIsLoading(true);

        // Save customer profile in localStorage
        localStorage.setItem('customer_name', trimmedName);
        localStorage.setItem('customer_mobile', cleanMobile);
        localStorage.setItem('drutoCustomer', JSON.stringify({ name: trimmedName, mobile: cleanMobile }));

        // Redirect to target or customer dashboard
        router.push(redirectUrl);
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-[#0B0F17] px-4 py-12 sm:px-6 lg:px-8 text-white selection:bg-purple-900 selection:text-purple-200 relative overflow-hidden">
            {/* Background Neon Purple Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30">
                    <User className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-white">
                    Customer Login
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400 font-medium">
                    Enter your name & mobile to view your stamp cards & rewards
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="rounded-3xl border border-violet-500/30 bg-[#161D2F] px-6 py-8 shadow-2xl shadow-purple-950/40 sm:px-10">
                    {errorMsg && (
                        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Full Name
                            </label>
                            <div className="relative mt-1.5">
                                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                    autoFocus
                                    className="w-full rounded-xl border border-violet-500/30 bg-[#0B0F17] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Mobile Number
                            </label>
                            <div className="relative mt-1.5">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-xs font-bold text-slate-500">
                                    +91
                                </span>
                                <input
                                    id="mobile"
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                    maxLength={10}
                                    required
                                    className="w-full rounded-xl border border-violet-500/30 bg-[#0B0F17] py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-400">Used to identify your stamp cards. No password or OTP required.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition border border-purple-400/30 active:scale-95 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</>
                            ) : (
                                <>Continue to Dashboard <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-violet-500/20 pt-5 text-center text-xs text-slate-400">
                        Are you a business owner?{' '}
                        <Link href="/merchant/login" className="font-bold text-purple-400 hover:underline">
                            Merchant Login →
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    <Link href="/" className="hover:underline text-slate-400">← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default function CustomerLoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        }>
            <CustomerLoginInner />
        </Suspense>
    );
}
