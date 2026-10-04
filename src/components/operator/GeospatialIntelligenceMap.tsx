import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { RegionalRiskMetric, AgentLiquidityNode, Transaction } from '../../types';
import {
  Globe,
  MapPin,
  ShieldAlert,
  Wind,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Send,
  Activity,
  CheckCircle,
  Eye,
  TrendingUp,
  Compass,
  Zap,
  ArrowRight,
  Flame,
  Radio,
  Sliders,
  DollarSign,
  AlertOctagon,
  Moon,
  Sparkles,
  Palette,
} from 'lucide-react';

interface GeospatialIntelligenceMapProps {
  transactions?: Transaction[];
  regionalMetrics: RegionalRiskMetric[];
  agents: AgentLiquidityNode[];
  onActivateMonitoring: (division: string) => void;
  onDispatchLiquidity: (agentId: string, agentName: string, amount: number) => void;
  onOpenInvestigation?: (transaction: Transaction) => void;
  lang: 'EN' | 'BN';
}

export type HeatmapMode = 'COMBINED' | 'FRAUD_CLUSTERS' | 'TXN_DENSITY';
export type MapVisualTheme = 'CLEAN_SLATE' | 'NAVY_CYBER' | 'OCEAN_BLUE';

export interface DistrictCluster {
  id: string;
  name: string;
  division: string;
  coordinates: [number, number]; // [lng, lat]
  txnDensityScore: number; // 0 - 100
  fraudRiskScore: number; // 0 - 100
  hourlyVolumeBDT: number;
  hourlyTxnCount: number;
  fraudAlertsCount: number;
  clusterType: 'MULE_RING' | 'VELOCITY_SPIKE' | 'PANIC_CASHOUT' | 'GEO_ANOMALY' | 'COMMERCIAL_HUB' | 'NOMINAL';
  activeThreatDescription: string;
}

