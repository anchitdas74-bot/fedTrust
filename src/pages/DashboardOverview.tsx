import React from 'react';
import { useSystem } from '../context/SystemContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  Activity,
  Radio,
  Cpu,
  Network,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    transactions,
    alerts,
    openTransactionDetails,
    openStepUpModal,
    mlServiceStatus,
    rfServiceStatus
  } = useSystem();

  const totalProcessed = transactions.length;
  const approvedCount = transactions.filter(t => t.status === 'APPROVED').length;
  const stepUpCount = transactions.filter(t => t.status === 'PENDING_VERIFICATION').length;
  const blockedCount = transactions.filter(t => t.status === 'BLOCKED').length;
  const activeAlerts = alerts.filter(a => !a.isResolved).length;

  // Calculate average risk score
  const avgRiskScore = Math.round(
    transactions.reduce((acc, curr) => acc + curr.finalRiskScore, 0) / (totalProcessed || 1)
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-mono">
            <span>SECURITY DASHBOARD OVERVIEW</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time multi-signal FinTech transaction monitoring, AI behavioral anomaly detection, and RF terminal physical layer trust.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-700 dark:text-cyan-300 flex items-center gap-2 shadow-xs">
            <Radio className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-pulse" />
            <span>RF Terminal: <strong>RF-TERM-8092 (2.45 GHz)</strong></span>
          </div>
        </div>
      </div>

      {/* High Level KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Transactions"
          value={totalProcessed}
          subtext="Processed in current session stream"
          icon={CreditCard}
          color="blue"
          trend="+12% vs avg"
          trendType="positive"
        />
        <MetricCard
          title="Auto-Approved (Low Risk)"
          value={approvedCount}
          subtext="Cleared multi-signal check"
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          title="Step-Up Verification (Medium)"
          value={stepUpCount}
          subtext="Awaiting cardholder 2FA OTP"
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="Blocked (High Risk)"
          value={blockedCount}
          subtext="Prevented by Risk Engine"
          icon={ShieldX}
          color="rose"
        />
      </div>

      {/* System Status & Risk Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Overall Fraud Index Radial Gauge */}
        <div className="md:col-span-4 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Overall System Fraud Risk Index
          </span>
          <RiskGauge score={avgRiskScore} label="Global Risk Score" size={140} />
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            Combined multi-signal index across active PyTorch Autoencoder anomalies, RF physical S11 telemetry, and contextual velocities.
          </p>
        </div>

        {/* Live System Health Matrix */}
        <div className="md:col-span-8 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Security Telemetry Matrix
            </span>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
              ALL SIGNALS NOMINAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ML Anomaly Core</span>
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-200">PyTorch v2.4</div>
              <span className={`text-[10px] font-mono font-semibold ${mlServiceStatus === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                Status: {mlServiceStatus.toUpperCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">RF Physical Trust</span>
                <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-300">S11 -24.5 dB</div>
              <span className={`text-[10px] font-mono font-semibold ${rfServiceStatus === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                Status: {rfServiceStatus.toUpperCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Federated Network</span>
                <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-200">3 Bank Nodes</div>
              <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                FedAvg Round #18
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs text-cyan-900 dark:text-cyan-200 flex items-center justify-between flex-wrap gap-2">
            <span className="truncate">
              <strong>Multi-Signal Architecture:</strong> Individual signals (ML score, RF physical S11, Contextual factors) feed into the final Risk Engine.
            </span>
            <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400 shrink-0">Active Alerts: {activeAlerts}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Transaction Risk Monitor Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
              REAL-TIME TRANSACTION RISK MONITOR
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Incoming transaction stream with live ML anomaly, RF physical trust, and contextual risk scores.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 px-3 py-1 rounded-lg">
            LIVE STREAM ACTIVE
          </span>
        </div>

        {/* Transaction Cards List */}
        <div className="space-y-3">
          {transactions.map(txn => {
            const isHighRisk = txn.riskLevel === 'HIGH';
            const isMedRisk = txn.riskLevel === 'MEDIUM';

            return (
              <div
                key={txn.id}
                onClick={() => openTransactionDetails(txn.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isHighRisk
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-600'
                    : isMedRisk
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-600'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Column 1: Main Txn Info */}
                  <div className="flex items-start gap-3 min-w-[240px]">
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      isHighRisk
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                        : isMedRisk
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{txn.id}</span>
                        <StatusBadge type="risk" value={txn.riskLevel} size="sm" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{txn.merchant}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{txn.category} • {txn.location}</p>
                    </div>
                  </div>

                  {/* Column 2: Individual Multi-Signal Breakdown Scores */}
                  <div className="grid grid-cols-3 gap-3 min-w-[280px] bg-slate-100/80 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono font-semibold">ML Anomaly</span>
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{txn.anomalyScore}%</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono font-semibold">RF Terminal</span>
                      <span className={`font-mono text-xs font-bold ${txn.isRFVerified ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {txn.rfTrustScore}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono font-semibold">Contextual</span>
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{txn.contextualRiskScore}%</span>
                    </div>
                  </div>

                  {/* Column 3: Amount & Combined Score */}
                  <div className="text-right flex items-center lg:flex-col lg:items-end justify-between">
                    <div>
                      <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">${txn.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">{txn.timestamp.split(' ')[1]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Score:</span>
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {txn.finalRiskScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Column 4: Status & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200 dark:border-slate-800">
                    <StatusBadge type="status" value={txn.status} size="sm" />
                    
                    {txn.status === 'PENDING_VERIFICATION' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStepUpModal(txn);
                        }}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-colors"
                      >
                        Verify 2FA
                      </button>
                    )}

                    <div className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
