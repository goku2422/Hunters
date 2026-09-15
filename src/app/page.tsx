'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    BarChart3,
    Check,
    X,
    Gift,
    MapPin,
    QrCode,
    Repeat2,
    ShieldCheck,
    Sparkles,
    Store,
    Trophy,
    Zap,
    User,
    AlertCircle,
    Loader2,
} from 'lucide-react';

const features = [
    { icon: QrCode, title: 'One QR Code', text: 'Print one QR code. Customers scan, stamps collect automatically. No apps to download.', color: 'red' },
    { icon: Repeat2, title: 'Repeat Visits', text: 'Customers come back to complete their stamp card. Average 40% repeat rate increase.', color: 'green' },
    { icon: BarChart3, title: 'Real-time Analytics', text: 'See daily scans, active customers, completed cards, and trends at a glance.', color: 'blue' },
    { icon: MapPin, title: 'Multi-Branch GPS', text: 'One QR code for all branches. GPS auto-detects which location the customer is at.', color: 'purple' },
    { icon: Store, title: 'AI Digital Menu', text: 'Turn your physical menu into a beautiful digital experience with QR access for all your customers.', color: 'teal' },
    { icon: Zap, title: 'Scratch Cards', text: 'Delight customers with instant digital scratch cards and surprise rewards on every scan.', color: 'orange' },
    { icon: ShieldCheck, title: 'FREE QR Stand', text: 'Every paid plan gets a free physical QR stand delivered to your store. Ready to use.', color: 'pink' },
];

const plans = [
    { name: 'Basic', oldPrice: 'INR 1999', price: 'INR 999', locations: '1 location', popular: false, features: ['1 store location', 'Digital Stamp Cards', 'AI Digital Menu', 'Scratch Cards', 'Unlimited QR scans', 'Analytics dashboard', 'FREE QR code stand'] },
    { name: 'Growth', oldPrice: 'INR 4999', price: 'INR 2499', locations: '3 locations', popular: true, features: ['Up to 3 store locations', 'Digital Stamp Cards', 'AI Digital Menu', 'Scratch Cards', 'Same QR, GPS branch detection', 'Branch-wise scan analytics', 'Priority support'] },
    { name: 'Pro', oldPrice: 'INR 9999', price: 'INR 4999', locations: '6 locations', popular: false, features: ['Up to 6 store locations', 'Digital Stamp Cards', 'AI Digital Menu', 'Scratch Cards', 'Same QR, GPS branch detection', 'Branch-wise scan analytics', 'Dedicated account manager'] },
];

