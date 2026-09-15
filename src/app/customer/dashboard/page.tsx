'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
    Gift,
    Home,
    MapPin,
    QrCode,
    ScanLine,
    UserRound,
    Zap,
    ChevronRight,
    LogOut,
    Phone,
    Store,
    Camera,
    AlertCircle,
    Search,
    Navigation,
    RefreshCw,
    Check,
    Loader2,
} from 'lucide-react';
import type { Claim } from '@/types';

type Tab = 'home' | 'explore' | 'rewards' | 'profile' | 'scan' | 'card';
type Customer = { name: string; mobile: string };
type CustomerShop = { id: string; name: string; category: string; address: string; phone: string; slug?: string };

export default function CustomerDashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [customer, setCustomer] = useState<Customer>({ name: 'Suraj', mobile: '' });
    const [claims, setClaims] = useState<Claim[]>([]);
    const [shops, setShops] = useState<CustomerShop[]>([]);
    const [selectedShop, setSelectedShop] = useState<CustomerShop | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let name = window.localStorage.getItem('customer_name') || '';
        let mobile = window.localStorage.getItem('customer_mobile') || '';
        
        if (!name || !mobile) {
            const savedCustomer = window.localStorage.getItem('drutoCustomer');
            if (savedCustomer) {
                try {
                    const parsed = JSON.parse(savedCustomer) as Partial<Customer>;
                    if (parsed.name) name = parsed.name;
                    if (parsed.mobile) mobile = parsed.mobile;
                } catch {}
            }
        }
        if (mobile) {
            setCustomer({ name: name || 'Customer', mobile });
        }
    }, []);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [shopsResponse, claimsResponse] = await Promise.all([
                    fetch('/api/customer/shops'),
                    customer.mobile ? fetch(`/api/claims?mobile=${encodeURIComponent(customer.mobile)}`) : Promise.resolve(null),
                ]);
                const shopsData = await shopsResponse.json();
                if (shopsData.success) setShops(shopsData.shops);
                if (claimsResponse) {
                    const claimsData = await claimsResponse.json();
                    if (claimsData.success) setClaims(claimsData.claims);
                }
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, [customer.mobile]);

    const activeClaims = claims.filter((claim) => claim.status !== 'REJECTED');
    const firstName = customer.name.split(' ')[0];

    const selectTab = (tab: Tab) => setActiveTab(tab);

    return (
        <main className="min-h-screen bg-[#f8f9f9] pb-28 text-[#142033]">
            {activeTab === 'home' && <HomeHeader customerName={firstName} />}

            <section className="px-5 pt-6">
                {activeTab === 'home' && <HomeView claims={activeClaims} shops={shops} loading={loading} onExplore={() => selectTab('explore')} onRewards={() => selectTab('rewards')} onScan={() => selectTab('scan')} onStartCard={(shop) => { window.location.href = `/card/${shop.slug || shop.id || 'brew-and-bean'}`; }} />}
                {activeTab === 'explore' && <ExploreViewNew shops={shops} loading={loading} onStartCard={(shop) => { window.location.href = `/card/${shop.slug || shop.id || 'brew-and-bean'}`; }} />}
                {activeTab === 'rewards' && <RewardsView claims={activeClaims} />}
                {activeTab === 'profile' && <ProfileView customer={customer} onLogout={() => { window.localStorage.removeItem('drutoCustomer'); window.localStorage.removeItem('customer_name'); window.localStorage.removeItem('customer_mobile'); window.location.href = '/customer/login'; }} />}
                {activeTab === 'scan' && <ScanView onBackHome={() => selectTab('home')} />}
                {activeTab === 'card' && selectedShop && <StampCardView shop={selectedShop} onBackHome={() => selectTab('home')} />}
            </section>

            <BottomNav activeTab={activeTab} onSelect={selectTab} />
        </main>
    );
}

function HomeHeader({ customerName }: { customerName: string }) {
    return <section className="rounded-b-[28px] bg-gradient-to-br from-[#a80713] to-[#c71924] px-5 pb-7 pt-7 text-white shadow-lg shadow-red-900/10"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-xs font-black">Druto</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-white/75">Good afternoon,</p><h1 className="text-base font-black">{customerName}</h1></div></div><h2 className="mt-6 text-lg font-black">Collect stamps &amp; win rewards.</h2><p className="mt-1 text-sm text-white/80">Start a card below, or scan the QR at the counter.</p></section>;
}

