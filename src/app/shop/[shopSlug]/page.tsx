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
  MapPin,
  User,
  CheckCircle2,
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

      // Auto-claim if details are saved in localStorage
      if (typeof window !== "undefined") {
        const savedName = localStorage.getItem("customer_name");
        if (savedName && savedMobile && savedMobile.length === 10) {
          setName(savedName);
          setMobile(savedMobile);
          createClaimForShop(savedName, savedMobile, data.shop.id);
        } else {
          setShowEditForm(true);
        }
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
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-[#a80713]" />
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
    <div className="min-h-screen bg-[#f3f4f6] pb-24 text-slate-900 font-sans">
      {/* 1. TOP HEADER BANNER (Crimson Red matching screenshot) */}
      <header className="bg-gradient-to-b from-[#a80713] to-[#8c050f] text-white pt-6 pb-5 px-5 rounded-b-[32px] shadow-lg">
        <div className="max-w-md mx-auto">
          {/* Shop Avatar & Name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-white text-[#a80713] font-black text-lg rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              {shopInitial}
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">{shop?.name}</h1>
          </div>

          {/* Stamp Summary */}
          <div className="mb-5">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {stampsCount} of {offer.visitsRequired} Stamps
            </h2>
          </div>

          {/* Tab Switcher (Rewards / Menu) */}
          <div className="flex items-center justify-center bg-black/20 p-1 rounded-full max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab("rewards")}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "rewards"
                  ? "bg-[#80050f] text-white shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Rewards</span>
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "menu"
                  ? "bg-[#80050f] text-white shadow-md"
                  : "text-white/80 hover:text-white"
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 my-3 flex items-center justify-between gap-3">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#a80713] flex-shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {offer.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  {offer.visitsRequired} STAMPS • Collect {visitsLeft} more
                </p>
              </div>
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap self-start">
                {offer.expiryDays} DAY Expiry
              </div>
            </div>

            {/* 3. STAMP CARD GRID */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 my-3">
              <div className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mb-4">
                STAMP CARD
              </div>

              {/* 8 Circular Stamp Slots */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 justify-items-center mb-4">
                {Array.from({ length: offer.visitsRequired }).map((_, index) => {
                  const stampNum = index + 1;
                  const isEarned = stampNum <= stampsCount;
                  const isFinalGift = stampNum === offer.visitsRequired;

                  if (isEarned) {
                    return (
                      <div
                        key={stampNum}
                        className="w-11 h-11 rounded-full bg-[#a80713] text-white flex items-center justify-center font-bold text-sm shadow-md transition-transform scale-105"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    );
                  }

                  if (isFinalGift) {
                    return (
                      <div
                        key={stampNum}
                        className="w-11 h-11 rounded-full border-2 border-dashed border-rose-400 bg-rose-50 text-rose-500 flex items-center justify-center"
                      >
                        <Gift className="w-5 h-5" />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={stampNum}
                      className="w-11 h-11 rounded-full border-2 border-dashed border-slate-300 text-slate-400 font-semibold text-xs flex items-center justify-center bg-slate-50/50"
                    >
                      {stampNum}
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs font-medium text-slate-500">
                You're <strong className="text-[#a80713]">{visitsLeft} stamps</strong> away from{" "}
                <span className="font-semibold text-slate-700">{offer.title}</span>
              </p>
            </div>

            {/* 4. BUSINESS INFO SECTION */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 my-3">
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
              <div className="my-4">
                <div className="bg-emerald-950 text-white rounded-2xl p-3 mb-3 border border-emerald-800 flex items-center gap-2 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Live Merchant Claim Active for {shop?.name}!</span>
                </div>
                <ScratchCard claim={createdClaim} />
              </div>
            ) : showEditForm ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 my-3">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-[#a80713]" />
                  <h3 className="text-sm font-bold text-slate-900">Scratch Card & Stamp Claim</h3>
                </div>

                {submitError && (
                  <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Aapka Naam
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      minLength={2}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs outline-none focus:border-[#a80713] focus:ring-1 focus:ring-[#a80713]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs outline-none focus:border-[#a80713] focus:ring-1 focus:ring-[#a80713]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#a80713] hover:bg-[#8c050f] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" /> Claim Stamp & Open Scratch Card
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* 6. BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-full px-6 py-2 flex items-center gap-6 z-40">
        <button className="text-slate-400 hover:text-slate-700 p-1" title="Home">
          <Home className="w-5 h-5" />
        </button>
        <button className="text-slate-400 hover:text-slate-700 p-1" title="Location">
          <MapPin className="w-5 h-5" />
        </button>
        <button
          className="w-11 h-11 bg-[#a80713] text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-900/30 active:scale-95 transition-all -my-2"
          title="Scan QR"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        >
          <QrCode className="w-5 h-5" />
        </button>
        <button className="text-slate-400 hover:text-slate-700 p-1" title="Rewards">
          <Gift className="w-5 h-5" />
        </button>
        <button className="text-slate-400 hover:text-slate-700 p-1" title="Profile">
          <User className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
}