import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertTriangle, Activity, Clock, ShieldAlert } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionRiskTrendChartProps {
  transactions?: Transaction[];
  lang: 'EN' | 'BN';
}

interface TrendPoint {
  time: string;
  hourDisplay: string;
  avgRiskScore: number;
  criticalAlerts: number;
  anomalyVelocity: number;
  volumeCount: number;
  isPeakSpike?: boolean;
}

const DEFAULT_HOURLY_TRENDS: TrendPoint[] = [
  { time: '00:00', hourDisplay: '12:00 AM', avgRiskScore: 22, criticalAlerts: 0, anomalyVelocity: 1.1, volumeCount: 180 },
  { time: '01:00', hourDisplay: '01:00 AM', avgRiskScore: 26, criticalAlerts: 1, anomalyVelocity: 1.4, volumeCount: 140 },
  { time: '02:00', hourDisplay: '02:00 AM', avgRiskScore: 34, criticalAlerts: 2, anomalyVelocity: 2.3, volumeCount: 95 },
  { time: '02:45', hourDisplay: '02:45 AM', avgRiskScore: 48, criticalAlerts: 5, anomalyVelocity: 4.8, volumeCount: 110 },
  { time: '03:15', hourDisplay: '03:15 AM', avgRiskScore: 89, criticalAlerts: 16, anomalyVelocity: 9.6, volumeCount: 165, isPeakSpike: true },
  { time: '03:30', hourDisplay: '03:30 AM', avgRiskScore: 94, criticalAlerts: 24, anomalyVelocity: 12.8, volumeCount: 210, isPeakSpike: true },
  { time: '03:45', hourDisplay: '03:45 AM', avgRiskScore: 78, criticalAlerts: 11, anomalyVelocity: 8.2, volumeCount: 145 },
  { time: '04:15', hourDisplay: '04:15 AM', avgRiskScore: 52, criticalAlerts: 4, anomalyVelocity: 4.5, volumeCount: 120 },
  { time: '05:00', hourDisplay: '05:00 AM', avgRiskScore: 36, criticalAlerts: 2, anomalyVelocity: 2.8, volumeCount: 190 },
  { time: '06:00', hourDisplay: '06:00 AM', avgRiskScore: 28, criticalAlerts: 1, anomalyVelocity: 1.6, volumeCount: 380 },
  { time: '07:00', hourDisplay: '07:00 AM', avgRiskScore: 25, criticalAlerts: 0, anomalyVelocity: 1.2, volumeCount: 650 },
  { time: '08:00', hourDisplay: '08:00 AM', avgRiskScore: 31, criticalAlerts: 2, anomalyVelocity: 1.8, volumeCount: 920 },
  { time: '09:00', hourDisplay: '09:00 AM', avgRiskScore: 35, criticalAlerts: 3, anomalyVelocity: 2.1, volumeCount: 1340 },
  { time: '10:00', hourDisplay: '10:00 AM', avgRiskScore: 39, criticalAlerts: 4, anomalyVelocity: 2.4, volumeCount: 1560 },
];