function HomeView({ claims, shops, loading, onExplore, onRewards, onScan, onStartCard }: { claims: Claim[]; shops: CustomerShop[]; loading: boolean; onExplore: () => void; onRewards: () => void; onScan: () => void; onStartCard: (shop: CustomerShop) => void }) {
    return <><button type="button" onClick={onScan} className="mt-5 flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition hover:ring-[#e8b5b5]"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbe5e5] text-[#b20d18]"><ScanLine className="h-6 w-6" /></span><span><span className="block text-sm font-bold">At a shop right now?</span><span className="mt-1 block text-xs text-[#8390a2]">Scan the QR at the counter to collect your first stamp.</span></span><ChevronRight className="ml-auto h-5 w-5 text-[#b20d18]" /></button><div className="mt-7 flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#718096]">Start a card</h2><button type="button" onClick={onExplore} className="text-xs font-bold text-[#b20d18]">See all</button></div><div className="mt-3 space-y-3">{loading ? <div className="rounded-2xl bg-white p-5 text-sm text-[#8390a2]">Loading cards...</div> : shops.slice(0, 4).map((shop) => <div key={shop.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fbe5e5] text-lg font-bold text-[#b20d18]">{shop.name.charAt(0)}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{shop.name}</h3><p className="mt-1 text-xs font-semibold text-[#b20d18]">8 visits → Rewards</p><p className="mt-1 truncate text-[11px] text-[#8390a2]">{shop.category}</p></div><button type="button" onClick={() => onStartCard(shop)} className="rounded-full border-2 border-[#b20d18] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#b20d18] transition hover:bg-[#b20d18] hover:text-white">Start</button></div>)}{!loading && shops.length === 0 && <EmptyState />}</div>{claims.length > 0 && <button type="button" onClick={onRewards} className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#fff8f8] p-4 text-left text-sm font-bold text-[#b20d18]">View your active rewards <ChevronRight className="h-5 w-5" /></button>}</>;
}

