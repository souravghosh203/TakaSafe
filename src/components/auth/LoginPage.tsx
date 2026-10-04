import React, { useEffect, useState } from 'react';
import { AuthUser, UserRole } from '../../types';
import shababAvatar from '../../../assets/shabab.png';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Building2,
  Sparkles,
  Smartphone,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser, remember: boolean) => void;
  onCancel: () => void;
  showBackButton?: boolean;
  lang: 'EN' | 'BN';
  onOpenInfo?: (modal: 'TERMS' | 'PRIVACY_POLICY') => void;
}

const adminPermissions: AuthUser['permissions'] = {
  canViewOperatorDashboard: true,
  canFreezeWallets: true,
  canDispatchLiquidity: true,
  canTunePolicyWeights: true,
  canExportAuditLogs: true,
  canPerformInvestigationActions: true,
};

const customerPermissions: AuthUser['permissions'] = {
  canViewOperatorDashboard: false,
  canFreezeWallets: false,
  canDispatchLiquidity: false,
  canTunePolicyWeights: false,
  canExportAuditLogs: false,
  canPerformInvestigationActions: false,
};

export const DEMO_PROFILES: AuthUser[] = [
  {
    id: 'USR-ADM-01',
    name: 'Md. Tanvir Hasan',
    email: 'tanvir.hasan@takasafe.upay.bd',
    phone: '+880 1712-401920',
    role: 'ADMIN',
    designation: 'Chief Risk Analyst & AML Supervisor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    permissions: adminPermissions,
  },
  {
    id: 'USR-ADM-02',
    name: 'Sourov Kumar',
    email: 'sourov.kumar@takasafe.upay.bd',
    phone: '+880 1812-402921',
    role: 'ADMIN',
    designation: 'SOC Operations & Risk Governance',
    permissions: adminPermissions,
  },
  {
    id: 'USR-ADM-03',
    name: 'Md. Sadman Al Islam Shabab',
    email: 'sadman.shabab@takasafe.upay.bd',
    phone: '+880 1912-403922',
    role: 'ADMIN',
    designation: 'Model Architecture & Explainability Lead',
    avatar: shababAvatar,
    permissions: adminPermissions,
  },
  {
    id: 'USR-CUST-88',
    name: 'Rafiqul Islam',
    email: 'rafiqul.islam@gmail.com',
    phone: '01711-239481',
    role: 'USER',
    designation: 'Verified Upay MFS Customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    permissions: customerPermissions,
  },
  {
    id: 'USR-CUST-89',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@example.com',
    phone: '01818-234567',
    role: 'USER',
    designation: 'Verified Upay MFS Customer',
    permissions: customerPermissions,
  },
  {
    id: 'USR-CUST-90',
    name: 'Imran Hossain',
    email: 'imran.hossain@example.com',
    phone: '01919-345678',
    role: 'USER',
    designation: 'Verified Upay MFS Customer',
    permissions: customerPermissions,
  },
  {
    id: 'USR-CUST-91',
    name: 'Farzana Akter',
    email: 'farzana.akter@example.com',
    phone: '01616-456789',
    role: 'USER',
    designation: 'Verified Upay MFS Customer',
    permissions: customerPermissions,
  },
];

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  ADMIN: DEMO_PROFILES.find((profile) => profile.role === 'ADMIN')!,
  USER: DEMO_PROFILES.find((profile) => profile.role === 'USER')!,
};

