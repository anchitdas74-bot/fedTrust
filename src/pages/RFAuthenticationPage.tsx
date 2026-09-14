import React, { useState } from 'react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import {
  Radio,
  Info,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const RFAuthenticationPage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedTerminalMode, setSelectedTerminalMode] = useState<'AUTHORIZED' | 'ROGUE'>('AUTHORIZED');

  const telemetry = {
    terminalId: selectedTerminalMode === 'AUTHORIZED' ? 'RF-TERM-8092' : 'RF-SPOOF-0914',
    authorizedTerminalId: 'RF-TERM-8092',
    isVerified: selectedTerminalMode === 'AUTHORIZED',
    trustScore: selectedTerminalMode === 'AUTHORIZED' ? 98.4 : 12.5,
    frequencyGHz: 2.45,
    rssiDbm: selectedTerminalMode === 'AUTHORIZED' ? -68.4 : -32.1,
    pathLossDb: selectedTerminalMode === 'AUTHORIZED' ? 44.2 : 78.6,
    returnLossS11Db: selectedTerminalMode === 'AUTHORIZED' ? -24.5 : -8.2,
    vswr: selectedTerminalMode === 'AUTHORIZED' ? 1.12 : 2.25
  };

  // S11 Spectrum Data Points for Recharts (2.40 - 2.50 GHz)
  const chartData = [
    { freq: '2.40', expectedS11: -12.2, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -12.0 : -8.1 },
    { freq: '2.41', expectedS11: -15.1, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -14.9 : -8.4 },
    { freq: '2.42', expectedS11: -18.7, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -18.5 : -8.2 },
    { freq: '2.43', expectedS11: -21.4, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -21.1 : -8.5 },
    { freq: '2.44', expectedS11: -23.8, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -23.4 : -8.3 },
    { freq: '2.45', expectedS11: -25.2, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -24.5 : -8.2 }, // Resonance notch
    { freq: '2.46', expectedS11: -22.9, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -22.6 : -8.4 },
    { freq: '2.47', expectedS11: -19.4, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -19.1 : -8.6 },
    { freq: '2.48', expectedS11: -16.2, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -16.0 : -8.1 },
    { freq: '2.49', expectedS11: -13.5, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -13.2 : -8.0 },
    { freq: '2.50', expectedS11: -10.8, observedS11: selectedTerminalMode === 'AUTHORIZED' ? -10.5 : -7.9 }
  ];

  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6">
      
      {/* Title & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-mono">
            <Radio className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>PHYSICAL-LAYER RF TERMINAL TRUST CENTER</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            2.45 GHz hardware RF signature matching, return-loss (S11) resonance spectroscopy, and physical environment validation.
          </p>
        </div>

        {/* Demo Mode Toggle: Authorized vs Rogue Terminal */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setSelectedTerminalMode('AUTHORIZED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTerminalMode === 'AUTHORIZED'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Authorized Terminal (RF-8092)
          </button>
          <button
            onClick={() => setSelectedTerminalMode('ROGUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTerminalMode === 'ROGUE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Spoofed / Rogue Terminal (Fail)
          </button>
        </div>
      </div>

      {/* Prominent RF Scope Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-cyan-800 dark:text-cyan-300 font-mono uppercase tracking-wider block">
            RF Physical-Layer Trust Scope:
          </strong>
          <p className="leading-relaxed">
            RF Verification validates that the POS terminal hardware and physical environment match registered CST electromagnetic microwave parameters (S11 Return Loss & RSSI). <strong>RF Terminal Trust does NOT prove cardholder identity or authorization.</strong>
          </p>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Terminal Identity */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono font-bold block">Terminal ID Match</span>
          <div className="font-mono text-lg font-extrabold text-cyan-700 dark:text-cyan-300">
            {telemetry.terminalId}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Authorized ID: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{telemetry.authorizedTerminalId}</span>
          </div>
        </div>

        {/* Metric 2: Carrier Frequency & RSSI */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono font-bold block">Carrier & Signal RSSI</span>
          <div className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
            {telemetry.frequencyGHz} GHz @ {telemetry.rssiDbm} dBm
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            Path Loss: {telemetry.pathLossDb} dB
          </div>
        </div>

        {/* Metric 3: Return Loss S11 & VSWR */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono font-bold block">S11 Resonance & VSWR</span>
          <div className={`font-mono text-lg font-extrabold ${telemetry.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {telemetry.returnLossS11Db} dB (VSWR {telemetry.vswr})
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Resonance Peak @ 2.45 GHz
          </div>
        </div>

        {/* Metric 4: Final Terminal Trust Score */}
        <div className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between ${
          telemetry.isVerified
            ? 'border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/70 dark:bg-cyan-950/20'
            : 'border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-slate-700 dark:text-slate-300">Terminal Trust</span>
            <StatusBadge type="rf" value={telemetry.isVerified ? 'VERIFIED' : 'UNVERIFIED'} size="sm" />
          </div>
          <div className={`font-mono text-2xl font-black mt-2 ${telemetry.isVerified ? 'text-cyan-700 dark:text-cyan-300' : 'text-rose-600 dark:text-rose-400'}`}>
            {telemetry.trustScore}% MATCH
          </div>
        </div>

      </div>

      {/* S11 Spectroscopy Graph View */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              S11 RETURN LOSS SPECTRUM COMPARISON (2.40 - 2.50 GHz)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparing baseline CST expected electromagnetic signature vs actual observed terminal spectrum.
            </p>
          </div>

          <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            Resonance Freq: 2.45 GHz
          </span>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="freq" stroke={axisColor} tick={{ fontSize: 12 }} label={{ value: 'Frequency (GHz)', position: 'insideBottom', offset: -5, fill: axisColor, fontSize: 12 }} />
              <YAxis stroke={axisColor} tick={{ fontSize: 12 }} label={{ value: 'Return Loss S11 (dB)', angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="expectedS11"
                name="Expected S11 Baseline (Authorized CST)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="observedS11"
                name="Observed RF Spectrum"
                stroke={telemetry.isVerified ? '#10b981' : '#ef4444'}
                strokeWidth={2.5}
                strokeDasharray={telemetry.isVerified ? undefined : '5 5'}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
