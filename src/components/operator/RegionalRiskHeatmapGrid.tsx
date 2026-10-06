import React, { useState, useMemo, useRef } from 'react';
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
  BANGLADESH_DIVISIONS_GEOJSON,
  BANGLADESH_RIVERS,
  DIVISION_LABEL_ANCHORS,
} from '../../data/bangladeshGeoData';
import {
  BANGLADESH_DISTRICT_CLUSTERS,
  DistrictCluster,
} from './GeospatialIntelligenceMap';
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
  Compass,
  ZoomIn,
  ZoomOut,
  Waves,
  Zap,
  Navigation,
  Crosshair,
  Info,
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

const DISTRICT_BENGALI_NAMES: Record<string, string> = {
  Patuakhali: 'পটুয়াখালী',
  Galachipa: 'গলাচিপা',
  'Barishal Sadar': 'বরিশাল সদর',
  Bhola: 'ভোলা',
  Barguna: 'বরগুনা',
  'Dhaka Metro': 'ঢাকা মেট্রো',
  Gazipur: 'গাজীপুর',
  Narayanganj: 'নারায়ণগঞ্জ',
  'Chittagong Metro': 'চট্টগ্রাম মেট্রো',
  "Cox's Bazar": 'কক্সবাজার',
  Cumilla: 'কুমিল্লা',
  'Sylhet Sadar': 'সিলেট সদর',
  Sunamganj: 'সুনামগঞ্জ',
  'Rajshahi Sadar': 'রাজশাহী সদর',
  Bogura: 'বগুড়া',
  'Rangpur Sadar': 'রংপুর সদর',
  Dinajpur: 'দিনাজপুর',
  'Khulna Sadar': 'খুলনা সদর',
  Jashore: 'যশোর',
  'Mymensingh Sadar': 'ময়মনসিংহ সদর',
};