function PhoneMockup({ variant }: { variant: 'dashboard' | 'reward' | 'stamps' }) {
    return (
        <div className={`absolute h-[390px] w-[205px] rounded-[30px] border-[6px] border-[#111827] bg-white shadow-2xl sm:h-[470px] sm:w-[245px] ${variant === 'dashboard' ? 'left-1/2 top-8 z-20 -translate-x-1/2' : variant === 'reward' ? 'right-0 top-16 z-10 rotate-[12deg]' : 'left-0 top-16 z-10 -rotate-[12deg]'}`}>
            <div className="absolute left-1/2 top-1.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <div className="absolute inset-x-0 top-10 bottom-0 overflow-hidden rounded-b-[24px] bg-[#f8f8f8]">
                {variant === 'dashboard' && <div className="h-40 bg-[#a70612] px-4 pt-7 text-left text-white sm:h-48 sm:px-5"><div className="text-[9px] font-bold uppercase tracking-widest opacity-70">Borcella</div><div className="mt-7 text-xl font-black sm:text-2xl">5 of 5 Stamps</div><div className="mt-3 h-1.5 rounded-full bg-white/40"><div className="h-full w-full rounded-full bg-white" /></div></div>}
                {variant === 'reward' && <div className="h-44 bg-[#d80707] px-4 pt-8 text-left text-white sm:h-56 sm:px-5"><div className="text-[9px] font-bold uppercase tracking-widest">Your reward</div><div className="mt-5 text-xl font-black sm:text-2xl">Claim Reward</div><div className="mt-2 text-[10px] text-white/80">Show this to the merchant</div></div>}
                {variant === 'stamps' && <div className="h-40 bg-[#9d0712] px-4 pt-7 text-left text-white sm:h-48 sm:px-5"><div className="text-[9px] font-bold uppercase tracking-widest opacity-70">Business Dashboard</div><div className="mt-5 grid grid-cols-3 gap-1.5"><div className="rounded-lg bg-white/15 p-2 text-center text-[8px]">36<br /><b className="text-sm">SCANS</b></div><div className="rounded-lg bg-white/15 p-2 text-center text-[8px]">3<br /><b className="text-sm">USERS</b></div><div className="rounded-lg bg-white/15 p-2 text-center text-[8px]">33%<br /><b className="text-sm">REPEAT</b></div></div></div>}
                <div className="mx-3 -mt-3 rounded-2xl bg-white p-3 text-left shadow-md sm:mx-4 sm:p-4">
                    {variant === 'stamps' ? <><div className="text-xs font-bold">Your QR Code</div><div className="mx-auto mt-3 h-28 w-28 bg-[repeating-conic-gradient(#111_0_25%,#fff_0_50%)] bg-[length:12px_12px] sm:h-36 sm:w-36" /></> : <><div className="flex items-center gap-2 text-[10px] font-bold text-[#a70612]"><Gift className="h-3.5 w-3.5" /> Your next treat</div><div className="mt-3 h-16 rounded-xl bg-[#f5eeee] sm:h-24" /><div className="mt-3 h-8 rounded-full bg-[#a70612]" /></>}
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    const [showLoginChoice, setShowLoginChoice] = useState(false);
    const [showCustomerLogin, setShowCustomerLogin] = useState(false);
    const [custName, setCustName] = useState('');
    const [custMobile, setCustMobile] = useState('');
    const [custError, setCustError] = useState('');
    const [custLoading, setCustLoading] = useState(false);

    const handleCustomerLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setCustError('');
        const trimmedName = custName.trim();
        if (!trimmedName || trimmedName.length < 2) {
            setCustError('Please enter your full name (at least 2 characters).');
            return;
        }
        const cleanMobile = custMobile.replace(/[^0-9]/g, '');
        if (cleanMobile.length !== 10) {
            setCustError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setCustLoading(true);
        localStorage.setItem('customer_name', trimmedName);
        localStorage.setItem('customer_mobile', cleanMobile);
        localStorage.setItem('drutoCustomer', JSON.stringify({ name: trimmedName, mobile: cleanMobile }));
        router.push('/customer/dashboard');
    };

    const openCustomerLogin = () => {
        try {
            const saved = localStorage.getItem('drutoCustomer');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.name && parsed.mobile) { router.push('/customer/dashboard'); return; }
            }
        } catch {}
        setShowLoginChoice(false);
        setCustName(''); setCustMobile(''); setCustError(''); setCustLoading(false);
        setShowCustomerLogin(true);
    };

    return (
        <main className="relative overflow-hidden bg-[#fbfbfb] text-[#101827]">
            <section className="relative min-h-[760px] bg-[radial-gradient(circle_at_50%_8%,rgba(254,226,226,0.6),transparent_44%)] px-5 pb-16 pt-24 text-center sm:pt-28">
                <div className="mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#f2d4d4] bg-[#fdf0f0] px-4 py-2 text-xs font-semibold text-[#b20d18]"><Store className="h-3.5 w-3.5" /> Digital loyalty for modern businesses</div>
                    <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(3rem,7vw,5.8rem)] font-black leading-[0.98] tracking-[-0.06em]">Turn every visit into a <span className="block text-[#b20d18]">repeat customer</span></h1>
                    <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#6b7280] sm:text-lg">QR-based loyalty program for cafes, salons, gyms, restaurants &amp; more.<span className="block">Set up in 2 minutes, no app download needed.</span></p>
                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button type="button" onClick={() => setShowLoginChoice(true)} className="inline-flex min-w-[198px] items-center justify-center gap-3 rounded-xl bg-[#b20d18] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#b20d18]/20 transition hover:-translate-y-0.5 hover:bg-[#970b14]">Start Free Trial <ArrowRight className="h-4 w-4" /></button>
                        <button type="button" onClick={openCustomerLogin} className="inline-flex min-w-[174px] items-center justify-center rounded-xl border border-[#e2e2e2] bg-white px-7 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5">I&apos;m a customer</button>
                    </div>
                    <p className="mt-4 text-xs text-[#858585]">Already have a business? <Link href="/merchant/login" className="font-bold text-[#b20d18] hover:underline">Sign In</Link></p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#929292]"><Check className="h-3.5 w-3.5 rounded-full bg-[#e9f5ed] p-0.5 text-[#398252]" /> 3-day free trial <span className="text-[#d1d1d1]">•</span> No payment required <span className="text-[#d1d1d1]">•</span> Cancel anytime</div>
                </div>
                <div className="relative mx-auto mt-12 h-[410px] w-full max-w-[650px] sm:mt-16 sm:h-[500px]"><PhoneMockup variant="stamps" /><PhoneMockup variant="dashboard" /><PhoneMockup variant="reward" /><div className="absolute left-1/2 top-32 z-30 -translate-x-1/2 rounded-2xl bg-white px-5 py-3 text-left shadow-xl sm:top-44"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2877ed]"><BarChart3 className="h-5 w-5 rounded-full bg-[#e8f1ff] p-1" /> Growth</div><div className="mt-1 text-sm font-black">40% More Repeats</div></div><div className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-2xl bg-white px-5 py-3 text-left shadow-xl"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d89b00]"><BarChart3 className="h-5 w-5 rounded-full bg-[#fff5dc] p-1" /> Profit</div><div className="mt-1 text-sm font-black">Boost Revenue</div></div></div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="text-center"><h2 className="text-2xl font-bold sm:text-3xl">Why businesses choose Druto</h2><p className="mt-2 text-sm text-[#718096] sm:text-base">Everything you need to boost repeat customers</p></div><div className="mt-10 grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#edf0f3] sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, text, color }) => <div key={title} className="border-b border-[#edf0f3] p-8 last:border-b-0 lg:border-r lg:last:border-r-0"><div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${color === 'red' ? 'bg-red-50 text-red-700' : color === 'green' ? 'bg-emerald-50 text-emerald-600' : color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'purple' ? 'bg-purple-50 text-purple-600' : color === 'teal' ? 'bg-teal-50 text-teal-600' : color === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-rose-50 text-rose-600'}`}><Icon className="h-5 w-5" /></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#718096]">{text}</p></div>)}</div></section>

            <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8"><div className="text-center"><h2 className="text-2xl font-bold sm:text-3xl">Set up in 3 steps</h2><p className="mt-2 text-sm text-[#718096] sm:text-base">Go live with your loyalty program today</p></div><div className="mt-10 grid gap-6 md:grid-cols-3">{[{ icon: '📝', title: 'Register Your Business', text: 'Sign up, add your business name, set your reward (e.g., 10 visits = free reward)' }, { icon: '🖨️', title: 'Display Your QR Code', text: 'Download & print your branded QR poster, or use the free QR stand we ship to you' }, { icon: '📊', title: 'Watch Customers Return', text: 'Track scans, see repeat rates, manage claimed rewards — all from your dashboard' }].map((step, index) => <div key={step.title} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#edf0f3]"><span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f8e8e8] text-sm font-bold text-[#b20d18]">{index + 1}</span><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e8e8] text-2xl">{step.icon}</div><h3 className="mt-5 max-w-[180px] text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#718096]">{step.text}</p></div>)}</div></section>

            <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><div className="rounded-3xl bg-gradient-to-br from-[#b20d18] to-[#8d0610] px-6 py-10 text-center text-white shadow-xl shadow-red-900/10 sm:px-10"><div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold"><Trophy className="h-4 w-4" /> Trusted by businesses across India</div><div className="mt-8 grid gap-8 sm:grid-cols-3"><div><div className="text-4xl font-black">500+</div><div className="mt-1 text-sm text-white/75">Active Businesses</div></div><div><div className="text-4xl font-black">50K+</div><div className="mt-1 text-sm text-white/75">Stamps Collected</div></div><div><div className="text-4xl font-black">40%</div><div className="mt-1 text-sm text-white/75">Avg. Repeat Rate Boost</div></div></div></div></section>

            <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="rounded-3xl bg-gradient-to-b from-[#b20d18] to-[#8d0610] px-4 pb-8 pt-10 sm:px-8"><div className="text-center text-white"><h2 className="text-2xl font-bold sm:text-3xl">Simple, transparent pricing</h2><p className="mt-2 text-sm text-white/70">Start free. Scale as you grow.</p></div><div className="mt-9 grid gap-4 lg:grid-cols-3">{plans.map((plan) => <div key={plan.name} className={`relative rounded-2xl bg-white p-6 text-[#101827] shadow-lg ${plan.popular ? 'ring-2 ring-[#b20d18]' : ''}`}>{plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#b20d18] px-4 py-1 text-xs font-bold text-white">Most Popular</span>}<h3 className="text-center text-lg font-bold">{plan.name}</h3><div className="mt-3 text-center"><div className="text-sm text-[#8b8b8b] line-through">{plan.oldPrice}/yr</div><div className="text-4xl font-black">{plan.price}<span className="text-sm font-normal text-[#718096]">/yr</span></div><div className="mt-2 text-sm text-[#718096]">{plan.locations}</div></div><ul className="mt-7 space-y-3 text-sm">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{feature}</li>)}</ul><Link href="/merchant/login" className={`mt-7 flex w-full items-center justify-center rounded-lg border px-4 py-3 text-sm font-bold transition ${plan.popular ? 'border-[#b20d18] bg-[#b20d18] text-white hover:bg-[#970b14]' : 'border-[#9ca3af] hover:border-[#b20d18] hover:text-[#b20d18]'}`}>Get Started</Link></div>)}</div></div></section>

            <section className="mx-auto max-w-3xl px-5 py-8 sm:px-8"><div className="text-center"><h2 className="text-2xl font-bold">Frequently asked questions</h2><p className="mt-2 text-sm text-[#718096]">Everything you need to know about Druto</p></div><div className="mt-8 space-y-4">{[{ q: 'Is Druto free for customers?', a: 'Yes! Druto is completely free for customers. They just scan your QR code and start earning rewards. No sign-up fee, no hidden charges.' }, { q: 'What types of businesses can use Druto?', a: 'Druto works for cafes, businesses, salons, gyms, car washes, retail stores, spas — any business that wants to bring customers back with rewards.' }].map((item) => <div key={item.q} className="rounded-2xl border border-[#dce1e7] bg-white p-5"><h3 className="font-bold">{item.q}</h3><p className="mt-2 text-sm leading-6 text-[#718096]">{item.a}</p></div>)}</div></section>

            <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8"><div className="rounded-3xl border border-[#f0caca] bg-white px-6 py-12 text-center shadow-sm sm:px-10"><h2 className="text-2xl font-bold sm:text-3xl">Ready to grow your business?</h2><p className="mt-3 text-[#718096]">Join 500+ businesses using Druto to increase repeat customers.</p><button type="button" onClick={() => setShowLoginChoice(true)} className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#b20d18] px-8 py-4 font-bold text-white shadow-lg shadow-[#b20d18]/20 transition hover:-translate-y-0.5 hover:bg-[#970b14]">Start Your Free Trial <ArrowRight className="h-4 w-4" /></button><p className="mt-5 text-sm text-[#718096]">Already have a business? <Link href="/merchant/login" className="font-bold text-[#b20d18]">Sign In</Link></p></div></section>

            <footer className="border-t border-[#e6e8eb] py-8 text-center text-sm text-[#718096]"><div className="flex items-center justify-center gap-2 font-bold text-[#101827]"><Sparkles className="h-4 w-4 text-[#b20d18]" /> Druto</div><p className="mt-2">Digital loyalty for modern businesses</p></footer>

            {/* Business / Customer choice modal */}
            {showLoginChoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/45 px-5 py-8" role="dialog" aria-modal="true" onClick={() => setShowLoginChoice(false)}>
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-left shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#b20d18]">Welcome to Druto</p>
                                <h2 className="mt-2 text-2xl font-black">Where would you like to go?</h2>
                                <p className="mt-2 text-sm text-[#718096]">Choose the login that matches how you want to use Druto.</p>
                            </div>
                            <button type="button" onClick={() => setShowLoginChoice(false)} className="rounded-full p-2 text-[#718096] transition hover:bg-[#f7eeee] hover:text-[#b20d18]"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="mt-7 grid gap-3">
                            <Link href="/merchant/login" className="flex items-center justify-between rounded-2xl bg-[#b20d18] px-5 py-4 text-white transition hover:bg-[#970b14]">
                                <span><span className="block font-bold">Business Login</span><span className="mt-1 block text-xs text-white/75">Manage your loyalty program and rewards</span></span>
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <button type="button" onClick={openCustomerLogin} className="flex w-full items-center justify-between rounded-2xl border border-[#e2e2e2] px-5 py-4 text-left transition hover:border-[#b20d18] hover:bg-[#fff8f8]">
                                <span><span className="block font-bold">Customer Login</span><span className="mt-1 block text-xs text-[#718096]">Scan, collect stamps, and claim rewards</span></span>
                                <ArrowRight className="h-5 w-5 text-[#b20d18]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer authentication modal */}
            {showCustomerLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/50 px-5 py-8" role="dialog" aria-modal="true" onClick={() => setShowCustomerLogin(false)}>
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-left shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fdf0f0] text-[#b20d18]"><User className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#b20d18]">Customer Login</p>
                                    <h2 className="text-lg font-black text-[#101827]">Welcome!</h2>
                                </div>
                            </div>
                            <button type="button" onClick={() => setShowCustomerLogin(false)} className="rounded-full p-2 text-[#718096] transition hover:bg-[#f7eeee] hover:text-[#b20d18]"><X className="h-5 w-5" /></button>
                        </div>

                        <p className="mt-3 text-sm text-[#718096]">Enter your name and mobile to view your stamp cards and rewards. No password or OTP needed.</p>

                        {custError && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{custError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCustomerLogin} className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="cust-name" className="mb-1.5 block text-xs font-bold text-[#101827]">Your Full Name</label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                                    <input id="cust-name" type="text" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="e.g. Rahul Sharma" required autoFocus className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-10 pr-4 text-sm text-[#101827] outline-none transition focus:border-[#b20d18] focus:bg-white focus:ring-2 focus:ring-[#b20d18]/10" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="cust-mobile" className="mb-1.5 block text-xs font-bold text-[#101827]">Mobile Number</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-xs font-bold text-[#6b7280]">+91</span>
                                    <input id="cust-mobile" type="tel" value={custMobile} onChange={(e) => setCustMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="9876543210" maxLength={10} required className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-12 pr-4 font-mono text-sm text-[#101827] outline-none transition focus:border-[#b20d18] focus:bg-white focus:ring-2 focus:ring-[#b20d18]/10" />
                                </div>
                                <p className="mt-1 text-[11px] text-[#9ca3af]">Used to identify your stamps. No OTP or spam calls.</p>
                            </div>
                            <button type="submit" disabled={custLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b20d18] py-3.5 text-sm font-bold text-white shadow-md shadow-[#b20d18]/20 transition hover:bg-[#970b14] active:scale-95 disabled:opacity-60">
                                {custLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening Dashboard...</> : <>Continue to Dashboard <ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </form>

                        <p className="mt-4 text-center text-xs text-[#9ca3af]">Are you a business? <Link href="/merchant/login" className="font-bold text-[#b20d18] hover:underline">Merchant Login →</Link></p>
                    </div>
                </div>
            )}
        </main>
    );
}
