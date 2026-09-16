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
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans selection:bg-purple-900 selection:text-purple-200">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ───────────────────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-violet-500/20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all">
              F
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Flinty<span className="text-purple-400">.</span>
              </span>
              <span className="hidden sm:block text-[9px] font-extrabold uppercase tracking-widest text-purple-300/70 -mt-1">
                Digital Loyalty Network
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#how-it-works" className="hover:text-purple-400 transition-all">How It Works</a>
            <a href="#features" className="hover:text-purple-400 transition-all">Merchant Suite</a>
            <a href="#experience" className="hover:text-purple-400 transition-all">Customer Card</a>
            <a href="#pricing" className="hover:text-purple-400 transition-all">Pricing</a>
            <a href="#faq" className="hover:text-purple-400 transition-all">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-[#161D2F] border border-violet-500/30 hover:border-purple-500/50 hover:bg-[#1E2638] transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Customer Login</span>
            </Link>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center gap-2 border border-purple-400/30"
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
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Background Neon Purple Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-50">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-24 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>App-Free Futuristic Loyalty Engine</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
              Turn Counter Scans Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">Repeat Customers</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed mb-8">
              Flinty empowers cafes, retail stores, salons, and restaurants to issue digital stamp cards via instant QR scan. Set custom visit targets, approve visits in real-time, and reward loyalty with digital scratch cards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-extrabold shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 border border-purple-400/30"
              >
                <Store className="w-5 h-5" />
                <span>Launch Merchant Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/customer/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#161D2F] hover:bg-[#1E2638] border border-violet-500/30 text-slate-200 text-sm font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <QrCode className="w-5 h-5 text-purple-400" />
                <span>Try Customer QR Scanner</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Zero Mobile App Download</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Configurable Visits (5, 8, 10+)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Real-Time Counter Approval</span>
              </div>
            </div>
          </div>

          {/* Floating UI Hero Showcase Mockup */}
          <div className="mt-14 max-w-5xl mx-auto relative">
            <div className="bg-[#161D2F]/90 backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-2xl border border-violet-500/30 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Mockup Card 1: Merchant Create Offer */}
                <div className="bg-[#0B0F17] rounded-2xl p-5 border border-violet-500/20 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="uppercase tracking-wider">MERCHANT PORTAL</span>
                    <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full text-[10px] border border-purple-500/20">Active Program</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Custom Reward Setup</h4>
                  <div className="bg-[#161D2F] p-3 rounded-xl border border-violet-500/20 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Target Visits:</span>
                      <span className="font-bold text-purple-400">5 Visits</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Reward Treat:</span>
                      <span className="font-bold text-white">Free Special Coffee</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Expiry Rule:</span>
                      <span className="font-bold text-indigo-400">30 Days</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-[11px] font-bold text-center border border-purple-500/20">
                    ✓ Saved to Real Database
                  </div>
                </div>

                {/* Mockup Card 2: Interactive Scan & Approval Alert */}
                <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-[#161D2F] rounded-2xl p-6 text-white text-left space-y-4 shadow-xl border border-purple-500/40 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-300 animate-bounce" />
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-200">LIVE COUNTER ALERT</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/10">Just Now</span>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200 font-medium">Customer Scanned Counter QR</p>
                    <h3 className="text-lg font-black text-white">Rahul Sharma</h3>
                    <p className="text-xs font-mono text-purple-300/80">+91 98765 43210</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs text-center shadow-md border border-purple-400/40">
                      ✓ APPROVE (+1 STAMP)
                    </div>
                  </div>
                </div>

                {/* Mockup Card 3: Customer Unlocked Scratch Card */}
                <div className="bg-[#0B0F17] rounded-2xl p-5 border border-violet-500/20 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="uppercase tracking-wider">CUSTOMER EXPERIENCE</span>
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] border border-amber-500/20">Treat Unlocked</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">5 of 5 Stamps Completed!</h4>
                  <div className="flex justify-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        ✓
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 rounded-xl text-center shadow-md space-y-1 border border-purple-400/30">
                    <Sparkles className="w-4 h-4 mx-auto text-purple-200" />
                    <p className="text-xs font-black">Scratch Card Revealed!</p>
                    <p className="text-[10px] font-mono bg-black/30 py-0.5 rounded">CODE: TREAT-7842</p>
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
      <section id="how-it-works" className="py-20 bg-[#0B0F17] border-y border-violet-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              End-To-End Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              How Flinty Digital Loyalty Operates
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
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
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-purple-400/50 shadow-lg shadow-purple-600/30'
                      : 'bg-[#161D2F] text-slate-300 border-violet-500/20 hover:bg-[#1E2638]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-white text-purple-700' : 'bg-slate-800 text-slate-300'
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
              <div className="max-w-4xl mx-auto bg-[#161D2F] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-violet-500/30 relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-center">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-extrabold border border-purple-500/30">
                      <StepIcon className="w-4 h-4 text-purple-400" />
                      <span>{step.badge}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">{step.title}</h3>
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-400">
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
                        className="text-purple-400 hover:text-purple-300 underline flex items-center gap-1"
                      >
                        Next Step <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0B0F17] rounded-2xl p-6 border border-violet-500/20 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                      <StepIcon className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-bold text-slate-200">Stage #{step.num} Visual Preview</div>
                    <div className="text-[11px] text-slate-400 bg-[#161D2F] p-3 rounded-xl border border-violet-500/20">
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
      <section id="features" className="py-20 bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Merchant Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Full Control Merchant Dashboard
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
              Everything you need to run, track, and modify your store loyalty program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#161D2F] rounded-3xl p-6 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Unique Store QR Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate your unique merchant QR containing your `merchantId`. Download high-res SVG/PNG graphics or copy direct card URLs for your physical counter.
              </p>
              <div className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl inline-block border border-purple-500/20">
                ✓ Copy Link & PNG Download
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#161D2F] rounded-3xl p-6 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Counter Scan Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive instant pop-up notifications with sound chimes whenever a customer scans your QR code at the billing counter. Approve or reject in 1 click.
              </p>
              <div className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl inline-block border border-purple-500/20">
                ✓ Notification Chime Enabled
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#161D2F] rounded-3xl p-6 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Customer Directory & CSV</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View real customer activity linked to your store. Track stamp counts, total claims, last visit timestamps, and export full customer data to CSV.
              </p>
              <div className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl inline-block border border-purple-500/20">
                ✓ One-Click CSV Export
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#161D2F] rounded-3xl p-6 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Create Offer & Live Preview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customize reward image, required visits (5, 8, 10+), expiry date, and description. See changes instantly in a responsive live card preview.
              </p>
              <div className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl inline-block border border-purple-500/20">
                ✓ Real Database Persistence
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#161D2F] rounded-3xl p-6 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Marketing & Campaigns</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create promotional offers, toggle campaign statuses on the fly, track campaign claims performance, and boost off-peak customer repeat rates.
              </p>
              <div className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl inline-block border border-purple-500/20">
                ✓ Campaign Status Toggles
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#161D2F] rounded-3xl p-6 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Store Profile & Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Update store business hours, category, contact info, and address. Control remote scan authorization settings and manage active merchant sessions.
              </p>
              <div className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl inline-block border border-purple-500/20">
                ✓ Store Profile Management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. CUSTOMER STAMP CARD INTERACTIVE PREVIEW
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="experience" className="py-20 bg-[#0B0F17] border-t border-violet-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Customer Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                Dynamic Stamp Cards That Adapt To Your Rules
              </h2>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed font-medium">
                Try switching the visit target below! Whether you set 5, 8, or 10 visits, customer stamp cards render the exact number of slots automatically.
              </p>

              {/* Interactive Visits Toggle Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Test Visits Target:</span>
                {[5, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSampleSlotsCount(num)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                      sampleSlotsCount === num
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-purple-400/40 shadow-md shadow-purple-600/30'
                        : 'bg-[#161D2F] text-slate-300 border-violet-500/20 hover:bg-[#1E2638]'
                    }`}
                  >
                    {num} Visits
                  </button>
                ))}
              </div>

              <ul className="mt-8 space-y-3 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>1 stamp collected on each merchant-approved visit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Same-day duplicate scan protection prevents fraudulent claims</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Digital scratch card unlocks instantly upon completing visits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Automatic expiry check prevents claiming expired offers</span>
                </li>
              </ul>
            </div>

            {/* Live Interactive Card Widget */}
            <div className="bg-[#161D2F] rounded-3xl p-6 sm:p-8 border border-violet-500/30 shadow-2xl max-w-md mx-auto w-full">
              <div className="bg-gradient-to-r from-violet-900 to-purple-900 text-white rounded-2xl p-5 shadow-md mb-4 text-left border border-purple-500/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Flinty Partner Store</span>
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">Active Offer</span>
                </div>
                <h3 className="text-xl font-black text-white">Gourmet Coffee & Bakery</h3>
                <p className="text-xs text-purple-200/80 mt-0.5">3 of {sampleSlotsCount} Stamps Collected</p>
                <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(3 / sampleSlotsCount) * 100}%` }} />
                </div>
              </div>

              <div className="bg-[#0B0F17] rounded-2xl p-5 border border-violet-500/20 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="uppercase tracking-wider">STAMP SLOTS ({sampleSlotsCount} VISITS)</span>
                  <span className="text-purple-400">{sampleSlotsCount - 3} stamps left</span>
                </div>

                <div className={`grid gap-2.5 justify-items-center ${sampleSlotsCount <= 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                  {Array.from({ length: sampleSlotsCount }).map((_, idx) => {
                    const num = idx + 1;
                    const isEarned = num <= 3;
                    const isLast = num === sampleSlotsCount;

                    if (isEarned) {
                      return (
                        <div key={num} className="w-11 h-11 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md border border-purple-400/40">
                          ✓
                        </div>
                      );
                    }

                    return (
                      <div
                        key={num}
                        className={`w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center text-xs font-bold ${
                          isLast ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-slate-800 text-slate-600'
                        }`}
                      >
                        {isLast ? <Gift className="w-4 h-4" /> : num}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md border border-purple-400/30"
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
      <section id="pricing" className="py-20 bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Straightforward Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Simple Plans For Single Stores & Chains
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
              Start digitalizing your customer retention with no complex hardware required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-[#161D2F] rounded-3xl p-8 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all relative flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter Store</h3>
                <p className="text-xs text-slate-400 mt-1">Perfect for single cafes, salons, or retail outlets</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-white">₹999</span>
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>1 Store Location</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Digital Stamp & Scratch Cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Real-time Counter Approval Popups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Customer Directory & CSV Export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-8 w-full py-3 rounded-xl border border-violet-500/30 text-slate-200 text-xs font-bold hover:bg-[#1E2638] transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="bg-gradient-to-b from-[#1E2638] to-[#161D2F] text-white rounded-3xl p-8 border-2 border-purple-500 shadow-2xl relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md border border-purple-400/40">
                MOST POPULAR
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Growth Multi-Branch</h3>
                <p className="text-xs text-purple-300/80 mt-1">Ideal for expanding store brands & chains</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-white">₹2,499</span>
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Up to 3 Store Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>GPS In-Store Location Resolution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Notification Sound Alert Chimes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Marketing Campaign Creator</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all border border-purple-400/40"
              >
                Start Growth Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#161D2F] rounded-3xl p-8 border border-violet-500/20 shadow-sm hover:border-purple-500/40 transition-all relative flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Pro Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">For multi-city retail franchises & networks</p>
                <div className="my-6">
                  <span className="text-3xl font-black text-white">₹4,999</span>
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Up to 6 Store Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Custom Brand Asset Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Priority Technical Support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="mt-8 w-full py-3 rounded-xl border border-violet-500/30 text-slate-200 text-xs font-bold hover:bg-[#1E2638] transition-all"
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
      <section id="faq" className="py-20 bg-[#0B0F17] border-t border-violet-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Everything you need to know about Flinty digital loyalty.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-[#161D2F] rounded-2xl border border-violet-500/20 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:bg-[#1E2638] transition-all"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-violet-500/20 pt-3">
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
      <section className="py-20 bg-gradient-to-b from-[#0B0F17] to-[#161D2F] text-white relative overflow-hidden border-t border-violet-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-extrabold text-purple-300 uppercase tracking-widest bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
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
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-extrabold shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-purple-400/30"
            >
              <Store className="w-5 h-5" />
              <span>Merchant Portal Access</span>
            </button>
            <Link
              href="/customer/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#161D2F] hover:bg-[#1E2638] border border-violet-500/30 text-slate-200 text-sm font-extrabold active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5 text-purple-400" />
              <span>Customer Scan Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. FOOTER
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#070A10] text-slate-400 py-12 border-t border-violet-500/20 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center font-black text-base shadow-sm">
              F
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Flinty Loyalty System</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-300">
            <Link href="/merchant/login" className="hover:text-purple-400 transition-all">Merchant Login</Link>
            <Link href="/customer/login" className="hover:text-purple-400 transition-all">Customer Login</Link>
            <Link href="/admin/login" className="hover:text-purple-400 transition-all">Admin</Link>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#161D2F] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-violet-500/40 text-left relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                F
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Welcome to Flinty</h3>
                <p className="text-xs text-slate-400">Choose your destination portal</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/merchant/login"
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md active:scale-98 transition-all border border-purple-400/30"
              >
                <div>
                  <h4 className="font-extrabold text-sm">Merchant / Store Portal</h4>
                  <p className="text-[11px] text-purple-200">Manage QR codes, approval popups, and offers</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>

              <Link
                href="/customer/login"
                className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F17] hover:bg-[#1E2638] border border-violet-500/20 text-slate-200 active:scale-98 transition-all"
              >
                <div>
                  <h4 className="font-extrabold text-sm">Customer Stamp Card</h4>
                  <p className="text-[11px] text-slate-400">Scan QR codes &amp; redeem digital rewards</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