// 22 Key Districts across Bangladesh with real coordinates and risk/density metrics
export const BANGLADESH_DISTRICT_CLUSTERS: DistrictCluster[] = [
  // Barishal Division (Epicenter of Network #17 & Cyclone Remal surge)
  {
    id: 'DST-PAT',
    name: 'Patuakhali',
    division: 'Barishal',
    coordinates: [90.3299, 22.3596],
    txnDensityScore: 78,
    fraudRiskScore: 94,
    hourlyVolumeBDT: 1820000,
    hourlyTxnCount: 380,
    fraudAlertsCount: 16,
    clusterType: 'MULE_RING',
    activeThreatDescription: 'Central cash-out terminus for Mule Network #17 (W302)',
  },
  {
    id: 'DST-GAL',
    name: 'Galachipa',
    division: 'Barishal',
    coordinates: [90.4194, 22.1639],
    txnDensityScore: 64,
    fraudRiskScore: 89,
    hourlyVolumeBDT: 940000,
    hourlyTxnCount: 210,
    fraudAlertsCount: 11,
    clusterType: 'MULE_RING',
    activeThreatDescription: 'Remote coastal agent cash-out ring concentration',
  },
  {
    id: 'DST-BAR',
    name: 'Barishal Sadar',
    division: 'Barishal',
    coordinates: [90.3535, 22.7010],
    txnDensityScore: 82,
    fraudRiskScore: 87,
    hourlyVolumeBDT: 2450000,
    hourlyTxnCount: 620,
    fraudAlertsCount: 22,
    clusterType: 'PANIC_CASHOUT',
    activeThreatDescription: 'Cyclone alert panic cash-out acceleration & float depletion',
  },
  {
    id: 'DST-BHO',
    name: 'Bhola',
    division: 'Barishal',
    coordinates: [90.6481, 22.6859],
    txnDensityScore: 68,
    fraudRiskScore: 74,
    hourlyVolumeBDT: 1150000,
    hourlyTxnCount: 290,
    fraudAlertsCount: 8,
    clusterType: 'PANIC_CASHOUT',
    activeThreatDescription: 'Island agent liquidity runway critical under storm warning',
  },
  {
    id: 'DST-BRG',
    name: 'Barguna',
    division: 'Barishal',
    coordinates: [90.1250, 22.1570],
    txnDensityScore: 58,
    fraudRiskScore: 83,
    hourlyVolumeBDT: 820000,
    hourlyTxnCount: 195,
    fraudAlertsCount: 9,
    clusterType: 'MULE_RING',
    activeThreatDescription: 'Secondary layer-2 mule exit hops detected',
  },

  // Dhaka Division (High transaction density commercial capital)
  {
    id: 'DST-DHA',
    name: 'Dhaka Metro',
    division: 'Dhaka',
    coordinates: [90.4125, 23.8103],
    txnDensityScore: 99,
    fraudRiskScore: 36,
    hourlyVolumeBDT: 24800000,
    hourlyTxnCount: 6850,
    fraudAlertsCount: 19,
    clusterType: 'COMMERCIAL_HUB',
    activeThreatDescription: 'High-density corporate, merchant QR and peer transfers',
  },
  {
    id: 'DST-GAZ',
    name: 'Gazipur',
    division: 'Dhaka',
    coordinates: [90.4249, 23.9999],
    txnDensityScore: 88,
    fraudRiskScore: 42,
    hourlyVolumeBDT: 8400000,
    hourlyTxnCount: 2650,
    fraudAlertsCount: 7,
    clusterType: 'COMMERCIAL_HUB',
    activeThreatDescription: 'RMG sector salary disbursement velocity peak',
  },
  {
    id: 'DST-NAR',
    name: 'Narayanganj',
    division: 'Dhaka',
    coordinates: [90.5000, 23.6238],
    txnDensityScore: 81,
    fraudRiskScore: 39,
    hourlyVolumeBDT: 6100000,
    hourlyTxnCount: 1840,
    fraudAlertsCount: 5,
    clusterType: 'COMMERCIAL_HUB',
    activeThreatDescription: 'Inland river port wholesale trading settlement hub',
  },

  // Chittagong Division (Cross-regional anomaly jump & port density)
  {
    id: 'DST-CTG',
    name: 'Chittagong Metro',
    division: 'Chittagong',
    coordinates: [91.8365, 22.3569],
    txnDensityScore: 91,
    fraudRiskScore: 78,
    hourlyVolumeBDT: 14200000,
    hourlyTxnCount: 3950,
    fraudAlertsCount: 24,
    clusterType: 'GEO_ANOMALY',
    activeThreatDescription: 'Nocturnal IP velocity hops originating from rogue hardware',
  },
  {
    id: 'DST-COX',
    name: 'Cox\'s Bazar',
    division: 'Chittagong',
    coordinates: [92.0165, 21.4272],
    txnDensityScore: 72,
    fraudRiskScore: 71,
    hourlyVolumeBDT: 3100000,
    hourlyTxnCount: 890,
    fraudAlertsCount: 13,
    clusterType: 'VELOCITY_SPIKE',
    activeThreatDescription: 'Cross-border remittances with rapid structured fan-out',
  },
  {
    id: 'DST-COM',
    name: 'Cumilla',
    division: 'Chittagong',
    coordinates: [91.1809, 23.4607],
    txnDensityScore: 76,
    fraudRiskScore: 33,
    hourlyVolumeBDT: 4600000,
    hourlyTxnCount: 1420,
    fraudAlertsCount: 4,
    clusterType: 'NOMINAL',
    activeThreatDescription: 'Stable remittance reception and consumer grocery payments',
  },

  // Sylhet Division (Flash flood emergency cash-out corridor)
  {
    id: 'DST-SYL',
    name: 'Sylhet Sadar',
    division: 'Sylhet',
    coordinates: [91.8687, 24.8949],
    txnDensityScore: 79,
    fraudRiskScore: 56,
    hourlyVolumeBDT: 5900000,
    hourlyTxnCount: 1720,
    fraudAlertsCount: 10,
    clusterType: 'PANIC_CASHOUT',
    activeThreatDescription: 'Flood relief fund fan-out & foreign remittance surge',
  },
  {
    id: 'DST-SUN',
    name: 'Sunamganj',
    division: 'Sylhet',
    coordinates: [91.3992, 25.0658],
    txnDensityScore: 61,
    fraudRiskScore: 68,
    hourlyVolumeBDT: 1450000,
    hourlyTxnCount: 420,
    fraudAlertsCount: 8,
    clusterType: 'PANIC_CASHOUT',
    activeThreatDescription: 'Haor basin emergency relief float exhaustion risk',
  },

  // Rajshahi Division (Northwest agro trading corridor)
  {
    id: 'DST-RAJ',
    name: 'Rajshahi Sadar',
    division: 'Rajshahi',
    coordinates: [88.6049, 24.3745],
    txnDensityScore: 73,
    fraudRiskScore: 31,
    hourlyVolumeBDT: 4200000,
    hourlyTxnCount: 1280,
    fraudAlertsCount: 3,
    clusterType: 'NOMINAL',
    activeThreatDescription: 'Agricultural wholesale and student campus micro-flows',
  },
  {
    id: 'DST-BOG',
    name: 'Bogura',
    division: 'Rajshahi',
    coordinates: [89.3730, 24.8465],
    txnDensityScore: 77,
    fraudRiskScore: 38,
    hourlyVolumeBDT: 5100000,
    hourlyTxnCount: 1540,
    fraudAlertsCount: 5,
    clusterType: 'COMMERCIAL_HUB',
    activeThreatDescription: 'Northern regional transport trading junction volume',
  },

  // Rangpur Division (Northern border commercial hubs)
  {
    id: 'DST-RAN',
    name: 'Rangpur Sadar',
    division: 'Rangpur',
    coordinates: [89.2444, 25.7439],
    txnDensityScore: 67,
    fraudRiskScore: 29,
    hourlyVolumeBDT: 3300000,
    hourlyTxnCount: 980,
    fraudAlertsCount: 2,
    clusterType: 'NOMINAL',
    activeThreatDescription: 'Rural consumer commerce with stable baseline behavior',
  },
  {
    id: 'DST-DIN',
    name: 'Dinajpur',
    division: 'Rangpur',
    coordinates: [88.6332, 25.6217],
    txnDensityScore: 60,
    fraudRiskScore: 34,
    hourlyVolumeBDT: 2400000,
    hourlyTxnCount: 720,
    fraudAlertsCount: 3,
    clusterType: 'NOMINAL',
    activeThreatDescription: 'Seasonal grain harvest trade settlement transactions',
  },

  // Khulna Division (Southwestern port & cross-border trade)
  {
    id: 'DST-KHU',
    name: 'Khulna Sadar',
    division: 'Khulna',
    coordinates: [89.5403, 22.8456],
    txnDensityScore: 80,
    fraudRiskScore: 48,
    hourlyVolumeBDT: 5600000,
    hourlyTxnCount: 1680,
    fraudAlertsCount: 7,
    clusterType: 'NOMINAL',
    activeThreatDescription: 'Industrial shrimp export and municipal merchant volume',
  },
  {
    id: 'DST-JAS',
    name: 'Jashore',
    division: 'Khulna',
    coordinates: [89.2167, 23.1667],
    txnDensityScore: 74,
    fraudRiskScore: 61,
    hourlyVolumeBDT: 4100000,
    hourlyTxnCount: 1240,
    fraudAlertsCount: 9,
    clusterType: 'VELOCITY_SPIKE',
    activeThreatDescription: 'Benapole land-port trade remittance velocity spikes',
  },

  // Mymensingh Division
  {
    id: 'DST-MYM',
    name: 'Mymensingh Sadar',
    division: 'Mymensingh',
    coordinates: [90.4073, 24.7471],
    txnDensityScore: 69,
    fraudRiskScore: 33,
    hourlyVolumeBDT: 3600000,
    hourlyTxnCount: 1120,
    fraudAlertsCount: 4,
    clusterType: 'NOMINAL',
    activeThreatDescription: 'Agricultural supply chain transactions and educational hub',
  },
];

