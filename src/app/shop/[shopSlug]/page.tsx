"use client";

import React, { useState, useEffect, useCallback } from "react";
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
}

export default function ShopScanPage() {
  const params = useParams();
  const shopSlug = params?.shopSlug as string;

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

  // Customer State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdClaim, setCreatedClaim] = useState<Claim | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Auto-submit claim helper
  const createClaimForShop = useCallback(
    async (custName: string, custMobile: string, targetShopId: string) => {
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

        // Save customer details for instant auto-open on future QR scans
        if (typeof window !== "undefined") {
          localStorage.setItem("customer_name", custName);
          localStorage.setItem("customer_mobile", custMobile);
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

  // Load shop info by slug + log QR scan + auto-claim if saved
  const loadShop = useCallback(async () => {
    if (!shopSlug) return;
    try {
      let savedMobile = "";
      if (typeof window !== "undefined") {
        savedMobile = localStorage.getItem("customer_mobile") || "";
      }

      const res = await fetch(`/api/shop-by-slug?slug=${shopSlug}&mobile=${savedMobile}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setShopError("Yeh QR code valid nahi hai ya shop band ho gayi hai.");
        return;
      }

      setShop(data.shop);
      if (data.offer) setOffer(data.offer);
      if (data.stampsCount !== undefined) setStampsCount(data.stampsCount);

      // Log QR scan silently
      fetch("/api/qr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: data.shop.id }),
      }).catch(() => {});

      // Populate saved customer details
      if (typeof window !== "undefined") {
        const savedName = localStorage.getItem("customer_name") || "";
        setName(savedName);
        setMobile(savedMobile);
      }
    } catch (err) {
      setShopError("Shop load karne mein error aaya.");
    } finally {
      setIsLoadingShop(false);
    }
  }, [shopSlug, createClaimForShop]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  // Poll for live stamp count updates every 2 seconds
  useEffect(() => {
    if (!shopSlug || !mobile) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/shop-by-slug?slug=${shopSlug}&mobile=${mobile}`);
        const data = await res.json();
        if (data.success && data.stampsCount !== undefined) {
          setStampsCount(data.stampsCount);
        }
      } catch (err) {
        // silent catch
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [shopSlug, mobile]);

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    createClaimForShop(name, mobile, shop.id);
  };

  // Loading state
  if (isLoadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center text-slate-800">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-[#BA0C1E]" />
          <p className="text-sm font-semibold text-slate-600">Shop Dashboard load ho raha hai...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (shopError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid QR Code</h2>
          <p className="text-slate-500 text-sm">{shopError}</p>
        </div>
      </div>
    );
  }

  const shopInitial = shop?.name ? shop.name.charAt(0).toUpperCase() : "S";
  const visitsLeft = Math.max(0, offer.visitsRequired - stampsCount);

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-28 text-slate-900 font-sans">
      {/* 1. TOP HEADER BANNER (Deep Red Matching Reference Design) */}
      <header className="bg-[#BA0C1E] text-white pt-6 pb-6 px-6 rounded-b-[28px] shadow-md">
        <div className="max-w-md mx-auto">
          {/* Shop Avatar & Name */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-white text-[#BA0C1E] font-black text-xl rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              {shopInitial}
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">{shop?.name}</h1>
          </div>

          {/* Stamp Summary Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {stampsCount} of {offer.visitsRequired || 8} Stamps
            </h2>
            <div className="mt-3 h-2.5 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, (stampsCount / (offer.visitsRequired || 8)) * 100))}%` }}
              />
            </div>
          </div>

          {/* White Tab Switcher Container */}
          <div className="bg-white rounded-full p-1.5 shadow-sm max-w-md mx-auto flex items-center justify-between border border-slate-100">
            <button
              onClick={() => setActiveTab("rewards")}
              className={`w-1/2 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "rewards"
                  ? "bg-[#BA0C1E] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Rewards</span>
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`w-1/2 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "menu"
                  ? "bg-[#BA0C1E] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
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
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200 my-4">
            <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Digital Menu</h3>
            <p className="text-xs text-slate-500 mt-1">
              {shop?.name} ka menu counter par available hai.
            </p>
          </div>
        ) : (
          <>
            {/* 2. REWARDS CARD BOX */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 my-3 flex items-center justify-between gap-3">
              <div className="w-13 h-13 bg-rose-50 rounded-2xl flex items-center justify-center text-[#80050F] flex-shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 mb-0.5">
                  YOUR NEXT TREAT
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {offer.title || "Free cupcake of your choice"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Collect {visitsLeft} more stamps
                </p>
              </div>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 whitespace-nowrap pt-1">
                {offer.expiryDays} DAY Expiry
              </div>
            </div>

            {/* 3. STAMP CARD GRID */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 my-3">
              <div className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mb-4">
                STAMP CARD
              </div>

              {/* 8 Circular Stamp Slots (0 to 8 stamps matching customer dashboard) */}
              <div className="grid grid-cols-4 gap-3 mb-5 max-w-[280px] mx-auto justify-items-center">
                {Array.from({ length: offer.visitsRequired || 8 }).map((_, index) => {
                  const stampNum = index + 1;
                  const isEarned = stampNum <= stampsCount;
                  const isLast = stampNum === (offer.visitsRequired || 8);

                  if (isEarned) {
                    return (
                      <div
                        key={stampNum}
                        className="w-12 h-12 rounded-full bg-[#80050F] text-white flex items-center justify-center font-bold text-sm shadow-md transition-all scale-105"
                        title={`Stamp #${stampNum} Collected`}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={stampNum}
                      className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center font-bold text-xs shadow-2xs transition-all ${
                        isLast
                          ? "border-[#80050F]/40 bg-rose-50 text-[#80050F]"
                          : "border-slate-200 bg-white text-slate-300"
                      }`}
                      title={`Stamp #${stampNum}`}
                    >
                      {isLast ? <Gift className="w-5 h-5" /> : stampNum}
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-slate-500 font-medium pt-1 mb-4">
                You're <strong className="text-[#80050F]">{visitsLeft} stamps</strong> away from your treat!
              </p>

              {/* Claim Reward Pill Button matching reference image */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const savedName = localStorage.getItem("customer_name") || "Guest Customer";
                    const savedMob = localStorage.getItem("customer_mobile") || "9876543210";
                    if (shop?.id) createClaimForShop(savedName, savedMob, shop.id);
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#80050F] hover:bg-[#68040C] text-white font-extrabold text-sm rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Reward</span>
              </button>
            </div>

            {/* 4. BUSINESS INFO SECTION */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 my-3">
              <div className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mb-2">
                BUSINESS INFO
              </div>
              <h3 className="text-sm font-bold text-slate-900">{shop?.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {shop?.category} {shop?.address ? `• ${shop.address}` : ""}
              </p>
            </div>

            {/* 5. INTERACTIVE SCRATCH CARD & CLAIM SECTION */}
            {createdClaim ? (
              <div className="my-4 space-y-3">
                {createdClaim.status === "PENDING" && (
                  <div className="bg-amber-50 text-amber-900 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold animate-pulse shadow-sm">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-sm text-amber-950">Card collection request sent.</div>
                      <div className="text-amber-800 text-[11px] mt-0.5">Waiting for merchant approval...</div>
                    </div>
                  </div>
                )}

                {createdClaim.status === "ACCEPTED" && (
                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold shadow-md">
                    <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-sm text-emerald-950">🎉 Card collected successfully!</div>
                      <div className="text-emerald-800 text-[11px] mt-0.5">Stamp #{stampsCount} has been added to your card!</div>
                    </div>
                  </div>
                )}

                {createdClaim.status === "REJECTED" && (
                  <div className="bg-rose-50 text-rose-900 border border-rose-300 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-sm text-rose-950">❌ Merchant rejected your card collection request.</div>
                      <div className="text-rose-800 text-[11px] mt-0.5">{createdClaim.rejectionReason || "Please verify with cashier."}</div>
                    </div>
                  </div>
                )}

                <ScratchCard
                  claim={createdClaim}
                  onStatusUpdated={(updatedClaim) => {
                    setCreatedClaim(updatedClaim);
                    if (updatedClaim.status === "ACCEPTED") {
                      setStampsCount((prev) => Math.max(prev + 1, 1));
                    }
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* 6. BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-full px-6 py-2.5 flex items-center gap-6 z-40">
        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800" title="HOME">
          <Home className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">HOME</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800" title="EXPLORE">
          <Compass className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">EXPLORE</span>
        </button>
        <button
          className="w-12 h-12 bg-[#BA0C1E] text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-900/30 active:scale-95 transition-all -mt-5 border-4 border-[#f3f4f6]"
          title="SCAN QR"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        >
          <QrCode className="w-5 h-5" />
        </button>
        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800" title="REWARDS">
          <Gift className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">REWARDS</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800" title="PROFILE">
          <User className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">PROFILE</span>
        </button>
      </nav>
    </div>
  );
}