function ExploreViewNew({ shops, loading, onStartCard }: { shops: CustomerShop[]; loading: boolean; onStartCard: (shop: CustomerShop) => void }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const categories = ['All', 'Bakery', 'Bar', 'Bookstore', 'Cafe', 'Clothing', 'Electronics', 'Grocery', 'Gym', 'Hotel'];
    const visibleShops = shops.filter((shop) => (category === 'All' || shop.category.toLowerCase().includes(category.toLowerCase())) && shop.name.toLowerCase().includes(query.toLowerCase()));

    return <div className="-mx-5 -mt-6 min-h-[620px] bg-[#f6f7f8] pb-8"><section className="rounded-b-[28px] bg-gradient-to-br from-[#a80713] to-[#c71924] px-5 pb-8 pt-8 text-white"><h1 className="text-3xl font-black">Explore</h1><p className="mt-2 text-sm text-white/80">Find new favorites near you</p></section><button type="button" onClick={() => navigator.geolocation?.getCurrentPosition(() => alert('Location enabled for nearby businesses.'))} className="mx-4 -mt-4 flex w-[calc(100%-32px)] items-center justify-center gap-2 rounded-full border-2 border-slate-700 bg-white py-3 text-sm font-bold text-[#b20d18] shadow-sm"><Navigation className="h-4 w-4" /> Use my current location</button><div className="mx-4 mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm"><Search className="h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find businesses near you" className="w-full text-sm outline-none placeholder:text-slate-400" /></div><div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${category === item ? 'border-[#b20d18] bg-[#b20d18] text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{item}</button>)}</div><div className="mt-7 flex items-center justify-between px-4"><h2 className="text-base font-bold">Trending Near You</h2><button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="text-xs font-bold text-[#b20d18]">View all</button></div><div className="mt-4 space-y-3 px-4">{loading ? <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">Loading businesses...</div> : visibleShops.map((shop) => <div key={shop.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbe5e5] text-lg">📦</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{shop.name} <span className="text-[#b20d18]">✓</span></h3><p className="mt-1 text-xs text-[#b20d18]">Win: Loyalty reward</p></div><button type="button" onClick={() => onStartCard(shop)} className="text-xs font-bold uppercase tracking-wider text-emerald-500">Open</button></div>)}{!loading && visibleShops.length === 0 && <EmptyState />}</div></div>;
}

function RewardsView({ claims }: { claims: Claim[] }) {
    return <div><h2 className="text-base font-bold">All Rewards</h2><p className="mt-1 text-sm text-[#8390a2]">Your collected rewards and visits.</p><div className="mt-5 space-y-3">{claims.length === 0 ? <EmptyState /> : claims.map((claim) => <ClaimRow key={claim.id} claim={claim} />)}</div></div>;
}

function ProfileView({ customer, onLogout }: { customer: Customer; onLogout: () => void }) {
    return <div><h2 className="text-base font-bold">Profile</h2><div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fbe5e5] text-xl font-black text-[#b20d18]">{customer.name.charAt(0).toUpperCase()}</div><h3 className="mt-4 text-lg font-bold">{customer.name}</h3><p className="mt-1 flex items-center gap-2 text-sm text-[#718096]"><Phone className="h-4 w-4" /> +91 {customer.mobile || 'Not available'}</p></div><button type="button" onClick={onLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#f0caca] bg-white py-3 text-sm font-bold text-[#b20d18]"><LogOut className="h-4 w-4" /> Log out</button></div>;
}

function ScanView({ onBackHome }: { onBackHome: () => void }) {
    const [cameraError, setCameraError] = useState(false);
    const [cameraErrorMessage, setCameraErrorMessage] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const scannerRef = useRef<any>(null);

    const handleQrSuccess = (decodedText: string) => {
        if (scannedResult) return;
        setScannedResult(decodedText);

        let target = decodedText.trim();
        // 1. Full URL case
        if (target.startsWith('http://') || target.startsWith('https://')) {
            try {
                const url = new URL(target);
                window.location.href = url.pathname + url.search;
                return;
            } catch {}
        }
        // 2. JSON case
        if (target.startsWith('{')) {
            try {
                const parsed = JSON.parse(target);
                const id = parsed.slug || parsed.merchantId || parsed.shopId || parsed.id;
                if (id) {
                    window.location.href = `/card/${encodeURIComponent(id)}`;
                    return;
                }
            } catch {}
        }
        // 3. Merchant ID or Shop Slug
        window.location.href = `/card/${encodeURIComponent(target)}`;
    };

    const startScanner = async () => {
        setCameraError(false);
        setCameraErrorMessage('');
        setIsScanning(true);

        const elementId = 'reader-container';

        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            if (scannerRef.current) {
                try {
                    if (scannerRef.current.isScanning) {
                        await scannerRef.current.stop();
                    }
                    scannerRef.current.clear();
                } catch {}
            }

            const html5QrCode = new Html5Qrcode(elementId);
            scannerRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 230, height: 230 },
            };

            // Try environment camera first
            try {
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    config,
                    handleQrSuccess,
                    () => {}
                );
            } catch (envError) {
                // Fallback to front camera or default camera (e.g. laptop webcam)
                try {
                    await html5QrCode.start(
                        { facingMode: 'user' },
                        config,
                        handleQrSuccess,
                        () => {}
                    );
                } catch (userError) {
                    const cameras = await Html5Qrcode.getCameras();
                    if (cameras && cameras.length > 0) {
                        await html5QrCode.start(
                            cameras[0].id,
                            config,
                            handleQrSuccess,
                            () => {}
                        );
                    } else {
                        throw new Error('No camera found on this device.');
                    }
                }
            }
        } catch (err: any) {
            console.error('Camera Scanner Error:', err);
            setCameraError(true);
            setIsScanning(false);
            setCameraErrorMessage(
                err?.message || 'Could not access camera. Please allow camera permissions in your browser.'
            );
        }
    };

    useEffect(() => {
        startScanner();

        return () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.isScanning) {
                        scannerRef.current.stop().catch(() => {}).finally(() => {
                            try { scannerRef.current.clear(); } catch {}
                        });
                    }
                } catch {}
            }
        };
    }, []);

    const submitManualId = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = restaurantId.trim();
        if (trimmed) {
            window.location.href = `/card/${encodeURIComponent(trimmed)}`;
        }
    };

    return (
        <div className="min-h-[590px] px-2 pt-2 text-center">
            <h1 className="text-[30px] font-black tracking-[-0.04em]">Scan QR</h1>
            <p className="mt-2 text-sm text-[#718096]">Point your camera at the merchant QR code</p>

            {/* Scanner Container */}
            <div className="relative mx-auto mt-6 flex min-h-[330px] max-w-[360px] flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed border-[#ccd5df] bg-[#f0f1f1]">
                <div id="reader-container" className="h-full w-full overflow-hidden rounded-[22px]" />

                {scannedResult && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-950/85 text-white p-4">
                        <Check className="h-12 w-12 text-emerald-400" />
                        <p className="mt-2 text-base font-bold">QR Code Scanned!</p>
                        <p className="mt-1 text-xs text-emerald-200">Opening merchant stamp card...</p>
                    </div>
                )}

                {cameraError && (
                    <div className="p-6 text-center">
                        <Camera className="mx-auto h-12 w-12 text-[#9aa7b8]" />
                        <p className="mt-4 text-sm font-bold text-[#101827]">Camera Stream Failed</p>
                        <p className="mt-2 text-xs leading-5 text-[#667085]">
                            {cameraErrorMessage || 'Unable to access camera. Please check permissions.'}
                        </p>
                        <button
                            type="button"
                            onClick={startScanner}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#b20d18] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#970b14]"
                        >
                            <RefreshCw className="h-3.5 w-3.5" /> Retry Camera Access
                        </button>
                    </div>
                )}
            </div>

            {cameraError && (
                <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#ff4b4b]">
                    <AlertCircle className="h-4 w-4 shrink-0" /> Unable to access camera. Please enter the ID manually.
                </p>
            )}

            {/* Manual Entry Fallback */}
            <form onSubmit={submitManualId} className="mx-auto mt-5 flex max-w-[350px] gap-2">
                <input
                    value={restaurantId}
                    onChange={(event) => setRestaurantId(event.target.value)}
                    placeholder="Enter Restaurant / Shop ID"
                    className="min-w-0 flex-1 rounded-xl border-0 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-1 ring-slate-200 focus:ring-[#b20d18]"
                />
                <button type="submit" className="rounded-xl bg-[#b20d18] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#970b14]">
                    Submit
                </button>
            </form>

            <button type="button" onClick={onBackHome} className="mt-4 text-xs font-bold text-[#b20d18]">
                Back to Home
            </button>
        </div>
    );
}

