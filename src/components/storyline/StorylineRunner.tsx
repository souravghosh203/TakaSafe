import React, { useState } from 'react';
import { StorylineStep } from '../../types';
import { DEMO_STORYLINE } from '../../data/mockData';
import { Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight, Sparkles, Clock } from 'lucide-react';

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

  const currentStep = DEMO_STORYLINE[currentStepIdx];

  const handleNext = () => {
    setCurrentStepIdx((prev) => (prev < DEMO_STORYLINE.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentStepIdx((prev) => (prev > 0 ? prev - 1 : DEMO_STORYLINE.length - 1));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
