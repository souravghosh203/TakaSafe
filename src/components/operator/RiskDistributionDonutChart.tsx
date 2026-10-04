import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Transaction, RiskBand } from '../../types';
import {
  PieChart as PieChartIcon,
  ShieldAlert,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';

interface RiskDistributionDonutChartProps {
  transactions?: Transaction[];
  activeFilter?: string;
  onSelectFilter?: (band: string) => void;
  lang: 'EN' | 'BN';
}

interface RiskSliceData {
  band: RiskBand;
  name: string;
  count: number;
  percentage: number;
  volumeBDT: number;
  color: string;
  bgColor: string;
  borderColor: string;
  scoreRange: string;
  actionRequired: string;
}

const RISK_BAND_CONFIG: Record<
  RiskBand,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    labelEN: string;
    labelBN: string;
    scoreRange: string;
    actionRequired: string;
  }
> = {
  CRITICAL: {
    color: '#EF4444',
    bgColor: 'bg-rose-50 text-rose-800',
    borderColor: 'border-rose-200',
    labelEN: 'Critical Risk',
    labelBN: 'মারাত্মক ঝুঁকি (Critical)',
    scoreRange: '81 – 100',
    actionRequired: 'Immediate Freeze / Step-Up KYC',
  },
  HIGH: {
    color: '#F59E0B',
    bgColor: 'bg-amber-50 text-amber-800',
    borderColor: 'border-amber-200',
    labelEN: 'High Risk',
    labelBN: 'উচ্চ ঝুঁকি (High)',
    scoreRange: '61 – 80',
    actionRequired: 'Human Review Mandatory',
  },
  MEDIUM: {
    color: '#3B82F6',
    bgColor: 'bg-blue-50 text-blue-800',
    borderColor: 'border-blue-200',
    labelEN: 'Medium Risk',
    labelBN: 'মাঝারি ঝুঁকি (Medium)',
    scoreRange: '31 – 60',
    actionRequired: 'SMS OTP Verification',
  },
  LOW: {
    color: '#10B981',
    bgColor: 'bg-emerald-50 text-emerald-800',
    borderColor: 'border-emerald-200',
    labelEN: 'Low / Clean',
    labelBN: 'স্বাভাবিক (Low)',
    scoreRange: '0 – 30',
    actionRequired: 'Automated Real-Time Pass',
  },
};

