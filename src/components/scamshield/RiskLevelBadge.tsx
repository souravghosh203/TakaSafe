import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  level,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const config = {
    LOW: {
      label: 'LOW RISK',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    HIGH: {
      label: 'HIGH RISK',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: AlertCircle,
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    CRITICAL: {
      label: 'CRITICAL RISK',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: ShieldAlert,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  }[level] || {
    label: 'UNKNOWN',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: ShieldCheck,
    iconColor: 'text-slate-500',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-bold rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-75 text-[10px]">({score}/100)</span>
      )}
    </span>
  );
};
