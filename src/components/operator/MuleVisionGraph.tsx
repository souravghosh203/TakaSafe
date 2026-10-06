import React, { useState, useEffect } from 'react';
import { MuleCluster, MuleNode } from '../../types';
import {
  Network,
  ShieldAlert,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Lock,
  Zap,
  Play,
  Pause,
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
    volumeBDT: 380000,
  },
];

export const MuleVisionGraph: React.FC<MuleVisionGraphProps> = ({
  cluster,
  onFreezeWallet,
  lang = 'EN',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('W302');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [animateParticles, setAnimateParticles] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'OVERVIEW' | 'FLOWS' | 'SIGNATURES'>('OVERVIEW');

  // Automated Timeline Simulation Engine
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(2); // Default to Central Hub stage
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Playback loop timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(1200, 3000 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => (prev + 1) % TIMELINE_STAGES.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const activeStage = TIMELINE_STAGES[currentStageIdx];

  // Fallback safe selected node
  const selectedNode = cluster.nodes.find((n) => n.id === selectedNodeId) || cluster.nodes[0];

  // Spatial topology coordinates (viewBox 840 x 480)
  const getNodeCoordinates = (node: MuleNode) => {
    switch (node.id) {
      // Stage 1: Victim Inflows (Left Column, x: 90)
      case 'W101': return { x: 90, y: 110 };
      case 'W102': return { x: 90, y: 240 };
      case 'W103': return { x: 90, y: 370 };
      // Stage 2: Layer 1 Smurf Mules (Mid-Left Column, x: 250)
      case 'W201': return { x: 250, y: 165 };
      case 'W202': return { x: 250, y: 315 };
      // Stage 3: Central Aggregator Mega-Hub (Center, x: 425)
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

  // Node color palette for pristine Light Theme matching image 2
  const getNodeColor = (role: MuleNode['role'], status: MuleNode['status']) => {
    if (status === 'FROZEN') {
      return {
        fill: '#64748B',
        stroke: '#475569',
        glow: 'rgba(100, 116, 139, 0.25)',
        text: '#475569',
        border: '#94A3B8',
      };
    }
    switch (role) {
      case 'AGGREGATOR':
        // Threat Crimson / Red
        return {
          fill: '#DC2626',
          stroke: '#B91C1C',
          glow: 'rgba(220, 38, 38, 0.35)',
          text: '#DC2626',
          border: '#F87171',
        };
      case 'MULE_LAYER_1':
        // Orange / Amber
        return {
          fill: '#EA580C',
          stroke: '#C2410C',
          glow: 'rgba(234, 88, 12, 0.35)',
          text: '#EA580C',
          border: '#FB923C',
        };
      case 'MULE_LAYER_2':
        // Purple
        return {
          fill: '#7C3AED',
          stroke: '#6D28D9',
          glow: 'rgba(124, 58, 237, 0.35)',
          text: '#7C3AED',
          border: '#A78BFA',
        };
      case 'CASH_OUT_AGENT':
        // Blue / Sky
        return {
          fill: '#0284C7',
          stroke: '#0369A1',
          glow: 'rgba(2, 132, 199, 0.35)',
          text: '#0284C7',
          border: '#38BDF8',
        };
      case 'VICTIM':
      default:
        // Emerald Green
        return {
          fill: '#059669',
          stroke: '#047857',
          glow: 'rgba(5, 150, 105, 0.35)',
          text: '#059669',
          border: '#34D399',
        };
    }
  };

  // Calculate in-degree & out-degree
  const inEdges = cluster.edges.filter((e) => e.target === selectedNode.id);
  const outEdges = cluster.edges.filter((e) => e.source === selectedNode.id);
  const totalInflow = inEdges.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutflow = outEdges.reduce((acc, curr) => acc + curr.amount, 0);

  // Connected node IDs for focusing
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
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden font-sans select-none">
      {/* Top Cyber Defense Command Bar (White Theme) */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0054A6] shadow-2xs">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>MuleVision™ Graph Attention Engine</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#0054A6] border border-blue-200 font-bold shadow-2xs">
                  GAT v2.4
                </span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>{cluster.name} (Risk {cluster.riskScore}/100)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              12 Nodes · 12 Flow Vectors · BDT 1.28M Laundering Ring
            </p>
          </div>
        </div>

        {/* Node Focus Selector & Controls */}
        <div className="flex items-center gap-2">
          {/* Node Quick Switcher */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-[10px] font-mono">
            <span className="px-1.5 text-slate-500 uppercase tracking-wider font-bold hidden sm:inline">
              FOCUS :
            </span>
            {cluster.nodes.slice(0, 7).map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedNodeId === n.id
                    ? 'bg-[#0054A6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {n.id}
              </button>
            ))}
          </div>

          {/* Flow Pulse Toggle */}
          <button
            onClick={() => setAnimateParticles(!animateParticles)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              animateParticles
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Flow Pulses"
          >
            <Zap className={`w-3.5 h-3.5 ${animateParticles ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
            <span className="font-mono">Flow Pulse</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-700 font-semibold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Graph Canvas Visualizer (8 cols) - Pristine White Grid Background */}
        <div className="lg:col-span-8 p-3 sm:p-5 bg-[#F8FAFC] relative overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          {/* Precision Engineering Light Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(203, 213, 225, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.45) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Top Stage Sequence Legend (Exact Match to Image 2) */}
          <div className="relative z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/90 shadow-xs text-xs font-semibold select-none flex-wrap mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-700 text-[11px] font-mono">1. Inflows (Victims)</span>
            </div>
            <span className="text-slate-300">➔</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-700 text-[11px] font-mono">2. Smurf Mules</span>
            </div>
            <span className="text-slate-300">➔</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              <span className="text-slate-700 text-[11px] font-mono">3. Aggregator Hub</span>
            </div>
            <span className="text-slate-300">➔</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
              <span className="text-slate-700 text-[11px] font-mono">4. Circular Ring</span>
            </div>
            <span className="text-slate-300">➔</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
              <span className="text-slate-700 text-[11px] font-mono">5. Cash-Out (ATMs)</span>
            </div>
          </div>

          {/* SVG Graph Component */}
          <div className="w-full h-full flex items-center justify-center min-h-[440px] relative">
            <svg
              viewBox="0 0 840 480"
              className="w-full h-full max-h-[500px] transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Arrow markers */}
                <marker
                  id="arrow-light-blue"
                  markerWidth="7"
                  markerHeight="5"
                  refX="19"
                  refY="2.5"
                  orient="auto"
                >
                  <polygon points="0 0.5, 6 2.5, 0 4.5" fill="#0284C7" />
                </marker>

                <marker
                  id="arrow-light-red"
                  markerWidth="7"
                  markerHeight="5"
                  refX="19"
                  refY="2.5"
                  orient="auto"
                >
                  <polygon points="0 0.5, 6 2.5, 0 4.5" fill="#DC2626" />
                </marker>

                <marker
                  id="arrow-light-dim"
                  markerWidth="6"
                  markerHeight="4"
                  refX="16"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0.5, 5 2, 0 3.5" fill="#94A3B8" opacity="0.8" />
                </marker>
              </defs>

              {/* Stage 4: Circular Laundering Wash Orbit Visual Zone */}
              <g className="pointer-events-none">
                {/* Outer dashed orbital ellipse */}
                <ellipse
                  cx="600"
                  cy="240"
                  rx="55"
                  ry="145"
                  fill="rgba(244, 63, 94, 0.03)"
                  stroke="rgba(225, 29, 72, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
              </g>

              {/* Flow Vectors */}
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
                  ? '#DC2626'
                  : isConnected || isStageActive
                  ? '#0284C7'
                  : '#94A3B8';

                const strokeWidth = edge.isCircular ? 2.6 : isConnected || isStageActive ? 2.6 : 1.4;

                return (
                  <g key={edge.id} className="transition-all duration-300">
                    {/* Glowing highlight for active edge */}
                    {(edge.isCircular || isConnected || isStageActive) && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edge.isCircular ? 'rgba(220, 38, 38, 0.15)' : 'rgba(2, 132, 199, 0.18)'}
                        strokeWidth={strokeWidth + 4}
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
                      strokeDasharray={edge.isCircular ? '5 4' : undefined}
                      markerEnd={
                        edge.isCircular
                          ? 'url(#arrow-light-red)'
                          : isConnected || isStageActive
                          ? 'url(#arrow-light-blue)'
                          : 'url(#arrow-light-dim)'
                      }
                      opacity={isConnected || isStageActive || edge.isCircular ? 1 : 0.6}
                      className="pointer-events-none"
                    />

                    {/* Animated Flow Photon Particle traveling along path */}
                    {animateParticles && (edge.isCircular || isConnected || isStageActive) && (
                      <circle
                        r="3.5"
                        fill={edge.isCircular ? '#DC2626' : '#0284C7'}
                        className="pointer-events-none"
                      >
                        <animateMotion
                          path={pathD}
                          dur={edge.isCircular ? '1.5s' : '2.0s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* White Floating Transaction Value Tag (Image 2 style) */}
                    <g
                      transform={`translate(${labelX}, ${labelY})`}
                      className="pointer-events-none select-none transition-all duration-200"
                    >
                      <rect
                        x="-26"
                        y="-8.5"
                        width="52"
                        height="17"
                        rx="8.5"
                        fill="#FFFFFF"
                        stroke={edge.isCircular ? '#DC2626' : isConnected || isStageActive ? '#0284C7' : '#94A3B8'}
                        strokeWidth="1.2"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                      />
                      <text
                        x="0"
                        y="3"
                        fill={edge.isCircular ? '#DC2626' : isConnected || isStageActive ? '#0284C7' : '#334155'}
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

              {/* Node Stations with White Badge (Exact Match to Image 2) */}
              {cluster.nodes.map((node) => {
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
                    style={{ opacity: isFocused || isStageActive ? 1 : 0.65 }}
                  >
                    {/* Interactive Clickable Hitbox */}
                    <circle cx={pos.x} cy={pos.y} r="32" fill="transparent" />

                    {/* Central Aggregator Outer Dashed Radar Rings (Image 2 style) */}
                    {isAggregator && (
                      <g className="pointer-events-none">
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="28"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="1.2"
                          strokeDasharray="4 3"
                          opacity="0.45"
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="23"
                          fill="none"
                          stroke="#F87171"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      </g>
                    )}

                    {/* Hub Exits Outer Rings (W401 & W402) */}
                    {(node.id === 'W401' || node.id === 'W402') && (
                      <g className="pointer-events-none">
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="24"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          opacity="0.4"
                        />
                      </g>
                    )}

                    {/* Selected Node Ring Halo */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isAggregator ? 24 : 19}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="3"
                        className="pointer-events-none animate-pulse"
                      />
                    )}

                    {/* Node Core Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isAggregator ? 18 : 14}
                      fill={color.fill}
                      stroke={isSelected ? '#0054A6' : isHovered ? '#0284C7' : color.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                      className="transition-transform duration-150"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
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

                    {/* White Rectangular Node Pill Directly Below (Exact Match to Image 2) */}
                    <g transform={`translate(${pos.x}, ${pos.y + (isAggregator ? 21 : 17)})`}>
                      <rect
                        x="-31"
                        y="0"
                        width="62"
                        height="24"
                        rx="6"
                        fill="#FFFFFF"
                        stroke={isSelected ? '#0054A6' : color.border}
                        strokeWidth={isSelected ? 1.8 : 1.2}
                        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.08))"
                      />
                      <text
                        x="0"
                        y="10.5"
                        fill="#0F172A"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="800"
                        textAnchor="middle"
                        className="select-none"
                      >
                        {node.id}
                      </text>
                      <text
                        x="0"
                        y="19"
                        fill={color.text}
                        fontSize="7.5"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="800"
                        textAnchor="middle"
                        className="select-none uppercase tracking-tight"
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

          {/* Bottom Time Scrubber & Flow Controls (White Theme) */}
          <div className="relative z-10 pt-2 border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Play / Pause & Stage Controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                    : 'bg-[#0054A6] hover:bg-blue-700 text-white font-bold'
                }`}
                title={isPlaying ? 'Pause Simulation' : 'Play Flow Sequence'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>

              {/* Speed Toggles */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[10px] font-mono font-bold">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      playbackSpeed === spd
                        ? 'bg-[#0054A6] text-white'
                        : 'text-slate-500 hover:text-slate-800'
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
                    className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                      currentStageIdx === i
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    Stage {stg.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Stage description and Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[11px] font-bold text-slate-700">
                {lang === 'BN' ? activeStage.stageNameBn : activeStage.stageNameEn}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-bold text-rose-600">
                ৳{(activeStage.volumeBDT / 1000).toFixed(0)}k volume
              </span>
            </div>
          </div>
        </div>

        {/* Entity Intelligence Dossier & Inspector Panel (4 cols - Exact Match to Image 2) */}
        <div className="lg:col-span-4 p-5 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Dossier Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-600">
                  ENTITY DOSSIER: #{selectedNode.id}
                </span>
              </div>
              <span
                className={`text-[9.5px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  selectedNode.status === 'FROZEN'
                    ? 'bg-slate-100 text-slate-600 border-slate-300'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedNode.status === 'FROZEN' ? 'QUARANTINED' : 'FLAGGED THREAT'}
              </span>
            </div>

            {/* Suspect Title & Identification */}
            <div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{selectedNode.label}</h4>
                <span className="text-xs font-mono text-slate-500 font-semibold">{selectedNode.degree} Edges</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                  {selectedNode.role.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Cluster: Net #17</span>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
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
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
                      Neural Graph Risk Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black font-mono text-rose-600">
                        {selectedNode.riskScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ 100</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold block mt-0.5 font-mono">
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
                        stroke="#E2E8F0"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        stroke="#E11D48"
                        strokeWidth="5"
                        strokeDasharray="138"
                        strokeDashoffset={138 - (138 * selectedNode.riskScore) / 100}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute text-xs font-mono font-bold text-slate-900">
                      {selectedNode.riskScore}%
                    </span>
                  </div>
                </div>

                {/* Metric Grid (Exact 2x2 match to Image 2) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-500 block font-medium">Current Float</span>
                    <span className="text-base font-black font-mono text-slate-900 mt-0.5 block">
                      ৳{selectedNode.balance.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-amber-700 font-semibold">Smurf Wallet</span>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-500 block font-medium">Dispersion Velocity</span>
                    <span className="text-base font-black font-mono text-slate-900 mt-0.5 block">
                      {selectedNode.id === 'W302' ? '12 min avg' : '4-5 mins'}
                    </span>
                    <span className="text-[9px] text-rose-600 font-semibold">High Speed Fan-out</span>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-500 block font-medium">Network Cluster</span>
                    <span className="text-base font-black font-mono text-[#0054A6] mt-0.5 block">
                      Net #17
                    </span>
                    <span className="text-[9px] text-slate-500">Patuakhali Coastal</span>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-500 block font-medium">Degree Centrality</span>
                    <span className="text-base font-black font-mono text-rose-600 mt-0.5 block">
                      {selectedNode.degree} Edges
                    </span>
                    <span className="text-[9px] text-slate-500">
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
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[9px] text-emerald-700 block font-bold font-mono">TOTAL INFLOW</span>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block">
                      ৳{totalInflow > 0 ? totalInflow.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-[9px] text-rose-700 block font-bold font-mono">TOTAL OUTFLOW</span>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block">
                      ৳{totalOutflow > 0 ? totalOutflow.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {inEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[10px] flex justify-between items-center"
                    >
                      <div className="text-slate-700">
                        <span className="text-emerald-600 font-bold">IN:</span> {e.source} → {selectedNode.id}
                      </div>
                      <span className="font-mono font-bold text-slate-900">৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {outEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[10px] flex justify-between items-center"
                    >
                      <div className="text-slate-700">
                        <span className="text-rose-600 font-bold">OUT:</span> {selectedNode.id} → {e.target}
                      </div>
                      <span className="font-mono font-bold text-slate-900">৳{e.amount.toLocaleString()}</span>
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
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                    <span className="leading-snug">{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button at Bottom */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5">
            {selectedNode.status === 'FROZEN' ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl text-xs font-bold">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Wallet Flow Quarantined & Locked</span>
              </div>
            ) : (
              <button
                onClick={() => onFreezeWallet(selectedNode.id, selectedNode.label)}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-2xl text-xs shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer"
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