const PROFILE_STORAGE_PREFIX = 'takasafe-profile:';
const loadQuickLoginProfiles = (): AuthUser[] => DEMO_PROFILES.map((profile) => {
  try {
    const saved = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${profile.id}`);
    return saved ? { ...profile, ...JSON.parse(saved) } : profile;
  } catch { return profile; }
});

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCancel, showBackButton = true, lang, onOpenInfo }) => {
  const [quickLoginProfiles, setQuickLoginProfiles] = useState<AuthUser[]>(loadQuickLoginProfiles);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS.ADMIN.email);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const refreshProfiles = () => setQuickLoginProfiles(loadQuickLoginProfiles());
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') refreshProfiles(); };
    const refreshOnStorage = (event: StorageEvent) => {
      if (event.key?.startsWith(PROFILE_STORAGE_PREFIX)) refreshProfiles();
    };
    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('storage', refreshOnStorage);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('storage', refreshOnStorage);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, []);

  // Switch role selection and autofill matching demo credentials
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const profile = DEMO_PROFILES.find((candidate) => candidate.role === role)!;
    setEmail(profile.email);
    setPassword('••••••••••••');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const emailProfile = DEMO_PROFILES.find((profile) => profile.email.toLowerCase() === email.trim().toLowerCase());
      if (!emailProfile || emailProfile.role !== selectedRole) {
        setErrorMsg('That email does not match a demo profile for the selected role. Use one of the listed demo profiles below.');
        return;
      }
      onLogin(emailProfile, remember);
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('Google sign-in is not configured for this demo. Choose a demo profile below to continue.');
  };

  const handleQuickLogin = (profile: AuthUser) => {
    setSelectedRole(profile.role);
    setEmail(profile.email);
    setErrorMsg(null);
    onLogin(profile, true);
  };

  return (
    <div className="login-scene min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 font-sans">
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />
      <div className="login-layout w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-stretch gap-5 lg:gap-7 relative">
      <aside className={`login-brand-panel relative overflow-hidden rounded-3xl p-7 sm:p-9 lg:p-11 text-white flex flex-col justify-between min-h-[350px] lg:min-h-full ${selectedRole === 'ADMIN' ? 'login-brand-admin' : 'login-brand-user'}`}>
        <div className="absolute inset-0 login-brand-grid" aria-hidden="true" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="login-brand-mark flex items-center justify-center w-11 h-11 rounded-2xl bg-white/12 border border-white/20">
              {selectedRole === 'ADMIN' ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </span>
            <div>
              <div className="mfs-logo-text flex items-baseline tracking-tight select-none" aria-label="টাকা Safe">
                <span className="mfs-brand-word mfs-brand-taka font-['Hind_Siliguri','Noto_Sans_Bengali',sans-serif] text-xl sm:text-2xl font-black text-[#FAB915] leading-none">
                  টাকা
                </span>
                <span className="mfs-brand-word mfs-brand-safe font-['Times_New_Roman',Times,serif] text-[22px] sm:text-[25px] font-bold text-white leading-none ml-0.5 sm:ml-1 tracking-tight">
                  Safe
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[.22em] text-white/65">Trust in every transaction</div>
            </div>
          </div>
          <div className="mt-12 lg:mt-16 max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-emerald-200">Security that moves with you</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight tracking-tight">Confidence in every <span className="text-emerald-200">payment.</span></h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">TakaSafe watches transaction patterns, surfaces risk early, and helps protect Bangladesh’s digital payments.</p>
          </div>
        </div>

        <div className="login-network relative z-10 my-7 flex-1 min-h-[270px] sm:min-h-[320px] flex items-center" aria-hidden="true">
          <div className="login-network-card relative w-full h-full rounded-3xl border border-white/15 bg-slate-950/20 p-4 sm:p-5 flex flex-col justify-center">
          <div className="login-orbit-art" aria-hidden="true">
            <div className="login-orbit-ring login-orbit-ring-back" />
            <div className="login-orbit-ring login-orbit-ring-front" />
            <div className="login-orbit-core"><ShieldCheck className="h-8 w-8" /></div>
            <span className="login-orbit-spark login-orbit-spark-one" />
            <span className="login-orbit-spark login-orbit-spark-two" />
          </div>
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">Transaction intelligence</span>
            <span className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-200"><span className="login-status-dot h-1.5 w-1.5 rounded-full bg-emerald-300" /> MONITORING</span>
          </div>
          <svg viewBox="0 0 440 170" className="w-full h-40 sm:h-48" fill="none" role="presentation">
            <path className="network-line" d="M42 112 128 66l82 37 88-57 100 47M128 66l24 70 58-33 51 39 37-96M42 112l110 24 68 22 51-16 127-49" />
            <circle className="network-pulse" cx="210" cy="103" r="34" />
            <path d="M210 81 226 87v14c0 12-7 21-16 25-9-4-16-13-16-25V87l16-6Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="2" />
            <path d="m203 101 5 5 10-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {[[42,112],[128,66],[152,136],[292,46],[398,93],[261,142],[278,126]].map(([cx,cy], i) => <circle key={i} cx={cx} cy={cy} r={i === 0 || i === 4 ? 5 : 3.5} className="network-node" />)}
          </svg>
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
            <div className="rounded-xl bg-white/[.06] px-2.5 py-2"><div className="text-[9px] text-white/50">SIGNALS</div><div className="mt-1 text-sm font-bold">24<span className="ml-1 text-[9px] font-medium text-emerald-200">live</span></div></div>
            <div className="rounded-xl bg-white/[.06] px-2.5 py-2"><div className="text-[9px] text-white/50">NETWORK</div><div className="mt-1 text-sm font-bold">Connected</div></div>
            <div className="rounded-xl bg-white/[.06] px-2.5 py-2"><div className="text-[9px] text-white/50">COVERAGE</div><div className="mt-1 text-sm font-bold">24 / 7</div></div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200/10 bg-emerald-200/[.06] px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-200" />
            <span className="text-[10px] leading-relaxed text-white/70">Every transfer checked against a connected network of risk signals.</span>
            <span className="ml-auto shrink-0 text-[9px] font-semibold text-emerald-200">SECURE</span>
          </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="w-4 h-4 text-emerald-200" /> Protected by TakaSafe</div>
          <span className="rounded-full border border-amber-200/35 bg-amber-200/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-100">Demo environment</span>
        </div>
      </aside>
      <div className="login-card w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 lg:p-9 relative card-hover-lift">
        {/* Top Back Navigation */}
        {showBackButton && (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Header Kicker and Title matching user image reference */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-[#164E3D] font-bold uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]"></span>
            <span>Account Access</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
            Sign in
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Demo access only. Email selects a sample profile; passwords are not authenticated.
          </p>
        </div>

        {/* Two Options: Admin vs User Role Selector */}
        <div className="mb-6 space-y-3">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Select Access Role
          </div>

          <div className="login-role-switch grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
            {/* Admin Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              aria-pressed={selectedRole === 'ADMIN'}
              className={`login-role-option flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-blue-50 text-slate-950 shadow-md ring-1 ring-blue-700/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-[#0054A6]' : 'text-slate-400'}`} />
              <span>Admin</span>
            </button>

            {/* User Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('USER')}
              aria-pressed={selectedRole === 'USER'}
              className={`login-role-option flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'USER'
                  ? 'bg-emerald-50 text-slate-950 shadow-md ring-1 ring-emerald-700/15'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className={`w-4 h-4 ${selectedRole === 'USER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>User</span>
            </button>
          </div>

          {/* Dynamic Active Role Privileges Panel */}
          <div key={selectedRole} className={`login-privileges p-3.5 rounded-2xl border text-xs transition-all ${
            selectedRole === 'ADMIN'
              ? 'bg-blue-50/80 border-blue-200 text-blue-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedRole === 'ADMIN' ? 'bg-[#0054A6]' : 'bg-emerald-600'
                }`} />
                <span className="font-bold text-xs">
                  {selectedRole === 'ADMIN' ? 'Admin: Operator Intelligence' : 'User: Customer Wallet'}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#0054A6] text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {selectedRole === 'ADMIN' ? '6/6 Authorizations' : '2/6 Authorizations'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-2.5 leading-snug">
              {selectedRole === 'ADMIN' ? (
                <span>
                  <strong>Full Administrative Access:</strong> Authorized for National Risk Cockpit, multi-hop MuleVision graph, suspicious wallet quarantine, coastal float dispatch, policy tuning & BFIU regulatory compliance.
                </span>
              ) : (
                <span>
                  <strong>Scoped Customer Access:</strong> Authorized for personal Upay customer wallet, Send Money with ScamShield protection & linked accounts. Administrative surveillance and network freezing are restricted.
                </span>
              )}
            </p>

            {/* Privilege Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/80 text-[11px]">
              {selectedRole === 'ADMIN' ? (
                <>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>Operator Cockpit & Live Ticker</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>Quarantine & Freeze Wallets</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>Dispatch Emergency Agent Floats</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>Tune ML Policy Weights</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>Export BFIU Audit Logs (CSV)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>AI Dossier Case Investigations</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Personal Wallet & Balances</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Send Money & ScamShield</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">Operator Surveillance</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">Quarantine Wallets</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">Dispatch Cash Floats</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">Policy Tuning & Audit Export</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Continue with Google button matching image reference */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-full text-xs font-semibold text-slate-700 shadow-xs transition-all cursor-pointer hover:shadow-sm"
        >
          {/* Multicolored Google SVG Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
            <span>Google sign-in unavailable</span>
        </button>

        {/* OR Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-mono tracking-widest uppercase">
            <span className="bg-white px-3 text-slate-400 font-semibold">Or</span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div role="alert" className="login-error mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  // Keep the chosen access mode stable while typing. Deriving the
                  // role from email caused autofill/input to silently switch a
                  // customer sign-in back to the admin view.
                  setEmail(e.target.value);
                }}
                placeholder="Enter Your Email"
                autoComplete="off"
                required
                className={`login-input ${selectedRole === 'ADMIN' ? 'login-input-admin' : 'login-input-user'} w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Use an email shown on a demo profile button below. The password is not verified.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                required
                className={`login-input ${selectedRole === 'ADMIN' ? 'login-input-admin' : 'login-input-user'} w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="rounded border-slate-300 text-[#164E3D] focus:ring-[#164E3D]"
              />
              <span className="text-[11px]">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setErrorMsg('Password reset is unavailable because this demo has no account or email service. Use a demo profile below.')}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-normal pt-1">
            By signing in, I agree to the{' '}
            <button type="button" onClick={() => onOpenInfo?.('TERMS')} className="text-slate-700 underline font-medium cursor-pointer">Terms of Service</button> and{' '}
            <button type="button" onClick={() => onOpenInfo?.('PRIVACY_POLICY')} className="text-slate-700 underline font-medium cursor-pointer">Privacy Policy</button>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`login-submit w-full py-3 px-4 text-white font-bold rounded-full text-xs shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
              selectedRole === 'ADMIN'
                ? 'bg-[#0054A6] hover:bg-[#004080]'
                : 'bg-[#164E3D] hover:bg-[#113C2F]'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in as {selectedRole === 'ADMIN' ? 'Admin' : 'User'}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Click Demo Profiles Footer for Evaluators */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
            Quick 1-Click Demo Logins for Evaluators
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickLoginProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleQuickLogin(profile)}
                className={`login-profile w-full text-[11px] font-bold text-slate-800 ${profile.role === 'ADMIN' ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'} border px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs`}
              >
                {profile.role === 'ADMIN'
                  ? <ShieldCheck className="w-3.5 h-3.5 text-[#0054A6]" />
                  : <User className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{profile.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
