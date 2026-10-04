import React, { useState } from 'react';
import { RegionalRiskMetric } from '../../types';
import { Radar, AlertTriangle, ShieldCheck, MapPin, Activity, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

interface EarlyWarningRadarProps {
  metrics: RegionalRiskMetric[];
  onActivateMonitoring: (division: string) => void;
}

export const EarlyWarningRadar: React.FC<EarlyWarningRadarProps> = ({
  metrics,
  onActivateMonitoring,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('Barishal');
  const [activatedMap, setActivatedMap] = useState<Record<string, boolean>>({ Barishal: true });

  const activeRegion = metrics.find((m) => m.division === selectedDivision) || metrics[0];

  const handleActivate = (division: string) => {
    onActivateMonitoring(division);
    setActivatedMap((prev) => ({ ...prev, [division]: true }));
  };

  const getStatusBadge = (status: RegionalRiskMetric['status']) => {
    switch (status) {
      case 'CRITICAL_EMERGENCY':
        return 'bg-red-500 text-white';
      case 'EMERGING_RISK':
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      case 'ELEVATED':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'STABLE':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Novel Differentiator Header */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0054A6] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                <Radar className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Financial Early-Warning Radar
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Ecosystem-level intelligence fusing fraud spikes, scam waves, agent liquidity drain, and meteorological signals across Bangladesh’s 8 administrative divisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">National Ecosystem Risk:</span>
            <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 shadow-2xs">
              39.2 / 100 (ELEVATED)
            </span>
          </div>
        </div>

        {/* 8 Divisions Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
          {metrics.map((m) => {
            const isSelected = m.division === selectedDivision;
            return (
              <div
                key={m.division}
                onClick={() => setSelectedDivision(m.division)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-center relative ${
                  isSelected
                    ? 'border-[#0054A6] bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-[#0054A6]/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m.riskScore >= 70 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{m.division}</span>
                <span
                  className={`text-lg font-black font-mono mt-1 block ${
                    m.riskScore >= 70
                      ? 'text-rose-600 dark:text-rose-400'
                      : m.riskScore >= 40
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {m.riskScore}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                  {m.status.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Division Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Signals Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0054A6] dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeRegion.division} Division Radar Diagnostic
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(activeRegion.status)}`}>
                  {activeRegion.status.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Weather / Infrastructure Disruption: <strong className="text-slate-800 dark:text-slate-200">{activeRegion.activeDisruption}</strong>
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Regional Risk Score</span>
              <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-500">
                {activeRegion.riskScore}/100
              </span>
            </div>
          </div>

          {/* Fused Signal Progress Bars */}
          <div className="space-y-4 mt-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
                  Fraud Velocity & Anomaly Signal Delta
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400">+{activeRegion.fraudSignalDelta}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeRegion.fraudSignalDelta * 2.5)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
                  Scam Activity & Social Engineering Surge
                </span>
                <span className="font-mono text-amber-600 dark:text-amber-400">+{activeRegion.scamSignalDelta}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeRegion.scamSignalDelta * 3)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block"></span>
                  Mule Network & Topology Anomalies
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400">+{activeRegion.networkAnomalyDelta}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeRegion.networkAnomalyDelta * 4)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></span>
                  Cash-Out Surge Spike
                </span>
                <span className="font-mono text-sky-600 dark:text-sky-400">+{activeRegion.cashOutSurgeDelta}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeRegion.cashOutSurgeDelta * 2)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block"></span>
                  Agent Liquidity Depletion Pressure
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400">{activeRegion.liquidityDrainDelta}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.abs(activeRegion.liquidityDrainDelta) * 2.5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Engine Recommendation Card */}
        <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6] dark:from-[#0F172A] dark:via-[#111827] dark:to-[#0F172A] text-slate-900 dark:text-slate-100 rounded-2xl p-6 flex flex-col justify-between border border-amber-200/90 dark:border-slate-800 shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider mb-2 border border-amber-300/70 dark:border-amber-800/60">
              Action Engine Policy
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Recommended Intervention</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Based on the <strong className="text-slate-900 dark:text-white">{activeRegion.riskScore}/100</strong> regional score in {activeRegion.division}, the platform has elevated the threat posture to <strong className="text-rose-700 dark:text-rose-400 font-bold">EMERGING FINANCIAL RISK</strong>.
            </p>

            <div className="bg-white/95 dark:bg-slate-900/80 rounded-xl p-3.5 mt-4 border border-amber-200/90 dark:border-slate-800 space-y-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
                <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Protocol: Level-3 Proactive Monitoring</span>
              </div>
              <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                <li>Decrease threshold for pre-payment ScamShield interventions in {activeRegion.division} from ৳50,000 to ৳15,000.</li>
                <li>Pre-allocate BDT 1.5M reserve liquidity with UCB Taqwa regional cash depot.</li>
                <li>Enforce geo-fencing checks on high-speed outbound agent withdrawals.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-200/80 dark:border-slate-800">
            {activatedMap[activeRegion.division] ? (
              <div className="flex items-center justify-center gap-2 p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Elevated Regional Monitoring Active</span>
              </div>
            ) : (
              <button
                onClick={() => handleActivate(activeRegion.division)}
                className="w-full flex items-center justify-center gap-2 bg-[#FAB915] hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Activate Regional Monitoring</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
