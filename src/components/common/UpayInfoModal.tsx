import React, { useState } from 'react';
import { matchAssistantQuery } from '../../data/assistantKnowledge';
import {
  TAKASAFE_PROJECT_ABSTRACT_BASE,
  TAKASAFE_PROJECT_ABSTRACT_FULL,
  FIVE_CORE_CAPABILITIES,
  UN_SDG_ALIGNMENTS,
} from '../../data/abstractData';
import {
  X,
  ShieldCheck,
  CreditCard,
  MapPin,
  Newspaper,
  HelpCircle,
  Users,
  Briefcase,
  AlertOctagon,
  FileText,
  Lock,
  Download,
  Send,
  Search,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Smartphone,
  Phone,
  ArrowRight,
  Copy,
  Check,
  BookOpen,
  Network,
  CloudLightning,
  Radar,
  Globe,
  Award,
} from 'lucide-react';

interface UpayInfoModalProps {
  modalType: string | null;
  onClose: () => void;
  lang: 'EN' | 'BN';
  onNavigateView?: (view: 'OPERATOR' | 'CUSTOMER' | 'STORYLINE') => void;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
  suggestedAction?: {
    label: string;
    view?: 'OPERATOR' | 'CUSTOMER' | 'STORYLINE';
  };
  relatedTopics?: string[];
}

