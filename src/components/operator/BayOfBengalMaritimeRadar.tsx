import React, { useState, useEffect } from 'react';
import {
  Radar,
  Radio,
  Wind,
  Compass,
  Waves,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Activity,
  Layers,
  MapPin,
  Anchor,
  Thermometer,
  CloudRain,
  Sun,
  Moon,
} from 'lucide-react';
import { RegionalRiskMetric } from '../../types';

interface BayOfBengalMaritimeRadarProps {
  metrics?: RegionalRiskMetric[];
  onActivateMonitoring?: (division: string) => void;
  lang?: 'EN' | 'BN';
}

export const BayOfBengalMaritimeRadar: React.FC<BayOfBengalMaritimeRadarProps> = ({
  metrics = [],
  onActivateMonitoring,
  lang = 'EN',
}) => {
  const isBn = lang === 'BN';

  // Radar interactive states - Default to pristine WHITE theme as requested
  const [radarTheme, setRadarTheme] = useState<'WHITE' | 'NAVY'>('WHITE');
  const [isSweepActive, setIsSweepActive] = useState<boolean>(true);
  const [showRainbands, setShowRainbands] = useState<boolean>(true);
  const [showCoastalAgents, setShowCoastalAgents] = useState<boolean>(true);
  const [showNauticalGrid, setShowNauticalGrid] = useState<boolean>(true);
  const [selectedStation, setSelectedStation] = useState<'KHEPUPARA' | 'COX_BAZAR' | 'COMPOSITE'>('COMPOSITE');
  const [radarBearing, setRadarBearing] = useState<number>(0);
  const [hoveredBlip, setHoveredBlip] = useState<{
    name: string;
    type: string;
    lat: string;
    lon: string;
    status: string;
    metric: string;
  } | null>(null);

  // Smooth rotation angle for Doppler radar sweep
  useEffect(() => {
    if (!isSweepActive) return;
    const interval = setInterval(() => {
      setRadarBearing((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isSweepActive]);

  // Coastal divisions under Bay of Bengal marine threat
  const barishalMetric = metrics.find((m) => m.division === 'Barishal');
  const chittagongMetric = metrics.find((m) => m.division === 'Chittagong');

  const isWhite = radarTheme === 'WHITE';

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 text-slate-900 dark:text-slate-100 space-y-5 relative overflow-hidden transition-colors duration-200">
      {/* Background subtle mesh glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[#0054A6] dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isBn
                  ? 'বঙ্গোপসাগর উপকূলীয় ডপলার আর্লি-ওয়ার্নিং রাডার'
                  : 'Bay of Bengal Maritime Doppler Early-Warning Radar'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-[#0054A6] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0054A6] dark:bg-cyan-400 animate-pulse" />
                <span>BMD S-BAND 10cm COMPOSITE</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>SIGNAL #10 DANGER</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? 'বঙ্গোপসাগরে নিম্নচাপ, ঘূর্ণিঝড় ‘রিমাল’ ট্র্যাকিং, ৩.৪ মিটার জলোচ্ছ্বাস পূর্বাভাস ও উপকূলীয় ২,৪৫০টি এমএফএস এজেন্ট লিকুইডিটি গার্ড'
                : 'Real-time oceanic depression, 3.4m storm surge tracking, and coastal agent liquidity monitoring across 200 Nautical Miles of Bay of Bengal'}
            </p>
          </div>
        </div>

        {/* Radar Station Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Visual Theme Toggle (White / Navy) */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setRadarTheme('WHITE')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                radarTheme === 'WHITE'
                  ? 'bg-white dark:bg-slate-900 text-[#0054A6] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to Clean White Theme"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>White</span>
            </button>
            <button
              type="button"
              onClick={() => setRadarTheme('NAVY')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                radarTheme === 'NAVY'
                  ? 'bg-slate-900 text-cyan-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to Tactical Navy Theme"
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Navy</span>
            </button>
          </div>

          {/* Station Switcher */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setSelectedStation('COMPOSITE')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStation === 'COMPOSITE'
                  ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isBn ? 'কম্পোজিট' : 'Composite'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedStation('KHEPUPARA')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStation === 'KHEPUPARA'
                  ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Khepupara
            </button>
            <button
              type="button"
              onClick={() => setSelectedStation('COX_BAZAR')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStation === 'COX_BAZAR'
                  ? 'bg-[#0054A6] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cox's Bazar
            </button>
          </div>

          {/* Toggle Sweep */}
          <button
            type="button"
            onClick={() => setIsSweepActive(!isSweepActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isSweepActive
                ? 'bg-blue-50 dark:bg-blue-950/80 text-[#0054A6] dark:text-blue-300 border-blue-300 dark:border-blue-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isSweepActive ? (isBn ? 'সুইপ চালু' : 'Sweep ON') : (isBn ? 'সুইপ বন্ধ' : 'Sweep OFF')}</span>
          </button>
        </div>
      </div>

      {/* Live Marine Telemetry Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Wind className="w-3.5 h-3.5 text-rose-500" />
            <span>MAX SUSTAINED WIND</span>
          </div>
          <div className="text-base font-mono font-black text-slate-900 dark:text-white mt-1">68 km/h</div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Gusts to 92 km/h</div>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>STORM SURGE HEIGHT</span>
          </div>
          <div className="text-base font-mono font-black text-[#0054A6] dark:text-cyan-300 mt-1">2.8m – 3.4m</div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">Astronomical High Tide</div>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span>SEA SURFACE TEMP (SST)</span>
          </div>
          <div className="text-base font-mono font-black text-orange-600 dark:text-orange-300 mt-1">29.8°C</div>
          <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono">High Cyclone Fuel</div>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>BAROMETRIC PRESSURE</span>
          </div>
          <div className="text-base font-mono font-black text-sky-700 dark:text-sky-300 mt-1">992 hPa</div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">Deep Depression</div>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>CYCLONE EYE POSITION</span>
          </div>
          <div className="text-base font-mono font-black text-emerald-700 dark:text-emerald-300 mt-1">21.2°N, 90.4°E</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Bay of Bengal North</div>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>COASTAL CASH-OUT RISK</span>
          </div>
          <div className="text-base font-mono font-black text-rose-600 dark:text-rose-400 mt-1">CRITICAL (+48%)</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">৳48.5M Float Deployed</div>
        </div>
      </div>

      {/* Main Radar Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: The Circular Radar Scope (7 cols) */}
        <div
          className={`lg:col-span-7 rounded-2xl border p-3 sm:p-4 relative flex items-center justify-center overflow-hidden min-h-[420px] sm:min-h-[460px] shadow-inner transition-colors duration-200 ${
            isWhite
              ? 'bg-slate-50/70 border-slate-200 text-slate-800'
              : 'bg-[#050D1A] border-cyan-900/60 text-slate-100'
          }`}
        >
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: isWhite
                ? 'radial-gradient(#0054a6 1px, transparent 1px)'
                : 'radial-gradient(#06b6d4 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* SVG Doppler Radar Canvas */}
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full max-w-[460px] max-h-[460px] select-none"
          >
            <defs>
              {/* Radar beam sweep cone gradient */}
              <radialGradient id="radar-beam-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isWhite ? '#0284C7' : '#06B6D4'} stopOpacity="0.85" />
                <stop offset="70%" stopColor={isWhite ? '#0284C7' : '#06B6D4'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isWhite ? '#0284C7' : '#06B6D4'} stopOpacity="0" />
              </radialGradient>

              {/* Conical sweep trail */}
              <linearGradient id="radar-sweep-trail" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isWhite ? '#0054A6' : '#06B6D4'} stopOpacity={isWhite ? 0.35 : 0.45} />
                <stop offset="100%" stopColor={isWhite ? '#0054A6' : '#06B6D4'} stopOpacity="0.0" />
              </linearGradient>

              {/* Rainband reflectivity radial gradients */}
              <radialGradient id="cyclone-rainbands" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#F97316" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#EAB308" stopOpacity="0.5" />
                <stop offset="85%" stopColor="#22C55E" stopOpacity="0.3" />
                <stop offset="100%" stopColor={isWhite ? '#0284C7' : '#06B6D4'} stopOpacity="0.0" />
              </radialGradient>

              <filter id="radar-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Radar Circular Background Mask */}
            <circle
              cx="250"
              cy="250"
              r="235"
              fill={isWhite ? '#FFFFFF' : '#040B16'}
              stroke={isWhite ? '#0284C7' : '#0E7490'}
              strokeWidth="2.5"
            />

            {/* Concentric Nautical Mile Rings (50 NM, 100 NM, 150 NM, 200 NM) */}
            {[
              { r: 60, nm: '50 NM (92 km)' },
              { r: 120, nm: '100 NM (185 km)' },
              { r: 175, nm: '150 NM (278 km)' },
              { r: 230, nm: '200 NM (370 km)' },
            ].map((ring, idx) => (
              <g key={`ring-${idx}`}>
                <circle
                  cx="250"
                  cy="250"
                  r={ring.r}
                  fill="none"
                  stroke={isWhite ? '#0284C7' : '#0E7490'}
                  strokeWidth="1.1"
                  strokeDasharray="4 3"
                  opacity={isWhite ? 0.38 : 0.45}
                />
                {showNauticalGrid && (
                  <text
                    x={255 + ring.r * 0.707}
                    y={245 - ring.r * 0.707}
                    fill={isWhite ? '#0054A6' : '#38BDF8'}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    opacity={isWhite ? 0.75 : 0.6}
                  >
                    {ring.nm}
                  </text>
                )}
              </g>
            ))}

            {/* Azimuth / Bearing Radial Lines (every 45 degrees) */}
            {showNauticalGrid && (
              <>
                <line x1="250" y1="15" x2="250" y2="485" stroke={isWhite ? '#0284C7' : '#0E7490'} strokeWidth="1" strokeDasharray="3 3" opacity={isWhite ? 0.28 : 0.35} />
                <line x1="15" y1="250" x2="485" y2="250" stroke={isWhite ? '#0284C7' : '#0E7490'} strokeWidth="1" strokeDasharray="3 3" opacity={isWhite ? 0.28 : 0.35} />
                <line x1="84" y1="84" x2="416" y2="416" stroke={isWhite ? '#0284C7' : '#0E7490'} strokeWidth="0.8" strokeDasharray="2 4" opacity={isWhite ? 0.22 : 0.25} />
                <line x1="84" y1="416" x2="416" y2="84" stroke={isWhite ? '#0284C7' : '#0E7490'} strokeWidth="0.8" strokeDasharray="2 4" opacity={isWhite ? 0.22 : 0.25} />

                {/* Cardinal Heading Badges */}
                <text x="250" y="28" textAnchor="middle" fill={isWhite ? '#0054A6' : '#38BDF8'} fontSize="8" fontFamily="monospace" fontWeight="bold">000° (N - Delta)</text>
                <text x="470" y="253" textAnchor="end" fill={isWhite ? '#0054A6' : '#38BDF8'} fontSize="8" fontFamily="monospace" fontWeight="bold">090° (E)</text>
                <text x="250" y="475" textAnchor="middle" fill={isWhite ? '#0054A6' : '#38BDF8'} fontSize="8" fontFamily="monospace" fontWeight="bold">180° (S - Open Bay)</text>
                <text x="30" y="253" textAnchor="start" fill={isWhite ? '#0054A6' : '#38BDF8'} fontSize="8" fontFamily="monospace" fontWeight="bold">270° (W)</text>
              </>
            )}

            {/* Geographical Coastline Overlay on Radar Display */}
            {/* Bangladesh Coastal Delta Contour (Sundarbans to Cox's Bazar) */}
            <path
              d="M 60 170 Q 110 175 160 170 T 220 162 Q 250 145 280 148 T 330 170 Q 370 200 400 240 T 430 300 L 440 330"
              fill="none"
              stroke={isWhite ? '#0054A6' : '#38BDF8'}
              strokeWidth="2.4"
              opacity="0.9"
            />
            {/* Coastline land shading */}
            <path
              d="M 60 170 Q 110 175 160 170 T 220 162 Q 250 145 280 148 T 330 170 Q 370 200 400 240 T 430 300 L 440 330 L 480 330 L 480 20 L 20 20 L 20 170 Z"
              fill={isWhite ? 'rgba(0, 84, 166, 0.08)' : 'rgba(14, 116, 144, 0.12)'}
              stroke="none"
            />

            {/* Marine Depth: Swatch of No Ground Submarine Canyon */}
            <ellipse
              cx="170"
              cy="285"
              rx="32"
              ry="16"
              transform="rotate(-40 170 285)"
              fill={isWhite ? 'rgba(2, 132, 199, 0.12)' : 'rgba(2, 132, 199, 0.25)'}
              stroke={isWhite ? '#0284C7' : '#06B6D4'}
              strokeWidth="1.2"
              strokeDasharray="3 2"
              className="cursor-pointer"
              onMouseEnter={() =>
                setHoveredBlip({
                  name: 'Swatch of No Ground',
                  type: 'Submarine Canyon (-1,340m)',
                  lat: '21.2°N',
                  lon: '89.6°E',
                  status: 'Protected Marine Sanctuary',
                  metric: 'Wave swell: 3.8m',
                })
              }
              onMouseLeave={() => setHoveredBlip(null)}
            />
            <text x="170" y="315" textAnchor="middle" fill={isWhite ? '#0054A6' : '#38BDF8'} fontSize="7" fontFamily="monospace" fontWeight="bold" opacity="0.75">
              SWATCH OF NO GROUND
            </text>

            {/* Exclusive Economic Zone (EEZ) Boundary Arc */}
            <path
              d="M 120 180 L 100 410 Q 250 460 400 410 L 440 330"
              fill="none"
              stroke={isWhite ? '#0284C7' : '#06B6D4'}
              strokeWidth="1.3"
              strokeDasharray="6 3 2 3"
              opacity={isWhite ? 0.55 : 0.45}
            />
            <text x="250" y="445" textAnchor="middle" fill={isWhite ? '#0054A6' : '#06B6D4'} fontSize="7" fontFamily="monospace" fontWeight="bold" opacity="0.65" letterSpacing="1">
              BANGLADESH MARITIME BORDER (EEZ / ITLOS)
            </text>

            {/* Key Geographic Islands on Radar */}
            {/* St. Martin's Island */}
            <g
              transform="translate(432, 335)"
              className="cursor-pointer"
              onMouseEnter={() =>
                setHoveredBlip({
                  name: "St. Martin's Island (সেন্ট মার্টিন)",
                  type: 'Coral Atoll & Marine Post',
                  lat: '20.6°N',
                  lon: '92.3°E',
                  status: 'Cyclone Warning Signal 10',
                  metric: 'Agent Cash-Out Surge: +62%',
                })
              }
              onMouseLeave={() => setHoveredBlip(null)}
            >
              <circle cx="0" cy="0" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
              <text x="8" y="3" fill="#059669" fontSize="7" fontFamily="sans-serif" fontWeight="bold">
                St. Martin
              </text>
            </g>

            {/* Kuakata Coastal Station */}
            <g transform="translate(235, 178)">
              <circle cx="0" cy="0" r="3.5" fill={isWhite ? '#0284C7' : '#38BDF8'} />
              <text x="-5" y="-6" textAnchor="end" fill={isWhite ? '#475569' : '#94A3B8'} fontSize="7" fontFamily="sans-serif" fontWeight="bold">
                Kuakata
              </text>
            </g>

            {/* Cox's Bazar Station */}
            <g transform="translate(395, 230)">
              <circle cx="0" cy="0" r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />
              <text x="8" y="2" fill="#D97706" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">
                Cox's Bazar
              </text>
            </g>

            {/* Khepupara Doppler Radar Station Symbol */}
            <g transform="translate(242, 168)">
              <polygon points="0,-7 6,4 -6,4" fill={isWhite ? '#0054A6' : '#06B6D4'} stroke="#FFFFFF" strokeWidth="1.2" />
              <text x="8" y="3" fill={isWhite ? '#0054A6' : '#06B6D4'} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                BMD KHEPUPARA (Radar)
              </text>
            </g>

            {/* Cyclone Remal Weather Radar Reflectivity Echoes in Bay of Bengal */}
            {showRainbands && (
              <g
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredBlip({
                    name: 'Severe Cyclonic Storm "Remal"',
                    type: 'Deep Atmospheric Depression',
                    lat: '21.2°N',
                    lon: '90.4°E',
                    status: 'Tracking North-Northwest towards Galachipa',
                    metric: 'Pressure: 992 hPa · Surge: 3.4m',
                  })
                }
                onMouseLeave={() => setHoveredBlip(null)}
              >
                {/* Outer rainband spiral */}
                <ellipse cx="265" cy="280" rx="90" ry="70" fill="url(#cyclone-rainbands)" opacity="0.65" />
                {/* Inner spiral core */}
                <circle cx="265" cy="280" r="38" fill="#EF4444" opacity="0.8" />
                <circle cx="265" cy="280" r="22" fill="#DC2626" opacity="0.9" />

                {/* Cyclone Eye - Anchored with native SVG pulse preventing displacement */}
                <circle cx="265" cy="280" r="9" fill={isWhite ? '#FFFFFF' : '#0A1628'} stroke="#FDE047" strokeWidth="2.5" />
                <circle cx="265" cy="280" r="10" fill="none" stroke="#EF4444" strokeWidth="1.6" strokeDasharray="4 2">
                  <animate attributeName="r" values="10; 24" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85; 0" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Projected Trajectory Vector towards Barishal / Patuakhali */}
                <path
                  d="M 265 280 Q 255 220 242 168"
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth="2.8"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Trajectory Cone */}
                <polygon points="242,168 238,178 248,176" fill="#FDE047" />

                {/* Text Badge for Storm */}
                <g transform="translate(265, 305)">
                  <rect x="-65" y="-10" width="130" height="20" rx="5" fill="#0F172A" stroke="#EF4444" strokeWidth="1.2" />
                  <text x="0" y="3" textAnchor="middle" fill="#FDE047" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    CYCLONE REMAL (68 km/h)
                  </text>
                </g>
              </g>
            )}

            {/* Coastal MFS Agent Nodes with Live Telemetry - FIXED ANCHORING (NO JUMPING CIRCLES) */}
            {showCoastalAgents && (
              <g>
                {[
                  { cx: 210, cy: 172, label: 'Barguna Hub (320 Agents)', status: 'DEPLETED', risk: 88 },
                  { cx: 245, cy: 165, label: 'Patuakhali Depot (410 Agents)', status: 'ALERT', risk: 79 },
                  { cx: 290, cy: 175, label: 'Bhola Island Depot (290 Agents)', status: 'ALERT', risk: 74 },
                  { cx: 345, cy: 185, label: 'Sandwip Channel (180 Agents)', status: 'MONITORED', risk: 65 },
                  { cx: 395, cy: 235, label: 'Cox\'s Bazar Urban (540 Agents)', status: 'ELEVATED', risk: 71 },
                  { cx: 432, cy: 330, label: 'Teknaf / St. Martin (110 Agents)', status: 'ISOLATED', risk: 92 },
                ].map((node, i) => (
                  <g
                    key={`coastal-agent-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredBlip({
                        name: node.label,
                        type: 'MFS Agent Liquidity Cluster',
                        lat: 'Coastal Delta',
                        lon: 'Bay of Bengal Shore',
                        status: `Post-Surge Stress (${node.status})`,
                        metric: `Risk Score: ${node.risk}/100`,
                      })
                    }
                    onMouseLeave={() => setHoveredBlip(null)}
                  >
                    {/* Solid Core Circle */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="4.5"
                      fill={node.risk >= 85 ? '#EF4444' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                    {/* Native SVG Pulse Ring: 100% Locked to (node.cx, node.cy), completely fixes the moving/displaced red circle bug */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="6"
                      fill="none"
                      stroke={node.risk >= 85 ? '#EF4444' : '#F59E0B'}
                      strokeWidth="1.2"
                    >
                      <animate attributeName="r" values="6; 14" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85; 0" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}
              </g>
            )}

            {/* The 360-Degree Sweeping Doppler Radar Beam */}
            {isSweepActive && (
              <g
                style={{
                  transformOrigin: '250px 250px',
                  transform: `rotate(${radarBearing}deg)`,
                }}
              >
                {/* Leading Beam Line */}
                <line
                  x1="250"
                  y1="250"
                  x2="250"
                  y2="15"
                  stroke={isWhite ? '#0284C7' : '#22D3EE'}
                  strokeWidth="2.5"
                  filter="url(#radar-glow)"
                />
                {/* Phosphor Glow Trailing Sector */}
                <path
                  d="M 250 250 L 250 15 A 235 235 0 0 0 160 38 Z"
                  fill="url(#radar-sweep-trail)"
                  opacity={isWhite ? 0.65 : 0.75}
                />
              </g>
            )}

            {/* Radar Center Hub (Khepupara Base Coordinates) */}
            <circle cx="250" cy="250" r="5" fill={isWhite ? '#0054A6' : '#22D3EE'} stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="1.5" fill={isWhite ? '#FFFFFF' : '#0A1628'} />

            {/* Watermark Label */}
            <text
              x="250"
              y="375"
              textAnchor="middle"
              fill={isWhite ? '#0054A6' : '#38BDF8'}
              fontSize="11"
              fontFamily="sans-serif"
              fontWeight="900"
              letterSpacing="4"
              opacity={isWhite ? 0.18 : 0.35}
            >
              BAY OF BENGAL
            </text>
            <text
              x="250"
              y="390"
              textAnchor="middle"
              fill={isWhite ? '#0284C7' : '#0EA5E9'}
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              letterSpacing="2"
              opacity={isWhite ? 0.15 : 0.3}
            >
              ব ঙ্গো প সা গ র
            </text>
          </svg>

          {/* Interactive Hover Blip Tooltip Overlay */}
          {hoveredBlip && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 border border-slate-300 dark:border-cyan-500/50 p-3 rounded-xl backdrop-blur-md text-xs shadow-xl z-20 animate-fade-in text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-[#0054A6] dark:text-cyan-300 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-[#0054A6] dark:text-cyan-400" />
                  {hoveredBlip.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{hoveredBlip.lat}, {hoveredBlip.lon}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">Entity Classification</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{hoveredBlip.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">Telemetry Metric</span>
                  <span className="text-amber-600 dark:text-amber-300 font-mono font-bold">{hoveredBlip.metric}</span>
                </div>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                ⚠ {hoveredBlip.status}
              </div>
            </div>
          )}
        </div>

        {/* Right: Coastal Action Engine & Maritime Intelligence Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50/90 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          {/* Layer Visibility Controls */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0054A6] dark:text-cyan-400" />
                {isBn ? 'রাডার ট্যাকটিক্যাল লেয়ার' : 'Radar Tactical Layers'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {[showRainbands, showCoastalAgents, showNauticalGrid].filter(Boolean).length} Layers Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <button
                type="button"
                onClick={() => setShowRainbands(!showRainbands)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  showRainbands
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <CloudRain className="w-3.5 h-3.5 text-rose-500" />
                  Cyclone Rainbands
                </span>
                <span className={`w-2 h-2 rounded-full ${showRainbands ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowCoastalAgents(!showCoastalAgents)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  showCoastalAgents
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Coastal MFS Agents
                </span>
                <span className={`w-2 h-2 rounded-full ${showCoastalAgents ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowNauticalGrid(!showNauticalGrid)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer col-span-2 ${
                  showNauticalGrid
                    ? 'bg-blue-50 dark:bg-sky-950/60 border-blue-200 dark:border-sky-800/80 text-[#0054A6] dark:text-sky-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-[#0054A6] dark:text-sky-400" />
                  Nautical Range Rings (50-200 NM) & EEZ Boundary
                </span>
                <span className={`w-2 h-2 rounded-full ${showNauticalGrid ? 'bg-[#0054A6] dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </button>
            </div>
          </div>

          {/* Coastal Division Vulnerability Cards */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              {isBn ? 'উপকূলীয় বিভাগীয় প্রভাব বিশ্লেষণ' : 'Coastal Division Impact Analysis'}
            </span>

            {/* Barishal Coastal Delta */}
            <div className="bg-white dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  Barishal Coastal Delta (Patuakhali, Barguna)
                </span>
                <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                  {barishalMetric?.riskScore ?? 87}/100 RISK
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Direct landfall corridor for Cyclone Remal. Severe storm surge of 3.2m projected in Rabnabad and Baleshwar estuaries.
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#0054A6] dark:text-cyan-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Vulnerable Agents: 720 nodes</span>
                <span>Pre-allocated Float: ৳24.5M</span>
              </div>
            </div>

            {/* Chittagong & Cox's Bazar Marine Rim */}
            <div className="bg-white dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Chittagong Marine Rim & Cox's Bazar Coast
                </span>
                <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                  {chittagongMetric?.riskScore ?? 48}/100 RISK
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                High swells and nocturnal cross-border remittance surges. St. Martin's maritime link temporarily restricted.
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#0054A6] dark:text-cyan-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span>Vulnerable Agents: 650 nodes</span>
                <span>Pre-allocated Float: ৳18.0M</span>
              </div>
            </div>
          </div>

          {/* Action Button: Dispatches Maritime Protection Protocol */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onActivateMonitoring?.('Barishal')}
              className="w-full flex items-center justify-center gap-2 bg-[#0054A6] hover:bg-[#004284] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>
                {isBn
                  ? 'উপকূলীয় জরুরি লিকুইডিটি ও সাইক্লোন প্রটেকশন আর্ম করুন'
                  : 'Arm Coastal Cyclone Buffer & Dispatch Emergency Float'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