// Accurate GeoJSON specifications for the 8 Divisions of Bangladesh
const BANGLADESH_DIVISIONS_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Rangpur', id: 'DIV-RANG' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [88.35, 25.40],
            [88.20, 26.15],
            [88.55, 26.35],
            [89.05, 26.60],
            [89.45, 26.30],
            [89.70, 25.85],
            [89.60, 25.25],
            [89.15, 25.10],
            [88.55, 25.15],
            [88.35, 25.40],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Rajshahi', id: 'DIV-RAJ' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [88.10, 24.65],
            [88.35, 25.20],
            [88.95, 25.15],
            [89.50, 25.20],
            [89.75, 24.85],
            [89.60, 24.20],
            [89.25, 23.90],
            [88.60, 24.10],
            [88.10, 24.65],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Mymensingh', id: 'DIV-MYM' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.60, 25.25],
            [89.85, 25.30],
            [90.45, 25.25],
            [90.80, 25.15],
            [90.95, 24.70],
            [90.70, 24.25],
            [90.20, 24.20],
            [89.70, 24.65],
            [89.60, 25.25],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Sylhet', id: 'DIV-SYL' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [90.95, 25.15],
            [91.60, 25.25],
            [92.40, 25.10],
            [92.50, 24.75],
            [92.20, 24.15],
            [91.65, 23.95],
            [91.20, 24.20],
            [90.95, 24.70],
            [90.95, 25.15],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Dhaka', id: 'DIV-DHA' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.60, 24.20],
            [90.20, 24.20],
            [90.70, 24.25],
            [90.95, 24.10],
            [90.80, 23.50],
            [90.45, 23.20],
            [89.90, 23.25],
            [89.50, 23.70],
            [89.60, 24.20],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Khulna', id: 'DIV-KHU' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [88.65, 23.90],
            [89.20, 23.85],
            [89.50, 23.50],
            [89.85, 23.00],
            [89.85, 21.80],
            [89.25, 21.65],
            [88.95, 22.00],
            [88.60, 22.75],
            [88.65, 23.90],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Barishal', id: 'DIV-BAR' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.85, 23.00],
            [90.45, 23.10],
            [90.85, 22.85],
            [90.80, 21.85],
            [90.35, 21.80],
            [89.85, 21.80],
            [89.85, 23.00],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Chittagong', id: 'DIV-CTG' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [90.80, 23.80],
            [91.35, 23.90],
            [91.95, 23.75],
            [92.35, 23.50],
            [92.65, 22.40],
            [92.35, 21.20],
            [92.15, 20.60],
            [91.75, 21.60],
            [91.25, 22.50],
            [90.65, 22.80],
            [90.80, 23.80],
          ],
        ],
      },
    },
  ],
};

// District name resolver to geographic coordinates
function resolveLocationCoordinates(locStr: string): [number, number] {
  const lower = locStr.toLowerCase();
  if (lower.includes('chittagong') || lower.includes('ctg')) return [91.8365, 22.3569];
  if (lower.includes('patuakhali')) return [90.3299, 22.3596];
  if (lower.includes('galachipa')) return [90.4194, 22.1639];
  if (lower.includes('barishal')) return [90.3535, 22.7010];
  if (lower.includes('bhola')) return [90.6481, 22.6859];
  if (lower.includes('barguna')) return [90.1250, 22.1570];
  if (lower.includes('sylhet')) return [91.8687, 24.8949];
  if (lower.includes('sunamganj')) return [91.3992, 25.0658];
  if (lower.includes('rajshahi')) return [88.6049, 24.3745];
  if (lower.includes('bogura')) return [89.3730, 24.8465];
  if (lower.includes('rangpur')) return [89.2444, 25.7439];
  if (lower.includes('khulna')) return [89.5403, 22.8456];
  if (lower.includes('jashore')) return [89.2167, 23.1667];
  if (lower.includes('mymensingh')) return [90.4073, 24.7471];
  if (lower.includes('cox')) return [92.0165, 21.4272];
  if (lower.includes('cumilla')) return [91.1809, 23.4607];
  // Default to Dhaka coordinates with subtle offset for variation
  if (lower.includes('dhanmondi')) return [90.3750, 23.7500];
  if (lower.includes('uttara')) return [90.3980, 23.8728];
  if (lower.includes('mirpur')) return [90.3654, 23.8041];
  return [90.4125, 23.8103];
}

