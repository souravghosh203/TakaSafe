import React, { useState } from 'react';
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
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  DollarSign,
  Maximize2,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface MuleVisionGraphProps {
  cluster: MuleCluster;
  onFreezeWallet: (walletId: string, label: string) => void;
}

export const MuleVisionGraph: React.FC<MuleVisionGraphProps> = ({ cluster, onFreezeWallet }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('W302');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'OVERVIEW' | 'FLOWS' | 'SIGNATURES'>('OVERVIEW');
  const [animateParticles, setAnimateParticles] = useState<boolean>(true);
  const [highlightCircular, setHighlightCircular] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Fallback safe selected node
  const selectedNode = cluster.nodes.find((n) => n.id === selectedNodeId) || cluster.nodes[0];

  const getNodeCoordinates = (node: MuleNode) => {
    switch (node.id) {
      // Stage 1: Victim Inflows (Left Column, x: 75)
      case 'W101': return { x: 75, y: 95 };
      case 'W102': return { x: 75, y: 225 };
      case 'W103': return { x: 75, y: 355 };
      // Stage 2: Layer 1 Smurf Mules (Mid-Left Column, x: 215)
      case 'W201': return { x: 215, y: 150 };
      case 'W202': return { x: 215, y: 300 };
      // Stage 3: Central Aggregator Hub (Center, x: 360)
      case 'W302': return { x: 360, y: 225 };
      // Stage 4: Circular Laundering Relay (Mid-Right Column, x: 505)
      case 'W204': return { x: 505, y: 110 };
      case 'W108': return { x: 505, y: 340 };
      // Stage 5: Cash-Out Agents & Exit Nodes (Far Right Column, x: 655)
      case 'W401': return { x: 655, y: 65 };
      case 'AGT-881': return { x: 655, y: 175 };
      case 'AGT-882': return { x: 655, y: 275 };
      case 'W402': return { x: 655, y: 385 };
      default: return { x: node.x, y: node.y };
    }
  };

  const getNodeColor = (role: MuleNode['role'], status: MuleNode['status']) => {
    if (status === 'FROZEN') {
      return { fill: '#475569', stroke: '#1E293B', ring: '#94A3B8' };
    }
    switch (role) {
      case 'AGGREGATOR':
        return { fill: '#DC2626', stroke: '#991B1B', ring: '#F87171' };
      case 'MULE_LAYER_1':
        return { fill: '#D97706', stroke: '#92400E', ring: '#FBBF24' };
      case 'MULE_LAYER_2':
        return { fill: '#7C3AED', stroke: '#5B21B6', ring: '#C084FC' };
      case 'CASH_OUT_AGENT':
        return { fill: '#0284C7', stroke: '#075985', ring: '#38BDF8' };
      case 'VICTIM':
        return { fill: '#059669', stroke: '#065F46', ring: '#34D399' };
      default:
        return { fill: '#475569', stroke: '#1E293B', ring: '#94A3B8' };
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

  return (
    <div className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden font-sans">
      {/* Top Cyber Defense Command Bar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0C1222] flex flex-wrap items-center justify-between gap-3">
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#0054A6] dark:text-blue-400 shadow-2xs">
            <Network className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>MuleVision™ Graph Attention Engine</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  GAT v2.4
                </span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>{cluster.name} (Risk {cluster.riskScore}/100)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              12 Nodes · 12 Flow Vectors · BDT 1.28M Laundering Ring
            </p>
          </div>
        </div>

        {/* Node Quick Switcher Toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline mr-1 font-semibold">
            Focus:
          </span>
          {cluster.nodes.slice(0, 7).map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedNodeId === n.id
                  ? 'bg-[#0054A6] text-white shadow-xs ring-1 ring-blue-500'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {n.id}
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Velocity Pulse Toggle */}
          <button
            onClick={() => setAnimateParticles(!animateParticles)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              animateParticles
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle Fund Stream Particles"
          >
            <Zap className={`w-3 h-3 ${animateParticles ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : ''}`} />
            <span className="hidden md:inline">Flow Pulse</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-700 dark:text-slate-300 font-semibold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[490px]">
        {/* Graph Canvas Visualizer (8 cols) - Crisp MFS Tech Canvas */}
        <div className="lg:col-span-8 p-3 sm:p-4 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#0A0E1A] dark:via-[#0F1424] dark:to-[#080C16] relative overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          {/* Subtle Precision Technical Engineering Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0, 84, 166, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 84, 166, 0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Forensic Pipeline Stage Lane Indicators at Top */}
          <div className="relative z-10 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-xl mb-2 flex items-center justify-between text-[10px] font-mono font-bold shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <span>1. Inflows (Victims)</span>
            </div>
            <span className="text-slate-400">➔</span>
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
              <span>2. Smurf Mules</span>
            </div>
            <span className="text-slate-400">➔</span>
            <div className="flex items-center gap-1.5 text-red-800 dark:text-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-xs animate-pulse" />
              <span>3. Aggregator Hub</span>
            </div>
            <span className="text-slate-400">➔</span>
            <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs" />
              <span>4. Circular Ring</span>
            </div>
            <span className="text-slate-400">➔</span>
            <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
              <span>5. Cash-Out (ATMs)</span>
            </div>
          </div>

          {/* SVG Graph Component */}
          <div className="w-full h-full flex items-center justify-center min-h-[420px]">
            <svg
              viewBox="0 0 740 450"
              className="w-full h-full max-h-[480px] transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                <marker
                  id="arrow-cyber"
                  markerWidth="8"
                  markerHeight="6"
                  refX="22"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0.5, 7 3, 0 5.5" fill="#0284C7" />
                </marker>

                <marker
                  id="arrow-circular"
                  markerWidth="8"
                  markerHeight="6"
                  refX="22"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0.5, 7 3, 0 5.5" fill="#DC2626" />
                </marker>

                <marker
                  id="arrow-dim"
                  markerHeight="5"
                  refX="18"
                  refY="2.5"
                  orient="auto"
                >
                  <polygon points="0 0.5, 6 2.5, 0 4.5" fill="#64748B" opacity="0.8" />
                </marker>

                <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.18" />
                </filter>
                <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.14" />
                </filter>
              </defs>

              {/* Circular Laundering Triangle Hull (Transparent Red Threat Zone) */}
              {highlightCircular && (
                <path
                  d="M 360 225 L 505 110 L 505 340 Z"
                  fill="rgba(220, 38, 38, 0.07)"
                  stroke="rgba(220, 38, 38, 0.45)"
                  strokeWidth="1.8"
                  strokeDasharray="6 4"
                  className="animate-pulse pointer-events-none"
                />
              )}

              {/* Edge Vectors */}
              {cluster.edges.map((edge) => {
                const srcNode = cluster.nodes.find((n) => n.id === edge.source);
                const tgtNode = cluster.nodes.find((n) => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                const src = getNodeCoordinates(srcNode);
                const tgt = getNodeCoordinates(tgtNode);

                const isConnected =
                  activeFocusId === edge.source || activeFocusId === edge.target;

                const strokeColor = edge.isCircular
                  ? '#DC2626'
                  : isConnected
                  ? '#0284C7'
                  : '#64748B';

                const strokeWidth = edge.isCircular ? 2.5 : isConnected ? 2.4 : 1.6;

                // Path & badge coordinate calculation to prevent collisions
                let pathD = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
                let labelX = (src.x + tgt.x) / 2;
                let labelY = (src.y + tgt.y) / 2;

                if (edge.source === 'W108' && edge.target === 'W302') {
                  // Return loop of circular smurfing
                  pathD = `M ${src.x} ${src.y} Q 420 310 ${tgt.x} ${tgt.y}`;
                  labelX = 425;
                  labelY = 295;
                } else if (edge.source === 'W204' && edge.target === 'W108') {
                  // Vertical circular smurfing line
                  pathD = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
                  labelX = 505;
                  labelY = 225;
                } else if (edge.source === 'W302' && edge.target === 'W204') {
                  pathD = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
                  labelX = 425;
                  labelY = 155;
                } else if (edge.source === 'W302' && edge.target === 'AGT-881') {
                  // Aggregator to Cash Out Agent 1: curve gently upward
                  pathD = `M ${src.x} ${src.y} Q 490 170 ${tgt.x} ${tgt.y}`;
                  labelX = 575;
                  labelY = 168;
                } else if (edge.source === 'W302' && edge.target === 'AGT-882') {
                  // Aggregator to Cash Out Agent 2: curve gently downward
                  pathD = `M ${src.x} ${src.y} Q 490 280 ${tgt.x} ${tgt.y}`;
                  labelX = 575;
                  labelY = 282;
                }

                return (
                  <g key={edge.id} className="transition-opacity duration-200">
                    {/* Background glow stroke if active */}
                    {(edge.isCircular || isConnected) && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edge.isCircular ? 'rgba(220, 38, 38, 0.22)' : 'rgba(2, 132, 199, 0.22)'}
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
                      strokeDasharray={edge.isCircular ? '5 3' : undefined}
                      markerEnd={
                        edge.isCircular
                          ? 'url(#arrow-circular)'
                          : isConnected
                          ? 'url(#arrow-cyber)'
                          : 'url(#arrow-dim)'
                      }
                      opacity={isConnected || edge.isCircular ? 1 : 0.75}
                      className="pointer-events-none"
                    />

                    {/* Animated Flow Particles */}
                    {animateParticles && (edge.isCircular || isConnected) && (
                      <circle
                        r="3.5"
                        fill={edge.isCircular ? '#DC2626' : '#0284C7'}
                        className="pointer-events-none filter drop-shadow"
                      >
                        <animateMotion
                          path={pathD}
                          dur={edge.isCircular ? '1.8s' : '2.2s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Edge Amount Badge */}
                    <g transform={`translate(${labelX}, ${labelY})`} className="pointer-events-none" filter="url(#badge-shadow)">
                      <rect
                        x="-30"
                        y="-9"
                        width="60"
                        height="18"
                        rx="9"
                        fill="#FFFFFF"
                        className="dark:fill-[#0F172A]"
                        stroke={edge.isCircular ? '#DC2626' : isConnected ? '#0284C7' : '#64748B'}
                        strokeWidth={edge.isCircular ? '1.8' : '1.4'}
                        opacity="0.98"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fill={edge.isCircular ? '#B91C1C' : isConnected ? '#0284C7' : '#1E293B'}
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        ৳{(edge.amount / 1000).toFixed(0)}k · {edge.velocityMinutes}m
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Node Groups */}
              {filteredNodes.map((node) => {
                const pos = getNodeCoordinates(node);
                const isSelected = node.id === selectedNodeId;
                const isAggregator = node.role === 'AGGREGATOR';
                const isHovered = node.id === hoveredNodeId;
                const isFocused = connectedNodeIds.has(node.id);
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
                    style={{ opacity: isFocused ? 1 : 0.7 }}
                  >
                    {/* Large Hit Target */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="35"
                      fill="transparent"
                      className="cursor-pointer"
                    />

                    {/* Aggregator Threat Radar Pulse */}
                    {isAggregator && (
                      <>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="32"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="1.6"
                          opacity="0.3"
                          className="animate-ping pointer-events-none"
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="26"
                          fill="none"
                          stroke="#DC2626"
                          strokeWidth="1.4"
                          strokeDasharray="4 3"
                          opacity="0.8"
                          className="pointer-events-none"
                        />
                      </>
                    )}

                    {/* Selected Node Ring Halo */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isAggregator ? 25 : 20}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="3"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Node Core Body */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isAggregator ? 19 : 15}
                      fill={color.fill}
                      stroke={isSelected ? '#FFFFFF' : isHovered ? '#0284C7' : color.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="url(#node-shadow)"
                      className="transition-transform duration-150"
                    />

                    {/* Inner Role Icon */}
                    {isAggregator ? (
                      <text
                        x={pos.x}
                        y={pos.y + 4.5}
                        fill="#FFFFFF"
                        fontSize="12"
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
                        fontSize="8.5"
                        fontWeight="900"
                        textAnchor="middle"
                        className="select-none pointer-events-none font-mono"
                      >
                        ATM
                      </text>
                    ) : null}

                    {/* Node Identifier Label (Rich Dual-Line Card Pill) */}
                    <g transform={`translate(${pos.x}, ${pos.y + (isAggregator ? 29 : 24)})`} filter="url(#badge-shadow)">
                      {/* Shadow Base Card */}
                      <rect
                        x="-38"
                        y="-9"
                        width="76"
                        height="26"
                        rx="6"
                        fill="#FFFFFF"
                        className="dark:fill-[#0F172A]"
                        stroke={isSelected ? '#0284C7' : '#475569'}
                        strokeWidth={isSelected ? '2' : '1.2'}
                        opacity="0.98"
                      />
                      {/* Line 1: Node ID */}
                      <text
                        x="0"
                        y="2.5"
                        fill={isSelected ? '#0284C7' : '#0F172A'}
                        className="dark:fill-white font-mono"
                        fontSize="9.5"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {node.id}
                      </text>
                      {/* Line 2: Role + Float */}
                      <text
                        x="0"
                        y="12"
                        fill={isAggregator ? '#DC2626' : node.role === 'VICTIM' ? '#059669' : node.role === 'CASH_OUT_AGENT' ? '#0284C7' : '#D97706'}
                        fontSize="7"
                        fontWeight="800"
                        textAnchor="middle"
                        className="uppercase tracking-tight"
                      >
                        {node.role === 'AGGREGATOR' ? 'HUB' : node.role === 'VICTIM' ? 'VICTIM' : node.role === 'CASH_OUT_AGENT' ? 'AGENT' : node.role === 'MULE_LAYER_2' ? 'RELAY' : 'MULE'} · ৳{(node.balance / 1000).toFixed(0)}k
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Floating Legend HUD */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs">
            <div className="flex flex-wrap items-center gap-3.5 text-[11px] font-medium text-slate-800 dark:text-slate-200">
              <span className="font-bold uppercase text-[9px] tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Entity Legend:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-xs" />
                <span className="font-bold">Aggregator Hub (W302)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs" />
                <span>Layer 1 Mule</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600 border border-white shadow-xs" />
                <span>Circular Relay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shadow-xs" />
                <span>MFS Cash-Out Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs" />
                <span>Victim Inflow</span>
              </div>
            </div>

            <button
              onClick={() => setHighlightCircular(!highlightCircular)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                highlightCircular
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-500/50'
                  : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              Wash Cycle Overlay: {highlightCircular ? 'Active' : 'Off'}
            </button>
          </div>
        </div>

        {/* Entity Intelligence Dossier & Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 p-4 bg-slate-50/70 dark:bg-[#0D1322] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Dossier Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  ENTITY DOSSIER: #{selectedNode.id}
                </span>
              </div>
              <span
                className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                  selectedNode.status === 'FROZEN'
                    ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    : selectedNode.riskScore >= 80
                    ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                }`}
              >
                {selectedNode.status === 'FROZEN' ? 'QUARANTINED' : 'FLAGGED THREAT'}
              </span>
            </div>

            {/* Suspect Title & Identification */}
            <div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{selectedNode.label}</h4>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">{selectedNode.degree} Edges</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300/80 dark:border-amber-500/20">
                  {selectedNode.role.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Cluster: Net #17</span>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1">
              {[
                { id: 'OVERVIEW', label: 'Threat Metrics' },
                { id: 'FLOWS', label: 'In / Outflow' },
                { id: 'SIGNATURES', label: 'Signatures' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInspectorTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeInspectorTab === tab.id
                      ? 'bg-[#0054A6] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Threat Metrics */}
            {activeInspectorTab === 'OVERVIEW' && (
              <div className="space-y-2.5 animate-in fade-in">
                {/* Composite Risk Gauge Card */}
                <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                      Neural Graph Risk Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-500">
                        {selectedNode.riskScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ 100</span>
                    </div>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mt-0.5">
                      GAT Attention: {(selectedNode.riskScore / 100).toFixed(2)}
                    </span>
                  </div>

                  {/* Circular visual progress */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#E2E8F0"
                        strokeWidth="4"
                        fill="none"
                        className="dark:stroke-slate-800"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#EF4444"
                        strokeWidth="4"
                        strokeDasharray="125"
                        strokeDashoffset={125 - (125 * selectedNode.riskScore) / 100}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                      {selectedNode.riskScore}%
                    </span>
                  </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Current Float</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                      ৳{selectedNode.balance.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold">Smurf Wallet</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Dispersion Velocity</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                      {selectedNode.id === 'W302' ? '12 min avg' : '4-5 mins'}
                    </span>
                    <span className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold">High Speed Fan-out</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Network Cluster</span>
                    <span className="text-sm font-bold font-mono text-[#0054A6] dark:text-indigo-400 mt-0.5 block">
                      Net #17
                    </span>
                    <span className="text-[9px] text-slate-500">Patuakhali Coastal</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-medium">Degree Centrality</span>
                    <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
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
              <div className="space-y-2 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block font-bold">TOTAL INFLOW</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                      ৳{totalInflow > 0 ? totalInflow.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-lg">
                    <span className="text-[9px] text-rose-700 dark:text-rose-400 block font-bold">TOTAL OUTFLOW</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                      ৳{totalOutflow > 0 ? totalOutflow.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {inEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] flex justify-between items-center shadow-2xs"
                    >
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">IN:</span> {e.source} → {selectedNode.id}
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {outEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] flex justify-between items-center shadow-2xs"
                    >
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="text-rose-700 dark:text-rose-400 font-bold">OUT:</span> {selectedNode.id} → {e.target}
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {inEdges.length === 0 && outEdges.length === 0 && (
                    <div className="p-3 text-center text-slate-500 text-xs">
                      No direct flows connected for this node in current batch.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Signatures */}
            {activeInspectorTab === 'SIGNATURES' && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto animate-in fade-in">
                {cluster.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="p-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                    <span className="leading-snug">{ind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button at Bottom */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            {selectedNode.status === 'FROZEN' ? (
              <div className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Wallet Flow Quarantined & Locked</span>
              </div>
            ) : (
              <button
                onClick={() => onFreezeWallet(selectedNode.id, selectedNode.label)}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-xs hover:shadow transition-all transform active:scale-95 cursor-pointer border border-rose-700/20"
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
