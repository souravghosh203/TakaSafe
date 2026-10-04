import React, { useState, useEffect } from 'react';
import {
  Transaction,
  CustomerBaseline,
  MuleCluster,
  AgentLiquidityNode,
  RegionalRiskMetric,
  RiskBand,
  AuthUser,
} from '../../types';
import { MuleVisionGraph } from './MuleVisionGraph';
import { DisasterResilienceSimulator } from './DisasterResilienceSimulator';
import { EarlyWarningRadar } from './EarlyWarningRadar';
import { TransactionRiskTrendChart } from './TransactionRiskTrendChart';
import { GeospatialIntelligenceMap } from './GeospatialIntelligenceMap';
import { LiveWebSocketTicker } from './LiveWebSocketTicker';
import { ComplianceReportModal } from './ComplianceReportModal';
import { RiskDistributionDonutChart } from './RiskDistributionDonutChart';
import { PolicyWeightsActionEngine } from './PolicyWeightsActionEngine';
import {
  ShieldCheck,
  AlertTriangle,
  Network,
  CloudLightning,
  Radar,
  Globe,
  Sliders,
  FileCheck2,
  Search,
  ExternalLink,
  Lock,
  CheckCircle,
  Eye,
  Filter,
  ArrowUpRight,
  Download,
  Printer,
} from 'lucide-react';

