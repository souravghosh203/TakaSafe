import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  QrCode,
  PlusCircle,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Globe,
  PiggyBank,
  GraduationCap,
  Shield,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface UpayHeroServicesProps {
  onServiceSelect?: (serviceName: string) => void;
  onOpenModal?: (modalType: string) => void;
  lang: 'EN' | 'BN';
}

export const UpayHeroServices: React.FC<UpayHeroServicesProps> = ({ onServiceSelect, onOpenModal, lang }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showAllServices, setShowAllServices] = useState<boolean>(false);

  const totalSlides = 3;

  // Auto transition every 5 seconds (matching the 23-25s carousel transition in video)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div className="w-full max-w-full overflow-hidden bg-white select-none">
      {/* Hero Carousel Container */}
      <div
        className="relative overflow-hidden border-b border-amber-200/60"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides Track with Smooth 700ms Horizontal Sliding Transition */}
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* SLIDE 1: ৳200 Bonus Campaign (From 0:00 - 0:23 in video) */}
          <div className="w-full shrink-0 relative bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[360px] flex items-center">
            {/* Festive Confetti & Dot Accents */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-4 left-10 w-3 h-3 rounded-full bg-blue-600" />
              <div className="absolute top-8 left-24 w-2 h-2 rounded-full bg-amber-500" />
              <div className="absolute bottom-6 left-16 w-3 h-3 rounded-full bg-blue-500" />
              <div className="absolute top-6 right-20 w-4 h-4 rounded-full bg-amber-400" />
              <div className="absolute bottom-10 right-40 w-3 h-3 rounded-full bg-blue-700" />
              <div className="absolute top-12 right-64 w-2 h-2 rounded-full bg-rose-500" />
            </div>

            <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Left Headline */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block bg-amber-300/60 text-blue-950 font-bold px-3 py-1 rounded-full text-xs mb-3 border border-amber-400/50">
                  {lang === 'BN' ? 'টাকা সেফ বিশেষ অফার' : 'TakaSafe Special Campaign'}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {lang === 'BN' ? 'টাকা সেফ অ্যাকাউন্ট খুললেই' : 'Open a TakaSafe Account & Get'}
                </h1>
                <div className="mt-2 flex items-baseline justify-center md:justify-start gap-3">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0054A6]">৳ ২০০</span>
                  <span className="text-2xl sm:text-3xl font-bold text-amber-500">{lang === 'BN' ? 'বোনাস*' : 'Bonus*'}</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg">
                  {lang === 'BN'
                    ? 'এখনই নিজের অথবা এজেন্টের মাধ্যমে টাকা সেফ একাউন্ট খুলুন আর ক্যাশ-ইন, সেন্ড মানি ও বিল পে উপভোগ করুন।'
                    : 'Open your TakaSafe wallet via smartphone or nearby agent to unlock seamless Send Money, Cash Out, and Bill Payments.'}
                </p>

                <div className="mt-5 flex items-center justify-center md:justify-start gap-4">
                  <button
                    onClick={() => (onOpenModal ? onOpenModal('ABOUT_US') : onServiceSelect?.('Cash In'))}
                    className="flex items-center gap-2 bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>{lang === 'BN' ? 'বিস্তারিত দেখুন' : 'Read More'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-[11px] text-slate-500 italic">*শর্ত প্রযোজ্য (Terms Apply)</div>
                </div>
              </div>

              {/* Right Visual Card */}
              <div
                onClick={() => onOpenModal?.('ABOUT_US')}
                className="w-full max-w-[270px] h-48 sm:max-w-xs sm:h-56 bg-white/70 backdrop-blur-sm rounded-3xl p-5 border-2 border-amber-300 shadow-xl flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0054A6]">TakaSafe Digital Trust</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Protected by TakaSafe
                  </span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0054A6] to-[#003B75] flex items-center justify-center text-white shadow-lg">
                      <span className="text-3xl font-black text-amber-300">৳</span>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                      FAST
                    </div>
                  </div>
                </div>
                <div className="text-center text-xs font-semibold text-slate-700">
                  Low Cash-Out Rate · 24/7 ScamShield AI
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: চার্জ 0 টাকা / Zero Charge Cash Out (Sleek Modern Digital Banking Visual) */}
          <div className="w-full shrink-0 relative bg-gradient-to-r from-amber-50/90 via-sky-50/70 to-blue-50/80 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[360px] flex items-center">
            {/* Ambient Radiant Glow Accents */}
            <div className="absolute -top-10 right-1/3 w-80 h-80 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-10 w-96 h-96 bg-[#0054A6]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Left Headline & Features */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-[#0054A6] text-white font-bold px-3.5 py-1 rounded-full text-xs mb-3 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'BN' ? 'জিরো ক্যাশ-আউট চার্জ' : 'Zero Cash-Out Charge'}</span>
                </div>

                <div className="flex items-baseline justify-center md:justify-start gap-3">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0054A6] tracking-tight">
                    {lang === 'BN' ? 'চার্জ' : 'Charge'}
                  </h2>
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#FAB915] drop-shadow-sm">
                    ০
                  </span>
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0054A6]">
                    {lang === 'BN' ? 'টাকা' : 'Taka'}
                  </span>
                </div>

                {/* Offer Sub-card with Clean Checkmarks */}
                <div className="mt-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm max-w-lg inline-block text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">✓</span>
                    <span>
                      {lang === 'BN'
                        ? 'TakaSafe এটিএম ও পার্টনার পয়েন্ট থেকে ক্যাশ আউট সম্পূর্ণ ফ্রি!'
                        : 'Cash out from any TakaSafe ATM & partner point with ZERO fee!'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">✓</span>
                    <span>
                      {lang === 'BN'
                        ? 'দেশের ১৫,০০০+ এটিএম বুথ থেকে নিশ্চিন্তে টাকা তুলুন।'
                        : 'Accepted at 15,000+ ATM booths nationwide with no hidden deductions.'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center md:justify-start gap-4">
                  <button
                    onClick={() => (onOpenModal ? onOpenModal('LIMITS_CHARGES') : onServiceSelect?.('Cash Out'))}
                    className="flex items-center gap-2 bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>{lang === 'BN' ? 'বিস্তারিত দেখুন' : 'Read More'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-[11px] text-slate-500 italic">*শর্ত প্রযোজ্য (Terms Apply)</div>
                </div>
              </div>

              {/* Right Graphic: Sleek Modern Smartphone & Floating 3D Financial Badges */}
              <div className="w-full max-w-[270px] h-64 sm:max-w-xs sm:h-72 relative flex items-center justify-center select-none">
                {/* Floating Background Glass Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/30 via-sky-100/40 to-blue-200/30 rounded-full blur-2xl pointer-events-none" />

                {/* Modern Smartphone Mockup */}
                <div className="w-52 sm:w-56 h-64 bg-slate-950 rounded-[32px] p-2.5 shadow-2xl border-4 border-slate-700/80 relative z-10 flex flex-col justify-between overflow-hidden">
                  {/* Phone Speaker & Notch */}
                  <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <div className="w-2.5 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {/* App Screen Content */}
                  <div className="flex-1 bg-gradient-to-b from-[#003875] via-[#0054A6] to-[#002855] rounded-[22px] p-3 text-white flex flex-col justify-between relative overflow-hidden border border-white/10">
                    {/* Screen Header */}
                    <div className="flex items-center justify-between text-[10px] text-blue-200">
                      <span className="font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>ATM Cash-Out</span>
                      </span>
                      <span className="bg-amber-400 text-blue-950 font-black px-1.5 py-0.2 rounded text-[8px]">
                        0% CHARGE
                      </span>
                    </div>

                    {/* Central Withdrawal Amount Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 text-center my-auto">
                      <span className="text-[9px] text-blue-200 uppercase tracking-wider block font-semibold">
                        Withdrawal Amount
                      </span>
                      <div className="text-xl font-black text-white font-mono mt-0.5">
                        ৳ 5,000<span className="text-xs text-blue-200">.00</span>
                      </div>
                      
                      {/* Zero Fee Tag */}
                      <div className="mt-1.5 inline-flex items-center gap-1 bg-emerald-500/25 border border-emerald-400/50 px-2 py-0.5 rounded-full">
                        <span className="text-[8px] text-emerald-300 font-bold">Fee:</span>
                        <span className="text-[8px] text-slate-300 line-through">৳75</span>
                        <span className="text-[9px] text-emerald-300 font-black">৳0.00 (FREE)</span>
                      </div>
                    </div>

                    {/* Instant QR Scanner Frame */}
                    <div className="bg-black/30 rounded-lg p-2 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-400 flex items-center justify-center text-blue-950 font-black text-xs">
                          QR
                        </div>
                        <div className="leading-tight">
                          <span className="text-[9px] font-bold text-white block">Instant Scan</span>
                          <span className="text-[7.5px] text-blue-200">Tap or Scan at ATM</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">READY</span>
                    </div>
                  </div>
                </div>

                {/* Floating Glass Pill 1: Top Right */}
                <div className="absolute -top-1 -right-2 sm:right-2 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-emerald-200/80 flex items-center gap-2 animate-bounce">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ৳০
                  </div>
                  <div className="leading-tight">
                    <span className="text-[10px] font-black text-slate-900 block">Zero Fee Active</span>
                    <span className="text-[8px] text-emerald-600 font-bold">100% Free Withdrawal</span>
                  </div>
                </div>

                {/* Floating Glass Pill 2: Bottom Left */}
                <div className="absolute -bottom-2 -left-2 sm:left-2 z-20 bg-[#0054A6] text-white px-3 py-2 rounded-2xl shadow-xl border border-blue-400/40 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xs">
                    🏧
                  </div>
                  <div className="leading-tight">
                    <span className="text-[10px] font-bold text-white block">15,000+ ATMs</span>
                    <span className="text-[8px] text-amber-300 font-medium">Nationwide Network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3: ScamShield AI Pre-Payment Protection (Vibrant Upay Royal Blue & Gold Palette) */}
          <div className="w-full shrink-0 relative bg-gradient-to-r from-[#002E66] via-[#0054A6] to-[#007AE6] text-white py-10 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[360px] flex items-center">
            {/* Radiant Ambient Light Orbs */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-sky-300/25 blur-3xl pointer-events-none" />

            {/* Subtle Tech Security Matrix Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.2px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-[#FAB915] text-[#003B75] font-black px-3.5 py-1.5 rounded-full text-xs mb-3 shadow-md border border-amber-300">
                  <ShieldCheck className="w-4 h-4 text-[#003B75]" />
                  <span>24/7 AI Trust & ScamShield</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                  {lang === 'BN' ? 'ScamShield এআই সুরক্ষা' : 'ScamShield AI Protection'}
                </h2>
                <div className="mt-2 flex items-baseline justify-center md:justify-start gap-3">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FAB915] drop-shadow-sm">
                    {lang === 'BN' ? 'নিরাপদ লেনদেন' : 'Safe Payments'}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-sky-100">
                    {lang === 'BN' ? 'প্রতিটি পদক্ষেপে' : 'Every Step'}
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-blue-50 max-w-lg leading-relaxed font-medium">
                  {lang === 'BN'
                    ? 'আপনার কষ্টের টাকাকে রাখুন সুরক্ষিত—প্রাক-পেমেন্ট এআই সতর্কতা, অস্বাভাবিক গতিবিধি নির্ণয় ও দুর্যোগকালীন এজেন্ট ব্যবস্থাপনা।'
                    : 'Pre-payment explainable scam warnings, money-mule detection, and disaster-aware agent liquidity resilience.'}
                </p>

                <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                  <button
                    onClick={() => onServiceSelect?.('Send Money')}
                    className="flex items-center gap-2 bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-amber-300"
                  >
                    <span>{lang === 'BN' ? 'সুরক্ষা যাচাই করুন' : 'Test ScamShield'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-sky-100 font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    DIU CPC × upay AI DEV FEST 2026
                  </div>
                </div>
              </div>

              {/* Luminous 3D Glass Trust Shield Card */}
              <div className="w-full max-w-[270px] h-60 sm:max-w-xs sm:h-64 bg-white/15 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border-2 border-white/40 shadow-2xl flex flex-col justify-center items-center gap-3 sm:gap-4 relative overflow-hidden">
                {/* Shiny top glass glare */}
                <div className="absolute -top-10 -left-10 right-10 h-28 bg-white/15 rounded-full blur-xl pointer-events-none" />

                <div className="flex flex-col items-center justify-center relative z-10">
                  {/* Concentric Pulse Rings */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-28 h-28 rounded-full bg-[#FAB915]/20 animate-pulse pointer-events-none" />
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FAB915] via-amber-300 to-amber-200 flex items-center justify-center shadow-xl text-[#003B75] border-2 border-white/60">
                      <ShieldCheck className="w-12 h-12 text-[#003B75]" />
                    </div>
                  </div>
                  <span className="text-base font-black text-white mt-3 tracking-wide drop-shadow-sm">
                    Zero Fraud Compromise
                  </span>
                </div>

                <div className="w-full text-center text-[11px] font-semibold text-sky-100 bg-black/20 py-2 px-3 rounded-xl border border-white/10 relative z-10">
                  SHAP Explainability · Disaster Liquidity Mode
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all z-20 backdrop-blur-sm hover:scale-105"
          title="Previous Banner"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all z-20 backdrop-blur-sm hover:scale-105"
          title="Next Banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicator Pagination Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-7 bg-[#0054A6]'
                  : 'w-2 bg-slate-400/60 hover:bg-slate-600'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* OUR SERVICES SECTION (Matching Image 4) */}
      <div id="services-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10 animate-slide-up">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0054A6] dark:text-blue-400 tracking-wide uppercase">
            {lang === 'BN' ? 'আমাদের সেবাসমূহ' : 'OUR SERVICES'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {lang === 'BN'
              ? 'আপনার দৈনন্দিন আর্থিক লেনদেনকে সহজ এবং নিরাপদ করতে আমাদের সেবাসমূহ প্রস্তুত'
              : 'Our services are designed to make your regular financial transactions convenient and easy'}
          </p>
        </div>

        {/* 6 Core Services Grid matching wireframe Image 4 with Staggered Slide Up Animation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 stagger-grid">
          {/* 1. Cash In */}
          <div
            onClick={() => onServiceSelect?.('Cash In')}
            className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center card-hover-lift"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-amber-50 flex items-center justify-center mb-3 transition-colors text-[#0054A6] group-hover:text-amber-600">
              <ArrowDownLeft className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
              {lang === 'BN' ? 'ক্যাশ ইন' : 'Cash In'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">Free from Agents</span>
          </div>

          {/* 2. Cash Out */}
          <div
            onClick={() => onServiceSelect?.('Cash Out')}
            className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center card-hover-lift"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-3 transition-colors text-amber-600">
              <ArrowUpRight className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
              {lang === 'BN' ? 'ক্যাশ আউট' : 'Cash Out'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">Lowest charge</span>
          </div>

          {/* 3. Send Money */}
          <div
            onClick={() => onServiceSelect?.('Send Money')}
            className="group flex flex-col items-center p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm hover:border-[#0054A6] hover:shadow-lg transition-all cursor-pointer text-center relative overflow-hidden card-hover-lift"
          >
            <div className="absolute top-0 right-0 bg-[#0054A6] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
              SHIELD
            </div>
            <div className="w-16 h-16 rounded-2xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center mb-3 transition-colors text-sky-600">
              <Send className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
              {lang === 'BN' ? 'সেন্ড মানি' : 'Send Money'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">ScamShield Active</span>
          </div>

          {/* 4. Make Payment */}
          <div
            onClick={() => onServiceSelect?.('Make Payment')}
            className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center card-hover-lift"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors text-indigo-600">
              <QrCode className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
              {lang === 'BN' ? 'পেমেন্ট করুন' : 'Make Payment'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">Merchant QR</span>
          </div>

          {/* 5. Add Money */}
          <div
            onClick={() => onServiceSelect?.('Add Money')}
            className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center card-hover-lift"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors text-emerald-600">
              <PlusCircle className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
              {lang === 'BN' ? 'অ্যাড মানি' : 'Add Money'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">Bank / Card</span>
          </div>

          {/* 6. Pay Bill */}
          <div
            onClick={() => onServiceSelect?.('Pay Bill')}
            className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center card-hover-lift"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-3 transition-colors text-purple-600">
              <ReceiptText className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
              {lang === 'BN' ? 'পে বিল' : 'Pay Bill'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">DESCO, WASA, Titas</span>
          </div>
        </div>

        {/* Expanded Services Grid (Revealed on View More) */}
        {showAllServices && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mt-6 stagger-grid">
            {/* 7. Mobile Recharge */}
            <div
              onClick={() => onServiceSelect?.('Mobile Recharge')}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center mb-3 transition-colors text-teal-600">
                <Smartphone className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
                {lang === 'BN' ? 'মোবাইল রিচার্জ' : 'Mobile Recharge'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">GP, BL, Robi, Airtel</span>
            </div>

            {/* 8. Remittance */}
            <div
              onClick={() => (onOpenModal ? onOpenModal('LIMITS_CHARGES') : onServiceSelect?.('Remittance'))}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center mb-3 transition-colors text-cyan-600">
                <Globe className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
                {lang === 'BN' ? 'রেমিট্যান্স' : 'Remittance'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">2.5% Gov Incentive</span>
            </div>

            {/* 9. Micro-Savings */}
            <div
              onClick={() => (onOpenModal ? onOpenModal('ABOUT_US') : onServiceSelect?.('Savings'))}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center mb-3 transition-colors text-rose-600">
                <PiggyBank className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
                {lang === 'BN' ? 'সঞ্চয় / ডিপিএস' : 'Micro-Savings'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">UCB Taqwa Islamic</span>
            </div>

            {/* 10. Education Fees */}
            <div
              onClick={() => (onOpenModal ? onOpenModal('LIMITS_CHARGES') : onServiceSelect?.('Education'))}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-3 transition-colors text-amber-600">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
                {lang === 'BN' ? 'শিক্ষা ফি' : 'Education Fees'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Colleges & Universities</span>
            </div>

            {/* 11. Insurance / Takaful */}
            <div
              onClick={() => (onOpenModal ? onOpenModal('ABOUT_US') : onServiceSelect?.('Insurance'))}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors text-blue-600">
                <Shield className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
                {lang === 'BN' ? 'বীমা প্রিমিয়াম' : 'Insurance'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Life & Health Takaful</span>
            </div>

            {/* 12. Business Settlement */}
            <div
              onClick={() => (onOpenModal ? onOpenModal('BUSINESS') : onServiceSelect?.('Business'))}
              className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3 transition-colors text-slate-700">
                <Building2 className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-[#0054A6]">
                {lang === 'BN' ? 'বিজনেস পেমেন্ট' : 'Enterprise B2B'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Payroll & Bulk MFS</span>
            </div>
          </div>
        )}

        {/* View More / View Less Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAllServices(!showAllServices)}
            className="inline-flex items-center gap-2 bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 font-bold px-8 py-2.5 rounded-full text-xs tracking-wide shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>
              {showAllServices
                ? lang === 'BN' ? 'কম দেখুন' : 'Show Less'
                : lang === 'BN' ? 'আরও দেখুন' : 'View More Services'}
            </span>
            {showAllServices ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Yellow Wavy Transition Curve (Matching Image 4 bottom wave) */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-12 text-[#FAB915] fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
};
