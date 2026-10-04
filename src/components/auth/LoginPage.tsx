import React, { useState } from 'react';
import { AuthUser, UserRole } from '../../types';
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
  onLogin: (user: AuthUser) => void;
  onCancel: () => void;
  lang: 'EN' | 'BN';
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

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCancel, lang }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(DEMO_ACCOUNTS.ADMIN.id);
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS.ADMIN.email);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switch role selection and autofill matching demo credentials
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const profile = DEMO_PROFILES.find((candidate) => candidate.role === role)!;
    setSelectedProfileId(profile.id);
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
      const user = DEMO_PROFILES.find((profile) => profile.id === selectedProfileId && profile.role === selectedRole && profile.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        setErrorMsg('Choose a demo profile that matches the selected role and email.');
        return;
      }
      onLogin(user);
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(DEMO_PROFILES.find((profile) => profile.id === selectedProfileId)!);
    }, 450);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative animate-slide-up card-hover-lift">
        {/* Top Back Navigation */}
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

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
            Access your TakaSafe dashboard, fraud surveillance controls, and wallet security.
          </p>
        </div>

        {/* Two Options: Admin vs User Role Selector */}
        <div className="mb-6 space-y-3">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Select Access Role
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
            {/* Admin Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-900/10'
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
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'USER'
                  ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-900/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className={`w-4 h-4 ${selectedRole === 'USER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>User</span>
            </button>
          </div>

          {/* Dynamic Active Role Privileges Panel */}
          <div className={`p-3.5 rounded-2xl border text-xs transition-all ${
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
          <span>Continue with Google</span>
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
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
                  const nextEmail = e.target.value;
                  setEmail(nextEmail);
                  const matchingProfile = DEMO_PROFILES.find((profile) => profile.email.toLowerCase() === nextEmail.trim().toLowerCase());
                  if (matchingProfile) {
                    setSelectedRole(matchingProfile.role);
                    setSelectedProfileId(matchingProfile.id);
                  }
                }}
                placeholder="Enter Your Email"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164E3D] focus:border-transparent transition-all"
              />
            </div>
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
                className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164E3D] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                defaultChecked
                className="rounded border-slate-300 text-[#164E3D] focus:ring-[#164E3D]"
              />
              <span className="text-[11px]">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setErrorMsg('Password reset link sent to registered email.')}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-normal pt-1">
            By signing in, I agree to the{' '}
            <span className="text-slate-700 underline font-medium cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-slate-700 underline font-medium cursor-pointer">Privacy Policy</span>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 text-white font-bold rounded-full text-xs shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
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
            {DEMO_PROFILES.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => onLogin(profile)}
                className={`w-full text-[11px] font-bold text-slate-800 ${profile.role === 'ADMIN' ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'} border px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs`}
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
  );
};
