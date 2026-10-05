import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  Info,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { RegionalRiskMetric } from '../../types';
import { HistoricalEventCarousel } from './HistoricalEventCarousel';

interface DivisionHistoricalRiskChartProps {
  selectedDivision: string;
  metrics: RegionalRiskMetric[];
  onSelectDivision: (division: string) => void;
  lang?: 'EN' | 'BN';
}

export interface HistoricalRiskPoint {
  day: number;
  date: string;
  fullDate: string;
  riskScore: number;
  movingAvg: number;
  scamSignal: number;
  fraudSignal: number;
  liquidityStress: number;
  incident?: string;
  incidentType?: 'CRITICAL' | 'WEATHER' | 'MULE' | 'LIQUIDITY' | 'INFO';
}

const DATES_30D: Array<{ day: number; date: string; fullDate: string }> = [
  { day: 1, date: 'Sep 05', fullDate: '05 Sep 2026' },
  { day: 2, date: 'Sep 06', fullDate: '06 Sep 2026' },
  { day: 3, date: 'Sep 07', fullDate: '07 Sep 2026' },
  { day: 4, date: 'Sep 08', fullDate: '08 Sep 2026' },
  { day: 5, date: 'Sep 09', fullDate: '09 Sep 2026' },
  { day: 6, date: 'Sep 10', fullDate: '10 Sep 2026' },
  { day: 7, date: 'Sep 11', fullDate: '11 Sep 2026' },
  { day: 8, date: 'Sep 12', fullDate: '12 Sep 2026' },
  { day: 9, date: 'Sep 13', fullDate: '13 Sep 2026' },
  { day: 10, date: 'Sep 14', fullDate: '14 Sep 2026' },
  { day: 11, date: 'Sep 15', fullDate: '15 Sep 2026' },
  { day: 12, date: 'Sep 16', fullDate: '16 Sep 2026' },
  { day: 13, date: 'Sep 17', fullDate: '17 Sep 2026' },
  { day: 14, date: 'Sep 18', fullDate: '18 Sep 2026' },
  { day: 15, date: 'Sep 19', fullDate: '19 Sep 2026' },
  { day: 16, date: 'Sep 20', fullDate: '20 Sep 2026' },
  { day: 17, date: 'Sep 21', fullDate: '21 Sep 2026' },
  { day: 18, date: 'Sep 22', fullDate: '22 Sep 2026' },
  { day: 19, date: 'Sep 23', fullDate: '23 Sep 2026' },
  { day: 20, date: 'Sep 24', fullDate: '24 Sep 2026' },
  { day: 21, date: 'Sep 25', fullDate: '25 Sep 2026' },
  { day: 22, date: 'Sep 26', fullDate: '26 Sep 2026' },
  { day: 23, date: 'Sep 27', fullDate: '27 Sep 2026' },
  { day: 24, date: 'Sep 28', fullDate: '28 Sep 2026' },
  { day: 25, date: 'Sep 29', fullDate: '29 Sep 2026' },
  { day: 26, date: 'Sep 30', fullDate: '30 Sep 2026' },
  { day: 27, date: 'Oct 01', fullDate: '01 Oct 2026' },
  { day: 28, date: 'Oct 02', fullDate: '02 Oct 2026' },
  { day: 29, date: 'Oct 03', fullDate: '03 Oct 2026' },
  { day: 30, date: 'Oct 04', fullDate: '04 Oct 2026 (Today)' },
];

