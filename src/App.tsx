/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UpayHeader } from './components/common/UpayHeader';
import { UpayHeroServices } from './components/common/UpayHeroServices';
import { UpayFooter } from './components/common/UpayFooter';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { CustomerAppView } from './components/customer/CustomerAppView';
import { StorylineRunner } from './components/storyline/StorylineRunner';
import { InvestigationModal } from './components/investigation/InvestigationModal';
import { UpayInfoModal } from './components/common/UpayInfoModal';
import { LoginPage, DEMO_ACCOUNTS, DEMO_PROFILES } from './components/auth/LoginPage';
import { AccessRestrictedGate } from './components/common/AccessRestrictedGate';
import {
  MOCK_TRANSACTIONS,
  CURRENT_CUSTOMER,
  DEMO_CUSTOMER_PROFILES,
  MULE_NETWORK_17,
  MOCK_AGENTS_BARISHAL,
  REGIONAL_RADAR_METRICS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { Transaction, MuleCluster, AgentLiquidityNode, RegionalRiskMetric, StorylineStep, AuthUser, CustomerBaseline } from './types';
import { ShieldCheck, Info, Wifi, WifiOff, RefreshCw, RotateCw } from 'lucide-react';
import { useRealtimeSync } from './hooks/useRealtimeSync';

// Bump the key so the old prototype's automatically seeded admin session is
// discarded after upgrade. New sessions are saved only after explicit sign-in.
const APP_SESSION_KEY = 'takasafe-app-session-v2';
type AppView = 'OPERATOR' | 'CUSTOMER' | 'STORYLINE' | 'LOGIN';

const getCustomerProfile = (user: AuthUser | null): CustomerBaseline => {
  if (!user) return CURRENT_CUSTOMER;
  const existingCustomerProfile = DEMO_CUSTOMER_PROFILES[user.id];
  if (existingCustomerProfile) return existingCustomerProfile;

  // Admin demo accounts can also open Send Money. Give each account its own
  // identity and data namespace instead of showing Rafiqul's customer record.
  return {
    ...CURRENT_CUSTOMER,
    wallet: user.phone,
    name: user.name,
    nationalIdMasked: 'Not provided',
    balance: 100000,
    avgDailyTxns: 2,
    avgAmount: 2500,
    maxAmountTypical: 10000,
    usualHours: '09:00 - 21:00',
    homeDistrict: 'Not provided',
    knownDevices: ['Current device'],
    frequentRecipients: [],
    financialResilienceScore: 70,
    resilienceComponents: {
      incomeStability: 70,
      spendingDiscipline: 70,
      emergencyBufferDays: 30,
      cashOutDependency: 40,
    },
  };
};

export default function App() {
  const [initialSession] = useState(() => {
    try {
      const rememberedSession = localStorage.getItem(APP_SESSION_KEY);
      const rawSession = rememberedSession || sessionStorage.getItem(APP_SESSION_KEY);
      if (!rawSession) return null;
      const saved = JSON.parse(rawSession) as { userId?: string | null; activeView?: AppView };
      const user = DEMO_PROFILES.find((profile) => profile.id === saved.userId) || null;
      const validViews: AppView[] = ['OPERATOR', 'CUSTOMER', 'STORYLINE', 'LOGIN'];
      const view = user?.role === 'USER'
        ? 'CUSTOMER'
        : user
          ? (validViews.includes(saved.activeView as AppView) ? saved.activeView! : 'OPERATOR')
          : 'OPERATOR';
      return { user, view, remember: Boolean(rememberedSession) };
    } catch {
      return null;
    }
  });
  const [activeView, setActiveView] = useState<AppView>(initialSession?.view || 'OPERATOR');
  const [operatorTab, setOperatorTab] = useState<string>('OVERVIEW');
  const [lang, setLang] = useState<'EN' | 'BN'>('EN');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    initialSession ? initialSession.user : null
  );
  const [rememberSession, setRememberSession] = useState(() => initialSession?.remember ?? true);

  useEffect(() => {
    try {
      if (!currentUser) {
        localStorage.removeItem(APP_SESSION_KEY);
        sessionStorage.removeItem(APP_SESSION_KEY);
        return;
      }
      const serializedSession = JSON.stringify({
        userId: currentUser?.id || null,
        activeView: currentUser?.role === 'USER' ? 'CUSTOMER' : activeView,
      });
      if (rememberSession) {
        localStorage.setItem(APP_SESSION_KEY, serializedSession);
        sessionStorage.removeItem(APP_SESSION_KEY);
      } else {
        sessionStorage.setItem(APP_SESSION_KEY, serializedSession);
        localStorage.removeItem(APP_SESSION_KEY);
      }
    } catch {
      // Keep the in-memory session active if browser storage is unavailable.
    }
  }, [activeView, currentUser, rememberSession]);

  // Dark/Light Theme state with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('takasafe_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('takasafe_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Visual feedback progress streak on page / tab transitions
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 450);
    return () => clearTimeout(timer);
  }, [activeView, operatorTab]);

  // Application Data States
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [muleCluster, setMuleCluster] = useState<MuleCluster>(MULE_NETWORK_17);
  const [agents, setAgents] = useState<AgentLiquidityNode[]>(MOCK_AGENTS_BARISHAL);
  const [regionalMetrics, setRegionalMetrics] = useState<RegionalRiskMetric[]>(REGIONAL_RADAR_METRICS);
  const [auditLogs, setAuditLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);
  const realtime = useRealtimeSync((snapshot) => {
    setTransactions(snapshot.transactions);
    setAuditLogs(snapshot.auditLogs);
  });
  const [selectedTxnForInvestigation, setSelectedTxnForInvestigation] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [requestedWalletService, setRequestedWalletService] = useState<string | null>(null);

  const recordCustomerLogin = (user: AuthUser) => {
    if (user.role !== 'USER') return;
    const timestamp = new Date().toISOString();
    const storageKey = `takasafe-logins:${user.id}:${user.phone}`;
    try {
      const prior = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const logins = [...(Array.isArray(prior) ? prior : []), { timestamp, device: navigator.userAgent }].slice(-200);
      localStorage.setItem(storageKey, JSON.stringify(logins));
    } catch {
      // Server logging below remains available if browser storage is unavailable.
    }
    fetch(`/api/customer-logins/${encodeURIComponent(user.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: user.phone, timestamp, device: navigator.userAgent }),
    }).catch(() => undefined);
  };
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Action: Freeze Wallet
  const handleFreezeWallet = async (walletId: string, label: string) => {
    setMuleCluster((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === walletId ? { ...n, status: 'FROZEN' as const } : n)),
    }));

    try {
      const res = await fetch('/api/audit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst: currentUser?.name ? `${currentUser.name} (${currentUser.designation})` : 'Md. Tanvir Hasan (Chief Risk Analyst)',
          caseId: 'CASE-NET-17',
          entityType: 'NETWORK',
          entityId: walletId,
          actionTaken: 'FREEZE_WALLET',
          riskScore: 92,
          reason: `Quarantined ${label} connected to Suspicious Network #17`,
          notes: `Freezing enforced on aggregator node ${walletId}. Outbound settlement suspended.`,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setAuditLogs((prev) => [data.entry, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }

    showToast(`Quarantined and froze wallet ${walletId} in Network #17.`);
  };

  // Action: Dispatch Liquidity to Agent
  const handleDispatchLiquidity = async (agentId: string, agentName: string, amount: number) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              currentCashFloat: a.currentCashFloat + amount,
              shortfallAmount: 0,
              riskStatus: 'ADEQUATE' as const,
            }
          : a
      )
    );

    try {
      const res = await fetch('/api/audit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst: 'Md. Tanvir Hasan (SOC Ops)',
          caseId: 'CASE-BAR-DISASTER',
          entityType: 'AGENT',
          entityId: agentId,
          actionTaken: 'DISPATCH_FLOAT',
          riskScore: 78,
          reason: `Emergency float replenishment for ${agentName}`,
          notes: `Dispatched BDT ${amount.toLocaleString()} physical cash float via UCB Taqwa regional distributor.`,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setAuditLogs((prev) => [data.entry, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }

    showToast(`Dispatched BDT ${amount.toLocaleString()} liquidity float to ${agentName}.`);
  };

  // Action: Activate Monitoring
  const handleActivateMonitoring = async (division: string) => {
    setRegionalMetrics((prev) =>
      prev.map((m) => (m.division === division ? { ...m, status: 'EMERGING_RISK' as const } : m))
    );

    try {
      const res = await fetch('/api/audit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst: 'Md. Sadman Al Islam Shabab (Model Architecture Lead)',
          caseId: `RADAR-${division.toUpperCase()}`,
          entityType: 'REGION',
          entityId: division,
          actionTaken: 'ACTIVATE_MONITORING',
          riskScore: 87,
          reason: `Elevated Early-Warning Risk Score in ${division}`,
          notes: `Activated Level-3 proactive surveillance. Threshold for ScamShield lowered.`,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setAuditLogs((prev) => [data.entry, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }

    showToast(`Activated Level-3 proactive monitoring for ${division} division.`);
  };

  // Storyline navigation helper
  const handleNavigateFromStoryline = (module: StorylineStep['moduleHighlight']) => {
    if (module === 'SCAMSHIELD') {
      setActiveView('CUSTOMER');
    } else if (module === 'INVESTIGATION') {
      setActiveView('OPERATOR');
      setOperatorTab('OVERVIEW');
      setSelectedTxnForInvestigation(transactions[0]);
    } else {
      setActiveView('OPERATOR');
      if (module === 'MULEVISION') setOperatorTab('MULEVISION');
      else if (module === 'RESILIENCE') setOperatorTab('RESILIENCE');
      else if (module === 'RADAR') setOperatorTab('RADAR');
      else setOperatorTab('OVERVIEW');
    }
  };

  // Handle Action taken from Investigation Modal
  const handleTakeInvestigationAction = async (
    action: 'MONITOR' | 'ADDITIONAL_VERIFICATION' | 'HOLD_FOR_REVIEW' | 'FREEZE_WALLET',
    notes: string
  ) => {
    if (!selectedTxnForInvestigation) return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === selectedTxnForInvestigation.id
          ? {
              ...t,
              status:
                action === 'FREEZE_WALLET'
                  ? 'BLOCKED'
                  : action === 'HOLD_FOR_REVIEW'
                  ? 'HELD'
                  : 'APPROVED',
            }
          : t
      )
    );

    try {
      const res = await fetch('/api/audit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst: currentUser?.name ? `${currentUser.name} (${currentUser.designation})` : 'Md. Tanvir Hasan (Chief Risk Analyst)',
          caseId: `CASE-${selectedTxnForInvestigation.id}`,
          entityType: 'TRANSACTION',
          entityId: selectedTxnForInvestigation.id,
          actionTaken: action,
          riskScore: selectedTxnForInvestigation.fusedRiskScore,
          reason: `Decision taken on ${selectedTxnForInvestigation.id}`,
          notes,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setAuditLogs((prev) => [data.entry, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }

    showToast(`Action recorded: ${action.replace(/_/g, ' ')} for Case #${selectedTxnForInvestigation.id}`);
  };

  const handleLabelAlert = async (
    outcome: 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'NEEDS_REVIEW',
    notes: string
  ): Promise<boolean> => {
    if (!selectedTxnForInvestigation) return false;
    try {
      const response = await fetch('/api/alert-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: `CASE-${selectedTxnForInvestigation.id}`,
          transactionId: selectedTxnForInvestigation.id,
          analyst: currentUser?.name || 'Demo Analyst',
          outcome,
          riskScore: selectedTxnForInvestigation.fusedRiskScore,
          notes,
        }),
      });
      if (!response.ok) throw new Error('Could not save analyst feedback');
      window.dispatchEvent(new Event('takasafe-alert-feedback'));
      showToast(`Alert feedback saved: ${outcome.replace(/_/g, ' ')}.`);
      return true;
    } catch (error) {
      console.error(error);
      showToast('Could not save alert feedback.');
      return false;
    }
  };

  const criticalCount = transactions.filter((t) => t.riskBand === 'CRITICAL' || t.riskBand === 'HIGH').length;

  // Customer accounts should stay in the customer experience even when shared
  // navigation controls request the operator view.
  const navigateToView = (view: 'OPERATOR' | 'CUSTOMER' | 'STORYLINE' | 'LOGIN') => {
    if (!currentUser && view !== 'LOGIN' && view !== 'OPERATOR') {
      setActiveView('LOGIN');
      return;
    }
    if (view === 'OPERATOR' && currentUser?.role === 'USER') {
      setActiveView('CUSTOMER');
      return;
    }
    setActiveView(view);
  };

  const navigateToOperatorTab = (tab: string) => {
    if (!currentUser && tab !== 'OVERVIEW') {
      setActiveView('LOGIN');
      return;
    }
    setOperatorTab(tab);
  };

  const requireSignIn = (action: () => void) => {
    if (!currentUser) {
      setActiveView('LOGIN');
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-100 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Route & Page Change Transition Glow Bar */}
      {isTransitioning && (
        <div key={`${activeView}-${operatorTab}`} className="page-progress-bar" />
      )}

      <div className="flex items-center justify-end gap-2 px-3 py-1.5 text-[11px]" role="status" aria-live="polite">
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold ${
          realtime.status === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
          realtime.status === 'polling' ? 'border-blue-200 bg-blue-50 text-blue-800' :
          realtime.status === 'offline' ? 'border-rose-200 bg-rose-50 text-rose-800' :
          'border-amber-200 bg-amber-50 text-amber-900'
        }`}>
          {realtime.status === 'offline' ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
          {realtime.status === 'connected' ? 'Live connection' :
            realtime.status === 'polling' ? 'Live stream unavailable · polling server' :
            realtime.status === 'offline' ? 'Server unavailable · showing last data' :
            realtime.status === 'connecting' ? 'Connecting to server…' : 'Reconnecting to server…'}
        </span>
        {realtime.lastSyncedAt && <span className="hidden text-slate-500 sm:inline">Updated {new Date(realtime.lastSyncedAt).toLocaleTimeString()}</span>}
        <button type="button" onClick={() => void realtime.refreshFromServer()} disabled={realtime.isRefreshing} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw className={`h-3.5 w-3.5 ${realtime.isRefreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
        {realtime.status !== 'connected' && <button type="button" onClick={realtime.reconnect} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50">
          <RotateCw className="h-3.5 w-3.5" /> Reconnect
        </button>}
      </div>

      {/* Upay Header with Logo, Navigation, Mode Switcher & Accreditation */}
      <UpayHeader
        activeView={activeView}
        setActiveView={navigateToView}
        operatorTab={operatorTab}
        setOperatorTab={navigateToOperatorTab}
        lang={lang}
        setLang={setLang}
        criticalAlertCount={criticalCount}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem(APP_SESSION_KEY);
          sessionStorage.removeItem(APP_SESSION_KEY);
          setActiveView('OPERATOR');
          showToast('Signed out of TakaSafe.');
        }}
        onSwitchUserRole={(newRole) => {
          const user = DEMO_ACCOUNTS[newRole];
          if (!user) return;
          setCurrentUser(user);
          recordCustomerLogin(user);
          if (newRole === 'ADMIN') {
            setActiveView('OPERATOR');
            showToast(`Switched to Admin role (${user.name}). Wider privileges unlocked.`);
          } else {
            setActiveView('CUSTOMER');
            showToast(`Switched to User role (${user.name}). Standard customer access active.`);
          }
        }}
        onOpenModal={(modal) => setActiveModal(modal)}
      />

      {/* Upay Hero & Official Services Grid (Shown on primary app views, hidden on dedicated login page) */}
      {activeView !== 'LOGIN' && (
        <UpayHeroServices
          onServiceSelect={(svc) => {
            if (svc === 'Cash In' && currentUser?.role === 'USER') return;
            setRequestedWalletService(svc === 'Send Money' ? null : svc);
            navigateToView('CUSTOMER');
          }}
          onOpenModal={(modal) => setActiveModal(modal)}
          showCashIn={currentUser?.role !== 'USER'}
          lang={lang}
        />
      )}

      {/* Main Interactive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0 overflow-x-hidden">
        <div key={activeView} className="page-enter">
          {activeView === 'LOGIN' && (
            <LoginPage
              showBackButton={Boolean(currentUser)}
              onOpenInfo={(modal) => setActiveModal(modal)}
              onLogin={(user, remember) => {
                setCurrentUser(user);
                setRememberSession(remember);
                recordCustomerLogin(user);
                if (user.role === 'ADMIN') {
                  setActiveView('OPERATOR');
                  showToast(`Welcome back, ${user.name}! Signed in as Admin with Wider Privileges.`);
                } else {
                  setActiveView('CUSTOMER');
                  showToast(`Welcome back, ${user.name}! Signed in as User with Scoped Privileges.`);
                }
              }}
              onCancel={() => {
                if (currentUser) {
                  setActiveView(currentUser.role === 'ADMIN' ? 'OPERATOR' : 'CUSTOMER');
                } else {
                  setActiveView('LOGIN');
                }
              }}
              lang={lang}
            />
          )}

          {activeView === 'OPERATOR' && (
            !currentUser ? (
              <section className="max-w-5xl mx-auto py-8 sm:py-14">
                <div className="rounded-3xl bg-gradient-to-br from-[#004080] via-[#0054A6] to-slate-900 p-7 sm:p-12 text-white shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Digital finance, made safer</p>
                  <h1 className="mt-3 max-w-3xl text-3xl sm:text-5xl font-black leading-tight">A safer way to move and manage money</h1>
                  <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-blue-100">TakaSafe brings secure mobile financial services and intelligent fraud protection together, helping customers transact with confidence.</p>
                  <button onClick={() => setActiveView('LOGIN')} className="mt-7 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow hover:bg-amber-300">Sign in to get started</button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { title: 'Everyday payments', description: 'Send money, pay merchants, and manage your wallet from one place.' },
                    { title: 'Safer transactions', description: 'Built-in protections help identify suspicious activity and reduce scams.' },
                    { title: 'Service access', description: 'Explore customer services and account tools after signing in.' },
                  ].map((item) => (
                    <button key={item.title} onClick={() => setActiveView('LOGIN')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                      <h2 className="font-bold text-[#0054A6] dark:text-blue-300">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                      <span className="mt-4 inline-block text-xs font-bold text-amber-700 dark:text-amber-300">Sign in to use this feature →</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : currentUser.role === 'USER' ? (
              <AccessRestrictedGate
                currentUser={currentUser}
                onElevateToAdmin={() => {
                  setCurrentUser(DEMO_ACCOUNTS.ADMIN);
                  setActiveView('OPERATOR');
                  showToast('Elevated to Admin (Md. Tanvir Hasan). Wider privileges unlocked.');
                }}
                onGoToCustomerApp={() => setActiveView('CUSTOMER')}
                onSwitchAccount={() => setActiveView('LOGIN')}
                lang={lang}
              />
            ) : (
              <OperatorDashboard
                currentUser={currentUser}
                transactions={transactions}
                customerProfile={CURRENT_CUSTOMER}
                muleCluster={muleCluster}
                agents={agents}
                regionalMetrics={regionalMetrics}
                onOpenInvestigation={(txn) => requireSignIn(() => setSelectedTxnForInvestigation(txn))}
                onFreezeWallet={(walletId, label) => requireSignIn(() => { void handleFreezeWallet(walletId, label); })}
                onDispatchLiquidity={(agentId, agentName, amount) => requireSignIn(() => { void handleDispatchLiquidity(agentId, agentName, amount); })}
                onActivateMonitoring={(division) => requireSignIn(() => { void handleActivateMonitoring(division); })}
                auditLogs={auditLogs}
                initialTab={operatorTab}
                onTabChange={navigateToOperatorTab}
                lang={lang}
              />
            )
          )}

          {activeView === 'CUSTOMER' && (
            <CustomerAppView
              customer={getCustomerProfile(currentUser)}
              userId={currentUser?.id || 'guest'}
              onSimulateRiskyPayment={() => {
                // Ensure critical transaction is visible in operator queue
              }}
              initialService={requestedWalletService}
              allowCashIn={currentUser?.role !== 'USER'}
              onServiceDismiss={() => setRequestedWalletService(null)}
              lang={lang}
            />
          )}

          {activeView === 'STORYLINE' && (
            <StorylineRunner
              onNavigateToModule={handleNavigateFromStoryline}
              lang={lang}
            />
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Full Explainable AI SHAP Investigation Modal */}
      {selectedTxnForInvestigation && (
        <InvestigationModal
          currentUser={currentUser}
          transaction={selectedTxnForInvestigation}
          customerProfile={CURRENT_CUSTOMER}
          isOpen={!!selectedTxnForInvestigation}
          onClose={() => setSelectedTxnForInvestigation(null)}
          onTakeAction={handleTakeInvestigationAction}
          onLabelAlert={handleLabelAlert}
        />
      )}

      {/* Upay Info & Feature Modals */}
      <UpayInfoModal
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        lang={lang}
        onNavigateView={(v) => {
          navigateToView(v);
          setActiveModal(null);
        }}
      />

      {/* Upay Official Footer (Matching user wireframe photo 5) */}
      <UpayFooter
        onOpenModal={(modal) => setActiveModal(modal)}
        onNavigateHome={() => {
          navigateToView('OPERATOR');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
