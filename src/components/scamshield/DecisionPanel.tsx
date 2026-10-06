import React from 'react';
import { UserCheck, Clock, ArrowLeft, Check } from 'lucide-react';
import { RiskLevel } from './RiskLevelBadge';

interface DecisionPanelProps {
  riskLevel: RiskLevel;
  onVerifyRecipient: () => void;
  onDelayPayment: () => void;
  onContinueAnyway: () => void;
  onBack?: () => void;
  isProcessing?: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  riskLevel,
  onVerifyRecipient,
  onDelayPayment,
  onContinueAnyway,
  onBack,
  isProcessing = false,
}) => {
  if (riskLevel === 'LOW') {
    return (
      <div className="pt-2 space-y-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onContinueAnyway}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <Check className="w-4 h-4" />
          <span>Continue Payment</span>
        </button>

        {onBack && (
          <div className="text-center pt-0.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onBack}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center justify-center gap-1 transition-colors cursor-pointer py-1 px-2 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Payment</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (riskLevel === 'MEDIUM') {
    return (
      <div className="pt-2 space-y-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onVerifyRecipient}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0054A6] hover:bg-[#004080] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#003875]"
        >
          <UserCheck className="w-4 h-4" />
          <span>Verify Recipient</span>
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          {onBack && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={onBack}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Payment</span>
            </button>
          )}

          <button
            type="button"
            disabled={isProcessing}
            onClick={onContinueAnyway}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            <span>Continue Anyway</span>
          </button>
        </div>
      </div>
    );
  }

  // HIGH or CRITICAL RISK
  return (
    <div className="pt-2 space-y-2.5">
      {/* Primary Actions: Verify Recipient & Delay Payment */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onVerifyRecipient}
          className="py-2.5 px-3 rounded-xl bg-[#0054A6] hover:bg-[#004080] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#003875]"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Verify Recipient</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onDelayPayment}
          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Delay Payment</span>
        </button>
      </div>

      {/* Secondary Actions: Back to Payment & Continue Anyway */}
      <div className="flex items-center justify-center gap-3 pt-1.5">
        {onBack && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Payment</span>
          </button>
        )}
        {onBack && <span className="text-slate-300 dark:text-slate-700">·</span>}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onContinueAnyway}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline decoration-slate-300 hover:decoration-slate-500 transition-all cursor-pointer py-1 px-1"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
};