// Generates 30-day realistic trajectory reflecting regional dynamics
function generateDivisionHistory(division: string, targetScore: number): HistoricalRiskPoint[] {
  let rawScores: number[] = [];
  const incidents: Record<number, { text: string; type: HistoricalRiskPoint['incidentType'] }> = {};

  switch (division) {
    case 'Barishal':
      // Started low (~31), spiked dramatically due to Cyclone Remal, liquidity depletion & mule ring
      rawScores = [
        31, 32, 30, 33, 31, 34, 32, 35, 36, 38,
        40, 42, 45, 49, 52, 55, 59, 64, 68, 73,
        76, 78, 81, 84, 86, 85, 88, 91, 89, targetScore || 87,
      ];
      incidents[14] = { text: 'Deep atmospheric depression formed in Bay of Bengal', type: 'WEATHER' };
      incidents[20] = { text: 'Cyclone Remal Warning Signal 7 raised by Met Office', type: 'WEATHER' };
      incidents[24] = { text: 'Pre-storm panic cash-outs: Agent reserves drop -26%', type: 'LIQUIDITY' };
      incidents[28] = { text: 'Mule syndicate velocity spike exploiting storm chaos', type: 'MULE' };
      incidents[30] = { text: 'Platform elevated threat posture to Level-3 Emerging Risk', type: 'CRITICAL' };
      break;

    case 'Sylhet':
      // Monsoonal surge with flash flooding in Surma-Kushiyara basin
      rawScores = [
        25, 26, 24, 25, 27, 26, 28, 29, 28, 30,
        32, 34, 35, 37, 40, 43, 47, 51, 55, 58,
        61, 63, 60, 58, 59, 57, 56, 55, 53, targetScore || 54,
      ];
      incidents[15] = { text: 'Upstream torrential rainfall in Meghalaya basin', type: 'WEATHER' };
      incidents[21] = { text: 'Surma River exceeds danger mark (+42cm)', type: 'WEATHER' };
      incidents[26] = { text: 'Submerged agent points; cash replenishment delays', type: 'LIQUIDITY' };
      incidents[30] = { text: 'Floodwaters gradually receding; Elevated Monitoring', type: 'INFO' };
      break;

    case 'Chittagong':
      // Moderate trade fluctuations with cross-border Hawala spikes
      rawScores = [
        36, 37, 35, 38, 41, 40, 39, 42, 44, 45,
        43, 42, 46, 48, 47, 45, 48, 50, 52, 51,
        49, 53, 52, 50, 49, 47, 46, 48, 49, targetScore || 48,
      ];
      incidents[10] = { text: 'Quarterly customs clearing cash-out surge', type: 'INFO' };
      incidents[22] = { text: 'Cross-border mule account velocity anomaly flagged', type: 'MULE' };
      incidents[30] = { text: 'Commercial seaport risk corridor remains Elevated', type: 'INFO' };
      break;

    case 'Khulna':
      // Mild coastal surge before stabilizing
      rawScores = [
        32, 33, 31, 32, 34, 33, 35, 36, 37, 39,
        38, 40, 42, 44, 46, 45, 47, 46, 45, 44,
        43, 45, 46, 44, 43, 42, 43, 44, 43, targetScore || 42,
      ];
      incidents[15] = { text: 'Coastal weather alert issued for Sundarbans belt', type: 'WEATHER' };
      incidents[26] = { text: 'UCB Taqwa regional float pre-allocated', type: 'LIQUIDITY' };
      break;

    case 'Dhaka':
      // High volume but very stable, resilient baseline
      rawScores = [
        26, 27, 25, 26, 28, 29, 27, 26, 28, 30,
        29, 28, 27, 28, 31, 30, 29, 28, 27, 28,
        29, 31, 30, 29, 28, 27, 29, 30, 28, targetScore || 28,
      ];
      incidents[15] = { text: 'Mid-month digital salary disbursement clearing', type: 'INFO' };
      incidents[28] = { text: 'Standard metro liquidity & low fraud baseline', type: 'INFO' };
      break;

    case 'Rajshahi':
      // Agricultural calm, low variance
      rawScores = [
        20, 21, 20, 19, 21, 22, 21, 20, 22, 23,
        22, 21, 20, 22, 24, 23, 22, 21, 20, 21,
        22, 24, 23, 22, 21, 20, 21, 22, 23, targetScore || 22,
      ];
      incidents[16] = { text: 'Wholesale seasonal trade settlement period', type: 'INFO' };
      break;

    case 'Rangpur':
      // Minimal anomaly frequency
      rawScores = [
        18, 17, 18, 19, 18, 17, 18, 19, 20, 19,
        18, 17, 18, 19, 20, 19, 18, 19, 20, 19,
        18, 19, 20, 19, 18, 19, 18, 19, 20, targetScore || 19,
      ];
      incidents[18] = { text: 'Teesta barrage controlled water discharge', type: 'INFO' };
      break;

    case 'Mymensingh':
    default:
      // Rural trade baseline with slight harvest fluctuation
      rawScores = [
        22, 23, 21, 22, 24, 23, 22, 24, 25, 26,
        25, 24, 23, 25, 26, 27, 26, 25, 24, 25,
        26, 27, 26, 25, 24, 23, 24, 26, 25, targetScore || 25,
      ];
      incidents[22] = { text: 'Cross-border cattle bazaar seasonal settlement', type: 'INFO' };
      break;
  }

  // Calculate 7-day rolling moving average and component sub-signals
  return DATES_30D.map((item, idx) => {
    const score = rawScores[idx] ?? Math.round(targetScore);

    // 7-day rolling window
    const windowStart = Math.max(0, idx - 6);
    const windowScores = rawScores.slice(windowStart, idx + 1);
    const movingAvg = Math.round(
      windowScores.reduce((sum, v) => sum + v, 0) / windowScores.length
    );

    // Realistic component derivations
    const scamSignal = Math.min(100, Math.max(5, Math.round(score * 0.85 + ((idx % 5) - 2) * 2)));
    const fraudSignal = Math.min(100, Math.max(4, Math.round(score * 0.92 + ((idx % 4) - 1.5) * 3)));
    const liquidityStress = Math.min(100, Math.max(2, Math.round(score * 0.78 + ((idx % 3) - 1) * 4)));

    const inc = incidents[item.day];

    return {
      day: item.day,
      date: item.date,
      fullDate: item.fullDate,
      riskScore: score,
      movingAvg,
      scamSignal,
      fraudSignal,
      liquidityStress,
      incident: inc?.text,
      incidentType: inc?.type,
    };
  });
}

