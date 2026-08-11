import React, { useState } from 'react';
import { Wazifah } from '../types/wazifah';
import { ChevronDown, ChevronUp, Sparkles, BookMarked, Layers } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = wazifah.steps && wazifah.steps.length > 0 ? wazifah.steps : [];
  const currentStep = steps[activeStepIndex] || steps[0] || {
    dhikrTitle: wazifah.title,
    targetCount: 100,
  };

  const isMultiStep = steps.length > 1;

  return (
    <div className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-xl transition-all">
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
              Category: {wazifah.category} {isMultiStep ? `• ${steps.length} Combined Dhikrs` : `• Target: ${currentStep.targetCount}`}
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

      {/* Multi-step Navigation Pills */}
      {isMultiStep && (
        <div className="mt-3 mb-2 flex flex-wrap gap-1.5 justify-center">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={idx}
                onClick={() => onSelectStep(idx)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-slate-100 border border-slate-600/50'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>
                  {idx + 1}. {step.dhikrTitle} ({step.targetCount})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Step Dhikr Title if Multi-Step */}
      {isMultiStep && (
        <div className="text-center pt-2 pb-1">
          <span className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold">
            Dhikr {activeStepIndex + 1} of {steps.length}: {currentStep.dhikrTitle}
          </span>
        </div>
      )}

      {/* Main Arabic Text */}
      {currentStep.arabicText && (
        <div className="py-3 text-center">
          <p className="text-2xl sm:text-3xl font-serif text-amber-200 tracking-wide leading-relaxed font-semibold drop-shadow-sm">
            {currentStep.arabicText}
          </p>
        </div>
      )}

      {/* Transliteration & Translation */}
      {(currentStep.transliteration || currentStep.translation) && (
        <div className="text-center space-y-1 pt-1 pb-2 border-t border-slate-700/40">
          {currentStep.transliteration && (
            <p className="text-xs font-medium text-slate-300 italic">
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

      {/* Expandable Benefits & Intention */}
      {(currentStep.benefits || currentStep.niyyah || wazifah.description) && (
        <div className="pt-2 border-t border-slate-700/40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Virtues, Niyyah & Step Guidance</span>
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 space-y-2 animate-fadeIn">
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
