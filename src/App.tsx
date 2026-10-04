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
import { LoginPage, DEMO_ACCOUNTS } from './components/auth/LoginPage';
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
import { Transaction, MuleCluster, AgentLiquidityNode, RegionalRiskMetric, StorylineStep, AuthUser } from './types';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'OPERATOR' | 'CUSTOMER' | 'STORYLINE' | 'LOGIN'>('OPERATOR');
  const [operatorTab, setOperatorTab] = useState<string>('OVERVIEW');
  const [lang, setLang] = useState<'EN' | 'BN'>('EN');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'USR-ADM-01',
    name: 'Md. Tanvir Hasan',
    email: 'tanvir.hasan@takasafe.upay.bd',
    phone: '+880 1712-401920',
    role: 'ADMIN',
    designation: 'Chief Risk Analyst & AML Supervisor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    permissions: {
      canViewOperatorDashboard: true,
      canFreezeWallets: true,
      canDispatchLiquidity: true,
      canTunePolicyWeights: true,
      canExportAuditLogs: true,
      canPerformInvestigationActions: true,
    },
  });

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
  const [selectedTxnForInvestigation, setSelectedTxnForInvestigation] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const recordCustomerLogin = (user: AuthUser) => {
    if (user.role !== 'USER') return;
    const timestamp = new Date().toISOString();
    const storageKey = `takasafe-logins:${user.id}:${user.phone}`;
    try {
      const prior = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const logins = [...(Array.isArray(prior) ? prior : []), { timestamp }].slice(-200);
      localStorage.setItem(storageKey, JSON.stringify(logins));
    } catch {
      // Server logging below remains available if browser storage is unavailable.
    }
    fetch(`/api/customer-logins/${encodeURIComponent(user.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: user.phone, timestamp }),
    }).catch(() => undefined);
  };
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Fetch initial audit logs from server if available (e.g. local/Express dev), else fallback cleanly
  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => {
        if (!res.ok) throw new Error('Static host');
        return res.json();
      })
      .then((data) => {
        if (data && data.logs && data.logs.length > 0) setAuditLogs(data.logs);
      })
      .catch(() => {
        // Safe fallback for static deployments like GitHub Pages
      });
  }, []);

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

  const criticalCount = transactions.filter((t) => t.riskBand === 'CRITICAL' || t.riskBand === 'HIGH').length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-100 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Route & Page Change Transition Glow Bar */}
      {isTransitioning && (
        <div key={`${activeView}-${operatorTab}`} className="page-progress-bar" />
      )}

      {/* Upay Header with Logo, Navigation, Mode Switcher & Accreditation */}
      <UpayHeader
        activeView={activeView}
        setActiveView={setActiveView}
        operatorTab={operatorTab}
        setOperatorTab={setOperatorTab}
        lang={lang}
        setLang={setLang}
        criticalAlertCount={criticalCount}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Signed out of TakaSafe.');
        }}
        onSwitchUserRole={(newRole) => {
          const user = DEMO_ACCOUNTS[newRole];
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
            if (svc === 'Send Money') {
              setActiveView('CUSTOMER');
            } else {
              if (currentUser?.role === 'USER') {
                setActiveView('OPERATOR'); // Will trigger AccessRestrictedGate
              } else {
                setActiveView('OPERATOR');
              }
            }
          }}
          onOpenModal={(modal) => setActiveModal(modal)}
          lang={lang}
        />
      )}

      {/* Main Interactive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0 overflow-x-hidden">
        <div key={activeView} className="page-enter">
          {activeView === 'LOGIN' && (
            <LoginPage
              onLogin={(user) => {
                setCurrentUser(user);
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
                  setActiveView('OPERATOR');
                }
              }}
              lang={lang}
            />
          )}

          {activeView === 'OPERATOR' && (
            currentUser?.role === 'USER' ? (
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
                onOpenInvestigation={(txn) => setSelectedTxnForInvestigation(txn)}
                onFreezeWallet={handleFreezeWallet}
                onDispatchLiquidity={handleDispatchLiquidity}
                onActivateMonitoring={handleActivateMonitoring}
                auditLogs={auditLogs}
                initialTab={operatorTab}
                onTabChange={(tab) => setOperatorTab(tab)}
                lang={lang}
              />
            )
          )}

          {activeView === 'CUSTOMER' && (
            <CustomerAppView
              customer={DEMO_CUSTOMER_PROFILES[currentUser?.id || ''] || CURRENT_CUSTOMER}
              userId={currentUser?.id || CURRENT_CUSTOMER.wallet}
              onSimulateRiskyPayment={() => {
                // Ensure critical transaction is visible in operator queue
              }}
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
        />
      )}

      {/* Upay Info & Feature Modals */}
      <UpayInfoModal
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        lang={lang}
        onNavigateView={(v) => {
          setActiveView(v);
          setActiveModal(null);
        }}
      />

      {/* Upay Official Footer (Matching user wireframe photo 5) */}
      <UpayFooter
        onOpenModal={(modal) => setActiveModal(modal)}
        onNavigateHome={() => {
          setActiveView('OPERATOR');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
