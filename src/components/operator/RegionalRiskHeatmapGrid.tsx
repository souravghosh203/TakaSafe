import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  RegionalRiskMetric,
  Transaction,
  AgentLiquidityNode,
} from '../../types';
import {
  MapPin,
  Flame,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  BarChart3,
  Globe2,
  SlidersHorizontal,
  CloudRain,
  ExternalLink,
  Users,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  Radio,
} from 'lucide-react';

export type HeatmapMetricKey =
  | 'riskScore'
  | 'fraudSignalDelta'
  | 'cashOutSurgeDelta'
  | 'scamSignalDelta'
  | 'vulnerableAgentsCount';

interface RegionalRiskHeatmapGridProps {
  regionalMetrics: RegionalRiskMetric[];
  transactions: Transaction[];
  agents?: AgentLiquidityNode[];
  onSelectRegion?: (division: string) => void;
  onActivateMonitoring?: (division: string) => void;
  onDispatchLiquidity?: (agentId: string, agentName: string, amount: number) => void;
  onOpenInvestigation?: (transaction: Transaction) => void;
  onFilterTableToRegion?: (regionName: string) => void;
  onNavigateTab?: (tabId: string) => void;
  lang?: 'EN' | 'BN';
}

interface TileLocation {
  id: string;
  divisionName: string;
  nameBn: string;
  gridRow: number;
  gridCol: number;
  isSpecialSubCluster?: boolean;
  subClusterTag?: string;
  hotspotNoteEn: string;
  hotspotNoteBn: string;
}

const BANGLADESH_GRID_TILES: TileLocation[] = [
  {
    id: 'Rangpur',
    divisionName: 'Rangpur',
    nameBn: 'রংপুর',
    gridRow: 1,
    gridCol: 2,
    hotspotNoteEn: 'Rural agricultural relay, low scam density',
    hotspotNoteBn: 'কৃষিভিত্তিক অঞ্চল, কম প্রতারণা ঝুঁকি',
  },
  {
    id: 'Rajshahi',
    divisionName: 'Rajshahi',
    nameBn: 'রাজশাহী',
    gridRow: 2,
    gridCol: 1,
    hotspotNoteEn: 'Western border corridor, stable float buffer',
    hotspotNoteBn: 'পশ্চিম সীমান্ত করিডোর, স্থিতিশীল তারল্য',
  },
  {
    id: 'Mymensingh',
    divisionName: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    gridRow: 2,
    gridCol: 3,
    hotspotNoteEn: 'Emerging fake OTP phishing reports',
    hotspotNoteBn: 'নকল ওটিপি ফিশিং রিপোর্ট বাড়ছে',
  },
  {
    id: 'Sylhet',
    divisionName: 'Sylhet',
    nameBn: 'সিলেট',
    gridRow: 2,
    gridCol: 5,
    hotspotNoteEn: 'Surma basin remittance corridor, flash flood warning',
    hotspotNoteBn: 'প্রবাসী রেমিট্যান্স এলাকা, আকস্মিক বন্যার সতর্কতা',
  },
  {
    id: 'Dhaka',
    divisionName: 'Dhaka',
    nameBn: 'ঢাকা',
    gridRow: 3,
    gridCol: 3,
    hotspotNoteEn: 'National capital, dense P2P volume & clearing',
    hotspotNoteBn: 'রাজধানী, সর্বোচ্চ পিটুপি লেনদেন ও কেন্দ্রীয় সেটেলমেন্ট',
  },
  {
    id: 'Khulna',
    divisionName: 'Khulna',
    nameBn: 'খুলনা',
    gridRow: 4,
    gridCol: 2,
    hotspotNoteEn: 'Sundarbans border delta, active merchant liquidity',
    hotspotNoteBn: 'সুন্দরবন সীমান্ত বদ্বীপ, সচল এজেন্ট তারল্য',
  },
  {
    id: 'Barishal',
    divisionName: 'Barishal',
    nameBn: 'বরিশাল',
    gridRow: 4,
    gridCol: 3,
    hotspotNoteEn: 'EPICENTER: Suspicious Network #17 Terminus (Cyclone alert)',
    hotspotNoteBn: 'মূল কেন্দ্র: সন্দেহজনক নেটওয়ার্ক #১৭ ক্যাশ-আউট টার্মিনাস',
  },
  {
    id: 'Chittagong',
    divisionName: 'Chittagong',
    nameBn: 'চট্টগ্রাম',
    gridRow: 4,
    gridCol: 5,
    hotspotNoteEn: 'Port transit corridor, account hijacking origin (TXN-90824)',
    hotspotNoteBn: 'বন্দর ট্রানজিট জোন, একাউন্ট হাইজ্যাক উৎস (TXN-90824)',
  },
  {
    id: 'Patuakhali_Cluster',
    divisionName: 'Barishal',
    nameBn: 'পটুয়াখালী ও গলাচিপা',
    gridRow: 5,
    gridCol: 3,
    isSpecialSubCluster: true,
    subClusterTag: 'Terminus Cluster: AGT-881 / AGT-882',
    hotspotNoteEn: 'OTC Cash-Out Terminus: Bismillah Telecom & Coastal Ghat Booths',
    hotspotNoteBn: 'শারীরিক ক্যাশ-আউট টার্মিনাস: বিসমিল্লাহ টেলিকম ও কোস্টাল ঘাট',
  },
];