function StampCardView({ shop, onBackHome }: { shop: CustomerShop; onBackHome: () => void }) {
    const [activeSection, setActiveSection] = useState<'rewards' | 'menu'>('rewards');
    useEffect(() => {
        const handleMenuClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.textContent?.trim() === '🍴 Menu') {
                setActiveSection('menu');
                window.alert(`${shop.name} Menu\n\nFresh Juice - Rs 120\nClassic Cold Coffee - Rs 160\nSignature Sandwich - Rs 220`);
            }
        };
        document.addEventListener('click', handleMenuClick);
        return () => document.removeEventListener('click', handleMenuClick);
    }, [shop.name]);
    return <div className="-mx-5 -mt-6 min-h-[620px] bg-[#f6f7f8] pb-10"><section className="rounded-b-[28px] bg-gradient-to-br from-[#a80713] to-[#c71924] px-5 pb-7 pt-7 text-white shadow-lg shadow-red-900/10"><button type="button" onClick={onBackHome} className="text-xs font-bold text-white/80">← Back</button><div className="mt-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-[#b20d18]">{shop.name.charAt(0)}</div><h1 className="text-lg font-black">{shop.name}</h1></div><p className="mt-8 text-3xl font-black">0 of 8 Stamps</p><div className="mt-7 h-2 rounded-full bg-white/25"><div className="h-full w-0 rounded-full bg-white" /></div></section><div className="mx-4 -mt-4 grid grid-cols-2 overflow-hidden rounded-full bg-white shadow-sm"><button type="button" className="rounded-full bg-[#a80713] py-3 text-sm font-bold text-white"><Gift className="mr-2 inline h-4 w-4" /> Rewards</button><button type="button" className="py-3 text-sm font-semibold text-slate-500">🍴 Menu</button></div><section className="mx-4 mt-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f8e6e6] text-2xl">🎁</div><div className="flex-1"><h2 className="text-sm font-bold">Get 5% discount on your total bill after 8 visits</h2><p className="mt-1 text-[10px] font-bold text-[#b20d18]">8 STAMPS <span className="font-normal text-slate-400">• Collect 8 more</span></p></div><span className="text-[10px] font-bold text-slate-700">30 DAY Expiry</span></section><section className="mx-4 mt-7 rounded-2xl bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stamp Card</p><div className="mt-5 flex justify-between gap-1">{Array.from({ length: 8 }, (_, index) => <div key={index} className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed text-lg font-bold ${index === 7 ? 'border-[#ff7777] bg-[#fff0f0] text-[#ff7777]' : 'border-[#d7dee8] text-[#e2e6ec]'}`}>{index === 7 ? <Gift className="h-5 w-5" /> : index + 1}</div>)}</div><p className="mt-6 text-center text-slate-500 text-sm">You&apos;re <span className="font-bold text-[#b20d18]">8 stamps</span> away from <span className="font-bold text-[#b20d18]">5% discount on your total bill after 8 visits</span></p></section><section className="mx-4 mt-7"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Info</p><div className="mt-3 rounded-2xl bg-white p-4 text-sm"><p className="font-bold">{shop.name}</p><p className="mt-1 text-xs text-slate-500">{shop.category}</p><p className="mt-3 flex items-center gap-2 text-xs text-slate-600"><MapPin className="h-4 w-4 text-[#b20d18]" /> {shop.address}</p></div></section></div>;
}

