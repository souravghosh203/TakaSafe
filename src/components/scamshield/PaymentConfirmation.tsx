import React from 'react';
import { AlertTriangle, Clock, ArrowLeft, ShieldAlert, Check, PauseCircle } from 'lucide-react';
import { RiskScore } from './RiskScore';
import { RiskLevelBadge, RiskLevel } from './RiskLevelBadge';

interface PaymentConfirmationProps {
  mode: 'CONFIRM_OVERRIDE' | 'DELAYED_PAUSE';
  riskScore: number;
  riskLevel: RiskLevel;
  amount: number;
  recipient: string;
  onConfirmPayment: () => void;
  onGoBack: () => void;
  isProcessing?: boolean;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  mode,
  riskScore,
  riskLevel,
  amount,
  recipient,
  onConfirmPayment,
  onGoBack,
  isProcessing = false,
}) => {
  if (mode === 'DELAYED_PAUSE') {
    return (
      <div className="py-6 px-3 flex flex-col items-center justify-center text-center space-y-4 select-none animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 shadow-sm">
          <PauseCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1 max-w-xs">
          <h4 className="text-base font-black text-slate-900 dark:text-white">
            Payment Paused
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Take a moment to verify the recipient before continuing. Your funds remain safe in your wallet.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 w-full text-xs font-mono text-slate-700 dark:text-slate-300 text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Held Amount:</span>
            <strong>৳{amount.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Recipient:</span>
            <strong className="truncate max-w-[170px]">{recipient}</strong>
          </div>
        </div>

        <div className="pt-2 w-full">
          <button
            type="button"
            onClick={onGoBack}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0054A6] hover:bg-[#004080] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Payment</span>
          </button>
        </div>
      </div>
    );
  }

  // CONFIRM_OVERRIDE Mode
  return (
    <div className="py-4 px-2 space-y-5 text-center select-none animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 px-3 py-1 rounded-full text-rose-700 dark:text-rose-300 text-xs font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Elevated Risk Warning</span>
        </div>
        <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
          ScamShield detected elevated risk.
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Please confirm you trust this counterparty and intend to proceed despite anomalous risk indicators.
        </p>
      </div>

      {/* Prominent Risk Badge Display */}
      <div className="flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <RiskScore score={riskScore} size="sm" showSubtitle={false} />
        <div className="text-left">
          <RiskLevelBadge level={riskLevel} />
          <span className="text-[11px] font-mono text-slate-500 block mt-1">
            Transfer: ৳{amount.toLocaleString()} to {recipient}
          </span>
        </div>
      </div>

      {/* Customer Explicit Confirmation Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          disabled={isProcessing}
          onClick={onConfirmPayment}
          className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <Check className="w-4 h-4" />
          <span>Confirm Payment</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onGoBack}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};