const DIVISION_BENGALI_NAMES: Record<string, string> = {
  Dhaka: 'ঢাকা',
  Chittagong: 'চট্টগ্রাম',
  Barishal: 'বরিশাল',
  Sylhet: 'সিলেট',
  Khulna: 'খুলনা',
  Rajshahi: 'রাজশাহী',
  Rangpur: 'রংপুর',
  Mymensingh: 'ময়মনসিংহ',
};

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
  const isBn = lang === 'BN';

  // State Management
  const [activeMetric, setActiveMetric] = useState<HeatmapMetricKey>('riskScore');
  const [viewMode, setViewMode] = useState<'SPLIT' | 'MAP' | 'MATRIX' | 'GRID'>('SPLIT');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'ELEVATED' | 'STABLE'>('ALL');
  const [selectedDivisionName, setSelectedDivisionName] = useState<string>('Barishal');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCluster>(
    BANGLADESH_DISTRICT_CLUSTERS[0]
  );
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictCluster | null>(null);
  const [searchDistrictQuery, setSearchDistrictQuery] = useState<string>('');
  const [showRivers, setShowRivers] = useState<boolean>(true);
  const [showHeatGlows, setShowHeatGlows] = useState<boolean>(true);
  const [showDisruptions, setShowDisruptions] = useState<boolean>(true);
  const [monitoringFeedback, setMonitoringFeedback] = useState<Record<string, boolean>>({});

  // Zoom & Pan state for SVG graphical map
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map canvas coordinate bounds
  const MAP_WIDTH = 640;
  const MAP_HEIGHT = 680;

  // D3 Mercator Projection fitted to Bangladesh coordinates
  const projection = useMemo(() => {
    return d3
      .geoMercator()
      .center([90.35, 23.68])
      .scale(4250 * zoomLevel)
      .translate([MAP_WIDTH / 2 + panOffset.x, MAP_HEIGHT / 2 + panOffset.y]);
  }, [zoomLevel, panOffset]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  const riverLineGenerator = useMemo(() => {
    return d3
      .line<[number, number]>()
      .x((d) => projection(d)?.[0] ?? 0)
      .y((d) => projection(d)?.[1] ?? 0)
      .curve(d3.curveCatmullRom.alpha(0.5));
  }, [projection]);

  // D3 Color Scales
  const colorInterpolators = useMemo(() => {
    const riskScale = d3
      .scaleLinear<string>()
      .domain([0, 30, 50, 75, 100])
      .range(['#10B981', '#0EA5E9', '#F59E0B', '#E11D48', '#881337']);

    const fraudScale = d3
      .scaleLinear<string>()
      .domain([0, 10, 25, 45])
      .range(['#059669', '#38BDF8', '#F59E0B', '#E11D48']);

    const cashOutScale = d3
      .scaleLinear<string>()
      .domain([0, 10, 25, 50])
      .range(['#10B981', '#60A5FA', '#FB923C', '#DC2626']);

    const scamScale = d3
      .scaleLinear<string>()
      .domain([0, 5, 15, 30])
      .range(['#10B981', '#38BDF8', '#F59E0B', '#BE123C']);

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

  // Find metric for any division
  const getDivisionMetric = (divisionName: string): RegionalRiskMetric => {
    return (
      regionalMetrics.find((m) => m.division.toLowerCase() === divisionName.toLowerCase()) || {
        division: divisionName,
        riskScore: 25,
        fraudSignalDelta: 3,
        scamSignalDelta: 2,
        liquidityDrainDelta: -2,
        networkAnomalyDelta: 2,
        cashOutSurgeDelta: 4,
        activeDisruption: 'NONE',
        vulnerableAgentsCount: 0,
        status: 'STABLE',
      }
    );
  };

  // Currently active division metric
  const selectedMetric = useMemo(() => {
    return getDivisionMetric(selectedDivisionName);
  }, [regionalMetrics, selectedDivisionName]);

  // Matched transactions in currently selected division
  const matchedTxns = useMemo(() => {
    return transactions.filter((t) => {
      const text = `${t.senderLocation} ${t.receiverLocation} ${t.senderName} ${t.receiverName}`.toLowerCase();
      const divLower = selectedDivisionName.toLowerCase();
      const distLower = selectedDistrict?.name.toLowerCase() || '';
      return (
        text.includes(divLower) ||
        (divLower === 'chittagong' && (text.includes('chittagong') || text.includes('chattogram'))) ||
        (distLower && text.includes(distLower))
      );
    });
  }, [transactions, selectedDivisionName, selectedDistrict]);

  // Filtered districts matching search or filter
  const displayedDistricts = useMemo(() => {
    return BANGLADESH_DISTRICT_CLUSTERS.filter((dist) => {
      if (searchDistrictQuery) {
        const q = searchDistrictQuery.toLowerCase();
        const en = dist.name.toLowerCase();
        const bn = (DISTRICT_BENGALI_NAMES[dist.name] || '').toLowerCase();
        const div = dist.division.toLowerCase();
        if (!en.includes(q) && !bn.includes(q) && !div.includes(q)) return false;
      }
      if (riskFilter === 'CRITICAL') return dist.fraudRiskScore >= 75;
      if (riskFilter === 'ELEVATED') return dist.fraudRiskScore >= 40 && dist.fraudRiskScore < 75;
      if (riskFilter === 'STABLE') return dist.fraudRiskScore < 40;
      return true;
    });
  }, [searchDistrictQuery, riskFilter]);

  // Recharts Multi-Metric Comparative Data
  const rechartsData = useMemo(() => {
    return regionalMetrics
      .map((rm) => {
        const isEpicenter = rm.division === 'Barishal';
        return {
          name: rm.division,
          riskScore: rm.riskScore,
          fraudSurge: rm.fraudSignalDelta,
          cashOutSurge: rm.cashOutSurgeDelta,
          scamSignal: rm.scamSignalDelta,
          liquidityStress: Math.abs(rm.liquidityDrainDelta),
          vulnerableAgents: rm.vulnerableAgentsCount,
          isEpicenter,
          color: colorInterpolators.riskScale(rm.riskScore),
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [regionalMetrics, colorInterpolators]);

  // Handlers
  const handleSelectDistrict = (district: DistrictCluster) => {
    setSelectedDistrict(district);
    setSelectedDivisionName(district.division);
    onSelectRegion?.(district.division);
  };

  const handleSelectDivision = (divisionName: string) => {
    setSelectedDivisionName(divisionName);
    const firstDistInDiv = BANGLADESH_DISTRICT_CLUSTERS.find(
      (d) => d.division.toLowerCase() === divisionName.toLowerCase()
    );
    if (firstDistInDiv) {
      setSelectedDistrict(firstDistInDiv);
    }
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
      {/* 1. Top Header Toolbar */}
      <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070D1F] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {isBn
                    ? 'বাংলাদেশ জেলা ও আঞ্চলিক ঝুঁকি হিটম্যাপ ভিজ্যুয়ালাইজার'
                    : 'Regional District Heat Map & Spatial Risk Visualizer'}
                </h3>
                <span className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Radio className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" />
                  <span>D3 SPATIAL ENGINE</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'ভৌগোলিক মানচিত্রে RegionalRiskMetric ডেটা ও দেশের জেলাসমূহের স্থানিক জালিয়াতি ক্লাস্টার ও নদী অববাহিকা বিশ্লেষণ'
                  : 'Interactive cartographic heat map mapping RegionalRiskMetric telemetry across Bangladesh districts and river basins.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Metric Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={activeMetric}
              onChange={(e) => setActiveMetric(e.target.value as HeatmapMetricKey)}
              aria-label={isBn ? 'হিটম্যাপ মেট্রিক ফিল্টার নির্বাচন করুন' : 'Select Heatmap Metric'}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="riskScore" className="dark:bg-slate-900">
                {isBn ? 'সামগ্রিক ঝুঁকি স্কোর (০-১০০)' : 'Overall Risk Score (0-100)'}
              </option>
              <option value="cashOutSurgeDelta" className="dark:bg-slate-900">
                {isBn ? 'ক্যাশ-আউট বৃদ্ধির বেগ (% বৃদ্ধি)' : 'Cash-Out Surge Velocity (%)'}
              </option>
              <option value="fraudSignalDelta" className="dark:bg-slate-900">
                {isBn ? 'জালিয়াতি সিগন্যাল ঢেউ (%)' : 'Fraud Signal Surge (%)'}
              </option>
              <option value="scamSignalDelta" className="dark:bg-slate-900">
                {isBn ? 'প্রতারণা ও সোশ্যাল ইঞ্জিনিয়ারিং (%)' : 'Scam Attack Delta (%)'}
              </option>
              <option value="vulnerableAgentsCount" className="dark:bg-slate-900">
                {isBn ? 'সংকটগ্রস্ত এজেন্ট সংখ্যা' : 'Depleted Agents Count'}
              </option>
            </select>
          </div>

          {/* View Mode Toggle: Split, Full Map, Matrix */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs shadow-xs">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'SPLIT'
                  ? 'bg-[#0054A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Side-by-side Map & Analytics"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isBn ? 'যৌথ স্পেশাল' : 'Split View'}</span>
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-[#0054A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Full Graphical District Heat Map"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'জেলা মানচিত্র' : 'District Map'}</span>
            </button>
            <button
              onClick={() => setViewMode('MATRIX')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'MATRIX'
                  ? 'bg-[#0054A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Comparative Recharts Matrix"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'রিকার্টস ম্যাট্রিক্স' : 'Matrix'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Heat Legend & District Quick Search Strip */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Heat Intensity Scale */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
            {isBn ? 'ঝুঁকি তীব্রতা স্কেল:' : 'Spatial Risk Scale:'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Low (0)</span>
            <div className="w-28 sm:w-36 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 via-amber-500 to-rose-600 shadow-inner" />
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">Critical (100)</span>
          </div>
        </div>

        {/* District Quick Search Input */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchDistrictQuery}
              onChange={(e) => setSearchDistrictQuery(e.target.value)}
              placeholder={isBn ? 'জেলা খুঁজুন (উদাঃ পটুয়াখালী)...' : 'Filter district (e.g. Patuakhali)...'}
              className="pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0054A6] w-48 sm:w-56"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {(['ALL', 'CRITICAL', 'ELEVATED', 'STABLE'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRiskFilter(filter)}
                className={`px-2 py-0.5 text-[10.5px] rounded-md font-semibold transition-colors cursor-pointer ${
                  riskFilter === filter
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {filter === 'ALL'
                  ? isBn ? 'সকল' : 'All'
                  : filter === 'CRITICAL'
                  ? isBn ? 'ক্রিটিক্যাল' : 'Crit'
                  : filter === 'ELEVATED'
                  ? isBn ? 'উদ্বেগজনক' : 'Elev'
                  : isBn ? 'স্থিতিশীল' : 'Stable'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Graphical District Heat Map + Inspector & Recharts Matrix */}
      <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Graphical District Heat Map / Recharts Matrix */}
        <div
          className={`${
            viewMode === 'SPLIT'
              ? 'lg:col-span-8 space-y-6'
              : viewMode === 'MAP'
              ? 'lg:col-span-8 xl:col-span-8'
              : 'lg:col-span-12'
          }`}
        >
          {/* SECTION A: GRAPHICAL DISTRICT HEAT MAP OF BANGLADESH */}
          {(viewMode === 'SPLIT' || viewMode === 'MAP') && (
            <div className="relative bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/60 dark:from-[#070D1F] dark:via-[#09112A] dark:to-[#050914] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner overflow-hidden">
              {/* Map Canvas Header & Controls */}
              <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0054A6] dark:text-sky-400" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {isBn
                      ? 'বাংলাদেশ জেলা ও বিভাগীয় স্থানিক হিটম্যাপ'
                      : 'Bangladesh District & Division Spatial Heat Map'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {displayedDistricts.length} Districts Mapped
                  </span>
                </div>

                {/* Map Layer & Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
                  <button
                    onClick={() => setShowRivers(!showRivers)}
                    title={isBn ? 'নদী ব্যবস্থা চালু/বন্ধ করুন' : 'Toggle River Corridors'}
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                      showRivers
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {isBn ? 'নদী' : 'Rivers'}
                  </button>
                  <button
                    onClick={() => setShowHeatGlows(!showHeatGlows)}
                    title={isBn ? 'হিট গ্লো বৃত্ত চালু/বন্ধ করুন' : 'Toggle District Heat Halos'}
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                      showHeatGlows
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {isBn ? 'গ্লো' : 'Halos'}
                  </button>
                  <button
                    onClick={() => setShowDisruptions(!showDisruptions)}
                    title={isBn ? 'ঝড়/বন্যা ওভারলে' : 'Toggle Weather Hazards'}
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                      showDisruptions
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {isBn ? 'দুর্যোগ' : 'Hazards'}
                  </button>

                  <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.2))}
                    title="Zoom in"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                    title="Zoom out"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    title="Reset map view"
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Main Graphical SVG Canvas */}
              <div className="relative w-full h-[480px] sm:h-[560px] md:h-[600px] flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                  className="w-full h-full max-h-[600px] select-none"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.04))' }}
                >
                  <defs>
                    {/* SVG Radial Heat Glow Gradients */}
                    <radialGradient id="heatGlowCritical" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#E11D48" stopOpacity="0.75" />
                      <stop offset="50%" stopColor="#E11D48" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
                    </radialGradient>

                    <radialGradient id="heatGlowElevated" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
                      <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </radialGradient>

                    <radialGradient id="heatGlowModerate" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#0284C7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                    </radialGradient>

                    <radialGradient id="heatGlowStable" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                      <stop offset="60%" stopColor="#10B981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </radialGradient>

                    {/* Cyclone Radial Hazard Cone */}
                    <radialGradient id="cycloneCone" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#BE123C" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#F43F5E" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                    </radialGradient>

                    {/* Water Texture Pattern for Bay of Bengal */}
                    <pattern id="bayWaterPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path
                        d="M 0 12 Q 6 8 12 12 T 24 12"
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="0.8"
                        strokeOpacity="0.25"
                      />
                    </pattern>
                  </defs>

                  {/* 1. Water Background (Bay of Bengal at South) */}
                  <rect
                    x="0"
                    y="530"
                    width={MAP_WIDTH}
                    height="170"
                    fill="url(#bayWaterPattern)"
                    className="opacity-70 pointer-events-none"
                  />

                  {/* Bay of Bengal Spatial Annotation */}
                  <g className="pointer-events-none opacity-60">
                    <text
                      x="320"
                      y="650"
                      textAnchor="middle"
                      className="fill-sky-700/60 dark:fill-sky-400/40 text-[13px] font-extrabold uppercase tracking-widest font-mono"
                    >
                      ~ Bay of Bengal (বঙ্গোপসাগর) ~
                    </text>
                    <text
                      x="320"
                      y="668"
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-500 text-[10px] font-sans"
                    >
                      Southern Maritime Border & Coastal Storm Corridor
                    </text>
                  </g>

                  {/* 2. Bangladesh Division Polygons with Heat Map Choropleth Fill */}
                  <g className="divisions-layer">
                    {BANGLADESH_DIVISIONS_GEOJSON.features.map((feature: any) => {
                      const divName: string = feature.properties.name;
                      const metric = getDivisionMetric(divName);
                      const isSelected = selectedDivisionName.toLowerCase() === divName.toLowerCase();
                      const val = getMetricValue(metric, activeMetric);
                      const fillColor = getCellColor(val, activeMetric);
                      const pathString = pathGenerator(feature) || '';

                      return (
                        <g key={divName} className="group">
                          {/* Division Polygon Path */}
                          <path
                            d={pathString}
                            fill={fillColor}
                            fillOpacity={isSelected ? 0.72 : 0.45}
                            stroke={isSelected ? '#0054A6' : '#94A3B8'}
                            strokeWidth={isSelected ? 2.5 : 1.2}
                            strokeOpacity={isSelected ? 1 : 0.6}
                            onClick={() => handleSelectDivision(divName)}
                            className="cursor-pointer transition-all duration-200 hover:fill-opacity-80"
                          />

                          {/* Division Label Anchor */}
                          {DIVISION_LABEL_ANCHORS[divName] && (
                            (() => {
                              const [anchorLng, anchorLat] = DIVISION_LABEL_ANCHORS[divName];
                              const [ax, ay] = projection([anchorLng, anchorLat]) || [0, 0];
                              if (!ax || !ay) return null;

                              return (
                                <g
                                  transform={`translate(${ax}, ${ay})`}
                                  className="pointer-events-none"
                                >
                                  {/* Background Badge Pill */}
                                  <rect
                                    x="-34"
                                    y="-10"
                                    width="68"
                                    height="20"
                                    rx="6"
                                    fill={isSelected ? '#0054A6' : '#FFFFFF'}
                                    fillOpacity={isSelected ? 0.95 : 0.85}
                                    stroke={isSelected ? '#FFFFFF' : '#CBD5E1'}
                                    strokeWidth="1"
                                    className="dark:fill-slate-900/90 dark:stroke-slate-700"
                                  />
                                  <text
                                    x="0"
                                    y="3"
                                    textAnchor="middle"
                                    className={`text-[9.5px] font-extrabold ${
                                      isSelected
                                        ? 'fill-white'
                                        : 'fill-slate-900 dark:fill-slate-100'
                                    }`}
                                  >
                                    {isBn ? (DIVISION_BENGALI_NAMES[divName] || divName) : divName}
                                  </text>
                                  <text
                                    x="0"
                                    y="18"
                                    textAnchor="middle"
                                    className="fill-slate-600 dark:fill-slate-300 font-mono text-[8.5px] font-bold"
                                  >
                                    {activeMetric === 'riskScore'
                                      ? `${metric.riskScore}/100`
                                      : activeMetric === 'vulnerableAgentsCount'
                                      ? `${metric.vulnerableAgentsCount} agt`
                                      : `+${val}%`}
                                  </text>
                                </g>
                              );
                            })()
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* 3. Major River Paths (Spatial Context) */}
                  {showRivers && (
                    <g className="rivers-layer pointer-events-none opacity-80">
                      {BANGLADESH_RIVERS.map((river) => {
                        const riverPathString = riverLineGenerator(river.coordinates) || '';
                        return (
                          <path
                            key={river.name}
                            d={riverPathString}
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="1.8"
                            strokeOpacity="0.45"
                            strokeLinecap="round"
                            strokeDasharray={river.name.includes('Jamuna') ? 'none' : '4 2'}
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* 4. Active Weather / Cyclone Remal Disruption Overlays */}
                  {showDisruptions && (
                    <g className="disruptions-layer pointer-events-none">
                      {/* Barishal & Coastal Cyclone Warning Cone */}
                      {getDivisionMetric('Barishal').activeDisruption === 'CYCLONE' && (() => {
                        const [cx, cy] = projection([90.35, 22.30]) || [310, 520];
                        return (
                          <g transform={`translate(${cx}, ${cy})`}>
                            {/* Outer Hazard Pulse Circle */}
                            <circle
                              r="78"
                              fill="url(#cycloneCone)"
                              className="animate-pulse"
                            />
                            <circle
                              r="64"
                              fill="none"
                              stroke="#E11D48"
                              strokeWidth="1.5"
                              strokeDasharray="6 4"
                              strokeOpacity="0.7"
                              className="animate-spin"
                              style={{ transformOrigin: 'center', animationDuration: '18s' }}
                            />
                            {/* Warning Label Badge */}
                            <rect
                              x="-56"
                              y="-84"
                              width="112"
                              height="22"
                              rx="6"
                              fill="#991B1B"
                              stroke="#FCA5A5"
                              strokeWidth="1"
                              className="shadow-md"
                            />
                            <text
                              x="0"
                              y="-70"
                              textAnchor="middle"
                              className="fill-white font-mono text-[9px] font-black uppercase tracking-wider"
                            >
                              ⚠ CYCLONE REMAL (SIG 7)
                            </text>
                          </g>
                        );
                      })()}

                      {/* Sylhet Haor Flash Flood Hazard */}
                      {getDivisionMetric('Sylhet').activeDisruption === 'FLASH_FLOOD' && (() => {
                        const [sx, sy] = projection([91.65, 24.95]) || [430, 260];
                        return (
                          <g transform={`translate(${sx}, ${sy})`}>
                            <circle
                              r="42"
                              fill="#0284C7"
                              fillOpacity="0.22"
                              stroke="#0284C7"
                              strokeWidth="1.2"
                              strokeDasharray="3 3"
                              className="animate-pulse"
                            />
                            <rect
                              x="-46"
                              y="-52"
                              width="92"
                              height="18"
                              rx="5"
                              fill="#0369A1"
                              stroke="#BAE6FD"
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="-40"
                              textAnchor="middle"
                              className="fill-white font-mono text-[8.5px] font-bold uppercase"
                            >
                              🌊 FLASH FLOOD HAOR
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  )}

                  {/* 5. Graphical District Nodes & Heat Spot Halos */}
                  <g className="districts-layer">
                    {displayedDistricts.map((district) => {
                      const coords = projection(district.coordinates) || [0, 0];
                      const [dx, dy] = coords;
                      if (!dx || !dy) return null;

                      const isDistrictSelected = selectedDistrict?.id === district.id;
                      const isDistrictHovered = hoveredDistrict?.id === district.id;
                      const isHighRisk = district.fraudRiskScore >= 75;
                      const isElevated = district.fraudRiskScore >= 50 && district.fraudRiskScore < 75;
                      const isEpicenter = district.clusterType === 'MULE_RING';

                      // Heat Halo Radius based on hourly transaction density
                      const haloRadius = Math.max(16, Math.min(38, 14 + district.hourlyTxnCount / 140));

                      const gradientId = isHighRisk
                        ? 'url(#heatGlowCritical)'
                        : isElevated
                        ? 'url(#heatGlowElevated)'
                        : district.fraudRiskScore >= 35
                        ? 'url(#heatGlowModerate)'
                        : 'url(#heatGlowStable)';

                      const markerColor = isHighRisk
                        ? '#E11D48'
                        : isElevated
                        ? '#F59E0B'
                        : district.fraudRiskScore >= 35
                        ? '#0284C7'
                        : '#10B981';

                      return (
                        <g
                          key={district.id}
                          transform={`translate(${dx}, ${dy})`}
                          onClick={() => handleSelectDistrict(district)}
                          onMouseEnter={() => setHoveredDistrict(district)}
                          onMouseLeave={() => setHoveredDistrict(null)}
                          className="cursor-pointer group"
                        >
                          {/* Radial Heat Glow Halo */}
                          {showHeatGlows && (
                            <circle
                              r={haloRadius}
                              fill={gradientId}
                              className="pointer-events-none transition-all duration-300 group-hover:scale-125"
                            />
                          )}

                          {/* Pulsing Concentric Radar Ring for Epicenter / Mule Rings */}
                          {isEpicenter && (
                            <circle
                              r={haloRadius + 4}
                              fill="none"
                              stroke="#E11D48"
                              strokeWidth="1.5"
                              strokeOpacity="0.8"
                              className="animate-ping"
                              style={{ animationDuration: '2.5s' }}
                            />
                          )}

                          {/* District Center Pin Node */}
                          <circle
                            r={isDistrictSelected ? 6.5 : 4.5}
                            fill={markerColor}
                            stroke="#FFFFFF"
                            strokeWidth={isDistrictSelected ? 2.5 : 1.5}
                            className="shadow-md transition-all duration-200"
                          />

                          {/* District Name Label Badge */}
                          <g
                            transform="translate(0, 14)"
                            className={`transition-opacity duration-150 ${
                              isDistrictSelected || isDistrictHovered || isHighRisk
                                ? 'opacity-100'
                                : 'opacity-85 group-hover:opacity-100'
                            }`}
                          >
                            <rect
                              x="-26"
                              y="-8"
                              width="52"
                              height="14"
                              rx="4"
                              fill={isDistrictSelected ? '#0054A6' : '#0F172A'}
                              fillOpacity={isDistrictSelected ? 0.95 : 0.75}
                              stroke={isDistrictSelected ? '#FFFFFF' : '#475569'}
                              strokeWidth="0.8"
                            />
                            <text
                              x="0"
                              y="2.5"
                              textAnchor="middle"
                              className="fill-white font-bold text-[8px] tracking-tight font-sans"
                            >
                              {isBn ? (DISTRICT_BENGALI_NAMES[district.name] || district.name) : district.name}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>

                  {/* 6. Compass Rose & Geographic Coordinates (Top-Right) */}
                  <g transform="translate(580, 50)" className="pointer-events-none opacity-75">
                    <circle r="22" fill="#0F172A" fillOpacity="0.7" stroke="#475569" strokeWidth="1" />
                    <line x1="0" y1="-18" x2="0" y2="18" stroke="#94A3B8" strokeWidth="1" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#94A3B8" strokeWidth="1" />
                    {/* Cardinal Arrow North */}
                    <polygon points="0,-18 -4,-6 4,-6" fill="#EF4444" />
                    <text x="0" y="-8" textAnchor="middle" className="fill-white font-mono text-[8px] font-black">
                      N
                    </text>
                  </g>

                  {/* 7. Geographic Context Border Labels */}
                  <g className="pointer-events-none opacity-40 dark:opacity-30 text-[9px] font-mono uppercase tracking-widest fill-slate-500">
                    <text x="180" y="45">Assam / Meghalaya (মেঘালয় সীমান্ত)</text>
                    <text x="480" y="380" transform="rotate(75, 480, 380)">Tripura / Arakan Corridor</text>
                    <text x="35" y="320" transform="rotate(-75, 35, 320)">West Bengal Border (ভারত)</text>
                  </g>
                </svg>

                {/* Floating Interactive Hover Tooltip */}
                {hoveredDistrict && (() => {
                  const divMetric = getDivisionMetric(hoveredDistrict.division);
                  return (
                    <div className="absolute bottom-4 left-4 z-30 bg-slate-950/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs max-w-xs backdrop-blur-md animate-fade-in pointer-events-none">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
                        <div>
                          <span className="font-extrabold text-sm text-sky-300 block">
                            {hoveredDistrict.name}
                            <span className="text-slate-400 font-normal ml-1.5 text-xs">
                              ({DISTRICT_BENGALI_NAMES[hoveredDistrict.name] || hoveredDistrict.name})
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {hoveredDistrict.division} Division · {hoveredDistrict.id}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            hoveredDistrict.fraudRiskScore >= 75
                              ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                              : hoveredDistrict.fraudRiskScore >= 50
                              ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                              : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                          }`}
                        >
                          {hoveredDistrict.fraudRiskScore}/100 Risk
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[11px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hourly Flow:</span>
                          <span className="font-bold text-white">৳ {(hoveredDistrict.hourlyVolumeBDT / 1000).toLocaleString()}k</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Txn Velocity:</span>
                          <span className="text-white">{hoveredDistrict.hourlyTxnCount} txns/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cluster Anomaly:</span>
                          <span className="text-amber-400 font-bold">{hoveredDistrict.clusterType}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px]">
                          <span className="text-slate-400">Division Cash-Out:</span>
                          <span className="text-rose-400">+{divMetric.cashOutSurgeDelta}%</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10.5px] text-slate-300 font-sans italic border-t border-slate-800 pt-1.5">
                        {hoveredDistrict.activeThreatDescription}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Map Footer Operational Note */}
              <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>
                    {isBn
                      ? 'লাল রিং ও গ্লো: সক্রিয় সিন্ডিকেট টার্মিনাস (বরিশাল ও উপকূলীয় পটুয়াখালী - নেটওয়ার্ক #১৭)'
                      : 'Pulsing Halos: Active Fraud Syndicate Epicenters (Barishal & Coastal Patuakhali Network #17)'}
                  </span>
                </div>
                <span className="font-mono text-[10px]">
                  22 Geographic Districts · 8 Sovereign Divisions
                </span>
              </div>
            </div>
          )}

          {/* SECTION B: RECHARTS REGIONAL RISK & FRAUD VELOCITY MATRIX */}
          {(viewMode === 'MATRIX' || viewMode === 'SPLIT') && (
            <div className="bg-slate-50/70 dark:bg-[#070D1F] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {isBn
                      ? 'রিকার্টস বিভাগীয় ঝুঁকি ও অস্বাভাবিক বেগ ম্যাট্রিক্স'
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

              {/* Responsive Recharts Bar Chart */}
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
                                <span className="text-slate-400">Risk Score:</span>
                                <span className="font-bold text-rose-400">{data.riskScore}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Cash-Out Surge:</span>
                                <span className="font-bold text-amber-400">+{data.cashOutSurge}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Fraud Surge:</span>
                                <span className="font-bold text-sky-400">+{data.fraudSurge}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Scam Delta:</span>
                                <span className="font-bold text-purple-400">+{data.scamSignal}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Depleted Agents:</span>
                                <span className="font-bold text-amber-300">{data.vulnerableAgents} nodes</span>
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
                          handleSelectDivision(entry.name);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {rechartsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={selectedDivisionName === entry.name ? 1 : 0.75}
                          stroke={selectedDivisionName === entry.name ? '#FFFFFF' : 'none'}
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

        {/* Right Column: Interactive Regional Threat & District Inspector */}
        <div className={`${viewMode === 'SPLIT' ? 'lg:col-span-4' : viewMode === 'MAP' ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
          <div className="bg-slate-50/70 dark:bg-[#070D1F] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            {/* Inspector Top Bar */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0054A6] dark:text-sky-400 font-bold block">
                  {isBn ? 'নির্বাচিত জেলা ও অঞ্চল পরিদর্শন' : 'DISTRICT & REGIONAL INSPECTOR'}
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                  <span>{selectedDistrict?.name || selectedDivisionName}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-serif">
                    ({DISTRICT_BENGALI_NAMES[selectedDistrict?.name || ''] || DIVISION_BENGALI_NAMES[selectedDivisionName] || ''})
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="bg-blue-100 dark:bg-blue-950/80 text-[#0054A6] dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    {selectedDivisionName} Division
                  </span>
                  {selectedDistrict?.clusterType && (
                    <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 font-mono">
                      {selectedDistrict.clusterType}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Score Stamp */}
              <div
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black border shadow-md shrink-0"
                style={{
                  backgroundColor: `${getCellColor(selectedMetric.riskScore, 'riskScore')}1A`,
                  borderColor: getCellColor(selectedMetric.riskScore, 'riskScore'),
                  color: getCellColor(selectedMetric.riskScore, 'riskScore'),
                }}
              >
                <span className="text-xl leading-none">{selectedDistrict?.fraudRiskScore || selectedMetric.riskScore}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">/100</span>
              </div>
            </div>

            {/* Hotspot Synopsis Card */}
            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {isBn ? 'স্থানিক গোয়েন্দা সারসংক্ষেপ' : 'Spatial Threat Intelligence Synopsis'}
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {selectedDistrict?.activeThreatDescription ||
                  (isBn
                    ? `${selectedDivisionName} বিভাগে রিয়েল-টাইম এমএফএস মনিটরিং সক্রিয় রয়েছে।`
                    : `Active MFS fraud telemetry monitoring for ${selectedDivisionName} division.`)}
              </p>
            </div>

            {/* Key Risk Telemetry Gauges */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {isBn ? 'ক্যাশ-আউট বেগ' : 'Cash-Out Surge'}
                </span>
                <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
                  +{selectedMetric.cashOutSurgeDelta}%
                </span>
                <span className="text-[10px] text-slate-400">Velocity vs. baseline</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {isBn ? 'জালিয়াতি সিগন্যাল' : 'Fraud Signal Surge'}
                </span>
                <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
                  +{selectedMetric.fraudSignalDelta}%
                </span>
                <span className="text-[10px] text-slate-400">GNN anomaly rate</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {isBn ? 'সংকটগ্রস্ত এজেন্ট' : 'Depleted Agents'}
                </span>
                <span className="text-base font-black font-mono text-sky-600 dark:text-sky-400 block mt-0.5">
                  {selectedMetric.vulnerableAgentsCount} Agents
                </span>
                <span className="text-[10px] text-slate-400">Cash float &lt; 4h</span>
              </div>

              <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                  {isBn ? 'আবহাওয়া ব্যাঘাত' : 'Active Disruption'}
                </span>
                <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 block mt-1 truncate">
                  {selectedMetric.activeDisruption === 'CYCLONE' ? (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <CloudRain className="w-3.5 h-3.5" /> Cyclone Remal
                    </span>
                  ) : selectedMetric.activeDisruption === 'FLASH_FLOOD' ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <CloudRain className="w-3.5 h-3.5" /> Flash Flood
                    </span>
                  ) : (
                    'Normal Operation'
                  )}
                </span>
              </div>
            </div>

            {/* Matched Live Transactions in this Sector */}
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? 'এ অঞ্চলে শনাক্তকৃত লেনদেন' : 'Regional Active Transactions'}
                </span>
                <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300 font-bold">
                  {matchedTxns.length} Found
                </span>
              </div>

              {matchedTxns.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800">
                  {isBn ? 'এ অঞ্চলে কোনো ফ্ল্যাগড লেনদেন নেই' : 'No flagged transactions detected in this specific sector.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {matchedTxns.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {t.id}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                              t.fusedRiskScore >= 75
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {t.fusedRiskScore}/100
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          ৳ {t.amount.toLocaleString()} · {t.receiverLocation}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenInvestigation?.(t)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
                        title="Investigate Transaction"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operational Action Controls */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {/* Filter Table to Region Button */}
              <button
                onClick={() => onFilterTableToRegion?.(selectedDistrict?.name || selectedDivisionName)}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {isBn
                    ? `গার্ডিয়ান টেবিলে ${selectedDistrict?.name || selectedDivisionName} ফিল্টার করুন`
                    : `Filter Guardian Table to ${selectedDistrict?.name || selectedDivisionName}`}
                </span>
              </button>

              {/* Deploy High Alert Monitoring */}
              <button
                onClick={() => handleTriggerMonitoring(selectedDivisionName)}
                className="w-full py-2.5 px-3 bg-[#0054A6] hover:bg-[#004080] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-[#003875]"
              >
                {monitoringFeedback[selectedDivisionName] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? 'মনিটরিং সক্রিয় করা হয়েছে!' : 'Enhanced Monitoring Activated!'}</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-amber-300" />
                    <span>
                      {isBn
                        ? `${selectedDivisionName}-এ উচ্চ সতর্কবার্তা জারি করুন`
                        : `Deploy High-Alert Protocol for ${selectedDivisionName}`}
                    </span>
                  </>
                )}
              </button>

              {/* Quick Jump Links */}
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
};