function ClaimRow({ claim }: { claim: Claim }) {
    return <div className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">{claim.offerTitle}</h3><p className="mt-1 text-xs text-[#8390a2]">{claim.shopName}</p></div><span className="rounded-full bg-[#fff0f0] px-2.5 py-1 text-[10px] font-bold text-[#b20d18]">{claim.discountPercent}% OFF</span></div><p className="mt-3 text-xs text-[#667085]">Status: <span className="font-bold text-emerald-600">{claim.status}</span></p></div>;
}

function EmptyState() { return <div className="py-20 text-center"><div className="text-3xl">🎁</div><p className="mt-3 text-sm font-bold">No rewards yet</p><p className="mt-1 text-xs text-[#8390a2]">Scan a store QR code to begin.</p></div>; }
function BottomNav({ activeTab, onSelect }: { activeTab: Tab; onSelect: (tab: Tab) => void }) { return <nav className="fixed bottom-4 left-1/2 z-30 flex h-[70px] w-[calc(100%-32px)] max-w-[385px] -translate-x-1/2 items-center justify-between rounded-full bg-white px-4 shadow-xl shadow-slate-300/40 ring-1 ring-slate-100"><NavButton icon={<Home className="h-5 w-5" />} label="Home" active={activeTab === 'home'} onClick={() => onSelect('home')} /><NavButton icon={<MapPin className="h-5 w-5" />} label="Explore" active={activeTab === 'explore'} onClick={() => onSelect('explore')} /><button type="button" aria-label="Scan QR code" onClick={() => onSelect('scan')} className="-mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#b20d18] text-white shadow-lg shadow-red-900/30 ring-8 ring-[#f8f9f9]"><QrCode className="h-6 w-6" /></button><NavButton icon={<Gift className="h-5 w-5" />} label="Rewards" active={activeTab === 'rewards'} onClick={() => onSelect('rewards')} /><NavButton icon={<UserRound className="h-5 w-5" />} label="Profile" active={activeTab === 'profile'} onClick={() => onSelect('profile')} /></nav>; }
function NavButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg ${active ? 'border-2 border-[#142033] text-[#b20d18]' : 'text-[#9aa4b4]'}`}>{icon}<span className="mt-1 text-[9px] font-bold uppercase">{label}</span></button>; }
