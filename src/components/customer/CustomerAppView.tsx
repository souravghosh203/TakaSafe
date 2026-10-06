import React, { useEffect, useState } from 'react';
import { CustomerBaseline, LinkedWallet } from '../../types';
import { MOCK_LINKED_WALLETS } from '../../data/mockData';
import { QRCodeScannerModal } from './QRCodeScannerModal';
import { TakaSafeSovereignCard } from './TakaSafeSovereignCard';
import { AI1PipelineVisualizer } from './ML1PipelineVisualizer';
import { AI1NotebookModal } from '../common/ML1NotebookModal';
import { AnalysisTimeline } from '../scamshield/AnalysisTimeline';
import { evaluateAI1AndDoubtCheck, AI1EvaluationResult } from '../../services/ai1ScoringEngine';
import {
  Send,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  PhoneCall,
  Lock,
  ChevronRight,
  Sparkles,
  QrCode,
  Building2,
  Users,
  ShoppingBag,
  Trash2,
  Plus,
  ExternalLink,
  Shield,
  Zap,
  X,
  FileCode2,
  Brain,
} from 'lucide-react';

interface CustomerAppViewProps {
  customer: CustomerBaseline;
  userId: string;
  onSimulateRiskyPayment: () => void;
  initialService?: string | null;
  allowCashIn?: boolean;
  onServiceDismiss?: () => void;
  lang: 'EN' | 'BN';
}

interface CustomerTransfer {
  amount: number;
  recipient: string;
  timestamp: string;
  reference?: string;
  status?: 'COMPLETED' | 'PROCEEDED';
  riskScore?: number;
  serviceType?: string;
  direction?: 'IN' | 'OUT';
  fee?: number;
}

interface CustomerLogin {
  timestamp: string;
  device?: string;
}

const WALLET_SERVICES: Record<string, {
  title: string;
  type: string;
  direction: 'IN' | 'OUT';
  targetLabel: string;
  targets: string[];
  feeRate: number;
}> = {
  'Cash In': { title: 'Cash In', type: 'CASH_IN', direction: 'IN', targetLabel: 'Deposit method', targets: ['Agent Deposit', 'Bank Transfer'], feeRate: 0 },
  'Cash Out': { title: 'Cash Out', type: 'CASH_OUT', direction: 'OUT', targetLabel: 'Withdrawal method', targets: ['Agent Cash Out', 'ATM Cash Out'], feeRate: 0.014 },
  'Make Payment': { title: 'Make Payment', type: 'MAKE_PAYMENT', direction: 'OUT', targetLabel: 'Merchant', targets: [], feeRate: 0 },
  'Add Money': { title: 'Add Money', type: 'ADD_MONEY', direction: 'IN', targetLabel: 'Funding source', targets: ['Linked Bank Account', 'Debit Card'], feeRate: 0 },
  'Pay Bill': { title: 'Pay Bill', type: 'PAY_BILL', direction: 'OUT', targetLabel: 'Biller', targets: ['DESCO', 'WASA', 'Titas Gas', 'DPDC', 'NESCO'], feeRate: 0 },
  'Mobile Recharge': { title: 'Mobile Recharge', type: 'MOBILE_RECHARGE', direction: 'OUT', targetLabel: 'Mobile operator', targets: ['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk'], feeRate: 0 },
  Remittance: { title: 'Remittance', type: 'REMITTANCE', direction: 'IN', targetLabel: 'Remittance provider', targets: ['Bank Remittance', 'International Remittance'], feeRate: 0 },
  Savings: { title: 'Micro-Savings', type: 'SAVINGS', direction: 'OUT', targetLabel: 'Savings plan', targets: ['TakaSafe Savings Pocket', 'Monthly Savings Plan'], feeRate: 0 },
  Education: { title: 'Education Fee', type: 'EDUCATION', direction: 'OUT', targetLabel: 'Institution', targets: ['University Tuition', 'School Fees', 'College Fees'], feeRate: 0 },
  Insurance: { title: 'Insurance / Takaful', type: 'INSURANCE', direction: 'OUT', targetLabel: 'Plan', targets: ['Health Takaful', 'Family Takaful'], feeRate: 0 },
  Business: { title: 'Business Payment', type: 'BUSINESS_PAYMENT', direction: 'OUT', targetLabel: 'Business or merchant', targets: ['Supplier Payment', 'Merchant Settlement', 'Business Invoice'], feeRate: 0 },
};

const getServiceFee = (service: string, target: string, amount: number): number => {
  if (service === 'Cash Out' && target === 'ATM Cash Out') return 0;
  return Math.round(amount * (WALLET_SERVICES[service]?.feeRate || 0));
};

const loadTransferHistory = (userId: string, wallet: string): CustomerTransfer[] => {
  try {
    const saved = window.localStorage.getItem(`takasafe-transfers:${userId}:${wallet}`)
      || window.localStorage.getItem(`takasafe-transfers:${wallet}`);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is CustomerTransfer =>
      typeof item?.amount === 'number' && typeof item?.recipient === 'string' && typeof item?.timestamp === 'string'
    ) : [];
  } catch {
    return [];
  }
};

const loadLoginHistory = (userId: string, wallet: string): CustomerLogin[] => {
  try {
    const saved = window.localStorage.getItem(`takasafe-logins:${userId}:${wallet}`);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is CustomerLogin => typeof item?.timestamp === 'string') : [];
  } catch {
    return [];
  }
};

