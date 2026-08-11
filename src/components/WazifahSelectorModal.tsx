import React, { useState } from 'react';
import { Wazifah } from '../types/wazifah';
import { Search, Plus, Check, X, BookOpen, Layers, Trash2 } from 'lucide-react';

interface WazifahSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wazifahs: Wazifah[];
  selectedWazifahId: string;
  onSelect: (wazifah: Wazifah) => void;
  onDeleteWazifah?: (wazifahId: string) => void;
  onOpenCreateCustom: () => void;
}

export const WazifahSelectorModal: React.FC<WazifahSelectorModalProps> = ({
  isOpen,
  onClose,
  wazifahs,
  selectedWazifahId,
  onSelect,
  onDeleteWazifah,
  onOpenCreateCustom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Daily', 'Praise', 'Protection', 'Forgiveness', 'Relief & Hajat', 'Custom'];

  const filtered = wazifahs.filter(w => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.steps && w.steps.some(s => s.dhikrTitle.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Custom'
        ? w.isCustom
        : w.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Select Wazifah Routine or Dhikr</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, Dhikr name or benefit..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-slate-700 pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Wazifah Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No routines found matching "{searchTerm}".
            </div>
          ) : (
            filtered.map(w => {
              const isSelected = w.id === selectedWazifahId;
              const steps = w.steps || [];
              const isMultiStep = steps.length > 1;
              const totalTarget = steps.reduce((acc, s) => acc + s.targetCount, 0);

              return (
                <div
                  key={w.id}
                  onClick={() => {
                    onSelect(w);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-100">{w.title}</h3>
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                        Target: {totalTarget}
                      </span>
                      {isMultiStep && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{steps.length} Combined Dhikrs</span>
                        </span>
                      )}
                      {w.isCustom && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Step previews */}
                    {isMultiStep ? (
                      <div className="space-y-1 pt-1">
                        <p className="text-xs text-slate-300 font-medium">Steps in sequence:</p>
                        <div className="flex flex-wrap gap-1">
                          {steps.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-900/80 text-amber-200 px-2 py-0.5 rounded-md border border-slate-700/80"
                            >
                              {idx + 1}. {s.dhikrTitle} ({s.targetCount})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      steps[0] && (
                        <div>
                          {steps[0].arabicText && (
                            <p className="text-base font-serif text-amber-200 font-semibold py-0.5">
                              {steps[0].arabicText}
                            </p>
                          )}
                          {steps[0].transliteration && (
                            <p className="text-xs text-slate-300 italic">{steps[0].transliteration}</p>
                          )}
                          {steps[0].translation && (
                            <p className="text-xs text-slate-400">{steps[0].translation}</p>
                          )}
                        </div>
                      )
                    )}

                    {w.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">{w.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <div className="p-1 rounded-full bg-amber-500 text-slate-950">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    {onDeleteWazifah && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${w.title}"?`)) {
                            onDeleteWazifah(w.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete this Wazifah/Dhikr"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center gap-3 bg-slate-950/50">
          <button
            onClick={() => {
              onClose();
              onOpenCreateCustom();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2.5 rounded-xl border border-amber-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dhikr / Combine Wazifah</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