export const RegionalRiskHeatmapGrid: React.FC<RegionalRiskHeatmapGridProps> = ({
  regionalMetrics,
  transactions,
  agents = [],
  onSelectRegion,
  onActivateMonitoring,
  onDispatchLiquidity,
  onOpenInvestigation,
  onFilterTableToRegion,
  onNavigateTab,
  lang = 'EN',
}) => {
  const [selectedTileId, setSelectedTileId] = useState<string>('Barishal');
  const [activeMetric, setActiveMetric] = useState<HeatmapMetricKey>('riskScore');
  const [viewMode, setViewMode] = useState<'GRID' | 'MATRIX' | 'SPLIT'>('SPLIT');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'ELEVATED' | 'STABLE'>('ALL');
  const [monitoringFeedback, setMonitoringFeedback] = useState<Record<string, boolean>>({});

  // D3 Color Scales for various metrics
  const colorInterpolators = useMemo(() => {
    // Risk score 0 to 100: Emerald -> Sky -> Amber -> Rose -> Deep Crimson
    const riskScale = d3
      .scaleLinear<string>()
      .domain([0, 30, 50, 75, 100])
      .range(['#10B981', '#0EA5E9', '#F59E0B', '#E11D48', '#881337']);

    // Fraud surge delta 0% to 50%
    const fraudScale = d3
      .scaleLinear<string>()
      .domain([0, 10, 25, 45])
      .range(['#059669', '#38BDF8', '#F59E0B', '#E11D48']);

    // Cash-out surge delta 0% to 50%
    const cashOutScale = d3
      .scaleLinear<string>()
      .domain([0, 10, 25, 50])
      .range(['#10B981', '#60A5FA', '#FB923C', '#DC2626']);

    // Scam delta 0% to 35%
    const scamScale = d3
      .scaleLinear<string>()
      .domain([0, 5, 15, 30])
      .range(['#10B981', '#38BDF8', '#F59E0B', '#BE123C']);

    // Depleted agents count 0 to 6
    const agentScale = d3
      .scaleLinear<string>()
      .domain([0, 1, 3, 6])
      .range(['#10B981', '#38BDF8', '#F59E0B', '#E11D48']);

    return { riskScale, fraudScale, cashOutScale, scamScale, agentScale };
  }, []);

  const getMetricValue = (metric: RegionalRiskMetric, key: HeatmapMetricKey): number => {
    switch (key) {
      case 'riskScore':
        return metric.riskScore;
      case 'fraudSignalDelta':
        return metric.fraudSignalDelta;
      case 'cashOutSurgeDelta':
        return metric.cashOutSurgeDelta;
      case 'scamSignalDelta':
        return metric.scamSignalDelta;
      case 'vulnerableAgentsCount':
        return metric.vulnerableAgentsCount;
      default:
        return metric.riskScore;
    }
  };

  const getCellColor = (val: number, key: HeatmapMetricKey): string => {
    switch (key) {
      case 'riskScore':
        return colorInterpolators.riskScale(val);
      case 'fraudSignalDelta':
        return colorInterpolators.fraudScale(val);
      case 'cashOutSurgeDelta':
        return colorInterpolators.cashOutScale(val);
      case 'scamSignalDelta':
        return colorInterpolators.scamScale(val);
      case 'vulnerableAgentsCount':
        return colorInterpolators.agentScale(val);
      default:
        return colorInterpolators.riskScale(val);
    }
  };

  // Associate metrics with tiles
  const tileData = useMemo(() => {
    return BANGLADESH_GRID_TILES.map((tile) => {
      const metric =
        regionalMetrics.find((m) => m.division.toLowerCase() === tile.divisionName.toLowerCase()) || {
          division: tile.divisionName,
          riskScore: 25,
          fraudSignalDelta: 3,
          scamSignalDelta: 2,
          liquidityDrainDelta: -2,
          networkAnomalyDelta: 2,
          cashOutSurgeDelta: 4,
          activeDisruption: 'NONE' as const,
          vulnerableAgentsCount: 0,
          status: 'STABLE' as const,
        };

      // If it's the Patuakhali special cash-out cluster, emphasize higher cash-out velocity
      const adjustedRisk = tile.isSpecialSubCluster
        ? Math.min(100, metric.riskScore + 6)
        : metric.riskScore;
      const adjustedCashOut = tile.isSpecialSubCluster
        ? metric.cashOutSurgeDelta + 15
        : metric.cashOutSurgeDelta;

      // Filter transactions matching this division or sub-cluster
      const matchedTxns = transactions.filter((t) => {
        const text = `${t.senderLocation} ${t.receiverLocation}`.toLowerCase();
        if (tile.isSpecialSubCluster) {
          return text.includes('patuakhali') || text.includes('galachipa');
        }
        return (
          text.includes(tile.divisionName.toLowerCase()) ||
          (tile.divisionName === 'Chittagong' && (text.includes('chittagong') || text.includes('chattogram')))
        );
      });

      const flaggedTxnsCount = matchedTxns.filter((t) => t.fusedRiskScore >= 70).length;

      return {
        ...tile,
        metric,
        effectiveScore: adjustedRisk,
        effectiveCashOut: adjustedCashOut,
        matchedTxns,
        flaggedTxnsCount,
      };
    });
  }, [regionalMetrics, transactions]);

  // Selected tile details
  const selectedTile = useMemo(() => {
    return tileData.find((t) => t.id === selectedTileId) || tileData[0];
  }, [tileData, selectedTileId]);

  // Filtered tiles based on risk filter
  const displayedTiles = useMemo(() => {
    if (riskFilter === 'ALL') return tileData;
    if (riskFilter === 'CRITICAL') return tileData.filter((t) => t.effectiveScore >= 75);
    if (riskFilter === 'ELEVATED')
      return tileData.filter((t) => t.effectiveScore >= 40 && t.effectiveScore < 75);
    return tileData.filter((t) => t.effectiveScore < 40);
  }, [tileData, riskFilter]);

  // Data for Recharts comparison matrix
  const rechartsData = useMemo(() => {
    return regionalMetrics.map((rm) => {
      const isEpicenter = rm.division === 'Barishal';
      return {
        name: rm.division,
        riskScore: rm.riskScore,
        fraudSurge: rm.fraudSignalDelta,
        cashOutSurge: rm.cashOutSurgeDelta,
        scamSignal: rm.scamSignalDelta,
        liquidityStress: Math.abs(rm.liquidityDrainDelta),
        isEpicenter,
        color: colorInterpolators.riskScale(rm.riskScore),
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [regionalMetrics, colorInterpolators]);

  const handleTileClick = (tileId: string, divisionName: string) => {
    setSelectedTileId(tileId);
    onSelectRegion?.(divisionName);
  };

  const handleTriggerMonitoring = (division: string) => {
    onActivateMonitoring?.(division);
    setMonitoringFeedback((prev) => ({ ...prev, [division]: true }));
    setTimeout(() => {
      setMonitoringFeedback((prev) => ({ ...prev, [division]: false }));
    }, 4000);
  };

  return (
    <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-all duration-200">
      {/* 1. Header Toolbar with Title, View Toggles & Metric Switcher */}
      <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070D1F] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {lang === 'BN'
                    ? 'আঞ্চলিক ঝুঁকি হিটম্যাপ ও জালিয়াতি ক্লাস্টার গ্রিড'
                    : 'Regional Risk Heatmap & Fraud Cluster Grid'}
                </h3>
                <span className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" />
                  {lang === 'BN' ? 'সরাসরি জিও-ক্লাস্টার' : 'Live Geo-Clusters'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'BN'
                  ? 'মানচিত্রের মতো স্পেশাল গ্রিড এবং রিকার্টস কম্পোজিট ম্যাট্রিক্সের সাহায্যে বাংলাদেশজুড়ে প্রতারণা ও অর্থ পাচার ক্লাস্টার শনাক্তকরণ'
                  : 'Map-like cartographic spatial grid & Recharts multi-metric heat matrix visualizing fraud syndicate concentrations across Bangladesh.'}
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Heat Metric Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={activeMetric}
              onChange={(e) => setActiveMetric(e.target.value as HeatmapMetricKey)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="riskScore" className="dark:bg-slate-900">
                {lang === 'BN' ? 'সামগ্রিক ঝুঁকি সূচক (০-১০০)' : 'Overall Risk Score (0-100)'}
              </option>
              <option value="cashOutSurgeDelta" className="dark:bg-slate-900">
                {lang === 'BN' ? 'ক্যাশ-আউট বৃদ্ধির বেগ (% বৃদ্ধি)' : 'Cash-Out Surge Velocity (%)'}
              </option>
              <option value="fraudSignalDelta" className="dark:bg-slate-900">
                {lang === 'BN' ? 'জালিয়াতি সিগন্যাল ঢেউ (%)' : 'Fraud Signal Surge (%)'}
              </option>
              <option value="scamSignalDelta" className="dark:bg-slate-900">
                {lang === 'BN' ? 'প্রতারণা ও সোশ্যাল ইঞ্জিনিয়ারিং (%)' : 'Scam Attack Delta (%)'}
              </option>
              <option value="vulnerableAgentsCount" className="dark:bg-slate-900">
                {lang === 'BN' ? 'সংকটগ্রস্ত এজেন্ট সংখ্যা' : 'Depleted Agents Count'}
              </option>
            </select>
          </div>

          {/* View Mode Toggle: Grid Map, Recharts Matrix, Split View */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs shadow-xs">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-[#0054A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View as Bangladesh Spatial Grid Map"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{lang === 'BN' ? 'মানচিত্র গ্রিড' : 'Map Grid'}</span>
            </button>
            <button
              onClick={() => setViewMode('MATRIX')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'MATRIX'
                  ? 'bg-[#0054A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View as Analytical Recharts Heat Matrix"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{lang === 'BN' ? 'রিকার্টস ম্যাট্রিক্স' : 'Recharts Matrix'}</span>
            </button>
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'SPLIT'
                  ? 'bg-[#0054A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Side-by-side Dual View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'BN' ? 'যৌথ ভিউ' : 'Split View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Heat Color Legend & Quick Filter Bar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Heat Intensity Color Bar */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
            {lang === 'BN' ? 'তাপমাত্রা স্কেল:' : 'Heat Intensity:'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Low (0)</span>
            <div className="w-28 sm:w-36 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 shadow-inner" />
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">Critical (100)</span>
          </div>
        </div>

        {/* Risk Threshold Filter Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">{lang === 'BN' ? 'ফিল্টার:' : 'Filter:'}</span>
          {(['ALL', 'CRITICAL', 'ELEVATED', 'STABLE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setRiskFilter(filter)}
              className={`px-2 py-0.5 text-[11px] rounded-md font-semibold transition-colors cursor-pointer ${
                riskFilter === filter
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {filter === 'ALL'
                ? lang === 'BN'
                  ? 'সকল অঞ্চল'
                  : 'All Regions'
                : filter === 'CRITICAL'
                ? lang === 'BN'
                  ? 'সংকটপূর্ণ (>৭৫)'
                  : 'Critical (>75)'
                : filter === 'ELEVATED'
                ? lang === 'BN'
                  ? 'উদ্বেগজনক (৪০-৭৫)'
                  : 'Elevated (40-75)'
                : lang === 'BN'
                ? 'স্থিতিশীল (<৪০)'
                : 'Stable (<40)'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Workspace: Map-like Grid + Recharts Matrix + Inspector Panel */}
      <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Spatial Grid Map and/or Recharts Matrix */}
        <div
          className={`${
            viewMode === 'SPLIT'
              ? 'lg:col-span-8 space-y-6'
              : viewMode === 'GRID'
              ? 'lg:col-span-7 xl:col-span-8'
              : 'lg:col-span-7 xl:col-span-8'
          }`}
        >
          {/* A. MAP-LIKE CARTOGRAPHIC GRID VIEW */}
          {(viewMode === 'GRID' || viewMode === 'SPLIT') && (
            <div className="bg-slate-50/70 dark:bg-[#070D1F] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0054A6] dark:text-sky-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {lang === 'BN'
                      ? 'বাংলাদেশ ভৌগোলিক টাইল গ্রিড (স্পেশাল ম্যাপ)'
                      : 'Bangladesh Spatial Cartogram Grid (Map-Oriented)'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'BN' ? 'যেকোনো টাইলে ক্লিক করে বিস্তারিত ক্লাস্টার তথ্য দেখুন' : 'Click any cell to inspect regional telemetry'}
                </span>
              </div>

              {/* 5x5 Map-Oriented Grid Container */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl mx-auto py-2">
                {/* Row 1: Northern region (Rangpur col 2) */}
                <div className="col-start-2 col-span-1">
                  {renderTile('Rangpur')}
                </div>

                {/* Row 2: Rajshahi (col 1), Mymensingh (col 3), Sylhet (col 5) */}
                <div className="col-start-1 col-span-1 row-start-2">
                  {renderTile('Rajshahi')}
                </div>
                <div className="col-start-3 col-span-1 row-start-2">
                  {renderTile('Mymensingh')}
                </div>
                <div className="col-start-5 col-span-1 row-start-2">
                  {renderTile('Sylhet')}
                </div>

                {/* Row 3: Central Dhaka (col 3) */}
                <div className="col-start-3 col-span-1 row-start-3">
                  {renderTile('Dhaka')}
                </div>

                {/* Row 4: Khulna (col 2), Barishal (col 3), Chittagong (col 5) */}
                <div className="col-start-2 col-span-1 row-start-4">
                  {renderTile('Khulna')}
                </div>
                <div className="col-start-3 col-span-1 row-start-4">
                  {renderTile('Barishal')}
                </div>
                <div className="col-start-5 col-span-1 row-start-4">
                  {renderTile('Chittagong')}
                </div>

                {/* Row 5: Patuakhali Coastal Terminus Sub-Cluster (col 3) */}
                <div className="col-start-3 col-span-1 row-start-5">
                  {renderTile('Patuakhali_Cluster')}
                </div>
              </div>

              {/* Map Footer Helper */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>
                    {lang === 'BN'
                      ? 'লাল রিং: সক্রিয় জালিয়াতি সিন্ডিকেট টার্মিনাস (নেটওয়ার্ক #১৭)'
                      : 'Pulsing Halo: Active Syndicate Terminus (Network #17 in Barishal / Patuakhali)'}
                  </span>
                </div>
                <span className="font-mono">8 Divisions · 1 Sub-Cluster Hotspot</span>
              </div>
            </div>
          )}

          {/* B. RECHARTS COMPARATIVE HEAT MATRIX VIEW */}
          {(viewMode === 'MATRIX' || viewMode === 'SPLIT') && (
            <div className="bg-slate-50/70 dark:bg-[#070D1F] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {lang === 'BN'
                      ? 'রিকার্টস আঞ্চলিক জালিয়াতি ক্লাস্টার তুলনা ও তীব্রতা বিশ্লেষণ'
                      : 'Recharts Regional Risk & Fraud Velocity Heat Matrix'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold font-mono">
                    --- Critical Threshold (70)
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-mono">
                    --- Elevated (40)
                  </span>
                </div>
              </div>

              {/* Responsive Recharts Composed Bar Chart */}
              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rechartsData}
                    margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs max-w-xs font-sans">
                            <div className="flex items-center justify-between gap-2 mb-2 border-b border-slate-800 pb-1.5">
                              <span className="font-bold text-sm text-sky-300">{data.name} Division</span>
                              {data.isEpicenter && (
                                <span className="bg-rose-900/80 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-700">
                                  EPICENTER
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 font-mono text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Composite Risk Score:</span>
                                <span className="font-bold text-rose-400">{data.riskScore}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Cash-Out Surge:</span>
                                <span className="font-bold text-amber-400">+{data.cashOutSurge}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Fraud Signal Surge:</span>
                                <span className="font-bold text-sky-400">+{data.fraudSurge}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Scam Social Attack:</span>
                                <span className="font-bold text-purple-400">+{data.scamSignal}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine
                      y={70}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Critical 70', fill: '#EF4444', fontSize: 10, position: 'right' }}
                    />
                    <ReferenceLine
                      y={40}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      strokeWidth={1.2}
                      label={{ value: 'Elevated 40', fill: '#F59E0B', fontSize: 10, position: 'right' }}
                    />
                    <Bar
                      dataKey="riskScore"
                      radius={[6, 6, 0, 0]}
                      onClick={(entry: any) => {
                        if (entry?.name) {
                          handleTileClick(entry.name, entry.name);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {rechartsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={selectedTile.divisionName === entry.name ? 1 : 0.75}
                          stroke={selectedTile.divisionName === entry.name ? '#FFFFFF' : 'none'}
                          strokeWidth={2}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Regional Threat & Cluster Inspector */}
        <div className={`${viewMode === 'SPLIT' ? 'lg:col-span-4' : 'lg:col-span-5 xl:col-span-4'}`}>
          <div className="bg-slate-50/70 dark:bg-[#070D1F] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            {/* Inspector Top Bar */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0054A6] dark:text-sky-400 font-bold block">
                  {lang === 'BN' ? 'নির্বাচিত অঞ্চল পরিদর্শন' : 'REGIONAL CLUSTER INSPECTOR'}
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                  <span>{selectedTile.divisionName}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-serif">
                    ({selectedTile.nameBn})
                  </span>
                </h4>
                {selectedTile.isSpecialSubCluster && (
                  <span className="inline-block mt-1 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-rose-300 dark:border-rose-800">
                    {selectedTile.subClusterTag}
                  </span>
                )}
              </div>

              {/* Dynamic Score Stamp */}
              <div
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black border shadow-md shrink-0"
                style={{
                  backgroundColor: `${getCellColor(selectedTile.effectiveScore, 'riskScore')}1A`,
                  borderColor: getCellColor(selectedTile.effectiveScore, 'riskScore'),
                  color: getCellColor(selectedTile.effectiveScore, 'riskScore'),
                }}
              >
                <span className="text-xl leading-none">{selectedTile.effectiveScore}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">/100</span>
              </div>
            </div>

            {/* Hotspot Synopsis Card */}
            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {lang === 'BN' ? 'সিন্ডিকেট ক্লাস্টার সারসংক্ষেপ' : 'Cluster Intelligence Synopsis'}
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {lang === 'BN' ? selectedTile.hotspotNoteBn : selectedTile.hotspotNoteEn}
              </p>
            </div>

            {/* Key Risk Telemetry Gauges */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {lang === 'BN' ? 'ক্যাশ-আউট বৃদ্ধি' : 'Cash-Out Surge'}
                </span>
                <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
                  +{selectedTile.effectiveCashOut}%
                </span>
                <span className="text-[10px] text-slate-400">Velocity vs. baseline</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {lang === 'BN' ? 'জালিয়াতি সিগন্যাল' : 'Fraud Signal Surge'}
                </span>
                <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
                  +{selectedTile.metric.fraudSignalDelta}%
                </span>
                <span className="text-[10px] text-slate-400">GNN anomaly rate</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {lang === 'BN' ? 'সংকটগ্রস্ত এজেন্ট' : 'Depleted Agents'}
                </span>
                <span className="text-base font-black font-mono text-sky-600 dark:text-sky-400 block mt-0.5">
                  {selectedTile.metric.vulnerableAgentsCount} Agents
                </span>
                <span className="text-[10px] text-slate-400">Cash float &lt; 4h</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {lang === 'BN' ? 'আবহাওয়া ব্যাঘাত' : 'Active Disruption'}
                </span>
                <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 block mt-1 truncate">
                  {selectedTile.metric.activeDisruption === 'CYCLONE' ? (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <CloudRain className="w-3.5 h-3.5" /> Cyclone Remal
                    </span>
                  ) : selectedTile.metric.activeDisruption === 'FLASH_FLOOD' ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <CloudRain className="w-3.5 h-3.5" /> Flash Flood
                    </span>
                  ) : (
                    'Normal Operation'
                  )}
                </span>
              </div>
            </div>

            {/* Matched High-Risk Transactions from live feed in this region */}
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'BN' ? 'অঞ্চলে সক্রিয় লেনদেন' : 'Regional Active Transactions'}
                </span>
                <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300 font-bold">
                  {selectedTile.matchedTxns.length} Found
                </span>
              </div>

              {selectedTile.matchedTxns.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800">
                  {lang === 'BN' ? 'কোনো উচ্চ-ঝুঁকিপূর্ণ লেনদেন নেই' : 'No flagged transactions detected in this specific sector.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTile.matchedTxns.slice(0, 3).map((txn) => (
                    <div
                      key={txn.id}
                      className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0054A6] dark:hover:border-sky-500 transition-colors text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{txn.id}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                              txn.fusedRiskScore >= 80
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            Score {txn.fusedRiskScore}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[170px]">
                          ৳{txn.amount.toLocaleString()} · {txn.receiverLocation}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenInvestigation?.(txn)}
                        className="px-2.5 py-1 bg-[#0054A6] hover:bg-[#004284] text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3 h-3 text-amber-300" />
                        <span>{lang === 'BN' ? 'তদন্ত' : 'Investigate'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operator Direct Action Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {/* Filter Table Below */}
              <button
                onClick={() => onFilterTableToRegion?.(selectedTile.divisionName)}
                className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#0054A6] dark:text-sky-400" />
                <span>
                  {lang === 'BN'
                    ? `${selectedTile.divisionName} অনুযায়ী নিচের টেবিল ফিল্টার করুন`
                    : `Filter Guardian Table to ${selectedTile.divisionName}`}
                </span>
              </button>

              {/* Activate Enhanced Monitoring */}
              <button
                onClick={() => handleTriggerMonitoring(selectedTile.divisionName)}
                className="w-full py-2.5 px-3 bg-[#0054A6] hover:bg-[#004080] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-[#003875]"
              >
                {monitoringFeedback[selectedTile.divisionName] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'BN' ? 'মনিটরিং সক্রিয় করা হয়েছে!' : 'Enhanced Monitoring Activated!'}</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-amber-300" />
                    <span>
                      {lang === 'BN'
                        ? `${selectedTile.divisionName}-এ বিশেষ নজরদারি চালু করুন`
                        : `Deploy High-Alert Protocol for ${selectedTile.divisionName}`}
                    </span>
                  </>
                )}
              </button>

              {/* Fast Jump Link to MuleVision or Geospatial Map */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab?.('MULEVISION')}
                  className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>MuleVision</span>
                </button>
                <button
                  onClick={() => onNavigateTab?.('GEOSPATIAL')}
                  className="py-1.5 px-2 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <Globe2 className="w-3 h-3" />
                  <span>Geospatial GIS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render an individual interactive tile cell on the map
  function renderTile(tileId: string) {
    const tile = tileData.find((t) => t.id === tileId);
    if (!tile) return null;

    const isSelected = selectedTileId === tile.id;
    const isEpicenter = tile.divisionName === 'Barishal';
    const isCritical = tile.effectiveScore >= 75;
    const value = getMetricValue(tile.metric, activeMetric);
    const cellColor = getCellColor(
      activeMetric === 'riskScore' ? tile.effectiveScore : value,
      activeMetric
    );

    return (
      <div
        key={tile.id}
        onClick={() => handleTileClick(tile.id, tile.divisionName)}
        className={`group relative rounded-2xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer text-left select-none overflow-hidden ${
          isSelected
            ? 'ring-2 ring-[#0054A6] dark:ring-sky-400 shadow-lg scale-102 bg-white dark:bg-slate-900'
            : 'bg-white/90 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800/90 hover:scale-101 shadow-xs'
        }`}
        style={{
          borderColor: isSelected ? '#0054A6' : `${cellColor}60`,
        }}
      >
        {/* Heat Glow Top Accent Strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 transition-all"
          style={{ backgroundColor: cellColor }}
        />

        {/* Pulsing Halo for Epicenter / High Threat Clusters */}
        {isCritical && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: cellColor }}
            />
          </div>
        )}

        {/* Tile Content */}
        <div className="mt-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
              {tile.divisionName}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-serif block -mt-0.5">
            {tile.nameBn}
          </span>
        </div>

        {/* Dynamic Metric Value Pill */}
        <div className="mt-2 flex items-baseline justify-between">
          <div
            className="font-mono font-black text-sm px-1.5 py-0.5 rounded-md inline-block"
            style={{
              backgroundColor: `${cellColor}22`,
              color: cellColor,
            }}
          >
            {activeMetric === 'riskScore'
              ? `${tile.effectiveScore}`
              : activeMetric === 'vulnerableAgentsCount'
              ? `${tile.metric.vulnerableAgentsCount} agt`
              : `+${value}%`}
          </div>

          {/* Micro Tag for Sub-cluster or Epicenter */}
          {tile.isSpecialSubCluster ? (
            <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 font-bold">
              OTC Exit
            </span>
          ) : isEpicenter ? (
            <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 font-bold">
              Net #17
            </span>
          ) : (
            <span className="text-[9px] text-slate-400 font-mono">
              {tile.metric.status === 'CRITICAL_EMERGENCY'
                ? 'CRIT'
                : tile.metric.status === 'EMERGING_RISK'
                ? 'RISK'
                : tile.metric.status === 'ELEVATED'
                ? 'ELEV'
                : 'STBL'}
            </span>
          )}
        </div>

        {/* Mini Disruption Icon Indicator */}
        {tile.metric.activeDisruption !== 'NONE' && (
          <div className="mt-1 flex items-center gap-1 text-[9px] text-purple-600 dark:text-purple-400 font-semibold truncate">
            <CloudRain className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{tile.metric.activeDisruption}</span>
          </div>
        )}
      </div>
    );
  }
};