export const DivisionHistoricalRiskChart: React.FC<DivisionHistoricalRiskChartProps> = ({
  selectedDivision,
  metrics,
  onSelectDivision,
  lang = 'EN',
}) => {
  const [timeRange, setTimeRange] = useState<'30D' | '14D' | '7D'>('30D');
  const [showMovingAvg, setShowMovingAvg] = useState<boolean>(true);
  const [showSubsignals, setShowSubsignals] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<HistoricalRiskPoint | null>(null);

  const activeMetric = metrics.find((m) => m.division === selectedDivision) || metrics[0];

  // Full 30-day generated data for the selected division
  const fullHistory = useMemo(() => {
    return generateDivisionHistory(selectedDivision, activeMetric.riskScore);
  }, [selectedDivision, activeMetric.riskScore]);

  // Filtered view data
  const chartData = useMemo(() => {
    if (timeRange === '7D') return fullHistory.slice(-7);
    if (timeRange === '14D') return fullHistory.slice(-14);
    return fullHistory;
  }, [fullHistory, timeRange]);

  const eventPoints = useMemo(() => fullHistory.filter((point) => point.incident), [fullHistory]);

  // Key statistical highlights
  const stats = useMemo(() => {
    const scores = chartData.map((d) => d.riskScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const firstScore = chartData[0]?.riskScore ?? 0;
    const lastScore = chartData[chartData.length - 1]?.riskScore ?? 0;
    const delta = lastScore - firstScore;

    const maxPoint = chartData.find((d) => d.riskScore === maxScore);
    const minPoint = chartData.find((d) => d.riskScore === minScore);

    const incidentsCount = chartData.filter((d) => d.incident).length;

    return {
      maxScore,
      maxDate: maxPoint?.date,
      minScore,
      minDate: minPoint?.date,
      delta,
      current: lastScore,
      incidentsCount,
    };
  }, [chartData]);

  // Determine line and area accent colors based on risk severity
  const themeColors = useMemo(() => {
    if (activeMetric.riskScore >= 70) {
      return {
        stroke: '#E11D48', // rose-600
        fillGradStart: '#E11D48',
        fillGradEnd: '#E11D48',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
        badgeText: 'text-rose-700 dark:text-rose-400',
        badgeBorder: 'border-rose-200 dark:border-rose-800',
      };
    }
    if (activeMetric.riskScore >= 40) {
      return {
        stroke: '#D97706', // amber-600
        fillGradStart: '#F59E0B',
        fillGradEnd: '#D97706',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
        badgeText: 'text-amber-800 dark:text-amber-400',
        badgeBorder: 'border-amber-200 dark:border-amber-800',
      };
    }
    return {
      stroke: '#0054A6', // UCB brand blue
      fillGradStart: '#0284C7',
      fillGradEnd: '#0054A6',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
      badgeText: 'text-[#0054A6] dark:text-blue-400',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
    };
  }, [activeMetric.riskScore]);

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#0054A6] dark:text-blue-400 shadow-xs shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'BN'
                  ? `${selectedDivision} বিভাগের ৩০ দিনের ঐতিহাসিক ঝুঁকি প্রগতি`
                  : `30-Day Historical Risk Score Progression — ${selectedDivision} Division`}
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${themeColors.badgeBg} ${themeColors.badgeText} ${themeColors.badgeBorder}`}>
                {activeMetric.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'BN'
                ? 'দৈনিক ফিউজড ঝুঁকি সূচকের গতিপথ, ৭ দিনের চলমান গড় এবং সাইক্লোন/বন্যা জনিত তারল্য চাপ'
                : 'Daily fused risk trajectory (0-100), 7-day moving average smoothing & anomaly milestones'}
            </p>
          </div>
        </div>

        {/* Division Quick Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Division Selector Pills / Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <span className="px-2 text-[10px] font-mono text-slate-500 uppercase">Division:</span>
            <div className="relative">
              <select
                value={selectedDivision}
                onChange={(e) => onSelectDivision(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-1 pl-2.5 pr-7 rounded-lg text-xs border border-slate-200 dark:border-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              >
                {metrics.map((m) => (
                  <option key={m.division} value={m.division}>
                    {m.division} ({m.riskScore}/100)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            {(['30D', '14D', '7D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-[#0054A6] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === '30D' ? '30 Days' : r === '14D' ? '14 Days' : '7 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Current Risk */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {lang === 'BN' ? 'বর্তমান স্কোর' : 'Current Risk Score'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {stats.current}/100
            </span>
            <span className={`text-[11px] font-bold font-mono ${stats.delta > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
              {stats.delta > 0 ? `+${stats.delta}` : stats.delta}
            </span>
          </div>
        </div>

        {/* 30D High */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {lang === 'BN' ? 'সর্বোচ্চ চূড়া (High)' : 'Window Peak High'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
              {stats.maxScore}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">on {stats.maxDate}</span>
          </div>
        </div>

        {/* 30D Low */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {lang === 'BN' ? 'সর্বনিম্ন মাত্রা (Low)' : 'Window Baseline Low'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.minScore}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">on {stats.minDate}</span>
          </div>
        </div>

        {/* Net Trajectory Momentum */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {lang === 'BN' ? 'নেট পরিবর্তন' : 'Net Trajectory Delta'}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {stats.delta > 0 ? (
              <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className={`text-base font-black font-mono ${stats.delta > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
              {stats.delta > 0 ? `+${stats.delta} pts` : `${stats.delta} pts`}
            </span>
          </div>
        </div>

        {/* Flagged Incident Milestones */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {lang === 'BN' ? 'চিহ্নিত ঘটনা' : 'Flagged Milestones'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {stats.incidentsCount}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">critical events</span>
          </div>
        </div>
      </div>

      {/* Toggles Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Moving average toggle */}
          <button
            type="button"
            onClick={() => setShowMovingAvg(!showMovingAvg)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
              showMovingAvg
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-indigo-500 inline-block border-t-2 border-dashed border-indigo-500"></span>
            <span>{lang === 'BN' ? '৭ দিনের চলমান গড়' : '7-Day Moving Avg'}</span>
          </button>

          {/* Sub-signals toggle */}
          <button
            type="button"
            onClick={() => setShowSubsignals(!showSubsignals)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
              showSubsignals
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{lang === 'BN' ? 'উপ-সংকেতসমূহ (Scam / Fraud / Liquidity)' : 'Sub-signals Layer'}</span>
          </button>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full" style={{ backgroundColor: themeColors.stroke }} />
            <strong className="text-slate-800 dark:text-slate-200">Fused Risk Score</strong>
          </span>
          {showMovingAvg && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-indigo-500" />
              <span>7D Rolling Avg</span>
            </span>
          )}
          {showSubsignals && (
            <>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Scam</span>
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Fraud</span>
              </span>
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Liquidity</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Recharts Line & Area Chart */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 20, left: -10, bottom: 6 }}
          >
            <defs>
              <linearGradient id="historicalRiskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColors.fillGradStart} stopOpacity={0.28} />
                <stop offset="95%" stopColor={themeColors.fillGradEnd} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.4} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={6}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Risk Score (0 - 100)',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10,
                fill: '#94a3b8',
                offset: 15,
              }}
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine
              y={70}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Emerging Risk Threshold (70)',
                position: 'insideTopRight',
                fill: '#e11d48',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />

            <ReferenceLine
              y={40}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth={1.2}
              label={{
                value: 'Elevated Threshold (40)',
                position: 'insideTopRight',
                fill: '#d97706',
                fontSize: 10,
              }}
            />

            {/* Area gradient under primary curve */}
            <Area
              type="monotone"
              dataKey="riskScore"
              fill="url(#historicalRiskGradient)"
              stroke="none"
              isAnimationActive={false}
            />

            {/* Optional Sub-signals */}
            {showSubsignals && (
              <>
                <Line
                  type="monotone"
                  dataKey="scamSignal"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Scam Wave Signal"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="fraudSignal"
                  stroke="#F43F5E"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Fraud Velocity"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="liquidityStress"
                  stroke="#0284C7"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Liquidity Stress"
                  isAnimationActive={false}
                />
              </>
            )}

            {/* 7-Day Moving Average Line */}
            {showMovingAvg && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke="#6366F1"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="7-Day Moving Avg"
                isAnimationActive={false}
              />
            )}

            {/* Primary Fused Risk Score Line */}
            <Line
              type="monotone"
              dataKey="riskScore"
              stroke={themeColors.stroke}
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                // Render special marker if day has an incident
                if (payload.incident) {
                  return (
                    <circle
                      key={`dot-${payload.day}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-pointer hover:r-7 transition-all"
                      onClick={() => setSelectedIncident(payload)}
                    />
                  );
                }
                return (
                  <circle
                    key={`dot-${payload.day}`}
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill={themeColors.stroke}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={{
                r: 6,
                fill: themeColors.stroke,
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              name="Fused Risk Score"
              isAnimationActive={false}
            />

            {/* Interactive Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as HistoricalRiskPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[240px]">
                      {/* Date & Badge */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono">
                        <span className="font-bold text-amber-400">{data.fullDate}</span>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                            data.riskScore >= 70
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : data.riskScore >= 40
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {data.riskScore >= 70 ? 'EMERGING RISK' : data.riskScore >= 40 ? 'ELEVATED' : 'STABLE'}
                        </span>
                      </div>

                      {/* Score metrics */}
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Fused Risk Score:</span>
                          <strong className="text-base font-black text-white">{data.riskScore}/100</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">7-Day Moving Avg:</span>
                          <span className="text-indigo-400 font-bold">{data.movingAvg}/100</span>
                        </div>
                        {showSubsignals && (
                          <div className="pt-1 mt-1 border-t border-slate-800 text-[10px] space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-amber-400">Scam Wave:</span>
                              <span>{data.scamSignal}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-rose-400">Fraud Velocity:</span>
                              <span>{data.fraudSignal}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sky-400">Liquidity Stress:</span>
                              <span>{data.liquidityStress}%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Incident Milestone Note */}
                      {data.incident && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">
                          <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>Milestone Event</span>
                          </div>
                          <p className="text-slate-200 leading-snug">{data.incident}</p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Milestones Timeline Strip */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0054A6] dark:text-blue-400" />
            <span>
              {lang === 'BN' ? 'ঐতিহাসিক ঘটনার ক্রমান্বয় (৩০ দিন)' : 'Key Historical Event Milestones (30-Day Timeline)'}
            </span>
          </span>
          <span className="text-[11px] text-slate-400">Click any dot on chart to inspect event</span>
        </div>

        <HistoricalEventCarousel
          events={eventPoints}
          selectedIncident={selectedIncident}
          selectedDivision={selectedDivision}
          onSelectIncident={setSelectedIncident}
        />
      </div>
    </div>
  );
};
