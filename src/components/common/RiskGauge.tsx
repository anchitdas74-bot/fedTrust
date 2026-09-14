import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  label?: string;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, label = 'Risk Score', size = 120 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = '#10b981'; // Emerald (0-30)
  if (score > 30 && score <= 70) colorClass = '#f59e0b'; // Amber (31-70)
  if (score > 70) colorClass = '#ef4444'; // Red (71-100)

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800 transition-colors"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold tracking-tight font-mono" style={{ color: colorClass }}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            / 100
          </span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">{label}</span>}
    </div>
  );
};