export const RiskDistributionDonutChart: React.FC<RiskDistributionDonutChartProps> = ({
  transactions = [],
  activeFilter = 'ALL',
  onSelectFilter,
  lang,
}) => {
  const [hoveredBand, setHoveredBand] = useState<RiskBand | null>(null);

  // Compute aggregated distribution stats across the transaction feed
  const { slices, totalTxns, totalVolume, criticalAndHighCount } = useMemo(() => {
    const counts: Record<RiskBand, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    const volumes: Record<RiskBand, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    let totalVol = 0;

    transactions.forEach((txn) => {
      const band = txn.riskBand || (txn.fusedRiskScore >= 80 ? 'CRITICAL' : txn.fusedRiskScore >= 60 ? 'HIGH' : txn.fusedRiskScore >= 30 ? 'MEDIUM' : 'LOW');
      if (counts[band] !== undefined) {
        counts[band] += 1;
        volumes[band] += txn.amount || 0;
        totalVol += txn.amount || 0;
      }
    });

    const total = transactions.length || 1;

    const bandsOrder: RiskBand[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    const data: RiskSliceData[] = bandsOrder.map((band) => {
      const cfg = RISK_BAND_CONFIG[band];
      const count = counts[band];
      const percentage = transactions.length > 0 ? (count / transactions.length) * 100 : 0;
      return {
        band,
        name: lang === 'BN' ? cfg.labelBN : cfg.labelEN,
        count,
        percentage: Number(percentage.toFixed(1)),
        volumeBDT: volumes[band],
        color: cfg.color,
        bgColor: cfg.bgColor,
        borderColor: cfg.borderColor,
        scoreRange: cfg.scoreRange,
        actionRequired: cfg.actionRequired,
      };
    });

    return {
      slices: data,
      totalTxns: transactions.length,
      totalVolume: totalVol,
      criticalAndHighCount: counts.CRITICAL + counts.HIGH,
    };
  }, [transactions, lang]);

  // Recharts payload data (only include non-zero slices for clean rendering)
  const chartData = useMemo(() => {
    const nonZero = slices.filter((s) => s.count > 0);
    // If all are 0, fallback to a placeholder
    if (nonZero.length === 0) {
      return [{ name: 'No Transactions', value: 1, color: '#CBD5E1', band: 'LOW' as RiskBand }];
    }
    return nonZero.map((s) => ({
      name: s.name,
      value: s.count,
      band: s.band,
      color: s.color,
      percentage: s.percentage,
      volumeBDT: s.volumeBDT,
    }));
  }, [slices]);

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between space-y-4 font-sans h-full text-slate-900 dark:text-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0054A6] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'BN' ? 'ঝুঁকি স্তরের বণ্টন' : 'Risk Level Distribution'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                Recharts Donut
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'BN'
                ? 'বর্তমান ফিডে লেনদেনের অনুপাত (ক্রিটিক্যাল, হাই, মিডিয়াম, লো)'
                : 'Current feed share by severity (CRITICAL, HIGH, MEDIUM, LOW)'}
            </p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {activeFilter !== 'ALL' && (
          <button
            onClick={() => onSelectFilter?.('ALL')}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
            title="Reset to show all risk bands"
          >
            <X className="w-3 h-3" />
            <span>Reset {activeFilter}</span>
          </button>
        )}
      </div>

      {/* Main Recharts Donut Chart Container */}
      <div className="relative flex items-center justify-center min-h-[200px] my-1">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: any = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 font-sans z-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                        <span className="font-bold">{data.name}</span>
                      </div>
                      <div className="space-y-0.5 font-mono text-[11px] text-slate-300">
                        <div>
                          Count: <strong className="text-white">{data.value} transactions</strong> ({data.percentage}%)
                        </div>
                        <div>
                          Volume: <strong className="text-white">৳{data.volumeBDT?.toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                        Click slice to filter feed
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={4}
              dataKey="value"
              animationDuration={800}
              cursor="pointer"
              onClick={(entry: any) => {
                if (entry && entry.band) {
                  onSelectFilter?.(activeFilter === entry.band ? 'ALL' : entry.band);
                }
              }}
              onMouseEnter={(_: any, index: number) => {
                const item = chartData[index];
                if (item && item.band) setHoveredBand(item.band);
              }}
              onMouseLeave={() => setHoveredBand(null)}
            >
              {chartData.map((entry, index) => {
                const isSelected = activeFilter === entry.band;
                const isHovered = hoveredBand === entry.band;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={isSelected || isHovered ? '#0F172A' : '#FFFFFF'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
                    style={{
                      filter: isSelected ? 'drop-shadow(0px 0px 6px rgba(0,0,0,0.3))' : 'none',
                      transition: 'all 0.2s ease-out',
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Central Overlay Summary Metric inside the Donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">
            Total Monitored
          </span>
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-tight">
            {totalTxns}
          </span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold font-mono">
            {criticalAndHighCount} Critical/High
          </span>
        </div>
      </div>

      {/* Structured Category Breakdown Grid & Clickable Filter Rows */}
      <div className="space-y-1.5 pt-1">
        {slices.map((slice) => {
          const isSelected = activeFilter === slice.band;
          const isDimmed = activeFilter !== 'ALL' && !isSelected;

          return (
            <div
              key={slice.band}
              onClick={() => onSelectFilter?.(isSelected ? 'ALL' : slice.band)}
              className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0054A6] text-white border-[#0054A6] shadow-xs font-bold'
                  : isDimmed
                  ? 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100'
                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="font-bold text-[11px]">{slice.name}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isSelected ? 'bg-blue-800 text-blue-100' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Score {slice.scoreRange}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-[11px] font-bold">
                  {slice.count} <span className="text-[9px] font-normal opacity-80">({slice.percentage}%)</span>
                </span>
                <span className="text-[11px] font-semibold opacity-90 hidden sm:inline">
                  ৳{(slice.volumeBDT / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
