import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import { useTheme } from '../context/ThemeContext';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const AIExplainabilityPage: React.FC = () => {
  const { transactions } = useSystem();
  const { theme } = useTheme();
  const [selectedTxnId, setSelectedTxnId] = useState(transactions[1]?.id || transactions[0]?.id);

  const selectedTxn = transactions.find(t => t.id === selectedTxnId) || transactions[0];

  const shapData = selectedTxn.shapFeatures.map(feat => ({
    feature: feat.feature,
    contribution: feat.contribution,
    displayValue: feat.displayValue,
    isPositive: feat.isPositive
  }));

  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6">
      
      {/* Title & Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-mono">
            <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>AI EXPLAINABILITY & SHAP ATTRIBUTION</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Understanding why PyTorch Autoencoder models and Risk Engines flagged specific transactions.
          </p>
        </div>

        {/* Transaction Lookup Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Select Txn:</label>
          <select
            value={selectedTxnId}
            onChange={e => setSelectedTxnId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-xs"
          >
            {transactions.map(t => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.merchant} (${t.amount.toFixed(2)}) [{t.riskLevel}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Transaction Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 flex-1 w-full">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">{selectedTxn.id}</span>
            <StatusBadge type="risk" value={selectedTxn.riskLevel} size="sm" />
            <StatusBadge type="status" value={selectedTxn.status} size="sm" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {selectedTxn.merchant} (${selectedTxn.amount.toFixed(2)})
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-gray-300 pt-2 font-mono">
            <div>Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTxn.category}</span></div>
            <div>Location: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTxn.location}</span></div>
            <div>Timestamp: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTxn.timestamp}</span></div>
            <div>Terminal ID: <span className="font-semibold text-cyan-700 dark:text-cyan-300">{selectedTxn.terminalId}</span></div>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 flex items-center justify-center">
          <RiskGauge score={selectedTxn.finalRiskScore} label="Risk Score" size={120} />
        </div>
      </div>

      {/* Plain Language AI Narrative Summary Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 dark:from-purple-950/60 dark:via-indigo-950/60 dark:to-purple-950/60 border border-purple-200 dark:border-purple-500/30 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          AI Explainability Narrative Summary
        </div>
        <p className="text-sm font-semibold text-purple-950 dark:text-purple-100 leading-relaxed">
          “{selectedTxn.explanation}”
        </p>
      </div>

      {/* SHAP Feature Attribution Waterfall / Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              SHAP FEATURE ATTRIBUTION BREAKDOWN (+ / - RISK CONTRIBUTIONS)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Positive values (+) increase transaction risk score; negative values (-) decrease risk score.
            </p>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={shapData} margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={axisColor} tick={{ fontSize: 12 }} label={{ value: 'SHAP Risk Contribution (%)', position: 'insideBottom', offset: -5, fill: axisColor, fontSize: 12 }} />
              <YAxis dataKey="feature" type="category" stroke={axisColor} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [`${value > 0 ? '+' : ''}${value}%`, 'SHAP Risk Contribution']}
              />
              <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                {shapData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.contribution > 0 ? '#ef4444' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Value Matrix Table */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">Observed Feature Values vs Baseline Impact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedTxn.shapFeatures.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-gray-200 block">{feat.feature}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">{feat.displayValue}</span>
                </div>
                <div className={`font-mono font-bold flex items-center gap-1 ${
                  feat.contribution > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {feat.contribution > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{feat.contribution > 0 ? `+${feat.contribution}%` : `${feat.contribution}%`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
