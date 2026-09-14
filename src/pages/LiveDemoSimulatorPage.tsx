import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { DEMO_SCENARIOS } from '../services/mockData';
import type { DemoScenario, Transaction } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import {
  PlaySquare,
  Zap,
  ArrowRight,
  ShieldX,
  Radio,
  Cpu,
  Compass,
  RefreshCw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const LiveDemoSimulatorPage: React.FC = () => {
  const {
    triggerScenarioDemo,
    openStepUpModal,
    openTransactionDetails,
  } = useSystem();

  const [selectedCase, setSelectedCase] = useState<DemoScenario>(
    DEMO_SCENARIOS[0]
  );

  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stages = [
    {
      step: 1,
      title: 'Transaction Received',
      icon: Zap,
      desc: 'Incoming transaction payload ingested at POS node',
    },
    {
      step: 2,
      title: 'Feature Extraction',
      icon: Compass,
      desc: 'Extracting amount velocity, geo-location, and category baseline',
    },
    {
      step: 3,
      title: 'AI Behavioural Analysis',
      icon: Cpu,
      desc: 'PyTorch Autoencoder calculating reconstruction loss',
    },
    {
      step: 4,
      title: 'RF Terminal Trust',
      icon: Radio,
      desc: 'S11 microwave spectroscopy & 2.45 GHz carrier verification',
    },
    {
      step: 5,
      title: 'Contextual Analysis',
      icon: Sparkles,
      desc: 'Evaluating timing, spending surge, and distance jump',
    },
    {
      step: 6,
      title: 'Multi-Signal Risk Engine',
      icon: ShieldX,
      desc: 'Combining ML + RF + Contextual into final decision matrix',
    },
  ];

  const handleRunSimulation = async (scenario: DemoScenario) => {
    if (isSimulating) {
      return;
    }

    setSelectedCase(scenario);
    setIsSimulating(true);
    setActiveTxn(null);
    setErrorMessage(null);
    setPipelineStage(1);

    try {
      // Animate the six decision-engine stages.
      for (let s = 1; s <= 6; s++) {
        setPipelineStage(s);

        await new Promise<void>((resolve) => {
          setTimeout(resolve, 500);
        });
      }

      // Call the REAL backend simulator.
      const resultTxn = await triggerScenarioDemo(scenario.code);

      setActiveTxn(resultTxn);
      setPipelineStage(6);

    } catch (error: any) {
      console.error('[FedTrust Simulator]', error);

      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Unable to run this scenario. Check that the FastAPI backend is running.';

      setErrorMessage(String(message));

    } finally {
      // CRITICAL:
      // Always release the simulator lock, even when API fails.
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-mono">
            <PlaySquare className="w-6 h-6 text-purple-400" />
            <span>HACKATHON LIVE PIPELINE SIMULATOR</span>
          </h1>

          <p className="text-xs text-gray-400 mt-1">
            Demonstrate real-time decision flow through FedTrust's multi-signal
            risk engine across preset scenarios.
          </p>
        </div>

        <div className="px-3 py-1 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-300 font-mono text-xs font-bold">
          DEMO MODE ACTIVE
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_SCENARIOS.map((scen) => {
          const isSelected = selectedCase.code === scen.code;

          return (
            <div
              key={scen.code}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
              } ${
                isSimulating
                  ? 'opacity-70'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {scen.code}
                  </span>

                  <StatusBadge
                    type="risk"
                    value={scen.transaction.riskLevel}
                    size="sm"
                  />
                </div>

                <h3 className="font-bold text-sm text-gray-100">
                  {scen.title}
                </h3>

                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {scen.description}
                </p>
              </div>

              <button
                type="button"
                disabled={isSimulating}
                onClick={() => handleRunSimulation(scen)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                } ${
                  isSimulating
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isSimulating
                    ? 'Running...'
                    : 'Simulate Scenario'}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <div className="font-bold text-sm">
              Simulator Error
            </div>

            <div className="text-xs mt-1 text-rose-200">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">

        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <Sparkles className="w-5 h-5 text-purple-400" />
            DECISION PIPELINE PROGRESSION: {selectedCase.name}
          </h3>

          {isSimulating && (
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Ingesting & Evaluating Pipeline...
            </span>
          )}
        </div>

        {/* Pipeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {stages.map((st) => {
            const Icon = st.icon;
            const isPassed = pipelineStage >= st.step;
            const isCurrent = pipelineStage === st.step;

            return (
              <div
                key={st.step}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 text-center ${
                  isCurrent
                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25 scale-105 z-10'
                    : isPassed
                      ? 'bg-gray-900 border-cyan-800/60 text-cyan-300'
                      : 'bg-gray-950/40 border-gray-800 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`p-2 rounded-lg border ${
                      isCurrent
                        ? 'bg-purple-500 text-white border-purple-400'
                        : isPassed
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : 'bg-gray-900 text-gray-600 border-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase font-bold text-gray-400">
                    Step {st.step}
                  </div>

                  <h4 className="text-xs font-bold text-gray-200 leading-tight mt-0.5">
                    {st.title}
                  </h4>
                </div>

                <p className="text-[10px] text-gray-400 leading-normal">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {activeTxn && (
          <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-4 animate-in fade-in duration-300">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">

              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                  Pipeline Output Decision
                </span>

                <h3 className="text-xl font-bold text-white mt-0.5">
                  {activeTxn.merchant} (${activeTxn.amount.toFixed(2)})
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge
                  type="status"
                  value={activeTxn.status}
                  size="lg"
                />

                <StatusBadge
                  type="risk"
                  value={activeTxn.riskLevel}
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              <div className="md:col-span-4 flex items-center justify-center">
                <RiskGauge
                  score={activeTxn.finalRiskScore}
                  label="Final Risk Score"
                  size={130}
                />
              </div>

              <div className="md:col-span-8 space-y-3">

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">

                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">
                      ML Anomaly
                    </span>

                    <strong className="text-purple-400 text-sm">
                      {activeTxn.anomalyScore}%
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">
                      RF Terminal
                    </span>

                    <strong
                      className={`text-sm ${
                        activeTxn.isRFVerified
                          ? 'text-cyan-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeTxn.rfTrustScore}%
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">
                      Contextual
                    </span>

                    <strong className="text-amber-400 text-sm">
                      {activeTxn.contextualRiskScore}%
                    </strong>
                  </div>

                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed">
                  <strong>Risk Engine Conclusion:</strong>{' '}
                  {activeTxn.explanation}
                </div>

                <div className="flex gap-3 flex-wrap">

                  <button
                    type="button"
                    onClick={() =>
                      openTransactionDetails(activeTxn.id)
                    }
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 flex items-center gap-1"
                  >
                    <span>View Complete Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {activeTxn.status === 'PENDING_VERIFICATION' && (
                    <button
                      type="button"
                      onClick={() =>
                        openStepUpModal(activeTxn)
                      }
                      className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md shadow-amber-500/20"
                    >
                      Authorize Step-Up 2FA
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};