interface OperatorDashboardProps {
  currentUser?: AuthUser | null;
  transactions: Transaction[];
  customerProfile: CustomerBaseline;
  muleCluster: MuleCluster;
  agents: AgentLiquidityNode[];
  regionalMetrics: RegionalRiskMetric[];
  onOpenInvestigation: (transaction: Transaction) => void;
  onFreezeWallet: (walletId: string, label: string) => void;
  onDispatchLiquidity: (agentId: string, agentName: string, amount: number) => void;
  onActivateMonitoring: (division: string) => void;
  auditLogs: any[];
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  lang: 'EN' | 'BN';
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  currentUser,
  transactions,
  customerProfile,
  muleCluster,
  agents,
  regionalMetrics,
  onOpenInvestigation,
  onFreezeWallet,
  onDispatchLiquidity,
  onActivateMonitoring,
  auditLogs,
  initialTab = 'OVERVIEW',
  onTabChange,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>(transactions);
  const [latestTickerTxn, setLatestTickerTxn] = useState<Transaction | null>(transactions[0] || null);
  const [isTickerFlashing, setIsTickerFlashing] = useState<boolean>(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Keep liveTransactions in sync with props
  useEffect(() => {
    setLiveTransactions((prev) => {
      const existingIds = new Set(transactions.map((t) => t.id));
      const simulatedOnly = prev.filter((p) => !existingIds.has(p.id));
      return [...simulatedOnly, ...transactions];
    });
    if (transactions.length > 0 && (!latestTickerTxn || transactions[0].id !== latestTickerTxn.id)) {
      setLatestTickerTxn(transactions[0]);
    }
  }, [transactions]);

  // Periodic simulated live stream stream event
  useEffect(() => {
    const streamInterval = setInterval(() => {
      // Cycle or simulate a live event occasionally to make the WebSocket feed feel authentic
      if (liveTransactions.length > 0) {
        const randomTxn = liveTransactions[Math.floor(Math.random() * Math.min(liveTransactions.length, 5))];
        setLatestTickerTxn(randomTxn);
      }
    }, 9000);
    return () => clearInterval(streamInterval);
  }, [liveTransactions]);

  // Flash ticker when high-risk transaction is intercepted
  const triggerTickerFlash = (txn: Transaction) => {
    setLatestTickerTxn(txn);
    if (txn.fusedRiskScore >= 75 || txn.riskBand === 'CRITICAL' || txn.riskBand === 'HIGH') {
      setIsTickerFlashing(true);
      setTimeout(() => setIsTickerFlashing(false), 4500);
    }
  };

  // Simulate incoming high-risk attack transaction
  const handleSimulateAttackSpike = () => {
    const attackTxn: Transaction = {
      id: `TXN-${Math.floor(92000 + Math.random() * 7000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      senderWallet: '01899-771122',
      senderName: 'Nocturnal Device Hijack',
      senderLocation: 'Chittagong Coastal (IP: 103.24.88.90)',
      senderDevice: 'Infinix Hot 30 (Unknown dev-8819)',
      receiverWallet: '01988-510294',
      receiverName: 'Md. Al-Amin (Mule W302)',
      receiverLocation: 'Patuakhali Coastal, Barishal',
      amount: 85000,
      fee: 120,
      channel: 'TakaSafe App',
      status: 'HELD',
      fusedRiskScore: 96,
      riskBand: 'CRITICAL',
      fraudProb: 0.95,
      anomalyProb: 0.97,
      networkRisk: 0.92,
      velocityRisk: 0.96,
      deviceRisk: 0.94,
      isMuleConnected: true,
      muleClusterId: 'Suspicious Network #17',
      shapFeatures: [
        {
          name: 'Rapid Circular Pass-Through',
          contribution: 36,
          direction: 'RISK_INCREASING',
          description: 'Funds routed into Mule Aggregator W302 within 2 minutes',
          actualValue: '2 min velocity',
          expectedValue: 'Normal Peer Velocity',
        },
        {
          name: 'Device Hardware Anomaly',
          contribution: 32,
          direction: 'RISK_INCREASING',
          description: 'New device fingerprint transacting at abnormal midnight hours',
          actualValue: 'Device #dev-9941',
          expectedValue: 'Known Device',
        },
      ],
    };

    setLiveTransactions((prev) => [attackTxn, ...prev]);
    triggerTickerFlash(attackTxn);
  };

  const [filterBand, setFilterBand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Tunable Policy Weights state (from Page 4 of the report)
  const [weights, setWeights] = useState({
    fraud: 0.30,
    anomaly: 0.20,
    device: 0.15,
    velocity: 0.15,
    network: 0.10,
    scam: 0.10,
  });

  const criticalCount = liveTransactions.filter((t) => t.riskBand === 'CRITICAL' || t.riskBand === 'HIGH').length;

  const filteredTxns = liveTransactions.filter((txn) => {
    if (filterBand !== 'ALL' && txn.riskBand !== filterBand) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        txn.id.toLowerCase().includes(q) ||
        txn.senderName.toLowerCase().includes(q) ||
        txn.senderWallet.includes(q) ||
        txn.receiverWallet.includes(q)
      );
    }
    return true;
  });

  const getRiskBadge = (band: RiskBand, score: number) => {
    switch (band) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const handleDownloadAuditCSV = () => {
    if (currentUser?.permissions && !currentUser.permissions.canExportAuditLogs) {
      alert('Access Restricted: You need Administrator Audit Export privileges to download BFIU compliance logs.');
      return;
    }
    if (!auditLogs || auditLogs.length === 0) return;

    const headers = [
      'Audit_ID',
      'Timestamp_BST',
      'Authorized_Risk_Analyst',
      'Case_ID',
      'Target_Entity_Type',
      'Target_Entity_ID',
      'Intervention_Action_Taken',
      'Fused_Risk_Score_0_100',
      'Justification_Reason',
      'Operational_Notes',
      'Regulatory_Filing_Compliance',
    ];

    const rows = auditLogs.map((log) => [
      `"${log.id || ''}"`,
      `"${log.timestamp || ''}"`,
      `"${(log.analyst || '').replace(/"/g, '""')}"`,
      `"${log.caseId || ''}"`,
      `"${log.entityType || ''}"`,
      `"${log.entityId || ''}"`,
      `"${log.actionTaken || ''}"`,
      `"${log.riskScore ?? ''}"`,
      `"${(log.reason || '').replace(/"/g, '""')}"`,
      `"${(log.notes || '').replace(/"/g, '""')}"`,
      `"COMPLIANT - Bangladesh Bank BFIU MFS Guidelines 2026"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `TakaSafe_Regulatory_Audit_Logs_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearchQuery) return true;
    const q = auditSearchQuery.toLowerCase();
    return (
      (log.id && log.id.toLowerCase().includes(q)) ||
      (log.analyst && log.analyst.toLowerCase().includes(q)) ||
      (log.entityId && log.entityId.toLowerCase().includes(q)) ||
      (log.caseId && log.caseId.toLowerCase().includes(q)) ||
      (log.actionTaken && log.actionTaken.toLowerCase().includes(q)) ||
      (log.notes && log.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div id="operator-workspace" className="space-y-6 scroll-mt-24">
      {/* Operator Authorization & Privilege Clearance Strip */}
      <div className="bg-white dark:bg-[#0F172A] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0054A6] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white">
                Authorized Session: {currentUser?.name || 'Md. Tanvir Hasan'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                {currentUser?.role || 'ADMIN'} · Wider Privileges Active
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                Clearance: Level 3 AML Officer
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized for National Fraud Surveillance, MuleVision Graph Quarantine, Emergency Float Dispatch & BFIU Regulatory Compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Full AML Privileges (6/6 Active)</span>
          </div>
        </div>
      </div>

      {/* Live Real-Time WebSocket Ticker Bar */}
      <LiveWebSocketTicker
        latestTransaction={latestTickerTxn}
        isFlashing={isTickerFlashing}
        onOpenInvestigation={onOpenInvestigation}
        onSimulateSpike={handleSimulateAttackSpike}
        onOpenComplianceReport={() => setIsComplianceModalOpen(true)}
        onDownloadCSV={handleDownloadAuditCSV}
        lang={lang}
      />

      {/* Top Level Metric Cockpit Bar with Staggered Slide Up Animation */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 stagger-grid">
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">National Risk Index</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">39.2</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/100</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
            Elevated (Barishal Surge)
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">High / Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">{criticalCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Active</span>
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mt-1">
            Requires Human Review
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Mule Ring</span>
            <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">12</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Wallets</span>
          </div>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold block mt-1">
            Network #17 (৳ 1.28M Flow)
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Agent Shortfall</span>
            <CloudLightning className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">5</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Depleted</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
            Coastal Cyclone Buffer
          </span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1 card-hover-lift text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audit Compliance</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{auditLogs.length}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Decisions</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
            100% Traceable Logs
          </span>
        </div>
      </div>

      {/* Main Tabbed Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'OVERVIEW', label: '1. Transaction Guardian', icon: ShieldCheck, badge: criticalCount },
          { id: 'MULEVISION', label: '2. MuleVision (Graph)', icon: Network },
          { id: 'RESILIENCE', label: '3. Disaster Resilience Mode', icon: CloudLightning },
          { id: 'RADAR', label: '4. Early-Warning Radar', icon: Radar },
          { id: 'GEOSPATIAL', label: '5. Geospatial Intelligence', icon: Globe },
          { id: 'POLICY', label: '6. Policy Weights & Action Engine', icon: Sliders },
          { id: 'AUDIT', label: '7. Audit Logs & Compliance', icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                onTabChange?.(tab.id);
              }}
              className={`flex items-center gap-2 py-3 px-4 font-bold text-xs rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#0F172A] text-[#0054A6] dark:text-blue-400 border-t-2 border-l border-r border-[#0054A6] dark:border-slate-700 border-t-[#0054A6] -mb-[1px] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs Content with SlideUp Page Enter Animation */}
      <div key={activeTab} className="page-enter">
        {/* Tab 1: Overview & Transaction Guardian */}
        {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Analytics Grid: Recharts Risk Trend Chart + Recharts Donut Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-slide-up stagger-1">
            <div className="lg:col-span-7 xl:col-span-8 card-hover-lift">
              <TransactionRiskTrendChart transactions={liveTransactions} lang={lang} />
            </div>
            <div className="lg:col-span-5 xl:col-span-4 card-hover-lift">
              <RiskDistributionDonutChart
                transactions={liveTransactions}
                activeFilter={filterBand}
                onSelectFilter={(band) => setFilterBand(band)}
                lang={lang}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-slide-up stagger-2">
            {/* Table Filters & Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transaction, customer, wallet..."
                    className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilterBand(b)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        filterBand === b
                          ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing {filteredTxns.length} monitored transactions
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Txn ID & Time</th>
                    <th className="py-3 px-4">Sender Profile</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4 text-right">Amount (BDT)</th>
                    <th className="py-3 px-4 text-center">Guardian Score</th>
                    <th className="py-3 px-4">Risk Band</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTxns.map((txn) => (
                    <tr
                      key={txn.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        txn.riskBand === 'CRITICAL' ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{txn.id}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{txn.timestamp}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{txn.senderName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{txn.senderWallet}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{txn.receiverName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{txn.receiverWallet}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                        ৳{txn.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-lg ${
                            txn.fusedRiskScore >= 80
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800'
                              : txn.fusedRiskScore >= 50
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {txn.fusedRiskScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(
                            txn.riskBand,
                            txn.fusedRiskScore
                          )}`}
                        >
                          {txn.riskBand}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            txn.status === 'HELD'
                              ? 'bg-amber-100 text-amber-800'
                              : txn.status === 'BLOCKED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenInvestigation(txn)}
                          className="inline-flex items-center gap-1.5 bg-[#0054A6] hover:bg-[#004284] text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>Investigate (SHAP)</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MuleVision Graph */}
      {activeTab === 'MULEVISION' && (
        <MuleVisionGraph cluster={muleCluster} onFreezeWallet={onFreezeWallet} />
      )}

      {/* Tab 3: Disaster Resilience Mode */}
      {activeTab === 'RESILIENCE' && (
        <DisasterResilienceSimulator agents={agents} onDispatchLiquidity={onDispatchLiquidity} />
      )}

      {/* Tab 4: Early-Warning Radar */}
      {activeTab === 'RADAR' && (
        <EarlyWarningRadar metrics={regionalMetrics} onActivateMonitoring={onActivateMonitoring} />
      )}

      {/* Tab 5: Geospatial Intelligence (D3 Geographic Heatmap) */}
      {activeTab === 'GEOSPATIAL' && (
        <GeospatialIntelligenceMap
          transactions={liveTransactions}
          regionalMetrics={regionalMetrics}
          agents={agents}
          onActivateMonitoring={onActivateMonitoring}
          onDispatchLiquidity={onDispatchLiquidity}
          onOpenInvestigation={onOpenInvestigation}
          lang={lang}
        />
      )}

      {/* Tab 6: Policy Weights & Action Engine Mapping */}
      {activeTab === 'POLICY' && (
        <PolicyWeightsActionEngine
          weights={weights}
          onWeightsChange={(newWeights) => setWeights(newWeights)}
          lang={lang}
        />
      )}

      {/* Tab 6: Audit Logs & Regulatory Reporting */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
          {/* Header Bar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/60">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Audit Logs & Regulatory Reporting
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  BFIU Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Full chronological ledger of operator decisions, overrides, freezes, and float dispatches for Bangladesh Bank regulatory reporting.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                {filteredAuditLogs.length} Records
              </span>

              {/* PDF Compliance Report Generator Button */}
              <button
                onClick={() => setIsComplianceModalOpen(true)}
                className="flex items-center gap-2 bg-[#0054A6] hover:bg-[#004080] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer border border-[#003875]"
                title="View and print official BFIU Regulatory Compliance PDF report"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Export Compliance PDF Report</span>
              </button>

              {downloadSuccess ? (
                <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Report Downloaded!</span>
                </div>
              ) : (
                <button
                  onClick={handleDownloadAuditCSV}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                  title="Download complete audit logs as CSV for regulatory submission"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Download Regulatory CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Filter logs by analyst, case ID, wallet, or action..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0054A6]"
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Format: Standard UTF-8 CSV with Bangladesh Bank BFIU compliance headers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Audit ID & Time</th>
                  <th className="py-3 px-4">Authorized Analyst</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Operator Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit log entries matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{log.id}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{log.timestamp}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {log.analyst}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{log.entityId}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{log.caseId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                            log.actionTaken === 'FREEZE_WALLET'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : log.actionTaken === 'DISPATCH_FLOAT'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {log.actionTaken.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {log.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Compliance PDF/Print Report Modal */}
      <ComplianceReportModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        auditLogs={auditLogs}
        onDownloadCSV={handleDownloadAuditCSV}
        lang={lang}
      />
    </div>
  );
};
