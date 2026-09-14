import React from 'react';
import type { RiskLevel, TransactionStatus } from '../../types';
import { CheckCircle2, AlertTriangle, ShieldX, Clock, Radio, Cpu } from 'lucide-react';

interface StatusBadgeProps {
  type: 'risk' | 'status' | 'action' | 'rf' | 'ml';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
    lg: 'px-3 py-1.5 text-sm font-bold tracking-wide'
  }[size];

  if (type === 'risk') {
    const risk = value as RiskLevel;
    switch (risk) {
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 shadow-2xs ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 shadow-2xs ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 shadow-2xs ${sizeClasses}`}>
            <ShieldX className="w-3.5 h-3.5" />
            HIGH RISK
          </span>
        );
      default:
        return <span className={sizeClasses}>{value}</span>;
    }
  }

  if (type === 'status') {
    const status = value as TransactionStatus;
    switch (status) {
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-2xs ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 animate-pulse shadow-2xs ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5" />
            PENDING VERIFICATION
          </span>
        );
      case 'BLOCKED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shadow-2xs ${sizeClasses}`}>
            <ShieldX className="w-3.5 h-3.5" />
            BLOCKED
          </span>
        );
      default:
        return <span className={sizeClasses}>{value}</span>;
    }
  }

  if (type === 'rf') {
    const isVerified = value === 'VERIFIED' || value === 'true';
    return isVerified ? (
      <span className={`inline-flex items-center gap-1 rounded-md bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 shadow-2xs ${sizeClasses}`}>
        <Radio className="w-3.5 h-3.5" />
        RF TRUSTED
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1 rounded-md bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 shadow-2xs ${sizeClasses}`}>
        <Radio className="w-3.5 h-3.5" />
        RF UNVERIFIED
      </span>
    );
  }

  if (type === 'ml') {
    const isAnomalous = value === 'ANOMALOUS' || value === 'true';
    return isAnomalous ? (
      <span className={`inline-flex items-center gap-1 rounded-md bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 shadow-2xs ${sizeClasses}`}>
        <Cpu className="w-3.5 h-3.5" />
        ML ANOMALY
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1 rounded-md bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 shadow-2xs ${sizeClasses}`}>
        <Cpu className="w-3.5 h-3.5" />
        ML NORMAL
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs ${sizeClasses}`}>
      {value}
    </span>
  );
};