export const TransactionRiskTrendChart: React.FC<TransactionRiskTrendChartProps> = ({
  transactions = [],
  lang,
}) => {
  const [timeRange, setTimeRange] = useState<'24H' | 'BURST' | 'ACTIVE'>('24H');
  const [showVelocity, setShowVelocity] = useState<boolean>(true);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);

  // Filter data based on view
  const chartData = React.useMemo(() => {
    if (timeRange === 'BURST') {
      return DEFAULT_HOURLY_TRENDS.filter(
        (p) => ['02:00', '02:45', '03:15', '03:30', '03:45', '04:15', '05:00'].includes(p.time)
      );
    }
    if (timeRange === 'ACTIVE') {
      return DEFAULT_HOURLY_TRENDS.slice(-6);
    }
    return DEFAULT_HOURLY_TRENDS;
  }, [timeRange]);

  // Dynamic peak calculation
  const peakScore = Math.max(...chartData.map((d) => d.avgRiskScore));
  const peakPoint = chartData.find((d) => d.avgRiskScore === peakScore) || chartData[5];

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4 text-slate-900 dark:text-slate-100">
      {/* Top Header & Interactive Toggles */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        {/* Title, Badge & Subtitle */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 border border-rose-200 dark:border-rose-900/50">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'BN' ? 'লেনদেনের ঝুঁকি সূচকের গতিধারা' : 'Transaction Risk & Anomaly Trends Over Time'}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE STREAM</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'BN'
                  ? 'প্রতি ঘণ্টার গড় ঝুঁকি স্কোর (০-১০০), ক্রিটিক্যাল অ্যালার্ট ভলিউম এবং অস্বাভাবিক গতিবিধি মনিটরিং'
                  : 'Fused risk score (0-100), critical alert surges & multi-factor velocity progression'}
              </p>
            </div>
          </div>
        </div>

        {/* Range Selectors & Filter Toggles Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
          {/* Time range segmented control */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setTimeRange('24H')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === '24H'
                  ? 'bg-white dark:bg-slate-900 text-[#0054A6] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              24-Hour View
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('BURST')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                timeRange === 'BURST'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Attack Burst (02:00–05:00)</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('ACTIVE')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === 'ACTIVE'
                  ? 'bg-white dark:bg-slate-900 text-[#0054A6] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Recent Window
            </button>
          </div>

          {/* Metric Visibility Toggles (Enhanced Part Boxed in Red) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAlerts(!showAlerts)}
              title={showAlerts ? 'Click to hide critical alerts line' : 'Click to show critical alerts line'}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
                showAlerts
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/80 shadow-xs ring-1 ring-amber-400/20'
                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {showAlerts && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    showAlerts ? 'bg-amber-500 shadow-xs' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              </span>
              <span className={showAlerts ? '' : 'line-through opacity-70'}>Critical Alerts</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVelocity(!showVelocity)}
              title={showVelocity ? 'Click to hide velocity index line' : 'Click to show velocity index line'}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
                showVelocity
                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-700/80 shadow-xs ring-1 ring-sky-400/20'
                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {showVelocity && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    showVelocity ? 'bg-sky-500 shadow-xs' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              </span>
              <span className={showVelocity ? '' : 'line-through opacity-70'}>Velocity Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Peak Risk Surge</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-500">{peakPoint.avgRiskScore}/100</span>
            <span className="text-[11px] text-slate-400 font-medium">at {peakPoint.time}</span>
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Rafiqul Islam Incident (৳80,000)</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Critical Alert Spike</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{peakPoint.criticalAlerts}</span>
            <span className="text-[11px] text-slate-400">flagged txns</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Mule Cluster #17 Active</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Guardian Baseline Threshold</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black font-mono text-slate-700 dark:text-slate-200">65.0</span>
            <span className="text-[11px] text-slate-400">cutoff</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Auto-Hold & Step-Up Rule</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Current Anomaly Status</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Stabilized (39.2)</span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">-58.3% from nocturnal peak</span>
        </div>
      </div>

      {/* Main Recharts Line & Area Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="riskScoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: 'Risk Score (0-100)',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10,
                fill: '#94a3b8',
                offset: 15,
              }}
            />

            {showVelocity && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 15]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#0284c7' }}
                label={{
                  value: 'Velocity Index',
                  angle: 90,
                  position: 'insideRight',
                  fontSize: 10,
                  fill: '#0284c7',
                  offset: 10,
                }}
              />
            )}

            {/* Critical Escalation Cutoff Line at Score 65 */}
            <ReferenceLine
              yAxisId="left"
              y={65}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Critical Escalation Threshold (65)',
                position: 'insideTopRight',
                fill: '#e11d48',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TrendPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-mono">
                        <span className="font-bold text-amber-400">{data.time} ({data.hourDisplay})</span>
                        {data.avgRiskScore >= 65 ? (
                          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                            CRITICAL
                          </span>
                        ) : data.avgRiskScore >= 40 ? (
                          <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-bold">
                            ELEVATED
                          </span>
                        ) : (
                          <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                            NORMAL
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Average Risk Score:
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {data.avgRiskScore} / 100
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          High-Risk Alerts:
                        </span>
                        <span className="font-mono font-bold text-amber-300">
                          {data.criticalAlerts} txns
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-sky-400" />
                          Velocity Anomaly:
                        </span>
                        <span className="font-mono font-bold text-sky-300">
                          {data.anomalyVelocity}x baseline
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                        <span>Surveillance Volume:</span>
                        <span className="font-mono text-slate-300">{data.volumeCount.toLocaleString()} txns</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
            />

            {/* Gradient Area under Risk Score */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="avgRiskScore"
              name="Risk Trend"
              fill="url(#riskScoreGrad)"
              stroke="none"
            />

            {/* Primary Risk Score Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgRiskScore"
              name="Avg Fused Risk Score"
              stroke="#e11d48"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#e11d48', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Critical Alert Counts Line */}
            {showAlerts && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="criticalAlerts"
                name="Critical Alerts"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 2.5, fill: '#f59e0b' }}
              />
            )}

            {/* Velocity Multiplier Line */}
            {showVelocity && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="anomalyVelocity"
                name="Anomaly Velocity (x)"
                stroke="#0284c7"
                strokeWidth={1.8}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Surveillance Window: Rolling 24 Hours · Real-Time Micro-Batch Ingestion</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Fused Score
          </span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged Incidents
          </span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Velocity Surge
          </span>
        </div>
      </div>
    </div>
  );
};
