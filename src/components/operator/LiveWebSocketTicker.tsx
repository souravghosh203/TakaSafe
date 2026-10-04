import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import {
  Radio,
  Zap,
  ShieldAlert,
  Eye,
  AlertTriangle,
  Play,
  Pause,
  Download,
  FileCheck2,
  Activity,
  ArrowRight,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface LiveWebSocketTickerProps {
  latestTransaction: Transaction | null;
  isFlashing: boolean;
  onOpenInvestigation: (transaction: Transaction) => void;
  onSimulateSpike: () => void;
  onOpenComplianceReport: () => void;
  onDownloadCSV: () => void;
  lang: 'EN' | 'BN';
}

export const LiveWebSocketTicker: React.FC<LiveWebSocketTickerProps> = ({
  latestTransaction,
  isFlashing,
  onOpenInvestigation,
  onSimulateSpike,
  onOpenComplianceReport,
  onDownloadCSV,
  lang,
}) => {
  const [latency, setLatency] = useState<number>(9);
  const [eventCount, setEventCount] = useState<number>(142);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Subtle real-time ping fluctuation for authentic WebSocket feel
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(Math.floor(7 + Math.random() * 6));
      if (!isPaused) {
        setEventCount((prev) => prev + 1);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const isHighRisk = latestTransaction && (latestTransaction.fusedRiskScore >= 75 || latestTransaction.riskBand === 'CRITICAL' || latestTransaction.riskBand === 'HIGH');

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isFlashing
          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-400/50 shadow-md animate-pulse'
          : 'bg-white dark:bg-[#0F172A] border-slate-200/90 dark:border-slate-800 shadow-xs'
      }`}
    >
      {/* Flashing Alert Banner when high-risk transaction is intercepted */}
      {isFlashing && (
        <div className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>CRITICAL ALERT: High-Risk Transaction Intercepted by Transaction Guardian</span>
          </div>
          <span className="font-mono text-[10px] bg-black/25 px-2 py-0.5 rounded font-bold">
            Score: {latestTransaction?.fusedRiskScore}/100
          </span>
        </div>
      )}

      {/* Main Ticker Stream Bar */}
      <div className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200">
        {/* Left: WebSocket Connection Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-mono shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isPaused ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-bold">WS:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isPaused ? 'PAUSED' : 'STREAMING'}</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{latency}ms</span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden xl:inline">
            wss://guardian.stream.takasafe.internal
          </span>
        </div>

        {/* Center: Live Transaction Ticker Item */}
        <div className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[240px] max-w-2xl flex items-center gap-2 sm:gap-2.5 bg-slate-50 dark:bg-slate-900/70 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          {latestTransaction ? (
            <>
              <span className="text-[10px] font-mono font-bold text-[#0054A6] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50 shrink-0">
                {latestTransaction.id}
              </span>

              <div className="flex items-center gap-1.5 text-xs truncate flex-1">
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]" title={latestTransaction.senderName}>
                  {latestTransaction.senderName}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[130px]" title={latestTransaction.receiverName}>
                  {latestTransaction.receiverName}
                </span>
              </div>

              <span className="font-mono font-black text-slate-900 dark:text-white shrink-0">
                ৳{latestTransaction.amount.toLocaleString()}
              </span>

              <span
                className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md shrink-0 border ${
                  latestTransaction.fusedRiskScore >= 75
                    ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80 animate-pulse'
                    : latestTransaction.fusedRiskScore >= 50
                    ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                }`}
              >
                {latestTransaction.fusedRiskScore}/100
              </span>

              <button
                onClick={() => onOpenInvestigation(latestTransaction)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-[#0054A6] hover:bg-[#004080] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                title="Inspect in Explainable AI Guardian"
              >
                <Eye className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">Investigate</span>
              </button>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs italic">Awaiting real-time stream packet...</span>
          )}
        </div>

        {/* Right: Actions (Simulate Spike & Compliance Export) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pause / Resume Ticker */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title={isPaused ? 'Resume live WebSocket stream' : 'Pause live WebSocket stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Simulate High-Risk Attack Spike Button */}
          <button
            onClick={onSimulateSpike}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all transform active:scale-95 cursor-pointer border border-rose-700/20"
            title="Inject simulated high-risk transaction into the stream"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Simulate High-Risk Attack</span>
          </button>

          {/* Export Compliance Report Button */}
          <div className="flex items-center rounded-xl bg-[#0054A6] hover:bg-[#004080] text-white shadow-xs border border-[#004080] transition-colors p-0.5">
            <button
              onClick={onOpenComplianceReport}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer hover:bg-black/15"
              title="Open Regulatory Compliance PDF Report"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Compliance Report (PDF)</span>
            </button>
            <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
            <button
              onClick={onDownloadCSV}
              className="p-1 text-blue-100 hover:text-white hover:bg-black/15 rounded-lg transition-colors cursor-pointer"
              title="Download Audit Logs CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
