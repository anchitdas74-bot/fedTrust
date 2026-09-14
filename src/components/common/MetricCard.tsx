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
    cyan: { iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', border: 'hover:border-cyan-500/50' },
    green: { iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', border: 'hover:border-emerald-500/50' },
    amber: { iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', border: 'hover:border-amber-500/50' },
    rose: { iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', border: 'hover:border-rose-500/50' },
    purple: { iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', border: 'hover:border-purple-500/50' },
    blue: { iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', border: 'hover:border-blue-500/50' }
  }[color];

  const trendColor = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral: 'text-gray-400'
  }[trendType];

  return (
    <div className={`glass-panel p-5 rounded-xl border border-gray-800/80 dark:border-gray-800 transition-all duration-300 ${colorMap.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        <div className={`p-2.5 rounded-lg border ${colorMap.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-gray-100">{value}</div>
        {trend && <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>}
      </div>
      {subtext && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
    </div>
  );
};
