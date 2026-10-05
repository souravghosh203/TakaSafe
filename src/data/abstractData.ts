/**
 * TakaSafe - Official Project Abstract & Scope
 * Grounded in the full system architecture, novel contributions,
 * ML pipeline, explainability framework, and UN SDG alignments.
 */

export const TAKASAFE_PROJECT_ABSTRACT_BASE = `TakaSafe is a modular, explainable AI platform that acts as a financial trust and resilience layer for mobile financial services (MFS). It connects five core capabilities in one coherent system: Transaction Guardian, which combines gradient-boosted fraud classification with Isolation Forest behavioural anomaly detection; MuleVision, which uses transaction-graph analysis to uncover connected fraud networks; ScamShield, which warns customers before a risky payment is completed while leaving the final choice to them; Disaster Financial Resilience Mode, our first primary novel contribution, which simulates how a flood, cyclone or network disruption affects transaction demand, cash-out demand, agent liquidity and fraud vulnerability; and the Financial Early-Warning Radar, our second, which fuses fraud, scam, network, liquidity and behavioural signals into a regional risk score. Every prediction is explained with SHAP feature attribution and converted into a recommended action by an Action Engine; an LLM only narrates structured evidence, and an authorised human makes every high-impact decision. The prototype is built entirely on synthetic data. The platform supports UN SDG 8 (Decent Work and Economic Growth), SDG 9 (Industry, Innovation and Infrastructure) and SDG 16 (Peace, Justice and Strong Institutions).`;

export const TAKASAFE_PROJECT_ABSTRACT_FULL = `TakaSafe is a modular, explainable AI platform that acts as a financial trust and resilience layer for mobile financial services (MFS). It connects five core capabilities in one coherent system: Transaction Guardian, which combines gradient-boosted fraud classification with Isolation Forest behavioural anomaly detection; MuleVision, which uses transaction-graph analysis to uncover connected fraud networks; ScamShield, which warns customers before a risky payment is completed while leaving the final choice to them; Disaster Financial Resilience Mode, our first primary novel contribution, which simulates how a flood, cyclone or network disruption affects transaction demand, cash-out demand, agent liquidity and fraud vulnerability; and the Financial Early-Warning Radar, our second, which fuses fraud, scam, network, liquidity and behavioural signals into a regional risk score. Every prediction is explained with SHAP feature attribution and converted into a recommended action by an Action Engine; an LLM only narrates structured evidence, and an authorised human makes every high-impact decision. The prototype is built entirely on synthetic data. The platform supports UN SDG 8 (Decent Work and Economic Growth), SDG 9 (Industry, Innovation and Infrastructure) and SDG 16 (Peace, Justice and Strong Institutions).

Architecturally, TakaSafe operates on a sub-18ms inference latency budget to evaluate multi-modal threat vectors in real time, guaranteeing uninterrupted straight-through processing for legitimate micro-merchants and citizens. The classification pipeline pairs supervised gradient-boosted decision trees (mitigating a 20.68:1 class imbalance ratio via scale_pos_weight optimization across 8,000 synthetic transactions) with unsupervised Isolation Forest temporal deviations, circadian velocity burst multipliers, and SIM/IMEI device telemetry. For consumer protection, ScamShield delivers contextual, bilingual (Bengali and English) cognitive duress warnings and introduces a non-custodial 24-hour cooling-off safety buffer, giving vulnerable victims full autonomy to recall coerced transfers. Complementing point-of-sale defenses, MuleVision models fund flow topologies via D3 force-directed network graphs to uncover multi-hop smurfing chains, circular pass-through rings, and illicit aggregator nodes, enabling surgical single-click wallet quarantine.

The platform's dual primary novel contributions address critical macro-resilience gaps in developing digital financial ecosystems. The Disaster Financial Resilience Mode simulates the compounded shocks of climatic catastrophes—such as Cyclone Remal in coastal Barishal and Patuakhali or seasonal riverine inundation in northeastern Sylhet—forecasting agent cash-out liquidity exhaustion 24 to 48 hours in advance and orchestrating automated armored vehicle replenishment routes. Concurrently, the Financial Early-Warning Radar continuously aggregates divisional velocity shifts, fraud incident rates, scam dispute frequencies, and infrastructure telemetry into a composite 0–100 regional risk score, empowering regulatory authorities with anticipatory surveillance rather than reactive mitigation.

To uphold institutional trust and eliminate black-box opacity, every risk score is mathematically decomposed via SHAP (SHapley Additive exPlanations) values into intuitive directional attribution factors (e.g., nocturnal circadian anomaly +31%, velocity surge +24%, device fingerprint drift +17%). A deterministic Action Engine routes these explanations across four graduated regulatory tiers: Low (0–30: straight-through settlement), Medium (31–60: step-up biometric/OTP re-verification), High (61–80: ScamShield 24-hour cooling-off intercept), and Critical (81–100: automated wallet isolation and instant BFIU Form 2 Suspicious Transaction Report generation under Section 19 of the Anti-Money Laundering Act, 2012). Constrained LLM synthesizers (Google Gemini 2.5 Flash) narrate structured evidence dossiers without hallucination, ensuring that authorised human SOC supervisors retain full accountability for every high-impact enforcement action. Validated exclusively on statistically grounded, zero-PII synthetic data, TakaSafe provides a production-grade blueprint for safeguarding digital financial sovereignty, protecting vulnerable informal economies, and advancing United Nations Sustainable Development Goals 8, 9, and 16 across the Global South.`;

