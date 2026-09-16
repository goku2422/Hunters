'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Gift,
  Store,
  Users,
  BarChart3,
  Layers,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  Clock,
  Smartphone,
  Check,
  X,
  Award,
  HeartHandshake,
  Megaphone,
  HelpCircle,
  Star,
  CheckCircle,
  Bell,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTabStep, setActiveTabStep] = useState<number>(1);
  const [sampleSlotsCount, setSampleSlotsCount] = useState<number>(5);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      num: 1,
      title: 'Configure Reward Program',
      subtitle: 'Set visits, reward treat & expiry',
      desc: 'Merchant chooses the required number of visits (e.g. 5, 8, 10 stamps), uploads a reward photo, sets expiry rules and reward terms.',
      badge: 'Merchant Dashboard',
      icon: Sliders,
    },
    {
      num: 2,
      title: 'Display Unique Store QR',
      subtitle: 'Instant counter QR stand & poster',
      desc: 'Generate a high-res unique QR code bound to your shop. Print it or request a counter stand. No custom app download needed for users.',
      badge: 'Counter Stand / POS',
      icon: QrCode,
    },
    {
      num: 3,
      title: 'Customer Scans at Counter',
      subtitle: 'Seamless Web QR Scan in 3 seconds',
      desc: 'Customer opens camera or browser scanner. Shop card opens instantly with exact configured stamp slots and offer details.',
      badge: 'Customer Web Experience',
      icon: Smartphone,
    },
    {
      num: 4,
      title: 'Merchant Counter Approval',
      subtitle: '1 stamp per visit + duplicate block',
      desc: 'Cashier receives an instant popup alert with sound chime. Upon clicking APPROVE, 1 stamp is credited to customer. Same-day duplicate scans are blocked.',
      badge: 'Live Counter Security',
      icon: CheckCircle2,
    },
    {
      num: 5,
      title: 'Unlock Digital Scratch Card',
      subtitle: 'Instant reward reveal & redemption',
      desc: 'When stamps reach required visits, reward unlocks! Customer scratches digital card to reveal reward code & redeems at cashier.',
      badge: 'Reward Unlock',
      icon: Gift,
    },
  ];

  const faqs = [
    {
      q: 'Do customers need to download a heavy mobile app?',
      a: 'No! Flinty operates 100% on the web. Customers simply scan your store QR code with their mobile phone camera or web browser to view their stamp card instantly.',
    },
    {
      q: 'Can merchants configure custom stamp slots like 5, 8, or 10 visits?',
      a: 'Yes. In the Merchant Dashboard under "Create Offer", you can set any required visits count (e.g. 5, 6, 8, 10, or 12). Customer cards will dynamically adjust to show your exact number of stamp slots.',
    },
    {
      q: 'How does merchant counter approval work?',
      a: 'When a customer scans your QR code at your shop counter, a live pop-up alert with notification sound appears on your cashier dashboard. The cashier approves the visit with a single tap, crediting exactly 1 stamp.',
    },
    {
      q: 'Can a customer claim multiple stamps on the same day?',
      a: 'No. Flinty includes built-in backend same-day duplicate scan protection. A customer cannot submit duplicate stamp requests for the same merchant on the same calendar day.',
    },
    {
      q: 'Can reward offers have expiry dates?',
      a: 'Yes. Merchants can set explicit expiry dates or validity days. When an offer passes its expiry date, it automatically becomes inactive and customers cannot collect stamps on expired offers.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-rose-100 selection:text-[#BA0C1E]">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ───────────────────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#80050F] to-[#BA0C1E] text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-950/20 group-hover:scale-105 transition-all">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Flinty<span className="text-[#BA0C1E]">.</span>
              </span>
              <span className="hidden sm:block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 -mt-1">
                Digital Loyalty Network
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#BA0C1E] transition-all">How It Works</a>
            <a href="#features" className="hover:text-[#BA0C1E] transition-all">Merchant Features</a>
            <a href="#experience" className="hover:text-[#BA0C1E] transition-all">Customer Card</a>
            <a href="#pricing" className="hover:text-[#BA0C1E] transition-all">Pricing</a>
            <a href="#faq" className="hover:text-[#BA0C1E] transition-all">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#BA0C1E]" />
              <span>Customer Login</span>
            </Link>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#BA0C1E] hover:bg-[#960917] text-white text-xs font-bold shadow-md shadow-rose-900/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Merchant Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-rose-200/50 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-24 right-1/4 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-[#BA0C1E] text-xs font-extrabold uppercase tracking-wider mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen App-Free Loyalty Engine</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6">
              Turn Every Counter Scan Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BA0C1E] to-[#e11d48]">Repeat Customer</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8">
              Flinty empowers cafes, retail stores, salons, and restaurants to issue digital stamp cards via instant QR scan. Set custom visit targets, approve visits in real-time, and reward loyalty with digital scratch cards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#BA0C1E] hover:bg-[#960917] text-white text-sm font-extrabold shadow-xl shadow-rose-900/25 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Store className="w-5 h-5" />
                <span>Launch Merchant Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/customer/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <QrCode className="w-5 h-5 text-[#BA0C1E]" />
                <span>Try Customer QR Scanner</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Mobile App Download</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configurable Visits (5, 8, 10+)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Counter Approval</span>
              </div>
            </div>
          </div>

          {/* Floating UI Hero Showcase Mockup */}
          <div className="mt-14 max-w-5xl mx-auto relative">
            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Mockup Card 1: Merchant Create Offer */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="uppercase tracking-wider">MERCHANT PORTAL</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Active Program</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Custom Reward Setup</h4>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Target Visits:</span>
                      <span className="font-bold text-[#BA0C1E]">5 Visits</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Reward Treat:</span>
                      <span className="font-bold text-slate-800">Free Special Coffee</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Expiry Rule:</span>
                      <span className="font-bold text-emerald-700">30 Days</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#BA0C1E]/10 text-[#BA0C1E] text-[11px] font-bold text-center">
                    ✓ Saved to Real Database
                  </div>
                </div>

                {/* Mockup Card 2: Interactive Scan & Approval Alert */}
                <div className="bg-gradient-to-br from-[#80050F] to-[#BA0C1E] rounded-2xl p-6 text-white text-left space-y-4 shadow-xl shadow-rose-950/20 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-100">LIVE COUNTER ALERT</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">Just Now</span>
                  </div>
                  <div>
                    <p className="text-xs text-rose-100 font-medium">Customer Scanned Counter QR</p>
                    <h3 className="text-lg font-black text-white">Rahul Sharma</h3>
                    <p className="text-xs font-mono text-white/80">+91 98765 43210</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs text-center shadow-md">
                      ✓ APPROVE (+1 STAMP)
                    </div>
                  </div>
                </div>

                {/* Mockup Card 3: Customer Unlocked Scratch Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="uppercase tracking-wider">CUSTOMER EXPERIENCE</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">Treat Unlocked</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">5 of 5 Stamps Completed!</h4>
                  <div className="flex justify-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="w-7 h-7 rounded-full bg-[#80050F] text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-xl text-center shadow-md space-y-1">
                    <Sparkles className="w-4 h-4 mx-auto text-yellow-200" />
                    <p className="text-xs font-black">Scratch Card Revealed!</p>
                    <p className="text-[10px] font-mono bg-black/20 py-0.5 rounded">CODE: TREAT-7842</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. HOW FLINTY WORKS (INTERACTIVE 5-STEP JOURNEY)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#BA0C1E] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              End-To-End Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              How Flinty Digital Loyalty Operates
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
              Explore the seamless journey from merchant configuration to customer reward redemption.
            </p>
          </div>

          {/* Interactive Step Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 max-w-4xl mx-auto">
            {steps.map((s) => {
              const isActive = activeTabStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setActiveTabStep(s.num)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#BA0C1E] text-white border-[#BA0C1E] shadow-md shadow-rose-900/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-white text-[#BA0C1E]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Highlight Box */}
          {(() => {
            const step = steps.find((s) => s.num === activeTabStep) || steps[0];
            const StepIcon = step.icon;
            return (
              <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-center">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold border border-rose-500/30">
                      <StepIcon className="w-4 h-4 text-rose-400" />
                      <span>{step.badge}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-wider text-rose-400">
                      {step.subtitle}
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                    <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span>Step {step.num} of 5</span>
                      <span>•</span>
                      <button
                        onClick={() => setActiveTabStep((prev) => (prev % 5) + 1)}
                        className="text-white hover:text-rose-400 underline flex items-center gap-1"
                      >
                        Next Step <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#BA0C1E] text-white flex items-center justify-center mx-auto shadow-lg">
                      <StepIcon className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-bold text-slate-200">Stage #{step.num} Visual Preview</div>
                    <div className="text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                      {step.num === 1 && 'Visits required & reward details stored in database.'}
                      {step.num === 2 && 'QR Code contains shopSlug / merchantId.'}
                      {step.num === 3 && 'Web camera scans & loads shop card instantly.'}
                      {step.num === 4 && 'Cashier clicks APPROVE -> +1 stamp credited.'}
                      {step.num === 5 && 'Customer scratches card -> redeems free treat!'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. MERCHANT DASHBOARD FEATURES SHOWCASE
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#BA0C1E] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              Merchant Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Full Control Merchant Dashboard
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
              Everything you need to run, track, and modify your store loyalty program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#BA0C1E] flex items-center justify-center font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Unique Store QR Code</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate your unique merchant QR containing your `merchantId`. Download high-res SVG/PNG graphics or copy direct card URLs for your physical counter.
              </p>
              <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
                ✓ Copy Link & PNG Download
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Counter Scan Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive instant pop-up notifications with sound chimes whenever a customer scans your QR code at the billing counter. Approve or reject in 1 click.
              </p>
              <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl inline-block">
                ✓ Notification Chime Enabled
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Customer Directory & CSV</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View real customer activity linked to your store. Track stamp counts, total claims, last visit timestamps, and export full customer data to CSV.
              </p>
              <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl inline-block">
                ✓ One-Click CSV Export
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Create Offer & Live Preview</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customize reward image, required visits (5, 8, 10+), expiry date, and description. See changes instantly in a responsive live card preview.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
                ✓ Real Database Persistence
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Marketing & Campaigns</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create promotional offers, toggle campaign statuses on the fly, track campaign claims performance, and boost off-peak customer repeat rates.
              </p>
              <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl inline-block">
                ✓ Campaign Status Toggles
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#BA0C1E]/10 text-[#BA0C1E] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Store Profile & Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Update store business hours, category, contact info, and address. Control remote scan authorization settings and manage active merchant sessions.
              </p>
              <div className="text-[11px] font-bold text-[#BA0C1E] bg-rose-50 px-3 py-1.5 rounded-xl inline-block">
                ✓ Store Profile Management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. CUSTOMER STAMP CARD INTERACTIVE PREVIEW
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="experience" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold text-[#BA0C1E] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                Customer Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                Dynamic Stamp Cards That Adapt To Your Rules
              </h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium">
                Try switching the visit target below! Whether you set 5, 8, or 10 visits, customer stamp cards render the exact number of slots automatically.
              </p>

              {/* Interactive Visits Toggle Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Test Visits Target:</span>
                {[5, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSampleSlotsCount(num)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                      sampleSlotsCount === num
                        ? 'bg-[#BA0C1E] text-white border-[#BA0C1E] shadow-sm'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {num} Visits
                  </button>
                ))}
              </div>

              <ul className="mt-8 space-y-3 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 stamp collected on each merchant-approved visit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Same-day duplicate scan protection prevents fraudulent claims</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Digital scratch card unlocks instantly upon completing visits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automatic expiry check prevents claiming expired offers</span>
                </li>
              </ul>
            </div>

            {/* Live Interactive Card Widget */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-md mx-auto w-full">
              <div className="bg-[#BA0C1E] text-white rounded-2xl p-5 shadow-md mb-4 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Flinty Partner Store</span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Active Offer</span>
                </div>
                <h3 className="text-xl font-black text-white">Gourmet Coffee & Bakery</h3>
                <p className="text-xs text-white/80 mt-0.5">3 of {sampleSlotsCount} Stamps Collected</p>
                <div className="mt-3 h-2 rounded-full bg-white/30 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${(3 / sampleSlotsCount) * 100}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="uppercase tracking-wider">STAMP SLOTS ({sampleSlotsCount} VISITS)</span>
                  <span className="text-rose-600">{sampleSlotsCount - 3} stamps left</span>
                </div>

                <div className={`grid gap-2.5 justify-items-center ${sampleSlotsCount <= 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                  {Array.from({ length: sampleSlotsCount }).map((_, idx) => {
                    const num = idx + 1;
                    const isEarned = num <= 3;
                    const isLast = num === sampleSlotsCount;

                    if (isEarned) {
                      return (
                        <div key={num} className="w-11 h-11 rounded-full bg-[#80050F] text-white flex items-center justify-center font-bold text-xs shadow-md">
                          ✓
                        </div>
                      );
                    }

                    return (
                      <div
                        key={num}
                        className={`w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center text-xs font-bold ${
                          isLast ? 'border-[#80050F] bg-rose-50 text-[#80050F]' : 'border-slate-200 text-slate-300'
                        }`}
                      >
                        {isLast ? <Gift className="w-4 h-4" /> : num}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-[#BA0C1E] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Collect Stamp at Counter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. TRANSPARENT PRICING PLANS
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#BA0C1E] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              Straightforward Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Simple Plans For Single Stores & Chains
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
              Start digitalizing your customer retention with no complex hardware required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Starter Store</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for single cafes, salons, or retail outlets</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-slate-900">₹999</span>
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 Store Location</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital Stamp & Scratch Cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time Counter Approval Popups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customer Directory & CSV Export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-8 w-full py-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-[#BA0C1E] shadow-2xl relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#BA0C1E] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                MOST POPULAR
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Growth Multi-Branch</h3>
                <p className="text-xs text-slate-400 mt-1">Ideal for expanding store brands & chains</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-white">₹2,499</span>
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 3 Store Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>GPS In-Store Location Resolution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Notification Sound Alert Chimes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Marketing Campaign Creator</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-8 w-full py-3.5 rounded-xl bg-[#BA0C1E] hover:bg-[#960917] text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all"
              >
                Start Growth Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pro Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">For multi-city retail franchises & networks</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-slate-900">₹4,999</span>
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 6 Store Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom Brand Asset Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority Technical Support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-8 w-full py-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#BA0C1E] uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Everything you need to know about Flinty digital loyalty.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-all"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#BA0C1E] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. CALL TO ACTION (CTA)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest bg-rose-500/20 px-3.5 py-1.5 rounded-full border border-rose-500/30">
            Get Started Today
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-6 leading-tight">
            Ready To Upgrade Your Store Loyalty Experience?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Join forward-thinking businesses using Flinty to boost customer repeat retention, approve counter visits, and deliver digital scratch rewards.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#BA0C1E] hover:bg-[#960917] text-white text-sm font-extrabold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              <span>Merchant Portal Access</span>
            </button>
            <Link
              href="/customer/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-extrabold active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5 text-rose-400" />
              <span>Customer Scan Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. FOOTER
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BA0C1E] text-white flex items-center justify-center font-black text-base">
              F
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Flinty Loyalty System</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/merchant/login" className="hover:text-white transition-all">Merchant Login</Link>
            <Link href="/customer/login" className="hover:text-white transition-all">Customer Login</Link>
            <Link href="/admin/login" className="hover:text-white transition-all">Admin</Link>
          </div>

          <div>
            © {new Date().getFullYear()} Flinty Network. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────────────────
          10. LOGIN SELECTION MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-left relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#BA0C1E] text-white flex items-center justify-center font-black text-lg">
                F
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Welcome to Flinty</h3>
                <p className="text-xs text-slate-500">Choose your destination portal</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/merchant/login"
                className="flex items-center justify-between p-4 rounded-2xl bg-[#BA0C1E] hover:bg-[#960917] text-white shadow-md active:scale-98 transition-all"
              >
                <div>
                  <h4 className="font-extrabold text-sm">Merchant / Store Portal</h4>
                  <p className="text-[11px] text-white/80">Manage QR codes, approval popups, and offers</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>

              <Link
                href="/customer/login"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 active:scale-98 transition-all"
              >
                <div>
                  <h4 className="font-extrabold text-sm">Customer Stamp Card</h4>
                  <p className="text-[11px] text-slate-500">Scan QR codes &amp; redeem digital rewards</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#BA0C1E] shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
