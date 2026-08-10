import React, { useState } from 'react';
import { Wazifah } from '../types/wazifah';
import { ChevronDown, ChevronUp, Sparkles, BookMarked } from 'lucide-react';

interface NiyyahCardProps {
  wazifah: Wazifah;
  onOpenSelector: () => void;
}

export const NiyyahCard: React.FC<NiyyahCardProps> = ({ wazifah, onOpenSelector }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 shadow-xl transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-700/50">
        <button
          onClick={onOpenSelector}
          className="flex items-center gap-2 group text-left transition-colors hover:text-amber-300"
        >
          <BookMarked className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              {wazifah.title}
            </h2>
            <span className="text-[11px] text-amber-400/80 font-medium">
              Category: {wazifah.category} • Target: {wazifah.recommendedTarget}
            </span>
          </div>
        </button>

        <button
          onClick={onOpenSelector}
          className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap"
        >
          Change Wazifah
        </button>
      </div>

      {/* Main Arabic Text */}
      {wazifah.arabicText && (
        <div className="py-3 text-center">
          <p className="text-2xl sm:text-3xl font-serif text-amber-200 tracking-wide leading-relaxed font-semibold drop-shadow-sm">
            {wazifah.arabicText}
          </p>
        </div>
      )}

      {/* Transliteration & Translation */}
      {(wazifah.transliteration || wazifah.translation) && (
        <div className="text-center space-y-1 pt-1 pb-2 border-t border-slate-700/40">
          {wazifah.transliteration && (
            <p className="text-xs font-medium text-slate-300 italic">
              "{wazifah.transliteration}"
            </p>
          )}
          {wazifah.translation && (
            <p className="text-xs text-slate-400">
              {wazifah.translation}
            </p>
          )}
        </div>
      )}

      {/* Expandable Benefits & Intention */}
      {(wazifah.benefits || wazifah.niyyah) && (
        <div className="pt-2 border-t border-slate-700/40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spiritual Benefits & Intention (Niyyah)</span>
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 space-y-2 animate-fadeIn">
              {wazifah.niyyah && (
                <div>
                  <span className="font-semibold text-amber-300">Niyyah (Intention): </span>
                  <span className="text-slate-300">{wazifah.niyyah}</span>
                </div>
              )}
              {wazifah.benefits && (
                <div>
                  <span className="font-semibold text-amber-300">Virtue / Benefit: </span>
                  <span className="text-slate-300">{wazifah.benefits}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
