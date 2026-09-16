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
    const [customer, setCustomer] = useState<Customer>({ name: 'Customer', mobile: '' });
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
        <main className="min-h-screen bg-[#0B0F17] pb-28 text-white selection:bg-purple-900 selection:text-purple-200">
            {activeTab === 'home' && <HomeHeader customerName={firstName} />}

            <section className="px-5 pt-6 max-w-md mx-auto">
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
    return (
        <section className="rounded-b-[32px] bg-gradient-to-br from-violet-900 via-purple-900 to-[#161D2F] px-5 pb-8 pt-8 text-white shadow-xl shadow-purple-950/30 border-b border-purple-500/30">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/40 bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-black text-sm shadow-md">
                        F
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200/80">Welcome back,</p>
                        <h1 className="text-lg font-black text-white">{customerName}</h1>
                    </div>
                </div>
                <h2 className="mt-6 text-xl font-black text-white">Collect stamps &amp; win rewards.</h2>
                <p className="mt-1 text-xs text-purple-200/80 font-medium">Start a card below, or scan the QR at the counter.</p>
            </div>
        </section>
    );
}

function HomeView({ claims, shops, loading, onExplore, onRewards, onScan, onStartCard }: { claims: Claim[]; shops: CustomerShop[]; loading: boolean; onExplore: () => void; onRewards: () => void; onScan: () => void; onStartCard: (shop: CustomerShop) => void }) {
    return (
        <>
            <button
                type="button"
                onClick={onScan}
                className="mt-5 flex w-full items-center gap-4 rounded-2xl bg-[#161D2F] p-4 text-left shadow-lg border border-violet-500/30 transition hover:border-purple-500/50"
            >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ScanLine className="h-6 w-6" />
                </span>
                <span>
                    <span className="block text-sm font-bold text-white">At a shop right now?</span>
                    <span className="mt-0.5 block text-xs text-slate-400">Scan the QR at the counter to collect your first stamp.</span>
                </span>
                <ChevronRight className="ml-auto h-5 w-5 text-purple-400" />
            </button>

            <div className="mt-7 flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-300/70">Start a card</h2>
                <button type="button" onClick={onExplore} className="text-xs font-bold text-purple-400 hover:text-purple-300">See all</button>
            </div>

            <div className="mt-3 space-y-3">
                {loading ? (
                    <div className="rounded-2xl bg-[#161D2F] p-5 text-xs font-medium text-slate-400 border border-violet-500/20">Loading store cards...</div>
                ) : (
                    shops.slice(0, 4).map((shop) => (
                        <div key={shop.id} className="flex items-center gap-3 rounded-2xl bg-[#161D2F] p-4 shadow-md border border-violet-500/20">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 text-lg font-bold text-white shadow-sm">
                                {shop.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-bold text-white">{shop.name}</h3>
                                <p className="mt-0.5 text-xs font-semibold text-purple-300">Collect Stamps → Win Rewards</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">{shop.category}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onStartCard(shop)}
                                className="rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white transition"
                            >
                                Start
                            </button>
                        </div>
                    ))
                )}
                {!loading && shops.length === 0 && <EmptyState />}
            </div>

            {claims.length > 0 && (
                <button
                    type="button"
                    onClick={onRewards}
                    className="mt-5 flex w-full items-center justify-between rounded-2xl bg-purple-950/40 border border-purple-500/30 p-4 text-left text-sm font-bold text-purple-300"
                >
                    View your active rewards <ChevronRight className="h-5 w-5" />
                </button>
            )}
        </>
    );
}

function ExploreViewNew({ shops, loading, onStartCard }: { shops: CustomerShop[]; loading: boolean; onStartCard: (shop: CustomerShop) => void }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const categories = ['All', 'Bakery', 'Bar', 'Bookstore', 'Cafe', 'Clothing', 'Electronics', 'Grocery', 'Gym', 'Hotel'];
    const visibleShops = shops.filter((shop) => (category === 'All' || shop.category.toLowerCase().includes(category.toLowerCase())) && shop.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="-mx-5 -mt-6 min-h-[620px] bg-[#0B0F17] pb-8 text-white">
            <section className="rounded-b-[32px] bg-gradient-to-br from-violet-900 via-purple-900 to-[#161D2F] px-5 pb-8 pt-8 text-white shadow-xl border-b border-purple-500/30">
                <h1 className="text-3xl font-black">Explore</h1>
                <p className="mt-1.5 text-xs text-purple-200/80 font-medium">Find new favorite stores near you</p>
            </section>

            <button
                type="button"
                onClick={() => navigator.geolocation?.getCurrentPosition(() => alert('Location enabled for nearby businesses.'))}
                className="mx-4 -mt-4 flex w-[calc(100%-32px)] items-center justify-center gap-2 rounded-full border border-purple-400/40 bg-[#161D2F] py-3 text-xs font-bold text-purple-300 shadow-md hover:bg-[#1E2638]"
            >
                <Navigation className="h-4 w-4 text-purple-400" /> Use my current location
            </button>

            <div className="mx-4 mt-4 flex items-center gap-2 rounded-full bg-[#161D2F] border border-violet-500/30 px-4 py-3 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Find businesses near you"
                    className="w-full text-sm outline-none bg-transparent text-white placeholder:text-slate-500"
                />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {categories.map((item) => (
                    <button
                        type="button"
                        key={item}
                        onClick={() => setCategory(item)}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                            category === item
                                ? 'border-purple-400/50 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                                : 'border-violet-500/20 bg-[#161D2F] text-slate-300 hover:bg-[#1E2638]'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="mt-7 flex items-center justify-between px-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-300/80">Trending Near You</h2>
                <button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="text-xs font-bold text-purple-400">View all</button>
            </div>

            <div className="mt-4 space-y-3 px-4">
                {loading ? (
                    <div className="rounded-2xl bg-[#161D2F] p-5 text-xs text-slate-400 border border-violet-500/20">Loading businesses...</div>
                ) : (
                    visibleShops.map((shop) => (
                        <div key={shop.id} className="flex items-center gap-3 rounded-2xl bg-[#161D2F] p-4 shadow-md border border-violet-500/20">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-base">
                                📦
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-bold text-white">{shop.name} <span className="text-purple-400">✓</span></h3>
                                <p className="mt-0.5 text-xs text-purple-300 font-semibold">Win: Loyalty reward</p>
                            </div>
                            <button type="button" onClick={() => onStartCard(shop)} className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300">Open</button>
                        </div>
                    ))
                )}
                {!loading && visibleShops.length === 0 && <EmptyState />}
            </div>
        </div>
    );
}

function RewardsView({ claims }: { claims: Claim[] }) {
    return (
        <div>
            <h2 className="text-base font-bold text-white">All Rewards</h2>
            <p className="mt-1 text-xs text-slate-400 font-medium">Your collected rewards and visits.</p>
            <div className="mt-5 space-y-3">
                {claims.length === 0 ? <EmptyState /> : claims.map((claim) => <ClaimRow key={claim.id} claim={claim} />)}
            </div>
        </div>
    );
}

function ProfileView({ customer, onLogout }: { customer: Customer; onLogout: () => void }) {
    return (
        <div>
            <h2 className="text-base font-bold text-white">Profile</h2>
            <div className="mt-5 rounded-2xl bg-[#161D2F] p-5 shadow-lg border border-violet-500/30 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 text-2xl font-black text-white shadow-md">
                    {customer.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{customer.name}</h3>
                <p className="mt-1 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-purple-400" /> +91 {customer.mobile || 'Not available'}
                </p>
            </div>
            <button
                type="button"
                onClick={onLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
            >
                <LogOut className="h-4 w-4" /> Log out
            </button>
        </div>
    );
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
                // Fallback to front camera or default camera
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
        <div className="min-h-[590px] px-2 pt-2 text-center text-white">
            <h1 className="text-2xl font-black tracking-tight">Scan Merchant QR</h1>
            <p className="mt-1 text-xs text-slate-400 font-medium">Point your camera at the merchant QR code</p>

            {/* Scanner Container */}
            <div className="relative mx-auto mt-6 flex min-h-[330px] max-w-[360px] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-violet-500/40 bg-[#161D2F]">
                <div id="reader-container" className="h-full w-full overflow-hidden rounded-2xl" />

                {scannedResult && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-violet-950/90 text-white p-4">
                        <Check className="h-12 w-12 text-purple-400" />
                        <p className="mt-2 text-base font-bold">QR Code Scanned!</p>
                        <p className="mt-1 text-xs text-purple-200">Opening merchant stamp card...</p>
                    </div>
                )}

                {cameraError && (
                    <div className="p-6 text-center">
                        <Camera className="mx-auto h-12 w-12 text-slate-500" />
                        <p className="mt-4 text-sm font-bold text-white">Camera Stream Failed</p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            {cameraErrorMessage || 'Unable to access camera. Please check permissions.'}
                        </p>
                        <button
                            type="button"
                            onClick={startScanner}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md border border-purple-400/30"
                        >
                            <RefreshCw className="h-3.5 w-3.5" /> Retry Camera Access
                        </button>
                    </div>
                )}
            </div>

            {cameraError && (
                <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" /> Unable to access camera. Please enter the ID manually.
                </p>
            )}

            {/* Manual Entry Fallback */}
            <form onSubmit={submitManualId} className="mx-auto mt-5 flex max-w-[350px] gap-2">
                <input
                    value={restaurantId}
                    onChange={(event) => setRestaurantId(event.target.value)}
                    placeholder="Enter Shop Slug / ID"
                    className="min-w-0 flex-1 rounded-xl border border-violet-500/30 bg-[#161D2F] px-4 py-3 text-xs text-white shadow-sm outline-none focus:border-purple-500"
                />
                <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-xs font-bold text-white shadow-md border border-purple-400/30">
                    Submit
                </button>
            </form>

            <button type="button" onClick={onBackHome} className="mt-4 text-xs font-bold text-purple-400 hover:underline">
                Back to Home
            </button>
        </div>
    );
}

function StampCardView({ shop, onBackHome }: { shop: CustomerShop; onBackHome: () => void }) {
    return (
        <div className="-mx-5 -mt-6 min-h-[620px] bg-[#0B0F17] pb-10 text-white">
            <section className="rounded-b-[32px] bg-gradient-to-br from-violet-900 via-purple-900 to-[#161D2F] px-5 pb-7 pt-7 text-white shadow-xl border-b border-purple-500/30">
                <button type="button" onClick={onBackHome} className="text-xs font-bold text-purple-200">← Back</button>
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-purple-700 shadow-md">
                        {shop.name.charAt(0)}
                    </div>
                    <h1 className="text-lg font-black">{shop.name}</h1>
                </div>
            </section>
        </div>
    );
}

function ClaimRow({ claim }: { claim: Claim }) {
    return (
        <div className="w-full rounded-2xl bg-[#161D2F] p-4 text-left shadow-md border border-violet-500/20">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white">{claim.offerTitle}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">{claim.shopName}</p>
                </div>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                    {claim.discountPercent}% OFF
                </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">
                Status: <span className="font-bold text-purple-400">{claim.status}</span>
            </p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="py-20 text-center text-slate-400">
            <div className="text-3xl">🎁</div>
            <p className="mt-3 text-sm font-bold text-white">No rewards yet</p>
            <p className="mt-1 text-xs text-slate-400">Scan a store QR code to begin.</p>
        </div>
    );
}

function BottomNav({ activeTab, onSelect }: { activeTab: Tab; onSelect: (tab: Tab) => void }) {
    return (
        <nav className="fixed bottom-4 left-1/2 z-30 flex h-[70px] w-[calc(100%-32px)] max-w-[385px] -translate-x-1/2 items-center justify-between rounded-full bg-[#161D2F]/95 backdrop-blur-md px-4 shadow-2xl border border-violet-500/30">
            <NavButton icon={<Home className="h-5 w-5" />} label="Home" active={activeTab === 'home'} onClick={() => onSelect('home')} />
            <NavButton icon={<MapPin className="h-5 w-5" />} label="Explore" active={activeTab === 'explore'} onClick={() => onSelect('explore')} />
            <button
                type="button"
                aria-label="Scan QR code"
                onClick={() => onSelect('scan')}
                className="-mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-purple-950/40 ring-8 ring-[#0B0F17] border border-purple-400/40 active:scale-95 transition"
            >
                <QrCode className="h-6 w-6" />
            </button>
            <NavButton icon={<Gift className="h-5 w-5" />} label="Rewards" active={activeTab === 'rewards'} onClick={() => onSelect('rewards')} />
            <NavButton icon={<UserRound className="h-5 w-5" />} label="Profile" active={activeTab === 'profile'} onClick={() => onSelect('profile')} />
        </nav>
    );
}

function NavButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl transition ${
                active ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
        >
            {icon}
            <span className="mt-1 text-[9px] font-extrabold uppercase tracking-wider">{label}</span>
        </button>
    );
}