export const UpayInfoModal: React.FC<UpayInfoModalProps> = ({
  modalType,
  onClose,
  lang,
  onNavigateView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [abstractTab, setAbstractTab] = useState<'FULL' | 'BASE' | 'CAPABILITIES' | 'SDG'>('FULL');
  const [abstractCopied, setAbstractCopied] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: lang === 'BN' 
        ? 'আসসালামু আলাইকুম! TakaSafe কাস্টমার কেয়ারে স্বাগতম। আপনি TakaSafe ফ্রড প্রোটেকশন, ScamShield, মিউল সিন্ডিকেট গ্রাফ, ঘূর্ণিঝড় রিমেল ক্যাশ লজিস্টিকস, বা বিএফআইইউ কমপ্লায়েন্স সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।' 
        : 'Welcome to TakaSafe 24/7 Digital Assistant. Ask me anything about our real-time fraud engine (< 18ms SLA), ScamShield 24h cooling-off, MuleVision graph defense, Cyclone Remal cash logistics, or BFIU STR compliance!',
      time: 'Just now',
      relatedTopics: [
        lang === 'BN' ? 'ScamShield কীভাবে কাজ করে?' : 'How does ScamShield work?',
        lang === 'BN' ? '১৮ms SLA কীভাবে সম্ভব?' : 'What is the < 18ms SLA?',
        lang === 'BN' ? 'মিউল সিন্ডিকেট ডিটেকশন কী?' : 'What is MuleVision Graph?',
        lang === 'BN' ? 'ঘূর্ণিঝড়ে ক্যাশ সাপোর্ট কীভাবে দেয়?' : 'Cyclone Remal Disaster Float?',
      ],
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  if (!modalType) return null;

  const handleSendMessage = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = (overrideText !== undefined ? overrideText : inputMsg).trim();
    if (!query) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: query, time: timeNow }]);
    if (overrideText === undefined) {
      setInputMsg('');
    }

    setTimeout(() => {
      const matchResult = matchAssistantQuery(query, lang);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: matchResult.answer,
          time: 'Just now',
          suggestedAction: matchResult.item?.suggestedAction,
          relatedTopics: matchResult.relatedTopics,
        },
      ]);
    }, 400);
  };

  const renderContent = () => {
    switch (modalType) {
      case 'ABSTRACT':
      case 'RESEARCH_NOTE':
        return (
          <div className="space-y-4">
            {/* Top Badge Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-[#0054A6] to-indigo-900 text-white p-4 sm:p-5 rounded-2xl border border-blue-400/30 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-blue-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Official Hackathon Abstract
                  </span>
                  <span className="text-blue-200 text-xs font-mono">DIU CPC × upay 2026</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = abstractTab === 'BASE' ? TAKASAFE_PROJECT_ABSTRACT_BASE : TAKASAFE_PROJECT_ABSTRACT_FULL;
                    navigator.clipboard?.writeText(textToCopy);
                    setAbstractCopied(true);
                    setTimeout(() => setAbstractCopied(false), 2200);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 active:bg-white/30 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-300/40 transition-all cursor-pointer"
                  title="Copy full abstract to clipboard"
                >
                  {abstractCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Abstract</span>
                    </>
                  )}
                </button>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                TakaSafe: Modular Explainable AI Trust & Resilience Platform for MFS
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                Connecting 5 core capabilities, 2 primary novel contributions, SHAP explainability, human-in-the-loop governance, and UN SDGs 8, 9 & 16.
              </p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setAbstractTab('FULL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'FULL'
                    ? 'bg-white text-[#0054A6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Comprehensive Abstract (Full)
              </button>
              <button
                type="button"
                onClick={() => setAbstractTab('BASE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'BASE'
                    ? 'bg-white text-[#0054A6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Core Abstract (Base)
              </button>
              <button
                type="button"
                onClick={() => setAbstractTab('CAPABILITIES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'CAPABILITIES'
                    ? 'bg-white text-[#0054A6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5 Capabilities & Novelties
              </button>
              <button
                type="button"
                onClick={() => setAbstractTab('SDG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'SDG'
                    ? 'bg-white text-[#0054A6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                UN SDGs (8, 9, 16)
              </button>
            </div>

            {/* Tab 1: Comprehensive Abstract */}
            {abstractTab === 'FULL' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans space-y-3">
                  <p className="font-semibold text-slate-950 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-[12.5px] leading-relaxed">
                    {TAKASAFE_PROJECT_ABSTRACT_BASE}
                  </p>
                  <p className="text-slate-700">
                    Architecturally, TakaSafe operates on a <strong>sub-18ms inference latency budget</strong> to evaluate multi-modal threat vectors in real time, guaranteeing uninterrupted straight-through processing for legitimate micro-merchants and citizens. The classification pipeline pairs supervised gradient-boosted decision trees (mitigating a <strong>20.68:1 class imbalance ratio</strong> via scale_pos_weight optimization across 8,000 synthetic transactions) with unsupervised Isolation Forest temporal deviations, circadian velocity burst multipliers, and SIM/IMEI device telemetry. For consumer protection, <strong>ScamShield</strong> delivers contextual, bilingual (Bengali and English) cognitive duress warnings and introduces a non-custodial <strong>24-hour cooling-off safety buffer</strong>, giving vulnerable victims full autonomy to recall coerced transfers. Complementing point-of-sale defenses, <strong>MuleVision</strong> models fund flow topologies via D3 force-directed network graphs to uncover multi-hop smurfing chains, circular pass-through rings, and illicit aggregator nodes, enabling surgical single-click wallet quarantine.
                  </p>
                  <p className="text-slate-700">
                    The platform's dual primary novel contributions address critical macro-resilience gaps in developing digital financial ecosystems. The <strong>Disaster Financial Resilience Mode</strong> simulates the compounded shocks of climatic catastrophes—such as Cyclone Remal in coastal Barishal and Patuakhali or seasonal riverine inundation in northeastern Sylhet—forecasting agent cash-out liquidity exhaustion 24 to 48 hours in advance and orchestrating automated armored vehicle replenishment routes. Concurrently, the <strong>Financial Early-Warning Radar</strong> continuously aggregates divisional velocity shifts, fraud incident rates, scam dispute frequencies, and infrastructure telemetry into a composite 0–100 regional risk score, empowering regulatory authorities with anticipatory surveillance rather than reactive mitigation.
                  </p>
                  <p className="text-slate-700">
                    To uphold institutional trust and eliminate black-box opacity, every risk score is mathematically decomposed via <strong>SHAP (SHapley Additive exPlanations)</strong> values into intuitive directional attribution factors (e.g., nocturnal circadian anomaly +31%, velocity surge +24%, device fingerprint drift +17%). A deterministic <strong>Action Engine</strong> routes these explanations across four graduated regulatory tiers: Low (0–30: straight-through settlement), Medium (31–60: step-up biometric/OTP re-verification), High (61–80: ScamShield 24-hour cooling-off intercept), and Critical (81–100: automated wallet isolation and instant BFIU Form 2 Suspicious Transaction Report generation under Section 19 of the Anti-Money Laundering Act, 2012). Constrained LLM synthesizers (<strong>Google Gemini 2.5 Flash</strong>) narrate structured evidence dossiers without hallucination, ensuring that authorised human SOC supervisors retain full accountability for every high-impact enforcement action. Validated exclusively on statistically grounded, zero-PII synthetic data, TakaSafe provides a production-grade blueprint for safeguarding digital financial sovereignty, protecting vulnerable informal economies, and advancing United Nations Sustainable Development Goals 8, 9, and 16 across the Global South.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Want to step through the chronological 10:00 - 10:15 scenario?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateView?.('STORYLINE');
                      onClose();
                    }}
                    className="px-3 py-1 bg-[#0054A6] hover:bg-[#004080] text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Launch Storyline Runner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Core Abstract (Base) */}
            {abstractTab === 'BASE' && (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-slate-800 leading-relaxed font-sans">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-2">
                    Executive Concise Abstract (Base Submission)
                  </span>
                  <p className="font-medium text-slate-900 text-sm leading-relaxed whitespace-pre-line">
                    {TAKASAFE_PROJECT_ABSTRACT_BASE}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Framework</span>
                    <span className="text-slate-600 text-[11px] block mt-0.5">Modular Explainable AI (SHAP + Action Engine)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Governance</span>
                    <span className="text-slate-600 text-[11px] block mt-0.5">Human-in-the-Loop; Zero automated freeze without oversight</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Data Grounding</span>
                    <span className="text-slate-600 text-[11px] block mt-0.5">100% Synthetic Data (Zero PII, BFIU compliant)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Five Core Capabilities & 2 Novelties */}
            {abstractTab === 'CAPABILITIES' && (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {FIVE_CORE_CAPABILITIES.map((cap, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs">{cap.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cap.badgeColor}`}>
                        {cap.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11.5px] leading-relaxed">{cap.description}</p>
                    <div className="text-[10.5px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200/80">
                      Tech: {cap.keyTech}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: UN SDGs (8, 9, 16) */}
            {abstractTab === 'SDG' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  TakaSafe is architected to advance sustainable digital finance and financial inclusion aligned with the United Nations 2030 Agenda:
                </p>
                <div className="space-y-2.5">
                  {UN_SDG_ALIGNMENTS.map((sdg) => (
                    <div
                      key={sdg.id}
                      className={`p-3.5 rounded-2xl border ${sdg.borderColor} bg-white shadow-xs space-y-1.5`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: sdg.color }}
                          >
                            {sdg.goalNumber}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              SDG {sdg.goalNumber}: {sdg.goalTitle}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sdg.badgeBg}`}>
                          Verified
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {sdg.howTakaSafeContributes}
                      </p>
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                        <strong>Measurable Outcome:</strong> {sdg.measurableMetric}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'ABOUT_US':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 rounded-xl bg-[#0054A6] text-white flex items-center justify-center font-bold text-xl">
                TS
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">TakaSafe MFS Platform</h4>
                <p className="text-xs text-slate-600">
                  Developed for DIU CPC × upay AI DEV FEST 2026 by Team 3AM Runtime
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAbstractTab('FULL')}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                View Abstract
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              TakaSafe is a next-generation Mobile Financial Services (MFS) Trust & Resilience Engine designed to empower Bangladeshi aspirers with financial inclusion, zero-compromise security, and proactive protection.
            </p>

            {/* Quick Abstract Preview Box */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950">Official Abstract & UN SDGs</span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  SDG 8, 9, 16
                </span>
              </div>
              <p className="text-[11.5px] text-slate-700 line-clamp-3">
                {TAKASAFE_PROJECT_ABSTRACT_BASE}
              </p>
              <button
                type="button"
                onClick={() => {
                  // Switch to abstract view inside modal
                  setAbstractTab('FULL');
                }}
                className="text-[11px] font-bold text-[#0054A6] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Read Full Research Abstract & Novelties</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Core Architecture</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">AI-1 Engine: LightGBM + Calibration + Conformal Doubt Check & Novelty · GAT Graph Defense</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Compliance & Explainability</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">Bangladesh Bank MFS Regulations & BFIU Guidelines 2026 · 95% Conformal Coverage</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold block">Team 3AM Runtime:</span>
                <span>Md. Tanvir Hasan (Chief Risk Analyst & Lead) · Md. Sadman Al Islam Shabab (Model Architecture Lead) · Sourov Kumar (SOC Operations)</span>
              </div>
              <a
                href="/api/notebook/ai1"
                download="TakaSafe_AI1_LightGBM_Conformal_DoubtCheck.ipynb"
                className="shrink-0 px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 w-fit"
              >
                <span>AI-1 Notebook (.ipynb)</span>
              </a>
            </div>
          </div>
        );

      case 'PREPAID_CARD':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#003875] via-[#0054A6] to-[#002855] text-white p-5 rounded-2xl shadow-lg border border-blue-400/40 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">TakaSafe Platinum</span>
                  <div className="text-lg font-black mt-1">Dual Currency Prepaid Card</div>
                </div>
                <CreditCard className="w-7 h-7 text-amber-300" />
              </div>
              <div className="my-4 font-mono text-sm tracking-widest">•••• •••• •••• 8421</div>
              <div className="flex justify-between items-end text-xs">
                <div>
                  <span className="text-[9px] text-blue-200 block uppercase">Cardholder</span>
                  <span className="font-bold">MD RAHIM UDDIN</span>
                </div>
                <div>
                  <span className="text-[9px] text-blue-200 block uppercase">ATM Cash Out</span>
                  <span className="text-amber-300 font-bold">৳০ FREE</span>
                </div>
              </div>
            </div>
            <ul className="text-xs space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero annual renewal fee & 100% free cash-out at all partner ATMs.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contactless NFC wave-to-pay for transit, supermarkets, and merchant POS.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant lock/unlock via TakaSafe app if misplaced.</span>
              </li>
            </ul>
          </div>
        );

      case 'SERVICE_LOCATIONS':
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Find authorized TakaSafe Points, partner branch counters, and ৳0 ATM booths nationwide.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {[
                { name: 'TakaSafe Flagship Point', addr: 'Plot CWS (A) -1, Road 34, Gulshan-1, Dhaka', type: 'Customer Center', time: '9:30 AM - 4:00 PM' },
                { name: 'UCB Taqwa Islamic Branch ATM', addr: 'Near Shooting Club, Gulshan Avenue, Dhaka', type: '0% Free ATM', time: '24/7 Hours' },
                { name: 'Agrabad Commercial Branch', addr: 'Shaheed Sohrawardi Road, Agrabad, Chattogram', type: 'Regional Hub', time: '9:30 AM - 4:00 PM' },
                { name: 'Zindabazar Service Point', addr: 'East Zindabazar, Sylhet', type: 'Fast Agent Point', time: '8:00 AM - 10:00 PM' },
                { name: 'Barishal Sadar Coastal Node', addr: 'Sadullapur Road, Barishal', type: 'Disaster Liquidity Buffer', time: 'Emergency Priority' },
              ].map((loc, i) => (
                <div key={i} className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs flex justify-between items-center transition-colors">
                  <div>
                    <div className="font-bold text-slate-900">{loc.name}</div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>{loc.addr}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 block">
                      {loc.type}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">{loc.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'LIMITS_CHARGES':
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Official schedule of charges and transaction ceilings approved by Bangladesh Bank.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Service</th>
                    <th className="p-2.5">Charge</th>
                    <th className="p-2.5">Per Txn Limit</th>
                    <th className="p-2.5">Daily Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-900">ATM Cash-Out</td>
                    <td className="p-2.5 text-emerald-600 font-black">৳ 0.00 (FREE)</td>
                    <td className="p-2.5">৳ 10,000</td>
                    <td className="p-2.5">৳ 25,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-900">Agent Cash-Out</td>
                    <td className="p-2.5 font-bold">1.4% (৳14/k)</td>
                    <td className="p-2.5">৳ 25,000</td>
                    <td className="p-2.5">৳ 50,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-900">Send Money</td>
                    <td className="p-2.5 text-slate-700 font-medium">৳ 5.00</td>
                    <td className="p-2.5">৳ 25,000</td>
                    <td className="p-2.5">৳ 50,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-900">Cash In (Agent/Bank)</td>
                    <td className="p-2.5 text-emerald-600 font-bold">FREE</td>
                    <td className="p-2.5">৳ 30,000</td>
                    <td className="p-2.5">৳ 100,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-900">Utility Bill Pay</td>
                    <td className="p-2.5 text-emerald-600 font-bold">FREE</td>
                    <td className="p-2.5">৳ 50,000</td>
                    <td className="p-2.5">৳ 100,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'LIVE_CHAT': {
        const quickChips = [
          { label: lang === 'BN' ? '🛡️ ScamShield কী?' : '🛡️ ScamShield AI', query: 'How does ScamShield work?' },
          { label: lang === 'BN' ? '⚡ ১৮ms SLA কী?' : '⚡ < 18ms SLA', query: 'What is the latency SLA?' },
          { label: lang === 'BN' ? '🕸️ মিউল সিন্ডিকেট' : '🕸️ MuleVision GNN', query: 'What is MuleVision and mule detection?' },
          { label: lang === 'BN' ? '🌊 ঘূর্ণিঝড় ক্যাশ ব্যাকআপ' : '🌊 Cyclone Float', query: 'What is Disaster Resilience mode?' },
          { label: lang === 'BN' ? '📋 বিএফআইইউ Form 2' : '📋 BFIU Form 2 STR', query: 'What is BFIU STR compliance?' },
          { label: lang === 'BN' ? '💳 ফ্রি ATM ক্যাশ-আউট' : '💳 Free ATM Cash-Out', query: 'What is the cash-out fee at ATMs?' },
        ];

        return (
          <div className="flex flex-col h-[430px]">
            {/* Quick Suggestion Chips Carousel */}
            <div className="pb-2.5 mb-2 border-b border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase block mb-1.5">
                {lang === 'BN' ? 'প্রস্তাবিত বিষয়সমূহ:' : 'SUGGESTED TOPICS:'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {quickChips.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleSendMessage(undefined, chip.query)}
                    className="shrink-0 text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-[#0054A6] px-2.5 py-1 rounded-full border border-blue-200 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/80 rounded-xl border border-slate-200">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#0054A6] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>

                    {/* Navigation action button if available */}
                    {m.suggestedAction && m.suggestedAction.view && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (m.suggestedAction?.view) {
                              onNavigateView?.(m.suggestedAction.view);
                              onClose();
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0054A6] hover:text-[#003870] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{m.suggestedAction.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Related topics pills */}
                    {m.relatedTopics && m.relatedTopics.length > 0 && m.sender === 'bot' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[9.5px] font-semibold text-slate-600 block mb-1">
                          {lang === 'BN' ? 'সম্পর্কিত প্রশ্ন:' : 'Related questions:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.relatedTopics.map((topic, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => handleSendMessage(undefined, topic)}
                              className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-[#0054A6] text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer text-left"
                            >
                              • {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => handleSendMessage(e)} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={
                  lang === 'BN'
                    ? 'TakaSafe বা ফ্রড প্রোটেকশন সম্পর্কে যেকোনো প্রশ্ন লিখুন...'
                    : 'Ask anything about TakaSafe, ScamShield, ML models, BFIU...'
                }
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
              />
              <button
                type="submit"
                className="bg-[#0054A6] hover:bg-[#004080] text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        );
      }

      case 'SEARCH':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, ATM booths, ScamShield, audit logs..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                { title: 'ATM Cash-Out (Zero Charge)', category: 'MFS Service', action: () => onNavigateView?.('CUSTOMER') },
                { title: 'ScamShield Pre-Payment Warning', category: 'Security Feature', action: () => onNavigateView?.('CUSTOMER') },
                { title: 'Operator Risk Cockpit & GAT Graph', category: 'Dashboard', action: () => onNavigateView?.('OPERATOR') },
                { title: 'Disaster Liquidity Mode (Cyclone Buffer)', category: 'Resilience', action: () => onNavigateView?.('OPERATOR') },
                { title: 'Compliance Audit Trail (.CSV Export)', category: 'Regulatory', action: () => onNavigateView?.('OPERATOR') },
                { title: 'Dual-Currency Platinum Prepaid Card', category: 'Products', action: () => {} },
              ]
                .filter((item) => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[10px] text-slate-500">{item.category}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0054A6]" />
                  </div>
                ))}
            </div>
          </div>
        );

      case 'APP_DOWNLOAD':
        return (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-[#0054A6] text-white flex items-center justify-center mx-auto shadow-md">
              <Smartphone className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">TakaSafe Web App Demo</h4>
              <p className="text-xs text-slate-500 mt-1">This project is a browser-based demonstration. A mobile app and app-store download are not available.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-300 mx-auto flex items-center justify-center text-xs text-slate-500 text-center">
                No mobile app download
              </div>
              <span className="text-[10px] text-slate-500 block mt-2 font-medium">Use the web simulator on this site</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onNavigateView?.('CUSTOMER');
                  onClose();
                }}
                className="bg-[#0054A6] hover:bg-[#004080] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow"
              >
                Open Web App Simulator
              </button>
            </div>
          </div>
        );

      case 'TERMS':
        return (
          <div className="space-y-3 text-xs text-slate-700">
            <p><strong>Demonstration only.</strong> TakaSafe is a software prototype for evaluation. It does not provide banking, payment, fraud prevention, or regulatory services.</p>
            <p>Sign-in uses sample profiles. Passwords are not authenticated, and customer transactions change simulated balances and browser or local demo records only. Do not enter real credentials or rely on displayed decisions for financial activity.</p>
            <p>Use of this demo is at your discretion. Sample data and generated reports may be incomplete or inaccurate.</p>
          </div>
        );

      case 'PRIVACY_POLICY':
        return (
          <div className="space-y-3 text-xs text-slate-700">
            <p><strong>Demo data only.</strong> Use the sample profiles and fictional information. Do not submit real passwords, account details, identity documents, or other sensitive personal information.</p>
            <p>The demo may store its session, theme, and sample customer activity in this browser. When run with its development server, sample activity and audit actions can also be written to local CSV files in the project. Those files are not a secure production data store.</p>
            <p>Clearing this browser's site data removes browser-stored demo records. This prototype has no production account, data export, or deletion service.</p>
          </div>
        );

      case 'MEDIA':
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">Official press releases and AI DEV FEST 2026 announcements.</p>
            <div className="space-y-2.5">
              {[
                { date: 'Oct 2026', title: 'TakaSafe Unveils ScamShield AI at DIU CPC × upay AI DEV FEST 2026', tag: 'Championship' },
                { date: 'Sep 2026', title: 'Zero Cash-Out Charge Announced for 15,000+ ATM Booths Across Bangladesh', tag: 'Campaign' },
                { date: 'Aug 2026', title: 'TakaSafe Partners with UCB Taqwa Islamic Banking for Resilient Agent Liquidity', tag: 'Partnership' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>{item.date}</span>
                    <span className="bg-blue-100 text-[#0054A6] px-2 py-0.2 rounded-full font-bold">{item.tag}</span>
                  </div>
                  <h5 className="font-bold text-slate-900">{item.title}</h5>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3 text-xs text-slate-700">
            <p>
              Information for <strong className="text-slate-900">{modalType.replace(/_/g, ' ')}</strong> is fully compliant with Bangladesh Bank BFIU MFS Regulatory Guidelines 2026.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold block text-slate-900">Need specific assistance?</span>
              <span className="text-slate-600">Call our 24/7 hotline at 16268 or email customerservice@takasafe.com.</span>
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (modalType) {
      case 'ABSTRACT':
      case 'RESEARCH_NOTE': return lang === 'BN' ? 'অফিসিয়াল রিসার্চ অ্যাবস্ট্রাক্ট ও SDG' : 'Official Project Abstract & UN SDGs';
      case 'ABOUT_US': return 'About TakaSafe';
      case 'PREPAID_CARD': return 'TakaSafe Prepaid Cards';
      case 'SERVICE_LOCATIONS': return 'Service Locations & ATM Finder';
      case 'LIMITS_CHARGES': return lang === 'BN' ? 'লিমিট ও সার্ভিস চার্জ' : 'Limits and Service Charges';
      case 'LIVE_CHAT': return lang === 'BN' ? '২৪/৭ লাইভ সাপোর্ট সহকারী' : '24/7 Live Support Assistant';
      case 'SEARCH': return lang === 'BN' ? 'দ্রুত অনুসন্ধান' : 'Quick Search Directory';
      case 'APP_DOWNLOAD': return 'TakaSafe Web App Demo';
      case 'MEDIA': return 'Press Releases & Media';
      case 'NEED_HELP': return 'Customer Help & Support';
      case 'PARTNER': return 'Partner & Merchant Enrollment';
      case 'PRIVACY_POLICY': return 'Privacy & Data Protection Policy';
      case 'TERMS': return 'Terms & Conditions';
      case 'BUSINESS': return 'TakaSafe Enterprise Solutions';
      default: return modalType.replace(/_/g, ' ');
    }
  };

  const modalMaxWidth =
    modalType === 'ABSTRACT' || modalType === 'RESEARCH_NOTE'
      ? 'max-w-3xl'
      : modalType === 'LIVE_CHAT'
      ? 'max-w-xl'
      : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs modal-backdrop-enter">
      <div className={`bg-white rounded-3xl ${modalMaxWidth} w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col modal-panel-enter`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0054A6] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">{getTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>TakaSafe · DIU CPC × upay AI DEV FEST 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
