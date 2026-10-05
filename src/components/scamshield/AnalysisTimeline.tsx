import React from 'react';

interface AnalysisTimelineProps {
  currentStage: number; // 1 to 5
  lang?: 'EN' | 'BN';
}

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({
  currentStage = 1,
  lang = 'EN',
}) => {
  const isBn = lang === 'BN';

  const steps = isBn
    ? [
        { id: 1, line1: 'লেনদেন', line2: 'ইনপুট' },
        { id: 2, line1: 'কনটেক্সট', line2: 'চেক' },
        { id: 3, line1: 'এআই রিস্ক', line2: 'ইঞ্জিন' },
        { id: 4, line1: 'প্রমাণ', line2: 'যাচাই' },
        { id: 5, line1: 'সিদ্ধান্ত', line2: 'পর্যালোচনা' },
      ]
    : [
        { id: 1, line1: 'Transaction', line2: 'Input' },
        { id: 2, line1: 'Context', line2: 'Check' },
        { id: 3, line1: 'AI Risk', line2: 'Engine' },
        { id: 4, line1: 'Evidence', line2: 'Check' },
        { id: 5, line1: 'Decision', line2: 'Review' },
      ];

  return (
    <div className="w-full select-none py-1">
      <div className="flex items-center justify-between w-full gap-1 sm:gap-1.5 py-1 px-1">
        {steps.map((step, idx) => {
          const isPassed = currentStage > step.id;
          const isCurrent = currentStage === step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all shrink-0 ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0054A6] text-white ring-2 ring-blue-300 dark:ring-blue-500 shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isPassed ? '✓' : step.id}
                </div>
                <div className="flex flex-col text-left leading-tight min-h-[26px] justify-center">
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      isCurrent
                        ? 'text-slate-900 dark:text-white font-bold'
                        : isPassed
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.line1}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-medium transition-colors whitespace-nowrap ${
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
                  className={`h-0.5 flex-1 min-w-[4px] sm:min-w-[10px] mx-0.5 sm:mx-1 transition-colors rounded-full ${
                    currentStage > step.id ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
