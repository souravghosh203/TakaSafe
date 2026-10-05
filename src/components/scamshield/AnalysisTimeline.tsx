import React from 'react';

interface AnalysisTimelineProps {
  currentStage: number; // 1 to 5
  lang?: 'EN' | 'BN';
  showProgressBar?: boolean;
  progressPercent?: number;
  statusMessage?: string;
  isLive?: boolean;
}

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({
  currentStage = 1,
  lang = 'EN',
  showProgressBar = true,
  progressPercent,
  statusMessage,
  isLive = false,
}) => {
  const isBn = lang === 'BN';

  const steps = isBn
    ? [
        {
          id: 1,
          line1: 'লেনদেন',
          line2: 'ইনপুট',
          descLine1: 'গ্রাহকের পেমেন্ট রিকোয়েস্ট ও ইনপুট ডেটা সংগ্রহ।',
          descLine2: 'টোকেন ভ্যালিডেশন এবং পেরামিটার রেট লিমিট যাচাই।',
        },
        {
          id: 2,
          line1: 'কনটেক্সট',
          line2: 'চেক',
          descLine1: 'গ্রাহকের স্বাভাবিক আচরণ, ডিভাইস ও সময়ের অসঙ্গতি পরীক্ষা।',
          descLine2: 'প্রাপকের পূর্ব ইতিহাস, ভেলোসিটি এবং আঞ্চলিক ঝুঁকি মূল্যায়ন।',
        },
        {
          id: 3,
          line1: 'এআই রিস্ক',
          line2: 'ইঞ্জিন',
          descLine1: 'ক্যালিব্রেটেড মেশিন লার্নিং মডেলে নিখুঁত ঝুঁকি স্কোর নির্ণয়।',
          descLine2: 'কনফর্মাল প্রেডিকশন ও ডাউট চেকের মাধ্যমে অভিনব ঝুঁকি শনাক্তকরণ।',
        },
        {
          id: 4,
          line1: 'প্রমাণ',
          line2: 'যাচাই',
          descLine1: 'SHAP বিশ্লেষণের মাধ্যমে ঝুঁকির মূল ফ্যাক্টরগুলো গাণিতিক ব্যাখ্যা।',
          descLine2: 'মিউল নেটওয়ার্ক ও সন্দেহজনক সংযোগের প্রমাণ খতিয়ে দেখা।',
        },
        {
          id: 5,
          line1: 'সিদ্ধান্ত',
          line2: 'পর্যালোচনা',
          descLine1: 'অ্যাকশন ইঞ্জিনে অনুমোদিত, কুলিং-অফ বা ব্লক করার সুপারিশ।',
          descLine2: 'গ্রাহক স্বায়ত্তশাসন রক্ষা এবং সম্পূর্ণ অডিট লগ সংরক্ষণ।',
        },
      ]
    : [
        {
          id: 1,
          line1: 'Transaction',
          line2: 'Input',
          descLine1: 'Customer initiates payment with amount, recipient, and channel metadata.',
          descLine2: 'Perimeter gateway applies token validation and velocity rate limiting.',
        },
        {
          id: 2,
          line1: 'Context',
          line2: 'Check',
          descLine1: 'Evaluates behavioral baselines, nocturnal timing, and device fingerprint drift.',
          descLine2: 'Cross-checks recipient novelty, velocity bursts, and regional risk signals.',
        },
        {
          id: 3,
          line1: 'AI Risk',
          line2: 'Engine',
          descLine1: 'Calibrated ML models (LightGBM/XGBoost) compute precise risk probabilities.',
          descLine2: 'Conformal doubt checks flag model uncertainty and novel attack vectors.',
        },
        {
          id: 4,
          line1: 'Evidence',
          line2: 'Check',
          descLine1: 'SHAP decomposition attributes risk contributions to specific behavioral factors.',
          descLine2: 'Mule network graph analysis detects mule rings and coercive syndicate patterns.',
        },
        {
          id: 5,
          line1: 'Decision',
          line2: 'Review',
          descLine1: 'Action Engine maps risk tiers to graduated outcomes (Allow, OTP, Cool-Off, Block).',
          descLine2: 'Preserves customer sovereignty with plain-language guidance and audit logging.',
        },
      ];

  // Calculated progress: if progressPercent provided, use it; otherwise map 1->20%, 2->40%, 3->60%, 4->80%, 5->100%
  const effectiveProgress = progressPercent ?? Math.min(100, Math.max(10, currentStage * 20));

  return (
    <div className="w-full select-none py-1 space-y-2">
      {/* 5-Stage Stepper Header */}
      <div className="flex items-center justify-between w-full gap-0.5 sm:gap-1 px-0.5 overflow-hidden">
        {steps.map((step, idx) => {
          const isPassed = currentStage > step.id;
          const isCurrent = currentStage === step.id;

          return (
            <React.Fragment key={step.id}>
              <div
                className="flex items-center gap-1 shrink-0 group cursor-default"
                title={`${step.line1} ${step.line2}:\n1. ${step.descLine1}\n2. ${step.descLine2}`}
              >
                <div
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold transition-all duration-300 shrink-0 ${
                    isPassed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#0054A6] text-white ring-2 ring-blue-300 dark:ring-blue-500 shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isPassed ? '✓' : step.id}
                </div>
                <div className="flex flex-col text-left leading-[1.1] justify-center">
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold transition-colors duration-200 whitespace-nowrap ${
                      isCurrent
                        ? 'text-slate-900 dark:text-white font-bold'
                        : isPassed
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.line1}
                  </span>
                  <span
                    className={`text-[8px] sm:text-[9px] font-medium transition-colors duration-200 whitespace-nowrap ${
                      isCurrent
                        ? 'text-slate-700 dark:text-slate-200 font-semibold'
                        : isPassed
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.line2}
                  </span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[2px] mx-0.5 transition-colors duration-300 rounded-full ${
                    currentStage > step.id ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Horizontal Progress Track Bar (As shown in Reference Pic 1) */}
      {showProgressBar && (
        <div className="space-y-1 pt-0.5">
          <div className="w-full h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                effectiveProgress >= 100
                  ? 'bg-emerald-500'
                  : isLive
                  ? 'bg-gradient-to-r from-[#0054A6] via-blue-500 to-[#FAB915]'
                  : 'bg-[#0054A6]'
              }`}
              style={{ width: `${effectiveProgress}%` }}
            />
          </div>

          {/* Micro Live Status indicator */}
          {statusMessage && (
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium px-0.5">
              <span className="flex items-center gap-1.5 truncate">
                {isLive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0054A6] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                <span className="truncate">{statusMessage}</span>
              </span>
              <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                {Math.round(effectiveProgress)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
