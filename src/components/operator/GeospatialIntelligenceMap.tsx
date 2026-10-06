import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { RegionalRiskMetric, AgentLiquidityNode, Transaction } from '../../types';
import {
  BANGLADESH_DIVISIONS_GEOJSON,
  BANGLADESH_RIVERS,
  DIVISION_LABEL_ANCHORS,
  DISTRICT_LABEL_OFFSETS,
  BANGLADESH_NEIGHBOR_LABELS,
} from '../../data/bangladeshGeoData';
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
  Flame,
  Radio,
  Radar,
  Search,
  Waves,
  Navigation,
  Crosshair,
  Building,
  SlidersHorizontal,
  Moon,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
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
    name: "Cox's Bazar",
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
  if (lower.includes('dhanmondi')) return [90.3750, 23.7500];
  if (lower.includes('uttara')) return [90.3980, 23.8728];
  if (lower.includes('mirpur')) return [90.3654, 23.8041];
  return [90.4125, 23.8103];
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

interface CameraPreset {
  id: string;
  name: string;
  nameBn: string;
  division: string;
  lng: number;
  lat: number;
  scale: number;
  badge?: string;
  badgeBn?: string;
}

const REGION_PRESETS: CameraPreset[] = [
  { id: 'ALL', name: 'All Bangladesh', nameBn: 'সমগ্র বাংলাদেশ', division: 'All', lng: 90.45, lat: 23.75, scale: 1 },
  { id: 'BAR', name: 'Barishal & Coast', nameBn: 'বরিশাল ও উপকূল', division: 'Barishal', lng: 90.35, lat: 22.40, scale: 2.3, badge: 'Mule #17 & Remal', badgeBn: 'মিউল নেটওয়ার্ক ১৭' },
  { id: 'DHA', name: 'Dhaka Metro', nameBn: 'ঢাকা মেট্রো', division: 'Dhaka', lng: 90.41, lat: 23.82, scale: 2.5, badge: 'Commercial Peak', badgeBn: 'সর্বোচ্চ ভলিউম' },
  { id: 'CTG', name: 'Chittagong Port', nameBn: 'চট্টগ্রাম বন্দর', division: 'Chittagong', lng: 91.95, lat: 22.15, scale: 2.1, badge: 'Nocturnal Hops', badgeBn: 'নকটার্নাল অ্যানোমালি' },
  { id: 'SYL', name: 'Sylhet Haor', nameBn: 'সিলেট হাওর', division: 'Sylhet', lng: 91.70, lat: 24.85, scale: 2.2, badge: 'Haor Relief', badgeBn: 'ত্রাণ প্রবাহ' },
  { id: 'KHU', name: 'Khulna & Ports', nameBn: 'খুলনা ও বন্দর', division: 'Khulna', lng: 89.35, lat: 22.95, scale: 2.2, badge: 'Cross-Border', badgeBn: 'স্থলবন্দর' },
  { id: 'RAJ', name: 'Rajshahi & North', nameBn: 'রাজশাহী ও উত্তর', division: 'Rajshahi', lng: 88.90, lat: 24.80, scale: 2.0, badge: 'Agro Corridor', badgeBn: 'কৃষি করিডোর' },
];

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

  // Map transform state for zoom and pan synchronization
  const [mapTransform, setMapTransform] = useState<{ k: number; x: number; y: number }>({ k: 1, x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState<boolean>(false);

  // Active view states
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('COMBINED');
  const [mapTheme, setMapTheme] = useState<MapVisualTheme>('CLEAN_SLATE');
  const [selectedDivision, setSelectedDivision] = useState<string>('Barishal');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCluster>(BANGLADESH_DISTRICT_CLUSTERS[0]);
  const [selectedAgent, setSelectedAgent] = useState<AgentLiquidityNode | null>(agents[0] || null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(transactions[0] || null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clusterTypeFilter, setClusterTypeFilter] = useState<string>('ALL');
  const [dossierTab, setDossierTab] = useState<'DISTRICT' | 'AGENTS' | 'FLOWS'>('DISTRICT');

  // Layer Toggles
  const [layerRadar, setLayerRadar] = useState<boolean>(true);
  const [layerHeatmap, setLayerHeatmap] = useState<boolean>(true);
  const [layerTxnMarkers, setLayerTxnMarkers] = useState<boolean>(true);
  const [layerTxnArcs, setLayerTxnArcs] = useState<boolean>(true);
  const [layerAgents, setLayerAgents] = useState<boolean>(true);
  const [layerDistrictClusters, setLayerDistrictClusters] = useState<boolean>(true);
  const [layerDisruption, setLayerDisruption] = useState<boolean>(true);
  const [layerRivers, setLayerRivers] = useState<boolean>(true);
  const [layerNeighbors, setLayerNeighbors] = useState<boolean>(true);

  // Hover states for dynamic tooltips
  const [hoveredEntity, setHoveredEntity] = useState<{
    title: string;
    subtitle: string;
    type: 'DISTRICT_CLUSTER' | 'AGENT_NODE' | 'TXN_MARKER' | 'DIVISION' | 'RIVER';
    score?: number;
    scoreLabel?: string;
    extraData?: Record<string, string | number>;
    x?: number;
    y?: number;
  } | null>(null);

  // Toast feedback on agent dispatch
  const [dispatchToast, setDispatchToast] = useState<{ agentName: string; amount: number } | null>(null);

  const selectedMetric = regionalMetrics.find((m) => m.division === selectedDivision) || regionalMetrics[0];

  // D3 Color Scales - Cybersecurity / MFS spectrum
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
    // CLEAN_SLATE: MFS security spectrum (emerald -> electric sky -> amber -> crimson)
    const interpolator = d3
      .scaleLinear<string>()
      .domain([0, 28, 55, 78, 100])
      .range(['#059669', '#0284C7', '#D97706', '#DC2626', '#991B1B']);
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

  // River curve generator with Catmull-Rom smoothing
  const riverLineGenerator = useMemo(() => {
    return d3
      .line<[number, number]>()
      .x((d) => projection(d)?.[0] ?? 0)
      .y((d) => projection(d)?.[1] ?? 0)
      .curve(d3.curveCatmullRom.alpha(0.5));
  }, [projection]);

  // Focal center for Regional Early-Warning Radar Sweep
  const radarCenter = useMemo(() => {
    if (selectedDistrict?.coordinates) {
      const coords = projection(selectedDistrict.coordinates);
      if (coords) return { x: coords[0], y: coords[1], name: selectedDistrict.name, division: selectedDistrict.division };
    }
    const defaultCoords = projection([90.3299, 22.3596]);
    return defaultCoords
      ? { x: defaultCoords[0], y: defaultCoords[1], name: 'Patuakhali', division: 'Barishal' }
      : { x: 340, y: 330, name: 'Barishal', division: 'Barishal' };
  }, [selectedDistrict, projection]);

  // Setup D3 Zoom & Drag handling
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.7, 5.0])
      .on('start', () => setIsMapDragging(true))
      .on('zoom', (event) => {
        setMapTransform({
          k: event.transform.k,
          x: event.transform.x,
          y: event.transform.y,
        });
      })
      .on('end', () => setIsMapDragging(false));

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
  }, []);

  const handlePan = (dx: number, dy: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(200)
      .call(zoomBehaviorRef.current.translateBy, dx, dy);
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.35);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.75);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(450)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  // Fly camera to geographic coordinates with target scale
  const flyToCoordinates = (lng: number, lat: number, scale: number = 2.2) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const screenPt = projection([lng, lat]);
    if (!screenPt) return;
    const tx = width / 2 - scale * screenPt[0];
    const ty = height / 2 - scale * screenPt[1];
    d3.select(svgRef.current)
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  };

  const handleSelectRegionPreset = (preset: CameraPreset) => {
    setSelectedDivision(preset.division === 'All' ? 'Barishal' : preset.division);
    if (preset.scale === 1) {
      handleResetZoom();
    } else {
      flyToCoordinates(preset.lng, preset.lat, preset.scale);
    }
  };

  // Handle Liquidity Dispatch
  const handleLocalDispatch = (agent: AgentLiquidityNode) => {
    const amount = agent.shortfallAmount || 200000;
    onDispatchLiquidity(agent.id, agent.name, amount);
    setDispatchToast({ agentName: agent.name, amount });
    setTimeout(() => setDispatchToast(null), 3500);
  };

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return BANGLADESH_DISTRICT_CLUSTERS.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (DISTRICT_BENGALI_NAMES[d.name] || '').includes(searchQuery);
      const matchesType =
        clusterTypeFilter === 'ALL' ||
        (clusterTypeFilter === 'MULE' && d.clusterType === 'MULE_RING') ||
        (clusterTypeFilter === 'SPIKE' && (d.clusterType === 'VELOCITY_SPIKE' || d.clusterType === 'GEO_ANOMALY')) ||
        (clusterTypeFilter === 'PANIC' && d.clusterType === 'PANIC_CASHOUT') ||
        (clusterTypeFilter === 'COMMERCIAL' && d.clusterType === 'COMMERCIAL_HUB');
      return matchesSearch && matchesType;
    });
  }, [searchQuery, clusterTypeFilter]);

  // Select a district and smoothly pan/zoom to it
  const handleSelectDistrict = (district: DistrictCluster) => {
    setSelectedDistrict(district);
    setSelectedDivision(district.division);
    flyToCoordinates(district.coordinates[0], district.coordinates[1], 2.4);
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
      const curveFactor = Math.min(dist * 0.28, 48);
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

  // Related agents in selected division
  const divisionAgents = useMemo(() => {
    return agents.filter((a) => a.division === selectedDivision);
  }, [agents, selectedDivision]);

  // Dynamic Visual Geographic Scale Bar & Zoom Scope HUD calculation
  const geographicScale = useMemo(() => {
    const k = mapTransform.k || 1.0;
    // Real-world calibration: at center latitude 23.75°N, 1° lon ~102 km.
    // In D3 Mercator projection (scale 4450), 1° lon = 77.67 px at 1.0x scale.
    // Base scale ratio = 0.7615 pixels per km at k = 1.0.
    const pxPerKm = 0.7615 * k;

    let km = 100;
    if (k >= 4.0) {
      km = 20;
    } else if (k >= 2.5) {
      km = 30;
    } else if (k >= 1.6) {
      km = 50;
    } else {
      km = 100;
    }

    const barWidth = Math.round(km * pxPerKm);
    const miles = Math.round(km * 0.621371);

    // Geographical scope hierarchy
    let scopeLabel = lang === 'BN' ? 'জাতীয় পরিসর' : 'National Scope';
    let scopeDetail = lang === 'BN' ? 'সমগ্র বাংলাদেশ (৮টি বিভাগ)' : 'All Bangladesh (8 Divisions)';
    if (k >= 2.6) {
      scopeLabel = lang === 'BN' ? 'স্থানীয় ক্লাস্টার' : 'Local Cluster';
      scopeDetail = lang === 'BN' ? 'জেলা ও এজেন্ট ফ্লিট নোড' : 'District & Agent Fleet Nodes';
    } else if (k >= 1.5) {
      scopeLabel = lang === 'BN' ? 'আঞ্চলিক কোরিডোর' : 'Regional Scope';
      scopeDetail = lang === 'BN' ? 'আন্তঃজেলা লেনদেন চ্যানেল' : 'Cross-District Channels';
    }

    return {
      k,
      km,
      miles,
      barWidth: Math.max(48, Math.min(130, barWidth)),
      scopeLabel,
      scopeDetail,
    };
  }, [mapTransform.k, lang]);

  return (
    <div className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-sans">
      {/* Top Header Command Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0C1222] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#0054A6] dark:text-blue-400 shadow-xs">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '45s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                <span>{lang === 'BN' ? 'ভূ-স্থানিক বুদ্ধিমত্তা ও আঞ্চলিক রাডার' : 'Geospatial Intelligence & Regional Radar'}</span>
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>{lang === 'BN' ? 'বরিশাল-পটুয়াখালী সতর্কবার্তা সক্রিয়' : 'Barishal-Patuakhali Surge Active'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {lang === 'BN'
                ? 'রিয়েল-টাইম লেনদেন ঘনত্ব, জেলাভিত্তিক ফ্রড নেটওয়ার্ক, নদী চ্যানেল ও সাইক্লোন ট্র্যাক'
                : 'Real-time transaction density, cross-district fraud rings, waterway corridors & Cyclone trajectory'}
            </p>
          </div>
        </div>

        {/* Heatmap Mode Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs">
          <button
            onClick={() => setHeatmapMode('COMBINED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapMode === 'COMBINED'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'BN' ? 'সম্মিলিত' : 'Combined'}</span>
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
            <span>{lang === 'BN' ? 'ফ্রড ক্লাস্টার' : 'Fraud Rings'}</span>
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
            <span>{lang === 'BN' ? 'লেনদেন ঘনত্ব' : 'Txn Density'}</span>
          </button>
        </div>

        {/* Map Theme Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs">
          <button
            onClick={() => setMapTheme('CLEAN_SLATE')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mapTheme === 'CLEAN_SLATE'
                ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Clean Slate Cartography"
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
            title="Tactical Cyber Navy"
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
            title="Ocean Blue Marine"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ocean Blue</span>
          </button>
        </div>
      </div>

      {/* Camera Region Jump Strip & Search Bar */}
      <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-[#0A0F1D] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        {/* Quick Fly-To Region Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mr-1 shrink-0 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#0054A6] dark:text-indigo-400" />
            {lang === 'BN' ? 'ক্যামেরা অঞ্চল:' : 'Camera Jump:'}
          </span>
          {REGION_PRESETS.map((preset) => {
            const isActive =
              (preset.division === 'All' && mapTransform.k <= 1.05) ||
              (preset.division !== 'All' && selectedDivision === preset.division && mapTransform.k > 1.2);

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectRegionPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#0054A6] text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lang === 'BN' ? preset.nameBn : preset.name}</span>
                {preset.badge && (
                  <span
                    className={`text-[9px] font-mono px-1 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {lang === 'BN' ? preset.badgeBn || preset.badge : preset.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick District Search Box */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'BN' ? 'জেলা খুঁজুন (উদাঃ পটুয়াখালী)...' : 'Find district (e.g. Patuakhali)...'}
              className="pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0054A6] w-48 md:w-56 font-sans shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layer Visibility Toggles Strip */}
      <div className="px-5 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold mr-1">
            {lang === 'BN' ? 'লেয়ার নিয়ন্ত্রণ:' : 'Layers:'}
          </span>
          <button
            onClick={() => setLayerRivers(!layerRivers)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerRivers
                ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
            title="Toggle Padma, Jamuna, Meghna Waterways"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'নদীসমূহ' : 'Waterways'}</span>
          </button>

          <button
            onClick={() => setLayerRadar(!layerRadar)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerRadar
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
            title={lang === 'BN' ? '৩৬০° আঞ্চলিক আর্লি-ওয়ার্নিং রাডার স্ক্যানার' : 'Toggle 360° Regional Early-Warning Radar'}
          >
            <Radar className={`w-3.5 h-3.5 ${layerRadar ? 'text-rose-600 dark:text-rose-400 animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span>{lang === 'BN' ? 'আঞ্চলিক রাডার' : 'Regional Radar'}</span>
          </button>

          <button
            onClick={() => setLayerHeatmap(!layerHeatmap)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerHeatmap
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'হিটম্যাপ' : 'Thermal Heatmap'}</span>
          </button>

          <button
            onClick={() => setLayerTxnArcs(!layerTxnArcs)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerTxnArcs
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'টাকা প্রবাহ আর্ক' : 'Txn Arcs & Particles'}</span>
          </button>

          <button
            onClick={() => setLayerDistrictClusters(!layerDistrictClusters)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerDistrictClusters
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'জেলা কেন্দ্র' : 'Districts (22)'}</span>
          </button>

          <button
            onClick={() => setLayerAgents(!layerAgents)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerAgents
                ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'এজেন্ট ফ্লোট' : 'Agents Fleet'}</span>
          </button>

          <button
            onClick={() => setLayerDisruption(!layerDisruption)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerDisruption
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'ঘূর্ণিঝড়' : 'Cyclone'}</span>
          </button>

          <button
            onClick={() => setLayerNeighbors(!layerNeighbors)}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerNeighbors
                ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/40 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'BN' ? 'সীমান্ত' : 'Borders'}</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Zoom: <strong className="text-slate-900 dark:text-white">{mapTransform.k.toFixed(1)}x</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden sm:inline">Drag to pan · Scroll to zoom</span>
        </div>
      </div>

      {/* Main Grid: D3 Map (7 cols) + Right Dossier Cockpit (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
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
          {/* Engineering Blueprint Grid */}
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

          {/* Compass, Zoom & Pan Micro-HUD Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="p-2 bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 flex flex-col items-center shadow-xs">
              <Compass className="w-5 h-5 text-[#0054A6] dark:text-indigo-400 mb-0.5" />
              <span className="font-extrabold">N</span>
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
                title="Reset Entire Bangladesh View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* D-Pad Micro-Pan Controls */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-1 shadow-xs flex flex-col items-center gap-0.5">
              <button
                onClick={() => handlePan(0, 50)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Pan Up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePan(50, 0)}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Pan Left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold"
                  title="Center"
                >
                  •
                </button>
                <button
                  onClick={() => handlePan(-50, 0)}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Pan Right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => handlePan(0, -50)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Pan Down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Stream Telemetry Badge */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono flex items-center gap-2 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">MFS Telemetry Geostream:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">22 Districts Synced</span>
          </div>

          {/* Regional Radar Active HUD Card */}
          {layerRadar && (
            <div className="absolute top-14 left-4 z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-300/80 dark:border-rose-800/80 shadow-md text-xs font-mono max-w-[240px]">
              <div className="flex items-center justify-between gap-2 border-b border-rose-100 dark:border-rose-900/40 pb-1 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 text-[10.5px]">
                  <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{lang === 'BN' ? 'আঞ্চলিক রাডার ট্র্যাকার' : '360° REGIONAL RADAR'}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              </div>
              <div className="space-y-0.5 text-[9.5px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">{lang === 'BN' ? 'টার্গেট লক:' : 'Target Lock:'}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-300">{radarCenter.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">{lang === 'BN' ? 'রেঞ্জ / স্ক্যান:' : 'Range / Scan:'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">155 km · 10 RPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">{lang === 'BN' ? 'থ্রেট ক্লাস্টার:' : 'Threat Vector:'}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedDistrict.clusterType}</span>
                </div>
              </div>
            </div>
          )}

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
            <div className="absolute bottom-28 left-3 z-20 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700 shadow-2xl text-xs pointer-events-none max-w-xs transition-opacity duration-200">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  {hoveredEntity.type.replace(/_/g, ' ')}
                </span>
                {hoveredEntity.score !== undefined && (
                  <span className="text-[11px] font-mono font-bold text-rose-400">
                    {hoveredEntity.scoreLabel}: {hoveredEntity.score}
                  </span>
                )}
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
            className={`w-full h-full max-h-[660px] ${isMapDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <defs>
              {/* Radial Heat Gradient for Patuakhali / Barishal Mule & Cyclone Cluster */}
              <radialGradient id="heat-patuakhali" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.88" />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#EF4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>

              {/* Radial Heat Gradient for Chittagong Nocturnal Anomaly Cluster */}
              <radialGradient id="heat-chittagong" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.82" />
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

              {/* River Water Glow */}
              <filter id="glow-water" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Pulse & Glow Filter for Agents and Markers */}
              <filter id="glow-agent" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glow-marker-crit" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Oceanic Depth Gradients for Bay of Bengal */}
              <linearGradient id="bay-of-bengal-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity={mapTheme === 'NAVY_CYBER' ? 0.16 : 0.22} />
                <stop offset="35%" stopColor="#0369A1" stopOpacity={mapTheme === 'NAVY_CYBER' ? 0.26 : 0.34} />
                <stop offset="70%" stopColor="#0C4A6E" stopOpacity={mapTheme === 'NAVY_CYBER' ? 0.42 : 0.50} />
                <stop offset="100%" stopColor="#082F49" stopOpacity={mapTheme === 'NAVY_CYBER' ? 0.65 : 0.75} />
              </linearGradient>

              <radialGradient id="swatch-trench-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#0369A1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </radialGradient>

              {/* Ocean Wave Texture Pattern */}
              <pattern id="bay-wave-pattern" width="80" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 12 Q 20 6 40 12 T 80 12 M 0 24 Q 20 18 40 24 T 80 24"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="0.7"
                  strokeOpacity="0.18"
                />
              </pattern>

              {/* Regional Radar Sweep Gradients */}
              <radialGradient id="radar-sweep-cone" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.42" />
                <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* D3 Map Zoom & Pan Group - Fully Transformed by D3 Coordinates */}
            <g
              className="map-zoom-group"
              transform={`translate(${mapTransform.x}, ${mapTransform.y}) scale(${mapTransform.k})`}
            >
              {/* 0. Enhanced Bay of Bengal Oceanic Basin (Full-Bleed Marine Bathymetry & Hydrology) */}
              <g className="pointer-events-none select-none">
                {/* 0.1 Main Full-Width Water Basin conforming to Bangladesh Southern Coastline */}
                <path
                  d="M -40 495 L 138 510 Q 180 518 220 514 T 275 512 Q 310 520 345 508 Q 380 475 415 470 Q 445 480 472 505 Q 492 532 512 562 Q 532 595 550 630 Q 562 655 575 670 L 720 670 L 720 720 L -40 720 Z"
                  fill="url(#bay-of-bengal-grad)"
                />

                {/* 0.2 Oceanic Wave Texture Overlay */}
                <path
                  d="M -40 495 L 138 510 Q 180 518 220 514 T 275 512 Q 310 520 345 508 Q 380 475 415 470 Q 445 480 472 505 Q 492 532 512 562 Q 532 595 550 630 Q 562 655 575 670 L 720 670 L 720 720 L -40 720 Z"
                  fill="url(#bay-wave-pattern)"
                />

                {/* 0.3 Bathymetry Depth Contours (Isobaths) */}
                {/* -20m Inner Continental Shelf */}
                <path
                  d="M -40 528 Q 170 542 265 534 T 370 528 Q 440 525 488 560 T 560 662 L 720 678"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  strokeOpacity="0.4"
                />
                <text x="75" y="525" fill="#38BDF8" fontSize="6.5" fontFamily="monospace" opacity="0.6">-20m Shelf</text>
                <text x="610" y="674" fill="#38BDF8" fontSize="6.5" fontFamily="monospace" opacity="0.6">-20m Isobath</text>

                {/* -50m Mid Continental Shelf */}
                <path
                  d="M -40 560 Q 150 575 250 564 T 385 565 Q 460 580 520 625 T 595 695"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="1.2"
                  strokeDasharray="6 4"
                  strokeOpacity="0.45"
                />
                <text x="65" y="556" fill="#0284C7" fontSize="6.5" fontFamily="monospace" opacity="0.65">-50m Isobath</text>

                {/* -100m Outer Continental Shelf Dropoff */}
                <path
                  d="M -40 600 Q 140 615 250 608 T 405 615 Q 495 645 555 700"
                  fill="none"
                  stroke="#0369A1"
                  strokeWidth="1.2"
                  strokeDasharray="8 5"
                  strokeOpacity="0.45"
                />
                <text x="55" y="596" fill="#0369A1" fontSize="6.5" fontFamily="monospace" opacity="0.65">-100m Shelf Edge</text>

                {/* -200m Deep Continental Slope */}
                <path
                  d="M -40 645 Q 160 658 310 652 T 510 685 L 720 710"
                  fill="none"
                  stroke="#075985"
                  strokeWidth="1.2"
                  strokeDasharray="10 6"
                  strokeOpacity="0.45"
                />
                <text x="45" y="641" fill="#075985" fontSize="6.5" fontFamily="monospace" opacity="0.65">-200m Abyss</text>

                {/* 0.4 Swatch of No Ground (Deep-sea Submarine Canyon Marine Sanctuary) */}
                <g transform="translate(205, 575)">
                  <ellipse cx="0" cy="0" rx="38" ry="18" transform="rotate(-35)" fill="url(#swatch-trench-grad)" stroke="#0284C7" strokeWidth="1.3" strokeDasharray="3 2" />
                  <ellipse cx="0" cy="0" rx="22" ry="10" transform="rotate(-35)" fill="rgba(3, 105, 161, 0.4)" stroke="#38BDF8" strokeWidth="1" />
                  <circle cx="0" cy="0" r="2.5" fill="#38BDF8" />
                  <text x="0" y="24" textAnchor="middle" fill="#38BDF8" fontSize="7" fontFamily="monospace" fontWeight="bold" opacity="0.85">
                    SWATCH OF NO GROUND
                  </text>
                  <text x="0" y="32" textAnchor="middle" fill="#94A3B8" fontSize="6" fontFamily="monospace" opacity="0.75">
                    Submarine Canyon (-1,340m)
                  </text>
                </g>

                {/* 0.5 Bangladesh Exclusive Economic Zone (EEZ / ITLOS Maritime Border) */}
                <path
                  d="M 138 510 L 80 690 M 550 630 L 460 705"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1.4"
                  strokeDasharray="8 4 2 4"
                  strokeOpacity="0.65"
                />
                <text x="95" y="660" transform="rotate(72 95 660)" fill="#38BDF8" fontSize="6.5" fontFamily="monospace" opacity="0.7" letterSpacing="1">
                  BANGLADESH MARITIME BORDER (EEZ / ITLOS)
                </text>

                {/* 0.6 Major International Maritime Navigation Fairways */}
                {/* Chittagong Deep Sea Fairway */}
                <path
                  d="M 430 670 Q 460 610 495 545"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.6"
                />
                <circle cx="430" cy="670" r="2.5" fill="#22D3EE" />
                <circle cx="495" cy="545" r="2.5" fill="#22D3EE" />
                <text x="475" y="610" transform="rotate(-62 475 610)" fill="#22D3EE" fontSize="6" fontFamily="monospace" opacity="0.75">
                  CHITTAGONG SEA APPROACH CHANNEL
                </text>

                {/* Payra / Mongla Deep Sea Channel */}
                <path
                  d="M 300 660 Q 315 590 328 515"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <text x="320" y="595" transform="rotate(-80 320 595)" fill="#38BDF8" fontSize="6" fontFamily="monospace" opacity="0.7">
                  PAYRA / MONGLA FAIRWAY
                </text>

                {/* 0.7 Prominent Coastal Islands & Maritime Features */}
                {/* St. Martin's Island (Coral Atoll) */}
                <g transform="translate(542, 638)">
                  <circle cx="0" cy="0" r="7" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
                  <circle cx="0" cy="0" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
                  <circle cx="2" cy="4" r="1.5" fill="#34D399" />
                  <text x="9" y="3" fill="#10B981" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">
                    St. Martin's Island
                  </text>
                  <text x="9" y="10" fill="#6EE7B7" fontSize="6" fontFamily="sans-serif">
                    (সেন্ট মার্টিন / ছেঁড়া দ্বীপ)
                  </text>
                </g>

                {/* Nijhum Dwip */}
                <g transform="translate(390, 508)">
                  <circle cx="0" cy="0" r="2.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.8" />
                  <text x="5" y="2" fill="#7DD3FC" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">
                    Nijhum Dwip (নিঝুম দ্বীপ)
                  </text>
                </g>

                {/* Kutubdia Island with Lighthouse Symbol */}
                <g transform="translate(480, 558)">
                  <circle cx="0" cy="0" r="2.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="0.8" />
                  <text x="-5" y="2" textAnchor="end" fill="#FDE68A" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">
                    Kutubdia ⛯
                  </text>
                </g>

                {/* Dublar Char in Sundarbans marine edge */}
                <g transform="translate(230, 518)">
                  <circle cx="0" cy="0" r="2" fill="#38BDF8" />
                  <text x="-4" y="8" textAnchor="middle" fill="#BAE6FD" fontSize="6" fontFamily="sans-serif">
                    Dublar Char
                  </text>
                </g>

                {/* 0.8 Nautical Latitude / Longitude Graticule Reference Crosses */}
                <g opacity="0.35" stroke="#38BDF8" strokeWidth="0.8">
                  {/* 21°00'N, 90°00'E */}
                  <line x1="285" y1="585" x2="295" y2="585" />
                  <line x1="290" y1="580" x2="290" y2="590" />
                  <text x="295" y="582" fill="#38BDF8" fontSize="6" fontFamily="monospace" stroke="none">21°N 90°E</text>

                  {/* 21°00'N, 91°00'E */}
                  <line x1="415" y1="585" x2="425" y2="585" />
                  <line x1="420" y1="580" x2="420" y2="590" />
                  <text x="425" y="582" fill="#38BDF8" fontSize="6" fontFamily="monospace" stroke="none">21°N 91°E</text>
                </g>

                {/* 0.9 Animated Ocean Surface Current Drift Wave Streamlines */}
                <g opacity="0.45" stroke="#38BDF8" strokeWidth="1" fill="none">
                  <path d="M 120 620 Q 180 610 240 618 T 360 615" strokeDasharray="8 6" className="animate-pulse" />
                  <path d="M 300 645 Q 360 638 420 644 T 520 640" strokeDasharray="10 8" className="animate-pulse" />
                  <path d="M 180 660 Q 240 652 320 658 T 460 655" strokeDasharray="12 10" />
                </g>

                {/* 0.10 Grand Maritime Typography for BAY OF BENGAL */}
                <g transform="translate(350, 638)">
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#0284C7'}
                    fillOpacity="0.85"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    letterSpacing="6"
                  >
                    B A Y   O F   B E N G A L
                  </text>
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    fill={mapTheme === 'NAVY_CYBER' ? '#7DD3FC' : '#0369A1'}
                    fillOpacity="0.75"
                    fontSize="9.5"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    letterSpacing="3"
                  >
                    ব ঙ্গো প সা গ র
                  </text>
                  <text
                    x="0"
                    y="24"
                    textAnchor="middle"
                    fill={mapTheme === 'NAVY_CYBER' ? '#64748B' : '#94A3B8'}
                    fontSize="6.5"
                    fontFamily="monospace"
                    letterSpacing="1"
                  >
                    NORTHERN MARINE BASIN · DEPTH: 20m TO &gt;2,000m · EEZ: 118,813 km²
                  </text>
                </g>
              </g>

              {/* 0.1 Surrounding Geographic Borders & Labels */}
              {layerNeighbors && (
                <g className="pointer-events-none select-none">
                  {BANGLADESH_NEIGHBOR_LABELS.map((neighbor, idx) => {
                    const pt = projection(neighbor.coordinates);
                    if (!pt) return null;
                    return (
                      <g key={`neighbor-${idx}`} transform={`translate(${pt[0]}, ${pt[1]})`}>
                        <text
                          textAnchor="middle"
                          fill={mapTheme === 'NAVY_CYBER' ? '#475569' : '#94A3B8'}
                          fontSize="8.5"
                          fontFamily="sans-serif"
                          fontWeight="700"
                          letterSpacing="2"
                        >
                          {neighbor.name}
                        </text>
                        {neighbor.sublabel && (
                          <text
                            y="9"
                            textAnchor="middle"
                            fill={mapTheme === 'NAVY_CYBER' ? '#334155' : '#CBD5E1'}
                            fontSize="7"
                            fontFamily="monospace"
                          >
                            {neighbor.sublabel}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

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
                        title: `${lang === 'BN' ? DIVISION_BENGALI_NAMES[divName] || divName : divName} ${lang === 'BN' ? 'বিভাগ' : 'Division'}`,
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

              {/* 1.5 Major Rivers of Bangladesh (Padma, Jamuna, Meghna, Surma, Karnaphuli) */}
              {layerRivers && (
                <g className="pointer-events-none transition-opacity duration-300">
                  {BANGLADESH_RIVERS.map((river) => {
                    const pathD = riverLineGenerator(river.coordinates) || '';
                    const midCoord = river.coordinates[Math.floor(river.coordinates.length / 2)];
                    const labelPt = midCoord ? projection(midCoord) : null;

                    return (
                      <g key={river.name}>
                        {/* River Water Glow / Ambient Channel */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={
                            mapTheme === 'NAVY_CYBER'
                              ? '#0284C7'
                              : mapTheme === 'OCEAN_BLUE'
                              ? '#3B82F6'
                              : '#0284C7'
                          }
                          strokeWidth="4"
                          strokeOpacity={mapTheme === 'NAVY_CYBER' ? 0.35 : 0.28}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Primary River Channel with Animated Water Flow Dash */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={
                            mapTheme === 'NAVY_CYBER'
                              ? '#38BDF8'
                              : mapTheme === 'OCEAN_BLUE'
                              ? '#2563EB'
                              : '#0369A1'
                          }
                          strokeWidth="2.0"
                          strokeOpacity={0.85}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="14 6"
                          className="animate-pulse"
                          style={{ animationDuration: '4s' }}
                        />
                        {/* River Geographic Name Label */}
                        {labelPt && (
                          <text
                            x={labelPt[0]}
                            y={labelPt[1] - 4}
                            fill={mapTheme === 'NAVY_CYBER' ? '#7DD3FC' : '#0369A1'}
                            fillOpacity={0.7}
                            fontSize="7.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fontStyle="italic"
                            textAnchor="middle"
                          >
                            {lang === 'BN' ? river.nameBn : river.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

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

              {/* 2.5 Regional Early-Warning Radar Sweep Layer (360° Azimuth Scan) */}
              {layerRadar && (
                <g className="pointer-events-none select-none">
                  {/* Concentric Range Rings centered on radar target */}
                  {[35, 70, 110, 155].map((radius, idx) => (
                    <g key={radius}>
                      <circle
                        cx={radarCenter.x}
                        cy={radarCenter.y}
                        r={radius}
                        fill="none"
                        stroke={mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#EF4444'}
                        strokeWidth="1.1"
                        strokeDasharray="4 3"
                        strokeOpacity={0.28 + idx * 0.08}
                      />
                      {/* Radar Range Kilometer Annotation */}
                      <text
                        x={radarCenter.x + radius + 3}
                        y={radarCenter.y - 3}
                        fill={mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#EF4444'}
                        fontSize="6"
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity="0.65"
                      >
                        {`${(radius * 1.15).toFixed(0)}km`}
                      </text>
                    </g>
                  ))}

                  {/* Cardinal Radar Crosshairs */}
                  <line
                    x1={radarCenter.x - 165}
                    y1={radarCenter.y}
                    x2={radarCenter.x + 165}
                    y2={radarCenter.y}
                    stroke={mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#EF4444'}
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                    strokeOpacity="0.35"
                  />
                  <line
                    x1={radarCenter.x}
                    y1={radarCenter.y - 165}
                    x2={radarCenter.x}
                    y2={radarCenter.y + 165}
                    stroke={mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#EF4444'}
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                    strokeOpacity="0.35"
                  />

                  {/* 360-Degree Continuous Rotating Radar Beam with trailing sector */}
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${radarCenter.x} ${radarCenter.y}`}
                      to={`360 ${radarCenter.x} ${radarCenter.y}`}
                      dur="6s"
                      repeatCount="indefinite"
                    />
                    {/* 45-degree sweeping radar sector cone */}
                    <path
                      d={`M ${radarCenter.x} ${radarCenter.y} L ${radarCenter.x + 155} ${radarCenter.y} A 155 155 0 0 1 ${radarCenter.x + 155 * 0.707} ${radarCenter.y + 155 * 0.707} Z`}
                      fill="url(#radar-sweep-cone)"
                    />
                    {/* Sharp leading scanner beam line */}
                    <line
                      x1={radarCenter.x}
                      y1={radarCenter.y}
                      x2={radarCenter.x + 155 * 0.707}
                      y2={radarCenter.y + 155 * 0.707}
                      stroke="#EF4444"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      filter="url(#glow-marker-crit)"
                    />
                  </g>

                  {/* Intercepted Target Anomaly Pulse Blip at Radar Center */}
                  <circle
                    cx={radarCenter.x}
                    cy={radarCenter.y}
                    r="4"
                    fill="#EF4444"
                    filter="url(#glow-marker-crit)"
                  />
                  <circle
                    cx={radarCenter.x}
                    cy={radarCenter.y}
                    r="16"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <text
                    x={radarCenter.x}
                    y={radarCenter.y - 12}
                    textAnchor="middle"
                    fill="#EF4444"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    filter="url(#glow-marker-crit)"
                  >
                    RADAR LOCK: {radarCenter.name.toUpperCase()}
                  </text>
                </g>
              )}

              {/* 3. Climate Vector: Cyclone Remal Active Warning (Bay of Bengal to Coastal Delta) */}
              {layerDisruption && (
                <g className="pointer-events-none">
                  {/* Concentric Rotating Cyclone Spiral Wind Bands in Bay of Bengal */}
                  <circle
                    cx="325"
                    cy="580"
                    r="32"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.45)"
                    strokeWidth="1.8"
                    strokeDasharray="8 6"
                    className="animate-spin"
                    style={{ animationDuration: '6s', transformOrigin: '325px 580px' }}
                  />
                  <circle
                    cx="325"
                    cy="580"
                    r="52"
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.3)"
                    strokeWidth="1.2"
                    strokeDasharray="12 8"
                    className="animate-spin"
                    style={{ animationDuration: '10s', transformOrigin: '325px 580px' }}
                  />

                  {/* Cyclone Center Point in Bay of Bengal */}
                  <circle
                    cx="325"
                    cy="580"
                    r="8"
                    fill="#DC2626"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="325"
                    cy="580"
                    r="16"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1.8"
                    opacity="0.75"
                    className="animate-ping"
                  />
                  {/* Projected Cyclone Path towards Patuakhali / Galachipa */}
                  <path
                    d="M 325 580 Q 312 505 338 440"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.2"
                    strokeDasharray="7 4"
                    className="animate-pulse"
                  />
                  <path
                    d="M 355 595 Q 348 518 360 455"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.2"
                    strokeDasharray="5 3"
                  />
                  {/* Sleek Cyclone Alert Pill Badge (Positioned neatly adjacent to eye, never covering Bay of Bengal text) */}
                  <g transform="translate(345, 568)">
                    <rect
                      x="0"
                      y="-11"
                      width="180"
                      height="22"
                      rx="6"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#EF4444"
                      strokeWidth="1.2"
                      className="shadow-xl"
                    />
                    <circle cx="12" cy="0" r="3.5" fill="#EF4444" className="animate-ping" />
                    <circle cx="12" cy="0" r="3.5" fill="#EF4444" />
                    <text
                      x="96"
                      y="3.5"
                      textAnchor="middle"
                      fill="#FDE047"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      CYCLONE: 48km/h · 2.8m SURGE
                    </text>
                  </g>
                </g>
              )}

              {/* 4. Division Text Badges (Positioned accurately using DIVISION_LABEL_ANCHORS) */}
              {BANGLADESH_DIVISIONS_GEOJSON.features.map((feature: any) => {
                const divName = feature.properties.name;
                const isSelected = selectedDivision === divName;
                const metric = regionalMetrics.find((m) => m.division === divName);
                
                // Use anchor coordinates from DIVISION_LABEL_ANCHORS
                const anchorCoords = DIVISION_LABEL_ANCHORS[divName];
                const screenPos = anchorCoords ? projection(anchorCoords) : null;
                const bounds = pathGenerator.bounds(feature as any);
                const x = screenPos ? screenPos[0] : (bounds[0][0] + bounds[1][0]) / 2;
                const y = screenPos ? screenPos[1] : (bounds[0][1] + bounds[1][1]) / 2;

                const displayName = lang === 'BN' ? DIVISION_BENGALI_NAMES[divName] || divName : divName;

                return (
                  <g
                    key={`lbl-${divName}`}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer select-none"
                    onClick={() => {
                      setSelectedDivision(divName);
                      const matchingDistrict = BANGLADESH_DISTRICT_CLUSTERS.find((d) => d.division === divName);
                      if (matchingDistrict) setSelectedDistrict(matchingDistrict);
                    }}
                  >
                    <rect
                      x="-36"
                      y="-13"
                      width="72"
                      height="26"
                      rx="7"
                      fill={isSelected ? '#0054A6' : mapTheme === 'NAVY_CYBER' ? '#091122' : '#FFFFFF'}
                      stroke={isSelected ? '#FFFFFF' : mapTheme === 'NAVY_CYBER' ? '#38BDF8' : '#CBD5E1'}
                      strokeWidth={isSelected ? '2' : '1'}
                      opacity={mapTheme === 'NAVY_CYBER' ? 0.95 : 0.96}
                      className="transition-all duration-200"
                    />
                    <text
                      textAnchor="middle"
                      y="-1"
                      fill={isSelected ? '#FFFFFF' : mapTheme === 'NAVY_CYBER' ? '#FFFFFF' : '#0F172A'}
                      fontSize="9.5"
                      fontWeight="800"
                      className="font-sans"
                    >
                      {displayName}
                    </text>
                    {metric && (
                      <text
                        y="8.5"
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

              {/* 5. Live Transaction Route Flow Arcs with Traveling Particles */}
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
                      />

                      {/* Traveling Money Flow Particle */}
                      <circle
                        r={isSelected ? 4.5 : flow.isCritical ? 3.5 : 2.5}
                        fill={strokeColor}
                        filter={flow.isCritical ? 'url(#glow-marker-crit)' : undefined}
                        className="pointer-events-none"
                      >
                        <animateMotion
                          path={flow.pathString}
                          dur={flow.isCritical ? '2s' : '3.2s'}
                          repeatCount="indefinite"
                          rotate="auto"
                        />
                      </circle>
                    </g>
                  );
                })}

              {/* 6. District Clusters (Centroid Hotspots with Hover-State & Offsets) */}
              {layerDistrictClusters &&
                filteredDistricts.map((district) => {
                  const coords = projection(district.coordinates);
                  if (!coords) return null;
                  const [cx, cy] = coords;
                  const isSelected = selectedDistrict.id === district.id;
                  const isHighThreat = district.fraudRiskScore >= 75;
                  const offset = DISTRICT_LABEL_OFFSETS[district.id] || { dx: 0, dy: 13, textAnchor: 'middle' };
                  const displayName = lang === 'BN' ? DISTRICT_BENGALI_NAMES[district.name] || district.name : district.name;

                  return (
                    <g
                      key={district.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDistrict(district);
                      }}
                      onMouseEnter={() =>
                        setHoveredEntity({
                          title: `${displayName} ${lang === 'BN' ? 'জেলা' : 'District'}`,
                          subtitle: `${district.division} · ${district.clusterType.replace(/_/g, ' ')}`,
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
                          r="15"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1.4"
                          opacity="0.65"
                          className="animate-pulse"
                        />
                      )}

                      {/* District Node Body */}
                      <circle
                        r={isSelected ? 8.5 : 5.5}
                        fill={isHighThreat ? '#EF4444' : district.txnDensityScore > 75 ? '#6366F1' : '#0EA5E9'}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        className="transition-all duration-200 drop-shadow-sm"
                      />

                      {/* District Name Label with Collision-Preventing Offset */}
                      <text
                        x={offset.dx}
                        y={offset.dy}
                        textAnchor={offset.textAnchor}
                        fill={mapTheme === 'NAVY_CYBER' ? '#F1F5F9' : '#0F172A'}
                        stroke={mapTheme === 'NAVY_CYBER' ? '#040810' : '#FFFFFF'}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        fontSize="8.5"
                        fontFamily="sans-serif"
                        fontWeight="700"
                        className="pointer-events-none drop-shadow-xs select-none"
                      >
                        {displayName}
                      </text>
                    </g>
                  );
                })}

              {/* 7. Live Transaction Origin / Destination Markers */}
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
                            title: `Origin: ${txn.senderName}`,
                            subtitle: `${txn.senderLocation} · ৳${txn.amount.toLocaleString()}`,
                            type: 'TXN_MARKER',
                            score: txn.fusedRiskScore,
                            scoreLabel: 'Fused Risk',
                            extraData: {
                              'Txn ID': txn.id,
                              Channel: txn.channel,
                              Recipient: `${txn.receiverName} (${txn.receiverLocation})`,
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
                            className="animate-pulse"
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
                            title: `Recipient: ${txn.receiverName}`,
                            subtitle: `${txn.receiverLocation} · ৳${txn.amount.toLocaleString()}`,
                            type: 'TXN_MARKER',
                            score: txn.fusedRiskScore,
                            scoreLabel: 'Fused Risk',
                            extraData: {
                              'Txn ID': txn.id,
                              Wallet: txn.receiverWallet,
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

              {/* 8. Agent Liquidity Fleet Plotted by Coordinates */}
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
                            Runway: `${agent.liquidityRunwayHours}h remaining`,
                          },
                        })
                      }
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer transition-transform duration-200 ease-out hover:scale-135"
                    >
                      {/* Radar pulse for critical agent depletion */}
                      {isDepleted && (
                        <>
                          <circle
                            r="15"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="1.5"
                            opacity="0.6"
                            className="animate-pulse"
                            style={{ animationDuration: '2s' }}
                          />
                          <circle
                            r="22"
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="1"
                            opacity="0.3"
                            className="animate-pulse"
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
                ? 'Fraud Risk Spectrum'
                : heatmapMode === 'TXN_DENSITY'
                ? 'Transaction Velocity Spectrum'
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
                <span>Agent Fleet</span>
              </span>
            </div>
          </div>

          {/* Visual Geographic Scale & Zoom Level HUD Indicator */}
          <div className="absolute bottom-3 left-3 z-10 select-none">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-800 dark:text-slate-200 flex flex-col gap-1.5 shadow-xs min-w-[155px]">
              {/* Scope Title & Zoom Multiplier Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0054A6] dark:bg-indigo-400"></span>
                  <span className="text-[10.5px] tracking-tight">{geographicScale.scopeLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title={lang === 'BN' ? '১.০x জুমে রিসেট করুন' : 'Click to reset to 1.0x full view'}
                  className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900/70 text-[#0054A6] dark:text-blue-300 font-mono font-extrabold text-[9.5px] border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{mapTransform.k.toFixed(1)}x</span>
                </button>
              </div>

              {/* Graphic Scale Ruler Bar with Distance Indicators */}
              <div className="flex flex-col gap-1 font-mono pt-0.5">
                <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                  <span>0</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {geographicScale.km} {lang === 'BN' ? 'কিমি' : 'km'}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500">
                    ({geographicScale.miles} {lang === 'BN' ? 'মাইল' : 'mi'})
                  </span>
                </div>
                {/* Physical Calibration Scale Bar */}
                <div
                  className="h-1.5 relative border-b-2 border-l-2 border-r-2 border-slate-700 dark:border-slate-300 rounded-b-[1px] transition-all duration-200"
                  style={{ width: `${geographicScale.barWidth}px` }}
                >
                  {/* Half-distance center tick */}
                  <div className="absolute left-1/2 bottom-0 w-[1px] h-1 bg-slate-500 dark:bg-slate-400" />
                </div>
              </div>

              {/* Scope Subtitle Description */}
              <span className="text-[8.5px] text-slate-400 dark:text-slate-500 leading-tight">
                {geographicScale.scopeDetail}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Geospatial Telemetry Dossier & Agent Dispatch Cockpit (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-50/70 dark:bg-[#0D1322] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[700px] text-slate-900 dark:text-slate-100">
          <div className="space-y-4">
            {/* Dossier Tabs: District Intel | Agent Fleet | Transaction Flows */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setDossierTab('DISTRICT')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    dossierTab === 'DISTRICT'
                      ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'BN' ? 'জেলা তথ্য' : 'District Intel'}
                </button>
                <button
                  onClick={() => setDossierTab('AGENTS')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    dossierTab === 'AGENTS'
                      ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{lang === 'BN' ? 'এজেন্ট ফ্লিট' : 'Agent Fleet'}</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {divisionAgents.length}
                  </span>
                </button>
                <button
                  onClick={() => setDossierTab('FLOWS')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    dossierTab === 'FLOWS'
                      ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{lang === 'BN' ? 'লেনদেন প্রবাহ' : 'Live Flows'}</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {transactions.length}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
                  {selectedDistrict.name}
                </span>
              </div>
            </div>

            {/* TAB 1: DISTRICT INTEL VIEW */}
            {dossierTab === 'DISTRICT' && (
              <div className="space-y-3">
                {/* District Header Card */}
                <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {lang === 'BN'
                            ? DISTRICT_BENGALI_NAMES[selectedDistrict.name] || selectedDistrict.name
                            : selectedDistrict.name}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">({selectedDistrict.division})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        GPS: {selectedDistrict.coordinates[0].toFixed(3)}°E, {selectedDistrict.coordinates[1].toFixed(3)}°N
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
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

                  {/* Threat Context Description */}
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs">
                    <span className="text-[10px] font-mono text-amber-900 dark:text-amber-400 font-bold block mb-1">
                      ACTIVE SYNDICATE & THREAT SIGNAL
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                      {selectedDistrict.activeThreatDescription}
                    </p>
                  </div>

                  {/* Risk & Velocity Gauge Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">
                        Fraud Threat Score
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-rose-600 dark:text-rose-500">
                          {selectedDistrict.fraudRiskScore}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 block">
                        {selectedDistrict.fraudAlertsCount} Anomalies active
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">
                        Txn Velocity Score
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-[#0054A6] dark:text-indigo-400">
                          {selectedDistrict.txnDensityScore}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
                        {selectedDistrict.hourlyTxnCount} txns/hr
                      </span>
                    </div>
                  </div>

                  {/* Hourly Volume */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">
                        Hourly Volume (BDT)
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                        ৳{(selectedDistrict.hourlyVolumeBDT / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setLayerRadar(true);
                          flyToCoordinates(selectedDistrict.coordinates[0], selectedDistrict.coordinates[1], 2.4);
                        }}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title={lang === 'BN' ? 'এই জেলায় রাডার ফোকাস ও লক করুন' : 'Lock 360° Regional Radar on this district'}
                      >
                        <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '5s' }} />
                        <span>{lang === 'BN' ? 'রাডার লক' : 'Radar Lock'}</span>
                      </button>
                      {mapTransform.k > 1.35 ? (
                        <button
                          onClick={handleResetZoom}
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title={lang === 'BN' ? 'সমগ্র বাংলাদেশ ভিউতে ফিরে যান' : 'Zoom out to entire Bangladesh view'}
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                          <span>{lang === 'BN' ? 'জুম আউট' : 'Zoom Out'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => flyToCoordinates(selectedDistrict.coordinates[0], selectedDistrict.coordinates[1], 2.8)}
                          className="px-2.5 py-1.5 bg-[#0054A6] hover:bg-[#004284] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title={lang === 'BN' ? 'এই জেলাটি জুম করুন' : 'Zoom in to this district'}
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>{lang === 'BN' ? 'জুম ইন' : 'Zoom In'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick District Switcher Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold block px-1">
                    {lang === 'BN' ? 'দ্রুত জেলা নির্বাচন (২২টি জেলা):' : 'Key Monitored Districts (Click to Fly):'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {filteredDistricts.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDistrict(d)}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex items-center justify-between ${
                          selectedDistrict.id === d.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate pr-1">
                          <span className="text-xs font-bold block text-slate-900 dark:text-white truncate">
                            {lang === 'BN' ? DISTRICT_BENGALI_NAMES[d.name] || d.name : d.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.division}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            d.fraudRiskScore >= 75
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {d.fraudRiskScore}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AGENT LIQUIDITY FLEET */}
            {dossierTab === 'AGENTS' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{divisionAgents.length} Agents in {selectedDivision} Division</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                    {divisionAgents.filter((a) => a.riskStatus === 'CRITICAL_DEPLETION').length} Depleted
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {divisionAgents.map((agent) => {
                    const isSelected = selectedAgent?.id === agent.id;
                    const isCrit = agent.riskStatus === 'CRITICAL_DEPLETION';

                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#0054A6] dark:text-indigo-400 shrink-0" />
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                {agent.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{agent.district}</span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isCrit
                                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {agent.riskStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Cash Float</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                              ৳{(agent.currentCashFloat / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block">Demand Surge</span>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                              +{agent.forecastedDemandSurge}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block">Runway</span>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                              {agent.liquidityRunwayHours}h
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocalDispatch(agent);
                          }}
                          className="w-full py-1.5 px-3 bg-[#0054A6] hover:bg-[#004284] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-300" />
                          <span>Dispatch ৳{(agent.shortfallAmount || 200000).toLocaleString()} Emergency Float</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: LIVE CROSS-DISTRICT FLOWS */}
            {dossierTab === 'FLOWS' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>Showing active cross-district MFS routes</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {transactions.slice(0, 8).map((txn) => {
                    const isSelected = selectedTxn?.id === txn.id;
                    const isCrit = txn.riskBand === 'CRITICAL' || txn.fusedRiskScore >= 80;

                    return (
                      <div
                        key={txn.id}
                        onClick={() => setSelectedTxn(txn)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                              {txn.id}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              isCrit
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            Risk {txn.fusedRiskScore}/100
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 truncate max-w-[180px]">
                            {txn.senderLocation} → {txn.receiverLocation}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            ৳{txn.amount.toLocaleString()}
                          </span>
                        </div>

                        {onOpenInvestigation && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenInvestigation(txn);
                            }}
                            className="w-full mt-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#0054A6] hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inspect in SHAP Guardian</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
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
              <span>
                {lang === 'BN'
                  ? `${DIVISION_BENGALI_NAMES[selectedDivision] || selectedDivision} বিভাগে লেভেল-৩ নিরাপত্তা নজরদারি সক্রিয় করুন`
                  : `Activate Level-3 Proactive Surveillance in ${selectedDivision}`}
              </span>
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
