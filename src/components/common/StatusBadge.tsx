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
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold'
  }[size];

  if (type === 'risk') {
    const risk = value as RiskLevel;
    switch (risk) {
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
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
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/40 animate-pulse ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5" />
            PENDING VERIFICATION
          </span>
        );
      case 'BLOCKED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/40 ${sizeClasses}`}>
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
      <span className={`inline-flex items-center gap-1 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 ${sizeClasses}`}>
        <Radio className="w-3.5 h-3.5" />
        RF TRUSTED
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
        <Radio className="w-3.5 h-3.5" />
        RF UNVERIFIED
      </span>
    );
  }

  if (type === 'ml') {
    const isAnomalous = value === 'ANOMALOUS' || value === 'true';
    return isAnomalous ? (
      <span className={`inline-flex items-center gap-1 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 ${sizeClasses}`}>
        <Cpu className="w-3.5 h-3.5" />
        ML ANOMALY
      </span>
    ) : (
      <span className={`inline-flex items-center gap-1 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 ${sizeClasses}`}>
        <Cpu className="w-3.5 h-3.5" />
        ML NORMAL
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md bg-gray-500/15 text-gray-300 border border-gray-500/30 ${sizeClasses}`}>
      {value}
    </span>
  );
};
