"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { QrCode, Store, CheckCircle2, AlertCircle, Loader2, Gift, Sparkles } from "lucide-react";

interface ShopInfo {
  id: string;
  name: string;
  category: string;
  address: string;
}

export default function ShopScanPage() {
  const params = useParams();
  const shopSlug = params?.shopSlug as string;

  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimCode, setClaimCode] = useState<string | null>(null);

  // 1. Load shop info by slug + log QR scan
  const loadShop = useCallback(async () => {
    if (!shopSlug) return;
    try {
      const res = await fetch(`/api/shop-by-slug?slug=${shopSlug}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setShopError("Yeh QR code valid nahi hai ya shop band ho gayi hai.");
        return;
      }
      setShop(data.shop);

      // Log QR scan silently
      fetch("/api/qr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: data.shop.id }),
      }).catch(() => {});
    } catch (err) {
      setShopError("Shop load karne mein error aaya.");
    } finally {
      setIsLoadingShop(false);
    }
  }, [shopSlug]);

  useEffect(() => { loadShop(); }, [loadShop]);

  // 2. Submit claim
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          shopId: shop.id,
          identificationMethod: "COUNTER_SESSION",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.message || "Request submit karne mein error aaya.");
        return;
      }
      setClaimCode(data.claim?.claimCode || null);
      setClaimSuccess(true);
    } catch (err) {
      setSubmitError("Server se connect nahi ho pa raha. Dobara try karo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-400" />
          <p className="text-slate-300">Shop load ho rahi hai...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (shopError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid QR Code</h2>
          <p className="text-slate-500 text-sm">{shopError}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (claimSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-slate-900 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Request Bhej Di! 🎉</h2>
          <p className="text-slate-500 text-sm mb-4">
            Aapki scratch card request <span className="font-bold text-slate-700">{shop?.name}</span> ko bhej di gayi hai.
            Merchant approve karega toh aap scratch kar sakte ho!
          </p>
          {claimCode && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Claim Code</div>
              <div className="text-2xl font-black font-mono text-slate-900 tracking-widest">{claimCode}</div>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <span className="font-semibold">📱 Merchant ke paas jao</span> aur yeh code dikhao — woh approve karega!
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Shop Header Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 mb-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">
                <QrCode className="w-3 h-3 inline mr-1" />QR Verified
              </div>
              <h1 className="text-lg font-black text-white leading-tight">{shop?.name}</h1>
              <p className="text-xs text-slate-300">{shop?.category} • {shop?.address?.slice(0, 35)}...</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <div className="text-center mb-5">
            <div className="inline-flex p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-3 shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Scratch Card Pao! <Sparkles className="w-4 h-4 inline text-amber-500" /></h2>
            <p className="text-xs text-slate-500 mt-1">Apna naam aur mobile number enter karo</p>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Aapka Naam
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                minLength={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Bhej raha hun...</>
              ) : (
                <><Gift className="w-4 h-4" /> Scratch Card Request Bhejo</>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-400 mt-4">
            Request bhejne ke baad merchant approve karega. Sirf ek request 24 ghante mein.
          </p>
        </div>
      </div>
    </div>
  );
}