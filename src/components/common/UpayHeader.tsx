import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Network,
  CloudLightning,
  Radar,
  Sliders,
  FileCheck2,
  Smartphone,
  Globe,
  Search,
  Phone,
  Sparkles,
  MapPin,
  CreditCard,
  Info,
  ChevronDown,
  Newspaper,
  User,
  Camera,
  Pencil,
  X as CloseIcon,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';

interface UpayHeaderProps {
  activeView: 'OPERATOR' | 'CUSTOMER' | 'STORYLINE' | 'LOGIN';
  setActiveView: (view: 'OPERATOR' | 'CUSTOMER' | 'STORYLINE' | 'LOGIN') => void;
  operatorTab: string;
  setOperatorTab: (tab: string) => void;
  lang: 'EN' | 'BN';
  setLang: (lang: 'EN' | 'BN') => void;
  criticalAlertCount: number;
  currentUser?: AuthUser | null;
  onRegister?: () => void;
  onLogout?: () => void;
  onSwitchUserRole?: (role: UserRole) => void;
  onUpdateProfile?: (profile: Pick<AuthUser, 'name' | 'email' | 'phone' | 'avatar'>) => void;
  onOpenModal?: (modalType: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  darkHeader?: boolean;
}

export const UpayHeader: React.FC<UpayHeaderProps> = ({
  activeView,
  setActiveView,
  operatorTab,
  setOperatorTab,
  lang,
  setLang,
  criticalAlertCount,
  currentUser,
  onRegister,
  onLogout,
  onSwitchUserRole,
  onUpdateProfile,
  onOpenModal,
  theme = 'light',
  onToggleTheme,
  darkHeader = false,
}) => {
  const [isServicesOpen, setIsServicesOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', email: '', phone: '', avatar: '' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoClick = () => {
    setActiveView('OPERATOR');
    setOperatorTab('OVERVIEW');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModuleClick = (tabId: string) => {
    setActiveView('OPERATOR');
    setOperatorTab(tabId);
    const el = document.getElementById('operator-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (section: string) => {
    setIsServicesOpen(false);
    if (section === 'HOME') {
      handleLogoClick();
    } else if (section === 'SERVICES') {
      const el = document.getElementById('services-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenModal?.('LIMITS_CHARGES');
    } else {
      onOpenModal?.(section);
    }
  };

  const OPERATOR_MODULES = [
    { id: 'OVERVIEW', label: '1. Transaction Guardian', icon: ShieldCheck, badge: criticalAlertCount },
    { id: 'MULEVISION', label: '2. MuleVision (Graph)', icon: Network },
    { id: 'GEOSPATIAL', label: '3. Geospatial Intelligence', icon: Globe },
    { id: 'RADAR', label: '4. Early-Warning Radar', icon: Radar },
    { id: 'RESILIENCE', label: '5. Disaster Resilience', icon: CloudLightning },
    { id: 'POLICY', label: '6. Policy Weights', icon: Sliders },
    { id: 'AUDIT', label: '7. Audit Logs', icon: FileCheck2 },
  ];

  return (
    <header className={`app-sticky-header sticky top-0 z-50 w-full max-w-full bg-[#0054A6] text-white shadow-md border-b border-[#004080]${isScrolled ? ' is-scrolled' : ''}`} style={activeView === 'OPERATOR' || activeView === 'CUSTOMER' || activeView === 'LOGIN' || darkHeader ? { background: 'linear-gradient(118deg, #071324 0%, #0b1d37 48%, #0d2e5e 100%)', borderBottomColor: 'rgba(219,234,254,.16)' } : undefined}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Brand Zone: Authentic MFS Animated Logo (Smile Spring, Dot Wink & Radiant Gold Bloom) */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer text-left group shrink-0 focus:outline-none select-none transition-transform duration-300 ease-out active:scale-[0.97]"
            title="TakaSafe Home"
          >
            {/* Logo Mark with Ripple Pulse and Smile Bounce */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
              {/* Concentric Golden Radar Pulse Ring */}
              <div className="absolute inset-0 rounded-full mfs-halo-pulse pointer-events-none" />

              {/* White Icon Disc with Elastic Smile Bounce */}
              <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center p-1 sm:p-1.5 shadow-sm mfs-icon-bounce transition-all duration-300 group-hover:shadow-[0_4px_18px_rgba(250,185,21,0.5),0_0_8px_rgba(250,185,21,0.4)]">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  {/* Outer Smile Arc */}
                  <path
                    d="M 22 45 C 22 75 78 75 78 45"
                    fill="none"
                    stroke="#FAB915"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="mfs-curve-flex origin-bottom"
                  />
                  {/* Inner Smile Arc */}
                  <path
                    d="M 34 52 C 34 72 66 72 66 52"
                    fill="none"
                    stroke="#0054A6"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="mfs-curve-flex origin-bottom"
                  />
                  {/* Cheerful Red Dot with Playful Wink / Bounce */}
                  <circle
                    cx="50"
                    cy="30"
                    r="8"
                    fill="#E11D48"
                    className="mfs-dot-wink origin-center"
                  />
                </svg>
              </div>
            </div>

            {/* Typography with Golden Bloom Aura (No Color Change on Taka or Safe) */}
            <div className="mfs-logo-text flex items-baseline tracking-tight select-none">
              <span className="mfs-brand-word mfs-brand-taka font-['Hind_Siliguri','Noto_Sans_Bengali',sans-serif] text-xl sm:text-2xl font-black text-[#FAB915] leading-none">
                টাকা
              </span>
              <span className="mfs-brand-word mfs-brand-safe font-['Times_New_Roman',Times,serif] text-[22px] sm:text-[25px] font-bold text-white leading-none ml-0.5 sm:ml-1 tracking-tight">
                Safe
              </span>
            </div>
          </button>

          {/* Operator Modules Tabs directly in Top Navbar (Hidden on smaller screens, shown on XL) */}
          {currentUser?.role === 'ADMIN' && <nav className="hidden xl:flex flex-1 min-w-0 items-center gap-1 overflow-x-auto py-1 px-1 scrollbar-none mx-2">
            {OPERATOR_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isSelected = activeView === 'OPERATOR' && operatorTab === mod.id;
              const isUserRole = currentUser?.role === 'USER';
              return (
                <button
                  key={mod.id}
                  onClick={() => handleModuleClick(mod.id)}
                  aria-current={isSelected ? 'page' : undefined}
                  className={`operator-module-link header-feature relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#0054A6] shadow-md border-b-2 border-teal-400'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                  title={isUserRole ? `${mod.label} (Admin Clearance Required)` : mod.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mod.label}</span>
                  {isUserRole && (
                    <span className="text-[9px] bg-black/25 text-amber-200 px-1 py-0.2 rounded font-mono font-normal">
                      🔒
                    </span>
                  )}
                  {mod.badge !== undefined && mod.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full font-black animate-pulse shadow-xs">
                      {mod.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>}

          {/* Right Action Utilities & Clean Services Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Clean Services & Info Dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`header-feature flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isServicesOpen
                    ? 'bg-white text-[#0054A6] border-white shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-blue-50 border-white/15'
                }`}
                title="Services and Platform Info"
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isServicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isServicesOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Explore TakaSafe
                  </div>
                  <button
                    onClick={() => handleNavClick('ABSTRACT')}
                    className="w-full px-3 py-2 text-left text-xs bg-amber-50/70 hover:bg-amber-100/80 flex items-center gap-2.5 transition-colors cursor-pointer text-[#0054A6] font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Project Abstract & SDGs</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('ABOUT_US')}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-[#0054A6]" />
                    <span className="font-semibold text-slate-800">About Us</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('SERVICES')}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-slate-800">Products & Campaigns</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('PREPAID_CARD')}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">Prepaid Card</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('SERVICE_LOCATIONS')}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-semibold text-slate-800">ATM & Service Points</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('MEDIA')}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Newspaper className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold text-slate-800">Media & Press</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <a
                    href="tel:16268"
                    className="w-full px-3 py-2 text-left text-xs hover:bg-amber-50 flex items-center justify-between text-amber-800 font-bold transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>24/7 Hotline</span>
                    </span>
                    <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono">
                      16268
                    </span>
                  </a>
                </div>
              )}
            </div>

            {/* Customer App Switcher Pill (Tablet & Desktop) */}
            {currentUser?.role === 'ADMIN' && <button
              onClick={() => setActiveView(activeView === 'CUSTOMER' ? 'OPERATOR' : 'CUSTOMER')}
              className={`header-feature hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'CUSTOMER'
                  ? 'bg-[#48D1C3] text-[#083344] shadow-md ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title="Toggle Customer App Simulator"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>
                {activeView === 'CUSTOMER' ? 'Operator Cockpit' : 'Customer App'}
              </span>
            </button>}

            <button
              onClick={() => onOpenModal?.('SEARCH')}
              className="header-feature header-search-control hidden md:flex items-center justify-center gap-1.5 px-2.5 lg:px-3 text-white/85 cursor-pointer"
              title={lang === 'BN' ? 'সার্চ ডিরেক্টরি' : 'Search Directory'}
              aria-label={lang === 'BN' ? 'সার্চ ডিরেক্টরি খুলুন' : 'Open Search Directory'}
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">{lang === 'BN' ? 'খুঁজুন' : 'Search'}</span>
            </button>

            <button
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="header-feature flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'EN' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={onToggleTheme}
              className="header-feature flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                  <span className="hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-200" />
                  <span className="hidden md:inline">Dark</span>
                </>
              )}
            </button>

            {/* Login / User Profile Button (Desktop & Tablet) */}
            {currentUser ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="header-feature flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#0054A6] shadow-sm hover:bg-blue-50 transition-all cursor-pointer border border-white"
                  title="Account Details"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0054A6] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    {currentUser.avatar ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[85px] truncate hidden md:inline">{currentUser.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    currentUser.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUser.role}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{currentUser.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          currentUser.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{currentUser.email}</div>
                      <div className="text-[10px] text-indigo-600 font-medium mt-0.5">{currentUser.designation}</div>

                      {/* Privilege level indicator tag */}
                      <div className="mt-2 p-2 rounded-xl text-[10px] border leading-tight bg-slate-50 border-slate-200">
                        {currentUser.role === 'ADMIN' ? (
                          <div className="text-[#0054A6] font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Wider Privileges: Full Surveillance & Wallet Freezing</span>
                          </div>
                        ) : (
                          <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>Less Privileges: Personal Upay Wallet & ScamShield</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDraft({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, avatar: currentUser.avatar || '' });
                          setIsUserMenuOpen(false);
                          setIsProfileEditorOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs bg-blue-50 hover:bg-blue-100 text-[#0054A6] font-bold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5"><Pencil className="w-3.5 h-3.5" /> Edit profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {/* 1-Click Role Switcher */}
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSwitchUserRole?.('USER');
                          }}
                          className="w-full px-4 py-2 text-left text-xs bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Switch to User (Less Privileges)</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (currentUser.role === 'ADMIN') setActiveView('OPERATOR');
                          else setActiveView('CUSTOMER');
                        }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                      >
                        <span>Go to {currentUser.role === 'ADMIN' ? 'Operator Cockpit' : 'Customer App'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveView('LOGIN');
                        }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                      >
                        <span>Change Account / Log In</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 px-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs rounded-xl hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => activeView === 'LOGIN' ? onRegister?.() : setActiveView('LOGIN')}
                className={`header-feature hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'LOGIN'
                    ? 'bg-white text-[#0054A6] shadow-sm ring-2 ring-white/60'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                }`}
                title={activeView === 'LOGIN' ? 'Create a new account' : 'Sign in (Admin or User)'}
              >
                <User className={`w-3.5 h-3.5 ${activeView === 'LOGIN' ? 'text-[#0054A6]' : 'text-white'}`} />
                <span>{activeView === 'LOGIN' ? 'Register' : 'Login'}</span>
              </button>
            )}

            {isProfileEditorOpen && currentUser && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsProfileEditorOpen(false); }}>
                <form
                  className="w-full max-w-md overflow-hidden rounded-3xl bg-white text-slate-800 shadow-2xl border border-white/70"
                  onSubmit={(event) => { event.preventDefault(); onUpdateProfile?.(profileDraft); setIsProfileEditorOpen(false); }}
                >
                  <div className="bg-gradient-to-r from-[#0054A6] to-[#0879C9] px-6 py-5 text-white flex items-start justify-between">
                    <div><p className="text-xs font-semibold text-blue-100">YOUR ACCOUNT</p><h2 className="mt-1 text-xl font-bold">Edit profile</h2><p className="mt-1 text-xs text-blue-100">Personalize how you appear in TakaSafe.</p></div>
                    <button type="button" onClick={() => setIsProfileEditorOpen(false)} className="rounded-xl p-2 hover:bg-white/15" aria-label="Close"><CloseIcon className="w-4 h-4" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0054A6] border border-blue-100 overflow-hidden flex items-center justify-center text-2xl font-bold">
                        {profileDraft.avatar ? <img src={profileDraft.avatar} alt="Profile preview" className="w-full h-full object-cover" /> : profileDraft.name.charAt(0).toUpperCase() || <User />}
                      </div>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-[#0054A6] hover:bg-blue-50 cursor-pointer"><Camera className="w-4 h-4" /> Change photo<input type="file" accept="image/*" className="sr-only" onChange={(event) => {
                        const file = event.target.files?.[0]; if (!file) return;
                        if (!file.type.startsWith('image/')) return;
                        const reader = new FileReader(); reader.onload = () => {
                          const image = new Image(); image.onload = () => { const canvas = document.createElement('canvas'); const scale = Math.min(1, 512 / Math.max(image.width, image.height)); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height); setProfileDraft((draft) => ({ ...draft, avatar: canvas.toDataURL('image/jpeg', 0.82) })); }; image.src = String(reader.result);
                        }; reader.readAsDataURL(file);
                      }} /></label>
                      {profileDraft.avatar && <button type="button" onClick={() => setProfileDraft((draft) => ({ ...draft, avatar: '' }))} className="text-xs font-semibold text-slate-500 hover:text-rose-600">Remove</button>}
                    </div>
                    {([['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone number', 'tel']] as const).map(([key, label, type]) => (
                      <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input type={type} required value={profileDraft[key]} onChange={(event) => setProfileDraft((draft) => ({ ...draft, [key]: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0054A6] focus:bg-white focus:ring-2 focus:ring-blue-100" /></label>
                    ))}
                    <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsProfileEditorOpen(false)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-xl bg-[#0054A6] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#004080]">Save changes</button></div>
                  </div>
                </form>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button (Visible on < XL screens) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="header-feature header-feature-icon flex xl:hidden p-2 rounded-xl text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#004080] border-t border-blue-400/20 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 text-white shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Quick View Switcher */}
          {currentUser?.role === 'ADMIN' && <div className="flex items-center gap-1.5 p-1 bg-black/25 rounded-xl">
            <button
              onClick={() => {
                setActiveView('OPERATOR');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                activeView === 'OPERATOR' ? 'bg-white text-[#0054A6] shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Operator
            </button>
            <button
              onClick={() => {
                setActiveView('CUSTOMER');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                activeView === 'CUSTOMER' ? 'bg-[#FAB915] text-slate-950 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                setActiveView('STORYLINE');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                activeView === 'STORYLINE' ? 'bg-white text-[#0054A6] shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Storyline
            </button>
          </div>}

          {/* Operator Modules Quick Links */}
          {currentUser?.role === 'ADMIN' && <div>
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-2">
              Operator Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {OPERATOR_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = activeView === 'OPERATOR' && operatorTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      handleModuleClick(mod.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected ? 'bg-white text-[#0054A6] font-bold' : 'hover:bg-white/10 text-blue-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{mod.label}</span>
                    </span>
                    {mod.badge !== undefined && mod.badge > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-mono px-1.5 py-0.2 rounded-full font-black shrink-0">
                        {mod.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>}

          {/* Services & Quick Links */}
          <div className="pt-2 border-t border-blue-400/20">
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-2">
              Services &amp; Directory
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => {
                  handleNavClick('ABSTRACT');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-amber-400 text-blue-950 text-left font-bold"
              >
                ✨ Abstract &amp; SDGs
              </button>
              <button
                onClick={() => {
                  handleNavClick('ABOUT_US');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium"
              >
                About TakaSafe
              </button>
              <button
                onClick={() => {
                  handleNavClick('SERVICES');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium"
              >
                Products &amp; Campaigns
              </button>
              <button
                onClick={() => {
                  handleNavClick('PREPAID_CARD');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium"
              >
                Prepaid Card
              </button>
              <button
                onClick={() => {
                  handleNavClick('SERVICE_LOCATIONS');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium"
              >
                ATM &amp; Service Points
              </button>
              <button
                onClick={() => {
                  onOpenModal?.('SEARCH');
                  setIsMobileMenuOpen(false);
                }}
                className="header-search-mobile flex w-full items-center gap-2 px-3 rounded-xl text-left font-semibold cursor-pointer"
                aria-label={lang === 'BN' ? 'সার্চ ডিরেক্টরি খুলুন' : 'Open Search Directory'}
              >
                <Search className="w-4 h-4" />
                <span>{lang === 'BN' ? 'খুঁজুন' : 'Search'}</span>
              </button>
              <a
                href="tel:16268"
                className="p-2.5 rounded-xl bg-amber-400 text-blue-950 font-bold flex items-center justify-between"
              >
                <span>24/7 Hotline</span>
                <span className="font-mono text-xs">16268</span>
              </a>
            </div>
          </div>

          {/* User Profile & Demo Switcher in Mobile Drawer */}
          {currentUser ? (
            <div className="pt-2 border-t border-blue-400/20 text-xs space-y-2">
              <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white text-[#0054A6] flex items-center justify-center font-bold text-xs overflow-hidden">
                    {currentUser.avatar ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold block leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-blue-200 font-mono">Role: {currentUser.role}</span>
                  </div>
                </div>
                {currentUser.role === 'ADMIN' && onSwitchUserRole && (
                  <button
                    onClick={() => {
                      onSwitchUserRole(currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN');
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[11px] font-bold border border-white/20"
                  >
                    Switch to {currentUser.role === 'ADMIN' ? 'User' : 'Admin'}
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setProfileDraft({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, avatar: currentUser.avatar || '' });
                  setIsMobileMenuOpen(false);
                  setIsProfileEditorOpen(true);
                }}
                className="w-full p-2.5 text-left rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit profile
              </button>

              <button
                onClick={() => {
                  onLogout?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-2 text-center text-xs text-rose-300 hover:text-white hover:bg-rose-600/30 rounded-xl transition-colors font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-blue-400/20">
              <button
                onClick={() => {
                  if (activeView === 'LOGIN') onRegister?.();
                  else setActiveView('LOGIN');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-white text-[#0054A6] rounded-xl text-xs font-bold text-center shadow-md"
              >
                {activeView === 'LOGIN' ? 'Create an account' : 'Sign In to TakaSafe'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
