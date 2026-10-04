import React, { useState } from 'react';
import { Send, QrCode, Clock, Sparkles, Shield, User, HelpCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: string;
  recipient: string;
  note: string;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenQRScanner?: () => void;
  onPrefillScenario?: (type: 'NORMAL' | 'RISKY') => void;
  recentAverage?: number;
  isAnalyzing?: boolean;
  lang?: 'EN' | 'BN';
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  recipient,
  note,
  onAmountChange,
  onRecipientChange,
  onNoteChange,
  onSubmit,
  onOpenQRScanner,
  onPrefillScenario,
  recentAverage = 1500,
  isAnalyzing = false,
  lang = 'EN',
}) => {
  const [showPresets, setShowPresets] = useState<boolean>(true);

  // Current time in Bangladesh (UTC+6)
  const currentBst = new Date().toLocaleTimeString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left select-none">
      {/* Quick scenario selector for testing */}
      {onPrefillScenario && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-500 font-semibold pl-1">
            Test Scenarios:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPrefillScenario('NORMAL')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              Normal (৳1.5k)
            </button>
            <button
              type="button"
              onClick={() => onPrefillScenario('RISKY')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-mono font-bold text-[11px] border border-rose-200 dark:border-rose-900 transition-colors shadow-2xs cursor-pointer"
            >
              High Risk (৳75k Mule)
            </button>
          </div>
        </div>
      )}

      {/* Recipient Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === 'BN' ? 'প্রাপকের ওয়ালেট নম্বর' : 'Recipient Wallet / Mobile No.'}
          </label>
          {onOpenQRScanner && (
            <button
              type="button"
              onClick={onOpenQRScanner}
              className="text-[11px] text-[#0054A6] dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            required
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="e.g. 019XXXXXXXX or 017XXXXXXXX"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
          />
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
          {lang === 'BN' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT ৳)'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-2.5 text-slate-400 font-mono font-bold text-base">
            ৳
          </span>
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="75000"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-lg font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5">
          <span>90-Day Typical Avg: ৳{Math.round(recentAverage).toLocaleString()}</span>
          <span className="font-mono flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" /> {currentBst} BST
          </span>
        </div>
      </div>

      {/* Reference Note (Context) */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
          Payment Context / Reference (Optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="e.g. Urgent family loan, supplier payment"
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
        />
      </div>

      {/* Submit Button: Review Payment */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isAnalyzing || !amount || !recipient}
          className="w-full bg-[#FAB915] hover:bg-[#e5a80f] text-slate-950 font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{lang === 'BN' ? 'পেমেন্ট পর্যালোচনা করুন' : 'Review Payment'}</span>
        </button>
      </div>
    </form>
  );
};
