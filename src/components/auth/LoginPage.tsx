import React, { useEffect, useState } from 'react';
import { AuthUser, UserRole } from '../../types';
import shababAvatar from '../../../assets/shabab.png';
import {
  ShieldCheck,
  User,
  Lock,
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
  onRegister: () => void;
  showBackButton?: boolean;
  lang: 'EN' | 'BN';
  theme?: 'light' | 'dark';
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
    if (!saved) return profile;
    const safeProfile = JSON.parse(saved);
    if (safeProfile && typeof safeProfile === 'object' && 'phone' in safeProfile) {
      delete safeProfile.phone;
      localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${profile.id}`, JSON.stringify(safeProfile));
    }
    return { ...profile, ...safeProfile, phone: profile.phone };
  } catch { return profile; }
});

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCancel, onRegister, showBackButton = true, lang, theme = 'light', onOpenInfo }) => {
  const isBn = lang === 'BN';
  const t = (english: string, bangla: string) => isBn ? bangla : english;
  const [quickLoginProfiles, setQuickLoginProfiles] = useState<AuthUser[]>(loadQuickLoginProfiles);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [phone, setPhone] = useState<string>(DEMO_ACCOUNTS.ADMIN.phone.replace(/^\+880\s*/, '0').replace(/\D/g, ''));
  const [pin, setPin] = useState<string>('123456');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const normalizePhone = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('880')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  };

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

  useEffect(() => {
    setErrorMsg(null);
  }, [lang]);

  // Switch role selection and autofill matching demo credentials
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const profile = DEMO_PROFILES.find((candidate) => candidate.role === role)!;
    setPhone(`0${normalizePhone(profile.phone)}`);
    setPin('123456');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizePhone(phone);
    if (!/^1[3-9]\d{8}$/.test(normalizedPhone)) {
      setErrorMsg(t('Enter a valid Bangladesh mobile number.', 'বৈধ বাংলাদেশি মোবাইল নম্বর লিখুন।'));
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setErrorMsg(t('Enter your 6-digit PIN.', 'আপনার ৬ সংখ্যার পিন লিখুন।'));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const phoneProfile = DEMO_PROFILES.find((profile) => normalizePhone(profile.phone) === normalizedPhone);
      if (!phoneProfile || phoneProfile.role !== selectedRole) {
        setErrorMsg(t('That mobile number does not match a demo profile for the selected role. Choose a listed demo profile or register.', 'এই মোবাইল নম্বরটি নির্বাচিত ভূমিকার ডেমো প্রোফাইলের সঙ্গে মেলে না। তালিকা থেকে প্রোফাইল বেছে নিন অথবা নিবন্ধন করুন।'));
        return;
      }
      if (pin !== '123456') {
        setErrorMsg(t('For this demo, use PIN 123456. Real PIN authentication is not connected.', 'এই ডেমোর জন্য ১২৩৪৫৬ পিন ব্যবহার করুন। প্রকৃত পিন যাচাই সংযুক্ত নয়।'));
        return;
      }
      onLogin(phoneProfile, remember);
    }, 400);
  };

  const handleQuickLogin = (profile: AuthUser) => {
    setErrorMsg(null);
    onLogin(profile, true);
  };

  return (
    <div className="login-scene min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 font-sans" lang={isBn ? 'bn' : 'en'} data-theme={theme}>
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />
      <div className="login-card w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative card-hover-lift">
        {/* Top Back Navigation */}
        {showBackButton && (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('Back to Home', 'হোমে ফিরুন')}</span>
          </button>
        )}

        {/* Header Kicker and Title matching user image reference */}
        <div className="text-center mb-6">
          <div className="login-kicker inline-flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-[#0054A6] font-bold uppercase mb-2">
            <span className="login-kicker-dot w-1.5 h-1.5 rounded-full bg-[#0054A6]"></span>
            <span>{t('Account Access', 'অ্যাকাউন্টে প্রবেশ')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('Sign in', 'লগইন')}
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            {t('Sign in with your Bangladesh mobile number and 6-digit PIN. Demo credentials only; PIN authentication is not connected.', 'বাংলাদেশি মোবাইল নম্বর ও ৬ সংখ্যার পিন দিয়ে লগইন করুন। এটি শুধু ডেমো; প্রকৃত পিন যাচাই সংযুক্ত নয়।')}
          </p>
        </div>

        {/* Two Options: Admin vs User Role Selector */}
        <div className="mb-6 space-y-3">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            {t('Select Access Role', 'প্রবেশের ধরন বেছে নিন')}
          </div>

          <div className="login-role-switch grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
            {/* Admin Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              aria-pressed={selectedRole === 'ADMIN'}
              className={`login-role-option flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-900/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-[#0054A6]' : 'text-slate-400'}`} />
              <span>{t('Admin', 'অ্যাডমিন')}</span>
            </button>

            {/* User Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('USER')}
              aria-pressed={selectedRole === 'USER'}
              className={`login-role-option flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'USER'
                  ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-900/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className={`w-4 h-4 ${selectedRole === 'USER' ? 'text-[#0054A6]' : 'text-slate-400'}`} />
              <span>{t('User', 'ব্যবহারকারী')}</span>
            </button>
          </div>

          {/* Dynamic Active Role Privileges Panel */}
          <div key={selectedRole} className={`login-privileges p-3.5 rounded-2xl border text-xs transition-all ${
            selectedRole === 'ADMIN'
              ? 'bg-blue-50/80 border-blue-200 text-blue-950'
              : 'bg-sky-50/90 border-sky-200 text-sky-950'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedRole === 'ADMIN' ? 'bg-[#0054A6]' : 'bg-sky-600'
                }`} />
                <span className="font-bold text-xs">
                  {selectedRole === 'ADMIN' ? t('Admin: Operator Intelligence', 'অ্যাডমিন: অপারেটর ইন্টেলিজেন্স') : t('User: Customer Wallet', 'ব্যবহারকারী: গ্রাহক ওয়ালেট')}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#0054A6] text-white'
                  : 'bg-sky-600 text-white'
              }`}>
                {selectedRole === 'ADMIN' ? (isBn ? '৬/৬ অনুমতি' : '6/6 Authorizations') : (isBn ? '২/৬ অনুমতি' : '2/6 Authorizations')}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-2.5 leading-snug">
              {selectedRole === 'ADMIN' ? (
                <span>
                  <strong>{t('Full Administrative Access:', 'সম্পূর্ণ প্রশাসনিক প্রবেশাধিকার:')}</strong> {t('Authorized for National Risk Cockpit, multi-hop MuleVision graph, suspicious wallet quarantine, coastal float dispatch, policy tuning & BFIU regulatory compliance.', 'ন্যাশনাল রিস্ক ককপিট, মাল্টি-হপ MuleVision গ্রাফ, সন্দেহজনক ওয়ালেট স্থগিত, জরুরি নগদ সরবরাহ, নীতিমালা সমন্বয় এবং BFIU নিয়ন্ত্রক পরিপালনের অনুমতি রয়েছে।')}
                </span>
              ) : (
                <span>
                  <strong>{t('Scoped Customer Access:', 'সীমিত গ্রাহক প্রবেশাধিকার:')}</strong> {t('Authorized for personal Upay customer wallet, Send Money with ScamShield protection & linked accounts. Administrative surveillance and network freezing are restricted.', 'ব্যক্তিগত Upay ওয়ালেট, ScamShield সুরক্ষাসহ টাকা পাঠানো এবং সংযুক্ত অ্যাকাউন্ট ব্যবহারের অনুমতি রয়েছে। প্রশাসনিক নজরদারি ও নেটওয়ার্ক স্থগিত করার সুবিধা নেই।')}
                </span>
              )}
            </p>

            {/* Privilege Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/80 text-[11px]">
              {selectedRole === 'ADMIN' ? (
                <>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>{t('Operator Cockpit & Live Ticker', 'অপারেটর ককপিট ও লাইভ টিকার')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>{t('Quarantine & Freeze Wallets', 'ওয়ালেট কোয়ারেন্টাইন ও স্থগিত')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>{t('Dispatch Emergency Agent Floats', 'জরুরি এজেন্ট নগদ পাঠানো')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>{t('Tune ML Policy Weights', 'এমএল নীতিমালার ওজন সমন্বয়')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>{t('Export BFIU Audit Logs (CSV)', 'BFIU নিরীক্ষা লগ রপ্তানি (CSV)')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0054A6] shrink-0" />
                    <span>{t('AI Dossier Case Investigations', 'এআই ডসিয়ার কেস তদন্ত')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{t('Personal Wallet & Balances', 'ব্যক্তিগত ওয়ালেট ও ব্যালেন্স')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{t('Send Money & ScamShield', 'টাকা পাঠানো ও ScamShield')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">{t('Operator Surveillance', 'অপারেটর নজরদারি')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">{t('Quarantine Wallets', 'ওয়ালেট কোয়ারেন্টাইন')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">{t('Dispatch Cash Floats', 'নগদ সরবরাহ পাঠানো')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-through">{t('Policy Tuning & Audit Export', 'নীতিমালা সমন্বয় ও নিরীক্ষা রপ্তানি')}</span>
                  </div>
                </>
              )}
            </div>
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
              {t('Bangladesh mobile number', 'বাংলাদেশি মোবাইল নম্বর')} <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-700">+880</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/[^\d+\s()-]/g, '').slice(0, 18))}
                placeholder={t('01XXXXXXXXX', '০১XXXXXXXXX')}
                autoComplete="tel-national"
                required
                className="login-input w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent transition-all"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">{t('Use a demo profile number below or register for an account.', 'নিচের ডেমো প্রোফাইলের নম্বর ব্যবহার করুন অথবা নতুন অ্যাকাউন্ট খুলুন।')}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('6-digit PIN', '৬ সংখ্যার পিন')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('Enter your 6-digit PIN', 'আপনার ৬ সংখ্যার পিন লিখুন')}
                autoComplete="current-password"
                required
                className="login-input w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? t('Hide PIN', 'পিন লুকান') : t('Show PIN', 'পিন দেখান')}
                aria-pressed={showPin}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">{t('Demo PIN: 123456. This preview does not check real account credentials.', 'ডেমো পিন: ১২৩৪৫৬। এই প্রিভিউ প্রকৃত অ্যাকাউন্টের তথ্য যাচাই করে না।')}</p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="rounded border-slate-300 text-[#0054A6] focus:ring-[#0054A6]"
              />
              <span className="text-[11px]">{t('Remember me', 'আমাকে মনে রাখুন')}</span>
            </label>
            <button
              type="button"
              onClick={() => setErrorMsg(t('PIN recovery is unavailable in this demo. Please use the demo credentials or register.', 'এই ডেমোতে পিন পুনরুদ্ধার করা যায় না। ডেমো তথ্য ব্যবহার করুন অথবা নিবন্ধন করুন।'))}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {t('Forgot PIN?', 'পিন ভুলে গেছেন?')}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-normal pt-1">
            {t('By signing in, I agree to the', 'লগইন করার মাধ্যমে আমি সম্মত হচ্ছি')} {' '}
            <button type="button" onClick={() => onOpenInfo?.('TERMS')} className="text-slate-700 underline font-medium cursor-pointer">{t('Terms of Service', 'সেবার শর্তাবলি')}</button> {t('and', 'এবং')} {' '}
            <button type="button" onClick={() => onOpenInfo?.('PRIVACY_POLICY')} className="text-slate-700 underline font-medium cursor-pointer">{t('Privacy Policy', 'গোপনীয়তা নীতি')}</button>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`login-submit w-full py-3 px-4 text-white font-bold rounded-full text-xs shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
              selectedRole === 'ADMIN'
                ? 'bg-[#0054A6] hover:bg-[#004080]'
                : 'bg-[#0879C9] hover:bg-[#0054A6]'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('Sign in as', 'লগইন করুন')} {selectedRole === 'ADMIN' ? t('Admin', 'অ্যাডমিন') : t('User', 'ব্যবহারকারী')}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-600">
          {t('New to টাকা Safe?', 'টাকা Safe-এ নতুন?')} {' '}
          <button type="button" onClick={onRegister} className="font-bold text-[#0054A6] hover:underline underline-offset-2">
            {t('Create an account', 'অ্যাকাউন্ট তৈরি করুন')}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="mb-3 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              {t('Quick demo sign-in', 'দ্রুত ডেমো লগইন')}
            </span>
            <span className="mt-1 block text-[10px] text-slate-500">
              {t('Select an account to sign in directly. Demo PIN: 123456.', 'সরাসরি লগইন করতে একটি অ্যাকাউন্ট বেছে নিন। ডেমো পিন: ১২৩৪৫৬।')}
            </span>
          </div>
          <div className="space-y-3">
            {(['ADMIN', 'USER'] as UserRole[]).map((role) => (
              <section key={role} className={`demo-account-group demo-account-${role.toLowerCase()}`}>
                <div className="demo-account-heading">
                  {role === 'ADMIN' ? <ShieldCheck size={14} /> : <User size={14} />}
                  <strong>{role === 'ADMIN' ? t('Admin demo accounts', 'অ্যাডমিন ডেমো অ্যাকাউন্ট') : t('Customer demo accounts', 'গ্রাহক ডেমো অ্যাকাউন্ট')}</strong>
                  <span>{quickLoginProfiles.filter((profile) => profile.role === role).length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickLoginProfiles.filter((profile) => profile.role === role).map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleQuickLogin(profile)}
                      className="login-profile w-full text-[11px] font-bold text-slate-800 border px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      {role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      <span>{profile.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
