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
} from 'lucide-react';
import { Claim, Shop, Merchant, ClaimStatus } from '@/types';
import { playNotificationChime } from '@/lib/sound';
import QRCode from 'qrcode';

export default function MerchantDashboardPage() {
  const router = useRouter();

  // State
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time notification state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isCounterActive, setIsCounterActive] = useState(true);
  const [incomingClaimAlert, setIncomingClaimAlert] = useState<Claim | null>(null);
  const [seenClaimIds, setSeenClaimIds] = useState<Set<string>>(new Set());

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ALL'>('PENDING');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [merchantView, setMerchantView] = useState<'qr' | 'customers' | 'rewards' | 'offer' | 'settings'>('qr');
  const [remoteScanEnabled, setRemoteScanEnabled] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerImage, setOfferImage] = useState('');
  const [visitsRequired, setVisitsRequired] = useState('8');
  const [rewardExpiry, setRewardExpiry] = useState('30');
  const [offerSaved, setOfferSaved] = useState(false);

  // Reject modal state
  const [rejectingClaim, setRejectingClaim] = useState<Claim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Minimum order amount not met');

  // Fetch Merchant profile & Claims
  const fetchDashboardData = useCallback(async () => {
    try {
      // Auth check
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

      // Fetch claims for this shop
      if (authData.shop?.id) {
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
                // Trigger notification chime!
                if (audioEnabled) {
                  playNotificationChime();
                }
                setIncomingClaimAlert(newest);
                const updated = new Set(prev);
                updated.add(newest.id);
                return updated;
              }
              return prev;
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router, audioEnabled]);

  // Initial load + Real-time fast polling (every 2.5 seconds)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2500);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Toggle Counter Mode
  const toggleCounterMode = async () => {
    const nextState = !isCounterActive;
    setIsCounterActive(nextState);
    try {
      await fetch('/api/merchant/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCounterActive: nextState }),
      });
    } catch (err) {
      console.error('Error toggling counter mode:', err);
    }
  };

  // Update GPS coordinates of the shop to current device
  const updateStoreGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch('/api/merchant/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });
          if (res.ok) {
            alert(`Store GPS calibrated to current position (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
            fetchDashboardData();
          }
        } catch (err) {
          console.error(err);
        }
      },
      (err) => alert(`Failed to acquire GPS: ${err.message}`)
    );
  };

  // Handle Accept Card Collection Request
  const handleAccept = async (claimId: string) => {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/merchant/card-requests/${claimId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        if (incomingClaimAlert?.id === claimId) {
          setIncomingClaimAlert(null);
        }
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to accept claim:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Reject Card Collection Request
  const handleReject = async (claimId: string, reason: string) => {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/merchant/card-requests/${claimId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setRejectingClaim(null);
        if (incomingClaimAlert?.id === claimId) {
          setIncomingClaimAlert(null);
        }
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to reject claim:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Redeem 8th Stamp Reward Request
  const handleRedeem = async (claimId: string) => {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/merchant/card-requests/${claimId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        if (incomingClaimAlert?.id === claimId) {
          setIncomingClaimAlert(null);
        }
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to redeem reward:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Save Offer Details
  const handleSaveOffer = async () => {
    try {
      const res = await fetch('/api/merchant/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: offerTitle,
          description: offerMessage,
          visitsRequired: Number(visitsRequired),
          expiryDays: Number(rewardExpiry),
        }),
      });

      if (res.ok) {
        setOfferSaved(true);
        setTimeout(() => setOfferSaved(false), 4000);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to save reward offer:', err);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/merchant', { method: 'DELETE' });
    router.push('/merchant/login');
  };

  if (isLoading && !merchant) {
    return (
      <div className="min-h-[calc(100vh-61px)] flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading Merchant Terminal...</span>
        </div>
      </div>
    );
  }

  // Filtered claims based on tab
  const filteredClaims = claims.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  const pendingCount = claims.filter((c) => c.status === 'PENDING').length;
  const acceptedCount = claims.filter((c) => c.status === 'ACCEPTED').length;
  const rejectedCount = claims.filter((c) => c.status === 'REJECTED').length;

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-50 flex flex-col">

      {/* Top Merchant Sub-Header */}
      <div className={`${merchantView === 'qr' ? 'hidden' : ''} bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-xs`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">

          {/* Store Info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{shop?.name}</h1>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {shop?.category}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-xs">{shop?.address}</span>
                <span className="mx-1">•</span>
                <span className="text-slate-600 font-medium">{merchant?.name}</span>
              </div>
            </div>
          </div>

          {/* Action Tools: Counter Mode, Audio chime, GPS, Logout */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Counter Mode Toggle */}
            <button
              onClick={toggleCounterMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isCounterActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              title="When Counter Mode is Active, nearby customers automatically pair with this billing terminal."
            >
              <Radio className={`w-3.5 h-3.5 ${isCounterActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isCounterActive ? 'Counter Active' : 'Counter Standby'}</span>
            </button>

            {/* Audio Chime Toggle */}
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) playNotificationChime();
              }}
              className={`p-2 rounded-xl border text-xs transition-all ${audioEnabled
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              title={audioEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* GPS Calibration */}
            <button
              onClick={updateStoreGps}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs transition-all"
              title="Calibrate Store GPS to this device"
            >
              <MapPin className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {merchantView !== 'qr' && merchantView !== 'settings' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
          <MerchantFeaturePanel
            view={merchantView}
            claims={claims}
            shopName={shop?.name || 'your store'}
            offerTitle={offerTitle}
            offerMessage={offerMessage}
            offerImage={offerImage}
            visitsRequired={visitsRequired}
            rewardExpiry={rewardExpiry}
            offerSaved={offerSaved}
            onOfferTitleChange={setOfferTitle}
            onOfferMessageChange={setOfferMessage}
            onOfferImageChange={setOfferImage}
            onVisitsRequiredChange={setVisitsRequired}
            onRewardExpiryChange={setRewardExpiry}
            onSaveOffer={handleSaveOffer}
          />
        </div>
      )}

      {merchantView === 'settings' && <MerchantSettingsView shop={shop} merchant={merchant} remoteScanEnabled={remoteScanEnabled} onRemoteScanChange={setRemoteScanEnabled} saved={settingsSaved} onSave={() => setSettingsSaved(true)} />}

      {merchantView === 'qr' && <MerchantHomeView shop={shop} claims={claims} onAccept={handleAccept} onRedeem={handleRedeem} onReject={setRejectingClaim} />}

      <div className="hidden max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">

        {/* Real-time Notification Banner for Incoming Pending Claim */}
        {incomingClaimAlert && incomingClaimAlert.status === 'PENDING' && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-amber-500/20 animate-bounce-short border-2 border-amber-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-white text-amber-700 rounded-2xl shadow-md">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    <span>New Customer Claim At Counter</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    {incomingClaimAlert.customerName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-amber-100 mt-1">
                    <span className="font-mono font-medium">+91 {incomingClaimAlert.customerMobile}</span>
                    <span>•</span>
                    <span className="font-semibold bg-white/25 px-2 py-0.5 rounded">
                      10% Flat Discount
                    </span>
                    <span>•</span>
                    <span className="font-mono">{incomingClaimAlert.claimCode}</span>
                    <span>•</span>
                    <span className="text-amber-200">
                      Via: {incomingClaimAlert.identificationMethod}
                      {incomingClaimAlert.distanceMeters !== undefined && ` (${incomingClaimAlert.distanceMeters}m)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Decision Buttons */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => setRejectingClaim(incomingClaimAlert)}
                  className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/30 backdrop-blur-sm active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>REJECT</span>
                </button>
                <button
                  onClick={() => handleAccept(incomingClaimAlert.id)}
                  disabled={actionInProgress === incomingClaimAlert.id}
                  className="px-7 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>ACCEPT (APPLY 10% OFF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Pending Claims</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {pendingCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting cashier confirmation</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Accepted Claims</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {acceptedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Discounts redeemed today</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Rejected Claims</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-600 mt-2">
              {rejectedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Declined by cashier</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Customers</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {claims.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">In-store scratch footfall</div>
          </div>
        </div>

        {/* Claims Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Tabs Bar */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Discount Claims</h2>
              <p className="text-xs text-slate-500">Live feed isolated strictly to {shop?.name}</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'PENDING'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('ACCEPTED')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'ACCEPTED'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Accepted ({acceptedCount})
              </button>
              <button
                onClick={() => setActiveTab('REJECTED')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'REJECTED'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Rejected ({rejectedCount})
              </button>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All ({claims.length})
              </button>
            </div>
          </div>

          {/* Table */}
          {filteredClaims.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Store className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No {activeTab.toLowerCase()} claims found.</p>
              <p className="text-xs text-slate-400 mt-0.5">When customers scan the acrylic QR, they will appear here instantly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Mobile</th>
                    <th className="px-6 py-3.5">Offer</th>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5">Proximity Method</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.map((c) => {
                    const isPending = c.status === 'PENDING';
                    const isAccepted = c.status === 'ACCEPTED';
                    const isRejected = c.status === 'REJECTED';

                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/80 transition-colors ${isPending ? 'bg-amber-50/40' : ''
                          }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {c.customerName}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                          +91 {c.customerMobile}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">10% Flat Discount</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-amber-700">
                          {c.claimCode}
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {c.identificationMethod}
                            {c.distanceMeters !== undefined && ` (${c.distanceMeters}m)`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full animate-pulse">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Accepted
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAccept(c.id)}
                                disabled={actionInProgress === c.id}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>ACCEPT</span>
                              </button>
                              <button
                                onClick={() => setRejectingClaim(c)}
                                disabled={actionInProgress === c.id}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>REJECT</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {c.resolvedBy ? `By ${c.resolvedBy}` : 'Completed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Merchant Card Request Notification Popup (Prompt Section 5 & 8) */}
      {incomingClaimAlert && incomingClaimAlert.status === 'PENDING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-400 animate-bounce-short">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-amber-600">
                <div className="p-2 rounded-xl bg-amber-100 animate-pulse">
                  <Bell className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">New Card Collection Request</h3>
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
                <span className="text-slate-500 font-medium">Card:</span>
                <span className="font-semibold text-emerald-700">Scratch Card</span>
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
    </div>
  );
}

type MerchantView = 'qr' | 'customers' | 'rewards' | 'offer' | 'settings';

function MerchantHomeView({ shop, claims, onAccept, onRedeem, onReject }: { shop: Shop | null; claims: Claim[]; onAccept: (claimId: string) => void; onRedeem?: (claimId: string) => void; onReject: (claim: Claim) => void }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const pendingClaims = claims.filter((claim) => claim.status === 'PENDING');
  const merchantSlug = shop?.slug || shop?.id || 'gourmet-pizza';
  const shopPathUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://flinty-orcin.vercel.app'}/shop/${merchantSlug}`;

  useEffect(() => {
    QRCode.toDataURL(shopPathUrl, { width: 320, margin: 1, color: { dark: '#123c46', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [shopPathUrl]);

  return <main className="min-h-[calc(100vh-60px)] bg-[#f3f7f6] pb-4 text-[#142033]">
    <section className="rounded-b-[26px] bg-gradient-to-br from-[#123c46] to-[#1f6970] px-5 pb-5 pt-7 text-white shadow-lg shadow-[#123c46]/20">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-[10px] font-black">Kutio</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-white/75">Good afternoon,</p><h1 className="text-base font-black">{shop?.name || 'Your business'}</h1></div></div>
      <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl border border-white/20 bg-white/10 px-2 py-2 text-center"><Clock className="mx-auto h-4 w-4" /><b className="mt-1 block text-lg leading-5">{pendingClaims.length}</b><span className="text-[8px] font-bold uppercase tracking-wider text-white/75">Pending</span></div><div className="rounded-xl border border-white/20 bg-white/10 px-2 py-2 text-center"><Users className="mx-auto h-4 w-4" /><b className="mt-1 block text-lg leading-5">{claims.length}</b><span className="text-[8px] font-bold uppercase tracking-wider text-white/75">Customers</span></div><div className="rounded-xl border border-white/20 bg-white/10 px-2 py-2 text-center"><QrCode className="mx-auto h-4 w-4" /><b className="mt-1 block text-lg leading-5">Live</b><span className="text-[8px] font-bold uppercase tracking-wider text-white/75">QR Status</span></div></div>
    </section>

    {/* Center Prominent Merchant Counter QR Section */}
    <section className="px-4 pt-6 text-center pb-6">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-md border border-slate-200/80">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e3f1ef] text-[#1f7775] text-[11px] font-extrabold uppercase tracking-wider mb-2">
          <QrCode className="w-3.5 h-3.5" />
          Counter QR Code Stand
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
          Iss QR code ko counter par display karein. Customer ise scan karke seedha <strong>{shop?.name}</strong> ka Stamp Card Dashboard khol kar stamp claim karenge.
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

    <section className="px-4 pt-2 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Pending Approvals &amp; Redemptions</h2>
        <span className="rounded-full bg-[#fff4d6] px-2 py-1 text-[10px] font-bold text-[#a66a00]">{pendingClaims.length} waiting</span>
      </div>
      <div className="mt-3 space-y-2">
        {pendingClaims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs text-slate-500">
            No pending approvals or redemptions. New customer scans will appear here.
          </div>
        ) : (
          pendingClaims.slice(0, 5).map((claim) => {
            const isReward = claim.is8thStampReward || Boolean(claim.rewardCode);
            return (
              <div key={claim.id} className={`rounded-2xl border-2 p-3 shadow-sm ${isReward ? 'border-amber-500 bg-amber-50/60' : 'border-[#e1a928] bg-white'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {isReward && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-white mb-1">
                        <Gift className="w-3 h-3" />
                        8th Stamp Free Treat
                      </span>
                    )}
                    <p className="text-sm font-bold text-slate-900">{claim.customerName}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-500">+91 {claim.customerMobile}</p>
                    {isReward && claim.rewardCode && (
                      <p className="mt-1 font-mono text-xs font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded w-fit border border-amber-300">
                        Coupon: {claim.rewardCode}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">{new Date(claim.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={`Reject ${claim.customerName}`} onClick={() => onReject(claim)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-[#fff4d6] hover:text-[#a66a00]">
                      <X className="h-4 w-4" />
                    </button>
                    {isReward ? (
                      <button type="button" onClick={() => onRedeem ? onRedeem(claim.id) : onAccept(claim.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 text-white font-black text-xs hover:bg-amber-700 active:scale-95 transition-all shadow-md">
                        <Check className="h-4 w-4" />
                        <span>Mark as Redeemed</span>
                      </button>
                    ) : (
                      <button type="button" aria-label={`Approve ${claim.customerName}`} onClick={() => onAccept(claim.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2d9186] text-white hover:bg-[#23776e]">
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
  </main>;
}

function MerchantSettingsView({ shop, merchant, remoteScanEnabled, onRemoteScanChange, saved, onSave }: { shop: Shop | null; merchant: Merchant | null; remoteScanEnabled: boolean; onRemoteScanChange: (enabled: boolean) => void; saved: boolean; onSave: () => void }) {
  const [activeSetting, setActiveSetting] = useState<'account' | 'social' | 'subscription' | 'locations' | 'notifications' | 'privacy' | null>(null);
  const [businessName, setBusinessName] = useState(shop?.name || '');
  const [phone, setPhone] = useState(shop?.phone || merchant?.phone || '');
  const [email, setEmail] = useState(merchant?.email || '');
  const [address, setAddress] = useState(shop?.address || '');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [whatsapp, setWhatsapp] = useState(shop?.phone || '');

  return <main className="min-h-[calc(100vh-60px)] bg-[#fbfcfc] pb-5 text-[#142033]"><section className="bg-gradient-to-br from-[#123c46] to-[#1f6970] px-5 pb-7 pt-7 text-white"><div className="flex items-center justify-between"><div><h1 className="text-xl font-black">Profile &amp; Settings</h1><p className="mt-1 text-xs text-white/70">Manage your business and account</p></div><Settings className="h-6 w-6 text-white/80" /></div></section><div className="mx-auto max-w-2xl space-y-4 px-4 py-5"><section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e3f1ef] text-lg font-black text-[#1f7775]">{businessName.charAt(0) || 'K'}</div><div className="flex-1"><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="w-full text-base font-bold outline-none" placeholder="Business name" /><p className="mt-1 text-xs text-slate-500">{shop?.category || 'Business account'}</p></div></div><SettingsField icon={<MapPin className="h-4 w-4" />} label="Location & Hours" hint="Manage your address and timing"><div className="mt-3 grid gap-2 sm:grid-cols-2"><input value={address} onChange={(event) => setAddress(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1f7775]" placeholder="Business address" /><div className="flex gap-2"><input value={openingTime} onChange={(event) => setOpeningTime(event.target.value)} className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none" /><input value={closingTime} onChange={(event) => setClosingTime(event.target.value)} className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none" /></div></div></SettingsField><SettingsField icon={<Phone className="h-4 w-4" />} label="Phone" hint="Store contact number"><input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1f7775]" /></SettingsField><SettingsField icon={<Mail className="h-4 w-4" />} label="Email" hint="Account email"><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1f7775]" /></SettingsField><SettingsField icon={<Wifi className="h-4 w-4" />} label="Allow Remote Scan" hint="Customers can scan from far away"><button type="button" onClick={() => onRemoteScanChange(!remoteScanEnabled)} className={`relative mt-1 h-6 w-11 rounded-full transition ${remoteScanEnabled ? 'bg-[#1f7775]' : 'bg-slate-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${remoteScanEnabled ? 'left-6' : 'left-1'}`} /></button></SettingsField></section><section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><h2 className="font-bold">Account &amp; Business</h2><SettingsLink icon={<Store className="h-4 w-4" />} title="Business account" hint="Manage your account" onClick={() => setActiveSetting('account')} /><SettingsLink icon={<Instagram className="h-4 w-4" />} title="Social Links & Reviews" hint="Manage your online presence" onClick={() => setActiveSetting('social')} /><SettingsLink icon={<Percent className="h-4 w-4" />} title="Subscription" hint="Manage your plan" onClick={() => setActiveSetting('subscription')} /><SettingsLink icon={<MapPin className="h-4 w-4" />} title="Manage Locations" hint="Add or manage store branches" onClick={() => setActiveSetting('locations')} /><SettingsLink icon={<Bell className="h-4 w-4" />} title="Notifications" hint="Manage alerts and updates" onClick={() => setActiveSetting('notifications')} /><SettingsLink icon={<CheckCircle2 className="h-4 w-4" />} title="Privacy & Security" hint="Control your data" onClick={() => setActiveSetting('privacy')} />{activeSetting && <SettingsDetailPanel setting={activeSetting} onClose={() => setActiveSetting(null)} remoteScanEnabled={remoteScanEnabled} onRemoteScanChange={onRemoteScanChange} />}</section><section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><h2 className="font-bold">Social Links &amp; Reviews</h2><SocialInput label="Instagram" value={instagram} onChange={setInstagram} placeholder="https://www.instagram.com/yourpage" /><SocialInput label="Facebook" value={facebook} onChange={setFacebook} placeholder="https://www.facebook.com/yourpage" /><SocialInput label="YouTube" value={youtube} onChange={setYoutube} placeholder="https://youtube.com/@yourchannel" /><SocialInput label="WhatsApp Number" value={whatsapp} onChange={setWhatsapp} placeholder="8446791696" /></section><button type="button" onClick={onSave} className="w-full rounded-xl bg-[#1f7775] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#185e5c]">{saved ? 'Settings Updated' : 'Update Profile & Settings'}</button></div></main>;
}

function SettingsField({ icon, label, hint, children }: { icon: React.ReactNode; label: string; hint: string; children: React.ReactNode }) { return <div className="border-b border-slate-100 py-4 last:border-b-0"><div className="flex items-center gap-3"><span className="text-[#1f7775]">{icon}</span><div><p className="text-sm font-bold">{label}</p><p className="text-[11px] text-slate-500">{hint}</p></div></div>{children}</div>; }
function SettingsLink({ icon, title, hint, onClick }: { icon: React.ReactNode; title: string; hint: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 border-b border-slate-100 py-4 text-left last:border-b-0 hover:bg-slate-50"><span className="text-[#1f7775]">{icon}</span><span className="flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-0.5 block text-[11px] text-slate-500">{hint}</span></span><ChevronRight className="h-4 w-4 text-slate-400" /></button>; }
function SettingsDetailPanel({ setting, onClose, remoteScanEnabled, onRemoteScanChange }: { setting: 'account' | 'social' | 'subscription' | 'locations' | 'notifications' | 'privacy'; onClose: () => void; remoteScanEnabled: boolean; onRemoteScanChange: (enabled: boolean) => void }) {
  const content = {
    account: { title: 'Business account', text: 'Your business profile and contact information are managed above.' },
    social: { title: 'Social Links & Reviews', text: 'Add your Instagram, Facebook, YouTube and WhatsApp links in the section below.' },
    subscription: { title: 'Subscription', text: 'Current plan: Growth. Your loyalty tools and QR campaigns are active.' },
    locations: { title: 'Manage Locations', text: 'Your current store location is active. Add more branches from the admin panel.' },
    notifications: { title: 'Notifications', text: 'New customer approvals and claim alerts are enabled for this terminal.' },
    privacy: { title: 'Privacy & Security', text: 'Customer data is isolated to your store. Keep your account credentials private.' },
  }[setting];
  return <div className="mt-3 rounded-xl border border-[#cde4e1] bg-[#f3faf9] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#123c46]">{content.title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{content.text}</p></div><button type="button" onClick={onClose} className="text-xs font-bold text-[#1f7775]">Close</button></div>{setting === 'notifications' && <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3 text-xs font-semibold"><span>Approval alerts</span><span className="text-emerald-600">Enabled</span></div>}{setting === 'privacy' && <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3 text-xs font-semibold"><span>Remote scan access</span><button type="button" onClick={() => onRemoteScanChange(!remoteScanEnabled)} className="font-bold text-[#1f7775]">{remoteScanEnabled ? 'Turn off' : 'Turn on'}</button></div>}</div>;
}
function SocialInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="mt-3 block text-xs font-semibold text-slate-600">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#1f7775]" /></label>; }

function MerchantBottomNav({ activeView, onSelect }: { activeView: MerchantView; onSelect: (view: MerchantView) => void }) {
  const items: Array<{ view: MerchantView; label: string; icon: React.ReactNode }> = [
    { view: 'qr', label: 'QR Code', icon: <QrCode className="h-5 w-5" /> },
    { view: 'customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
    { view: 'rewards', label: 'Rewards', icon: <Percent className="h-5 w-5" /> },
    { view: 'offer', label: 'Create Offer', icon: <PlusCircle className="h-5 w-5" /> },
    { view: 'settings', label: 'Profile', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <nav className="sticky bottom-0 z-30 w-full border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-lg items-center justify-around overflow-x-auto no-scrollbar gap-1">
        {items.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => onSelect(item.view)}
            className={`flex flex-1 min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition active:scale-95 ${
              activeView === item.view
                ? 'text-[#1f7775] font-extrabold bg-[#e3f1ef]/70'
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

function MerchantFeaturePanel({
  view,
  claims,
  shopName,
  offerTitle,
  offerMessage,
  offerImage,
  visitsRequired,
  rewardExpiry,
  offerSaved,
  onOfferTitleChange,
  onOfferMessageChange,
  onOfferImageChange,
  onVisitsRequiredChange,
  onRewardExpiryChange,
  onSaveOffer,
}: {
  view: Exclude<MerchantView, 'qr'>;
  claims: Claim[];
  shopName: string;
  offerTitle: string;
  offerMessage: string;
  offerImage: string;
  visitsRequired: string;
  rewardExpiry: string;
  offerSaved: boolean;
  onOfferTitleChange: (value: string) => void;
  onOfferMessageChange: (value: string) => void;
  onOfferImageChange: (value: string) => void;
  onVisitsRequiredChange: (value: string) => void;
  onRewardExpiryChange: (value: string) => void;
  onSaveOffer: () => void;
}) {
  if (view === 'customers') {
    return <CustomerDirectory claims={claims} shopName={shopName} />;
  }

  if (view === 'rewards') {
    const acceptedClaims = claims.filter((claim) => claim.status === 'ACCEPTED');
    return <FeatureShell title="Rewards" subtitle="Accepted customer rewards and redemptions"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Rewards claimed" value={String(acceptedClaims.length)} /><Metric label="Discount rate" value="10%" /><Metric label="Repeat customers" value={String(new Set(acceptedClaims.map((claim) => claim.customerMobile)).size)} /></div><div className="mt-6"><EmptyMerchantPanel text={acceptedClaims.length ? 'Accepted rewards are reflected in the metrics above.' : 'No rewards have been accepted yet.'} /></div></FeatureShell>;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onOfferImageChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return <FeatureShell title="Create Offer" subtitle="Build a reward card customers will want to complete"><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><form onSubmit={(event) => { event.preventDefault(); onSaveOffer(); }} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Reward Programs</h3><span className="text-xs text-slate-400">+ Add Reward</span></div><label className="block text-sm font-semibold text-slate-700">Reward image<div className="mt-2 flex items-center gap-4"><label className="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 hover:bg-slate-50">{offerImage ? <img src={offerImage} alt="Reward preview" className="h-full w-full object-cover" /> : <span className="text-center text-xs text-slate-400">Upload<br />image</span>}<input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label><p className="max-w-xs text-xs leading-5 text-slate-500">Upload a square image for your reward card. Customers will see this image in the offer preview.</p></div></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Visits required<input type="number" min="1" max="99" value={visitsRequired} onChange={(event) => onVisitsRequiredChange(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#1f7775]" /></label><label className="block text-sm font-semibold text-slate-700">Reward expiry (days)<input type="number" min="1" max="365" value={rewardExpiry} onChange={(event) => onRewardExpiryChange(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#1f7775]" /></label></div><label className="block text-sm font-semibold text-slate-700">Reward description<div className="mt-2 flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2"><Gift className="mt-2 h-4 w-4 shrink-0 text-[#1f7775]" /><input value={offerTitle} onChange={(event) => onOfferTitleChange(event.target.value)} required placeholder="15% off on your next visit" className="w-full py-2 text-sm outline-none" /></div></label><label className="block text-sm font-semibold text-slate-700">Additional details<textarea value={offerMessage} onChange={(event) => onOfferMessageChange(event.target.value)} required placeholder="Reward loyal customers with a special treat." rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#1f7775]" /></label><button type="submit" className="rounded-xl bg-[#1f7775] px-5 py-3 text-sm font-bold text-white hover:bg-[#185e5c]">Save reward</button>{offerSaved && <p className="text-sm font-semibold text-emerald-600">Reward saved for {shopName}.</p>}</form><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</p><div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex h-36 items-center justify-center bg-slate-100">{offerImage ? <img src={offerImage} alt="Live reward preview" className="h-full w-full object-cover" /> : <Gift className="h-10 w-10 text-slate-300" />}</div><div className="p-4"><h3 className="font-bold text-slate-900">{offerTitle || 'Your reward description'}</h3><p className="mt-3 text-xs text-slate-500">{visitsRequired || '8'} visits required</p><p className="mt-1 text-xs text-slate-500">Reward expires in {rewardExpiry || '30'} days</p><p className="mt-3 text-xs leading-5 text-slate-500">{offerMessage || 'Your reward details will appear here.'}</p></div></div></div></div></FeatureShell>;
}

function FeatureShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section><div className="mb-6"><h2 className="text-2xl font-black text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{children}</section>; }
function CustomerDirectory({ claims, shopName }: { claims: Claim[]; shopName: string }) {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedMobile, setSelectedMobile] = useState<string | null>(null);
  const customers = Array.from(new Map(claims.map((claim) => [claim.customerMobile, claim])).values());
  const filteredCustomers = customers.filter((customer) => filter === 'ALL' || (filter === 'ACTIVE' ? customer.status === 'PENDING' : customer.status === 'ACCEPTED'));

  const exportCustomers = () => {
    const rows = [['Name', 'Mobile', 'Visits', 'Last Visit', 'Status'], ...customers.map((customer) => {
      const customerClaims = claims.filter((claim) => claim.customerMobile === customer.customerMobile);
      return [customer.customerName, customer.customerMobile, String(customerClaims.length), new Date(customer.createdAt).toLocaleString(), customer.status];
    })];
    const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `${shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-customers.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <FeatureShell title="Customers" subtitle={`Customer activity at ${shopName}`}><div className="flex items-center justify-end"><button type="button" onClick={exportCustomers} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#1f7775] hover:text-[#1f7775]"><Download className="h-4 w-4" /> Export</button></div><div className="mt-4 flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold"><FilterButton label="All" active={filter === 'ALL'} onClick={() => setFilter('ALL')} /><FilterButton label="Active" active={filter === 'ACTIVE'} onClick={() => setFilter('ACTIVE')} /><FilterButton label="Completed" active={filter === 'COMPLETED'} onClick={() => setFilter('COMPLETED')} /></div><div className="mt-4 space-y-3">{filteredCustomers.length === 0 ? <EmptyMerchantPanel text="No customers match this filter." /> : filteredCustomers.map((customer) => <CustomerDetail key={customer.customerMobile} customer={customer} claims={claims.filter((claim) => claim.customerMobile === customer.customerMobile)} expanded={selectedMobile === customer.customerMobile} onToggle={() => setSelectedMobile(selectedMobile === customer.customerMobile ? null : customer.customerMobile)} />)}</div></FeatureShell>;
}

function CustomerDetail({ customer, claims, expanded, onToggle }: { customer: Claim; claims: Claim[]; expanded: boolean; onToggle: () => void }) {
  const lastVisit = new Date(Math.max(...claims.map((claim) => new Date(claim.createdAt).getTime())));
  return <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${expanded ? 'border-[#e1a928]' : 'border-slate-200'}`}><button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-4 text-left"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8e6e6] text-xs font-bold text-[#a80713]">{customer.customerName.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{customer.customerName}</p><p className="mt-1 text-[11px] text-slate-500">+91 {customer.customerMobile}</p></div></div><div className="text-right"><p className="text-xs font-bold text-[#a80713]">{claims.length}/4</p><p className="text-[9px] uppercase tracking-wide text-slate-400">stamps</p></div></button>{expanded && <div className="border-t border-slate-100 px-4 pb-4 pt-3"><div className="grid grid-cols-3 gap-2 text-xs"><div><p className="text-slate-400">Total Visits</p><p className="mt-1 font-bold">{claims.length}</p></div><div><p className="text-slate-400">Last Visit</p><p className="mt-1 font-bold">{formatRelative(lastVisit)}</p></div><div><p className="text-slate-400">Status</p><p className="mt-1 font-bold text-emerald-600">{customer.status === 'ACCEPTED' ? 'Active' : 'Pending'}</p></div></div><div className="mt-4 border-t border-slate-100 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scan History</p><div className="mt-2 space-y-2">{claims.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((claim, index) => <div key={claim.id} className="flex items-center justify-between text-[11px] text-slate-600"><span>#{claims.length - index} {new Date(claim.createdAt).toLocaleDateString()} {new Date(claim.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span><MapPin className="h-3.5 w-3.5 text-[#1f7775]" /></div>)}</div></div></div>}</div>;
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-lg px-4 py-2 ${active ? 'bg-[#1f7775] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{label}</button>; }
function formatRelative(date: Date) { const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000)); return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} hr ago`; }
function EmptyMerchantPanel({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{text}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-900">{value}</p></div>; }
