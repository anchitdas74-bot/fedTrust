import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { MOCK_RF_TELEMETRY, UNVERIFIED_RF_TELEMETRY } from '../services/mockData';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Radio,
  Activity,
  Info
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
  const { rfServiceStatus } = useSystem();
  const [selectedTerminalMode, setSelectedTerminalMode] = useState<'AUTHORIZED' | 'ROGUE'>('AUTHORIZED');

  const telemetry = selectedTerminalMode === 'AUTHORIZED' ? MOCK_RF_TELEMETRY : UNVERIFIED_RF_TELEMETRY;

  // Combine expected and observed signature datasets for Recharts
  const chartData = telemetry.expectedSignature.map((exp, idx) => ({
    freq: exp.freq.toFixed(2),
    expectedS11: exp.s11,
    observedS11: telemetry.observedSignature[idx]?.s11 || exp.s11
  }));

  if (rfServiceStatus === 'unavailable') {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-rose-800/50 text-center space-y-4 max-w-xl mx-auto my-12">
        <Radio className="w-12 h-12 text-rose-400 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-rose-300">RF Hardware Telemetry Service Offline</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          The RF physical-layer hardware connection is unavailable. To protect system integrity, terminal trust status is set to RF DATA UNAVAILABLE rather than falsely displaying a verified terminal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Terminal Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-mono">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>PHYSICAL-LAYER RF TERMINAL TRUST CENTER</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            2.45 GHz hardware RF signature matching, return-loss (S11) resonance spectroscopy, and physical environment validation.
          </p>
        </div>

        {/* Demo Mode Toggle: Authorized vs Rogue Terminal */}
        <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setSelectedTerminalMode('AUTHORIZED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTerminalMode === 'AUTHORIZED'
                ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Authorized Terminal (RF-8092)
          </button>
          <button
            onClick={() => setSelectedTerminalMode('ROGUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTerminalMode === 'ROGUE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Spoofed / Rogue Terminal (Fail)
          </button>
        </div>
      </div>

      {/* Prominent RF Scope Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-cyan-300 font-mono uppercase tracking-wider block">
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
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 uppercase font-mono block">Terminal ID Match</span>
          <div className="font-mono text-lg font-extrabold text-cyan-300">
            {telemetry.terminalId}
          </div>
          <div className="text-xs text-gray-400">
            Authorized ID: <span className="font-mono text-gray-200">{telemetry.authorizedTerminalId}</span>
          </div>
        </div>

        {/* Metric 2: Carrier Frequency & RSSI */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 uppercase font-mono block">Carrier & Signal RSSI</span>
          <div className="font-mono text-lg font-extrabold text-white">
            {telemetry.frequencyGHz} GHz @ {telemetry.rssiDbm} dBm
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            Path Loss: {telemetry.pathLossDb} dB
          </div>
        </div>

        {/* Metric 3: Return Loss S11 & VSWR */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 uppercase font-mono block">S11 Resonance & VSWR</span>
          <div className={`font-mono text-lg font-extrabold ${telemetry.isVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
            {telemetry.returnLossS11Db} dB (VSWR {telemetry.vswr})
          </div>
          <div className="text-xs text-gray-400">
            Resonance Peak @ 2.45 GHz
          </div>
        </div>

        {/* Metric 4: Final Terminal Trust Score */}
        <div className={`glass-panel p-5 rounded-xl border flex flex-col justify-between ${
          telemetry.isVerified ? 'border-cyan-800/60 bg-cyan-950/20' : 'border-rose-800/60 bg-rose-950/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-gray-300">Terminal Trust</span>
            <StatusBadge type="rf" value={telemetry.isVerified ? 'VERIFIED' : 'UNVERIFIED'} size="sm" />
          </div>
          <div className={`font-mono text-2xl font-black mt-2 ${telemetry.isVerified ? 'text-cyan-300' : 'text-rose-400'}`}>
            {telemetry.trustScore}% MATCH
          </div>
        </div>

      </div>

      {/* S11 Spectroscopy Graph View */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Activity className="w-5 h-5 text-cyan-400" />
              S11 RETURN LOSS SPECTRUM COMPARISON (2.40 - 2.50 GHz)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Comparing baseline CST expected electromagnetic signature vs actual observed terminal spectrum.
            </p>
          </div>

          <span className="font-mono text-xs text-gray-400 bg-gray-950 p-2 rounded-lg border border-gray-800">
            Resonance Freq: 2.45 GHz
          </span>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="freq" stroke="#9ca3af" tick={{ fontSize: 12 }} label={{ value: 'Frequency (GHz)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} label={{ value: 'Return Loss S11 (dB)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f293d', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="expectedS11"
                name="Expected S11 Baseline (Authorized CST)"
                stroke="#06b6d4"
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
