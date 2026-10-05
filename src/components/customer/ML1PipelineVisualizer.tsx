import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Send,
  SendHorizontal,
  Wallet,
  Smartphone,
  Coins,
  Brain,
  Cpu,
  ShieldAlert,
  ShieldQuestion,
  HelpCircle,
  Scale,
  Radar,
  AlertTriangle,
} from 'lucide-react';
import { AI1EvaluationResult } from '../../services/ai1ScoringEngine';

export type Node1IconType = 'ArrowRightLeft' | 'Send' | 'SendHorizontal' | 'Wallet' | 'Smartphone' | 'Coins';
export type Node2IconType = 'Brain' | 'Cpu' | 'Radar' | 'Scale';
export type Node3IconType = 'ShieldAlert' | 'ShieldQuestion' | 'HelpCircle' | 'Scale' | 'Radar' | 'AlertTriangle';

export interface PipelineCustomConfig {
  node1Icon: Node1IconType;
  node1Title: string;
  node1Subtitle: string;
  node2Icon: Node2IconType;
  node2Title: string;
  node2Subtitle: string;
  node3Icon: Node3IconType;
  node3Title: string;
  node3Subtitle: string;
}

const DEFAULT_CONFIG_EN: PipelineCustomConfig = {
  node1Icon: 'ArrowRightLeft',
  node1Title: 'Transaction Vector',
  node1Subtitle: 'Amount · Recipient · Moment',
  node2Icon: 'Brain',
  node2Title: 'AI Risk Engine',
  node2Subtitle: 'Calibrated LightGBM Model',
  node3Icon: 'ShieldAlert',
  node3Title: 'Uncertainty & Doubt Check',
  node3Subtitle: 'Conformal Prediction + Novelty',
};

const DEFAULT_CONFIG_BN: PipelineCustomConfig = {
  node1Icon: 'ArrowRightLeft',
  node1Title: 'লেনদেন ভেক্টর',
  node1Subtitle: 'পরিমাণ · প্রাপক · সময়',
  node2Icon: 'Brain',
  node2Title: 'AI রিস্ক ইঞ্জিন',
  node2Subtitle: 'ক্যালিব্রেটেড LightGBM মডেল',
  node3Icon: 'ShieldAlert',
  node3Title: 'অনিশ্চয়তা ও ডাউট চেক',
  node3Subtitle: 'কনফর্মাল গ্যারান্টি + নভেলটি',
};

interface AI1PipelineVisualizerProps {
  evaluation?: AI1EvaluationResult;
  onOpenNotebookModal?: () => void;
  compact?: boolean;
  theme?: 'light' | 'dark' | 'glass';
  interactiveNodeClick?: boolean;
  lang?: 'EN' | 'BN';
}

