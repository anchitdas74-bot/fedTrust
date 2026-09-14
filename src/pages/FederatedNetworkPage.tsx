import React, { useState } from 'react';
import { MOCK_FEDERATED_NODES, MOCK_FEDERATED_LOSS_HISTORY } from '../services/mockData';
import { federatedService } from '../services/api/federatedService';
import {
  Network,
  ShieldCheck,
  Building2,
  Cpu,
  RefreshCw,
  Lock,
  ArrowRight,
  Database,
  Layers,
  CheckCircle2
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

export const FederatedNetworkPage: React.FC = () => {
  const [lossHistory, setLossHistory] = useState(MOCK_FEDERATED_LOSS_HISTORY);
  const [nodes] = useState(MOCK_FEDERATED_NODES);
  const [isAggregating, setIsAggregating] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const currentRound = lossHistory.length;
  const currentGlobalLoss = lossHistory[lossHistory.length - 1].globalLoss;

  const handleTriggerRound = async () => {
    setIsAggregating(true);
    setLastMessage(null);

    const res = await federatedService.triggerAggregationRound();

    // Update state with new loss entry
    const newRoundEntry = {
      round: res.round,
      globalLoss: res.globalLoss,
      bankA: Number((res.globalLoss + 0.001).toFixed(4)),
      bankB: Number((res.globalLoss - 0.0005).toFixed(4)),
      bankC: Number((res.globalLoss - 0.0003).toFixed(4))
    };

    setLossHistory(prev => [...prev, newRoundEntry]);
    setLastMessage(res.message);
    setIsAggregating(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & FedAvg Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-mono">
            <Network className="w-6 h-6 text-purple-400" />
            <span>FEDERATED LEARNING PRIVACY INFRASTRUCTURE</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Privacy-preserving collaborative PyTorch Autoencoder model training across independent bank nodes powered by Flower / FedAvg.
          </p>
        </div>

        <button
          onClick={handleTriggerRound}
          disabled={isAggregating}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isAggregating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Trigger FedAvg Aggregation Round</span>
            </>
          )}
        </button>
      </div>

      {/* PROMINENT MANDATORY BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border border-purple-500/40 text-purple-200 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide font-mono uppercase">
              “RAW TRANSACTION DATA NEVER LEAVES THE BANK”
            </h2>
            <p className="text-xs text-purple-300/90 mt-0.5">
              Only encrypted PyTorch Autoencoder weight gradients are transmitted to the global Flower FedAvg aggregator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-purple-300 bg-purple-900/40 px-3.5 py-2 rounded-xl border border-purple-700/50">
          <div>Round: <strong className="text-white">#{currentRound}</strong></div>
          <div>•</div>
          <div>Global Loss: <strong className="text-emerald-400">{currentGlobalLoss}</strong></div>
        </div>
      </div>

      {lastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastMessage}</span>
        </div>
      )}

      {/* Visual Federated Learning Workflow Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          FEDERATED AGGREGATION PIPELINE FLOW
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
            <Database className="w-5 h-5 text-cyan-400 mx-auto" />
            <div className="text-xs font-bold text-gray-200">1. Local Bank Data</div>
            <p className="text-[10px] text-gray-400">Isolated customer transaction logs</p>
          </div>

          <div className="hidden md:flex items-center justify-center text-gray-600">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto" />
            <div className="text-xs font-bold text-gray-200">2. Local PyTorch Autoencoder</div>
            <p className="text-[10px] text-gray-400">Trains on local bank hardware</p>
          </div>

          <div className="hidden md:flex items-center justify-center text-gray-600">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-1">
            <Network className="w-5 h-5 text-indigo-400 mx-auto" />
            <div className="text-xs font-bold text-gray-200">3. Flower FedAvg Aggregator</div>
            <p className="text-[10px] text-gray-400">Updates Global Model Weights</p>
          </div>
        </div>
      </div>

      {/* Bank Nodes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nodes.map(node => (
          <div
            key={node.id}
            className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-gray-100">{node.name}</h3>
                  <span className="font-mono text-[10px] text-gray-400">{node.code}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CONNECTED
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                <span className="text-gray-400">Local Model Loss:</span>
                <strong className="text-purple-300">{node.localLoss}</strong>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                <span className="text-gray-400">Local Txn Samples:</span>
                <strong className="text-gray-200">{node.sampleCount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                <span className="text-gray-400">Gradient Payload:</span>
                <strong className="text-cyan-300">2.4 MB (Encrypted)</strong>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-800/60">
              <span>Last Sync: {node.lastGradientUpdate}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Loss Curve across Federated Rounds */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Cpu className="w-5 h-5 text-purple-400" />
              GLOBAL RECONSTRUCTION LOSS ACROSS FEDERATED ROUNDS
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              PyTorch Autoencoder global reconstruction loss convergence across FedAvg training rounds.
            </p>
          </div>

          <span className="font-mono text-xs text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-800/40">
            Convergence Target: &lt; 0.0450
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lossHistory} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="round" stroke="#9ca3af" tick={{ fontSize: 12 }} label={{ value: 'Federated Training Round', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} label={{ value: 'Autoencoder Reconstruction Loss', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f293d', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="globalLoss" name="Global Aggregated Loss" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="bankA" name="Bank A Local Loss" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="bankB" name="Bank B Local Loss" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="bankC" name="Bank C Local Loss" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
