import React, { useState } from 'react';
import { Wazifah } from '../types/wazifah';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles, BookMarked, Languages } from 'lucide-react';

interface NiyyahCardProps {
  wazifah: Wazifah;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onOpenSelector: () => void;
}

export const NiyyahCard: React.FC<NiyyahCardProps> = ({
  wazifah,
  activeStepIndex,
  onSelectStep,
  onOpenSelector,
}) => {
  const [isGuidanceExpanded, setIsGuidanceExpanded] = useState(false);
  const [isDhikrTextExpanded, setIsDhikrTextExpanded] = useState(false);

  const steps = wazifah.steps && wazifah.steps.length > 0 ? wazifah.steps : [];
  const currentStep = steps[activeStepIndex] || steps[0] || {
    dhikrTitle: wazifah.title,
    targetCount: 33,
  };

  const isMultiStep = steps.length > 1;

  const handlePrevStep = () => {
    const prevIndex = activeStepIndex > 0 ? activeStepIndex - 1 : steps.length - 1;
    onSelectStep(prevIndex);
  };

  const handleNextStep = () => {
    const nextIndex = (activeStepIndex + 1) % steps.length;
    onSelectStep(nextIndex);
  };

  return (
    <div className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-3 sm:p-4 shadow-xl transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-700/50">
        <button
          onClick={onOpenSelector}
          className="flex items-center gap-2 group text-left transition-colors hover:text-amber-300 min-w-0"
        >
          <BookMarked className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="truncate">
            <h2 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
              {wazifah.title}
            </h2>
            <span className="text-[11px] text-amber-400/80 font-medium block truncate">
              Category: {wazifah.category} {isMultiStep ? `• ${steps.length} Dhikrs` : `• Target: ${currentStep.targetCount}`}
            </span>
          </div>
        </button>

        <button
          onClick={onOpenSelector}
          className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap shrink-0"
        >
          Change Routine
        </button>
      </div>

      {/* Dhikr Step Selector with Left / Right Arrows */}
      <div className="flex items-center justify-between bg-slate-900/70 p-2 rounded-xl border border-slate-700/50 my-2">
        {isMultiStep ? (
          <button
            onClick={handlePrevStep}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Previous Dhikr"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <button
          onClick={() => onSelectStep(activeStepIndex)}
          className="flex flex-col items-center text-center cursor-pointer hover:opacity-90 transition-opacity px-2 min-w-0"
          title="Click to activate counter for this Dhikr"
        >
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Dhikr {activeStepIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-bold text-slate-100 truncate max-w-[220px]">
            {currentStep.dhikrTitle} <span className="text-amber-300/90 font-mono text-xs">({currentStep.targetCount})</span>
          </span>
        </button>

        {isMultiStep ? (
          <button
            onClick={handleNextStep}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Next Dhikr"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Collapsible Arabic Text, Transliteration & Translation */}
      {(currentStep.arabicText || currentStep.transliteration || currentStep.translation) && (
        <div className="border-t border-slate-700/40 pt-1">
          <button
            onClick={() => setIsDhikrTextExpanded(!isDhikrTextExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors py-1.5 px-1"
          >
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>Arabic Text & Translation</span>
            </span>
            {isDhikrTextExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isDhikrTextExpanded && (
            <div className="mt-1 space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-center animate-fadeIn">
              {currentStep.arabicText && (
                <p className="text-2xl sm:text-3xl font-serif text-amber-200 tracking-wide leading-relaxed font-semibold">
                  {currentStep.arabicText}
                </p>
              )}
              {currentStep.transliteration && (
                <p className="text-xs font-medium text-slate-300 italic border-t border-slate-800/80 pt-2">
                  "{currentStep.transliteration}"
                </p>
              )}
              {currentStep.translation && (
                <p className="text-xs text-slate-400">
                  {currentStep.translation}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expandable Benefits & Intention */}
      {(currentStep.benefits || currentStep.niyyah || wazifah.description) && (
        <div className="pt-1 border-t border-slate-700/40">
          <button
            onClick={() => setIsGuidanceExpanded(!isGuidanceExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors py-1.5 px-1"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Virtues, Niyyah & Step Guidance</span>
            </span>
            {isGuidanceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isGuidanceExpanded && (
            <div className="mt-1 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 space-y-2 animate-fadeIn">
              {wazifah.description && (
                <div>
                  <span className="font-semibold text-amber-300">Routine Description: </span>
                  <span className="text-slate-300">{wazifah.description}</span>
                </div>
              )}
              {currentStep.niyyah && (
                <div>
                  <span className="font-semibold text-amber-300">Niyyah (Intention): </span>
                  <span className="text-slate-300">{currentStep.niyyah}</span>
                </div>
              )}
              {currentStep.benefits && (
                <div>
                  <span className="font-semibold text-amber-300">Virtue / Benefit: </span>
                  <span className="text-slate-300">{currentStep.benefits}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
