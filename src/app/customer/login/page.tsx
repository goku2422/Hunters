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
        <div className="flex min-h-screen flex-col justify-center bg-[#fbfbfb] px-4 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf0f0] text-[#b20d18] shadow-sm">
                    <User className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-[#101827]">
                    Customer Login
                </h2>
                <p className="mt-2 text-center text-sm text-[#6b7280]">
                    Enter your name & mobile to view your stamp cards & rewards
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="rounded-3xl border border-[#edf0f3] bg-white px-6 py-8 shadow-xl shadow-slate-200/50 sm:px-10">
                    {errorMsg && (
                        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-[#101827]">
                                Full Name
                            </label>
                            <div className="relative mt-1.5">
                                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                    autoFocus
                                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-10 pr-4 text-sm text-[#101827] outline-none transition focus:border-[#b20d18] focus:bg-white focus:ring-2 focus:ring-[#b20d18]/10"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile" className="block text-xs font-bold text-[#101827]">
                                Mobile Number
                            </label>
                            <div className="relative mt-1.5">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-xs font-bold text-[#6b7280]">
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
                                    className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-12 pr-4 font-mono text-sm text-[#101827] outline-none transition focus:border-[#b20d18] focus:bg-white focus:ring-2 focus:ring-[#b20d18]/10"
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-[#9ca3af]">Used to identify your stamp cards. No password or OTP required.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b20d18] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#b20d18]/20 transition hover:bg-[#970b14] active:scale-95 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</>
                            ) : (
                                <>Continue to Dashboard <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-[#edf0f3] pt-5 text-center text-xs text-[#6b7280]">
                        Are you a business owner?{' '}
                        <Link href="/merchant/login" className="font-bold text-[#b20d18] hover:underline">
                            Merchant Login →
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-[#9ca3af]">
                    <Link href="/" className="hover:underline">← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default function CustomerLoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb]">
                <Loader2 className="h-6 w-6 animate-spin text-[#b20d18]" />
            </div>
        }>
            <CustomerLoginInner />
        </Suspense>
    );
}
