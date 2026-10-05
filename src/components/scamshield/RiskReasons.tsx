import React from 'react';
import { AlertTriangle, TrendingUp, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ReasonItem {
  label: string;
  impact: number;
}

interface RiskReasonsProps {
  reasons: ReasonItem[];
  title?: string;
  variant?: 'evidence' | 'bullets' | 'calm';
}

export const RiskReasons: React.FC<RiskReasonsProps> = ({
  reasons,
  title,
  variant = 'evidence',
}) => {
  if (!reasons || reasons.length === 0) return null;

  const defaultTitle =
    variant === 'calm'
      ? 'Security verification checks passed'
      : variant === 'evidence'
      ? 'WHY WE FLAGGED THIS'
      : 'Why this payment is unusual';

  const heading = title || defaultTitle;

  return (
    <div className="w-full space-y-2.5 text-left select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {heading}
        </span>
        {variant === 'evidence' && (
          <span className="text-[10px] font-mono text-slate-400">
            Feature Impact (%)
          </span>
        )}
      </div>

      <div className="space-y-2">
        {reasons.map((r, idx) => {
          if (variant === 'bullets') {
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800"
              >
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                <span className="font-medium">{r.label}</span>
              </div>
            );
          }

          if (variant === 'calm') {
            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{r.label}</span>
              </div>
            );
          }

          // Default: Evidence with impact percentages
          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{r.label}</span>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 shrink-0">
                +{r.impact}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
