import React, { useState, useEffect, useRef } from 'react';
import { MuleCluster, MuleNode } from '../../types';
import {
  Network,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Lock,
  Zap,
  Play,
  Pause,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  DollarSign,
  Maximize2,
  Info,
  ChevronRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface MuleVisionGraphProps {
  cluster: MuleCluster;
  onFreezeWallet: (walletId: string, label: string) => void;
  lang?: 'EN' | 'BN';
}

interface TimelineStage {
  id: number;
  timeLabel: string;
  stageNameEn: string;
  stageNameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  volumeBDT: number;
}

const TIMELINE_STAGES: TimelineStage[] = [
  {
    id: 1,
    timeLabel: '02:15 AM',
    stageNameEn: 'Stage 1: Victim Inflows',
    stageNameBn: 'পর্যায় ১: ক্ষতিগ্রস্তদের অর্থ স্থানান্তর',
    descriptionEn: 'Phished credentials drain victim wallets into initial smurf accounts',
    descriptionBn: 'ফিশিংয়ের শিকার গ্রাহকদের ওয়ালেট থেকে প্রাথমিক মিউল অ্যাকাউন্টে স্থানান্তর',
    activeNodeIds: ['W101', 'W102', 'W103', 'W201', 'W202'],
    activeEdgeIds: ['e1', 'e2', 'e3', 'e4'],
    volumeBDT: 185000,
  },
  {
    id: 2,
    timeLabel: '02:45 AM',
    stageNameEn: 'Stage 2: Layer-1 Smurf Consolidation',
    stageNameBn: 'পর্যায় ২: প্রথম স্তরের মিউল একীকরণ',
    descriptionEn: 'Layer-1 mules aggregate funds and push high-speed burst toward Central Hub',
    descriptionBn: 'প্রথম স্তরের মিউলরা অর্থ সংগ্রহ করে দ্রুত সেন্ট্রাল হাবে প্রেরণ করে',
    activeNodeIds: ['W201', 'W202', 'W302'],
    activeEdgeIds: ['e5', 'e6'],
    volumeBDT: 260000,
  },
  {
    id: 3,
    timeLabel: '03:15 AM',
    stageNameEn: 'Stage 3: Central Aggregator Hub Accumulation',
    stageNameBn: 'পর্যায় ৩: সেন্ট্রাল অ্যাগ্রিগেটর হাবে একত্রীকরণ',
    descriptionEn: 'W302 centralizes ৳412k and splits outflow between wash ring & cash-out routes',
    descriptionBn: 'W302 একাউন্টে ৪.১২ লাখ টাকা জমা হয় এবং ওয়াশ রিং ও ক্যাশ-আউটে ভাগ হয়',
    activeNodeIds: ['W302', 'W204', 'AGT-881', 'AGT-882'],
    activeEdgeIds: ['e7', 'e10', 'e11'],
    volumeBDT: 412000,
  },
  {
    id: 4,
    timeLabel: '03:30 AM',
    stageNameEn: 'Stage 4: Circular Laundering Wash Cycle',
    stageNameBn: 'পর্যায় ৪: সার্কুলার মানি লন্ডারিং ওয়াশ সাইকেল',
    descriptionEn: 'High-frequency ping-pong transfers between W204 & W108 to obfuscate paper trail',
    descriptionBn: 'W204 ও W108-এর মাঝে দ্বিমুখী দ্রুত লেনদেনের মাধ্যমে ট্রেস লুকানোর অপচেষ্টা',
    activeNodeIds: ['W204', 'W108'],
    activeEdgeIds: ['e8', 'e9'],
    volumeBDT: 215000,
  },
  {
    id: 5,
    timeLabel: '04:15 AM',
    stageNameEn: 'Stage 5: High-Speed ATM & Agent Extraction',
    stageNameBn: 'পর্যায় ৫: এটিএম ও এজেন্ট পয়েন্টে নগদ উত্তোলন',
    descriptionEn: 'Simultaneous physical cash-outs at AGT-881, AGT-882, W401 & W402',
    descriptionBn: 'বিভিন্ন এজেন্টে ও এটিএমে যুগপৎ নগদ অর্থ উত্তোলন সম্পন্ন',
    activeNodeIds: ['W401', 'AGT-881', 'AGT-882', 'W402'],
    activeEdgeIds: ['e10', 'e11', 'e12', 'e13'],
    volumeBDT: 530000,
  },
];

export const MuleVisionGraph: React.FC<MuleVisionGraphProps> = ({
  cluster,
  onFreezeWallet,
  lang = 'EN',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('W302');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'OVERVIEW' | 'FLOWS' | 'SIGNATURES'>('OVERVIEW');
  const [animateParticles, setAnimateParticles] = useState<boolean>(true);
  const [highlightCircular, setHighlightCircular] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Video-inspired Timeline Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(2); // Default to Central Hub stage
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Animation ticker for digital timecode
  const [digitalSeconds, setDigitalSeconds] = useState<number>(14);

  // Playback loop timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(1200, 3000 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => (prev + 1) % TIMELINE_STAGES.length);
      setDigitalSeconds((s) => (s + 7) % 60);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const activeStage = TIMELINE_STAGES[currentStageIdx];

  // Fallback safe selected node
  const selectedNode = cluster.nodes.find((n) => n.id === selectedNodeId) || cluster.nodes[0];

  // Video-inspired spatial topology coordinates (viewBox 840 x 480)
  const getNodeCoordinates = (node: MuleNode) => {
    switch (node.id) {
      // Stage 1: Victim Inflows (Left Column, x: 90)
      case 'W101': return { x: 90, y: 110 };
      case 'W102': return { x: 90, y: 240 };
      case 'W103': return { x: 90, y: 370 };
      // Stage 2: Layer 1 Smurf Mules (Mid-Left Column, x: 250)
      case 'W201': return { x: 250, y: 165 };
      case 'W202': return { x: 250, y: 315 };
      // Stage 3: Central Aggregator Mega-Hub (Center, x: 425) - Like Paris in video
      case 'W302': return { x: 425, y: 240 };
      // Stage 4: Circular Laundering Wash Orbit (Mid-Right Column, x: 600)
      case 'W204': return { x: 600, y: 135 };
      case 'W108': return { x: 600, y: 345 };
      // Stage 5: Cash-Out Agents & Exit Nodes (Far Right Column, x: 760)
      case 'W401': return { x: 760, y: 75 };
      case 'AGT-881': return { x: 760, y: 185 };
      case 'AGT-882': return { x: 760, y: 295 };
      case 'W402': return { x: 760, y: 405 };
      default: return { x: node.x, y: node.y };
    }
  };

  // TakaSafe brand color palette maintaining user request
  const getNodeColor = (role: MuleNode['role'], status: MuleNode['status']) => {
    if (status === 'FROZEN') {
      return {
        fill: '#334155',
        stroke: '#64748B',
        glow: 'rgba(100, 116, 139, 0.4)',
        ring: '#94A3B8',
        text: '#94A3B8',
      };
    }
    switch (role) {
      case 'AGGREGATOR':
        // Threat Crimson / Rose
        return {
          fill: '#E11D48',
          stroke: '#FDA4AF',
          glow: 'rgba(225, 29, 72, 0.75)',
          ring: '#F43F5E',
          text: '#FECDD3',
        };
      case 'MULE_LAYER_1':
        // Upay Gold / Amber
        return {
          fill: '#F59E0B',
          stroke: '#FDE68A',
          glow: 'rgba(245, 158, 11, 0.6)',
          ring: '#FBBF24',
          text: '#FEF3C7',
        };
      case 'MULE_LAYER_2':
        // Neural Wash Purple
        return {
          fill: '#8B5CF6',
          stroke: '#DDD6FE',
          glow: 'rgba(139, 92, 246, 0.65)',
          ring: '#A78BFA',
          text: '#EDE9FE',
        };
      case 'CASH_OUT_AGENT':
        // Cyber Blue / UCB Brand Blue
        return {
          fill: '#0284C7',
          stroke: '#BAE6FD',
          glow: 'rgba(2, 132, 199, 0.65)',
          ring: '#38BDF8',
          text: '#E0F2FE',
        };
      case 'VICTIM':
        // Security Emerald Green
        return {
          fill: '#059669',
          stroke: '#A7F3D0',
          glow: 'rgba(5, 150, 105, 0.65)',
          ring: '#34D399',
          text: '#D1FAE5',
        };
      default:
        return {
          fill: '#0054A6',
          stroke: '#93C5FD',
          glow: 'rgba(0, 84, 166, 0.5)',
          ring: '#60A5FA',
          text: '#DBEAFE',
        };
    }
  };

  const filteredNodes = cluster.nodes.filter((node) => {
    if (filterRole === 'ALL') return true;
    return node.role === filterRole;
  });

  // Calculate in-degree & out-degree
  const inEdges = cluster.edges.filter((e) => e.target === selectedNode.id);
  const outEdges = cluster.edges.filter((e) => e.source === selectedNode.id);
  const totalInflow = inEdges.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutflow = outEdges.reduce((acc, curr) => acc + curr.amount, 0);

  // Connected node IDs for high-tech dimming/focusing
  const activeFocusId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = new Set<string>([activeFocusId]);
  cluster.edges.forEach((edge) => {
    if (edge.source === activeFocusId) connectedNodeIds.add(edge.target);
    if (edge.target === activeFocusId) connectedNodeIds.add(edge.source);
  });

  // Edge trajectory path calculation helper
  const getEdgePath = (edgeId: string, src: { x: number; y: number }, tgt: { x: number; y: number }) => {
    if (src.x === 600 && tgt.x === 600) {
      if (src.y < tgt.y) {
        // Downward arc of circular smurfing
        return {
          pathD: `M ${src.x} ${src.y} C 540 190 540 290 ${tgt.x} ${tgt.y}`,
          labelX: 535,
          labelY: 240,
        };
      } else {
        // Upward return loop of circular smurfing
        return {
          pathD: `M ${src.x} ${src.y} C 660 290 660 190 ${tgt.x} ${tgt.y}`,
          labelX: 665,
          labelY: 240,
        };
      }
    }

    if (edgeId === 'e7') {
      // Hub to Circular Wash Relay (W302 -> W204)
      return {
        pathD: `M ${src.x} ${src.y} Q 500 170 ${tgt.x} ${tgt.y}`,
        labelX: 505,
        labelY: 175,
      };
    }

    if (edgeId === 'e10') {
      // W302 to AGT-881
      return {
        pathD: `M ${src.x} ${src.y} Q 590 195 ${tgt.x} ${tgt.y}`,
        labelX: 615,
        labelY: 195,
      };
    }

    if (edgeId === 'e11') {
      // W302 to AGT-882
      return {
        pathD: `M ${src.x} ${src.y} Q 590 285 ${tgt.x} ${tgt.y}`,
        labelX: 615,
        labelY: 285,
      };
    }

    // Default smooth quadratic curve
    const midX = (src.x + tgt.x) / 2;
    const midY = (src.y + tgt.y) / 2;
    return {
      pathD: `M ${src.x} ${src.y} Q ${midX} ${midY - 8} ${tgt.x} ${tgt.y}`,
      labelX: midX,
      labelY: midY - 10,
    };
  };

  return (
    <div className="bg-[#060A14] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans select-none">
      {/* Top Cyber Defense Command Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-[#0B1220]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.3)]">
            <Network className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                <span>MuleVision™ Graph Attention Engine</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-sky-500/40 font-bold shadow-xs">
                  GAT v2.4
                </span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-600/60 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>{cluster.name} (Risk {cluster.riskScore}/100)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              12 Cyber Nodes · 12 Flow Vectors · BDT 1.28M Syndicated Laundering Pipeline
            </p>
          </div>
        </div>

        {/* Node Focus Selector & Controls */}
        <div className="flex items-center gap-2">
          {/* Node Quick Switcher */}
          <div className="flex items-center gap-1 bg-[#070D1B] p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
            <span className="px-1.5 text-slate-500 uppercase tracking-wider font-bold hidden sm:inline">
              Focus:
            </span>
            {cluster.nodes.slice(0, 7).map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedNodeId === n.id
                    ? 'bg-[#0054A6] text-white shadow-[0_0_10px_rgba(0,84,166,0.6)] ring-1 ring-sky-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {n.id}
              </button>
            ))}
          </div>

          {/* Velocity Pulse Toggle */}
          <button
            onClick={() => setAnimateParticles(!animateParticles)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              animateParticles
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle Flow Pulses"
          >
            <Zap className={`w-3.5 h-3.5 ${animateParticles ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="hidden md:inline font-mono">Pulse</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-300 font-semibold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Graph Canvas Visualizer (8 cols) - Inspired by France Train Network Video */}
        <div className="lg:col-span-8 p-3 sm:p-5 bg-gradient-to-br from-[#060A14] via-[#091124] to-[#040810] relative overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
          {/* Subtle Ambient Radial Lighting around Central Hub */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] pointer-events-none rounded-full blur-[90px] opacity-25"
            style={{
              background: 'radial-gradient(ellipse at center, #E11D48 0%, #0054A6 50%, transparent 75%)',
            }}
          />

          {/* Precision Engineering Cyber Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Top-Left Video-Style Cyber HUD Ticker (Like "FRANCE / 05:39" in user video) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 block font-bold">
                  {lang === 'BN' ? 'এমএফএস নেটওয়ার্ক বিশ্লেষণ' : 'BANGLADESH MFS TOPOLOGY'}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    {activeStage.timeLabel}:{digitalSeconds.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE GNN
                  </span>
                </div>
              </div>
            </div>

            {/* Active Stage Indicator Badge */}
            <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl text-right">
              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                {lang === 'BN' ? 'বর্তমান সক্রিয় পর্যায়' : 'ACTIVE SIMULATION STAGE'}
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {lang === 'BN' ? activeStage.stageNameBn : activeStage.stageNameEn}
              </span>
            </div>
          </div>

          {/* Video-Style SVG Graph Component */}
          <div className="w-full h-full flex items-center justify-center min-h-[440px] relative">
            <svg
              viewBox="0 0 840 480"
              className="w-full h-full max-h-[500px] transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Glow Filter for Crimson Aggregator */}
                <filter id="glow-crimson" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Glow Filter for Cyber Blue */}
                <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Glow Filter for Emerald Victims */}
                <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Glow Filter for Amber Smurfs */}
                <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Arrow markers */}
                <marker
                  id="arrow-neon-blue"
                  markerWidth="7"
                  markerHeight="5"
                  refX="19"
                  refY="2.5"
                  orient="auto"
                >
                  <polygon points="0 0.5, 6 2.5, 0 4.5" fill="#38BDF8" />
                </marker>

                <marker
                  id="arrow-neon-red"
                  markerWidth="7"
                  markerHeight="5"
                  refX="19"
                  refY="2.5"
                  orient="auto"
                >
                  <polygon points="0 0.5, 6 2.5, 0 4.5" fill="#F43F5E" />
                </marker>

                <marker
                  id="arrow-neon-dim"
                  markerWidth="6"
                  markerHeight="4"
                  refX="16"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0.5, 5 2, 0 3.5" fill="#475569" opacity="0.6" />
                </marker>
              </defs>

              {/* Stage 4: Circular Laundering Wash Orbit Visual Zone (Inspired by orbit animation) */}
              {highlightCircular && (
                <g className="pointer-events-none">
                  {/* Outer glowing orbital ellipse */}
                  <ellipse
                    cx="600"
                    cy="240"
                    rx="58"
                    ry="150"
                    fill="rgba(139, 92, 246, 0.05)"
                    stroke="rgba(244, 63, 94, 0.45)"
                    strokeWidth="1.8"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Orbit Label Chip */}
                  <rect
                    x="535"
                    y="230"
                    width="130"
                    height="20"
                    rx="10"
                    fill="#0F172A"
                    stroke="#F43F5E"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="600"
                    y="243.5"
                    fill="#FDA4AF"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="800"
                    textAnchor="middle"
                    className="uppercase tracking-wider select-none"
                  >
                    Circular Wash Orbit
                  </text>
                </g>
              )}

              {/* Flow Vectors (Curved Glowing Transit Lines) */}
              {cluster.edges.map((edge) => {
                const srcNode = cluster.nodes.find((n) => n.id === edge.source);
                const tgtNode = cluster.nodes.find((n) => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                const src = getNodeCoordinates(srcNode);
                const tgt = getNodeCoordinates(tgtNode);

                const isConnected = activeFocusId === edge.source || activeFocusId === edge.target;
                const isStageActive = activeStage.activeEdgeIds.includes(edge.id);

                const { pathD, labelX, labelY } = getEdgePath(edge.id, src, tgt);

                const strokeColor = edge.isCircular
                  ? '#F43F5E'
                  : isConnected || isStageActive
                  ? '#38BDF8'
                  : '#334155';

                const strokeWidth = edge.isCircular ? 2.8 : isConnected || isStageActive ? 2.6 : 1.4;

                return (
                  <g key={edge.id} className="transition-all duration-300">
                    {/* Glowing bloom blur underlying stroke */}
                    {(edge.isCircular || isConnected || isStageActive) && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edge.isCircular ? 'rgba(244, 63, 94, 0.35)' : 'rgba(56, 189, 248, 0.35)'}
                        strokeWidth={strokeWidth + 5}
                        strokeLinecap="round"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Edge Main Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={edge.isCircular ? '6 4' : undefined}
                      markerEnd={
                        edge.isCircular
                          ? 'url(#arrow-neon-red)'
                          : isConnected || isStageActive
                          ? 'url(#arrow-neon-blue)'
                          : 'url(#arrow-neon-dim)'
                      }
                      opacity={isConnected || isStageActive || edge.isCircular ? 1 : 0.45}
                      className="pointer-events-none"
                    />

                    {/* Glowing Transit Photon Particle traveling along path (Video-Style) */}
                    {animateParticles && (edge.isCircular || isConnected || isStageActive) && (
                      <>
                        <circle
                          r="4"
                          fill={edge.isCircular ? '#FB7185' : '#38BDF8'}
                          className="pointer-events-none filter drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
                        >
                          <animateMotion
                            path={pathD}
                            dur={edge.isCircular ? '1.5s' : '2.0s'}
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Secondary trailing particle */}
                        <circle
                          r="2.5"
                          fill="#FFFFFF"
                          className="pointer-events-none opacity-80"
                        >
                          <animateMotion
                            path={pathD}
                            dur={edge.isCircular ? '1.5s' : '2.0s'}
                            begin="0.3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}

                    {/* Streamlined Floating Transaction Value Tag */}
                    <g
                      transform={`translate(${labelX}, ${labelY})`}
                      className="pointer-events-none select-none transition-all duration-200"
                    >
                      <rect
                        x="-28"
                        y="-8.5"
                        width="56"
                        height="17"
                        rx="8.5"
                        fill="#060C1A"
                        stroke={edge.isCircular ? '#F43F5E' : isConnected || isStageActive ? '#0284C7' : '#334155'}
                        strokeWidth="1.2"
                        opacity="0.96"
                      />
                      <text
                        x="0"
                        y="3"
                        fill={edge.isCircular ? '#FDA4AF' : isConnected || isStageActive ? '#7DD3FC' : '#94A3B8'}
                        fontSize="8.5"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        ৳{(edge.amount / 1000).toFixed(0)}k · {edge.velocityMinutes}m
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Node Stations (Glow Hubs inspired by France Train Video) */}
              {filteredNodes.map((node) => {
                const pos = getNodeCoordinates(node);
                const isSelected = node.id === selectedNodeId;
                const isAggregator = node.role === 'AGGREGATOR';
                const isHovered = node.id === hoveredNodeId;
                const isFocused = connectedNodeIds.has(node.id);
                const isStageActive = activeStage.activeNodeIds.includes(node.id);
                const color = getNodeColor(node.role, node.status);

                return (
                  <g
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-pointer"
                    style={{ opacity: isFocused || isStageActive ? 1 : 0.55 }}
                  >
                    {/* Big Interactive Clickable Hitbox */}
                    <circle cx={pos.x} cy={pos.y} r="32" fill="transparent" />

                    {/* Central Aggregator Mega-Hub (Like Paris in France Video) */}
                    {isAggregator && (
                      <g className="pointer-events-none">
                        {/* Outer pulsating beacon wave */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="34"
                          fill="none"
                          stroke="#E11D48"
                          strokeWidth="1.2"
                          opacity="0.4"
                          className="animate-ping"
                        />
                        {/* Dashed outer rotation radar ring */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="28"
                          fill="none"
                          stroke="#F43F5E"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          opacity="0.8"
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="23"
                          fill="none"
                          stroke="#FDA4AF"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      </g>
                    )}

                    {/* Selected Node Halo */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isAggregator ? 25 : 20}
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="3"
                        className="animate-pulse pointer-events-none"
                      />
                    )}

                    {/* Node Core Body with Neon Glow Filter */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isAggregator ? 18 : 13}
                      fill={color.fill}
                      stroke={isSelected ? '#FFFFFF' : isHovered ? '#38BDF8' : color.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                      style={{ filter: `drop-shadow(0 0 8px ${color.glow})` }}
                      className="transition-transform duration-150"
                    />

                    {/* Inner Glyphs */}
                    {isAggregator ? (
                      <text
                        x={pos.x}
                        y={pos.y + 4.5}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="900"
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        ⚡
                      </text>
                    ) : node.role === 'CASH_OUT_AGENT' ? (
                      <text
                        x={pos.x}
                        y={pos.y + 3.5}
                        fill="#FFFFFF"
                        fontSize="7.5"
                        fontWeight="900"
                        textAnchor="middle"
                        className="select-none pointer-events-none font-mono"
                      >
                        ATM
                      </text>
                    ) : null}

                    {/* Sleek Node Identifier Typography (Floating Directly Below) */}
                    <g transform={`translate(${pos.x}, ${pos.y + (isAggregator ? 28 : 22)})`}>
                      <text
                        x="0"
                        y="0"
                        fill={isSelected ? '#38BDF8' : '#F8FAFC'}
                        fontSize={isAggregator ? '10' : '9'}
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="900"
                        textAnchor="middle"
                        className="select-none"
                        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}
                      >
                        {node.id}
                      </text>
                      <text
                        x="0"
                        y="10"
                        fill={color.text}
                        fontSize="7.5"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="700"
                        textAnchor="middle"
                        className="select-none uppercase tracking-tight"
                        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}
                      >
                        {node.role === 'AGGREGATOR'
                          ? 'HUB'
                          : node.role === 'VICTIM'
                          ? 'VICTIM'
                          : node.role === 'CASH_OUT_AGENT'
                          ? 'AGENT'
                          : node.role === 'MULE_LAYER_2'
                          ? 'RELAY'
                          : 'MULE'}{' '}
                        · ৳{(node.balance / 1000).toFixed(0)}k
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Video-Style Bottom Time Scrubber & Flow Controls (Like "TRAINS IN SERVICE" in video) */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            {/* Play / Pause & Stage Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                    : 'bg-blue-600 hover:bg-blue-500 text-white font-bold'
                }`}
                title={isPlaying ? 'Pause Simulation' : 'Play Flow Sequence'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Speed Toggles */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono font-bold">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      playbackSpeed === spd
                        ? 'bg-[#0054A6] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Scrubber step buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {TIMELINE_STAGES.map((stg, i) => (
                  <button
                    key={stg.id}
                    onClick={() => setCurrentStageIdx(i)}
                    className={`px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                      currentStageIdx === i
                        ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-400'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Stage {stg.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Metrics Counter in Corner (Like "TRAINS IN SERVICE: 247" in user video) */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                  {lang === 'BN' ? 'সক্রিয় লেনদেন ভেক্টর' : 'FLOWS IN SERVICE'}
                </span>
                <span className="text-sm font-black text-sky-400">
                  12 Active
                </span>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                  {lang === 'BN' ? 'লন্ডারিং ভলিউম' : 'BURST VELOCITY'}
                </span>
                <span className="text-sm font-black text-rose-400">
                  ৳1.28M / 9.6x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Intelligence Dossier & Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-[#090F1E] border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Dossier Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-400">
                  ENTITY DOSSIER: #{selectedNode.id}
                </span>
              </div>
              <span
                className={`text-[9.5px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  selectedNode.status === 'FROZEN'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : selectedNode.riskScore >= 80
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}
              >
                {selectedNode.status === 'FROZEN' ? 'QUARANTINED' : 'FLAGGED THREAT'}
              </span>
            </div>

            {/* Suspect Title & Identification */}
            <div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-lg font-black text-white tracking-tight">{selectedNode.label}</h4>
                <span className="text-xs font-mono text-slate-400 font-semibold">{selectedNode.degree} Edges</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  {selectedNode.role.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Cluster: Net #17</span>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
              {[
                { id: 'OVERVIEW', label: 'Threat Metrics' },
                { id: 'FLOWS', label: 'In / Outflow' },
                { id: 'SIGNATURES', label: 'Signatures' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInspectorTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeInspectorTab === tab.id
                      ? 'bg-[#0054A6] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Threat Metrics */}
            {activeInspectorTab === 'OVERVIEW' && (
              <div className="space-y-3 animate-in fade-in">
                {/* Composite Risk Gauge Card */}
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                      Neural Graph Risk Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black font-mono text-rose-500">
                        {selectedNode.riskScore}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ 100</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-semibold block mt-0.5 font-mono">
                      GAT Attention: {(selectedNode.riskScore / 100).toFixed(2)}
                    </span>
                  </div>

                  {/* Circular visual progress */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        stroke="#1E293B"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        stroke="#EF4444"
                        strokeWidth="5"
                        strokeDasharray="138"
                        strokeDashoffset={138 - (138 * selectedNode.riskScore) / 100}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute text-xs font-mono font-bold text-white">
                      {selectedNode.riskScore}%
                    </span>
                  </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-medium">Current Float</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      ৳{selectedNode.balance.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-amber-400 font-semibold">Smurf Wallet</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-medium">Dispersion Velocity</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {selectedNode.id === 'W302' ? '12 min avg' : '4-5 mins'}
                    </span>
                    <span className="text-[9px] text-rose-400 font-semibold">Rapid Fan-Out</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-medium">Network Cluster</span>
                    <span className="text-base font-bold font-mono text-sky-400 mt-0.5 block">
                      Net #17
                    </span>
                    <span className="text-[9px] text-slate-400">Patuakhali Coastal</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-medium">Degree Centrality</span>
                    <span className="text-base font-bold font-mono text-rose-400 mt-0.5 block">
                      {selectedNode.degree} Edges
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {selectedNode.degree > 4 ? 'Central Hub' : 'Relay Hop'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Flow Ledger */}
            {activeInspectorTab === 'FLOWS' && (
              <div className="space-y-2.5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                    <span className="text-[9px] text-emerald-400 block font-bold font-mono">TOTAL INFLOW</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      ৳{totalInflow > 0 ? totalInflow.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                    <span className="text-[9px] text-rose-400 block font-bold font-mono">TOTAL OUTFLOW</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      ৳{totalOutflow > 0 ? totalOutflow.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {inEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] flex justify-between items-center"
                    >
                      <div className="text-slate-300">
                        <span className="text-emerald-400 font-bold">IN:</span> {e.source} → {selectedNode.id}
                      </div>
                      <span className="font-mono font-bold text-white">৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {outEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] flex justify-between items-center"
                    >
                      <div className="text-slate-300">
                        <span className="text-rose-400 font-bold">OUT:</span> {selectedNode.id} → {e.target}
                      </div>
                      <span className="font-mono font-bold text-white">৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Signatures */}
            {activeInspectorTab === 'SIGNATURES' && (
              <div className="space-y-2 max-h-52 overflow-y-auto animate-in fade-in">
                {cluster.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                    <span className="leading-snug">{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button at Bottom */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
            {selectedNode.status === 'FROZEN' ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-2xl text-xs font-bold">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Wallet Flow Quarantined & Locked</span>
              </div>
            ) : (
              <button
                onClick={() => onFreezeWallet(selectedNode.id, selectedNode.label)}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black py-3 px-4 rounded-2xl text-xs shadow-lg hover:shadow-rose-600/30 transition-all transform active:scale-95 cursor-pointer border border-rose-500/30"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Freeze {selectedNode.id} & Quarantine Ring</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
