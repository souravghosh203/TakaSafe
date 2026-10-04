import React, { useState } from 'react';
import {
  Smartphone,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Info,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { AI1EvaluationResult } from '../../services/ai1ScoringEngine';

interface AI1PipelineVisualizerProps {
  evaluation?: AI1EvaluationResult;
  onOpenNotebookModal?: () => void;
  compact?: boolean;
  theme?: 'light' | 'dark' | 'glass';
  interactiveNodeClick?: boolean;
}

export const AI1PipelineVisualizer: React.FC<AI1PipelineVisualizerProps> = ({
  evaluation,
  onOpenNotebookModal,
  compact = false,
  theme = 'light',
  interactiveNodeClick = true,
}) => {
  const [selectedNode, setSelectedNode] = useState<'TRANSFER' | 'AI1' | 'DOUBT' | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<boolean>(false);

  // Status metrics if evaluation is provided
  const ai1Score = evaluation?.ai1Score.calibratedScore ?? 22;
  const isDoubt = evaluation?.doubtCheck.conformal.isDoubtFlagged ?? false;
  const isNovel = evaluation?.doubtCheck.novelty.isNovel ?? false;
  const predictionSet = evaluation?.doubtCheck.conformal.predictionSet ?? ['LEGITIMATE'];
  const noveltyScore = evaluation?.doubtCheck.novelty.noveltyScore ?? 0.18;

  // Active glow color for AI-1 node
  const ai1GlowClass =
    ai1Score >= 70
      ? 'border-rose-400 ring-4 ring-rose-500/20 shadow-[0_0_24px_rgba(244,63,94,0.35)]'
      : ai1Score >= 40
      ? 'border-amber-400 ring-4 ring-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.3)]'
      : 'border-emerald-400 ring-4 ring-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.25)]';

  // Active glow color for Doubt check node
  const doubtGlowClass =
    isDoubt || isNovel
      ? 'border-amber-400 ring-4 ring-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.3)]'
      : 'border-slate-200 dark:border-slate-700 shadow-sm';

  return (
    <div className={`w-full rounded-2xl transition-all ${
      theme === 'dark'
        ? 'bg-[#0F172A] border border-slate-800 text-slate-100'
        : 'bg-white border border-slate-200/90 text-slate-900 shadow-xs'
    } p-4 sm:p-5 space-y-4`}>
      {/* Top Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase font-mono text-slate-700 dark:text-slate-300">
            TakaSafe ML Architecture Pipeline
          </span>
          <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#0054A6] dark:text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            Real-Time Inference
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNotebookModal && (
            <button
              type="button"
              onClick={onOpenNotebookModal}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#0054A6] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800/80 transition-all cursor-pointer shadow-2xs"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Jupyter Notebook (.ipynb)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold p-1 cursor-pointer"
          >
            <span>{expandedDetails ? 'Hide Telemetry' : 'Inspect Math'}</span>
            {expandedDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* The 3-Node Interactive Diagram matching the image */}
      <div className="relative py-4 px-2 sm:px-6 select-none">
        {/* Background Connecting Curves (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pipelineFlow1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="pipelineFlow2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Node 1 to Node 2 link */}
          <path
            d="M 120 48 C 170 52, 220 44, 280 48"
            fill="none"
            stroke="url(#pipelineFlow1)"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="hidden sm:block"
          />

          {/* Node 2 to Node 3 link */}
          <path
            d="M 340 48 C 390 44, 440 52, 500 48"
            fill="none"
            stroke="url(#pipelineFlow2)"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="hidden sm:block"
          />
        </svg>

        {/* 3 Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 relative z-10 items-start">
          {/* Node 1: Transfer */}
          <div
            onClick={() => interactiveNodeClick && setSelectedNode(selectedNode === 'TRANSFER' ? null : 'TRANSFER')}
            className={`flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
              selectedNode === 'TRANSFER' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Node Card */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-800 dark:text-slate-100 group-hover:border-slate-400 group-hover:shadow-md transition-all relative">
              <Smartphone className="w-8 h-8 stroke-[1.75]" />
              {evaluation && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-900 text-white shadow-xs">
                  ৳{evaluation.transferSummary.amount >= 1000 ? `${(evaluation.transferSummary.amount / 1000).toFixed(0)}k` : evaluation.transferSummary.amount}
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
              Transfer
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              amount, receiver, moment
            </p>

            {evaluation && (
              <span className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                {evaluation.transferSummary.amountRatio}× avg · {evaluation.transferSummary.receiverClassification === 'KNOWN_SAFE' ? 'Safe Recipient' : 'Unverified'}
              </span>
            )}
          </div>

          {/* Node 2: AI-1 Score (LightGBM + calibration) */}
          <div
            onClick={() => interactiveNodeClick && setSelectedNode(selectedNode === 'AI1' ? null : 'AI1')}
            className={`flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
              selectedNode === 'AI1' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Node Card with Green Ambient Glow */}
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 ${ai1GlowClass} flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all relative`}>
              <Brain className="w-8 h-8 stroke-[1.75]" />
              {evaluation && (
                <span className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9.5px] font-mono font-black shadow-xs ${
                  ai1Score >= 70 ? 'bg-rose-600 text-white' : ai1Score >= 40 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                  {ai1Score}/100
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 flex items-center gap-1.5">
              <span>ML Score</span>
              {ai1Score >= 60 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              )}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 whitespace-nowrap">
              LightGBM + calibration
            </p>

            {evaluation && (
              <span className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold">
                P(Scam) = {evaluation.ai1Score.calibratedProbability}
              </span>
            )}
          </div>

          {/* Node 3: Doubt check (conformal + novelty) */}
          <div
            onClick={() => interactiveNodeClick && setSelectedNode(selectedNode === 'DOUBT' ? null : 'DOUBT')}
            className={`flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
              selectedNode === 'DOUBT' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Node Card */}
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 ${doubtGlowClass} flex items-center justify-center text-slate-900 dark:text-white group-hover:border-slate-400 transition-all relative`}>
              <Sparkles className="w-8 h-8 stroke-[1.75] text-amber-500" />
              {isDoubt && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500 text-slate-950 shadow-xs">
                  DOUBT
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
              Doubt check
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              conformal + novelty
            </p>

            {evaluation && (
              <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                isDoubt || isNovel
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                {predictionSet.join(' ∪ ')} · Novelty {(noveltyScore * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Node Deep Dive Callout when a node is clicked */}
      {selectedNode && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
          {selectedNode === 'TRANSFER' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-[#0054A6]" />
                <span>Node 1: Transfer Feature Vector (Amount · Receiver · Moment)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                Extracts the primary transaction dimensions: monetary amount (log-scale and deviation ratio relative to 90-day moving average), recipient graph reputation (known frequent peer vs unverified new wallet vs mule ring centrality), and temporal moment (Bangladesh Standard Time, nocturnal 00:00–05:00 window, and 10-minute velocity bursts).
              </p>
            </div>
          )}

          {selectedNode === 'AI1' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Brain className="w-4 h-4 text-emerald-600" />
                <span>Node 2: Calibrated ML Model (LightGBM + Empirical Calibration)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                Supervised LightGBM gradient boosted tree ensemble trained on high-imbalance tabular MFS transaction features (<span className="font-mono text-emerald-600">scale_pos_weight=20.68</span>). Raw tree decision logits are calibrated via Isotonic Regression & Platt Scaling to guarantee empirical reliability: a calibrated ML score of 80 truly corresponds to an 80% empirical fraud probability.
              </p>
            </div>
          )}

          {selectedNode === 'DOUBT' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Node 3: Doubt Check (Inductive Conformal Prediction + Novelty OOD)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                Quantifies epistemic model uncertainty. <strong>Conformal Prediction</strong> outputs distribution-free prediction sets with a 95% coverage guarantee (<span className="font-mono">1 - α = 0.95</span>). If the prediction set contains both classes <span className="font-mono text-amber-600 font-bold">&#123;Legitimate, Scam&#125;</span>, the model flags statistical doubt. Concurrently, <strong>Novelty Detection</strong> calculates Mahalanobis distance from typical behavioral profiles to intercept zero-day scam variants.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expanded Telemetry Section */}
      {expandedDetails && evaluation && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Transfer Telemetry */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 block font-sans">Transfer Metrics</span>
            <div className="flex justify-between text-slate-500">
              <span>Amount Ratio:</span>
              <strong className="text-slate-800 dark:text-slate-200">{evaluation.transferSummary.amountRatio}×</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Receiver Class:</span>
              <strong className="text-slate-800 dark:text-slate-200">{evaluation.transferSummary.receiverClassification}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Moment:</span>
              <span className="text-slate-800 dark:text-slate-200 text-[10px]">{evaluation.transferSummary.momentBST}</span>
            </div>
          </div>

          {/* ML Score Telemetry */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 block font-sans">Calibrated ML Score</span>
            <div className="flex justify-between text-slate-500">
              <span>Raw Tree Logits:</span>
              <span className="text-slate-800 dark:text-slate-200">{evaluation.ai1Score.rawModelScore}/100</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Calibrated Score:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{evaluation.ai1Score.calibratedScore}/100</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Method:</span>
              <span className="text-slate-600 dark:text-slate-400 text-[10px]">Isotonic + Platt</span>
            </div>
          </div>

          {/* Doubt Check Telemetry */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 block font-sans">Doubt Check Result</span>
            <div className="flex justify-between text-slate-500">
              <span>Conformal Set:</span>
              <strong className={isDoubt ? 'text-amber-600' : 'text-emerald-600'}>
                &#123;{evaluation.doubtCheck.conformal.predictionSet.join(', ')}&#125;
              </strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Novelty Score:</span>
              <span className="text-slate-800 dark:text-slate-200">{(evaluation.doubtCheck.novelty.noveltyScore * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status:</span>
              <strong className={isDoubt ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                {evaluation.doubtCheck.overallDoubt}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
