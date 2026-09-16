'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  MapPin,
  Volume2,
  VolumeX,
  Radio,
  Users,
  Percent,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Megaphone,
  PlusCircle,
  Download,
  Gift,
  Settings,
  Mail,
  Wifi,
  Instagram,
  ChevronRight,
  Phone,
  BarChart3,
  Calendar,
  Layers,
  Share2,
} from 'lucide-react';
import { Claim, Shop, Merchant } from '@/types';
import { playNotificationChime } from '@/lib/sound';
import QRCode from 'qrcode';

type MerchantView = 'qr' | 'customers' | 'rewards' | 'marketing' | 'offer' | 'settings';

interface MarketingCampaign {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  expiryDate: string;
  enabled: boolean;
  claimsCount: number;
}

export default function MerchantDashboardPage() {
  const router = useRouter();

  // State
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time notification state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [incomingClaimAlert, setIncomingClaimAlert] = useState<Claim | null>(null);
  const [seenClaimIds, setSeenClaimIds] = useState<Set<string>>(new Set());

  // Active view tab & filters
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ALL'>('PENDING');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [merchantView, setMerchantView] = useState<MerchantView>('qr');
  const [remoteScanEnabled, setRemoteScanEnabled] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Offer / Reward Form State
  const [offerTitle, setOfferTitle] = useState('Get 5% discount on your total bill after 8 visits');
  const [offerMessage, setOfferMessage] = useState('Reward loyal customers with a special treat on every 8th visit.');
  const [offerImage, setOfferImage] = useState('');
  const [visitsRequired, setVisitsRequired] = useState('8');
  const [rewardExpiry, setRewardExpiry] = useState('30');
  const [expiryDate, setExpiryDate] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [offerSaved, setOfferSaved] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);

  // Marketing Campaigns State
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([
    {
      id: 'camp-1',
      title: 'Weekend Repeat Boost',
      description: 'Get 15% bonus discount on 4th visit',
      discountPercent: 15,
      expiryDate: '2026-10-31',
      enabled: true,
      claimsCount: 12,
    },
    {
      id: 'camp-2',
      title: 'Festive Stamp Festival',
      description: 'Double stamps on every purchase',
      discountPercent: 20,
      expiryDate: '2026-11-15',
      enabled: true,
      claimsCount: 28,
    },
  ]);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampDiscount, setNewCampDiscount] = useState('15');
  const [newCampExpiry, setNewCampExpiry] = useState('2026-12-31');

  // Reject modal state
  const [rejectingClaim, setRejectingClaim] = useState<Claim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Minimum order amount not met');

  // Fetch Merchant profile, Shop, Offer & Claims
  const fetchDashboardData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/merchant');
      if (!authRes.ok) {
        router.push('/merchant/login');
        return;
      }
      const authData = await authRes.json();
      if (!authData.success) {
        router.push('/merchant/login');
        return;
      }

      setMerchant(authData.merchant);
      setShop(authData.shop);

      if (authData.shop?.id) {
        // Fetch claims
        const claimsRes = await fetch(`/api/claims?shopId=${authData.shop.id}`);
        const claimsData = await claimsRes.json();
        if (claimsData.success && claimsData.claims) {
          const freshClaims: Claim[] = claimsData.claims;
          setClaims(freshClaims);

          // Detect new incoming pending claims
          const currentPending = freshClaims.filter((c) => c.status === 'PENDING');
          if (currentPending.length > 0) {
            const newest = currentPending[0];
            setSeenClaimIds((prev) => {
              if (!prev.has(newest.id)) {
                setIncomingClaimAlert(newest);
                if (audioEnabled) {
                  playNotificationChime();
                }
                const next = new Set(prev);
                next.add(newest.id);
                return next;
              }
              return prev;
            });
          }
        }

        // Fetch offer
        const offerRes = await fetch('/api/merchant/offer');
        const offerData = await offerRes.json();
        if (offerData.success && offerData.offer) {
          setOfferTitle(offerData.offer.title || 'Get 5% discount on your total bill after 8 visits');
          setOfferMessage(offerData.offer.description || 'Special reward for loyal customers.');
          setVisitsRequired(String(offerData.offer.visitsRequired || 8));
          setRewardExpiry(String(offerData.offer.expiryDays || 30));
          if (offerData.offer.expiryDate) setExpiryDate(offerData.offer.expiryDate);
          if (offerData.offer.image) setOfferImage(offerData.offer.image);
          if (offerData.offer.discountPercent) setDiscountPercent(String(offerData.offer.discountPercent));
        }
      }
    } catch (err) {
      console.error('Error loading merchant dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router, audioEnabled]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handlers for Approve / Reject / Redeem
  const handleAccept = async (claimId: string) => {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/merchant/card-requests/${claimId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIncomingClaimAlert(null);
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to approve claim');
      }
    } catch (err) {
      alert('Network error approving claim');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRedeem = async (claimId: string) => {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/merchant/card-requests/${claimId}/redeem`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIncomingClaimAlert(null);
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to redeem reward');
      }
    } catch (err) {
      alert('Network error redeeming reward');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (claimId: string, reason: string) => {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/merchant/card-requests/${claimId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectingClaim(null);
        setIncomingClaimAlert(null);
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to reject claim');
      }
    } catch (err) {
      alert('Network error rejecting claim');
    } finally {
      setActionInProgress(null);
    }
  };

  // Save Offer Handler (POST /api/merchant/offer)
  const handleSaveOffer = async () => {
    setOfferSaving(true);
    try {
      const res = await fetch('/api/merchant/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: offerTitle,
          description: offerMessage,
          visitsRequired: Number(visitsRequired) || 8,
          expiryDays: Number(rewardExpiry) || 30,
          expiryDate: expiryDate || undefined,
          discountPercent: Number(discountPercent) || 15,
          image: offerImage,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOfferSaved(true);
        setTimeout(() => setOfferSaved(false), 3500);
      } else {
        alert(data.message || 'Could not save offer');
      }
    } catch (err) {
      alert('Network error saving offer');
    } finally {
      setOfferSaving(false);
    }
  };

  // Save Merchant & Shop Profile Handler (PUT /api/auth/merchant)
  const handleSaveProfile = async (updatedShop: Partial<Shop>, updatedMerchant: Partial<Merchant>) => {
    try {
      const res = await fetch('/api/auth/merchant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: updatedShop,
          merchant: updatedMerchant,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.shop) setShop(data.shop);
        if (data.merchant) setMerchant(data.merchant);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3500);
      } else {
        alert(data.message || 'Could not update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/merchant', { method: 'DELETE' });
    } catch {}
    localStorage.removeItem('merchant_token');
    router.push('/merchant/login');
  };

  // Create Marketing Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;
    const newCamp: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      title: newCampTitle.trim(),
      description: newCampDesc.trim() || 'Special store offer',
      discountPercent: Number(newCampDiscount) || 15,
      expiryDate: newCampExpiry || '2026-12-31',
      enabled: true,
      claimsCount: 0,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    setNewCampTitle('');
    setNewCampDesc('');
    setShowNewCampaignModal(false);
  };

  const toggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const pendingClaims = claims.filter((c) => c.status === 'PENDING');
  const acceptedClaims = claims.filter((c) => c.status === 'ACCEPTED');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f7f6]">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#1f7775]" />
          <p className="mt-3 text-sm font-semibold text-slate-600">Loading Merchant Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7f6] pb-24 text-[#142033]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md shadow-xs sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f7775] text-xs font-black text-white shadow-sm">
            Flinty
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">{shop?.name || 'Merchant Store'}</h1>
            <p className="text-[11px] font-semibold text-[#1f7775]">{shop?.category || 'Retail Partner'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              audioEnabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
            title={audioEnabled ? 'Chime alerts ON' : 'Chime alerts OFF'}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main View Router */}
      {merchantView === 'qr' && (
        <MerchantHomeView
          shop={shop}
          claims={claims}
          onAccept={handleAccept}
          onRedeem={handleRedeem}
          onReject={(claim) => setRejectingClaim(claim)}
        />
      )}

      {merchantView === 'customers' && (
        <main className="mx-auto max-w-4xl px-4 pt-6">
          <CustomerDirectory claims={claims} shopName={shop?.name || 'Store'} />
        </main>
      )}

      {merchantView === 'rewards' && (
        <main className="mx-auto max-w-4xl px-4 pt-6">
          <RewardsManagerView
            offerTitle={offerTitle}
            offerMessage={offerMessage}
            visitsRequired={visitsRequired}
            rewardExpiry={rewardExpiry}
            discountPercent={discountPercent}
            onOfferTitleChange={setOfferTitle}
            onOfferMessageChange={setOfferMessage}
            onVisitsRequiredChange={setVisitsRequired}
            onRewardExpiryChange={setRewardExpiry}
            onDiscountPercentChange={setDiscountPercent}
            onSaveOffer={handleSaveOffer}
            offerSaved={offerSaved}
            offerSaving={offerSaving}
            acceptedClaims={acceptedClaims}
          />
        </main>
      )}

      {merchantView === 'marketing' && (
        <main className="mx-auto max-w-4xl px-4 pt-6">
          <MarketingView
            campaigns={campaigns}
            onToggleCampaign={toggleCampaign}
            onOpenCreateModal={() => setShowNewCampaignModal(true)}
            claimsCount={claims.length}
          />
        </main>
      )}

      {merchantView === 'offer' && (
        <main className="mx-auto max-w-4xl px-4 pt-6">
          <CreateOfferView
            shopName={shop?.name || 'Your Store'}
            offerTitle={offerTitle}
            offerMessage={offerMessage}
            offerImage={offerImage}
            visitsRequired={visitsRequired}
            rewardExpiry={rewardExpiry}
            expiryDate={expiryDate}
            offerSaved={offerSaved}
            offerSaving={offerSaving}
            onOfferTitleChange={setOfferTitle}
            onOfferMessageChange={setOfferMessage}
            onOfferImageChange={setOfferImage}
            onVisitsRequiredChange={setVisitsRequired}
            onRewardExpiryChange={setRewardExpiry}
            onExpiryDateChange={setExpiryDate}
            onSaveOffer={handleSaveOffer}
          />
        </main>
      )}

      {merchantView === 'settings' && (
        <MerchantSettingsView
          shop={shop}
          merchant={merchant}
          remoteScanEnabled={remoteScanEnabled}
          onRemoteScanChange={setRemoteScanEnabled}
          saved={settingsSaved}
          onSaveProfile={handleSaveProfile}
          onLogout={handleLogout}
        />
      )}

      {/* Real-time Notification Modal */}
      {incomingClaimAlert && incomingClaimAlert.status === 'PENDING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-400">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-amber-600">
                <div className="p-2 rounded-xl bg-amber-100 animate-pulse">
                  <Bell className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">New Card Request</h3>
                  <p className="text-[11px] text-slate-500">{shop?.name}</p>
                </div>
              </div>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{incomingClaimAlert.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Mobile:</span>
                <span className="font-mono font-semibold text-slate-900">+91 {incomingClaimAlert.customerMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Time:</span>
                <span className="font-mono font-semibold text-slate-600">
                  {new Date(incomingClaimAlert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingClaim(incomingClaimAlert)}
                className="flex-1 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 active:scale-95 transition-all"
              >
                REJECT
              </button>
              <button
                type="button"
                onClick={() => handleAccept(incomingClaimAlert.id)}
                disabled={actionInProgress === incomingClaimAlert.id}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                APPROVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reject Customer Claim</h3>
                <p className="text-xs text-slate-500">{rejectingClaim.customerName} ({rejectingClaim.claimCode})</p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Reason for Rejection
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-rose-500"
              >
                <option value="Minimum order amount not met">Minimum order amount not met</option>
                <option value="Customer not physically present at counter">Customer not physically present at counter</option>
                <option value="Already redeemed an offer on this bill">Already redeemed an offer on this bill</option>
                <option value="Store offer quota exhausted for today">Store offer quota exhausted for today</option>
                <option value="Incorrect customer details">Incorrect customer details</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingClaim(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectingClaim.id, rejectionReason)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#1f7775]" />
                <h3 className="font-extrabold text-slate-900 text-base">New Marketing Campaign</h3>
              </div>
              <button type="button" onClick={() => setShowNewCampaignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Title</label>
                <input
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  placeholder="e.g. Festival Stamp Bonus"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#1f7775]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Description</label>
                <textarea
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  placeholder="Get double stamps on all weekend visits"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#1f7775]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newCampDiscount}
                    onChange={(e) => setNewCampDiscount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#1f7775]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCampExpiry}
                    onChange={(e) => setNewCampExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#1f7775]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1f7775] text-white font-bold shadow-md hover:bg-[#185e5c]"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <MerchantBottomNav activeView={merchantView} onSelect={setMerchantView} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. QR Code View (Merchant Home)
// ─────────────────────────────────────────────────────────────────────────────
function MerchantHomeView({
  shop,
  claims,
  onAccept,
  onRedeem,
  onReject,
}: {
  shop: Shop | null;
  claims: Claim[];
  onAccept: (claimId: string) => void;
  onRedeem?: (claimId: string) => void;
  onReject: (claim: Claim) => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const pendingClaims = claims.filter((claim) => claim.status === 'PENDING');
  const merchantSlug = shop?.slug || shop?.id || 'gourmet-pizza';
  const shopPathUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://flinty-orcin.vercel.app'}/shop/${merchantSlug}`;

  useEffect(() => {
    QRCode.toDataURL(shopPathUrl, { width: 320, margin: 1, color: { dark: '#123c46', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [shopPathUrl]);

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#f3f7f6] pb-4 text-[#142033]">
      <section className="rounded-b-[26px] bg-gradient-to-br from-[#123c46] to-[#1f6970] px-5 pb-5 pt-6 text-white shadow-lg shadow-[#123c46]/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-[10px] font-black">
            Flinty
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/75">Good day,</p>
            <h1 className="text-base font-black">{shop?.name || 'Your Business'}</h1>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-2 text-center">
            <Clock className="mx-auto h-4 w-4" />
            <b className="mt-1 block text-lg leading-5">{pendingClaims.length}</b>
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/75">Pending</span>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-2 text-center">
            <Users className="mx-auto h-4 w-4" />
            <b className="mt-1 block text-lg leading-5">{claims.length}</b>
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/75">Customers</span>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-2 py-2 text-center">
            <QrCode className="mx-auto h-4 w-4" />
            <b className="mt-1 block text-lg leading-5">Live</b>
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/75">QR Status</span>
          </div>
        </div>
      </section>

      {/* Prominent Counter QR Section */}
      <section className="px-4 pt-6 text-center pb-6">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-md border border-slate-200/80">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e3f1ef] text-[#1f7775] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            Counter QR Stand Code
          </span>
          <h2 className="text-lg font-black text-slate-900">{shop?.name || 'Store'} Loyalty QR</h2>
          <p className="mt-1 text-xs font-mono font-bold text-[#1f7775] break-all">{shopPathUrl}</p>

          <div className="my-5 flex justify-center">
            <img
              src={qrDataUrl || '/counter-qr.png'}
              alt={`${shop?.name || 'Store'} QR code`}
              className="h-56 w-56 rounded-2xl bg-white p-3 shadow-sm ring-4 ring-[#dcefeb] object-contain"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Display this QR code at your checkout counter. Customers scan it to collect stamps and earn rewards.
          </p>

          {qrDataUrl && (
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={qrDataUrl}
                download={`${merchantSlug}-counter-qr.png`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1f7775] text-white text-xs font-bold shadow-md hover:bg-[#185e5c] active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Counter QR Code</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(shopPathUrl);
                    alert('Copied link: ' + shopPathUrl);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                <span>Copy Direct Link</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Live Approvals Feed */}
      <section className="px-4 pt-2 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Pending Approvals &amp; Redemptions</h2>
          <span className="rounded-full bg-[#fff4d6] px-2.5 py-1 text-[10px] font-bold text-[#a66a00]">
            {pendingClaims.length} waiting
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {pendingClaims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs text-slate-500">
              No pending approvals. Customer QR scans will appear here in real time.
            </div>
          ) : (
            pendingClaims.slice(0, 5).map((claim) => {
              const isReward = claim.is8thStampReward || Boolean(claim.rewardCode);
              return (
                <div key={claim.id} className={`rounded-2xl border-2 p-3.5 shadow-sm ${isReward ? 'border-amber-500 bg-amber-50/60' : 'border-[#e1a928] bg-white'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      {isReward && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-white mb-1">
                          <Gift className="w-3 h-3" />
                          Reward Redemption
                        </span>
                      )}
                      <p className="text-sm font-bold text-slate-900">{claim.customerName}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">+91 {claim.customerMobile}</p>
                      {isReward && claim.rewardCode && (
                        <p className="mt-1 font-mono text-xs font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded w-fit border border-amber-300">
                          Code: {claim.rewardCode}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-slate-400">{new Date(claim.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="Reject" onClick={() => onReject(claim)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-[#fff4d6]">
                        <X className="h-4 w-4" />
                      </button>
                      {isReward ? (
                        <button type="button" onClick={() => onRedeem ? onRedeem(claim.id) : onAccept(claim.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 text-white font-black text-xs hover:bg-amber-700 shadow-md">
                          <Check className="h-4 w-4" />
                          <span>Redeem</span>
                        </button>
                      ) : (
                        <button type="button" aria-label="Approve" onClick={() => onAccept(claim.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f7775] text-white hover:bg-[#185e5c]">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Customers Directory View
// ─────────────────────────────────────────────────────────────────────────────
function CustomerDirectory({ claims, shopName }: { claims: Claim[]; shopName: string }) {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedMobile, setSelectedMobile] = useState<string | null>(null);

  const customersMap = new Map<string, Claim>();
  claims.forEach((claim) => {
    if (!customersMap.has(claim.customerMobile)) {
      customersMap.set(claim.customerMobile, claim);
    }
  });
  const customers = Array.from(customersMap.values());
  const filteredCustomers = customers.filter((c) =>
    filter === 'ALL' ? true : filter === 'ACTIVE' ? c.status === 'PENDING' : c.status === 'ACCEPTED'
  );

  const exportCustomers = () => {
    const rows = [
      ['Name', 'Mobile', 'Total Visits', 'Last Visit', 'Status'],
      ...customers.map((c) => {
        const cClaims = claims.filter((claim) => claim.customerMobile === c.customerMobile);
        return [c.customerName, c.customerMobile, String(cClaims.length), new Date(c.createdAt).toLocaleString(), c.status];
      }),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `${shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-customers.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <FeatureShell title="Customers" subtitle={`Real registered customers at ${shopName}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 text-xs font-semibold">
          <FilterButton label="All" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
          <FilterButton label="Active" active={filter === 'ACTIVE'} onClick={() => setFilter('ACTIVE')} />
          <FilterButton label="Completed" active={filter === 'COMPLETED'} onClick={() => setFilter('COMPLETED')} />
        </div>
        <button
          type="button"
          onClick={exportCustomers}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#1f7775] hover:text-[#1f7775] shadow-xs"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {filteredCustomers.length === 0 ? (
          <EmptyMerchantPanel text="No customer activity recorded yet." />
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerDetail
              key={customer.customerMobile}
              customer={customer}
              claims={claims.filter((claim) => claim.customerMobile === customer.customerMobile)}
              expanded={selectedMobile === customer.customerMobile}
              onToggle={() => setSelectedMobile(selectedMobile === customer.customerMobile ? null : customer.customerMobile)}
            />
          ))
        )}
      </div>
    </FeatureShell>
  );
}

function CustomerDetail({
  customer,
  claims,
  expanded,
  onToggle,
}: {
  customer: Claim;
  claims: Claim[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const lastVisit = new Date(Math.max(...claims.map((claim) => new Date(claim.createdAt).getTime())));
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${expanded ? 'border-[#1f7775]' : 'border-slate-200'}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-4 text-left">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3f1ef] text-sm font-black text-[#1f7775]">
            {customer.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{customer.customerName}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">+91 {customer.customerMobile}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#1f7775]">{claims.length} stamps</p>
          <p className="text-[9px] uppercase tracking-wide text-slate-400">Click to expand</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50/50">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Total Visits</p>
              <p className="mt-1 font-bold text-slate-900">{claims.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Last Visit</p>
              <p className="mt-1 font-bold text-slate-900">{formatRelative(lastVisit)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Status</p>
              <p className="mt-1 font-bold text-emerald-600">{customer.status}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scan &amp; Stamp History</p>
            <div className="mt-2 space-y-2">
              {claims.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((claim, index) => (
                <div key={claim.id} className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60">
                  <span>Visit #{claims.length - index} • {new Date(claim.createdAt).toLocaleDateString()} {new Date(claim.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                  <span className="font-bold text-[#1f7775]">{claim.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Rewards Manager View
// ─────────────────────────────────────────────────────────────────────────────
function RewardsManagerView({
  offerTitle,
  offerMessage,
  visitsRequired,
  rewardExpiry,
  discountPercent,
  onOfferTitleChange,
  onOfferMessageChange,
  onVisitsRequiredChange,
  onRewardExpiryChange,
  onDiscountPercentChange,
  onSaveOffer,
  offerSaved,
  offerSaving,
  acceptedClaims,
}: {
  offerTitle: string;
  offerMessage: string;
  visitsRequired: string;
  rewardExpiry: string;
  discountPercent: string;
  onOfferTitleChange: (val: string) => void;
  onOfferMessageChange: (val: string) => void;
  onVisitsRequiredChange: (val: string) => void;
  onRewardExpiryChange: (val: string) => void;
  onDiscountPercentChange: (val: string) => void;
  onSaveOffer: () => void;
  offerSaved: boolean;
  offerSaving: boolean;
  acceptedClaims: Claim[];
}) {
  return (
    <FeatureShell title="Rewards Program" subtitle="Configure the loyalty reward program for your customers">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Metric label="Rewards Claimed" value={String(acceptedClaims.length)} />
        <Metric label="Active Discount" value={`${discountPercent || 15}%`} />
        <Metric label="Repeat Customers" value={String(new Set(acceptedClaims.map((c) => c.customerMobile)).size)} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Edit Loyalty Reward Rules</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveOffer();
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Reward Program Title</label>
            <input
              value={offerTitle}
              onChange={(e) => onOfferTitleChange(e.target.value)}
              required
              placeholder="e.g. Free Coffee after 8 visits"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#1f7775]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reward Description &amp; Terms</label>
            <textarea
              value={offerMessage}
              onChange={(e) => onOfferMessageChange(e.target.value)}
              rows={3}
              placeholder="e.g. Valid on all beverages. Show coupon to cashier."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#1f7775]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Visits Required</label>
              <input
                type="number"
                min="1"
                max="50"
                value={visitsRequired}
                onChange={(e) => onVisitsRequiredChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#1f7775]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => onDiscountPercentChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#1f7775]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry (Days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={rewardExpiry}
                onChange={(e) => onRewardExpiryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#1f7775]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={offerSaving}
            className="w-full rounded-xl bg-[#1f7775] py-3.5 font-bold text-white shadow-md hover:bg-[#185e5c] disabled:opacity-60 transition-all"
          >
            {offerSaving ? 'Saving Changes...' : 'Save Reward Program Permanently'}
          </button>

          {offerSaved && (
            <p className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
              ✓ Reward program saved to database successfully!
            </p>
          )}
        </form>
      </div>
    </FeatureShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Marketing View
// ─────────────────────────────────────────────────────────────────────────────
function MarketingView({
  campaigns,
  onToggleCampaign,
  onOpenCreateModal,
  claimsCount,
}: {
  campaigns: MarketingCampaign[];
  onToggleCampaign: (id: string) => void;
  onOpenCreateModal: () => void;
  claimsCount: number;
}) {
  const activeCount = campaigns.filter((c) => c.enabled).length;

  return (
    <FeatureShell title="Marketing Campaigns" subtitle="Drive repeat customer visits with targeted promotional campaigns">
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Metric label="Total Scans" value={String(claimsCount)} />
        <Metric label="Active Campaigns" value={String(activeCount)} />
        <Metric label="Campaign Rewards" value={String(campaigns.reduce((acc, c) => acc + c.claimsCount, 0))} />
        <Metric label="Repeat Rate Boost" value="40%" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-slate-900 text-base">Active Marketing Offers</h3>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1f7775] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#185e5c]"
        >
          <PlusCircle className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      <div className="space-y-3">
        {campaigns.map((camp) => (
          <div key={camp.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3f1ef] text-[#1f7775]">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{camp.title}</h4>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {camp.discountPercent}% OFF
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{camp.description}</p>
                <p className="mt-2 text-[10px] font-semibold text-slate-400">Expires: {camp.expiryDate} • {camp.claimsCount} claims collected</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleCampaign(camp.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${camp.enabled ? 'bg-[#1f7775]' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${camp.enabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </FeatureShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Create Offer View (with Live Preview)
// ─────────────────────────────────────────────────────────────────────────────
function CreateOfferView({
  shopName,
  offerTitle,
  offerMessage,
  offerImage,
  visitsRequired,
  rewardExpiry,
  expiryDate,
  offerSaved,
  offerSaving,
  onOfferTitleChange,
  onOfferMessageChange,
  onOfferImageChange,
  onVisitsRequiredChange,
  onRewardExpiryChange,
  onExpiryDateChange,
  onSaveOffer,
}: {
  shopName: string;
  offerTitle: string;
  offerMessage: string;
  offerImage: string;
  visitsRequired: string;
  rewardExpiry: string;
  expiryDate: string;
  offerSaved: boolean;
  offerSaving: boolean;
  onOfferTitleChange: (value: string) => void;
  onOfferMessageChange: (value: string) => void;
  onOfferImageChange: (value: string) => void;
  onVisitsRequiredChange: (value: string) => void;
  onRewardExpiryChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onSaveOffer: () => void;
}) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onOfferImageChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  const requiredCount = Math.min(24, Math.max(1, Number(visitsRequired) || 8));

  return (
    <FeatureShell title="Create Offer" subtitle="Design custom reward cards for your customers with live preview">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveOffer();
          }}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <h3 className="font-bold text-slate-900 text-base">Offer Configuration</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Reward Image (File Upload or URL)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-slate-200/80 hover:bg-slate-50 transition">
                {offerImage ? (
                  <img src={offerImage} alt="Reward preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-center text-[11px] font-bold text-slate-400">
                    + Upload<br />Image
                  </span>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={offerImage}
                  onChange={(e) => onOfferImageChange(e.target.value)}
                  placeholder="Or paste image URL here..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-[#1f7775]"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upload an image file or paste an image link. This image will appear on the customer card.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visits Required</label>
              <input
                type="number"
                min="1"
                max="50"
                value={visitsRequired}
                onChange={(e) => onVisitsRequiredChange(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#1f7775]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => onExpiryDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#1f7775]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry (Days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={rewardExpiry}
                onChange={(e) => onRewardExpiryChange(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#1f7775]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reward Title / Description</label>
            <input
              value={offerTitle}
              onChange={(e) => onOfferTitleChange(e.target.value)}
              required
              placeholder="e.g. Free Cupcake or 15% Off Total Bill"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-[#1f7775]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Details / Terms</label>
            <textarea
              value={offerMessage}
              onChange={(e) => onOfferMessageChange(e.target.value)}
              required
              placeholder="Mention conditions e.g. Valid once per user bill."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-[#1f7775]"
            />
          </div>

          <button
            type="submit"
            disabled={offerSaving}
            className="w-full rounded-xl bg-[#1f7775] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#185e5c] disabled:opacity-60 transition-all"
          >
            {offerSaving ? 'Saving Offer...' : 'Save & Publish Offer to Database'}
          </button>

          {offerSaved && (
            <p className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200">
              ✓ Offer saved &amp; published live for {shopName}!
            </p>
          )}
        </form>

        <div>
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Live Customer Card Preview</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <div className="flex h-36 items-center justify-center bg-slate-200/80 overflow-hidden">
                {offerImage ? (
                  <img src={offerImage} alt="Live preview" className="h-full w-full object-cover" />
                ) : (
                  <Gift className="h-12 w-12 text-slate-400" />
                )}
              </div>
              <div className="p-4 bg-white">
                <span className="inline-block rounded-full bg-[#e3f1ef] px-2.5 py-0.5 text-[10px] font-extrabold text-[#1f7775] uppercase mb-2">
                  {shopName}
                </span>
                <h4 className="font-black text-slate-900 text-sm leading-snug">{offerTitle || 'Your Reward Description'}</h4>
                
                {/* Dynamic Stamp Slots Preview */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Stamp Slots ({requiredCount} Visits)
                  </p>
                  <div className="grid grid-cols-4 gap-2 justify-items-center">
                    {Array.from({ length: requiredCount }).map((_, idx) => {
                      const num = idx + 1;
                      const isLast = num === requiredCount;
                      return (
                        <div
                          key={num}
                          className={`w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center text-[11px] font-bold ${
                            isLast
                              ? 'border-[#1f7775] bg-[#e3f1ef] text-[#1f7775]'
                              : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          {isLast ? <Gift className="w-4 h-4" /> : num}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-600 border-t border-slate-100 pt-3">
                  <span>{requiredCount} Visits Required</span>
                  <span className="text-emerald-600">{expiryDate ? `Expires ${expiryDate}` : `${rewardExpiry || '30'} Days Expiry`}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{offerMessage || 'Your reward details will appear here.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeatureShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Settings / Profile View
// ─────────────────────────────────────────────────────────────────────────────
function MerchantSettingsView({
  shop,
  merchant,
  remoteScanEnabled,
  onRemoteScanChange,
  saved,
  onSaveProfile,
  onLogout,
}: {
  shop: Shop | null;
  merchant: Merchant | null;
  remoteScanEnabled: boolean;
  onRemoteScanChange: (enabled: boolean) => void;
  saved: boolean;
  onSaveProfile: (updatedShop: Partial<Shop>, updatedMerchant: Partial<Merchant>) => void;
  onLogout: () => void;
}) {
  const [businessName, setBusinessName] = useState(shop?.name || '');
  const [phone, setPhone] = useState(shop?.phone || merchant?.phone || '');
  const [email, setEmail] = useState(merchant?.email || '');
  const [address, setAddress] = useState(shop?.address || '');
  const [category, setCategory] = useState(shop?.category || 'Retail Store');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [whatsapp, setWhatsapp] = useState(shop?.phone || '');

  const handleSave = () => {
    onSaveProfile(
      { name: businessName, phone, address, category },
      { name: businessName, phone, email }
    );
  };

  return (
    <FeatureShell title="Profile &amp; Settings" subtitle="Manage your business account information &amp; preferences">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-3xl bg-white p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f1ef] text-xl font-black text-[#1f7775]">
              {businessName.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-lg font-black text-slate-900 outline-none focus:border-b focus:border-[#1f7775]"
                placeholder="Business Name"
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full text-xs font-semibold text-slate-500 outline-none"
                placeholder="Business Category"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-4">
              <label className="block font-bold text-slate-700 mb-1">Store Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1f7775]"
                placeholder="Full Store Address"
              />
            </div>

            <div className="py-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Opening Time</label>
                <input
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1f7775]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Closing Time</label>
                <input
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1f7775]"
                />
              </div>
            </div>

            <div className="py-4">
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1f7775]"
              />
            </div>

            <div className="py-4">
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#1f7775]"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Allow Remote Scan</p>
                <p className="text-slate-500 text-[11px]">Customers can scan QR without location lock</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoteScanChange(!remoteScanEnabled)}
                className={`relative h-6 w-11 rounded-full transition ${remoteScanEnabled ? 'bg-[#1f7775]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${remoteScanEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xs border border-slate-200 text-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Social Links</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instagram</label>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/yourstore"
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#1f7775]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#1f7775]"
              />
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-xl bg-[#1f7775] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#185e5c] transition-all"
        >
          {saved ? '✓ Profile & Settings Saved' : 'Update Profile & Store Information'}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all"
        >
          Logout of Merchant Account
        </button>
      </div>
    </FeatureShell>
  );
}

function MerchantBottomNav({
  activeView,
  onSelect,
}: {
  activeView: MerchantView;
  onSelect: (view: MerchantView) => void;
}) {
  const items: Array<{ view: MerchantView; label: string; icon: React.ReactNode }> = [
    { view: 'qr', label: 'QR Code', icon: <QrCode className="h-5 w-5" /> },
    { view: 'customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
    { view: 'rewards', label: 'Rewards', icon: <Gift className="h-5 w-5" /> },
    { view: 'marketing', label: 'Marketing', icon: <Megaphone className="h-5 w-5" /> },
    { view: 'offer', label: 'Create Offer', icon: <PlusCircle className="h-5 w-5" /> },
    { view: 'settings', label: 'Profile', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
        {items.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => onSelect(item.view)}
            className={`flex flex-1 min-w-[54px] flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
              activeView === item.view
                ? 'text-[#1f7775] font-black bg-[#e3f1ef]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {item.icon}
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function FeatureShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3.5 py-1.5 transition ${active ? 'bg-[#1f7775] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
    >
      {label}
    </button>
  );
}

function EmptyMerchantPanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-xs font-semibold text-slate-400">
      {text}
    </div>
  );
}

function formatRelative(date: Date) {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} hr ago`;
}