export const GeospatialIntelligenceMap: React.FC<GeospatialIntelligenceMapProps> = ({
  transactions = [],
  regionalMetrics,
  agents,
  onActivateMonitoring,
  onDispatchLiquidity,
  onOpenInvestigation,
  lang,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // View state
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('COMBINED');
  const [mapTheme, setMapTheme] = useState<MapVisualTheme>('CLEAN_SLATE');
  const [selectedDivision, setSelectedDivision] = useState<string>('Barishal');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCluster>(BANGLADESH_DISTRICT_CLUSTERS[0]);
  const [selectedAgent, setSelectedAgent] = useState<AgentLiquidityNode | null>(agents[0] || null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(transactions[0] || null);

  // Layer Toggles
  const [layerHeatmap, setLayerHeatmap] = useState<boolean>(true);
  const [layerTxnMarkers, setLayerTxnMarkers] = useState<boolean>(true);
  const [layerTxnArcs, setLayerTxnArcs] = useState<boolean>(true);
  const [layerAgents, setLayerAgents] = useState<boolean>(true);
  const [layerDistrictClusters, setLayerDistrictClusters] = useState<boolean>(true);
  const [layerDisruption, setLayerDisruption] = useState<boolean>(true);

  // Hover states for tooltips
  const [hoveredEntity, setHoveredEntity] = useState<{
    title: string;
    subtitle: string;
    type: 'DISTRICT_CLUSTER' | 'AGENT_NODE' | 'TXN_MARKER' | 'DIVISION';
    score: number;
    scoreLabel: string;
    extraData?: Record<string, string | number>;
    x?: number;
    y?: number;
  } | null>(null);

  // Toast feedback on agent dispatch
  const [dispatchToast, setDispatchToast] = useState<{ agentName: string; amount: number } | null>(null);

  const selectedMetric = regionalMetrics.find((m) => m.division === selectedDivision) || regionalMetrics[0];

  // D3 Color Scales - High Precision MFS / Cybersecurity Spectrum
  const getRiskColor = (score: number) => {
    if (mapTheme === 'NAVY_CYBER') {
      const interpolator = d3
        .scaleLinear<string>()
        .domain([0, 30, 60, 80, 100])
        .range(['#06B6D4', '#38BDF8', '#F59E0B', '#F43F5E', '#E11D48']);
      return interpolator(score);
    }
    if (mapTheme === 'OCEAN_BLUE') {
      const interpolator = d3
        .scaleLinear<string>()
        .domain([0, 30, 60, 80, 100])
        .range(['#0EA5E9', '#2563EB', '#F59E0B', '#EF4444', '#B91C1C']);
      return interpolator(score);
    }
    // CLEAN_SLATE: Vivid, rich MFS security spectrum (emerald -> electric sky -> amber -> crimson)
    const interpolator = d3
      .scaleLinear<string>()
      .domain([0, 28, 55, 78, 100])
      .range(['#059669', '#0284C7', '#D97706', '#DC2626', '#991B1B']);
    return interpolator(score);
  };

  const getDensityColor = (score: number) => {
    const interpolator = d3
      .scaleLinear<string>()
      .domain([0, 40, 70, 100])
      .range(['#0284C7', '#6366F1', '#8B5CF6', '#EC4899']);
    return interpolator(score);
  };

  // Dimensions & Projection
  const width = 680;
  const height = 660;

  const projection = useMemo(() => {
    return d3
      .geoMercator()
      .center([90.45, 23.75])
      .scale(4450)
      .translate([width / 2 - 12, height / 2 + 10]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Setup D3 Zoom
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.85, 4.0])
      .on('zoom', (event) => {
        svg.select('.map-zoom-group').attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
  }, []);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.35);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.74);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  // Handle Liquidity Dispatch with visual feedback
  const handleLocalDispatch = (agent: AgentLiquidityNode) => {
    const amount = agent.shortfallAmount || 200000;
    onDispatchLiquidity(agent.id, agent.name, amount);
    setDispatchToast({ agentName: agent.name, amount });
    setTimeout(() => setDispatchToast(null), 3500);
  };

  // Map transaction flows between locations
  const transactionFlows = useMemo(() => {
    return transactions.map((txn) => {
      const senderCoords = resolveLocationCoordinates(txn.senderLocation);
      const receiverCoords = resolveLocationCoordinates(txn.receiverLocation);
      const senderScreen = projection(senderCoords) || [0, 0];
      const receiverScreen = projection(receiverCoords) || [0, 0];

      // Calculate curved control point for aesthetic quadratic Bezier curve
      const dx = receiverScreen[0] - senderScreen[0];
      const dy = receiverScreen[1] - senderScreen[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curveFactor = Math.min(dist * 0.28, 45);
      // Perpendicular offset
      const mx = (senderScreen[0] + receiverScreen[0]) / 2 - (dy / (dist || 1)) * curveFactor;
      const my = (senderScreen[1] + receiverScreen[1]) / 2 + (dx / (dist || 1)) * curveFactor;

      const pathString = `M ${senderScreen[0]} ${senderScreen[1]} Q ${mx} ${my} ${receiverScreen[0]} ${receiverScreen[1]}`;

      return {
        transaction: txn,
        senderCoords,
        receiverCoords,
        senderScreen,
        receiverScreen,
        pathString,
        isCritical: txn.riskBand === 'CRITICAL' || txn.fusedRiskScore >= 80,
        isHigh: txn.riskBand === 'HIGH' || (txn.fusedRiskScore >= 60 && txn.fusedRiskScore < 80),
      };
    });
  }, [transactions, projection]);

  return (
    <div className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden font-sans">
      {/* Top Header Command Bar */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0C1222] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#0054A6] dark:text-blue-400 shadow-2xs">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '40s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Geospatial Intelligence & District Heatmap Radar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  D3.js v7 Density Engine
                </span>
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>Barishal-Patuakhali Surge Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Real-time transaction density, cross-district fraud risk clusters, agent cash exhaustion, and cyclone vectors
            </p>
          </div>
        </div>

        {/* Heatmap Mode Selector Segmented Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setHeatmapMode('COMBINED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapMode === 'COMBINED'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Combined</span>
          </button>
          <button
            onClick={() => setHeatmapMode('FRAUD_CLUSTERS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapMode === 'FRAUD_CLUSTERS'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Fraud Risk Clusters</span>
          </button>
          <button
            onClick={() => setHeatmapMode('TXN_DENSITY')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapMode === 'TXN_DENSITY'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>Transaction Density</span>
          </button>
        </div>

        {/* Map Theme / Palette Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase px-1 hidden md:inline">
            Palette:
          </span>
          <button
            onClick={() => setMapTheme('CLEAN_SLATE')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mapTheme === 'CLEAN_SLATE'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Clean Slate MFS Map"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Clean Slate</span>
          </button>
          <button
            onClick={() => setMapTheme('NAVY_CYBER')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mapTheme === 'NAVY_CYBER'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="High-Tech Cyber Navy Cartography"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Cyber Navy</span>
          </button>
          <button
            onClick={() => setMapTheme('OCEAN_BLUE')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mapTheme === 'OCEAN_BLUE'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Oceanic Blue Precision"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ocean Blue</span>
          </button>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setLayerHeatmap(!layerHeatmap)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              layerHeatmap
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/40'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-800'
            }`}
            title="Toggle Geographic Thermal Contours"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Heatmap</span>
          </button>

          <button
            onClick={() => setLayerTxnMarkers(!layerTxnMarkers)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              layerTxnMarkers
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/40'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-800'
            }`}
            title="Toggle Live Transaction Markers & Flow Arcs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Txn Flows</span>
          </button>

          <button
            onClick={() => setLayerAgents(!layerAgents)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              layerAgents
                ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/40'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-800'
            }`}
            title="Toggle Agent Liquidity Nodes"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agents</span>
          </button>

          <button
            onClick={() => setLayerDistrictClusters(!layerDistrictClusters)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              layerDistrictClusters
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/40'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-800'
            }`}
            title="Toggle District Intelligence Hubs"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Districts</span>
          </button>

          <button
            onClick={() => setLayerDisruption(!layerDisruption)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              layerDisruption
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-800'
            }`}
            title="Toggle Climate Vectors"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Climate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: D3 Map (7 cols) + Geographic Telemetry Dossier (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Interactive D3 Geographic Heatmap */}
        <div
          className={`lg:col-span-7 p-4 relative overflow-hidden flex items-center justify-center select-none border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 transition-colors duration-300 ${
            mapTheme === 'NAVY_CYBER'
              ? 'bg-gradient-to-br from-[#060A14] via-[#0B1220] to-[#040810]'
              : mapTheme === 'OCEAN_BLUE'
              ? 'bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] dark:from-[#061426] dark:via-[#0B1D35] dark:to-[#030B14]'
              : 'bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#080D1A]'
          }`}
        >
          {/* Subtle Technical Engineering Blueprint Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                mapTheme === 'NAVY_CYBER'
                  ? 'linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)'
                  : 'linear-gradient(to right, rgba(0, 84, 166, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 84, 166, 0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Compass & Zoom Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
            <div className="p-2 bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-400 flex flex-col items-center shadow-xs">
              <Compass className="w-5 h-5 text-[#0054A6] dark:text-indigo-400 mb-0.5" />
              <span className="font-bold">N</span>
            </div>

            <div className="bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
              <button
                onClick={handleZoomIn}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="h-[1px] bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={handleZoomOut}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="h-[1px] bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={handleResetZoom}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Map View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Stream Telemetry Badge */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono flex items-center gap-2 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Live MFS Geostream:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">22 Districts Synced</span>
          </div>

          {/* Float Dispatch Toast Notification */}
          {dispatchToast && (
            <div className="absolute top-14 left-4 z-30 bg-emerald-950/95 border border-emerald-500/50 backdrop-blur-md text-emerald-200 px-3.5 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Emergency Float Dispatched!</span>
                <span className="text-[11px] text-emerald-300 font-mono">
                  ৳{dispatchToast.amount.toLocaleString()} BDT physical cash float routed to {dispatchToast.agentName}
                </span>
              </div>
            </div>
          )}

          {/* Dynamic Hover Tooltip Overlay */}
          {hoveredEntity && (
            <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700 shadow-2xl text-xs pointer-events-none max-w-xs transition-opacity duration-200">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  {hoveredEntity.type.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] font-mono font-bold text-rose-400">
                  {hoveredEntity.scoreLabel}: {hoveredEntity.score}
                </span>
              </div>
              <div className="font-bold text-white text-sm mt-0.5">{hoveredEntity.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{hoveredEntity.subtitle}</div>
              {hoveredEntity.extraData && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                  {Object.entries(hoveredEntity.extraData).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-500 block uppercase">{k}</span>
                      <span className="text-slate-200 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* D3 SVG Canvas */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full max-h-[620px] cursor-grab active:cursor-grabbing"
          >
            <defs>
              {/* Radial Heat Gradient for Patuakhali / Barishal Mule & Cyclone Cluster */}
              <radialGradient id="heat-patuakhali" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#EF4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>

              {/* Radial Heat Gradient for Chittagong Nocturnal Anomaly Cluster */}
              <radialGradient id="heat-chittagong" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#DC2626" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
              </radialGradient>

              {/* Radial Heat Gradient for Cox's Bazar Velocity Cluster */}
              <radialGradient id="heat-cox" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </radialGradient>

              {/* Radial Heat Gradient for Sylhet Haor Basin Relief Surge */}
              <radialGradient id="heat-sylhet" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </radialGradient>

              {/* Radial Density Gradient for Dhaka Commercial Capital */}
              <radialGradient id="density-dhaka" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#818CF8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>

              {/* Radial Density Gradient for Gazipur RMG Corridor */}
              <radialGradient id="density-gazipur" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
              </radialGradient>

              {/* Radial Density Gradient for Khulna Southwestern Hub */}
              <radialGradient id="density-khulna" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7" />
                <stop offset="55%" stopColor="#06B6D4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </radialGradient>

              {/* Radial Density Gradient for Bogura Northwest Hub */}
              <radialGradient id="density-bogura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </radialGradient>

              {/* Pulse & Glow Filter for Agents and Markers */}
              <filter id="glow-agent" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glow-marker-crit" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Animated Arrow Markers */}
              <marker
                id="arrow-crit"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#EF4444" />
              </marker>
              <marker
                id="arrow-norm"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
              </marker>
            </defs>

            {/* D3 Map Zoom Group */}
            <g className="map-zoom-group">
              {/* 1. Regional Division Choropleth Polygons */}
              {BANGLADESH_DIVISIONS_GEOJSON.features.map((feature: any) => {
                const divName = feature.properties.name;
                const metric: RegionalRiskMetric = regionalMetrics.find((m) => m.division === divName) || {
                  division: divName,
                  riskScore: 20,
                  fraudSignalDelta: 5,
                  scamSignalDelta: 3,
                  liquidityDrainDelta: -2,
                  networkAnomalyDelta: 2,
                  cashOutSurgeDelta: 4,
                  activeDisruption: 'NONE',
                  vulnerableAgentsCount: 0,
                  status: 'STABLE',
                };
                const isSelected = selectedDivision === divName;
                const fillColor = getRiskColor(metric.riskScore);
                const pathD = pathGenerator(feature as any) || '';

                const strokeColor = isSelected
                  ? '#FFFFFF'
                  : mapTheme === 'NAVY_CYBER'
                  ? '#38BDF8'
                  : mapTheme === 'OCEAN_BLUE'
                  ? '#1D4ED8'
                  : '#475569';

                return (
                  <path
                    key={feature.properties.id}
                    d={pathD}
                    fill={fillColor}
                    fillOpacity={isSelected ? 0.88 : mapTheme === 'NAVY_CYBER' ? 0.45 : 0.62}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 2.8 : 1.4}
                    filter={isSelected ? 'url(#glow-marker-crit)' : undefined}
                    className="transition-all duration-200 cursor-pointer hover:fill-opacity-95"
                    onClick={() => {
                      setSelectedDivision(divName);
                      const matchingDistrict = BANGLADESH_DISTRICT_CLUSTERS.find((d) => d.division === divName);
                      if (matchingDistrict) setSelectedDistrict(matchingDistrict);
                    }}
                    onMouseEnter={() =>
                      setHoveredEntity({
                        title: `${divName} Division`,
                        subtitle: `${metric.status.replace(/_/g, ' ')} · ${metric.vulnerableAgentsCount} Depleted Agents`,
                        type: 'DIVISION',
                        score: metric.riskScore,
                        scoreLabel: 'Division Risk',
                        extraData: {
                          'Fraud Delta': `+${metric.fraudSignalDelta}%`,
                          'Cash-out Surge': `+${metric.cashOutSurgeDelta}%`,
                        },
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                  />
                );
              })}

              {/* 2. Geographic Heatmap Overlay (Density, Fraud, or Combined) */}
              {layerHeatmap && (
                <g className="pointer-events-none transition-opacity duration-300">
                  {/* --- FRAUD RISK CLUSTERS --- */}
                  {(heatmapMode === 'FRAUD_CLUSTERS' || heatmapMode === 'COMBINED') && (
                    <>
                      {/* Patuakhali / Galachipa Mule Network #17 High Thermal Contour */}
                      {(() => {
                        const coords = projection([90.35, 22.35]);
                        if (!coords) return null;
                        return (
                          <>
                            <circle
                              cx={coords[0]}
                              cy={coords[1]}
                              r="88"
                              fill="url(#heat-patuakhali)"
                              className="animate-pulse"
                              style={{ animationDuration: '3s' }}
                            />
                            <circle
                              cx={coords[0]}
                              cy={coords[1]}
                              r="50"
                              fill="rgba(239, 68, 68, 0.45)"
                              filter="url(#glow-marker-crit)"
                            />
                          </>
                        );
                      })()}

                      {/* Chittagong Nocturnal Anomaly & IP Hop Contour */}
                      {(() => {
                        const coords = projection([91.83, 22.35]);
                        if (!coords) return null;
                        return (
                          <circle
                            cx={coords[0]}
                            cy={coords[1]}
                            r="68"
                            fill="url(#heat-chittagong)"
                            className="animate-pulse"
                            style={{ animationDuration: '4s' }}
                          />
                        );
                      })()}

                      {/* Cox's Bazar Velocity Spike Contour */}
                      {(() => {
                        const coords = projection([92.01, 21.42]);
                        if (!coords) return null;
                        return (
                          <circle
                            cx={coords[0]}
                            cy={coords[1]}
                            r="55"
                            fill="url(#heat-cox)"
                          />
                        );
                      })()}

                      {/* Sylhet Haor Basin Emergency Strain Contour */}
                      {(() => {
                        const coords = projection([91.86, 24.89]);
                        if (!coords) return null;
                        return (
                          <circle
                            cx={coords[0]}
                            cy={coords[1]}
                            r="62"
                            fill="url(#heat-sylhet)"
                          />
                        );
                      })()}
                    </>
                  )}

                  {/* --- TRANSACTION DENSITY OVERLAYS --- */}
                  {(heatmapMode === 'TXN_DENSITY' || heatmapMode === 'COMBINED') && (
                    <>
                      {/* Dhaka Mega Commercial Transaction Density */}
                      {(() => {
                        const coords = projection([90.4125, 23.8103]);
                        if (!coords) return null;
                        return (
                          <>
                            <circle
                              cx={coords[0]}
                              cy={coords[1]}
                              r="95"
                              fill="url(#density-dhaka)"
                            />
                            <circle
                              cx={coords[0]}
                              cy={coords[1]}
                              r="55"
                              fill="rgba(56, 189, 248, 0.4)"
                            />
                          </>
                        );
                      })()}

                      {/* Gazipur RMG Density Zone */}
                      {(() => {
                        const coords = projection([90.42, 24.00]);
                        if (!coords) return null;
                        return (
                          <circle
                            cx={coords[0]}
                            cy={coords[1]}
                            r="60"
                            fill="url(#density-gazipur)"
                          />
                        );
                      })()}

                      {/* Khulna Southwestern Density Zone */}
                      {(() => {
                        const coords = projection([89.54, 22.84]);
                        if (!coords) return null;
                        return (
                          <circle
                            cx={coords[0]}
                            cy={coords[1]}
                            r="58"
                            fill="url(#density-khulna)"
                          />
                        );
                      })()}

                      {/* Bogura Northern Trade Corridor */}
                      {(() => {
                        const coords = projection([89.37, 24.84]);
                        if (!coords) return null;
                        return (
                          <circle
                            cx={coords[0]}
                            cy={coords[1]}
                            r="52"
                            fill="url(#density-bogura)"
                          />
                        );
                      })()}
                    </>
                  )}
                </g>
              )}

              {/* 3. Climate Vector (Cyclone Track from Bay of Bengal) */}
              {layerDisruption && (
                <g className="pointer-events-none">
                  {/* Cyclone Arc from Bay of Bengal into Barishal & Patuakhali */}
                  <path
                    d="M 330 610 Q 305 510 335 440"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.2"
                    strokeDasharray="7 4"
                    className="animate-pulse"
                  />
                  <path
                    d="M 375 620 Q 355 520 360 455"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  <text
                    x="250"
                    y="550"
                    fill="#FDE68A"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none"
                  >
                    CYCLONE VECTOR (48 km/h · 2.8m Surge)
                  </text>
                </g>
              )}

              {/* 4. Division Text Labels */}
              {BANGLADESH_DIVISIONS_GEOJSON.features.map((feature: any) => {
                const divName = feature.properties.name;
                const isSelected = selectedDivision === divName;
                const metric = regionalMetrics.find((m) => m.division === divName);
                const bounds = pathGenerator.bounds(feature as any);
                const x = (bounds[0][0] + bounds[1][0]) / 2;
                const y = (bounds[0][1] + bounds[1][1]) / 2;

                return (
                  <g key={`lbl-${divName}`} transform={`translate(${x}, ${y})`} className="pointer-events-none select-none">
                    {/* High-Contrast Badge Pill */}
                    <rect
                      x="-34"
                      y="-12"
                      width="68"
                      height="23"
                      rx="6"
                      fill={isSelected ? '#0054A6' : mapTheme === 'NAVY_CYBER' ? '#091122' : '#FFFFFF'}
                      stroke={isSelected ? '#FFFFFF' : mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#CBD5E1'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                      opacity={mapTheme === 'NAVY_CYBER' ? 0.92 : 0.95}
                    />
                    <text
                      textAnchor="middle"
                      y="-1.5"
                      fill={isSelected ? '#FFFFFF' : mapTheme === 'NAVY_CYBER' ? '#FFFFFF' : '#0F172A'}
                      fontSize="9.5"
                      fontWeight="800"
                      className="font-sans"
                    >
                      {divName}
                    </text>
                    {metric && (
                      <text
                        y="7.5"
                        textAnchor="middle"
                        fill={
                          isSelected
                            ? '#FDE047'
                            : metric.riskScore > 65
                            ? '#DC2626'
                            : mapTheme === 'NAVY_CYBER'
                            ? '#38BDF8'
                            : '#0054A6'
                        }
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {metric.riskScore}/100
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 5. Live Transaction Route Flow Arcs */}
              {layerTxnArcs &&
                transactionFlows.map((flow) => {
                  const isSelected = selectedTxn?.id === flow.transaction.id;
                  const strokeColor = flow.isCritical ? '#EF4444' : flow.isHigh ? '#F59E0B' : '#38BDF8';

                  return (
                    <g key={`arc-${flow.transaction.id}`}>
                      {/* Ambient curved path */}
                      <path
                        d={flow.pathString}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 3.5 : flow.isCritical ? 2.5 : 1.5}
                        strokeOpacity={isSelected ? 1.0 : flow.isCritical ? 0.85 : 0.45}
                        strokeDasharray="6 4"
                        className="transition-all duration-300 pointer-events-none"
                        style={{
                          animation: 'dash-flow 1.5s linear infinite',
                        }}
                      />
                    </g>
                  );
                })}

              {/* 6. District Clusters (Centroid Hotspots with Hover-State Animations) */}
              {layerDistrictClusters &&
                BANGLADESH_DISTRICT_CLUSTERS.map((district) => {
                  const coords = projection(district.coordinates);
                  if (!coords) return null;
                  const [cx, cy] = coords;
                  const isSelected = selectedDistrict.id === district.id;
                  const isHighThreat = district.fraudRiskScore >= 75;

                  return (
                    <g
                      key={district.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDistrict(district);
                        setSelectedDivision(district.division);
                      }}
                      onMouseEnter={() =>
                        setHoveredEntity({
                          title: `${district.name} District`,
                          subtitle: `${district.division} Division · ${district.clusterType.replace(/_/g, ' ')}`,
                          type: 'DISTRICT_CLUSTER',
                          score: district.fraudRiskScore,
                          scoreLabel: 'Fraud Risk',
                          extraData: {
                            'Hourly Volume': `৳ ${(district.hourlyVolumeBDT / 1000000).toFixed(1)}M`,
                            'Txn Velocity': `${district.hourlyTxnCount} txns/hr`,
                            'Threat Cluster': district.activeThreatDescription,
                          },
                        })
                      }
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer transition-transform duration-200 ease-out hover:scale-125"
                    >
                      {/* Pulse halo for high threat clusters */}
                      {isHighThreat && (
                        <circle
                          r="14"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1.2"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}

                      {/* District Node Body */}
                      <circle
                        r={isSelected ? 8 : 5}
                        fill={isHighThreat ? '#EF4444' : district.txnDensityScore > 75 ? '#6366F1' : '#0EA5E9'}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        className="transition-all duration-200 drop-shadow"
                      />

                      {/* District Mini Label */}
                      <text
                        y={isSelected ? 16 : 13}
                        textAnchor="middle"
                        fill={mapTheme === 'NAVY_CYBER' ? '#F1F5F9' : '#0F172A'}
                        stroke={mapTheme === 'NAVY_CYBER' ? '#040810' : '#FFFFFF'}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-xs select-none"
                      >
                        {district.name}
                      </text>
                    </g>
                  );
                })}

              {/* 7. Live Transaction Markers (Sender/Receiver nodes with hover-state animations) */}
              {layerTxnMarkers &&
                transactionFlows.map((flow) => {
                  const txn = flow.transaction;
                  const isSelected = selectedTxn?.id === txn.id;
                  const isCrit = flow.isCritical;
                  const markerColor = isCrit ? '#EF4444' : flow.isHigh ? '#F59E0B' : '#10B981';

                  return (
                    <g key={`txns-group-${txn.id}`}>
                      {/* Sender Diamond Marker */}
                      <g
                        transform={`translate(${flow.senderScreen[0]}, ${flow.senderScreen[1]})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxn(txn);
                        }}
                        onMouseEnter={() =>
                          setHoveredEntity({
                            title: `Txn Origin: ${txn.senderName}`,
                            subtitle: `${txn.senderLocation} · ৳${txn.amount.toLocaleString()}`,
                            type: 'TXN_MARKER',
                            score: txn.fusedRiskScore,
                            scoreLabel: 'Fused Risk',
                            extraData: {
                              'Txn ID': txn.id,
                              'Channel': txn.channel,
                              'Recipient': `${txn.receiverName} (${txn.receiverLocation})`,
                            },
                          })
                        }
                        onMouseLeave={() => setHoveredEntity(null)}
                        className="cursor-pointer transition-transform duration-200 ease-out hover:scale-135"
                      >
                        {isCrit && (
                          <circle
                            r="11"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="1.5"
                            opacity="0.7"
                            className="animate-ping"
                          />
                        )}
                        <rect
                          x={-4.5}
                          y={-4.5}
                          width={9}
                          height={9}
                          transform="rotate(45)"
                          fill={markerColor}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 2.2 : 1}
                          filter={isCrit ? 'url(#glow-marker-crit)' : undefined}
                          className="transition-all duration-200"
                        />
                      </g>

                      {/* Recipient Destination Circle Marker */}
                      <g
                        transform={`translate(${flow.receiverScreen[0]}, ${flow.receiverScreen[1]})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxn(txn);
                        }}
                        onMouseEnter={() =>
                          setHoveredEntity({
                            title: `Txn Recipient: ${txn.receiverName}`,
                            subtitle: `${txn.receiverLocation} · ৳${txn.amount.toLocaleString()}`,
                            type: 'TXN_MARKER',
                            score: txn.fusedRiskScore,
                            scoreLabel: 'Fused Risk',
                            extraData: {
                              'Txn ID': txn.id,
                              'Wallet': txn.receiverWallet,
                              'Mule Link': txn.isMuleConnected ? 'Connected (Net #17)' : 'Clean',
                            },
                          })
                        }
                        onMouseLeave={() => setHoveredEntity(null)}
                        className="cursor-pointer transition-transform duration-200 ease-out hover:scale-135"
                      >
                        <circle
                          r={isSelected ? 6.5 : 4.5}
                          fill={markerColor}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 2.2 : 1}
                          className="transition-all duration-200"
                        />
                      </g>
                    </g>
                  );
                })}

              {/* 8. Agent Liquidity Nodes Plotted by Coordinates (Smooth transitions & Hover animations) */}
              {layerAgents &&
                agents.map((agent) => {
                  const coords = projection([agent.lng, agent.lat]);
                  if (!coords) return null;
                  const [cx, cy] = coords;
                  const isSelected = selectedAgent?.id === agent.id;
                  const isDepleted = agent.riskStatus === 'CRITICAL_DEPLETION';

                  return (
                    <g
                      key={agent.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                        setSelectedDivision(agent.division);
                      }}
                      onMouseEnter={() =>
                        setHoveredEntity({
                          title: agent.name,
                          subtitle: `${agent.district} · ${agent.riskStatus.replace(/_/g, ' ')}`,
                          type: 'AGENT_NODE',
                          score: isDepleted ? 88 : agent.riskStatus === 'AT_RISK' ? 65 : 20,
                          scoreLabel: 'Depletion Threat',
                          extraData: {
                            'Cash Float': `৳ ${(agent.currentCashFloat / 1000).toFixed(0)}k`,
                            'Demand Surge': `+${agent.forecastedDemandSurge}%`,
                            'Runway': `${agent.liquidityRunwayHours}h remaining`,
                          },
                        })
                      }
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer transition-transform duration-200 ease-out hover:scale-135"
                    >
                      {/* Multi-ring radar pulse for critical depletion */}
                      {isDepleted && (
                        <>
                          <circle
                            r="15"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="1.5"
                            opacity="0.6"
                            className="animate-ping"
                            style={{ animationDuration: '2s' }}
                          />
                          <circle
                            r="22"
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="1"
                            opacity="0.3"
                            className="animate-ping"
                            style={{ animationDuration: '3s' }}
                          />
                        </>
                      )}

                      {/* Selected Agent Reticle Ring */}
                      {isSelected && (
                        <circle
                          r="11"
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                          className="animate-spin"
                          style={{ animationDuration: '6s' }}
                        />
                      )}

                      {/* Agent Circular Core */}
                      <circle
                        r={isSelected ? 7.5 : 5.5}
                        fill={isDepleted ? '#EF4444' : agent.riskStatus === 'AT_RISK' ? '#F59E0B' : '#10B981'}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2.5 : 1.4}
                        filter="url(#glow-agent)"
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}
            </g>
          </svg>

          {/* Map Color Legend */}
          <div className="absolute bottom-3 right-3 z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-800 dark:text-slate-200 flex flex-col gap-1 shadow-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              {heatmapMode === 'FRAUD_CLUSTERS'
                ? 'Fraud Risk Density'
                : heatmapMode === 'TXN_DENSITY'
                ? 'Transaction Velocity Density'
                : 'Combined Risk & Density'}
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[9px] text-slate-500 dark:text-slate-400">0 Safe</span>
              <div
                className={`w-28 h-2 rounded-full ${
                  heatmapMode === 'FRAUD_CLUSTERS'
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600'
                    : heatmapMode === 'TXN_DENSITY'
                    ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-600'
                    : 'bg-gradient-to-r from-emerald-500 via-sky-500 via-amber-500 to-rose-600'
                }`}
              />
              <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold">100 Peak</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-rose-500 rotate-45 inline-block"></span>
                <span>Txn Flow</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0054A6] dark:bg-indigo-400 inline-block"></span>
                <span>Agent Node</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Geospatial Telemetry Dossier & Agent Dispatch Cockpit (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-50/70 dark:bg-[#0D1322] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[700px] text-slate-900 dark:text-slate-100">
          <div className="space-y-4">
            {/* Division & District Header Dossier */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  DISTRICT CLUSTER: {selectedDistrict.name.toUpperCase()}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  selectedDistrict.fraudRiskScore >= 80
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    : selectedDistrict.fraudRiskScore >= 50
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                {selectedDistrict.clusterType.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Selected District Telemetry Card */}
            <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                    District Fraud Threat
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-500">
                      {selectedDistrict.fraudRiskScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                    Txn Velocity Density
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                    <span className="text-2xl font-black font-mono text-[#0054A6] dark:text-indigo-400">
                      {selectedDistrict.txnDensityScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Threat context description */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs">
                <span className="text-[10px] font-mono text-amber-900 dark:text-amber-400 font-bold block mb-0.5">
                  ACTIVE SYNDICATE/THREAT SIGNAL
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {selectedDistrict.activeThreatDescription}
                </p>
              </div>

              {/* Volume & Flow Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Hourly Volume (BDT)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                    ৳{(selectedDistrict.hourlyVolumeBDT / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] text-slate-500">Real-time throughput</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Fraud Signals</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    {selectedDistrict.fraudAlertsCount} Anomalies
                  </span>
                  <span className="text-[10px] text-slate-500">Above 30d baseline</span>
                </div>
              </div>
            </div>

            {/* Selected Transaction Inspector */}
            {selectedTxn && (
              <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">{selectedTxn.id}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedTxn.riskBand === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : selectedTxn.riskBand === 'HIGH'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    Risk {selectedTxn.fusedRiskScore}/100 ({selectedTxn.riskBand})
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">৳{selectedTxn.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Flow Route:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {selectedTxn.senderLocation} → {selectedTxn.receiverLocation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Mule Association:</span>
                    <span className={selectedTxn.isMuleConnected ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}>
                      {selectedTxn.isMuleConnected ? selectedTxn.muleClusterId || 'Network #17' : 'Clean Peer'}
                    </span>
                  </div>
                </div>

                {onOpenInvestigation && (
                  <button
                    onClick={() => onOpenInvestigation(selectedTxn)}
                    className="w-full mt-1.5 py-2 px-3 bg-[#0054A6] hover:bg-[#004284] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Investigate in Explainable AI Guardian (SHAP)</span>
                  </button>
                )}
              </div>
            )}

            {/* Focused Agent Float Dossier */}
            {selectedAgent && (
              <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0054A6] dark:text-indigo-400" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{selectedAgent.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      selectedAgent.riskStatus === 'CRITICAL_DEPLETION'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : selectedAgent.riskStatus === 'AT_RISK'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {selectedAgent.riskStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Current Cash</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      ৳{(selectedAgent.currentCashFloat / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Demand Surge</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                      +{selectedAgent.forecastedDemandSurge}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">Runway</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                      {selectedAgent.liquidityRunwayHours}h
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleLocalDispatch(selectedAgent)}
                  className="w-full mt-2 py-2 px-3 bg-[#0054A6] hover:bg-[#004284] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dispatch BDT {(selectedAgent.shortfallAmount || 200000).toLocaleString()} Emergency Float</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Zone at Bottom */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={() => onActivateMonitoring(selectedDivision)}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-xs hover:shadow transition-all cursor-pointer border border-rose-700/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Activate Level-3 Proactive Surveillance in {selectedDivision}</span>
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
              <span>BFIU Geofence Stream: Active</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3 h-3" /> Live District GPS Ingestion
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