export const AI1PipelineVisualizer: React.FC<AI1PipelineVisualizerProps> = ({
  evaluation,
  compact = false,
  theme = 'light',
  interactiveNodeClick = true,
  lang = 'EN',
}) => {
  const [selectedNode, setSelectedNode] = useState<'TRANSFER' | 'AI1' | 'DOUBT' | null>(null);

  const customConfig = lang === 'BN' ? DEFAULT_CONFIG_BN : DEFAULT_CONFIG_EN;

  // Status metrics if evaluation is provided
  const ai1Score = evaluation?.ai1Score.calibratedScore ?? 22;
  const isDoubt = evaluation?.doubtCheck.conformal.isDoubtFlagged ?? false;
  const isNovel = evaluation?.doubtCheck.novelty.isNovel ?? false;
  const predictionSet = evaluation?.doubtCheck.conformal.predictionSet ?? ['LEGITIMATE'];
  const noveltyScore = evaluation?.doubtCheck.novelty.noveltyScore ?? 0.18;

  // Active glow color for AI Risk Engine node
  const ai1GlowClass =
    ai1Score >= 40
      ? 'border-amber-400 ring-4 ring-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.25)]'
      : 'border-emerald-400 ring-4 ring-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.25)]';

  // Active glow color for Doubt check node
  const doubtGlowClass =
    isDoubt || isNovel
      ? 'border-amber-400 ring-4 ring-amber-500/20 shadow-[0_0_24px_rgba(245,158,11,0.3)]'
      : 'border-slate-200 dark:border-slate-700 shadow-sm';

  // Icon Renderers
  const renderNode1Icon = (name: Node1IconType) => {
    switch (name) {
      case 'ArrowRightLeft':
        return <ArrowRightLeft className="w-8 h-8 stroke-[1.75]" />;
      case 'Send':
        return <Send className="w-8 h-8 stroke-[1.75]" />;
      case 'SendHorizontal':
        return <SendHorizontal className="w-8 h-8 stroke-[1.75]" />;
      case 'Wallet':
        return <Wallet className="w-8 h-8 stroke-[1.75]" />;
      case 'Coins':
        return <Coins className="w-8 h-8 stroke-[1.75]" />;
      case 'Smartphone':
      default:
        return <Smartphone className="w-8 h-8 stroke-[1.75]" />;
    }
  };

  const renderNode2Icon = (name: Node2IconType) => {
    switch (name) {
      case 'Cpu':
        return <Cpu className="w-8 h-8 stroke-[1.75]" />;
      case 'Radar':
        return <Radar className="w-8 h-8 stroke-[1.75]" />;
      case 'Scale':
        return <Scale className="w-8 h-8 stroke-[1.75]" />;
      case 'Brain':
      default:
        return <Brain className="w-8 h-8 stroke-[1.75]" />;
    }
  };

  const renderNode3Icon = (name: Node3IconType) => {
    switch (name) {
      case 'ShieldQuestion':
        return <ShieldQuestion className="w-8 h-8 stroke-[1.75] text-amber-500" />;
      case 'HelpCircle':
        return <HelpCircle className="w-8 h-8 stroke-[1.75] text-amber-500" />;
      case 'Scale':
        return <Scale className="w-8 h-8 stroke-[1.75] text-amber-500" />;
      case 'Radar':
        return <Radar className="w-8 h-8 stroke-[1.75] text-amber-500" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-8 h-8 stroke-[1.75] text-amber-500" />;
      case 'ShieldAlert':
      default:
        return <ShieldAlert className="w-8 h-8 stroke-[1.75] text-amber-500" />;
    }
  };

  return (
    <div
      className={`w-full rounded-2xl transition-all ${
        theme === 'dark'
          ? 'bg-[#0F172A] border border-slate-800 text-slate-100'
          : 'bg-white border border-slate-200/90 text-slate-900 shadow-xs'
      } p-4 sm:p-5 space-y-4`}
    >
      {/* Top Visualizer Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {lang === 'BN' ? 'টাকা সেফ এমএল আর্কিটেকচার পাইপলাইন' : 'TakaSafe ML Architecture Pipeline'}
        </h3>
      </div>

      {/* The 3-Node Interactive Diagram */}
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
          {/* Node 1: Transaction Vector / Transfer */}
          <div
            onClick={() => interactiveNodeClick && setSelectedNode(selectedNode === 'TRANSFER' ? null : 'TRANSFER')}
            className={`flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
              selectedNode === 'TRANSFER' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Node Card */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-[#0054A6] dark:text-sky-400 group-hover:border-slate-400 group-hover:shadow-md transition-all relative">
              {renderNode1Icon(customConfig.node1Icon)}
              {evaluation && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-900 text-white shadow-xs">
                  ৳{evaluation.transferSummary.amount >= 1000 ? `${(evaluation.transferSummary.amount / 1000).toFixed(0)}k` : evaluation.transferSummary.amount}
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
              {customConfig.node1Title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {customConfig.node1Subtitle}
            </p>

            {evaluation && (
              <span className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                {evaluation.transferSummary.amountRatio}× avg · {evaluation.transferSummary.receiverClassification === 'KNOWN_SAFE' ? 'Safe Recipient' : 'Unverified'}
              </span>
            )}
          </div>

          {/* Node 2: AI Risk Engine (LightGBM + Calibration) */}
          <div
            onClick={() => interactiveNodeClick && setSelectedNode(selectedNode === 'AI1' ? null : 'AI1')}
            className={`flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
              selectedNode === 'AI1' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Node Card with Ambient Glow */}
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 ${ai1GlowClass} flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all relative`}>
              {renderNode2Icon(customConfig.node2Icon)}
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
              <span>{customConfig.node2Title}</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 whitespace-nowrap">
              {customConfig.node2Subtitle}
            </p>

            {evaluation && (
              <span className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold">
                P(Scam) = {evaluation.ai1Score.calibratedProbability}
              </span>
            )}
          </div>

          {/* Node 3: Uncertainty & Doubt Check (Conformal + Novelty) */}
          <div
            onClick={() => interactiveNodeClick && setSelectedNode(selectedNode === 'DOUBT' ? null : 'DOUBT')}
            className={`flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
              selectedNode === 'DOUBT' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Node Card */}
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 ${doubtGlowClass} flex items-center justify-center text-slate-900 dark:text-white group-hover:border-slate-400 transition-all relative`}>
              {renderNode3Icon(customConfig.node3Icon)}
              {isDoubt && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-500 text-slate-950 shadow-xs">
                  DOUBT
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
              {customConfig.node3Title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {customConfig.node3Subtitle}
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
                <span className="text-[#0054A6] dark:text-sky-400">
                  {renderNode1Icon(customConfig.node1Icon)}
                </span>
                <span>Stage 1: {customConfig.node1Title} ({customConfig.node1Subtitle})</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                {lang === 'BN'
                  ? 'লেনদেনের মূল মাত্রাগুলি প্রস্তুত করে: টাকার পরিমাণ (৯০ দিনের গড়ের সাথে বিচ্যুতি), প্রাপকের পরিচিতি ও গ্রাফের বিশ্বাসযোগ্যতা এবং লেনদেনের সময় (বাংলাদেশ সময়, রাতের বিশেষ ঝুঁকি ও ১০ মিনিটের দ্রুত গতি)।'
                  : 'Extracts the primary transaction dimensions: monetary amount (log-scale and deviation ratio relative to 90-day moving average), recipient graph reputation (known frequent peer vs unverified new wallet vs mule ring centrality), and temporal moment (Bangladesh Standard Time, nocturnal 00:00–05:00 window, and 10-minute velocity bursts).'}
              </p>
            </div>
          )}

          {selectedNode === 'AI1' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {renderNode2Icon(customConfig.node2Icon)}
                </span>
                <span>Stage 2: {customConfig.node2Title} ({customConfig.node2Subtitle})</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                {lang === 'BN'
                  ? 'উচ্চ-ভারসাম্যহীন এমএফএস লেনদেনের তথ্যের ওপর প্রশিক্ষিত LightGBM এন্সেম্বল মডেল। কাঁচা ট্রি লজিটের সিদ্ধান্ত আইসোটোনিক রিগ্রেশন ও প্ল্যাট স্কেলিং দিয়ে ক্যালিব্রেট করা হয়, যাতে ৮০ স্কোর আসলে সত্যই ৮০% জালিয়াতির সম্ভাবনা নির্দেশ করে।'
                  : 'Supervised LightGBM gradient boosted tree ensemble trained on high-imbalance tabular MFS transaction features (scale_pos_weight=20.68). Raw tree decision logits are calibrated via Isotonic Regression & Platt Scaling to guarantee empirical reliability: a calibrated ML score of 80 truly corresponds to an 80% empirical fraud probability.'}
              </p>
            </div>
          )}

          {selectedNode === 'DOUBT' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <span className="text-amber-500">
                  {renderNode3Icon(customConfig.node3Icon)}
                </span>
                <span>Stage 3: {customConfig.node3Title} ({customConfig.node3Subtitle})</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                {lang === 'BN'
                  ? 'মডেলের অনিশ্চয়তা পরীক্ষা। কনফর্মাল প্রেডিকশন ৯৫% কভারেজ গ্যারান্টি প্রদান করে। যদি প্রেডিকশন সেটে বৈধ ও স্ক্যাম দুটোই থাকে, মডেল ডাউট ফ্ল্যাগ দেয়। পাশাপাশি নোভেলটি ডিটেকশন অপরিচিত নতুন আক্রমণ অবিলম্বে প্রতিহত করে।'
                  : 'Quantifies epistemic model uncertainty. Conformal Prediction outputs distribution-free prediction sets with a 95% coverage guarantee (1 - α = 0.95). If the prediction set contains both classes {Legitimate, Scam}, the model flags statistical doubt. Concurrently, Novelty Detection calculates Mahalanobis distance from typical behavioral profiles to intercept zero-day scam variants.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
