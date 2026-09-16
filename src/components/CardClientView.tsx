"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  QrCode,
  Store,
  AlertCircle,
  Loader2,
  Gift,
  Sparkles,
  UtensilsCrossed,
  Home,
  Compass,
  User,
  Check,
} from "lucide-react";
import ScratchCard from "@/components/ScratchCard";
import { Claim } from "@/types";

interface ShopInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  slug: string;
}

interface OfferInfo {
  title: string;
  discountPercent: number;
  visitsRequired: number;
  expiryDays: number;
  expiryDate?: string;
  description?: string;
  terms?: string;
  image?: string;
  isActive?: boolean;
  isExpired?: boolean;
}

interface CardClientViewProps {
  shopSlug?: string;
}

export default function CardClientView({ shopSlug: initialSlug }: CardClientViewProps) {
  const params = useParams();
  const shopSlug = initialSlug || (params?.shopSlug as string);

  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [offer, setOffer] = useState<OfferInfo>({
    title: "Get 5% discount on your total bill after 8 visits",
    discountPercent: 5,
    visitsRequired: 8,
    expiryDays: 30,
  });
  const [stampsCount, setStampsCount] = useState(0);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"rewards" | "menu">("rewards");

  // Customer Login State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdClaim, setCreatedClaim] = useState<Claim | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auto-submit claim helper
  const createClaimForShop = useCallback(
    async (custName: string, custMobile: string, targetShopId: string) => {
      if (!targetShopId) {
        setSubmitError("Merchant ID missing. Please scan a merchant QR code.");
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: custName,
            mobile: custMobile,
            shopId: targetShopId,
            identificationMethod: "COUNTER_SESSION",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setSubmitError(data.message || "Request submit karne mein error aaya.");
          setShowEditForm(true);
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("customer_name", custName);
          localStorage.setItem("customer_mobile", custMobile);
          localStorage.setItem("drutoCustomer", JSON.stringify({ name: custName, mobile: custMobile }));
        }
        setCreatedClaim(data.claim);
      } catch (err) {
        setSubmitError("Server se connect nahi ho pa raha. Dobara try karo.");
        setShowEditForm(true);
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // Load shop info by slug + log QR scan + check login state
  const loadShop = useCallback(async () => {
    if (!shopSlug) {
      setShopError("No merchant QR code scanned. Please scan a merchant QR code to view shop card.");
      setIsLoadingShop(false);
      return;
    }
    try {
      let savedName = "";
      let savedMobile = "";
      if (typeof window !== "undefined") {
        savedName = localStorage.getItem("customer_name") || "";
        savedMobile = localStorage.getItem("customer_mobile") || "";
        
        if (!savedName || !savedMobile) {
          const druto = localStorage.getItem("drutoCustomer");
          if (druto) {
            try {
              const parsed = JSON.parse(druto);
              if (parsed.name) savedName = parsed.name;
              if (parsed.mobile) savedMobile = parsed.mobile;
            } catch {}
          }
        }
      }

      const res = await fetch(`/api/shop-by-slug?slug=${encodeURIComponent(shopSlug)}&mobile=${encodeURIComponent(savedMobile)}`);
      const data = await res.json();
      if (data.success && data.shop) {
        setShop(data.shop);
        if (data.offer) setOffer(data.offer);
        if (data.stampsCount !== undefined) setStampsCount(data.stampsCount);

        // Log QR scan silently
        fetch("/api/qr-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shopId: data.shop.id }),
        }).catch(() => {});
      } else {
        setShopError(data.message || "Merchant shop not found. Please scan a valid merchant QR code.");
        setShop(null);
      }

      if (savedName.trim() && savedMobile.trim().length === 10) {
        setName(savedName);
        setMobile(savedMobile);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.warn("Shop load error:", err);
      setShopError("Failed to load merchant shop details.");
    } finally {
      setIsLoadingShop(false);
    }
  }, [shopSlug]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  // Poll for live stamp count updates every 2 seconds when logged in
  useEffect(() => {
    const targetMobile = mobile || (typeof window !== "undefined" ? localStorage.getItem("customer_mobile") || "" : "");
    if (!shopSlug || !targetMobile) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/shop-by-slug?slug=${encodeURIComponent(shopSlug)}&mobile=${encodeURIComponent(targetMobile)}`);
        const data = await res.json();
        if (data.success && data.stampsCount !== undefined) {
          setStampsCount(data.stampsCount);
        }
      } catch (err) {
        // silent catch
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [shopSlug, mobile, isLoggedIn]);

  // Handle Login Submission & Explicit Card Collection Request
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || name.trim().length < 2) {
      setSubmitError("Please enter your full name (minimum 2 characters).");
      return;
    }
    const cleanMob = mobile.replace(/[^0-9]/g, "");
    if (cleanMob.length !== 10) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setName(name.trim());
    setMobile(cleanMob);
    setIsLoggedIn(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("customer_name", name.trim());
      localStorage.setItem("customer_mobile", cleanMob);
      localStorage.setItem("drutoCustomer", JSON.stringify({ name: name.trim(), mobile: cleanMob }));
    }

    setShowLoginModal(false);

    if (shop?.id) {
      await createClaimForShop(name.trim(), cleanMob, shop.id);
    }
  };

  // Loading state
  if (isLoadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="text-center text-slate-100">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-purple-400" />
          <p className="text-sm font-semibold text-purple-200">Shop Dashboard load ho raha hai...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (shopError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] p-4">
        <div className="bg-[#161D2F] rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-purple-500/20 text-white">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid QR Code</h2>
          <p className="text-purple-200/70 text-sm">{shopError}</p>
        </div>
      </div>
    );
  }

  const shopInitial = shop?.name ? shop.name.charAt(0).toUpperCase() : "S";
  const visitsLeft = Math.max(0, offer.visitsRequired - stampsCount);

  return (
    <div className="min-h-screen bg-[#0B0F17] pb-28 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* 1. TOP HEADER BANNER */}
      <header className="bg-gradient-to-r from-violet-900 via-purple-900 to-[#161D2F] text-white pt-5 pb-6 px-6 rounded-b-[28px] shadow-xl shadow-purple-950/30 border-b border-purple-500/20">
        <div className="max-w-md mx-auto">
          {/* Back button */}
          <div className="mb-3">
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-200 hover:text-white transition-all"
            >
              ← Back
            </Link>
          </div>

          {/* Shop Avatar, Name & Customer Identity */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-xl rounded-full flex items-center justify-center shadow-md border border-purple-400/30 flex-shrink-0">
                {shopInitial}
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">{shop?.name}</h1>
                <p className="text-[10px] text-purple-300/70 font-medium">{shop?.category}</p>
              </div>
            </div>
            {name && (
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="text-[10px] font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-2.5 py-1 rounded-full border border-purple-500/30 transition-all flex items-center gap-1"
                title="Click to switch account"
              >
                <User className="w-3 h-3 text-purple-300" />
                <span>Hi, {name.split(" ")[0]}</span>
              </button>
            )}
          </div>

          {/* Stamp Summary Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {stampsCount} of {offer.visitsRequired || 8} Stamps
            </h2>
            <div className="mt-3 h-2.5 rounded-full bg-slate-900/60 overflow-hidden border border-purple-500/20">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, (stampsCount / (offer.visitsRequired || 8)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Tab Switcher Container */}
          <div className="bg-[#161D2F] rounded-full p-1.5 shadow-md max-w-md mx-auto flex items-center justify-between border border-purple-500/20">
            <button
              onClick={() => setActiveTab("rewards")}
              className={`w-1/2 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "rewards"
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md border border-purple-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Rewards</span>
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`w-1/2 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "menu"
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md border border-purple-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {activeTab === "menu" ? (
          <div className="bg-[#161D2F] rounded-3xl p-8 text-center shadow-xl border border-purple-500/20 my-4 text-white">
            <UtensilsCrossed className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Digital Menu</h3>
            <p className="text-xs text-purple-200/70 mt-1">
              {shop?.name} ka menu counter par available hai.
            </p>
          </div>
        ) : (
          <>
            {/* EXPIRY ALERT BANNER */}
            {offer.isExpired && (
              <div className="bg-rose-950/50 border border-rose-500/30 rounded-2xl p-4 my-3 flex items-center gap-3 text-rose-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <div>
                  <p className="text-xs font-bold">This Offer has Expired</p>
                  <p className="text-[11px] text-rose-400">This reward card is no longer active and stamps cannot be claimed.</p>
                </div>
              </div>
            )}

            {/* SUBMIT / DUPLICATE ERROR BANNER */}
            {submitError && (
              <div className="bg-amber-950/50 border border-amber-500/30 rounded-2xl p-4 my-3 flex items-center gap-3 text-amber-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <p className="text-xs font-semibold">{submitError}</p>
              </div>
            )}

            {/* 2. REWARDS CARD BOX */}
            <div className="bg-[#161D2F] rounded-3xl p-4 shadow-xl border border-purple-500/20 my-3 flex items-center justify-between gap-3 text-white">
              <div className="w-14 h-14 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-300 flex-shrink-0 overflow-hidden">
                {offer.image ? (
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                ) : (
                  <Gift className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 mb-0.5">
                  YOUR NEXT TREAT
                </div>
                <h3 className="text-xs font-bold text-white leading-snug truncate">
                  {offer.title || "Free reward of your choice"}
                </h3>
                <p className="text-[10px] text-purple-300/70 font-bold uppercase tracking-wider mt-1">
                  Collect {visitsLeft} more stamps
                </p>
              </div>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 whitespace-nowrap pt-1">
                {offer.expiryDate ? `EXP: ${offer.expiryDate}` : `${offer.expiryDays} DAY Expiry`}
              </div>
            </div>

            {/* 3. STAMP CARD GRID */}
            <div className="bg-[#161D2F] rounded-3xl p-6 shadow-xl border border-purple-500/20 my-3 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] text-purple-300/60 font-extrabold tracking-widest uppercase">
                  STAMP CARD ({offer.visitsRequired || 8} STAMPS)
                </div>
                {isLoggedIn && !offer.isExpired && stampsCount < (offer.visitsRequired || 8) && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!mobile || !shop?.id) return;
                      setIsSubmitting(true);
                      try {
                        const res = await fetch("/api/demo/add-stamps", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: name || "Demo Customer",
                            mobile,
                            shopId: shop.id,
                            targetStamps: offer.visitsRequired || 8,
                          }),
                        });
                        const data = await res.json();
                        if (data.success && data.stampsCount !== undefined) {
                          setStampsCount(data.stampsCount);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="text-[10px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>⚡ Quick Test ({offer.visitsRequired || 8} Stamps)</span>
                  </button>
                )}
              </div>

              {/* Circular Stamp Slots Grid - dynamically based on offer.visitsRequired */}
              <div className={`grid gap-3 mb-5 max-w-[320px] mx-auto justify-items-center ${
                (offer.visitsRequired || 8) <= 5 ? 'grid-cols-5' : 'grid-cols-4'
              }`}>
                {Array.from({ length: offer.visitsRequired || 8 }).map((_, index) => {
                  const stampNum = index + 1;
                  const isEarned = stampNum <= stampsCount;
                  const isLast = stampNum === (offer.visitsRequired || 8);

                  return (
                    <div key={stampNum} className="flex flex-col items-center gap-1">
                      {isEarned ? (
                        <div
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-600/30 transition-all scale-105 border border-purple-400/30"
                          title={`Stamp #${stampNum} (Day ${stampNum}) Collected`}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                            isLast
                              ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                              : "border-slate-700 bg-slate-900/60 text-slate-500"
                          }`}
                          title={`Stamp #${stampNum} (Day ${stampNum})`}
                        >
                          {isLast ? <Gift className="w-5 h-5" /> : stampNum}
                        </div>
                      )}
                      <span className={`text-[10px] font-bold ${isEarned ? "text-purple-300" : "text-slate-500"}`}>
                        Day {stampNum}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-purple-200/70 font-medium pt-1 mb-4">
                {stampsCount >= (offer.visitsRequired || 8) ? (
                  <strong className="text-amber-400 font-black text-sm block">🎉 CONGRATULATIONS! YOU UNLOCKED YOUR FREE TREAT!</strong>
                ) : offer.isExpired ? (
                  <strong className="text-rose-400 font-bold block">This offer has expired.</strong>
                ) : (
                  <>You're <strong className="text-purple-300 font-bold">{visitsLeft} stamps</strong> away from your treat!</>
                )}
              </p>

              {/* Claim Reward Pill Button */}
              <button
                type="button"
                onClick={() => {
                  if (offer.isExpired) return;
                  const savedName = (typeof window !== "undefined" ? localStorage.getItem("customer_name") : "") || name;
                  const savedMob = (typeof window !== "undefined" ? localStorage.getItem("customer_mobile") : "") || mobile;
                  if (!savedMob || savedMob.trim().length !== 10 || !isLoggedIn) {
                    setShowLoginModal(true);
                    return;
                  }
                  if (shop?.id) {
                    createClaimForShop(savedName || "Customer", savedMob, shop.id);
                  }
                }}
                disabled={isSubmitting || Boolean(offer.isExpired)}
                className={`w-full py-3.5 font-extrabold text-sm rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 ${
                  offer.isExpired
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : stampsCount >= (offer.visitsRequired || 8)
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-purple-600/30 border border-purple-400/30'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>
                  {offer.isExpired
                    ? "Offer Expired"
                    : stampsCount >= (offer.visitsRequired || 8)
                    ? `Redeem ${offer.visitsRequired || 8}th Stamp Reward`
                    : "Claim Reward"}
                </span>
              </button>
            </div>

            {/* 4. BUSINESS INFO SECTION */}
            <div className="bg-[#161D2F] rounded-2xl p-5 shadow-xl border border-purple-500/20 my-3 text-white">
              <div className="text-[10px] text-purple-300/60 font-extrabold tracking-widest uppercase mb-2">
                BUSINESS INFO
              </div>
              <h3 className="text-sm font-bold text-white">{shop?.name}</h3>
              <p className="text-xs text-purple-200/70 mt-0.5">
                {shop?.category} {shop?.address ? `• ${shop.address}` : ""}
              </p>
            </div>

            {/* 5. INTERACTIVE SCRATCH CARD & CLAIM SECTION */}
            {createdClaim ? (
              <div className="my-4">
                <ScratchCard
                  claim={createdClaim}
                  onStatusUpdated={async (updatedClaim) => {
                    setCreatedClaim(updatedClaim);
                    if (updatedClaim.status === "ACCEPTED") {
                      const mob = mobile || (typeof window !== "undefined" ? localStorage.getItem("customer_mobile") || "" : "");
                      if (mob && shopSlug) {
                        try {
                          const res = await fetch(`/api/shop-by-slug?slug=${encodeURIComponent(shopSlug)}&mobile=${encodeURIComponent(mob)}`);
                          const data = await res.json();
                          if (data.success && data.stampsCount !== undefined) {
                            setStampsCount(data.stampsCount);
                          }
                        } catch {}
                      }
                    }
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* CUSTOMER LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-[#161D2F] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-purple-500/30 text-white text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Customer Details</h3>
                  <p className="text-[11px] text-purple-300/70">Enter mobile number to claim stamp</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>

            {submitError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCustomerLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070A10] border border-purple-500/30 text-white text-xs outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070A10] border border-purple-500/30 text-white text-xs font-mono outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 border border-purple-400/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit & Claim Stamp"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#161D2F]/95 backdrop-blur-md border border-purple-500/30 shadow-2xl rounded-full px-6 py-2.5 flex items-center gap-6 z-40">
        <Link href="/customer/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white" title="HOME">
          <Home className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">HOME</span>
        </Link>
        <Link href="/customer/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white" title="EXPLORE">
          <Compass className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">EXPLORE</span>
        </Link>
        <button
          className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-purple-600/40 active:scale-95 transition-all -mt-5 border-4 border-[#0B0F17]"
          title="SCAN QR"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        >
          <QrCode className="w-5 h-5" />
        </button>
        <Link href="/customer/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white" title="REWARDS">
          <Gift className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">REWARDS</span>
        </Link>
        <Link href="/customer/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white" title="PROFILE">
          <User className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">PROFILE</span>
        </Link>
      </nav>
    </div>
  );
}