export const CustomerAppView: React.FC<CustomerAppViewProps> = ({
  customer,
  userId,
  onSimulateRiskyPayment,
  initialService = null,
  allowCashIn = true,
  onServiceDismiss,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'WALLET' | 'RESILIENCE'>('WALLET');
  const [recipient, setRecipient] = useState<string>(customer.frequentRecipients[0]?.split(' ')[0] || '');
  const [amount, setAmount] = useState<string>(String(Math.round(customer.avgAmount)));
  const [note, setNote] = useState<string>('');
  const [showScamModal, setShowScamModal] = useState<boolean>(false);
  const [scamDecision, setScamDecision] = useState<string | null>(null);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState<boolean>(false);
  const [currentAI1Evaluation, setCurrentAI1Evaluation] = useState<AI1EvaluationResult | null>(null);
  const [normalSuccess, setNormalSuccess] = useState<boolean>(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [riskReasons, setRiskReasons] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [isScoring, setIsScoring] = useState<boolean>(false);
  const [pipelineStage, setPipelineStage] = useState<number>(1);
  const [pipelineProgress, setPipelineProgress] = useState<number>(20);
  const [pipelineStatus, setPipelineStatus] = useState<string>('');
  const [activeWalletService, setActiveWalletService] = useState<string | null>(null);
  const [serviceTarget, setServiceTarget] = useState<string>('');
  const [serviceAmount, setServiceAmount] = useState<string>('');
  const [serviceNote, setServiceNote] = useState<string>('');
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceReceipt, setServiceReceipt] = useState<string | null>(null);
  const [isServiceReview, setIsServiceReview] = useState<boolean>(false);
  const balanceStorageKey = `takasafe-balance:${userId}:${customer.wallet}`;
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    try {
      const savedBalance = Number(window.localStorage.getItem(balanceStorageKey));
      return window.localStorage.getItem(balanceStorageKey) !== null && Number.isFinite(savedBalance) && savedBalance >= 0
        ? savedBalance
        : customer.balance;
    } catch {
      return customer.balance;
    }
  });
  const [transferHistory, setTransferHistory] = useState<CustomerTransfer[]>(() => loadTransferHistory(userId, customer.wallet));
  const [loginHistory, setLoginHistory] = useState<CustomerLogin[]>(() => loadLoginHistory(userId, customer.wallet));

  useEffect(() => {
    if (!initialService || !WALLET_SERVICES[initialService]) return;
    if (initialService === 'Cash In' && !allowCashIn) {
      onServiceDismiss?.();
      return;
    }
    setActiveWalletService(initialService);
    setServiceTarget(WALLET_SERVICES[initialService].targets[0] || '');
    setServiceAmount('');
    setServiceNote('');
    setServiceError(null);
    setServiceReceipt(null);
    setIsServiceReview(false);
  }, [initialService, allowCashIn, onServiceDismiss]);

  useEffect(() => {
    let active = true;
    const localLogins = loadLoginHistory(userId, customer.wallet);
    fetch(`/api/customer-logins/${encodeURIComponent(userId)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Login history unavailable')))
      .then(async ({ logins }: { logins: CustomerLogin[] }) => {
        if (!active || !Array.isArray(logins)) return;
        if (!logins.length && localLogins.length) {
          for (const login of localLogins) {
            await fetch(`/api/customer-logins/${encodeURIComponent(userId)}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: customer.wallet, ...login }),
            });
          }
          if (!active) return;
          setLoginHistory(localLogins);
          return;
        }
        setLoginHistory(logins);
        window.localStorage.setItem(`takasafe-logins:${userId}:${customer.wallet}`, JSON.stringify(logins));
      })
      .catch(() => { if (active) setLoginHistory(localLogins); });
    return () => { active = false; };
  }, [userId, customer.wallet]);

  useEffect(() => {
    let active = true;
    const localHistory = loadTransferHistory(userId, customer.wallet);
    fetch(`/api/customer-history/${encodeURIComponent(userId)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('History API unavailable')))
      .then(async ({ history }: { history: CustomerTransfer[] }) => {
        if (!active || !Array.isArray(history)) return;
        if (!history.length && localHistory.length) {
          for (const record of localHistory) {
            await fetch(`/api/customer-history/${encodeURIComponent(userId)}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: customer.wallet, ...record }),
            });
          }
          if (!active) return;
          setTransferHistory(localHistory);
          return;
        }
        setTransferHistory(history);
        window.localStorage.setItem(`takasafe-transfers:${userId}:${customer.wallet}`, JSON.stringify(history));
      })
      .catch(() => { if (active) setTransferHistory(localHistory); });
    return () => { active = false; };
  }, [userId, customer.wallet]);

  useEffect(() => {
    const refreshOnServerEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string; userId?: string }>).detail;
      if (detail?.kind === 'customer-login' && detail.userId === userId) {
        fetch(`/api/customer-logins/${encodeURIComponent(userId)}`, { cache: 'no-store' })
          .then((response) => response.ok ? response.json() : Promise.reject(new Error('Login history refresh failed')))
          .then(({ logins }: { logins: CustomerLogin[] }) => {
            if (!Array.isArray(logins)) return;
            setLoginHistory(logins);
            try { window.localStorage.setItem(`takasafe-logins:${userId}:${customer.wallet}`, JSON.stringify(logins)); } catch { /* Keep refreshed history in memory. */ }
          }).catch(() => undefined);
        return;
      }
      if (detail?.kind !== 'customer-transaction') return;
      fetch(`/api/customer-history/${encodeURIComponent(userId)}`, { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('History refresh failed')))
        .then(({ history }: { history: CustomerTransfer[] }) => {
          if (!Array.isArray(history)) return;
          setTransferHistory(history);
          try { window.localStorage.setItem(`takasafe-transfers:${userId}:${customer.wallet}`, JSON.stringify(history)); } catch { /* Keep the refreshed history in memory. */ }
        })
        .catch(() => undefined);
    };
    window.addEventListener('takasafe-server-update', refreshOnServerEvent);
    return () => window.removeEventListener('takasafe-server-update', refreshOnServerEvent);
  }, [userId, customer.wallet]);

  const recentTransfers = transferHistory.filter((transfer) => Date.now() - Date.parse(transfer.timestamp) <= 90 * 24 * 60 * 60 * 1000);
  const sendMoneyTransfers = recentTransfers.filter((transfer) => !transfer.serviceType || transfer.serviceType === 'SEND_MONEY');
  const baselineTransfers = sendMoneyTransfers.filter((transfer) => transfer.status !== 'PROCEEDED' && (transfer.riskScore ?? 0) < 40);
  const observedAverage = baselineTransfers.length
    ? baselineTransfers.reduce((sum, transfer) => sum + transfer.amount, 0) / baselineTransfers.length
    : customer.avgAmount;
  const sortedAmounts = baselineTransfers.map((transfer) => transfer.amount).sort((a, b) => a - b);
  const medianAmount = sortedAmounts.length ? sortedAmounts[Math.floor(sortedAmounts.length / 2)] : customer.avgAmount;
  const absoluteDeviations = sortedAmounts.map((value) => Math.abs(value - medianAmount)).sort((a, b) => a - b);
  const medianAbsoluteDeviation = absoluteDeviations.length ? absoluteDeviations[Math.floor(absoluteDeviations.length / 2)] : 0;
  const observedUpperRange = sortedAmounts.length
    ? sortedAmounts[Math.floor((sortedAmounts.length - 1) * 0.9)]
    : customer.maxAmountTypical;
  const observedRecipients = new Set(sendMoneyTransfers.map((transfer) => transfer.recipient.replace(/\D/g, '')).filter(Boolean));
  const knownRecipients = observedRecipients.size ? observedRecipients : new Set(customer.frequentRecipients.map((item) => item.replace(/\D/g, '')));
  const activityTimestamps = [
    ...baselineTransfers.map((transfer) => transfer.timestamp),
    ...loginHistory.map((login) => login.timestamp).filter((timestamp) => Date.now() - Date.parse(timestamp) <= 90 * 24 * 60 * 60 * 1000),
  ];
  const observedHours = activityTimestamps.map((timestamp) => new Date(timestamp).getHours()).sort((a, b) => a - b);
  const usualHours = observedHours.length >= 3
    ? `${String(observedHours[0]).padStart(2, '0')}:00 - ${String((observedHours[observedHours.length - 1] + 1) % 24).padStart(2, '0')}:00`
    : customer.usualHours;

  const liveAI1Evaluation = React.useMemo(() => {
    const num = Number(amount) || Math.round(observedAverage);
    const normalizedRecipient = recipient.trim().replace(/\D/g, '');
    const recipientIsKnown = knownRecipients.has(normalizedRecipient);
    const isKnownMule = recipient.trim().includes('510294');
    const currentHour = new Date().getHours();
    const [usualStart = 9, usualEnd = 21] = usualHours.split('-').map((time) => Number(time.trim().split(':')[0]));
    const outsideUsualHours = currentHour < usualStart || currentHour >= usualEnd;

    return evaluateAI1AndDoubtCheck({
      amount: num,
      observedAverage,
      recipient: recipient || '01XXXXXXXXX',
      recipientIsKnown,
      isKnownMule,
      momentHourBST: currentHour,
      outsideUsualHours,
      recentAttemptCount10m: 0,
      isNewDevice: false,
      splitPaymentDetected: false,
      note,
    });
  }, [amount, recipient, observedAverage, knownRecipients, usualHours, note]);

  const recordTransfer = (
    transferAmount: number,
    transferRecipient: string,
    score: number,
    status: 'COMPLETED' | 'PROCEEDED',
    serviceType = 'SEND_MONEY',
    direction: 'IN' | 'OUT' = 'OUT',
    fee = 0,
    reference = note.trim(),
  ) => {
    const record: CustomerTransfer = {
      amount: transferAmount,
      recipient: transferRecipient.trim(),
      timestamp: new Date().toISOString(),
      reference,
      status,
      riskScore: score,
      serviceType,
      direction,
      fee,
    };
    const nextHistory = [
      ...transferHistory,
      record,
    ].slice(-500);
    const nextBalance = Math.max(0, availableBalance + (direction === 'IN' ? transferAmount : -(transferAmount + fee)));
    setAvailableBalance(nextBalance);
    setBalanceError(null);
    try {
      window.localStorage.setItem(balanceStorageKey, String(nextBalance));
    } catch {
      // Keep the balance update in memory if browser storage is unavailable.
    }
    setTransferHistory(nextHistory);
    try {
      window.localStorage.setItem(`takasafe-transfers:${userId}:${customer.wallet}`, JSON.stringify(nextHistory));
    } catch {
      // Keep the current session's in-memory history if browser storage is unavailable.
    }
    fetch(`/api/customer-history/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: customer.wallet, ...record }),
    }).catch(() => {
      // Local storage remains available as an offline fallback.
    });
  };

  const handleWalletServiceSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeWalletService) return;
    const config = WALLET_SERVICES[activeWalletService];
    const value = Number(serviceAmount);
    if (!Number.isFinite(value) || value <= 0) {
      setServiceError('Enter an amount greater than ৳0.');
      return;
    }
    const fee = getServiceFee(activeWalletService, serviceTarget, value);
    const totalDebit = value + fee;
    if (config.direction === 'OUT' && totalDebit > availableBalance) {
      setServiceError(`Insufficient balance. This service needs ৳${totalDebit.toLocaleString()} including fees; ৳${availableBalance.toLocaleString()} is available.`);
      return;
    }
    if (!serviceTarget.trim()) {
      setServiceError(`Select a ${config.targetLabel.toLowerCase()}.`);
      return;
    }
    const needsAgentNumber = (activeWalletService === 'Cash In' && serviceTarget === 'Agent Deposit') || (activeWalletService === 'Cash Out' && serviceTarget === 'Agent Cash Out');
    if (needsAgentNumber && !/^01[3-9]\d{8}$/.test(serviceNote.replace(/\D/g, ''))) {
      setServiceError('Enter a valid 11-digit Bangladesh agent number.');
      return;
    }
    if (activeWalletService === 'Mobile Recharge' && !/^01[3-9]\d{8}$/.test(serviceNote.replace(/\D/g, ''))) {
      setServiceError('Enter a valid 11-digit Bangladesh mobile number.');
      return;
    }
    if ((activeWalletService === 'Mobile Recharge' || activeWalletService === 'Pay Bill') && !serviceNote.trim()) {
      setServiceError(activeWalletService === 'Mobile Recharge' ? 'Enter the mobile number to recharge.' : 'Enter the bill account number.');
      return;
    }
    setServiceError(null);
    setIsServiceReview(true);
  };

  const confirmWalletService = () => {
    if (!activeWalletService || !isServiceReview) return;
    const config = WALLET_SERVICES[activeWalletService];
    const value = Number(serviceAmount);
    const fee = getServiceFee(activeWalletService, serviceTarget, value);
    const totalDebit = value + fee;
    if (!Number.isFinite(value) || value <= 0 || (config.direction === 'OUT' && totalDebit > availableBalance)) {
      setIsServiceReview(false);
      setServiceError('Your available balance changed. Check the amount and try again.');
      return;
    }

    const isAgentTransaction = (activeWalletService === 'Cash In' && serviceTarget === 'Agent Deposit') || (activeWalletService === 'Cash Out' && serviceTarget === 'Agent Cash Out');
    const historyCounterparty = isAgentTransaction ? serviceNote.trim() : serviceTarget;
    const historyReference = isAgentTransaction ? `${serviceTarget} · ${serviceNote.trim()}` : serviceNote.trim();
    recordTransfer(value, historyCounterparty, 0, 'COMPLETED', config.type, config.direction, fee, historyReference);
    const balanceAfter = availableBalance + (config.direction === 'IN' ? value : -totalDebit);
    setServiceReceipt(`Simulated ${config.title} completed for BDT ${value.toLocaleString()}${fee ? ` (BDT ${fee.toLocaleString()} fee)` : ''}. Demo balance: BDT ${balanceAfter.toLocaleString()}. No real payment was made.`);
    setIsServiceReview(false);
  };

  const closeWalletService = () => {
    setActiveWalletService(null);
    setServiceError(null);
    setServiceReceipt(null);
    setIsServiceReview(false);
    onServiceDismiss?.();
  };

  // QR Code Scanner & Secure Wallet Linking States
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [qrInitialTab, setQrInitialTab] = useState<'SCANNER' | 'MY_QR'>('SCANNER');
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>(MOCK_LINKED_WALLETS);
  const [linkSuccessBanner, setLinkSuccessBanner] = useState<string | null>(null);
  const [formHighlight, setFormHighlight] = useState<boolean>(false);

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setBalanceError('Enter an amount greater than ৳0.');
      return;
    }
    if (num > availableBalance) {
      setBalanceError(`Insufficient balance. You have ৳${availableBalance.toLocaleString()} available.`);
      return;
    }
    setBalanceError(null);
    setIsScoring(true);

    // Stage 1: Transaction
    setPipelineStage(1);
    setPipelineProgress(20);
    setPipelineStatus(
      lang === 'BN'
        ? 'ধাপ ১/৫: লেনদেন প্যারামিটার ও টোকেন ভ্যালিডেশন...'
        : 'Stage 1/5: Validating transaction parameters & token gateway...'
    );
    await new Promise((r) => setTimeout(r, 220));

    // Stage 2: Context Check
    setPipelineStage(2);
    setPipelineProgress(40);
    setPipelineStatus(
      lang === 'BN'
        ? 'ধাপ ২/৫: কনটেক্সট চেক · আচরণ, সময় ও প্রাপকের ইতিহাস বিশ্লেষণ...'
        : 'Stage 2/5: Context check: Evaluating baseline spending & circadian hours...'
    );
    await new Promise((r) => setTimeout(r, 260));

    const normalizedRecipient = recipient.trim().replace(/\D/g, '');
    const recipientIsKnown = knownRecipients.has(normalizedRecipient);
    const isKnownMule = recipient.trim().includes('510294');
    let recipientNetworkRisk = { score: 0, reasons: [] as string[] };
    try {
      const response = await fetch(`/api/recipient-risk/${encodeURIComponent(normalizedRecipient)}`);
      if (response.ok) {
        const data = await response.json();
        recipientNetworkRisk = {
          score: Number(data.score) || 0,
          reasons: Array.isArray(data.reasons) ? data.reasons.filter((reason: unknown): reason is string => typeof reason === 'string') : [],
        };
      }
    } catch {
      // Continue with individual behavior signals when network history is unavailable.
    }
    const currentHour = new Date().getHours();
    const [usualStart = 9, usualEnd = 21] = usualHours.split('-').map((time) => Number(time.trim().split(':')[0]));
    const amountRatio = num / Math.max(medianAmount, 1);
    const amountThreshold = baselineTransfers.length >= 5
      ? Math.max(medianAmount + 3 * 1.4826 * medianAbsoluteDeviation, medianAmount * 2.5, observedUpperRange)
      : Math.max(customer.maxAmountTypical, observedAverage * 3);
    const amountIsUnusual = num > amountThreshold && amountRatio >= 3;
    const outsideUsualHours = currentHour < usualStart || currentHour >= usualEnd;
    const activityHourCounts = observedHours.reduce((counts, hour) => {
      counts[hour] = (counts[hour] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);
    const peakActivityCount = Math.max(0, ...Object.values(activityHourCounts));
    const learnedUnusualTime = observedHours.length >= 6 && peakActivityCount >= 2 && (activityHourCounts[currentHour] || 0) === 0;
    const outgoingHistory = transferHistory.filter((transfer) => (transfer.direction || 'OUT') === 'OUT');
    const recentAttemptCount = outgoingHistory.filter((transfer) => Date.now() - Date.parse(transfer.timestamp) <= 10 * 60 * 1000).length;
    const dailyTransfers = outgoingHistory.filter((transfer) => Date.now() - Date.parse(transfer.timestamp) <= 24 * 60 * 60 * 1000);
    const dailyAmount = dailyTransfers.reduce((total, transfer) => total + transfer.amount, num);
    const splitPaymentPattern = dailyTransfers.length >= 2 && num <= amountThreshold &&
      dailyTransfers.every((transfer) => transfer.amount <= amountThreshold) &&
      dailyAmount > Math.max(amountThreshold * 3, medianAmount * customer.avgDailyTxns * 2.5);
    const normalizeDevice = (device: string) => device.replace(/(Chrome|Firefox|Version|Safari|Edg)\/[\d.]+/g, '$1/*');
    const knownSessionDevices = loginHistory.map((login) => login.device).filter((device): device is string => Boolean(device)).map(normalizeDevice);
    const currentDevice = typeof navigator === 'undefined' ? '' : normalizeDevice(navigator.userAgent);
    const newDevice = knownSessionDevices.length >= 2 && Boolean(currentDevice) && !knownSessionDevices.includes(currentDevice);
    const reasons: string[] = [];
    let score = 0;
    if (amountIsUnusual) {
      score += Math.min(40, 20 + Math.round((amountRatio - 3) * 3));
      reasons.push(`Unusual amount: ৳${num.toLocaleString()} is ${amountRatio.toFixed(1)}× your recent average of ৳${Math.round(observedAverage).toLocaleString()}.`);
    }
    if (outsideUsualHours) {
      score += amountIsUnusual ? 25 : 8;
      reasons.push(`This transfer is outside your usual activity hours (${usualHours})${amountIsUnusual ? ', increasing the risk of this unusually large payment' : ''}.`);
    } else if (learnedUnusualTime) {
      score += amountIsUnusual ? 25 : 8;
      reasons.push(`You have not usually logged in or transacted at this hour${amountIsUnusual ? ', and this amount is unusually large' : ''}.`);
    }
    if (!recipientIsKnown) {
      score += 8;
      reasons.push('This is a recipient you have not sent money to before.');
    }
    const unusualPaceThreshold = Math.max(3, Math.ceil(customer.avgDailyTxns / 6));
    if (recentAttemptCount >= unusualPaceThreshold) {
      score += 20;
      reasons.push(`${recentAttemptCount} transfers were recorded in the last 10 minutes, above your usual pace.`);
    }
    if (splitPaymentPattern) {
      score += 20;
      reasons.push('Several smaller transfers add up to an unusually high total for your recent activity.');
    }
    if (newDevice) {
      score += amountIsUnusual ? 28 : 16;
      reasons.push(`This session is using a device or browser not seen in your previous ${knownSessionDevices.length} logins${amountIsUnusual ? ', alongside an unusually large transfer' : ''}.`);
    }
    if (isKnownMule) {
      score += 65;
      reasons.push('This recipient is linked to a suspicious money-mule network.');
    }
    if (recipientNetworkRisk.score > 0) {
      score += recipientNetworkRisk.score;
      reasons.push(...recipientNetworkRisk.reasons);
    }

    // Stage 3: AI Risk Engine
    setPipelineStage(3);
    setPipelineProgress(60);
    setPipelineStatus(
      lang === 'BN'
        ? 'ধাপ ৩/৫: এআই রিস্ক ইঞ্জিন · LightGBM ক্যালিব্রেটেড ইনফারেন্স...'
        : 'Stage 3/5: AI Risk Engine: Running calibrated model inference...'
    );
    await new Promise((r) => setTimeout(r, 280));

    // AI-1 Engine evaluation (LightGBM + Calibration + Conformal Doubt Check)
    const evalResult = evaluateAI1AndDoubtCheck({
      amount: num,
      observedAverage,
      recipient,
      recipientIsKnown,
      isKnownMule,
      momentHourBST: currentHour,
      outsideUsualHours,
      recentAttemptCount10m: recentAttemptCount,
      isNewDevice: newDevice,
      splitPaymentDetected: splitPaymentPattern,
      note,
    });
    setCurrentAI1Evaluation(evalResult);

    // Fuse scores: incorporate calibrated AI-1 probability
    const finalScore = Math.min(100, Math.max(score, evalResult.ai1Score.calibratedScore));

    // Stage 4: Evidence Check
    setPipelineStage(4);
    setPipelineProgress(80);
    setPipelineStatus(
      lang === 'BN'
        ? 'ধাপ ৪/৫: প্রমাণ যাচাই · SHAP বিশ্লেষণ ও কনফর্মাল ডাউট বাউন্ডারি...'
        : 'Stage 4/5: Evidence check: SHAP attribution & conformal doubt bounds...'
    );
    await new Promise((r) => setTimeout(r, 260));

    if (evalResult.doubtCheck.conformal.isDoubtFlagged) {
      reasons.push(`Model Doubt Check: Conformal prediction set {${evalResult.doubtCheck.conformal.predictionSet.join(', ')}} indicates high statistical ambiguity.`);
    }
    if (evalResult.doubtCheck.novelty.isNovel) {
      reasons.push(`Model Novelty Check: Transfer exhibits ${(evalResult.doubtCheck.novelty.noveltyScore * 100).toFixed(0)}% Out-of-Distribution deviance across Amount, Receiver & Moment.`);
    }

    // Stage 5: Decision
    setPipelineStage(5);
    setPipelineProgress(100);
    const isRisky = finalScore >= 40 || evalResult.scamShieldTriggered;
    setPipelineStatus(
      isRisky
        ? (lang === 'BN' ? 'ধাপ ৫/৫: ঝুঁকি শনাক্ত! ScamShield সুরক্ষা চালু হচ্ছে...' : 'Stage 5/5: Elevated risk detected! Engaging ScamShield...')
        : (lang === 'BN' ? 'ধাপ ৫/৫: নিরাপদ লেনদেন ক্লিয়ার্ড · সফল অর্থ স্থানান্তর' : 'Stage 5/5: Low risk cleared · Safe instant transfer executed')
    );
    await new Promise((r) => setTimeout(r, 220));

    setIsScoring(false);
    setRiskReasons(reasons);
    setRiskScore(finalScore);

    // Trigger ScamShield if finalScore >= 40 or AI-1 doubt/risk policy flags it
    if (finalScore >= 40 || evalResult.scamShieldTriggered) {
      setShowScamModal(true);
      onSimulateRiskyPayment();
    } else {
      recordTransfer(num, recipient, finalScore, 'COMPLETED');
      setNormalSuccess(true);
      setTimeout(() => setNormalSuccess(false), 4000);
    }
  };

  const handlePreFill = (type: 'NORMAL' | 'RISKY') => {
    if (type === 'NORMAL') {
      setRecipient(customer.frequentRecipients[0]?.split(' ')[0] || recipient);
      setAmount(String(Math.round(observedAverage)));
      setNote('');
      setPipelineStage(1);
      setPipelineProgress(20);
      setPipelineStatus(lang === 'BN' ? 'স্বাভাবিক লেনদেন দৃশ্যপট প্রস্তুত (৳১,৫০০)' : 'Normal scenario loaded (৳1,500)');
    } else {
      setRecipient('01988-510294');
      setAmount('80000');
      setNote('Lottery prize processing fee');
      setPipelineStage(1);
      setPipelineProgress(20);
      setPipelineStatus(lang === 'BN' ? 'উচ্চ ঝুঁকির দৃশ্যপট লোড হয়েছে (৳৮০,০০০ মিউল)' : 'High risk scenario loaded (৳80,000 Mule ring)');
    }
  };

  // Called when a QR code finishes linking a new wallet
  const handleWalletLinked = (newWallet: LinkedWallet) => {
    setLinkedWallets((prev) => [newWallet, ...prev]);
    setLinkSuccessBanner(`Secure Link Established: ${newWallet.nickname || newWallet.accountHolder} is now protected by ScamShield.`);
    setTimeout(() => setLinkSuccessBanner(null), 5000);
  };

  // Called when a payment or merchant QR is scanned
  const handlePaymentQRScanned = (recipientWallet: string, suggestedAmount?: number, suggestedNote?: string) => {
    if (activeWalletService === 'Make Payment') {
      const merchant = suggestedNote?.replace(/^QR Payment to\s*/i, '').trim() || recipientWallet;
      setServiceTarget(merchant);
      setServiceAmount(suggestedAmount && suggestedAmount > 0 ? String(suggestedAmount) : '');
      setServiceNote(`QR recipient: ${recipientWallet}`);
      setServiceError(null);
      setIsServiceReview(false);
      return;
    }
    if ((activeWalletService === 'Cash Out' && serviceTarget === 'Agent Cash Out') || (activeWalletService === 'Cash In' && serviceTarget === 'Agent Deposit')) {
      setServiceNote(recipientWallet);
      setServiceAmount(suggestedAmount && suggestedAmount > 0 ? String(suggestedAmount) : '');
      setServiceError(null);
      setIsServiceReview(false);
      return;
    }
    setActiveTab('WALLET');
    setRecipient(recipientWallet);
    if (suggestedAmount) {
      setAmount(suggestedAmount.toString());
    }
    if (suggestedNote) {
      setNote(suggestedNote);
    }
    setFormHighlight(true);
    setTimeout(() => setFormHighlight(false), 2500);
  };

  const handleUnlinkWallet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkedWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSelectLinkedForTransfer = (wallet: LinkedWallet) => {
    setRecipient(wallet.walletId);
    setNote(`Transfer to ${wallet.nickname || wallet.accountHolder}`);
    setFormHighlight(true);
    setTimeout(() => setFormHighlight(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">
        Demo mode: payments, service requests, balances, and QR links are simulated. No real money moves and no external account is connected.
      </div>
      {/* Customer Mode Header */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'BN' ? 'গ্রাহক মোড' : 'Active TakaSafe Customer Persona'}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {customer.name} ({customer.wallet})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered Base: {customer.homeDistrict} · Verified NID · Primary Device: {customer.knownDevices[0]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main QR Scanner Action Button */}
          <button
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-2 bg-[#0054A6] hover:bg-[#004080] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>{lang === 'BN' ? 'কিউআর স্ক্যান / ওয়ালেট লিঙ্ক' : 'Scan QR & Link Wallet'}</span>
          </button>

          <div className="customer-view-tabs flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('WALLET')}
              aria-pressed={activeTab === 'WALLET'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'WALLET'
                  ? 'bg-white text-[#0054A6] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'BN' ? 'টাকা সেফ ওয়ালেট' : 'Wallet & Transfers'}
            </button>
            <button
              onClick={() => setActiveTab('RESILIENCE')}
              aria-pressed={activeTab === 'RESILIENCE'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'RESILIENCE'
                  ? 'bg-white text-[#0054A6] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'BN' ? 'আর্থিক সুরক্ষা সূচক' : 'Resilience Score'}
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Link Success Toast Banner */}
      {linkSuccessBanner && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{linkSuccessBanner}</span>
          </div>
          <button
            onClick={() => setLinkSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div key={activeTab} className="page-enter">
        {activeTab === 'WALLET' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-grid">
              {/* Balance & Card Details */}
              <div className="md:col-span-1 space-y-4">
                {/* Digital Wallet Card - Sovereign Luxury Centurion Inspired */}
                <TakaSafeSovereignCard customer={{ ...customer, balance: availableBalance }} lang={lang} />

                {/* Quick Demo Pre-fills */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    ⚡ Quick Demonstration Scenarios:
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePreFill('NORMAL')}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs cursor-pointer"
                  >
                    <div className="font-bold text-slate-800">1. Normal Transfer (৳ 1,500)</div>
                    <div className="text-[11px] text-slate-500">To: Mother · Regular contact · 0 Risk</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreFill('RISKY')}
                    className="w-full text-left p-2.5 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-400 transition-all text-xs cursor-pointer"
                  >
                    <div className="font-bold text-rose-800 flex items-center justify-between">
                      <span>2. Risky Transfer (৳ 80,000)</span>
                      <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded">TRIGGERS SHIELD</span>
                    </div>
                    <div className="text-[11px] text-slate-500">To: New nocturnal account · Mule W302 link</div>
                  </button>
                </div>
              </div>

              {/* Transfer Form */}
              <div
                className={`md:col-span-2 bg-white p-6 rounded-3xl border shadow-sm transition-all duration-300 min-h-[626px] ${
                  formHighlight ? 'ring-2 ring-[#0054A6] border-[#0054A6]' : 'border-slate-200'
                }`}
              >
                {activeWalletService && WALLET_SERVICES[activeWalletService] ? (
                  <div className="min-h-[578px] flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-[#0054A6]" />
                        <h3 className="font-bold text-slate-900 text-base">{WALLET_SERVICES[activeWalletService].title}</h3>
                      </div>
                      <button type="button" onClick={closeWalletService} className="text-xs font-bold text-[#0054A6] hover:underline">Back to Send Money</button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Account: {customer.name} · Available ৳{availableBalance.toLocaleString()}</p>
                    <div className="flex-1 pt-4">
                      {serviceReceipt ? (
                        <div className="space-y-4"><div role="status" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800">{serviceReceipt}</div><button type="button" onClick={closeWalletService} className="w-full py-3 rounded-xl bg-[#FAB915] text-slate-950 font-black text-sm">Done</button></div>
                      ) : isServiceReview ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 text-sm">
                            <div className="p-3 flex justify-between gap-4"><span className="text-slate-500">Service</span><strong>{WALLET_SERVICES[activeWalletService].title}</strong></div>
                            <div className="p-3 flex justify-between gap-4"><span className="text-slate-500">{WALLET_SERVICES[activeWalletService].targetLabel}</span><strong>{serviceTarget}</strong></div>
                            {serviceNote && <div className="p-3 flex justify-between gap-4"><span className="text-slate-500">Reference</span><strong className="break-all">{serviceNote}</strong></div>}
                            <div className="p-3 flex justify-between gap-4"><span>Amount</span><strong>BDT {Number(serviceAmount).toLocaleString()}</strong></div>
                            <div className="p-3 flex justify-between gap-4"><span>Fee</span><strong>BDT {getServiceFee(activeWalletService, serviceTarget, Number(serviceAmount)).toLocaleString()}</strong></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setIsServiceReview(false)} className="py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm">Edit details</button><button type="button" onClick={confirmWalletService} className="py-3 rounded-xl bg-[#FAB915] text-slate-950 font-black text-sm">Confirm</button></div>
                        </div>
                      ) : (
                        <form onSubmit={handleWalletServiceSubmit} className="space-y-4">
                          <label className="block text-xs font-semibold text-slate-700">{WALLET_SERVICES[activeWalletService].targetLabel}{WALLET_SERVICES[activeWalletService].targets.length ? <select value={serviceTarget} onChange={(event) => setServiceTarget(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm">{WALLET_SERVICES[activeWalletService].targets.map((target) => <option key={target} value={target}>{target}</option>)}</select> : <input value={serviceTarget} onChange={(event) => setServiceTarget(event.target.value)} required placeholder="Enter merchant name or scan its QR" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm" />}</label>
                          {(activeWalletService === 'Make Payment' || (activeWalletService === 'Cash Out' && serviceTarget === 'Agent Cash Out') || (activeWalletService === 'Cash In' && serviceTarget === 'Agent Deposit')) && <button type="button" onClick={() => setIsQRScannerOpen(true)} className="w-full py-2.5 rounded-xl border border-[#0054A6] text-[#0054A6] font-bold text-xs flex items-center justify-center gap-2"><QrCode className="w-4 h-4" /> Scan QR</button>}
                          {(activeWalletService === 'Cash In' || activeWalletService === 'Cash Out' || activeWalletService === 'Make Payment' || activeWalletService === 'Pay Bill' || activeWalletService === 'Mobile Recharge' || activeWalletService === 'Education' || activeWalletService === 'Insurance' || activeWalletService === 'Business' || activeWalletService === 'Add Money' || activeWalletService === 'Remittance' || activeWalletService === 'Savings') && <label className="block text-xs font-semibold text-slate-700">Reference / account number (optional)<input value={serviceNote} onChange={(event) => setServiceNote(event.target.value)} placeholder="Enter a reference" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm" /></label>}
                          <label className="block text-xs font-semibold text-slate-700">Amount (BDT ৳)<input type="number" min="1" step="1" required value={serviceAmount} onChange={(event) => { setServiceAmount(event.target.value); setServiceError(null); }} placeholder="Enter amount" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-base font-bold" /></label>
                          {serviceError && <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{serviceError}</p>}
                          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex justify-between"><span>Estimated charge</span><strong>৳{getServiceFee(activeWalletService, serviceTarget, Number(serviceAmount) || 0).toLocaleString()}</strong></div>
                          <button type="submit" className="w-full bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 font-black py-3 rounded-xl shadow-md text-sm">Review Transaction</button>
                        </form>
                      )}
                    </div>
                  </div>
                ) : <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#0054A6]" />
                    <h3 className="font-bold text-slate-900 text-base">
                      {lang === 'BN' ? 'সেন্ড মানি করুন' : 'Send Money'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQRScannerOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0054A6] hover:text-[#003875] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{lang === 'BN' ? 'কিউআর স্ক্যান করুন' : 'Scan QR'}</span>
                  </button>
                </div>

                {normalSuccess && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Simulated payment completed</div>
                      <div>Demo transfer of ৳{Number(amount).toLocaleString()} to {recipient}. No real payment was made.</div>
                    </div>
                  </div>
                )}

                {balanceError && (
                  <div role="alert" className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                    {balanceError}
                  </div>
                )}

                <form onSubmit={handleSendPayment} className="space-y-4 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {lang === 'BN' ? 'প্রাপকের টাকা সেফ নম্বর' : 'Recipient TakaSafe Wallet / Phone'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsQRScannerOpen(true)}
                        className="text-[11px] text-[#0054A6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Scan Recipient QR</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => {
                          setRecipient(e.target.value);
                          setPipelineStage(1);
                          setPipelineProgress(20);
                          setPipelineStatus('');
                        }}
                        placeholder="01XXXXXXXXX"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {lang === 'BN' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT ৳)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={amount}
                        min="1"
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setBalanceError(null);
                          setPipelineStage(1);
                          setPipelineProgress(20);
                          setPipelineStatus('');
                        }}
                        placeholder="1000"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Your recent 90-day transfer average is <strong>৳{Math.round(observedAverage).toLocaleString()}</strong> ({recentTransfers.length} recorded transfers).
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Reference Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Family support, emergency, bill"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isScoring}
                      className="w-full bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 font-black py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isScoring ? 'Checking recipient and behavior…' : lang === 'BN' ? 'টাকা পাঠান' : 'Proceed to Send Money'}</span>
                    </button>
                  </div>

                  {/* 5-Stage Live Trust & Fraud Pipeline Stepper (As in user reference pic) */}
                  <div className="mt-2.5 bg-slate-50/80 dark:bg-slate-900/50 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    <AnalysisTimeline
                      currentStage={pipelineStage}
                      lang={lang}
                      showProgressBar={true}
                      progressPercent={pipelineProgress}
                      isLive={isScoring}
                    />
                  </div>
                </form>
                {/* Show the ML prediction beneath the complete Send Money flow. */}
                <div className="mt-5">
                  <AI1PipelineVisualizer
                    evaluation={liveAI1Evaluation}
                    onOpenNotebookModal={() => setIsNotebookModalOpen(true)}
                  />
                </div>
                </>}
              </div>
            </div>

            {/* Linked Accounts & Wallets Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0054A6] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <span>{lang === 'BN' ? 'সংযুক্ত ওয়ালেট ও ব্যাংক অ্যাকাউন্ট' : 'Linked Secure Accounts & Co-Wallets'}</span>
                      <span className="text-[10px] font-mono bg-blue-100 text-[#0054A6] px-2 py-0.5 rounded-full font-bold">
                        {linkedWallets.length} Connected
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cryptographically bound via QR handshake · Anti-Tamper Verification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0054A6] hover:bg-[#003f7a] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'BN' ? 'নতুন কিউআর লিঙ্ক' : 'Link New via QR'}</span>
                </button>
              </div>

              {/* Linked Accounts Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {linkedWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    onClick={() => handleSelectLinkedForTransfer(wallet)}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#0054A6] hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {wallet.type.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-700">Active</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {wallet.type === 'BANK_ACCOUNT' ? (
                          <Building2 className="w-4 h-4 text-[#0054A6] shrink-0" />
                        ) : wallet.type === 'FAMILY_MEMBER' ? (
                          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#0054A6] transition-colors truncate">
                          {wallet.nickname || wallet.accountHolder}
                        </h4>
                      </div>

                      <div className="text-[11px] font-mono text-slate-600 mt-1">
                        {wallet.provider}
                      </div>

                      <div className="font-mono text-xs font-semibold text-slate-800 mt-0.5">
                        {wallet.accountNumberMasked}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Daily Limit:</span>
                        <span className="font-mono font-bold text-slate-800">৳{wallet.dailyLimitBDT.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>Trust Score:</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {wallet.securityTrustScore}% Safe
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-[#0054A6] font-bold group-hover:underline">
                        Quick Transfer →
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleUnlinkWallet(wallet.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Unlink Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Receiving QR Shortcut Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <QrCode className="w-5 h-5 text-[#0054A6] shrink-0" />
                  <div>
                    <span className="font-bold block">Need to receive money from another person or merchant?</span>
                    <span className="text-[11px] text-slate-600">
                      Display your personalized, NID-verified TakaSafe Receiving QR code.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setQrInitialTab('MY_QR'); setIsQRScannerOpen(true); }}
                  className="px-3.5 py-1.5 bg-white border border-[#0054A6] text-[#0054A6] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Show My Receiving QR
                </button>
              </div>
            </div>

            <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-extrabold text-sm text-slate-900">Recent Wallet Activity</h3>
                <span className="text-[10px] font-mono text-slate-500">{transferHistory.length} records</span>
              </div>
              {transferHistory.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">Completed wallet services will appear here.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {[...transferHistory].reverse().slice(0, 8).map((transfer, index) => {
                    const isCredit = (transfer.direction || 'OUT') === 'IN';
                    const serviceName = (transfer.serviceType || 'SEND_MONEY').replace(/_/g, ' ');
                    return (
                      <div key={`${transfer.timestamp}-${index}`} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{serviceName} · {transfer.recipient}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{new Date(transfer.timestamp).toLocaleString()} {transfer.reference ? `· ${transfer.reference}` : ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs font-black ${isCredit ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {isCredit ? '+' : '−'}৳{transfer.amount.toLocaleString()}
                          </p>
                          {Boolean(transfer.fee) && <p className="text-[10px] text-slate-500">Fee ৳{transfer.fee!.toLocaleString()}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Customer Financial Resilience Tab */
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-lg">
                    Customer Financial Resilience & Health Index
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Empowering MFS users with explainable insights on spending stability, cash-out dependency, and emergency buffers.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Personal Resilience Score</span>
                <span className="text-3xl font-black font-mono text-emerald-600">
                  {customer.financialResilienceScore}/100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Income Regularity</span>
                <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
                  {customer.resilienceComponents.incomeStability}%
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  Predictable bi-monthly inflow
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Spending Volatility</span>
                <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
                  {customer.resilienceComponents.spendingDiscipline}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Low discretionary spikes
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Emergency Buffer</span>
                <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
                  {customer.resilienceComponents.emergencyBufferDays} Days
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  Above national 30-day baseline
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Cash-Out Dependency</span>
                <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">
                  {customer.resilienceComponents.cashOutDependency}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Moderate cash withdrawal habit
                </span>
              </div>
            </div>

            {/* Tailored Coaching Tips */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Smart Financial Coaching (AI Recommendations)
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Reduce Cash-Out Fees:</strong> You withdrew ৳12,000 in physical cash last month. Paying utility bills (DESCO, Titas) and groceries directly with TakaSafe QR saves approximately ৳216 in agent cash-out commissions.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Emergency Buffer Goal:</strong> Your current wallet reserve covers 45 days. Maintaining a ৳10,000 minimum balance safeguards against unexpected monsoon health emergencies without borrowing.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Scanner & Secure Linking Modal */}
      <QRCodeScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => { setIsQRScannerOpen(false); setQrInitialTab('SCANNER'); }}
        customer={customer}
        onWalletLinked={handleWalletLinked}
        onPaymentQRScanned={handlePaymentQRScanned}
        scanMode={activeWalletService === 'Make Payment' ? 'PAYMENT' : (activeWalletService === 'Cash Out' && serviceTarget === 'Agent Cash Out') || (activeWalletService === 'Cash In' && serviceTarget === 'Agent Deposit') ? 'AGENT' : 'LINK'}
        initialTab={qrInitialTab}
        lang={lang}
      />

      {/* ScamShield Pre-Payment Modal (Human-Choice Protection) */}
      {showScamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md modal-backdrop-enter"
          onClick={() => {
            setShowScamModal(false);
            setScamDecision(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-rose-300 space-y-5 modal-panel-enter max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Cross Button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ScamShield Pre-Payment Warning
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Review Transaction (Score: {riskScore}/100)
                  </h3>
                </div>
              </div>

              {/* Cross / Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowScamModal(false);
                  setScamDecision(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close warning"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Hold on, <strong>{customer.name}</strong>. This transfer has signals that differ from your usual activity. Review them before continuing.
            </p>

            {/* AI-1 Model Architecture Pipeline Visualizer in ScamShield */}
            <AI1PipelineVisualizer
              evaluation={currentAI1Evaluation || liveAI1Evaluation}
              onOpenNotebookModal={() => setIsNotebookModalOpen(true)}
              compact
            />

            {/* Plain Language Reasons */}
            <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 space-y-2.5 text-xs">
              <span className="font-bold text-rose-950 block">Signals detected:</span>
              <ul className="space-y-1.5 text-slate-700">
                {riskReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {scamDecision ? (
              <div className="space-y-3 pt-1">
                <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-700 font-medium leading-relaxed border border-slate-200">
                  {scamDecision}
                </div>
                {/* Back / Close Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowScamModal(false);
                    setScamDecision(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#0054A6] hover:bg-[#003f7a] text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Customer App</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] text-slate-500 font-medium text-center">
                  You have full control. Choose how you would like to proceed:
                </div>

                {/* Option 1: Verify */}
                <button
                  onClick={() => setScamDecision('Recipient verification requested. Please call the recipient directly to verify identity before re-attempting.')}
                  className="w-full flex items-center justify-center gap-2 bg-[#0054A6] hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-300" />
                  <span>Verify Recipient Identity</span>
                </button>

                {/* Option 2: Delay 24h */}
                <button
                  onClick={() => {
                    setScamDecision('Payment placed in 24-Hour Cooling-Off Hold. You can cancel anytime without moving funds.');
                    setTimeout(() => {
                      setShowScamModal(false);
                      setScamDecision(null);
                    }, 2500);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Delay Payment (24-Hour Cooling-Off Window)</span>
                </button>

                {/* Option 3: Continue at Own Risk */}
                <button
                  onClick={() => {
                    recordTransfer(Number(amount), recipient, riskScore, 'PROCEEDED');
                    setScamDecision('Customer chose to proceed at own risk. Action logged for compliance review.');
                    setTimeout(() => {
                      setShowScamModal(false);
                      setScamDecision(null);
                    }, 2000);
                  }}
                  className="w-full text-center text-slate-500 hover:text-slate-800 text-xs font-medium py-1.5 transition-colors cursor-pointer"
                >
                  Continue Anyway at My Own Risk
                </button>

                {/* Option 4: Cancel & Go Back */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScamModal(false);
                      setScamDecision(null);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Cancel Transfer & Go Back</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI-1 Model Architecture & Python Notebook Modal */}
      <AI1NotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
