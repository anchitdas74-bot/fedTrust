import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { StatusBadge } from '../common/StatusBadge';
import { RiskGauge } from '../common/RiskGauge';
import {
  X,
  CreditCard,
  Cpu,
  Radio,
  Compass,
  Zap,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TransactionDetailsDrawer: React.FC = () => {
  const { selectedTransactionId, closeTransactionDetails, transactions, openStepUpModal } = useSystem();
  const navigate = useNavigate();

  if (!selectedTransactionId) return null;

  const txn = transactions.find(t => t.id === selectedTransactionId);
  if (!txn) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0a0f1d] border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-fade-in text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{txn.id}</span>
              <StatusBadge type="status" value={txn.status} size="sm" />
              <StatusBadge type="risk" value={txn.riskLevel} size="sm" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{txn.merchant} (${txn.amount.toFixed(2)})</h2>
          </div>

          <button
            onClick={closeTransactionDetails}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Sections */}
        <div className="p-6 space-y-6">

          {/* Section 1: Transaction Info & Behavioural History */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <CreditCard className="w-4 h-4" />
              <span>1. Transaction Specs & Behavioural History</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Cardholder:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{txn.cardholderName}</p>
                <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{txn.cardholderId}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Category:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{txn.category}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{txn.location}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Timestamp:</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{txn.timestamp}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Velocity (1h):</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{txn.velocityCount1h} transaction(s)</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Previous Location:</span>
                <p className="text-slate-800 dark:text-slate-200 truncate">{txn.previousLocation}</p>
              </div>
            </div>
          </div>

          {/* Section 2: ML Anomaly Analysis (PyTorch Autoencoder + GWO Threshold Optimizer) */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                <Cpu className="w-4 h-4" />
                <span>2. AI Behavioural Anomaly (PyTorch Autoencoder + GWO Optimizer)</span>
              </div>
              <StatusBadge type="ml" value={txn.isMLAnomalous ? 'ANOMALOUS' : 'NORMAL'} size="sm" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Reconstruction Error:</span>
                <span className="font-mono text-sm font-bold text-purple-600 dark:text-purple-300">
                  {txn.reconstructionError.toFixed(4)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">GWO Cutoff (τ_opt):</span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">2.50000</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">ML Anomaly Score:</span>
                <span className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">{txn.anomalyScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">PyTorch Architecture:</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">29→16→8→4→8→16→29</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              {txn.isMLAnomalous
                ? 'Reconstruction loss exceeds bio-inspired Grey Wolf Optimizer (GWO) threshold τ_opt (2.50000, F2-Score recall optimized).'
                : 'Transaction reconstruction loss is well below GWO cutoff τ_opt (2.50000).'}
            </p>
          </div>

          {/* Section 3: Physical RF Terminal Analysis */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                <Radio className="w-4 h-4" />
                <span>3. Physical-Layer RF Terminal Trust</span>
              </div>
              <StatusBadge type="rf" value={txn.isRFVerified ? 'VERIFIED' : 'UNVERIFIED'} size="sm" />
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs text-cyan-800 dark:text-cyan-200">
              <strong>RF Scope Disclaimer:</strong> RF verification confirms terminal physical environment integrity (2.45 GHz / S11 return-loss signature match) and does NOT imply cardholder identity authentication.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Terminal ID:</span>
                <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">{txn.terminalId}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">RF Trust Score:</span>
                <span className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-400">{txn.rfTrustScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Carrier Freq:</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">2.45 GHz</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">S11 Return Loss:</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {txn.isRFVerified ? '-24.5 dB' : '-8.2 dB (Fail)'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Contextual Signal Analysis */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Compass className="w-4 h-4" />
              <span>4. Contextual Signal Analysis</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Contextual Risk Index:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{txn.contextualRiskScore}%</span>
            </div>
            <ul className="space-y-1.5">
              {txn.contextualFactors.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5: Risk Engine Decision Breakdown */}
          <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-[#0c1222] dark:to-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>5. Multi-Signal Risk Engine Final Decision</span>
              </div>
              <StatusBadge type="risk" value={txn.riskLevel} size="md" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <RiskGauge score={txn.finalRiskScore} label="Combined Risk Score" size={130} />
              
              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">ML Anomaly Signal:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{txn.anomalyScore}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">RF Terminal Trust Signal:</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{txn.rfTrustScore}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Contextual Signal:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{txn.contextualRiskScore}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40">
                  <span className="font-bold text-cyan-900 dark:text-cyan-300">Final Action Executed:</span>
                  <span className="font-bold font-mono text-cyan-700 dark:text-white uppercase">{txn.finalAction}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <strong>Risk Narrative:</strong> {txn.explanation}
            </p>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1d] sticky bottom-0 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              closeTransactionDetails();
              navigate('/ai-explainability');
            }}
            className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>View SHAP Attribution</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {txn.status === 'PENDING_VERIFICATION' && (
            <button
              onClick={() => {
                closeTransactionDetails();
                openStepUpModal(txn);
              }}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Launch 2FA Step-Up Modal</span>
            </button>
          )}

          <button
            onClick={closeTransactionDetails}
            className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
