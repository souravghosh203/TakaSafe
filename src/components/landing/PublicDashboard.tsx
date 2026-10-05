import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CreditCard, Globe, Info, MapPin, Menu, Moon, Newspaper, Phone, Search, ShieldCheck, Sparkles, Star, Sun, X } from 'lucide-react';
import './PublicDashboard.css';
import { DashboardAssistant } from '../common/DashboardAssistant';

interface PublicDashboardProps {
  onGetStarted: (email?: string) => void;
  onSignIn: () => void;
  onOpenModal: (modal: string) => void;
  onOpenAssistant: (question: string) => void;
  lang: 'EN' | 'BN';
  onToggleLanguage: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const serviceItems = [
  { label: 'Project Abstract & SDGs', labelBn: 'প্রকল্পের সারসংক্ষেপ ও SDG', icon: Sparkles, modal: 'ABSTRACT' },
  { label: 'About Us', labelBn: 'আমাদের সম্পর্কে', icon: Info, modal: 'ABOUT_US' },
  { label: 'Products & Campaigns', labelBn: 'পণ্য ও ক্যাম্পেইন', icon: Sparkles, target: 'products' },
  { label: 'Prepaid Card', labelBn: 'প্রিপেইড কার্ড', icon: CreditCard, modal: 'PREPAID_CARD' },
  { label: 'ATM & Service Points', labelBn: 'এটিএম ও সেবা কেন্দ্র', icon: MapPin, modal: 'SERVICE_LOCATIONS' },
  { label: 'Media & Press', labelBn: 'মিডিয়া ও সংবাদ', icon: Newspaper, modal: 'MEDIA' },
  { label: '24/7 Hotline', labelBn: '২৪/৭ হটলাইন', icon: Phone, modal: 'LIVE_CHAT', badge: '1628' },
];

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  onGetStarted,
  onSignIn,
  onOpenModal,
  onOpenAssistant,
  lang,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [animatedControl, setAnimatedControl] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const animationTimeout = useRef<number | null>(null);
  const actionTimeout = useRef<number | null>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const isBn = lang === 'BN';
  const copy = isBn ? {
    navLabel: 'প্রধান নেভিগেশন', services: 'সেবা', explore: 'টাকাসেফ সম্পর্কে জানুন', search: 'খুঁজুন', signIn: 'সাইন ইন', getStarted: 'শুরু করুন',
    review: '২,০০০+ ব্যবসার পছন্দ', heroFirst: 'আপনার অর্থ', heroSecond: 'আপনার নিয়ন্ত্রণ', heroThird: 'আপনার নিরাপত্তা',
    description: 'প্রতারণার এক ধাপ আগে থাকুন। ScamShield Intelligent ব্যবহার করে টাকা Safe-এর সঙ্গে প্রতিটি পেমেন্ট সুরক্ষিত রাখুন—প্রতারণা শনাক্তকরণ, তাৎক্ষণিক ঝুঁকির তথ্য এবং আরও নিরাপদ ডিজিটাল লেনদেনের জন্য।',
    freeStart: 'বিনামূল্যে শুরু করুন',
    exploreProduct: 'পণ্য দেখুন', secureMovement: 'নিরাপদ অর্থ লেনদেনের জন্য তৈরি', businesses: 'ব্যবসা আত্মবিশ্বাসের সঙ্গে লেনদেন করছে',
    liveFlow: 'লাইভ অর্থপ্রবাহ', secure: 'নিরাপদ', totalVolume: 'মোট ব্যবসায়িক লেনদেন', allSecure: 'সব ব্যবস্থা সুরক্ষিত',
    active: 'সচল', cashFlow: 'নগদ প্রবাহ', payments: 'পেমেন্ট', savings: 'সঞ্চয়', revenue: 'আয়',
    secureTransfer: 'নিরাপদ অর্থ স্থানান্তর', inflow: 'জমা', outflow: 'উত্তোলন', trustEyebrow: 'আপনার মতোই পরিশ্রমী অর্থব্যবস্থা',
    trustHeadline: 'বিশ্বস্ত ডিজিটাল ফাইন্যান্স',
    bankProtection: 'ব্যাংক-সমমানের সুরক্ষা', uptime: '৯৯.৯% প্ল্যাটফর্ম সচলতা', fastPayments: 'দ্রুত ও নির্ভরযোগ্য পেমেন্ট', growingTeams: 'বর্ধনশীল ব্যবসার জন্য তৈরি',
    oneView: 'সবকিছু এক নজরে', moneyMotion: 'আপনার অর্থ, সচল রাখুন।',
    productDescription: 'পেমেন্ট, নগদ প্রবাহ, সঞ্চয় ও ঝুঁকির সংকেত—সবকিছু এক নিরাপদ আর্থিক কর্মক্ষেত্রে।',
    openDashboard: 'ড্যাশবোর্ড খুলুন', language: 'English', searchLabel: 'ওয়েবসাইটে খুঁজুন',
    switchTheme: theme === 'dark' ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন', themeLabel: theme === 'dark' ? 'লাইট' : 'ডার্ক',
    boothAlt: 'নিরাপদে অর্থ চলাচল দেখানো টাকা Safe-এর অ্যানিমেটেড এটিএম বুথ', starRating: 'পাঁচের মধ্যে পাঁচ তারকা', trustAria: 'প্ল্যাটফর্মের আস্থার সূচক',
  } : {
    navLabel: 'Main navigation', services: 'Services', explore: 'EXPLORE TAKASAFE', search: 'Search', signIn: 'Sign in', getStarted: 'Get started',
    review: 'Loved by 2,000+ businesses', heroFirst: 'Your Money', heroSecond: 'Your Control', heroThird: 'Your Security',
    description: 'Stay ahead of scams. Protect every payment with TakaSafe using ScamShield Intelligent for scam detection, real-time risk insights, and safer digital transactions.',
    freeStart: 'Get started for free',
    exploreProduct: 'Explore product', secureMovement: 'Built for safer money movement', businesses: 'businesses moving with confidence',
    liveFlow: 'LIVE MONEY FLOW', secure: 'SECURE', totalVolume: 'TOTAL BUSINESS VOLUME', allSecure: 'All systems secure',
    active: 'ACTIVE', cashFlow: 'Cash flow', payments: 'Payments', savings: 'Savings', revenue: 'Revenue',
    secureTransfer: 'SECURE TRANSFER', inflow: 'IN', outflow: 'OUT', trustEyebrow: 'MONEY THAT WORKS AS HARD AS YOU DO',
    trustHeadline: 'Trusted Digital Finance',
    bankProtection: 'Bank-grade protection', uptime: '99.9% platform uptime', fastPayments: 'Payments that keep pace', growingTeams: 'Built for growing teams',
    oneView: 'ONE CLEAR VIEW', moneyMotion: 'Your money, in motion.',
    productDescription: 'Payments, cash flow, savings, and risk signals come together in one secure financial workspace.',
    openDashboard: 'Open your dashboard', language: 'বাংলা', searchLabel: 'Search website',
    switchTheme: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', themeLabel: theme === 'dark' ? 'Light' : 'Dark',
    boothAlt: 'Animated TakaSafe ATM booth showing secure money flow', starRating: '5 out of 5 stars', trustAria: 'Platform trust indicators',
  };

