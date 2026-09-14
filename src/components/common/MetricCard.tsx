import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'cyan' | 'green' | 'amber' | 'rose' | 'purple' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'neutral',
  color = 'cyan'
}) => {
  const colorMap = {
    cyan: {
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 dark:border-cyan-500/30',
      border: 'hover:border-cyan-400/50 dark:hover:border-cyan-500/40'
    },
    green: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30',
      border: 'hover:border-emerald-400/50 dark:hover:border-emerald-500/40'
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
      border: 'hover:border-amber-400/50 dark:hover:border-amber-500/40'
    },
    rose: {
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30',
      border: 'hover:border-rose-400/50 dark:hover:border-rose-500/40'
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30',
      border: 'hover:border-purple-400/50 dark:hover:border-purple-500/40'
    },
    blue: {
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
      border: 'hover:border-blue-400/50 dark:hover:border-blue-500/40'
    }
  }[color];

  const trendColor = {
    positive: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    negative: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
  }[trendType];

  return (
    <div className={`glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 hover:shadow-md ${colorMap.border} group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-105 ${colorMap.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">{value}</div>
        {trend && <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${trendColor}`}>{trend}</span>}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-normal">{subtext}</p>}
    </div>
  );
};
