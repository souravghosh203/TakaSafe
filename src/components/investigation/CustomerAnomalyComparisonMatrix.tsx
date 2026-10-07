import React, { useState } from 'react';
import { Transaction, CustomerBaseline } from '../../types';
import { maskPhoneInText } from '../../utils/maskSensitive';
import {
  TrendingUp,
  Clock,
  Smartphone,
  MapPin,
  UserX,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Zap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Table,
  Layers,
  ArrowRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';

interface CustomerAnomalyComparisonMatrixProps {
  transaction: Transaction;
  customerProfile: CustomerBaseline;
  lang?: 'EN' | 'BN';
}

type SeverityLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NORMAL';
type ViewMode = 'DUAL_CARDS' | 'TABLE';
type FilterMode = 'ALL' | 'ANOMALIES_ONLY' | 'CRITICAL_ONLY';

interface ComparisonDimension {
  id: string;
  titleEn: string;
  titleBn: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'FINANCIAL' | 'TEMPORAL' | 'TELEMETRY' | 'GEOSPATIAL' | 'NETWORK';
  historicalLabelEn: string;
  historicalLabelBn: string;
  historicalValue: string;
  historicalSubtextEn: string;
  historicalSubtextBn: string;
  currentLabelEn: string;
  currentLabelBn: string;
  currentValue: string;
  currentSubtextEn: string;
  currentSubtextBn: string;
  varianceLabelEn: string;
  varianceLabelBn: string;
  severity: SeverityLevel;
  isAnomaly: boolean;
  shapWeight: string;
  deviationPercent: number; // For progress/meter bar
  forensicNoteEn: string;
  forensicNoteBn: string;
}

export const CustomerAnomalyComparisonMatrix: React.FC<CustomerAnomalyComparisonMatrixProps> = ({
  transaction,
  customerProfile,
  lang = 'EN',
}) => {
  const isBn = lang === 'BN';
  const [viewMode, setViewMode] = useState<ViewMode>('DUAL_CARDS');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Computed metrics
  const amountRatio = transaction.amount / Math.max(1, customerProfile.avgAmount);
  const amountRatioFormatted = amountRatio >= 10 ? amountRatio.toFixed(1) : amountRatio.toFixed(2);
  const drainRatio = Math.min(100, Math.round(((transaction.amount + transaction.fee) / Math.max(1, customerProfile.balance)) * 100));

  const isKnownRecipient = customerProfile.frequentRecipients.some(
    (r) => r.includes(transaction.receiverWallet) || (transaction.receiverName && r.includes(transaction.receiverName))
  );

  const isKnownDevice = customerProfile.knownDevices.some(
    (d) => d.toLowerCase().includes(transaction.senderDevice.toLowerCase().slice(0, 8))
  );

  const dimensions: ComparisonDimension[] = [
    {
      id: 'amount',
      titleEn: 'Transaction Amount & Volume Surge',
      titleBn: 'লেনদেনের পরিমাণ ও অস্বাভাবিক বৃদ্ধি',
      icon: TrendingUp,
      category: 'FINANCIAL',
      historicalLabelEn: '90-Day Typical Baseline',
      historicalLabelBn: '৯০ দিনের স্বাভাবিক গড়',
      historicalValue: `৳${customerProfile.avgAmount.toLocaleString()}`,
      historicalSubtextEn: `Max typical single transfer: ৳${customerProfile.maxAmountTypical.toLocaleString()}`,
      historicalSubtextBn: `সর্বোচ্চ সাধারণ স্থানান্তর: ৳${customerProfile.maxAmountTypical.toLocaleString()}`,
      currentLabelEn: 'Attempted Outbound Transfer',
      currentLabelBn: 'বর্তমান স্থানান্তরের আবেদন',
      currentValue: `৳${transaction.amount.toLocaleString()}`,
      currentSubtextEn: `Fee: ৳${transaction.fee} · Channel: ${transaction.channel}`,
      currentSubtextBn: `ফি: ৳${transaction.fee} · মাধ্যম: ${transaction.channel}`,
      varianceLabelEn: `+${amountRatioFormatted}× Baseline Surge (+${Math.round((amountRatio - 1) * 100)}%)`,
      varianceLabelBn: `+${amountRatioFormatted} গুণ বৃদ্ধি (+${Math.round((amountRatio - 1) * 100)}%)`,
      severity: 'CRITICAL',
      isAnomaly: true,
      shapWeight: '+31%',
      deviationPercent: 100,
      forensicNoteEn:
        'Transfer exceeds customer 90-day typical average by over 50x. Breaches the 3-sigma percentile cutoff, triggering peak positive SHAP attribution in the XGBoost classification ensemble.',
      forensicNoteBn:
        'গ্রাহকের ৯০ দিনের স্বাভাবিক গড়ের তুলনায় ৫০ গুণেরও বেশি। ৩-সিগমা সীমা অতিক্রম করায় XGBoost ক্লাসিফায়ারে সর্বোচ্চ পজিটিভ SHAP স্কোর (+৩১%) সক্রিয় হয়েছে।',
    },
    {
      id: 'temporal',
      titleEn: 'Circadian Timing & Nocturnal Deviation',
      titleBn: 'লেনদেনের সময় ও নিশাচর বিচ্যুতি',
      icon: Clock,
      category: 'TEMPORAL',
      historicalLabelEn: 'Active Transacting Window',
      historicalLabelBn: 'স্বাভাবিক লেনদেনের সময়',
      historicalValue: customerProfile.usualHours,
      historicalSubtextEn: 'Daytime commercial & domestic activity (09:00 - 21:00 BST)',
      historicalSubtextBn: 'দিনের স্বাভাবিক বাণিজ্যিক ও পারিবারিক সময় (সকাল ৯ - রাত ৯)',
      currentLabelEn: 'Execution Timestamp',
      currentLabelBn: 'লেনদেন কার্যকরের সময়',
      currentValue: transaction.timestamp.includes(' ') ? `${transaction.timestamp.split(' ')[1]} BST` : transaction.timestamp,
      currentSubtextEn: '03:20 AM nocturnal window · 6h 20m outside habitual hours',
      currentSubtextBn: 'রাত ৩:২০ মিনিট · স্বাভাবিক সময়ের চেয়ে ৬ ঘণ্টা ২০ মিনিট বাইরে',
      varianceLabelEn: '6h 20m Circadian Out-of-Envelope Breach',
      varianceLabelBn: 'স্বাভাবিক দৈনিক সময়ের ৬ ঘণ্টা ২০ মিনিট বাইরে',
      severity: 'CRITICAL',
      isAnomaly: true,
      shapWeight: '+12%',
      deviationPercent: 88,
      forensicNoteEn:
        'Transaction initiated during circadian sleep hours (00:00–05:00 BST). 0 historically recorded logins at this nocturnal hour. High correlation with sleep-deprived extortion or unauthorized phone access.',
      forensicNoteBn:
        'রাত ১২টা থেকে ভোর ৫টার মধ্যে লেনদেন শুরু হয়েছে। পূর্বে এই সময়ে কোনো লগইন রেকর্ড নেই। এটি সাধারণত জোরপূর্বক ব্ল্যাকমেইল বা ফোন চুরির লক্ষণ।',
    },
    {
      id: 'device',
      titleEn: 'Hardware Fingerprint & IMEI Binding',
      titleBn: 'ডিভাইস ফিঙ্গারপ্রিন্ট ও আইএমইআই বাইন্ডিং',
      icon: Smartphone,
      category: 'TELEMETRY',
      historicalLabelEn: 'Primary Verified Smartphone',
      historicalLabelBn: 'প্রাথমিক যাচাইকৃত স্মার্টফোন',
      historicalValue: customerProfile.knownDevices[0] || 'Samsung Galaxy A54',
      historicalSubtextEn: 'Bound device token verified across 60+ consecutive sessions',
      historicalSubtextBn: '৬০টির বেশি ধারাবাহিক সেশনে যাচাইকৃত ডিভাইস টোকেন',
      currentLabelEn: 'Originating Client Device',
      currentLabelBn: 'বর্তমান লেনদেনের ক্লায়েন্ট ডিভাইস',
      currentValue: transaction.senderDevice,
      currentSubtextEn: 'Unbound hardware identifier · First-ever session from this device',
      currentSubtextBn: 'অপরিচিত হার্ডওয়্যার আইডি · এই ডিভাইস থেকে প্রথমবারের মতো লগইন',
      varianceLabelEn: 'Hardware Mismatch (Unregistered Terminal)',
      varianceLabelBn: 'ডিভাইস অসামঞ্জস্য (অনিবন্ধিত টার্মিনাল)',
      severity: 'HIGH',
      isAnomaly: !isKnownDevice,
      shapWeight: '+17%',
      deviationPercent: 78,
      forensicNoteEn:
        'New hardware signature detected without preceding multi-factor challenge. Hardware hash does not match stored cryptographic device key in the primary SIM profile.',
      forensicNoteBn:
        'নতুন হার্ডওয়্যার স্বাক্ষর শনাক্ত হয়েছে। মূল ডিভাইসের জন্য সংরক্ষিত ক্রিপ্টোগ্রাফিক কি-এর সাথে এই ডিভাইসের কোনো মিল নেই।',
    },
    {
      id: 'geospatial',
      titleEn: 'Geographic Location & IP Routing',
      titleBn: 'ভৌগোলিক অবস্থান ও আইপি রাউটিং',
      icon: MapPin,
      category: 'GEOSPATIAL',
      historicalLabelEn: 'Home Commercial District',
      historicalLabelBn: 'স্থায়ী বাসস্থান ও কর্মস্থল',
      historicalValue: customerProfile.homeDistrict,
      historicalSubtextEn: '98.4% of lifetime transactions originating from Dhaka division',
      historicalSubtextBn: 'জীবদ্দশায় ৯৮.৪% লেনদেন ঢাকা বিভাগ থেকে সম্পন্ন',
      currentLabelEn: 'Network Origin Location',
      currentLabelBn: 'বর্তমান নেটওয়ার্কের অবস্থান',
      currentValue: transaction.senderLocation,
      currentSubtextEn: 'Cellular ASN Jump to Chittagong · IP: 103.114.88.19',
      currentSubtextBn: 'চট্টগ্রাম সেলুলার এএসএন জাম্প · আইপি: 103.114.88.19',
      varianceLabelEn: '~240 km Geolocation Displacement Jump',
      varianceLabelBn: '~২৪০ কিমি দূরবর্তী ভৌগোলিক অবস্থান বিচ্যুতি',
      severity: 'HIGH',
      isAnomaly: true,
      shapWeight: '+9%',
      deviationPercent: 65,
      forensicNoteEn:
        'Geographic distance jump of over 240 km from the Dhanmondi home node within an impossible physical travel timeframe (< 45 minutes from previous local session).',
      forensicNoteBn:
        'ধানমন্ডি হোম নোড থেকে ২৪০ কিলোমিটারের বেশি ভৌগোলিক জাম্প, যা আগের লোকাল সেশনের সময়ের ব্যবধানের সাথে বাস্তবিকভাবে অসম্ভব।',
    },
    {
      id: 'recipient',
      titleEn: 'Counterparty Relationship & Mule Link',
      titleBn: 'প্রাপকের পূর্ব সম্পর্ক ও মিউল চক্র সংযোগ',
      icon: UserX,
      category: 'NETWORK',
      historicalLabelEn: 'Frequent Recipient Circle',
      historicalLabelBn: 'বিশ্বস্ত নিয়মিত প্রাপক তালিকা',
      historicalValue: customerProfile.frequentRecipients[0] || 'Family & Local Utilities',
      historicalSubtextEn: `${customerProfile.frequentRecipients.length} frequent trusted recipients recorded`,
      historicalSubtextBn: `${customerProfile.frequentRecipients.length} জন নিয়মিত ও বিশ্বস্ত প্রাপক রেকর্ডভুক্ত`,
      currentLabelEn: 'Designated Payee Target',
      currentLabelBn: 'বর্তমান প্রাপকের তথ্য',
      currentValue: `${transaction.receiverName} (${maskPhoneInText(transaction.receiverWallet)})`,
      currentSubtextEn: transaction.isMuleConnected
        ? 'Flagged Node W302 in Mule Syndicate #17 · Immediate OTC cash-out hop'
        : 'First-time payee with zero transacting history',
      currentSubtextBn: transaction.isMuleConnected
        ? 'মিউল সিন্ডিকেট #১৭-এর নোড W302 হিসেবে চিহ্নিত · দ্রুত ক্যাশআউট চক্র'
        : 'কোনো পূর্ববর্তী লেনদেনের ইতিহাস নেই এমন নতুন প্রাপক',
      varianceLabelEn: transaction.isMuleConnected ? 'CRITICAL: Linked to Mule Syndicate #17' : 'First-Time Unfamiliar Recipient',
      varianceLabelBn: transaction.isMuleConnected ? 'মারাত্মক: মিউল সিন্ডিকেট #১৭-এর সাথে যুক্ত' : 'প্রথমবারের মতো অপরিচিত প্রাপক',
      severity: transaction.isMuleConnected ? 'CRITICAL' : 'ELEVATED',
      isAnomaly: !isKnownRecipient,
      shapWeight: '+7%',
      deviationPercent: transaction.isMuleConnected ? 95 : 55,
      forensicNoteEn:
        'Recipient wallet (01988-510294) has a Mule Centrality Index of 0.89 and is identified as an aggregator node W302 in syndicate ring #17. Outflow velocity is under 3 minutes to rural agents.',
      forensicNoteBn:
        'প্রাপক ওয়ালেটটির মিউল সেন্ট্রালিটি সূচক ০.৮৯ এবং এটি সিন্ডিকেট রিং #১৭-এর নোড W302। এই ওয়ালেটে টাকা ঢোকার ৩ মিনিটের মধ্যেই এজেন্টের মাধ্যমে ক্যাশআউট হয়ে যায়।',
    },
    {
      id: 'velocity',
      titleEn: 'Transaction Velocity & Burst Cadence',
      titleBn: 'লেনদেনের গতি ও অস্বাভাবিক বিস্ফোরণ',
      icon: Activity,
      category: 'FINANCIAL',
      historicalLabelEn: 'Daily Transfer Cadence',
      historicalLabelBn: 'দৈনিক স্বাভাবিক লেনদেনের হার',
      historicalValue: `${customerProfile.avgDailyTxns} Transfers / Day`,
      historicalSubtextEn: 'Evenly distributed velocity: ~1 transaction every 6.3 hours',
      historicalSubtextBn: 'স্বাভাবিক ব্যবধান: গড়ে প্রতি ৬.৩ ঘণ্টায় ১টি লেনদেন',
      currentLabelEn: 'Preceding 10m Velocity Burst',
      currentLabelBn: 'বিগত ১০ মিনিটের লেনদেন স্পাইক',
      currentValue: '6 Transfers in 8 Minutes',
      currentSubtextEn: 'Rapid sequential attempt burst · Escalating amount increments',
      currentSubtextBn: '৮ মিনিটে ৬টি দ্রুত লেনদেন প্রচেষ্টা · ক্রমবর্ধমান টাকার পরিমাণ',
      varianceLabelEn: '+15.8× Burst Acceleration Spike',
      varianceLabelBn: '+১৫.৮ গুণ দ্রুতগতির লেনদেন বিস্ফোরণ',
      severity: 'HIGH',
      isAnomaly: true,
      shapWeight: '+24%',
      deviationPercent: 82,
      forensicNoteEn:
        'Six outbound payments triggered within an 8-minute burst envelope. Velocity multiplier exceeds the normal profile by 1,580%, typical of automated script draining or panic-induced coercive transfers.',
      forensicNoteBn:
        '৮ মিনিটের ব্যবধানে ৬টি বহির্গামী পেমেন্ট। লেনদেনের গতি স্বাভাবিকের চেয়ে ১,৫৮০% বেশি, যা সাধারণত স্ক্রিপ্ট ড্রেইনিং বা আতঙ্কের মুখে দ্রুত টাকা পাঠানোর ক্ষেত্রে দেখা যায়।',
    },
    {
      id: 'liquidity_drain',
      titleEn: 'Wallet Liquidity & Account Drain Ratio',
      titleBn: 'ওয়ালেট ব্যালেন্স ক্ষয় ও তহবিলের অনুপাত',
      icon: Scale,
      category: 'FINANCIAL',
      historicalLabelEn: 'Stored Liquid Balance & Buffer',
      historicalLabelBn: 'মোট সংরক্ষিত ব্যালেন্স ও নিরাপত্তা কুশন',
      historicalValue: `৳${customerProfile.balance.toLocaleString()}`,
      historicalSubtextEn: `Resilience Buffer: ${customerProfile.resilienceComponents?.emergencyBufferDays || 45} Days Emergency Runway`,
      historicalSubtextBn: `স্থিতিস্থাপকতা: ${customerProfile.resilienceComponents?.emergencyBufferDays || 45} দিনের জরুরি ব্যালেন্স`,
      currentLabelEn: 'Immediate Wallet Debit Outflow',
      currentLabelBn: 'তাৎক্ষণিক ওয়ালেট ডেবিট প্রভাব',
      currentValue: `৳${(transaction.amount + transaction.fee).toLocaleString()}`,
      currentSubtextEn: `${drainRatio}% of entire liquid savings liquidated in single action`,
      currentSubtextBn: 'একক লেনদেনেই মোট জমার ৮৫% টাকা একবারে শেষ',
      varianceLabelEn: `${drainRatio}% Total Savings Liquidation Drain`,
      varianceLabelBn: `${drainRatio}% মোট সঞ্চয় তুলে নেওয়ার অস্বাভাবিক চাপ`,
      severity: 'CRITICAL',
      isAnomaly: drainRatio >= 50,
      shapWeight: '+18%',
      deviationPercent: drainRatio,
      forensicNoteEn:
        'Single transfer request liquidates 84.8% of customer total available funds. Destroys the customer 45-day emergency resilience runway down to under 5 days in a single stroke.',
      forensicNoteBn:
        'একক লেনদেনেই গ্রাহকের মোট পাওয়া ব্যালেন্সের ৮৪.৮% শেষ হয়ে যাচ্ছে। গ্রাহকের ৪৫ দিনের জরুরি আর্থিক সুরক্ষা এক নিমিষেই ৫ দিনের নিচে নেমে যায়।',
    },
  ];

  // Filtering
  const filteredDimensions = dimensions.filter((d) => {
    if (filterMode === 'ANOMALIES_ONLY') return d.isAnomaly;
    if (filterMode === 'CRITICAL_ONLY') return d.severity === 'CRITICAL';
    return true;
  });

  const totalAnomalies = dimensions.filter((d) => d.isAnomaly).length;
  const criticalCount = dimensions.filter((d) => d.severity === 'CRITICAL').length;
  const highCount = dimensions.filter((d) => d.severity === 'HIGH').length;

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300',
          dot: 'bg-rose-600',
          label: isBn ? 'মারাত্মক অসঙ্গতি' : 'CRITICAL ANOMALY',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300',
          dot: 'bg-amber-500',
          label: isBn ? 'উচ্চ বিচ্যুতি' : 'HIGH DEVIATION',
        };
      case 'ELEVATED':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300',
          dot: 'bg-blue-500',
          label: isBn ? 'সতর্কতা স্তর' : 'ELEVATED',
        };
      default:
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
          dot: 'bg-emerald-500',
          label: isBn ? 'স্বাভাবিক' : 'NORMAL',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Anomaly Summary Scorecard */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B1D37] to-[#003875] text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              {isBn ? 'আচরণগত অসঙ্গতি শনাক্ত' : 'ANOMALOUS PATTERN IDENTIFIED'}
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              {isBn ? 'মডেল: আইসোলেশন ফরেস্ট + XGBoost' : 'Model: Isolation Forest + XGBoost'}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
            {isBn
              ? 'গ্রাহকের ঐতিহাসিক গড় বনাম বর্তমান সন্দেহজনক লেনদেনের তুলনামূলক বিশ্লেষণ'
              : 'Historical Baseline vs. Suspicious Transaction Side-by-Side Comparison'}
          </h4>
          <p className="text-[11px] text-slate-300 max-w-2xl">
            {isBn
              ? `গ্রাহক ${customerProfile.name}-এর স্বাভাবিক আচরণগত ফ্রেমওয়ার্কের সাথে বর্তমান ট্রানজ্যাকশন তুলনা করে ৭টি মাত্রার মধ্যে ${totalAnomalies}টিতে মারাত্মক বা উচ্চ বিচ্যুতি পাওয়া গেছে।`
              : `Comparing current transfer parameters against ${customerProfile.name}'s learned 90-day behavioral baseline across 7 core forensic vectors. ${totalAnomalies} of 7 dimensions exhibit abnormal divergence.`}
          </p>
        </div>

        {/* Quick Stat Chips */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
              {isBn ? 'মোট অসঙ্গতি' : 'Anomalies'}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-rose-400">
              {totalAnomalies}<span className="text-xs text-slate-400">/7</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
              {isBn ? 'মারাত্মক ঝুঁকি' : 'Critical'}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
              {criticalCount}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
              {isBn ? 'সর্বোচ্চ স্পাইক' : 'Max Surge'}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#FAB915]">
              {amountRatioFormatted}×
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: View Toggle & Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isBn ? 'ফিল্টার:' : 'Filter:'}
          </span>
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-[#0054A6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {isBn ? 'সকল মাত্রা (৭)' : 'All Metrics (7)'}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('ANOMALIES_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'ANOMALIES_ONLY'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {isBn ? `শুধুমাত্র অসঙ্গতি (${totalAnomalies})` : `Anomalies Only (${totalAnomalies})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('CRITICAL_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'CRITICAL_ONLY'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {isBn ? `মারাত্মক বিচ্যুতি (${criticalCount})` : `Critical Only (${criticalCount})`}
          </button>
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode('DUAL_CARDS')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'DUAL_CARDS'
                ? 'bg-[#0054A6] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isBn ? 'পাশাপাশি কার্ড ভিউ' : 'Side-by-Side'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'TABLE'
                ? 'bg-[#0054A6] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{isBn ? 'তুলনামূলক টেবিল' : 'Matrix Table'}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Dual Cards / Synchronized Comparative Rows */}
      {viewMode === 'DUAL_CARDS' && (
        <div className="space-y-3">
          {filteredDimensions.map((dim) => {
            const Icon = dim.icon;
            const badge = getSeverityBadge(dim.severity);
            const isExpanded = expandedRow === dim.id;

            return (
              <div
                key={dim.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  dim.isAnomaly
                    ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Metric Header Strip */}
                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        dim.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                          : dim.severity === 'HIGH'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-100 dark:bg-blue-950/80 text-[#0054A6] dark:text-blue-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {isBn ? dim.titleBn : dim.titleEn}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* SHAP Weight Chip */}
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                      SHAP {dim.shapWeight}
                    </span>

                    {/* Severity Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>

                    {/* Expand/Collapse Forensic Details */}
                    <button
                      type="button"
                      onClick={() => setExpandedRow(isExpanded ? null : dim.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isBn ? 'বিশদ তথ্য দেখুন' : 'Toggle Forensic Rationale'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Comparison Body */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                  {/* Left: Customer Historical Pattern (5 cols) */}
                  <div className="md:col-span-5 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        {isBn ? dim.historicalLabelBn : dim.historicalLabelEn}
                      </span>
                      <span className="text-[10px] text-blue-700/80 dark:text-blue-400 font-medium">
                        {isBn ? 'স্বাভাবিক ধারা' : 'Normal Envelope'}
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-slate-800 dark:text-slate-100">
                      {dim.historicalValue}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                      {isBn ? dim.historicalSubtextBn : dim.historicalSubtextEn}
                    </p>
                  </div>

                  {/* Center: Variance & Deviation Arrow (2 cols) */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-1">
                    <div className="hidden md:flex w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 mb-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md leading-tight block font-mono ${
                        dim.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : dim.severity === 'HIGH'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isBn ? dim.varianceLabelBn : dim.varianceLabelEn}
                    </span>
                    {/* Deviation Meter Bar */}
                    <div className="w-full max-w-[100px] bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          dim.severity === 'CRITICAL'
                            ? 'bg-rose-600'
                            : dim.severity === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${dim.deviationPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Current Suspicious Transaction (5 cols) */}
                  <div
                    className={`md:col-span-5 p-3.5 rounded-xl border relative ${
                      dim.isAnomaly
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        {isBn ? dim.currentLabelBn : dim.currentLabelEn}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400">
                        {isBn ? 'সন্দেহজনক ফ্ল্যাগ' : 'FLAGGED EVENT'}
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black font-mono text-rose-700 dark:text-rose-300">
                      {dim.currentValue}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-tight">
                      {isBn ? dim.currentSubtextBn : dim.currentSubtextEn}
                    </p>
                  </div>
                </div>

                {/* Expandable Forensic Rationale Drawer */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                        {isBn ? 'ফরেনসিক বিশ্লেষণ ও মডেল যুক্তি:' : 'Forensic Investigation & ML Attribution Rationale:'}
                      </span>
                      <p className="leading-relaxed">
                        {isBn ? dim.forensicNoteBn : dim.forensicNoteEn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: Comprehensive Comparative Matrix Table */}
      {viewMode === 'TABLE' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5">{isBn ? 'মাত্রা / প্যারামিটার' : 'Forensic Metric'}</th>
                <th className="py-3 px-3.5 bg-blue-50/50 dark:bg-blue-950/20">{isBn ? 'গ্রাহকের ঐতিহাসিক গড়' : 'Customer 90D Baseline'}</th>
                <th className="py-3 px-3.5 bg-rose-50/50 dark:bg-rose-950/20">{isBn ? 'বর্তমান সন্দেহজনক লেনদেন' : 'Current Flagged Event'}</th>
                <th className="py-3 px-3.5">{isBn ? 'বিচ্যুতি / পার্থক্য' : 'Variance / Delta'}</th>
                <th className="py-3 px-3.5 text-center">{isBn ? 'ঝুঁকি স্তর' : 'Severity'}</th>
                <th className="py-3 px-3.5 text-right">{isBn ? 'SHAP প্রভাব' : 'SHAP Weight'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredDimensions.map((dim) => {
                const Icon = dim.icon;
                const badge = getSeverityBadge(dim.severity);

                return (
                  <tr
                    key={dim.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      dim.isAnomaly ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    {/* Dimension Name */}
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            dim.severity === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="block font-bold">{isBn ? dim.titleBn : dim.titleEn}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{dim.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Historical Baseline */}
                    <td className="py-3 px-3.5 bg-blue-50/30 dark:bg-blue-950/10">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {dim.historicalValue}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isBn ? dim.historicalSubtextBn : dim.historicalSubtextEn}
                      </div>
                    </td>

                    {/* Current Event */}
                    <td className="py-3 px-3.5 bg-rose-50/30 dark:bg-rose-950/10">
                      <div className="font-mono font-black text-rose-700 dark:text-rose-300">
                        {dim.currentValue}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">
                        {isBn ? dim.currentSubtextBn : dim.currentSubtextEn}
                      </div>
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md inline-block ${
                          dim.severity === 'CRITICAL'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : dim.severity === 'HIGH'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isBn ? dim.varianceLabelBn : dim.varianceLabelEn}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>

                    {/* SHAP Weight */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {dim.shapWeight}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
