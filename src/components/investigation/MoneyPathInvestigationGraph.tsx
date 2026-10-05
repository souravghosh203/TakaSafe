import React, { useState, useEffect, useId, useRef } from 'react';
import { Transaction } from '../../types';
import {
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Store,
  User,
  Wallet,
  Building2,
  Clock,
  MapPin,
  Smartphone,
  ExternalLink,
  Lock,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';

export interface GraphNode {
  id: string;
  name: string;
  agentName?: string;
  agentLicense?: string;
  role: 'VICTIM' | 'MULE_RELAY' | 'AGGREGATOR' | 'CASH_OUT_AGENT';
  roleLabel: string;
  entityType: string;
  walletOrId: string;
  location: string;
  deviceOrChannel: string;
  amountIn: number;
  amountOut: number;
  currentBalance: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'FLAGGED' | 'FROZEN';
  tags: string[];
  description: string;
  timestamp: string;
  elapsedMinutes: number;
  x: number;
  y: number;
  radius: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  velocityMinutes: number;
  elapsedLabel: string;
  channel: string;
  status: 'COMPLETED' | 'HELD' | 'BLOCKED';
  notes: string;
  curveType: 'straight' | 'curveUp' | 'curveDown' | 'curveMid';
}

interface MoneyPathInvestigationGraphProps {
  transaction: Transaction;
  onFreezeNode?: (nodeId: string, nodeName: string) => void;
  lang?: 'EN' | 'BN';
}

export const MoneyPathInvestigationGraph: React.FC<MoneyPathInvestigationGraphProps> = ({
  transaction,
  onFreezeNode,
  lang = 'EN',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('W302');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didDragRef = useRef<boolean>(false);
  const [animateParticles, setAnimateParticles] = useState<boolean>(true);
  const [playbackStage, setPlaybackStage] = useState<number>(4); // 0 to 4
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filterId = useId();

  // Graph Nodes layout with precise coordinates for clear visual flow
  const nodes: GraphNode[] = [
    {
      id: 'W101',
      name: `${transaction.senderName || 'Rafiqul Islam'}`,
      agentName: 'Victim Account Owner',
      role: 'VICTIM',
      roleLabel: lang === 'BN' ? 'ভুক্তভোগী একাউন্ট (উৎস)' : 'Compromised Victim (Origin)',
      entityType: 'Personal MFS Wallet',
      walletOrId: transaction.senderWallet || '01711-239481',
      location: transaction.senderLocation || 'Dhanmondi, Dhaka',
      deviceOrChannel: `${transaction.senderDevice || 'Infinix Hot 30'} • TakaSafe App`,
      amountIn: 0,
      amountOut: transaction.amount || 80000,
      currentBalance: 14500,
      riskScore: 24,
      riskLevel: 'LOW',
      status: 'ACTIVE',
      tags: ['Phishing Breach', 'Sleep Hours Debit', 'Device Anomaly'],
      description: 'Account credentials breached via nocturnal phishing replay. BDT 80,000 outbound transfer initiated at 03:20 AM without customer authorization.',
      timestamp: '03:20:14 AM',
      elapsedMinutes: 0,
      x: 95,
      y: 190,
      radius: 26,
    },
    {
      id: 'W201',
      name: 'Tareq Hasan',
      agentName: 'Fast Transit Mule',
      role: 'MULE_RELAY',
      roleLabel: lang === 'BN' ? 'লেয়ার-১ মানি মিউল' : 'Layer-1 Transit Smurf Mule',
      entityType: 'Intermediate Mule Account',
      walletOrId: '01822-441098 (Node W201)',
      location: 'Mirpur-10, Dhaka',
      deviceOrChannel: 'Xiaomi Poco X3 • P2P Rapid Relay',
      amountIn: transaction.amount || 80000,
      amountOut: (transaction.amount || 80000) + 75000,
      currentBalance: 85000,
      riskScore: 88,
      riskLevel: 'HIGH',
      status: 'FLAGGED',
      tags: ['Fast Relay', '< 4m Pass-Through', 'Bundled Fan-In'],
      description: 'High-velocity intermediary node. Received BDT 80,000 from victim and combined with BDT 75,000 from second victim W102, dispatching BDT 155,000 in under 4 minutes.',
      timestamp: '03:24:08 AM',
      elapsedMinutes: 4,
      x: 295,
      y: 190,
      radius: 26,
    },
    {
      id: 'W302',
      name: 'Md. Al-Amin',
      agentName: 'Syndicate Central Collector Hub',
      role: 'AGGREGATOR',
      roleLabel: lang === 'BN' ? 'সেন্ট্রাল মিউল হাব' : 'Central Syndicate Aggregator Hub',
      entityType: 'Mule Ring Core Wallet',
      walletOrId: transaction.receiverWallet || '01988-510294 (Node W302)',
      location: 'Kotwali, Chattogram / Patuakhali Coast',
      deviceOrChannel: 'Samsung Galaxy S21 • API Multi-Relay',
      amountIn: 1280000,
      amountOut: 940000,
      currentBalance: 412000,
      riskScore: 96,
      riskLevel: 'CRITICAL',
      status: 'FLAGGED',
      tags: ['In-degree 9', 'BDT 1.28M Collected', 'Coastal Split Dispersal'],
      description: 'Core aggregator node in Suspicious Network #17. Collected inflows from 9 compromised accounts, triggering simultaneous fan-out split tranches to remote coastal agents in under 16 minutes.',
      timestamp: '03:28:30 AM',
      elapsedMinutes: 8,
      x: 500,
      y: 190,
      radius: 32,
    },
    {
      id: 'AGT-881',
      name: 'Bismillah Telecom & MFS',
      agentName: 'Kabir Hossain (Authorized Agent #881)',
      agentLicense: 'BFIU-AGT-PAT-44021',
      role: 'CASH_OUT_AGENT',
      roleLabel: lang === 'BN' ? 'ক্যাশ-আউট এজেন্ট ১' : 'Dispersal Cash-Out Agent #1',
      entityType: 'Physical MFS Agent Storefront (OTC)',
      walletOrId: '01712-401920 (Agent ID: AGT-881)',
      location: 'Barishal Sadar / Patuakhali Highway, Barishal',
      deviceOrChannel: 'Agent POS Terminal • Over-The-Counter Cash-Out',
      amountIn: 250000,
      amountOut: 250000,
      currentBalance: 18000,
      riskScore: 76,
      riskLevel: 'HIGH',
      status: 'FLAGGED',
      tags: ['OTC Cash Withdrawal', 'No Biometric Check', 'Float Depletion -72%'],
      description: 'Physical brick-and-mortar MFS shop. Processed BDT 250,000 cash-out at 03:40 AM without standard customer verification. Agent cash float depleted to critical 12% reserve.',
      timestamp: '03:40:15 AM',
      elapsedMinutes: 16,
      x: 740,
      y: 110,
      radius: 28,
    },
    {
      id: 'AGT-882',
      name: 'Patuakhali Coastal Corner',
      agentName: 'Abul Kalam (Authorized Agent #882)',
      agentLicense: 'BFIU-AGT-PAT-90114',
      role: 'CASH_OUT_AGENT',
      roleLabel: lang === 'BN' ? 'ক্যাশ-আউট এজেন্ট ২' : 'Dispersal Cash-Out Agent #2',
      entityType: 'Remote Ferry Ghat Agent Counter (OTC)',
      walletOrId: '01823-998811 (Agent ID: AGT-882)',
      location: 'Galachipa Ghat Ferry Terminal, Patuakhali',
      deviceOrChannel: 'Agent Mobile POS • OTC Cash-Out',
      amountIn: 280000,
      amountOut: 280000,
      currentBalance: 22000,
      riskScore: 79,
      riskLevel: 'HIGH',
      status: 'FLAGGED',
      tags: ['Ferry Ghat Agent', 'Split Cash-Out', 'High-Risk Geo'],
      description: 'Remote coastal ferry terminal agent. Received BDT 280,000 split tranche from Hub W302 within 2 minutes of Agent 881 cash-out. Physical cash collected by runner.',
      timestamp: '03:42:50 AM',
      elapsedMinutes: 18,
      x: 740,
      y: 270,
      radius: 28,
    },
  ];

  // Graph Edges with flow paths (Only 2 physical cash-out exits from Hub W302)
  const edges: GraphEdge[] = [
    {
      id: 'e1',
      source: 'W101',
      target: 'W201',
      amount: transaction.amount || 80000,
      timestamp: '03:20:14 AM',
      velocityMinutes: 0,
      elapsedLabel: 'T+0m (Trigger Event)',
      channel: 'TakaSafe App',
      status: transaction.status === 'BLOCKED' ? 'BLOCKED' : transaction.status === 'HELD' ? 'HELD' : 'COMPLETED',
      notes: 'Initial fraudulent debit from victim Rafiqul Islam to Layer-1 smurf node W201.',
      curveType: 'straight',
    },
    {
      id: 'e2',
      source: 'W201',
      target: 'W302',
      amount: 155000,
      timestamp: '03:24:08 AM',
      velocityMinutes: 4,
      elapsedLabel: '+3m 54s velocity',
      channel: 'P2P Rapid Relay',
      status: 'COMPLETED',
      notes: 'Bundled funds from W101 & W102 funnelled directly to syndicate collector hub W302.',
      curveType: 'straight',
    },
    {
      id: 'e3',
      source: 'W302',
      target: 'AGT-881',
      amount: 250000,
      timestamp: '03:40:15 AM',
      velocityMinutes: 16,
      elapsedLabel: '+16m from origin',
      channel: 'OTC Agent Cash-Out',
      status: 'COMPLETED',
      notes: 'Physical cash withdrawal at Kabir Hossain’s Bismillah Telecom booth.',
      curveType: 'curveUp',
    },
    {
      id: 'e4',
      source: 'W302',
      target: 'AGT-882',
      amount: 280000,
      timestamp: '03:42:50 AM',
      velocityMinutes: 18,
      elapsedLabel: '+18m from origin',
      channel: 'OTC Split Cash-Out',
      status: 'COMPLETED',
      notes: 'Parallel split cash-out at Abul Kalam’s Galachipa coastal ghat storefront.',
      curveType: 'curveDown',
    },
  ];

  const activeFocusId = hoveredNodeId || selectedNodeId;
  const selectedNode = nodes.find((n) => n.id === activeFocusId) || nodes[2];
  const hoveredNode = hoveredNodeId ? nodes.find((n) => n.id === hoveredNodeId) : null;

  // Connected nodes & edges calculation
  const connectedEdgeIds = new Set<string>();
  const connectedNodeIds = new Set<string>([activeFocusId]);

  edges.forEach((edge) => {
    if (edge.source === activeFocusId || edge.target === activeFocusId) {
      connectedEdgeIds.add(edge.id);
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }
  });

  const getNodeColor = (role: GraphNode['role']) => {
    switch (role) {
      case 'VICTIM':
        return {
          fill: '#10B981',
          stroke: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)',
          bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
          icon: User,
        };
      case 'MULE_RELAY':
        return {
          fill: '#F59E0B',
          stroke: '#D97706',
          glow: 'rgba(245, 158, 11, 0.4)',
          bgBadge: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
          icon: Zap,
        };
      case 'AGGREGATOR':
        return {
          fill: '#EF4444',
          stroke: '#DC2626',
          glow: 'rgba(239, 68, 68, 0.5)',
          bgBadge: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
          icon: ShieldAlert,
        };
      case 'CASH_OUT_AGENT':
        return {
          fill: '#0284C7',
          stroke: '#0369A1',
          glow: 'rgba(2, 132, 199, 0.4)',
          bgBadge: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
          icon: Store,
        };
    }
  };

  const getEdgePath = (edge: GraphEdge) => {
    const src = nodes.find((n) => n.id === edge.source)!;
    const tgt = nodes.find((n) => n.id === edge.target)!;

    if (edge.curveType === 'curveUp') {
      return `M ${src.x} ${src.y} C ${src.x + 120} ${src.y}, ${tgt.x - 120} ${tgt.y}, ${tgt.x} ${tgt.y}`;
    }
    if (edge.curveType === 'curveDown') {
      return `M ${src.x} ${src.y} C ${src.x + 120} ${src.y}, ${tgt.x - 120} ${tgt.y}, ${tgt.x} ${tgt.y}`;
    }
    if (edge.curveType === 'curveMid') {
      return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    }
    return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
  };

  const getEdgeMidpoint = (edge: GraphEdge) => {
    const src = nodes.find((n) => n.id === edge.source)!;
    const tgt = nodes.find((n) => n.id === edge.target)!;
    return {
      x: (src.x + tgt.x) / 2,
      y: (src.y + tgt.y) / 2,
    };
  };

  const handleSimulatePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let stage = 0;
    setPlaybackStage(0);
    const interval = setInterval(() => {
      stage += 1;
      if (stage > 4) {
        clearInterval(interval);
        setIsPlaying(false);
        setPlaybackStage(4);
      } else {
        setPlaybackStage(stage);
      }
    }, 1200);
  };

  const handleFreeze = (nodeId: string, nodeName: string) => {
    onFreezeNode?.(nodeId, nodeName);
    setActionNotice(`Enforced AML Emergency Freeze on [${nodeId}] ${nodeName}. Routing quarantined.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Mouse drag & pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Primary mouse button only
    setIsDragging(true);
    didDragRef.current = false;
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      if (Math.hypot(newX - pan.x, newY - pan.y) > 3) {
        didDragRef.current = true;
      }
      setPan({ x: newX, y: newY });
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setHoverPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoveredNodeId(null);
    setHoverPos(null);
  };

  // Window listeners for dragging outside container
  useEffect(() => {
    if (!isDragging) return;
    const onWindowMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      if (Math.hypot(newX - pan.x, newY - pan.y) > 2) {
        didDragRef.current = true;
      }
      setPan({ x: newX, y: newY });
    };
    const onWindowUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup', onWindowUp);
    };
  }, [isDragging, pan.x, pan.y]);

  // Non-passive wheel handler on canvas for smooth mouse wheel zooming
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoomLevel((prev) => Math.min(2.4, Math.max(0.6, Number((prev * zoomFactor).toFixed(2)))));
    };
    el.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      el.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col space-y-4 p-5"
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0054A6]/10 dark:bg-[#0054A6]/20 flex items-center justify-center text-[#0054A6] dark:text-blue-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'BN' ? 'মানি পাথ্স: নোড ও ফান্ড ফ্লো গ্রাফ' : 'Money Paths: Multi-Hop Fund Flow & Agent Network'}
              </h3>
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                Interactive Graph Nodes
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hover over any graph node to inspect agent identity, transaction velocity, and connected money flows.
            </p>
          </div>
        </div>

        {/* Action Controls: Zoom, Particle Toggle, Simulation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulatePlayback}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 text-blue-950 hover:bg-amber-600'
                : 'bg-[#0054A6] hover:bg-[#004284] text-white'
            }`}
            title="Step-by-step trace of fund velocity"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Tracing Flow...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Velocity</span>
              </>
            )}
          </button>

          <button
            onClick={() => setAnimateParticles(!animateParticles)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              animateParticles
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle animated fund particles"
          >
            {animateParticles ? 'Flow: ON' : 'Flow: OFF'}
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-500 dark:text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Pipeline Stage Lane Indicators */}
      <div className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between text-[11px] font-mono font-bold shadow-2xs">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span>Stage 1: Inflow (Victim)</span>
        </div>
        <span className="text-slate-400">➔</span>
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span>Stage 2: Smurf Transit Mule</span>
        </div>
        <span className="text-slate-400">➔</span>
        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-xs" />
          <span>Stage 3: Syndicate Central Hub</span>
        </div>
        <span className="text-slate-400">➔</span>
        <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
          <span>Stage 4: OTC Cash-Out Terminus (AGT-881 &amp; AGT-882)</span>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between animate-in fade-in text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Main Network Graph Canvas Area with Precision Grid */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`relative rounded-2xl bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#0A0E1A] dark:via-[#0F1424] dark:to-[#080C16] border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[420px] flex items-center justify-center select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* On-Canvas Pan & Zoom Navigation Controls for Mouse Adjustment */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
          {/* Directional Nudge Pad */}
          <div className="grid grid-cols-3 gap-0.5 w-[58px] h-[58px] p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPan((p) => ({ ...p, y: p.y + 45 }));
              }}
              className="p-1 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Pan Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPan((p) => ({ ...p, x: p.x + 45 }));
              }}
              className="p-1 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Pan Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPan({ x: 0, y: 0 });
                setZoomLevel(1);
              }}
              className="p-0.5 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 text-[9px] font-bold cursor-pointer"
              title="Reset Position"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPan((p) => ({ ...p, x: p.x - 45 }));
              }}
              className="p-1 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Pan Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPan((p) => ({ ...p, y: p.y - 45 }));
              }}
              className="p-1 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Pan Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div />
          </div>

          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Zoom Slider & Percent */}
          <div className="flex flex-col gap-1 pr-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Zoom</span>
              <span className="font-bold text-[#0054A6] dark:text-blue-400">{Math.round(zoomLevel * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))));
                }}
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <input
                type="range"
                min="0.6"
                max="2.2"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0054A6]"
                title="Adjust Zoom by Mouse Slider"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.min(2.2, Number((z + 0.1).toFixed(2))));
                }}
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 84, 166, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 84, 166, 0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Network Graph */}
        <svg
          viewBox="0 0 880 380"
          className="w-full h-full max-h-[480px] overflow-visible select-none pointer-events-none"
        >
          <defs>
            {/* Arrow Markers */}
            <marker
              id={`arrow-cyber-${filterId}`}
              markerWidth="8"
              markerHeight="6"
              refX="28"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0.5, 7 3, 0 5.5" fill="#0284C7" />
            </marker>

            <marker
              id={`arrow-amber-${filterId}`}
              markerWidth="8"
              markerHeight="6"
              refX="28"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0.5, 7 3, 0 5.5" fill="#F59E0B" />
            </marker>

            <marker
              id={`arrow-rose-${filterId}`}
              markerWidth="8"
              markerHeight="6"
              refX="28"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0.5, 7 3, 0 5.5" fill="#EF4444" />
            </marker>

            <marker
              id={`arrow-dim-${filterId}`}
              markerWidth="6"
              markerHeight="5"
              refX="26"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0.5, 5 2.5, 0 4.5" fill="#94A3B8" opacity="0.6" />
            </marker>

            {/* Drop Shadows */}
            <filter id={`node-shadow-${filterId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.22" />
            </filter>
            <filter id={`badge-shadow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Movable & Scalable Canvas Group */}
          <g
            className="pointer-events-auto"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transformOrigin: '440px 190px',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* 1. EDGES LAYER */}
            <g className="edges-layer">
            {edges.map((edge) => {
              const isConnected = connectedEdgeIds.has(edge.id);
              const isEdgeHovered = hoveredEdgeId === edge.id;
              const pathD = getEdgePath(edge);
              const mid = getEdgeMidpoint(edge);

              const strokeColor = isConnected || isEdgeHovered
                ? edge.source === 'W101'
                  ? '#10B981'
                  : edge.source === 'W201'
                  ? '#F59E0B'
                  : '#EF4444'
                : '#94A3B8';

              const strokeWidth = isConnected || isEdgeHovered ? 3.5 : 1.8;
              const opacity = isConnected || isEdgeHovered ? 1 : 0.45;

              return (
                <g
                  key={edge.id}
                  className="transition-opacity duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                >
                  {/* Glowing background stroke for connected edges */}
                  {(isConnected || isEdgeHovered) && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth + 4}
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Main Edge Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={opacity}
                    strokeDasharray={isConnected ? undefined : '5 3'}
                    markerEnd={`url(#arrow-rose-${filterId})`}
                    className="transition-all duration-200"
                  />

                  {/* Animated Flow Particles */}
                  {animateParticles && isConnected && (
                    <circle
                      r="4"
                      fill={strokeColor}
                      className="filter drop-shadow pointer-events-none"
                    >
                      <animateMotion
                        path={pathD}
                        dur={edge.source === 'W101' ? '1.8s' : '2.2s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Transfer Amount & Velocity Label Badge */}
                  <g
                    transform={`translate(${mid.x}, ${mid.y})`}
                    filter={`url(#badge-shadow-${filterId})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="-38"
                      y="-10"
                      width="76"
                      height="20"
                      rx="10"
                      fill="#FFFFFF"
                      className="dark:fill-slate-900"
                      stroke={strokeColor}
                      strokeWidth={isConnected ? '1.8' : '1'}
                      opacity="0.95"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fill={strokeColor}
                      fontSize="9.5"
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
          </g>

          {/* 2. NODES LAYER */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const colorConfig = getNodeColor(node.role);
              const Icon = colorConfig.icon;

              const opacity = isConnected || isHovered || isSelected ? 1 : 0.55;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    if (!didDragRef.current) {
                      setSelectedNodeId(node.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    setHoveredNodeId(node.id);
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoverPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoverPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredNodeId(null);
                    setHoverPos(null);
                  }}
                >
                  {/* Base Drop Shadow Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={colorConfig.fill}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected || isHovered ? '3.5' : '2'}
                    filter={`url(#node-shadow-${filterId})`}
                    opacity={opacity}
                    className="transition-transform duration-200"
                    style={{
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      transformOrigin: `${node.x}px ${node.y}px`,
                    }}
                  />

                  {/* Node ID Badge in Center */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#FFFFFF"
                    fontSize={node.radius > 28 ? '11' : '10'}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="900"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {node.id}
                  </text>

                  {/* Node Label (Above or Below) */}
                  <g transform={`translate(${node.x}, ${node.y + node.radius + 15})`} className="pointer-events-none select-none">
                    <text
                      x="0"
                      y="0"
                      fill="#0F172A"
                      className="dark:fill-white"
                      fontSize="10.5"
                      fontFamily="sans-serif"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name}
                    </text>
                    <text
                      x="0"
                      y="12"
                      fill={colorConfig.stroke}
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {node.agentName ? (node.agentName.length > 22 ? `${node.agentName.slice(0, 20)}...` : node.agentName) : node.roleLabel}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
          </g>
        </svg>

        {/* Moveable Map Navigation Badge */}
        <div className="absolute bottom-3 left-3 pointer-events-none bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 shadow-2xs">
          <Move className="w-3.5 h-3.5 text-[#0054A6] dark:text-blue-400" />
          <span>Adjustable Map • Drag mouse to pan • Wheel to zoom ({Math.round(zoomLevel * 100)}%)</span>
        </div>

        {/* Dynamic Floating Tooltip on Hover (Moving cursor over node shows details and flow) */}
        {hoveredNode && hoverPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 max-w-xs animate-in fade-in zoom-in-95 text-xs backdrop-blur-md"
            style={{
              left: Math.min(hoverPos.x + 15, (containerRef.current?.clientWidth || 700) - 280),
              top: Math.max(10, hoverPos.y - 120),
            }}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getNodeColor(hoveredNode.role).fill }}
                />
                <span className="font-mono font-bold text-[#FAB915]">
                  {hoveredNode.id}
                </span>
                <span className="text-[10px] text-slate-300 font-semibold truncate max-w-[130px]">
                  {hoveredNode.roleLabel}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 font-bold border border-rose-400/40">
                Risk: {hoveredNode.riskScore}/100
              </span>
            </div>

            <div className="mt-2 space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entity / Agent Name:</span>
                <span className="font-bold text-white text-xs">{hoveredNode.name}</span>
                {hoveredNode.agentName && (
                  <span className="text-blue-300 block text-[10px]">{hoveredNode.agentName}</span>
                )}
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Wallet / ID:</span>
                <span className="font-mono font-semibold text-white">{hoveredNode.walletOrId}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-200 truncate max-w-[150px]">{hoveredNode.location}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Channel / POS:</span>
                <span className="font-medium text-slate-200 truncate max-w-[150px]">{hoveredNode.deviceOrChannel}</span>
              </div>

              <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[10px]">Flow Volume:</span>
                <span className="font-mono font-black text-rose-400">
                  {hoveredNode.amountOut > 0 ? `৳${hoveredNode.amountOut.toLocaleString()}` : `৳${hoveredNode.amountIn.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-amber-300">
                <span>Timestamp:</span>
                <span className="font-mono">{hoveredNode.timestamp} (+{hoveredNode.elapsedMinutes}m)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Node Forensic Details & Action Drawer (Selected / Active Node) */}
      <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
              style={{ backgroundColor: getNodeColor(selectedNode.role).fill }}
            >
              {React.createElement(getNodeColor(selectedNode.role).icon, {
                className: 'w-5 h-5',
              })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedNode.name}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    getNodeColor(selectedNode.role).bgBadge
                  }`}
                >
                  {selectedNode.roleLabel}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedNode.status === 'FROZEN'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : selectedNode.status === 'FLAGGED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedNode.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedNode.agentName || selectedNode.entityType} • {selectedNode.walletOrId}
              </p>
            </div>
          </div>

          {/* Action Buttons for Selected Node */}
          <div className="flex items-center gap-2">
            {selectedNode.role !== 'VICTIM' && (
              <button
                onClick={() => handleFreeze(selectedNode.id, selectedNode.name)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Freeze Node [{selectedNode.id}]</span>
              </button>
            )}
            {selectedNode.role === 'CASH_OUT_AGENT' && (
              <button
                onClick={() => {
                  setActionNotice(`Physical AML audit alert dispatched to MFS Area Manager for Agent ${selectedNode.walletOrId}`);
                  setTimeout(() => setActionNotice(null), 4000);
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Audit Agent Float</span>
              </button>
            )}
          </div>
        </div>

        {/* Node Deep Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
          <div className="space-y-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Identity & Credentials
            </span>
            {selectedNode.agentName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Agent / Proprietor:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {selectedNode.agentName}
                </span>
              </div>
            )}
            {selectedNode.agentLicense && (
              <div className="flex justify-between">
                <span className="text-slate-500">License ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedNode.agentLicense}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-medium text-slate-800 dark:text-white text-right">
                {selectedNode.location}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Channel / Device:</span>
              <span className="font-medium text-slate-800 dark:text-white text-right">
                {selectedNode.deviceOrChannel}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Fund Movement & Velocity
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Received (In):</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ৳{selectedNode.amountIn.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Dispersed (Out):</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                ৳{selectedNode.amountOut.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Balance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ৳{selectedNode.currentBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Velocity Elapsed:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {selectedNode.timestamp} (+{selectedNode.elapsedMinutes}m)
              </span>
            </div>
          </div>

          <div className="space-y-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Forensic Intelligence
            </span>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedNode.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
