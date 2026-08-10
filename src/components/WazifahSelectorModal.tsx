import React, { useState } from 'react';
import { Wazifah, WazifahCategory } from '../types/wazifah';
import { Search, Plus, Check, X, BookOpen, Sparkles } from 'lucide-react';

interface WazifahSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wazifahs: Wazifah[];
  selectedWazifahId: string;
  onSelect: (wazifah: Wazifah) => void;
  onOpenCreateCustom: () => void;
}

const CATEGORIES: ('All' | WazifahCategory)[] = [
  'All',
  'Daily',
  'Praise',
  'Protection',
  'Forgiveness',
  'Relief & Hajat',
  'Custom',
];

export const WazifahSelectorModal: React.FC<WazifahSelectorModalProps> = ({
  isOpen,
  onClose,
  wazifahs,
  selectedWazifahId,
  onSelect,
  onOpenCreateCustom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | WazifahCategory>('All');

  if (!isOpen) return null;

  const filtered = wazifahs.filter(w => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.transliteration && w.transliteration.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.translation && w.translation.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <h2 className="text-lg font-bold text-slate-100">Select Dhikr or Wazifah</h2>
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
              placeholder="Search by title, transliteration or meaning..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-slate-700 pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No Wazifahs found matching "{searchTerm}".
            </div>
          ) : (
            filtered.map(w => {
              const isSelected = w.id === selectedWazifahId;
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
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{w.title}</h3>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                        Target: {w.recommendedTarget}
                      </span>
                      {w.isCustom && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                          Custom
                        </span>
                      )}
                    </div>

                    {w.arabicText && (
                      <p className="text-lg font-serif text-amber-200 font-semibold py-0.5">
                        {w.arabicText}
                      </p>
                    )}

                    {w.transliteration && (
                      <p className="text-xs text-slate-300 italic">{w.transliteration}</p>
                    )}

                    {w.translation && (
                      <p className="text-xs text-slate-400">{w.translation}</p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-amber-500 text-slate-950">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
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
            className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 rounded-xl border border-amber-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Wazifah</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
