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

  let colorClass = '#10B981'; // Green (0-30)
  if (score > 30 && score <= 70) colorClass = '#F59E0B'; // Amber (31-70)
  if (score > 70) colorClass = '#EF4444'; // Red (71-100)

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
            className="text-gray-800 dark:text-gray-800/60"
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
          <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-400 tracking-wider">
            / 100
          </span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-medium text-gray-400">{label}</span>}
    </div>
  );
};