  const renderDescription = () => copy.description.split(/(Taka\s*Safe|টাকা\s*Safe|ScamShield)/gi).map((part, index) => {
    if (/^(Taka\s*Safe|টাকা\s*Safe)$/i.test(part)) {
      return <span className="description-brand" key={index}>TakaSafe</span>;
    }
    if (/^ScamShield$/i.test(part)) {
      return <span className="description-scamshield" key={index}>ScamShield</span>;
    }
    return part;
  });

  const animateControl = (control: string) => {
    setAnimatedControl(null);
    window.requestAnimationFrame(() => setAnimatedControl(control));
    if (animationTimeout.current !== null) window.clearTimeout(animationTimeout.current);
    animationTimeout.current = window.setTimeout(() => setAnimatedControl(null), 620);
  };
  const animateThen = (control: string, action: () => void) => {
    animateControl(control);
    if (actionTimeout.current !== null) window.clearTimeout(actionTimeout.current);
    actionTimeout.current = window.setTimeout(action, 180);
  };
  const controlClass = (base: string, control: string) =>
    `${base} interactive-control${animatedControl === control ? ' is-animating' : ''}`;

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) setServicesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setServicesOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', updateScrollState);
      if (animationTimeout.current !== null) window.clearTimeout(animationTimeout.current);
      if (actionTimeout.current !== null) window.clearTimeout(actionTimeout.current);
    };
  }, []);

  return (
    <div className="public-dashboard" id="top" data-theme={theme}>
      <header className={`public-nav${isScrolled ? ' is-scrolled' : ''}`}>
          <a className="public-brand" href="#top" aria-label="TakaSafe home">
            <span className="public-brand-icon" aria-hidden="true">
              <span className="mfs-halo-pulse" />
              <span className="public-brand-icon-disc">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M 22 45 C 22 75 78 75 78 45" fill="none" stroke="#FAB915" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 34 52 C 34 72 66 72 66 52" fill="none" stroke="#0054A6" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="50" cy="30" r="8" fill="#E11D48" />
                </svg>
              </span>
            </span>
            <span className="brand-wordmark"><span className="brand-taka">টাকা</span><span className="brand-safe">Safe</span></span>
          </a>

          <button
            className={controlClass('nav-menu-toggle', 'menu')}
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => {
              animateControl('menu');
              setMenuOpen((open) => !open);
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`public-nav-links${menuOpen ? ' is-open' : ''}`} aria-label={copy.navLabel}>
            <div className="services-nav" ref={servicesRef}>
              <button
                type="button"
                className={controlClass('services-trigger', 'services')}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => {
                  animateControl('services');
                  setServicesOpen((open) => !open);
                }}
              >
                <span className="nav-control-label">{copy.services}</span>
                <ChevronDown size={14} className={`control-icon${servicesOpen ? ' chevron-open' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="services-menu" role="menu" aria-label="Explore TakaSafe">
                  <div className="services-menu-heading">{copy.explore}</div>
                  {serviceItems.map(({ label, labelBn, icon: Icon, modal, target, badge }) => (
                    <button
                      type="button"
                      className="services-menu-item"
                      role="menuitem"
                      key={label}
                      onClick={() => {
                        setServicesOpen(false);
                        setMenuOpen(false);
                        if (modal) onOpenModal(modal);
                        if (target) document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span>{isBn ? labelBn : label}</span>
                      {badge && <span className="hotline-badge">{badge}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mobile-nav-tools" aria-label="Website controls">
              <button type="button" className={controlClass('nav-icon-button', 'search')} aria-label={copy.searchLabel} onClick={() => animateThen('search', () => { setMenuOpen(false); onOpenModal('SEARCH'); })}>
                <Search className="control-icon" size={16} /> <span className="nav-control-label">{copy.search}</span>
              </button>
              <button type="button" className={controlClass('nav-icon-button', 'language')} aria-label="Change language" onClick={() => { animateControl('language'); onToggleLanguage(); }}>
                <Globe className="control-icon" size={16} /> <span className="nav-control-label">{copy.language}</span>
              </button>
              <button type="button" className={controlClass('nav-icon-button', 'theme')} aria-label={copy.switchTheme} onClick={() => { animateControl('theme'); onToggleTheme(); }}>
                {theme === 'dark' ? <Sun className="control-icon" size={16} /> : <Moon className="control-icon" size={16} />} <span className="nav-control-label">{copy.themeLabel}</span>
              </button>
            </div>
          </nav>

          <div className="public-nav-actions">
            <div className="desktop-nav-tools" aria-label="Website controls">
              <button type="button" className={controlClass('nav-icon-button', 'search')} aria-label={copy.searchLabel} onClick={() => animateThen('search', () => onOpenModal('SEARCH'))}>
                <Search className="control-icon" size={16} /> <span className="nav-control-label">{copy.search}</span>
              </button>
              <button type="button" className={controlClass('nav-icon-button', 'language')} aria-label="Change language" onClick={() => { animateControl('language'); onToggleLanguage(); }}>
                <Globe className="control-icon" size={16} /> <span className="nav-control-label">{copy.language}</span>
              </button>
              <button type="button" className={controlClass('nav-icon-button', 'theme')} aria-label={copy.switchTheme} onClick={() => { animateControl('theme'); onToggleTheme(); }}>
                {theme === 'dark' ? <Sun className="control-icon" size={16} /> : <Moon className="control-icon" size={16} />} <span className="nav-control-label">{copy.themeLabel}</span>
              </button>
            </div>
            <button type="button" className={controlClass('sign-in-button', 'signin')} onClick={() => animateThen('signin', onSignIn)}><span className="nav-control-label">{copy.signIn}</span></button>
            <button type="button" className={controlClass('nav-cta', 'getstarted')} onClick={() => animateThen('getstarted', onGetStarted)}><span className="nav-control-label">{copy.getStarted}</span> <ArrowRight className="control-icon" size={15} /></button>
          </div>
      </header>

      <section className="public-hero-shell">

        <main className="public-hero-content">
          <div className="hero-copy">
            <div className="review-badge motion-reveal" style={{ animationDelay: '0.06s' }}>
              <span className="review-stars" aria-label={copy.starRating}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} fill="currentColor" />)}
              </span>
              <span className="review-divider" />
              <span>{copy.review}</span>
            </div>

            <h1 className="motion-reveal" style={{ animationDelay: '0.14s' }}>
              {copy.heroFirst}<br />
              <span>{copy.heroSecond}</span><br />
              <span className="headline-accent">{copy.heroThird}</span>
            </h1>

            <p className="hero-description motion-reveal" style={{ animationDelay: '0.23s' }}>
              {renderDescription()}
            </p>

            <button type="button" className="signup-cta motion-reveal" style={{ animationDelay: '0.31s' }} onClick={() => onGetStarted()}>
              {copy.freeStart} <ArrowRight size={17} />
            </button>

            <div className="hero-secondary motion-reveal" style={{ animationDelay: '0.38s' }}>
              <a href="#products">{copy.exploreProduct} <ArrowRight size={15} /></a>
              <span><ShieldCheck size={14} /> {copy.secureMovement}</span>
            </div>

            <article className="ai-launch-event motion-reveal" style={{ animationDelay: '0.43s' }}>
              <div className="ai-launch-robot-scene" aria-hidden="true">
                <span className="ai-launch-orbit ai-launch-orbit-outer" />
                <span className="ai-launch-orbit ai-launch-orbit-inner" />
                <svg className="ai-launch-robot" viewBox="0 0 120 140" fill="none">
                  <defs>
                    <linearGradient id="aiRobotShell" x1="24" y1="26" x2="95" y2="103" gradientUnits="userSpaceOnUse"><stop stopColor="#D9F7FF" /><stop offset=".55" stopColor="#79C9F4" /><stop offset="1" stopColor="#378FD0" /></linearGradient>
                    <linearGradient id="aiRobotBody" x1="40" y1="89" x2="81" y2="128" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF" /><stop offset="1" stopColor="#91D7F7" /></linearGradient>
                    <linearGradient id="aiRobotFace" x1="43" y1="40" x2="83" y2="83" gradientUnits="userSpaceOnUse"><stop stopColor="#0B2949" /><stop offset="1" stopColor="#0C5478" /></linearGradient>
                  </defs>
                  <path d="M60 18v13" stroke="#B9E8FF" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="60" cy="15" r="7" fill="#76C8F5" stroke="#DDF7FF" strokeWidth="3" />
                  <rect x="12" y="53" width="17" height="31" rx="8.5" fill="#368FCB" stroke="#A7E1FF" strokeWidth="4" />
                  <rect x="91" y="53" width="17" height="31" rx="8.5" fill="#368FCB" stroke="#A7E1FF" strokeWidth="4" />
                  <path d="M44 86 35 102m41-16 10 16" stroke="#80C8F0" strokeWidth="10" strokeLinecap="round" />
                  <rect x="39" y="87" width="42" height="42" rx="17" fill="url(#aiRobotBody)" stroke="#BCEBFF" strokeWidth="4" />
                  <circle cx="60" cy="108" r="9" fill="#54BDEB" stroke="#D7F6FF" strokeWidth="3" />
                  <path d="M42 116 36 127m42-11 6 11" stroke="#A4DFFD" strokeWidth="8" strokeLinecap="round" />
                  <rect x="20" y="28" width="80" height="67" rx="25" fill="url(#aiRobotShell)" stroke="#D4F4FF" strokeWidth="4" />
                  <rect x="28" y="37" width="64" height="49" rx="19" fill="url(#aiRobotFace)" stroke="#56D9F4" strokeOpacity=".65" strokeWidth="2" />
                  <circle cx="47" cy="60" r="5.5" fill="#34E0FF" />
                  <circle cx="73" cy="60" r="5.5" fill="#34E0FF" />
                  <path d="M54 73c3 3 9 3 12 0" stroke="#68E4F4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="ai-launch-spark"><Sparkles size={14} /></span>
              </div>
              <div className="ai-launch-copy">
                <span className="ai-launch-kicker"><i /> {isBn ? 'নতুন ফিচার • টাকা সেফ AI' : 'NEW FEATURE • TAKASAFE AI'}</span>
                <h2>{isBn ? 'পরিচিত হোন টাকা সেফ AI-এর সঙ্গে' : 'Meet TakaSafe AI'}</h2>
                <p>{isBn ? 'লেনদেন বুঝুন, খরচের উত্তর পান, আরও নিরাপদ সিদ্ধান্ত নিন।' : 'Ask about transactions, spending, and safer money decisions.'}</p>
              </div>
              <button type="button" onClick={() => onOpenAssistant('What can TakaSafe AI help me with?')}>
                {isBn ? 'AI-কে জিজ্ঞাসা করুন' : 'Ask AI'} <ArrowRight size={14} />
              </button>
            </article>

            <div className="hero-micro-proof motion-reveal" style={{ animationDelay: '0.44s' }}>
              <div className="avatar-stack" aria-hidden="true"><i>SA</i><i>NR</i><i>MK</i><i>+</i></div>
              <p><strong>{isBn ? '৫০,০০০+' : '50,000+'}</strong> {copy.businesses}</p>
            </div>
          </div>

          <div className="booth-scene motion-reveal" style={{ animationDelay: '0.2s' }} role="img" aria-label={copy.boothAlt}>
            <div className="scene-orbit orbit-one" />
            <div className="scene-orbit orbit-two" />
            <div className="scene-glow" />
            <div className="scene-caption"><span className="live-dot" /> {copy.liveFlow} <span>BDT · {copy.secure}</span></div>

            <div className="money-rail rail-back"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="booth-platform"><span /><span /><span /></div>

            <div className="atm-booth">
              <div className="atm-side-panel" />
              <div className="atm-top-cap"><span className="atm-logo-mark">T</span><span>টাকাSafe</span><span className="atm-status"><i /> {copy.active}</span></div>
              <div className="atm-glass">
                <div className="glass-reflection" />
                <div className="atm-inner-glow" />
                <div className="atm-display">
                  <div className="display-topline"><span>{isBn ? 'প্রবাহ / ০১' : 'FLOW / 01'}</span><span>●●●</span></div>
                  <div className="display-amount">{isBn ? '৳ ১,২৮,৪৫০' : '৳ 1,28,450'}<span>{isBn ? '.০০' : '.00'}</span></div>
                  <div className="display-label">{copy.totalVolume}</div>
                  <svg className="display-chart" viewBox="0 0 260 54" fill="none" aria-hidden="true">
                    <path d="M2 42C18 39 23 20 41 27s25 16 41 7 20-23 38-15 20 10 34 0 22 5 35-3 20-5 30-11 20 5 39-2" stroke="url(#chartStroke)" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M2 42C18 39 23 20 41 27s25 16 41 7 20-23 38-15 20 10 34 0 22 5 35-3 20-5 30-11 20 5 39-2v50H2V42Z" fill="url(#chartFill)" />
                    <defs><linearGradient id="chartStroke" x1="2" y1="24" x2="258" y2="24"><stop stopColor="#A3FF74" /><stop offset="1" stopColor="#54DDFD" /></linearGradient><linearGradient id="chartFill" x1="130" y1="5" x2="130" y2="54"><stop stopColor="#98FF70" stopOpacity=".2" /><stop offset="1" stopColor="#98FF70" stopOpacity="0" /></linearGradient></defs>
                  </svg>
                  <div className="display-footer"><span><i /> {copy.allSecure}</span><span>{isBn ? '+১৮.৪%' : '+18.4%'}</span></div>
                </div>

                <div className="atm-flow-window">
                  <div className="flow-tunnel" />
                  <div className="flow-currency flow-note note-one"><span>৳</span><i /><i /><i /></div>
                  <div className="flow-currency flow-note note-two"><span>৳</span><i /><i /><i /></div>
                  <div className="flow-currency flow-note note-three"><span>৳</span><i /><i /><i /></div>
                  <div className="flow-coin coin-one">৳</div>
                  <div className="flow-coin coin-two">৳</div>
                  <div className="flow-coin coin-three">৳</div>
                  <div className="flow-streak streak-one" /><div className="flow-streak streak-two" />
                  <div className="window-label"><span>{copy.inflow}</span><span className="window-arrow">→</span><span>{copy.outflow}</span></div>
                </div>

                <div className="atm-terminal">
                  <div className="terminal-screen"><span className="terminal-signal" /><span>{copy.secureTransfer}</span><strong>৳</strong></div>
                  <div className="terminal-keypad"><i /><i /><i /><i /><i /><i /><i /><i /><i /><b /><b /><b /></div>
                  <div className="terminal-slot"><span /></div>
                </div>
                <div className="booth-beam beam-left" /><div className="booth-beam beam-right" />
              </div>
              <div className="atm-base"><span /><i /><i /><i /><span /></div>
              <div className="atm-foot" />
            </div>

            <div className="money-rail rail-front"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="flow-card flow-card-cash"><span className="card-icon"><ArrowDownLeft size={14} /></span><span>{copy.cashFlow}</span><strong>{isBn ? '৳ ৮.৪২ লাখ' : '৳ 8.42L'}</strong><small>{isBn ? '↗ ১২.৮%' : '↗ 12.8%'}</small></div>
            <div className="flow-card flow-card-payments"><span className="card-icon"><ArrowUpRight size={14} /></span><span>{copy.payments}</span><strong>{isBn ? '৳ ২.১৬ লাখ' : '৳ 2.16L'}</strong><small>{isBn ? 'আজ' : 'Today'}</small></div>
            <div className="flow-card flow-card-savings"><span className="card-icon"><Check size={14} /></span><span>{copy.savings}</span><strong>{isBn ? '৳ ৪.০৮ লাখ' : '৳ 4.08L'}</strong><small>{isBn ? '↗ ৮.২%' : '↗ 8.2%'}</small></div>
            <div className="flow-card flow-card-revenue"><span className="card-icon"><ArrowUpRight size={14} /></span><span>{copy.revenue}</span><strong>{isBn ? '৳ ১২.৬ লাখ' : '৳ 12.6L'}</strong><small>{isBn ? '↗ ১৮.৪%' : '↗ 18.4%'}</small></div>
            <div className="scene-floor" />
          </div>
        </main>

        <div className="hero-bottom-fade" />
      </section>

      <section className="trust-section" id="customers">
        <div className="trust-banner">
          <div className="trust-monument" role="img" aria-label={isBn ? 'বাংলাদেশের জাতীয় স্মৃতিসৌধের চিত্র' : 'Illustration of Bangladesh’s National Martyrs’ Memorial'}>
            <span className="trust-cloud trust-cloud-one" /><span className="trust-cloud trust-cloud-two" />
            <svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <linearGradient id="trustSky" x1="150" y1="0" x2="150" y2="190" gradientUnits="userSpaceOnUse"><stop stopColor="#D9F0FF" /><stop offset="1" stopColor="#F3FAFF" /></linearGradient>
                <linearGradient id="trustStone" x1="82" y1="49" x2="173" y2="162" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF" /><stop offset=".48" stopColor="#BDD8E9" /><stop offset="1" stopColor="#7599B4" /></linearGradient>
                <linearGradient id="trustStoneShade" x1="143" y1="35" x2="181" y2="157" gradientUnits="userSpaceOnUse"><stop stopColor="#AFC8DA" /><stop offset="1" stopColor="#547998" /></linearGradient>
              </defs>
              <rect width="300" height="190" fill="url(#trustSky)" />
              <circle cx="247" cy="43" r="18" fill="#fff" fillOpacity=".38" />
              <path d="M0 127c33-29 52-24 77-8 18-21 41-27 71-7 25-17 54-15 80 5 27-15 47-12 72 3v70H0z" fill="#9BCBAF" />
              <path d="M0 144c33-17 62-9 88 2 27-19 53-21 82-4 37-16 73-16 130 5v43H0z" fill="#5EAA82" />
              <path d="M38 166h235l27 24H0z" fill="#A6D5C4" />
              <path d="M127 19 142 151h-29z" fill="url(#trustStone)" />
              <path d="M130 31 124 151H91z" fill="url(#trustStone)" />
              <path d="M135 43 159 151h-40z" fill="url(#trustStoneShade)" />
              <path d="M124 57 108 151H76z" fill="url(#trustStone)" />
              <path d="M139 70 175 151h-38z" fill="url(#trustStoneShade)" />
              <path d="M115 83 94 151H61z" fill="#D4E5EF" />
              <path d="M146 91 190 151h-39z" fill="#819FB5" />
              <path d="M58 151h140l20 11H43z" fill="#728FA4" />
              <path d="M45 162h173v6H45z" fill="#D3E4EE" />
              <path d="M0 169c29-7 49-4 72 4 21-8 47-8 68 0 28-10 64-8 92 1 23-8 43-8 68-1v17H0z" fill="#3D9871" />
              <path d="M14 153c8-17 14-22 21-22 8 0 14 7 19 20m210 4c6-15 12-21 18-21 7 0 13 8 18 22" stroke="#3F8969" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="trust-landmark-glow" />
          </div>

          <div className="trust-banner-content">
            <p className="trust-eyebrow">{copy.trustEyebrow}</p>
            <h2>{isBn ? 'বিশ্বস্ত ডিজিটাল ফাইন্যান্স' : 'Trusted Digital Finance'}</h2>
            <div className="trust-stats" aria-label={copy.trustAria}>
              {[
                { value: '10M+', en: 'Protected Transactions', bn: 'সুরক্ষিত লেনদেন' },
                { value: '99.9%', en: 'Secure Transactions', bn: 'নিরাপদ লেনদেন' },
                { value: '24/7', en: 'AI Monitoring', bn: 'এআই পর্যবেক্ষণ' },
                { value: '500K+', en: 'Active Users', bn: 'সক্রিয় ব্যবহারকারী' },
              ].map((stat, index) => (
                <div className="trust-stat motion-reveal" key={stat.value} style={{ animationDelay: `${0.08 + index * 0.1}s` }}>
                  <strong>{stat.value}</strong>
                  <span>{isBn ? stat.bn : stat.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-product-strip" id="products">
        <div><span className="product-eyebrow">{copy.oneView}</span><h2>{copy.moneyMotion}</h2></div>
        <p id="solutions">{copy.productDescription}</p>
        <button type="button" onClick={() => onGetStarted()}>{copy.openDashboard} <ArrowRight size={16} /></button>
        <span className="sr-only" id="resources">Resources</span><span className="sr-only" id="pricing">Pricing</span><span className="sr-only" id="careers">Careers</span>
      </section>
      <DashboardAssistant lang={lang} onAsk={onOpenAssistant} />
    </div>
  );
};
