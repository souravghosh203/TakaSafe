import React from 'react';

interface RiskScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  maxScore = 100,
  size = 'md',
  showSubtitle = true,
}) => {
  const clampedScore = Math.max(0, Math.min(maxScore, score));
  const percentage = (clampedScore / maxScore) * 100;

  // Determine color palette based on prototype bands
  const getColor = (s: number) => {
    if (s <= 30) {
      return {
        text: 'text-emerald-600 dark:text-emerald-400',
        stroke: '#10B981',
        bgStroke: 'rgba(16, 185, 129, 0.15)',
        glow: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (s <= 60) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        stroke: '#F59E0B',
        bgStroke: 'rgba(245, 158, 11, 0.15)',
        glow: 'rgba(245, 158, 11, 0.25)',
      };
    }
    if (s <= 80) {
      return {
        text: 'text-orange-600 dark:text-orange-400',
        stroke: '#EA580C',
        bgStroke: 'rgba(234, 88, 12, 0.15)',
        glow: 'rgba(234, 88, 12, 0.3)',
      };
    }
    return {
      text: 'text-rose-600 dark:text-rose-400',
      stroke: '#E11D48',
      bgStroke: 'rgba(225, 29, 72, 0.18)',
      glow: 'rgba(225, 29, 72, 0.35)',
    };
  };

  const palette = getColor(clampedScore);

  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6.5 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const viewBoxSize = (radius + strokeWidth) * 2;
  const center = viewBoxSize / 2;

  const fontClasses = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={viewBoxSize}
          height={viewBoxSize}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={palette.bgStroke}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={palette.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-black tracking-tight leading-none ${palette.text} ${fontClasses}`}>
            {clampedScore}
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-tighter mt-0.5">
            /{maxScore}
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mt-2">
          Risk Score
        </span>
      )}
    </div>
  );
};
