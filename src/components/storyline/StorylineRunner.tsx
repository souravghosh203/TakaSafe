import React, { useState } from 'react';
import { StorylineStep } from '../../types';
import { DEMO_STORYLINE } from '../../data/mockData';
import {
  TAKASAFE_PROJECT_ABSTRACT_BASE,
  TAKASAFE_PROJECT_ABSTRACT_FULL,
  FIVE_CORE_CAPABILITIES,
  UN_SDG_ALIGNMENTS,
} from '../../data/abstractData';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BookOpen,
  Award,
} from 'lucide-react';

interface StorylineRunnerProps {
  onNavigateToModule: (module: StorylineStep['moduleHighlight']) => void;
  lang: 'EN' | 'BN';
}

export const StorylineRunner: React.FC<StorylineRunnerProps> = ({
  onNavigateToModule,
  lang,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAbstractOpen, setIsAbstractOpen] = useState<boolean>(true);
  const [abstractTab, setAbstractTab] = useState<'FULL' | 'CAPABILITIES' | 'SDG'>('FULL');
  const [abstractCopied, setAbstractCopied] = useState<boolean>(false);

  const currentStep = DEMO_STORYLINE[currentStepIdx];

  const handleNext = () => {
    setCurrentStepIdx((prev) => (prev < DEMO_STORYLINE.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentStepIdx((prev) => (prev > 0 ? prev - 1 : DEMO_STORYLINE.length - 1));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Official Project Abstract & Scope Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-slide-up">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-[#0054A6] to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400 text-blue-950 px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Official Abstract
                </span>
                <span className="text-[11px] text-blue-200 font-mono">DIU CPC × upay 2026</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                TakaSafe: Modular Explainable AI Platform for MFS Trust & Resilience
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(TAKASAFE_PROJECT_ABSTRACT_FULL);
                setAbstractCopied(true);
                setTimeout(() => setAbstractCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-300/30 transition-all cursor-pointer"
            >
              {abstractCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Abstract</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsAbstractOpen(!isAbstractOpen)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title={isAbstractOpen ? 'Collapse Abstract' : 'Expand Abstract'}
            >
              {isAbstractOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isAbstractOpen && (
          <div className="p-5 space-y-4">
            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setAbstractTab('FULL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'FULL'
                    ? 'bg-white dark:bg-slate-700 text-[#0054A6] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Comprehensive Project Abstract
              </button>
              <button
                type="button"
                onClick={() => setAbstractTab('CAPABILITIES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'CAPABILITIES'
                    ? 'bg-white dark:bg-slate-700 text-[#0054A6] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                5 Capabilities & 2 Primary Novelties
              </button>
              <button
                type="button"
                onClick={() => setAbstractTab('SDG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  abstractTab === 'SDG'
                    ? 'bg-white dark:bg-slate-700 text-[#0054A6] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                UN Sustainable Development Goals (SDG 8, 9, 16)
              </button>
            </div>

            {/* Tab 1: Comprehensive Abstract */}
            {abstractTab === 'FULL' && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 rounded-2xl border border-amber-200/90 dark:border-amber-800/40 text-slate-900 dark:text-slate-100 font-medium text-[12.5px]">
                  {TAKASAFE_PROJECT_ABSTRACT_BASE}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-2.5">
                  <p>
                    Architecturally, TakaSafe operates on a <strong>sub-18ms inference latency budget</strong> to evaluate multi-modal threat vectors in real time, guaranteeing uninterrupted straight-through processing for legitimate micro-merchants and citizens. The classification pipeline pairs supervised gradient-boosted decision trees (mitigating a <strong>20.68:1 class imbalance ratio</strong> via scale_pos_weight optimization across 8,000 synthetic transactions) with unsupervised Isolation Forest temporal deviations, circadian velocity burst multipliers, and SIM/IMEI device telemetry. For consumer protection, <strong>ScamShield</strong> delivers contextual, bilingual (Bengali and English) cognitive duress warnings and introduces a non-custodial <strong>24-hour cooling-off safety buffer</strong>, giving vulnerable victims full autonomy to recall coerced transfers. Complementing point-of-sale defenses, <strong>MuleVision</strong> models fund flow topologies via D3 force-directed network graphs to uncover multi-hop smurfing chains, circular pass-through rings, and illicit aggregator nodes, enabling surgical single-click wallet quarantine.
                  </p>
                  <p>
                    The platform's dual primary novel contributions address critical macro-resilience gaps in developing digital financial ecosystems. The <strong>Disaster Financial Resilience Mode</strong> simulates the compounded shocks of climatic catastrophes—such as Cyclone Remal in coastal Barishal and Patuakhali or seasonal riverine inundation in northeastern Sylhet—forecasting agent cash-out liquidity exhaustion 24 to 48 hours in advance and orchestrating automated armored vehicle replenishment routes. Concurrently, the <strong>Financial Early-Warning Radar</strong> continuously aggregates divisional velocity shifts, fraud incident rates, scam dispute frequencies, and infrastructure telemetry into a composite 0–100 regional risk score, empowering regulatory authorities with anticipatory surveillance rather than reactive mitigation.
                  </p>
                  <p>
                    To uphold institutional trust and eliminate black-box opacity, every risk score is mathematically decomposed via <strong>SHAP (SHapley Additive exPlanations)</strong> values into intuitive directional attribution factors (e.g., nocturnal circadian anomaly +31%, velocity surge +24%, device fingerprint drift +17%). A deterministic <strong>Action Engine</strong> routes these explanations across four graduated regulatory tiers: Low (0–30: straight-through settlement), Medium (31–60: step-up biometric/OTP re-verification), High (61–80: ScamShield 24-hour cooling-off intercept), and Critical (81–100: automated wallet isolation and instant BFIU Form 2 Suspicious Transaction Report generation under Section 19 of the Anti-Money Laundering Act, 2012). Constrained LLM synthesizers (<strong>Google Gemini 2.5 Flash</strong>) narrate structured evidence dossiers without hallucination, ensuring that authorised human SOC supervisors retain full accountability for every high-impact enforcement action. Validated exclusively on statistically grounded, zero-PII synthetic data, TakaSafe provides a production-grade blueprint for safeguarding digital financial sovereignty, protecting vulnerable informal economies, and advancing United Nations Sustainable Development Goals 8, 9, and 16 across the Global South.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Capabilities & Novelties */}
            {abstractTab === 'CAPABILITIES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FIVE_CORE_CAPABILITIES.map((cap, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-xs space-y-1.5 ${
                      i >= 3 ? 'md:col-span-2 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{cap.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cap.badgeColor}`}>
                        {cap.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">{cap.description}</p>
                    <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      Tech: {cap.keyTech}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: UN SDGs */}
            {abstractTab === 'SDG' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UN_SDG_ALIGNMENTS.map((sdg) => (
                  <div
                    key={sdg.id}
                    className={`p-3.5 rounded-2xl border ${sdg.borderColor} bg-white dark:bg-slate-900 shadow-xs space-y-2 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: sdg.color }}
                        >
                          {sdg.goalNumber}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">United Nations</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate block">
                            SDG {sdg.goalNumber}
                          </span>
                        </div>
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-1">
                        {sdg.shortName}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {sdg.howTakaSafeContributes}
                      </p>
                    </div>
                    <div className="text-[10.5px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                      <strong>Impact:</strong> {sdg.measurableMetric}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-blue-800 animate-slide-up card-hover-lift">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-blue-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase">
                Official Hackathon Scenario
              </span>
              <h2 className="text-xl font-bold">End-to-End Demonstration Storyline</h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl">
              Chronological 10:00 to 10:15 incident flow from the TakaSafe Research Note. Step through the scenario to observe how detection, graph analysis, regional radar, and disaster resilience interact seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Scenario' : 'Auto Play'}</span>
            </button>
          </div>
        </div>

        {/* Timeline Progress Bar */}
        <div className="mt-8 pt-6 border-t border-blue-800/80">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-blue-800 z-0" />

            {DEMO_STORYLINE.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div
                  key={step.time}
                  onClick={() => setCurrentStepIdx(idx)}
                  className="flex flex-col items-center cursor-pointer relative z-10 group"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-amber-400 text-blue-950 ring-4 ring-amber-300/40 scale-110 shadow-lg'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-blue-950 text-blue-300 border border-blue-700'
                    }`}
                  >
                    {step.time.substring(3)}m
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-mono ${
                      isCurrent ? 'text-amber-300 font-bold' : 'text-blue-300'
                    }`}
                  >
                    {step.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Step Feature Showcase Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-slide-up stagger-1 card-hover-lift">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {currentStep.time} AM
            </span>
            <h3 className="text-base font-bold text-slate-900 ml-2">
              {currentStep.title}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Step {currentStepIdx + 1} of {DEMO_STORYLINE.length}
          </span>
        </div>

        {/* Narrative Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              1. Event Trigger in MFS Grid
            </span>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {currentStep.event}
            </p>
          </div>

          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">
              2. TakaSafe AI Response & Action
            </span>
            <p className="text-sm text-emerald-950 font-medium leading-relaxed">
              {currentStep.takaSafeResponse}
            </p>
          </div>
        </div>

        {/* Interactive Deep Dive CTA */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-500 ml-2">
              Navigate chronology
            </span>
          </div>

          <button
            onClick={() => onNavigateToModule(currentStep.moduleHighlight)}
            className="flex items-center gap-2 bg-[#0054A6] hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition-all"
          >
            <span>Open {currentStep.moduleHighlight} View Live</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