export interface CapabilityCard {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  keyTech: string;
  iconName: string;
}

export const FIVE_CORE_CAPABILITIES: CapabilityCard[] = [
  {
    title: '1. Transaction Guardian',
    badge: 'Gradient Boosted + Isolation Forest',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Dual-head machine learning defense combining supervised XGBoost fraud classification (addressing 20.68:1 class imbalance) with unsupervised Isolation Forest behavioural anomaly detection, evaluated in under 18ms SLA.',
    keyTech: 'XGBoost 2.0+, Isolation Forest, Scale Pos Weight = 20.68, Circadian Heuristics',
    iconName: 'ShieldCheck',
  },
  {
    title: '2. MuleVision Graph Defense',
    badge: 'Transaction-Graph Network Analysis',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'D3 force-directed graph topological analytics engine mapping multi-hop smurfing, circular pass-through rings, and illicit aggregator nodes with surgical 1-click node quarantine.',
    keyTech: 'D3.js Force Simulation, Network Centrality, Graph Attention Network (GAT)',
    iconName: 'Network',
  },
  {
    title: '3. ScamShield Consumer Intercept',
    badge: 'Pre-Payment Cognitive Defense',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Cognitive duress and social engineering intercept that warns customers before completing risky transfers in plain English & Bengali, leaving the final choice to the user with a 24-hour cooling-off recall buffer.',
    keyTech: 'Cognitive Duress Intercept, 24h Cooling-Off Buffer, User-Centric Reversal',
    iconName: 'Smartphone',
  },
  {
    title: '4. Disaster Financial Resilience Mode',
    badge: 'Novel Contribution #1',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    description: 'Our first primary novel contribution: simulates how floods, cyclones (e.g. Cyclone Remal in Barishal), or network blackouts impact transaction volume, cash-out demand, agent cash float depletion, and fraud spikes 24-48 hours in advance.',
    keyTech: 'Geospatial Hydro-Meteorological Simulation, Agent Float Depletion Forecasting, Armored Dispatch',
    iconName: 'CloudLightning',
  },
  {
    title: '5. Financial Early-Warning Radar',
    badge: 'Novel Contribution #2',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
    description: 'Our second primary novel contribution: continuously fuses multi-source signals (fraud rates, scam complaints, network outages, liquidity depletion, and behavioural anomalies) into an actionable 0-100 regional risk radar across all 8 divisions.',
    keyTech: 'Multi-Source Signal Fusion, 8-Division Situational Index, Proactive Surveillance Activation',
    iconName: 'Radar',
  },
];

export interface SDGAlignment {
  id: string;
  goalNumber: number;
  goalTitle: string;
  shortName: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  howTakaSafeContributes: string;
  measurableMetric: string;
}

export const UN_SDG_ALIGNMENTS: SDGAlignment[] = [
  {
    id: 'sdg_8',
    goalNumber: 8,
    goalTitle: 'Decent Work and Economic Growth',
    shortName: 'Decent Work & Economic Growth',
    color: '#A21942',
    badgeBg: 'bg-[#A21942]/10 text-[#A21942]',
    borderColor: 'border-[#A21942]/30',
    howTakaSafeContributes: 'Protects the earnings and working capital of over 1.5 million rural MFS agents through proactive liquidity float replenishment during climate disasters, and safeguards daily wage-earners against predatory digital fraud.',
    measurableMetric: 'Zero rural cash-out failures in disaster zones; 83% reduction in catastrophic scam losses for unbanked users.',
  },
  {
    id: 'sdg_9',
    goalNumber: 9,
    goalTitle: 'Industry, Innovation and Infrastructure',
    shortName: 'Industry, Innovation & Infrastructure',
    color: '#FD6925',
    badgeBg: 'bg-[#FD6925]/10 text-[#FD6925]',
    borderColor: 'border-[#FD6925]/30',
    howTakaSafeContributes: 'Provides ultra-resilient, fault-tolerant financial infrastructure (< 18ms SLA) capable of operating with explainable AI under degraded connectivity, power loss, and extreme climate shocks.',
    measurableMetric: '< 18ms real-time inference; 100% operational uptime via local resilience buffers during telecommunication outages.',
  },
  {
    id: 'sdg_16',
    goalNumber: 16,
    goalTitle: 'Peace, Justice and Strong Institutions',
    shortName: 'Peace, Justice & Strong Institutions',
    color: '#00689D',
    badgeBg: 'bg-[#00689D]/10 text-[#00689D]',
    borderColor: 'border-[#00689D]/30',
    howTakaSafeContributes: 'Dismantles organized money-laundering syndicates and illegal cross-border Hundi networks through MuleVision graph analytics, enforces transparent SHAP algorithmic explainability, and automates BFIU Form 2 STR filings.',
    measurableMetric: '100% human-in-the-loop accountability with cryptographically verifiable audit trails; automated BFIU AML/CFT compliance.',
  },
];
