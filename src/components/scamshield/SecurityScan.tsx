import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, Sparkles, Cpu } from 'lucide-react';

interface SecurityScanProps {
  onComplete?: () => void;
  isAnalyzing: boolean;
}

export const SecurityScan: React.FC<SecurityScanProps> = ({
  isAnalyzing,
}) => {
  const [stagesCompleted, setStagesCompleted] = useState<number>(1);

  // Progressive micro-ticks during the in-flight API call
  useEffect(() => {
    if (!isAnalyzing) {
      setStagesCompleted(4);
      return;
    }

    setStagesCompleted(1);
    const t1 = setTimeout(() => setStagesCompleted((s) => Math.max(s, 2)), 60);
    const t2 = setTimeout(() => setStagesCompleted((s) => Math.max(s, 3)), 140);
    const t3 = setTimeout(() => setStagesCompleted((s) => Math.max(s, 4)), 220);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isAnalyzing]);

  const stages = [
    { id: 1, label: 'Transaction context' },
    { id: 2, label: 'Customer behavior' },
    { id: 3, label: 'Recipient signals' },
    { id: 4, label: 'AI risk analysis' },
  ];

  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-6">
      {/* Animated Shield Radar Pulse */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-[#0054A6]/10 border-2 border-[#0054A6]/30 flex items-center justify-center text-[#0054A6] shadow-lg relative z-10">
          <ShieldCheck className="w-10 h-10 animate-pulse stroke-[2]" />
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-[#0054A6]/40 animate-ping pointer-events-none" />
        <div className="absolute -inset-3 rounded-3xl bg-[#0054A6]/5 blur-md -z-0" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#0054A6]" />
          <span>Scanning payment...</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Running real-time XGBoost decision tree inference in memory
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="w-full max-w-xs bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 text-left">
        {stages.map((stage) => {
          const isDone = stagesCompleted >= stage.id;
          return (
            <div
              key={stage.id}
              className={`flex items-center gap-2.5 text-xs font-medium transition-all duration-150 ${
                isDone
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
              )}
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
