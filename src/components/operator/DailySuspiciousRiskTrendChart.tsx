import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Download,
  Filter,
  Layers,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
  Info,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Transaction } from '../../types';

export interface DailyRiskDataPoint {
  day: number;
  date: string;
  fullDate: string;
  totalTxns: number;
  suspiciousTxns: number;
  suspiciousAmount: number; // in BDT ৳
  preventedLoss: number; // in BDT ৳
  avgRiskScore: number; // 0 - 100
  p90RiskScore: number; // 90th percentile
  maxRiskScore: number;
  movingAvg7D: number;
  // Risk tier counts
  lowCount: number; // 0-29
  mediumCount: number; // 30-59
  highCount: number; // 60-79
  criticalCount: number; // 80-100
  // Distribution percentages (0 - 100%)
  lowPct: number;
  mediumPct: number;
  highPct: number;
  criticalPct: number;
  // Threat Vector / Incident Tag
  incident?: string;
  threatLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export interface ScoreHistogramBin {
  bracket: string;
  rangeMin: number;
  rangeMax: number;
  count: number;
  percentage: number;
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// 30-Day Historical Baseline Data (Simulating the last 30 continuous calendar days)
const RAW_30_DAY_DATA: DailyRiskDataPoint[] = [
  {
    day: 1, date: 'Sep 06', fullDate: '06 Sep 2026', totalTxns: 3200, suspiciousTxns: 78,
    suspiciousAmount: 1120000, preventedLoss: 890000, avgRiskScore: 34.2, p90RiskScore: 58, maxRiskScore: 76, movingAvg7D: 34.2,
    lowCount: 2840, mediumCount: 282, highCount: 56, criticalCount: 22, lowPct: 88.8, mediumPct: 8.8, highPct: 1.7, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 2, date: 'Sep 07', fullDate: '07 Sep 2026', totalTxns: 3450, suspiciousTxns: 84,
    suspiciousAmount: 1240000, preventedLoss: 980000, avgRiskScore: 36.1, p90RiskScore: 61, maxRiskScore: 79, movingAvg7D: 35.1,
    lowCount: 3040, mediumCount: 326, highCount: 61, criticalCount: 23, lowPct: 88.1, mediumPct: 9.5, highPct: 1.8, criticalPct: 0.6,
    threatLevel: 'NORMAL',
  },
  {
    day: 3, date: 'Sep 08', fullDate: '08 Sep 2026', totalTxns: 3620, suspiciousTxns: 92,
    suspiciousAmount: 1390000, preventedLoss: 1110000, avgRiskScore: 38.5, p90RiskScore: 64, maxRiskScore: 82, movingAvg7D: 36.3,
    lowCount: 3160, mediumCount: 368, highCount: 65, criticalCount: 27, lowPct: 87.3, mediumPct: 10.2, highPct: 1.8, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 4, date: 'Sep 09', fullDate: '09 Sep 2026', totalTxns: 3390, suspiciousTxns: 81,
    suspiciousAmount: 1180000, preventedLoss: 940000, avgRiskScore: 35.8, p90RiskScore: 59, maxRiskScore: 78, movingAvg7D: 36.1,
    lowCount: 2980, mediumCount: 329, highCount: 59, criticalCount: 22, lowPct: 87.9, mediumPct: 9.7, highPct: 1.7, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 5, date: 'Sep 10', fullDate: '10 Sep 2026', totalTxns: 3850, suspiciousTxns: 116,
    suspiciousAmount: 1820000, preventedLoss: 1460000, avgRiskScore: 44.2, p90RiskScore: 72, maxRiskScore: 88, movingAvg7D: 37.8,
    lowCount: 3310, mediumCount: 424, highCount: 82, criticalCount: 34, lowPct: 86.0, mediumPct: 11.0, highPct: 2.1, criticalPct: 0.9,
    incident: 'Weekend Nocturnal ATM Cash-Out Probe', threatLevel: 'ELEVATED',
  },
  {
    day: 6, date: 'Sep 11', fullDate: '11 Sep 2026', totalTxns: 4100, suspiciousTxns: 142,
    suspiciousAmount: 2310000, preventedLoss: 1880000, avgRiskScore: 49.6, p90RiskScore: 78, maxRiskScore: 91, movingAvg7D: 39.7,
    lowCount: 3480, mediumCount: 478, highCount: 98, criticalCount: 44, lowPct: 84.9, mediumPct: 11.7, highPct: 2.4, criticalPct: 1.0,
    incident: 'Nocturnal Device Hijack Blitz (Barishal)', threatLevel: 'HIGH',
  },
  {
    day: 7, date: 'Sep 12', fullDate: '12 Sep 2026', totalTxns: 3950, suspiciousTxns: 128,
    suspiciousAmount: 2040000, preventedLoss: 1620000, avgRiskScore: 45.4, p90RiskScore: 74, maxRiskScore: 89, movingAvg7D: 40.5,
    lowCount: 3380, mediumCount: 442, highCount: 88, criticalCount: 40, lowPct: 85.6, mediumPct: 11.2, highPct: 2.2, criticalPct: 1.0,
    threatLevel: 'ELEVATED',
  },
  {
    day: 8, date: 'Sep 13', fullDate: '13 Sep 2026', totalTxns: 3510, suspiciousTxns: 94,
    suspiciousAmount: 1410000, preventedLoss: 1150000, avgRiskScore: 37.9, p90RiskScore: 62, maxRiskScore: 81, movingAvg7D: 41.1,
    lowCount: 3080, mediumCount: 336, highCount: 68, criticalCount: 26, lowPct: 87.8, mediumPct: 9.6, highPct: 1.9, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 9, date: 'Sep 14', fullDate: '14 Sep 2026', totalTxns: 3480, suspiciousTxns: 88,
    suspiciousAmount: 1320000, preventedLoss: 1040000, avgRiskScore: 36.4, p90RiskScore: 60, maxRiskScore: 78, movingAvg7D: 41.1,
    lowCount: 3070, mediumCount: 322, highCount: 64, criticalCount: 24, lowPct: 88.2, mediumPct: 9.3, highPct: 1.8, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 10, date: 'Sep 15', fullDate: '15 Sep 2026', totalTxns: 3600, suspiciousTxns: 96,
    suspiciousAmount: 1450000, preventedLoss: 1190000, avgRiskScore: 38.7, p90RiskScore: 63, maxRiskScore: 83, movingAvg7D: 41.1,
    lowCount: 3160, mediumCount: 344, highCount: 71, criticalCount: 25, lowPct: 87.8, mediumPct: 9.6, highPct: 2.0, criticalPct: 0.6,
    threatLevel: 'NORMAL',
  },
  {
    day: 11, date: 'Sep 16', fullDate: '16 Sep 2026', totalTxns: 3740, suspiciousTxns: 108,
    suspiciousAmount: 1680000, preventedLoss: 1380000, avgRiskScore: 41.3, p90RiskScore: 67, maxRiskScore: 85, movingAvg7D: 41.9,
    lowCount: 3250, mediumCount: 382, highCount: 79, criticalCount: 29, lowPct: 86.9, mediumPct: 10.2, highPct: 2.1, criticalPct: 0.8,
    threatLevel: 'NORMAL',
  },
  {
    day: 12, date: 'Sep 17', fullDate: '17 Sep 2026', totalTxns: 4200, suspiciousTxns: 154,
    suspiciousAmount: 2620000, preventedLoss: 2150000, avgRiskScore: 52.8, p90RiskScore: 81, maxRiskScore: 93, movingAvg7D: 43.1,
    lowCount: 3510, mediumCount: 536, highCount: 106, criticalCount: 48, lowPct: 83.6, mediumPct: 12.8, highPct: 2.5, criticalPct: 1.1,
    incident: 'Fake Relief Fund Phishing (Sylhet Basin)', threatLevel: 'HIGH',
  },
  {
    day: 13, date: 'Sep 18', fullDate: '18 Sep 2026', totalTxns: 4450, suspiciousTxns: 182,
    suspiciousAmount: 3120000, preventedLoss: 2580000, avgRiskScore: 58.4, p90RiskScore: 86, maxRiskScore: 95, movingAvg7D: 44.4,
    lowCount: 3650, mediumCount: 618, highCount: 124, criticalCount: 58, lowPct: 82.0, mediumPct: 13.9, highPct: 2.8, criticalPct: 1.3,
    incident: 'SIM Swap Burst Attack', threatLevel: 'HIGH',
  },
  {
    day: 14, date: 'Sep 19', fullDate: '19 Sep 2026', totalTxns: 4300, suspiciousTxns: 165,
    suspiciousAmount: 2850000, preventedLoss: 2360000, avgRiskScore: 55.1, p90RiskScore: 83, maxRiskScore: 94, movingAvg7D: 45.8,
    lowCount: 3560, mediumCount: 575, highCount: 114, criticalCount: 51, lowPct: 82.8, mediumPct: 13.4, highPct: 2.7, criticalPct: 1.1,
    threatLevel: 'HIGH',
  },
  {
    day: 15, date: 'Sep 20', fullDate: '20 Sep 2026', totalTxns: 3800, suspiciousTxns: 118,
    suspiciousAmount: 1860000, preventedLoss: 1540000, avgRiskScore: 43.6, p90RiskScore: 71, maxRiskScore: 86, movingAvg7D: 46.6,
    lowCount: 3260, mediumCount: 422, highCount: 84, criticalCount: 34, lowPct: 85.8, mediumPct: 11.1, highPct: 2.2, criticalPct: 0.9,
    threatLevel: 'ELEVATED',
  },
  {
    day: 16, date: 'Sep 21', fullDate: '21 Sep 2026', totalTxns: 4600, suspiciousTxns: 215,
    suspiciousAmount: 3790000, preventedLoss: 3190000, avgRiskScore: 66.8, p90RiskScore: 91, maxRiskScore: 97, movingAvg7D: 51.0,
    lowCount: 3680, mediumCount: 705, highCount: 145, criticalCount: 70, lowPct: 80.0, mediumPct: 15.3, highPct: 3.2, criticalPct: 1.5,
    incident: 'Cyclone Coastal Disruption - Mule Ring Surge', threatLevel: 'CRITICAL',
  },
  {
    day: 17, date: 'Sep 22', fullDate: '22 Sep 2026', totalTxns: 4950, suspiciousTxns: 268,
    suspiciousAmount: 4680000, preventedLoss: 3980000, avgRiskScore: 74.3, p90RiskScore: 95, maxRiskScore: 99, movingAvg7D: 56.1,
    lowCount: 3820, mediumCount: 862, highCount: 178, criticalCount: 90, lowPct: 77.2, mediumPct: 17.4, highPct: 3.6, criticalPct: 1.8,
    incident: 'PEAK ATTACK: Network #17 Mule Ring Smurfing (৳ 4.68M)', threatLevel: 'CRITICAL',
  },
  {
    day: 18, date: 'Sep 23', fullDate: '23 Sep 2026', totalTxns: 4720, suspiciousTxns: 232,
    suspiciousAmount: 4120000, preventedLoss: 3510000, avgRiskScore: 69.5, p90RiskScore: 92, maxRiskScore: 98, movingAvg7D: 60.1,
    lowCount: 3720, mediumCount: 768, highCount: 156, criticalCount: 76, lowPct: 78.8, mediumPct: 16.3, highPct: 3.3, criticalPct: 1.6,
    incident: 'Emergency Cool-Off Enforcement Activated', threatLevel: 'CRITICAL',
  },
  {
    day: 19, date: 'Sep 24', fullDate: '24 Sep 2026', totalTxns: 4150, suspiciousTxns: 158,
    suspiciousAmount: 2640000, preventedLoss: 2210000, avgRiskScore: 54.2, p90RiskScore: 79, maxRiskScore: 92, movingAvg7D: 60.3,
    lowCount: 3440, mediumCount: 552, highCount: 110, criticalCount: 48, lowPct: 82.9, mediumPct: 13.3, highPct: 2.7, criticalPct: 1.1,
    threatLevel: 'HIGH',
  },
  {
    day: 20, date: 'Sep 25', fullDate: '25 Sep 2026', totalTxns: 3750, suspiciousTxns: 112,
    suspiciousAmount: 1810000, preventedLoss: 1480000, avgRiskScore: 42.1, p90RiskScore: 68, maxRiskScore: 85, movingAvg7D: 58.0,
    lowCount: 3240, mediumCount: 398, highCount: 80, criticalCount: 32, lowPct: 86.4, mediumPct: 10.6, highPct: 2.1, criticalPct: 0.9,
    threatLevel: 'ELEVATED',
  },
  {
    day: 21, date: 'Sep 26', fullDate: '26 Sep 2026', totalTxns: 3600, suspiciousTxns: 98,
    suspiciousAmount: 1510000, preventedLoss: 1220000, avgRiskScore: 39.4, p90RiskScore: 64, maxRiskScore: 82, movingAvg7D: 55.7,
    lowCount: 3140, mediumCount: 362, highCount: 72, criticalCount: 26, lowPct: 87.2, mediumPct: 10.1, highPct: 2.0, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 22, date: 'Sep 27', fullDate: '27 Sep 2026', totalTxns: 3520, suspiciousTxns: 91,
    suspiciousAmount: 1390000, preventedLoss: 1120000, avgRiskScore: 37.8, p90RiskScore: 62, maxRiskScore: 80, movingAvg7D: 54.9,
    lowCount: 3080, mediumCount: 349, highCount: 67, criticalCount: 24, lowPct: 87.5, mediumPct: 9.9, highPct: 1.9, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 23, date: 'Sep 28', fullDate: '28 Sep 2026', totalTxns: 3680, suspiciousTxns: 104,
    suspiciousAmount: 1620000, preventedLoss: 1320000, avgRiskScore: 40.5, p90RiskScore: 66, maxRiskScore: 84, movingAvg7D: 50.1,
    lowCount: 3210, mediumCount: 366, highCount: 76, criticalCount: 28, lowPct: 87.2, mediumPct: 9.9, highPct: 2.1, criticalPct: 0.8,
    threatLevel: 'NORMAL',
  },
  {
    day: 24, date: 'Sep 29', fullDate: '29 Sep 2026', totalTxns: 3820, suspiciousTxns: 119,
    suspiciousAmount: 1890000, preventedLoss: 1540000, avgRiskScore: 43.8, p90RiskScore: 71, maxRiskScore: 87, movingAvg7D: 46.8,
    lowCount: 3310, mediumCount: 401, highCount: 84, criticalCount: 35, lowPct: 86.6, mediumPct: 10.5, highPct: 2.2, criticalPct: 0.9,
    threatLevel: 'ELEVATED',
  },
  {
    day: 25, date: 'Sep 30', fullDate: '30 Sep 2026', totalTxns: 4120, suspiciousTxns: 148,
    suspiciousAmount: 2450000, preventedLoss: 2010000, avgRiskScore: 48.9, p90RiskScore: 77, maxRiskScore: 90, movingAvg7D: 43.8,
    lowCount: 3520, mediumCount: 452, highCount: 104, criticalCount: 44, lowPct: 85.4, mediumPct: 11.0, highPct: 2.5, criticalPct: 1.1,
    incident: 'Month-End Salary Dispersal Spoofing Attempt', threatLevel: 'ELEVATED',
  },
  {
    day: 26, date: 'Oct 01', fullDate: '01 Oct 2026', totalTxns: 4250, suspiciousTxns: 162,
    suspiciousAmount: 2710000, preventedLoss: 2240000, avgRiskScore: 51.4, p90RiskScore: 80, maxRiskScore: 92, movingAvg7D: 43.4,
    lowCount: 3610, mediumCount: 478, highCount: 114, criticalCount: 48, lowPct: 84.9, mediumPct: 11.2, highPct: 2.7, criticalPct: 1.1,
    incident: 'Multi-Account Splitting at Agent Nodes', threatLevel: 'HIGH',
  },
  {
    day: 27, date: 'Oct 02', fullDate: '02 Oct 2026', totalTxns: 3900, suspiciousTxns: 125,
    suspiciousAmount: 1980000, preventedLoss: 1610000, avgRiskScore: 44.7, p90RiskScore: 73, maxRiskScore: 88, movingAvg7D: 43.8,
    lowCount: 3380, mediumCount: 395, highCount: 89, criticalCount: 36, lowPct: 86.7, mediumPct: 10.1, highPct: 2.3, criticalPct: 0.9,
    threatLevel: 'ELEVATED',
  },
  {
    day: 28, date: 'Oct 03', fullDate: '03 Oct 2026', totalTxns: 3720, suspiciousTxns: 106,
    suspiciousAmount: 1650000, preventedLoss: 1350000, avgRiskScore: 41.2, p90RiskScore: 68, maxRiskScore: 85, movingAvg7D: 44.1,
    lowCount: 3240, mediumCount: 374, highCount: 78, criticalCount: 28, lowPct: 87.1, mediumPct: 10.1, highPct: 2.1, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 29, date: 'Oct 04', fullDate: '04 Oct 2026', totalTxns: 3650, suspiciousTxns: 99,
    suspiciousAmount: 1540000, preventedLoss: 1260000, avgRiskScore: 39.8, p90RiskScore: 65, maxRiskScore: 83, movingAvg7D: 44.3,
    lowCount: 3180, mediumCount: 371, highCount: 73, criticalCount: 26, lowPct: 87.1, mediumPct: 10.2, highPct: 2.0, criticalPct: 0.7,
    threatLevel: 'NORMAL',
  },
  {
    day: 30, date: 'Oct 05', fullDate: '05 Oct 2026 (Today)', totalTxns: 3820, suspiciousTxns: 114,
    suspiciousAmount: 1850000, preventedLoss: 1520000, avgRiskScore: 42.6, p90RiskScore: 70, maxRiskScore: 86, movingAvg7D: 44.6,
    lowCount: 3320, mediumCount: 386, highCount: 82, criticalCount: 32, lowPct: 86.9, mediumPct: 10.1, highPct: 2.1, criticalPct: 0.8,
    threatLevel: 'NORMAL',
  },
];

// Aggregate 30-Day Risk Score Histogram across 10 bins (0-10, 10-20, ... 90-100)
const AGGREGATE_SCORE_HISTOGRAM: ScoreHistogramBin[] = [
  { bracket: '0–10', rangeMin: 0, rangeMax: 10, count: 18450, percentage: 16.2, tier: 'LOW' },
  { bracket: '10–20', rangeMin: 10, rangeMax: 20, count: 34200, percentage: 30.0, tier: 'LOW' },
  { bracket: '20–30', rangeMin: 20, rangeMax: 30, count: 28600, percentage: 25.1, tier: 'LOW' },
  { bracket: '30–40', rangeMin: 30, rangeMax: 40, count: 14120, percentage: 12.4, tier: 'MEDIUM' },
  { bracket: '40–50', rangeMin: 40, rangeMax: 50, count: 8240, percentage: 7.2, tier: 'MEDIUM' },
  { bracket: '50–60', rangeMin: 50, rangeMax: 60, count: 4890, percentage: 4.3, tier: 'MEDIUM' },
  { bracket: '60–70', rangeMin: 60, rangeMax: 70, count: 2760, percentage: 2.4, tier: 'HIGH' },
  { bracket: '70–80', rangeMin: 70, rangeMax: 80, count: 1540, percentage: 1.4, tier: 'HIGH' },
  { bracket: '80–90', rangeMin: 80, rangeMax: 90, count: 890, percentage: 0.8, tier: 'CRITICAL' },
  { bracket: '90–100', rangeMin: 90, rangeMax: 100, count: 380, percentage: 0.3, tier: 'CRITICAL' },
];

interface DailySuspiciousRiskTrendChartProps {
  transactions?: Transaction[];
  lang?: 'EN' | 'BN';
}

export const DailySuspiciousRiskTrendChart: React.FC<DailySuspiciousRiskTrendChartProps> = ({
  transactions = [],
  lang = 'EN',
}) => {
  const isBn = lang === 'BN';

  // State controls
  const [timeWindow, setTimeWindow] = useState<'30D' | '14D' | '7D'>('30D');
  const [activeTab, setActiveTab] = useState<'TREND' | 'TIERS' | 'HISTOGRAM'>('TREND');
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRiskScore, setShowRiskScore] = useState<boolean>(true);
  const [showMovingAvg, setShowMovingAvg] = useState<boolean>(true);
  const [showIncidentMarkers, setShowIncidentMarkers] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<DailyRiskDataPoint | null>(RAW_30_DAY_DATA[RAW_30_DAY_DATA.length - 1]);

  // Adjust today's (Day 30) data if there are active transactions in memory
  const dynamic30DayData = useMemo(() => {
    const data = [...RAW_30_DAY_DATA];
    if (transactions && transactions.length > 0) {
      const liveSuspicious = transactions.filter((t) => t.fusedRiskScore >= 50 || t.riskBand === 'CRITICAL' || t.riskBand === 'HIGH');
      const liveCritical = transactions.filter((t) => t.fusedRiskScore >= 80 || t.riskBand === 'CRITICAL');
      const liveHigh = transactions.filter((t) => t.fusedRiskScore >= 60 && t.fusedRiskScore < 80);
      const liveMedium = transactions.filter((t) => t.fusedRiskScore >= 30 && t.fusedRiskScore < 60);

      // Boost day 30 with any live data
      const lastIdx = data.length - 1;
      const base = data[lastIdx];
      const addedSuspicious = liveSuspicious.length;
      const liveAvgScore = Math.round(
        transactions.reduce((acc, t) => acc + (t.fusedRiskScore || 0), 0) / Math.max(transactions.length, 1)
      );

      data[lastIdx] = {
        ...base,
        suspiciousTxns: base.suspiciousTxns + addedSuspicious,
        criticalCount: base.criticalCount + liveCritical.length,
        highCount: base.highCount + liveHigh.length,
        mediumCount: base.mediumCount + liveMedium.length,
        avgRiskScore: Math.min(99, Math.round((base.avgRiskScore + liveAvgScore) / 2)),
      };
    }
    return data;
  }, [transactions]);

  // Filtered dataset according to timeWindow
  const chartData = useMemo(() => {
    if (timeWindow === '7D') return dynamic30DayData.slice(-7);
    if (timeWindow === '14D') return dynamic30DayData.slice(-14);
    return dynamic30DayData;
  }, [dynamic30DayData, timeWindow]);

  // Calculated 30-Day aggregates for KPI cards
  const summaryMetrics = useMemo(() => {
    const totalSuspicious = chartData.reduce((acc, d) => acc + d.suspiciousTxns, 0);
    const totalPreventedLoss = chartData.reduce((acc, d) => acc + d.preventedLoss, 0);
    const avgRisk = Math.round((chartData.reduce((acc, d) => acc + d.avgRiskScore, 0) / chartData.length) * 10) / 10;
    const peakSpike = chartData.reduce((max, d) => (d.avgRiskScore > max.avgRiskScore ? d : max), chartData[0]);
    const totalTxns = chartData.reduce((acc, d) => acc + d.totalTxns, 0);
    const totalCritical = chartData.reduce((acc, d) => acc + d.criticalCount, 0);
    const totalHigh = chartData.reduce((acc, d) => acc + d.highCount, 0);
    const highCritRatio = Math.round(((totalCritical + totalHigh) / Math.max(totalSuspicious, 1)) * 1000) / 10;

    return {
      totalSuspicious,
      totalPreventedLoss,
      avgRisk,
      peakSpike,
      totalTxns,
      highCritRatio,
    };
  }, [chartData]);

  // Export 30-day summary as CSV
  const handleExportCSV = () => {
    const headers = ['Day', 'Date', 'Total_Txns', 'Suspicious_Txns', 'Flagged_BDT', 'Prevented_Loss_BDT', 'Avg_Risk_Score', 'Critical_Count', 'High_Count', 'Medium_Count', 'Threat_Level', 'Incident'];
    const rows = dynamic30DayData.map((d) => [
      d.day,
      `"${d.fullDate}"`,
      d.totalTxns,
      d.suspiciousTxns,
      d.suspiciousAmount,
      d.preventedLoss,
      d.avgRiskScore,
      d.criticalCount,
      d.highCount,
      d.mediumCount,
      d.threatLevel,
      `"${d.incident || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TakaSafe_30Day_Suspicious_Risk_Trend_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header and Title Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0054A6]/10 dark:bg-blue-500/15 flex items-center justify-center text-[#0054A6] dark:text-blue-400 shrink-0 border border-[#0054A6]/20 dark:border-blue-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isBn
                  ? 'বিগত ৩০ দিনের সন্দেহভাজন লেনদেন ভলিউম ও ঝুঁকি স্কোরের বণ্টন'
                  : 'Daily Suspicious Transaction Volume & Risk Score Distribution (Last 30 Days)'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#0054A6] dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                <Calendar className="w-3 h-3" />
                <span>30-DAY TIMELINE</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>RECHARTS ENGINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? 'প্রতিদিনের ফ্ল্যাগ হওয়া ফ্রড ট্রানজ্যাকশন ভলিউম, স্কোর ট্রেন্ড (০-১০০) এবং লো/মিডিয়াম/হাই/ক্রিটিক্যাল ঝুঁকি ব্যান্ডের বণ্টন বিশ্লেষণ'
                : 'Historical trend of flagged suspicious transactions, mean/p90 risk scores, and 4-tier risk distribution decomposition'}
            </p>
          </div>
        </div>

        {/* View Selection & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Visualizer Mode Toggle */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('TREND')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'TREND'
                  ? 'bg-white dark:bg-slate-900 text-[#0054A6] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isBn ? 'ভলিউম ও স্কোর ট্রেন্ড' : 'Volume & Risk Trend'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TIERS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'TIERS'
                  ? 'bg-white dark:bg-slate-900 text-[#0054A6] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isBn ? 'ঝুঁকি টিয়ার বণ্টন' : 'Risk Tier Distribution'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTOGRAM')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'HISTOGRAM'
                  ? 'bg-white dark:bg-slate-900 text-[#0054A6] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্কোর হিস্টোগ্রাম (০-১০০)' : 'Score Histogram'}</span>
            </button>
          </div>

          {/* Time Window Buttons */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">
            {(['30D', '14D', '7D'] as const).map((win) => (
              <button
                key={win}
                type="button"
                onClick={() => setTimeWindow(win)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeWindow === win
                    ? 'bg-[#0054A6] text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {win === '30D' ? (isBn ? '৩০ দিন' : '30 Days') : win === '14D' ? (isBn ? '১৪ দিন' : '14 Days') : (isBn ? '৭ দিন' : '7 Days')}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            title={isBn ? '৩০ দিনের ডেটা CSV এক্সপোর্ট করুন' : 'Export 30-day analytics CSV'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>{isBn ? 'মোট সন্দেহভাজন ভলিউম' : '30D Suspicious Volume'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
              {summaryMetrics.totalSuspicious.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">txns</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
            {isBn ? `দৈনিক গড়: ${Math.round(summaryMetrics.totalSuspicious / chartData.length)} টি` : `Avg ${Math.round(summaryMetrics.totalSuspicious / chartData.length)} flagged/day`}
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBn ? 'প্রতিরোধকৃত আর্থিক ক্ষতি' : 'Prevented Fraud Loss'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ৳ {(summaryMetrics.totalPreventedLoss / 1000000).toFixed(2)}M
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            {isBn ? '১০০% অটো-হোল্ড ও রিফান্ড রক্ষা' : 'Zero sovereign ledger leakage'}
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBn ? 'গড় ঝুঁকি স্কোর (০-১০০)' : '30-Day Mean Risk Score'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {summaryMetrics.avgRisk}
            </span>
            <span className="text-[11px] text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
            {isBn ? `সর্বোচ্চ স্পাইক: ${summaryMetrics.peakSpike.avgRiskScore} (${summaryMetrics.peakSpike.date})` : `Peak: ${summaryMetrics.peakSpike.avgRiskScore} on ${summaryMetrics.peakSpike.date}`}
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>{isBn ? 'হাই ও ক্রিটিক্যাল অনুপাত' : 'High/Critical Ratio'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
              {summaryMetrics.highCritRatio}%
            </span>
            <span className="text-[11px] text-slate-400">{isBn ? 'ফ্ল্যাগড' : 'of flagged'}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
            {isBn ? 'বাকি ৭৮% মিডিয়াম ওয়ার্নিং' : 'Remaining 78% soft step-up'}
          </span>
        </div>
      </div>

      {/* Interactive Metric Filter Checkboxes (for TREND view) */}
      {activeTab === 'TREND' && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 font-medium text-[11px]">{isBn ? 'ফিল্টার কন্ট্রোল:' : 'Series Controls:'}</span>

            {/* Toggle Suspicious Volume */}
            <button
              type="button"
              onClick={() => setShowVolume(!showVolume)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                showVolume
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <span className={`w-2 h-2 rounded-xs ${showVolume ? 'bg-rose-500' : 'bg-slate-400'}`} />
              <span>{isBn ? 'সন্দেহভাজন ভলিউম (বার)' : 'Suspicious Volume (Bars)'}</span>
            </button>

            {/* Toggle Mean Risk Score */}
            <button
              type="button"
              onClick={() => setShowRiskScore(!showRiskScore)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                showRiskScore
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showRiskScore ? 'bg-amber-500' : 'bg-slate-400'}`} />
              <span>{isBn ? 'গড় ঝুঁকি স্কোর (লাইন)' : 'Avg Risk Score (Line)'}</span>
            </button>

            {/* Toggle 7-Day Moving Average */}
            <button
              type="button"
              onClick={() => setShowMovingAvg(!showMovingAvg)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                showMovingAvg
                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showMovingAvg ? 'bg-sky-500' : 'bg-slate-400'}`} />
              <span>{isBn ? '৭ দিনের মুভিং এভারেজ' : '7-Day Moving Avg'}</span>
            </button>

            {/* Toggle Incident Thresholds */}
            <button
              type="button"
              onClick={() => setShowIncidentMarkers(!showIncidentMarkers)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                showIncidentMarkers
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{isBn ? 'ঝুঁকি থ্রেশহোল্ড (৭৫ ও ৫০)' : 'Risk Cutoffs (75 & 50)'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {isBn ? `${chartData.length} দিনের রেকর্ড` : `${chartData.length} records in view`}
          </div>
        </div>
      )}

      {/* Main Chart Visualization Area */}
      <div className="h-72 sm:h-84 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'TREND' ? (
            /* VIEW 1: Dual-Axis ComposedChart (Volume Bars + Score Trend Lines) */
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  setSelectedDay(e.activePayload[0].payload as DailyRiskDataPoint);
                }
              }}
            >
              <defs>
                <linearGradient id="suspiciousBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E11D48" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#BE123C" stopOpacity={0.45} />
                </linearGradient>
                <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.2} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />

              {/* Left Y Axis: Suspicious Txn Volume */}
              <YAxis
                yAxisId="left"
                domain={[0, 'dataMax + 40']}
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{
                  value: isBn ? 'সন্দেহভাজন লেনদেন সংখ্যা' : 'Suspicious Txn Count',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 10,
                  fill: '#94A3B8',
                  offset: 12,
                }}
              />

              {/* Right Y Axis: Risk Score (0 - 100) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{
                  value: isBn ? 'গড় ঝুঁকি স্কোর (০-১০০)' : 'Mean Risk Score (0-100)',
                  angle: 90,
                  position: 'insideRight',
                  fontSize: 10,
                  fill: '#94A3B8',
                  offset: 12,
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload as DailyRiskDataPoint;
                  return (
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-2 min-w-56 z-50">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {data.fullDate}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            data.threatLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                              : data.threatLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                              : data.threatLevel === 'ELEVATED'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          }`}
                        >
                          {data.threatLevel}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                            <ShieldAlert className="w-3 h-3" />
                            {isBn ? 'সন্দেহভাজন লেনদেন:' : 'Suspicious Volume:'}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {data.suspiciousTxns} txns
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                            <Activity className="w-3 h-3" />
                            {isBn ? 'গড় ঝুঁকি স্কোর:' : 'Avg Risk Score:'}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {data.avgRiskScore}/100
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>{isBn ? '৭-দিনের মুভিং এভারেজ:' : '7-Day Moving Avg:'}</span>
                          <span className="font-mono">{data.movingAvg7D}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>{isBn ? 'প্রতিরোধকৃত অর্থ:' : 'Prevented Fraud:'}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            ৳ {(data.preventedLoss / 1000).toLocaleString()}k
                          </span>
                        </div>
                      </div>

                      {data.incident && (
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          ⚠ {data.incident}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 italic pt-1">
                        {isBn ? 'বিস্তারিত দেখতে ক্লিক করুন' : 'Click bar to inspect day'}
                      </div>
                    </div>
                  );
                }}
              />

              {showIncidentMarkers && (
                <>
                  <ReferenceLine
                    yAxisId="right"
                    y={75}
                    stroke="#E11D48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'CRITICAL CUTOFF (75)',
                      fill: '#E11D48',
                      fontSize: 9,
                      position: 'top',
                    }}
                  />
                  <ReferenceLine
                    yAxisId="right"
                    y={50}
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{
                      value: 'HIGH STEP-UP (50)',
                      fill: '#F59E0B',
                      fontSize: 9,
                      position: 'top',
                    }}
                  />
                </>
              )}

              {/* Suspicious Volume Bar */}
              {showVolume && (
                <Bar
                  yAxisId="left"
                  dataKey="suspiciousTxns"
                  name={isBn ? 'সন্দেহভাজন লেনদেন সংখ্যা' : 'Suspicious Txn Count'}
                  fill="url(#suspiciousBarGrad)"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.threatLevel === 'CRITICAL'
                          ? '#E11D48'
                          : entry.threatLevel === 'HIGH'
                          ? '#EA580C'
                          : entry.threatLevel === 'ELEVATED'
                          ? '#0284C7'
                          : '#0054A6'
                      }
                      opacity={selectedDay?.day === entry.day ? 1 : 0.85}
                      stroke={selectedDay?.day === entry.day ? '#FFFFFF' : 'none'}
                      strokeWidth={selectedDay?.day === entry.day ? 2 : 0}
                    />
                  ))}
                </Bar>
              )}

              {/* Mean Risk Score Line */}
              {showRiskScore && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRiskScore"
                  name={isBn ? 'গড় ঝুঁকি স্কোর' : 'Mean Risk Score'}
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#F59E0B', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}

              {/* 7-Day Moving Average Line */}
              {showMovingAvg && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="movingAvg7D"
                  name={isBn ? '৭-দিনের মুভিং এভারেজ' : '7-Day Moving Average'}
                  stroke="#0284C7"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          ) : activeTab === 'TIERS' ? (
            /* VIEW 2: 100% Stacked Bar Chart of Daily Risk Tiers */
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  setSelectedDay(e.activePayload[0].payload as DailyRiskDataPoint);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.2} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />

              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{
                  value: isBn ? 'ঝুঁকি বণ্টনের অনুপাত (%)' : 'Risk Tier Composition (%)',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 10,
                  fill: '#94A3B8',
                  offset: 12,
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload as DailyRiskDataPoint;
                  return (
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-2 min-w-56 z-50">
                      <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                        {data.fullDate} — {isBn ? 'ঝুঁকি টিয়ার বণ্টন' : 'Risk Tier Breakdown'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                            Critical (80-100):
                          </span>
                          <span>{data.criticalCount} ({data.criticalPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                            High (60-79):
                          </span>
                          <span>{data.highCount} ({data.highPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
                            Medium (30-59):
                          </span>
                          <span>{data.mediumCount} ({data.mediumPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                            Low / Safe (0-29):
                          </span>
                          <span>{data.lowCount} ({data.lowPct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
              />

              <Bar dataKey="criticalPct" name="Critical (80-100)" stackId="a" fill="#E11D48" radius={[0, 0, 0, 0]} />
              <Bar dataKey="highPct" name="High (60-79)" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="mediumPct" name="Medium (30-59)" stackId="a" fill="#0284C7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lowPct" name="Low (0-29)" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            /* VIEW 3: Aggregate 30-Day Risk Score Histogram (0-100) */
            <BarChart
              data={AGGREGATE_SCORE_HISTOGRAM}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.2} />

              <XAxis
                dataKey="bracket"
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{
                  value: isBn ? 'ঝুঁকি স্কোর ব্র্যাকেট (০ থেকে ১০০)' : 'Risk Score Intervals (0 to 100)',
                  position: 'insideBottom',
                  offset: -5,
                  fontSize: 10,
                  fill: '#94A3B8',
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.3 }}
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{
                  value: isBn ? 'মোট লেনদেনের সংখ্যা' : 'Txn Frequency (30D)',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 10,
                  fill: '#94A3B8',
                  offset: 12,
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as ScoreHistogramBin;
                  return (
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1.5 z-50">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isBn ? `স্কোর পরিধি: ${item.bracket}` : `Score Range: ${item.bracket}`}
                      </div>
                      <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>{isBn ? 'লেনদেন সংখ্যা:' : 'Transactions:'}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>{isBn ? 'মোট ভলিউমের অনুপাত:' : 'Share of Volume:'}</span>
                        <span className="font-mono font-bold text-[#0054A6] dark:text-blue-400">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>{isBn ? 'ঝুঁকি টিয়ার:' : 'Risk Tier:'}</span>
                        <span className="font-bold">{item.tier}</span>
                      </div>
                    </div>
                  );
                }}
              />

              <Bar
                dataKey="count"
                name={isBn ? 'লেনদেন সংখ্যা' : 'Txn Count'}
                radius={[6, 6, 0, 0]}
              >
                {AGGREGATE_SCORE_HISTOGRAM.map((entry, index) => (
                  <Cell
                    key={`hist-${index}`}
                    fill={
                      entry.tier === 'CRITICAL'
                        ? '#E11D48'
                        : entry.tier === 'HIGH'
                        ? '#EA580C'
                        : entry.tier === 'MEDIUM'
                        ? '#0284C7'
                        : '#10B981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Selected Day Forensic Inspector Card */}
      {selectedDay && (
        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0054A6] dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isBn ? `নির্বাচিত দিনের ফরেনসিক তথ্য: ${selectedDay.fullDate}` : `Day ${selectedDay.day} Forensic Summary — ${selectedDay.fullDate}`}
              </h4>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedDay.threatLevel === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : selectedDay.threatLevel === 'HIGH'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : selectedDay.threatLevel === 'ELEVATED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {selectedDay.threatLevel} STATUS
              </span>
            </div>

            {selectedDay.incident && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedDay.incident}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isBn ? 'ফ্ল্যাগড ট্রানজ্যাকশন' : 'Flagged Suspicious'}</span>
              <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">{selectedDay.suspiciousTxns} txns</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {isBn ? `মোট লেনদেনের ${((selectedDay.suspiciousTxns / selectedDay.totalTxns) * 100).toFixed(1)}%` : `${((selectedDay.suspiciousTxns / selectedDay.totalTxns) * 100).toFixed(1)}% of daily flow`}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isBn ? 'সন্দেহভাজন টাকার অংক' : 'Suspicious Volume (BDT)'}</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">৳ {(selectedDay.suspiciousAmount / 1000).toLocaleString()}k</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                ৳ {(selectedDay.preventedLoss / 1000).toLocaleString()}k protected
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isBn ? 'গড় ও পিক রিস্ক স্কোর' : 'Avg / Max Risk Score'}</span>
              <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{selectedDay.avgRiskScore} / {selectedDay.maxRiskScore}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                P90 percentile: {selectedDay.p90RiskScore}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isBn ? 'ক্রিটিক্যাল ব্রেকডাউন' : 'Critical / High Count'}</span>
              <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                {selectedDay.criticalCount} crit / {selectedDay.highCount} high
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {selectedDay.mediumCount} medium / {selectedDay.lowCount} low
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
