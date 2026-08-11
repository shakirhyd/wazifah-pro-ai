import React, { useState } from 'react';
import { Dhikr, Wazifah, DhikrCategory, WazifahCategory, WazifahStep } from '../types/wazifah';
import { getAllDhikrs, saveCustomDhikrs, getCustomDhikrs, saveCustomWazifahs, getCustomWazifahs, deleteDhikr } from '../utils/storage';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Layers, BookPlus, Check } from 'lucide-react';

interface DhikrAndWazifahBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWazifahCreated: (newWazifah: Wazifah) => void;
}

export const DhikrAndWazifahBuilderModal: React.FC<DhikrAndWazifahBuilderModalProps> = ({
  isOpen,
  onClose,
  onWazifahCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'create_dhikr' | 'combine_wazifah'>('create_dhikr');

  // All available dhikrs (preset + custom)
  const [dhikrsList, setDhikrsList] = useState<Dhikr[]>(() => getAllDhikrs());

  // --- State for Tab 1: Create Dhikr ---
  const [dhikrTitle, setDhikrTitle] = useState('');
  const [dhikrCategory, setDhikrCategory] = useState<DhikrCategory>('Praise');
  const [dhikrArabic, setDhikrArabic] = useState('');
  const [dhikrTransliteration, setDhikrTransliteration] = useState('');
  const [dhikrTranslation, setDhikrTranslation] = useState('');
  const [dhikrTarget, setDhikrTarget] = useState(33);
  const [dhikrBenefits, setDhikrBenefits] = useState('');
  const [dhikrNiyyah, setDhikrNiyyah] = useState('');
  const [dhikrSuccessMsg, setDhikrSuccessMsg] = useState('');

  // --- State for Tab 2: Combine into Wazifah ---
  const [wazifahTitle, setWazifahTitle] = useState('');
  const [wazifahCategory, setWazifahCategory] = useState<WazifahCategory>('Custom Routine');
  const [wazifahDescription, setWazifahDescription] = useState('');
  const [selectedSteps, setSelectedSteps] = useState<WazifahStep[]>([]);
  const [wazifahError, setWazifahError] = useState('');

  if (!isOpen) return null;

  // Handle Save Custom Dhikr
  const handleSaveDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dhikrTitle.trim()) return;

    const newDhikr: Dhikr = {
      id: 'dhikr_custom_' + Date.now(),
      title: dhikrTitle.trim(),
      category: dhikrCategory,
      arabicText: dhikrArabic.trim() || undefined,
      transliteration: dhikrTransliteration.trim() || undefined,
      translation: dhikrTranslation.trim() || undefined,
      recommendedTarget: dhikrTarget || 33,
      benefits: dhikrBenefits.trim() || undefined,
      niyyah: dhikrNiyyah.trim() || undefined,
      isCustom: true,
    };

    const currentCustom = getCustomDhikrs();
    const updatedCustom = [newDhikr, ...currentCustom];
    saveCustomDhikrs(updatedCustom);

    // Refresh list
    setDhikrsList(getAllDhikrs());

    // Clear form & notify
    setDhikrTitle('');
    setDhikrArabic('');
    setDhikrTransliteration('');
    setDhikrTranslation('');
    setDhikrBenefits('');
    setDhikrNiyyah('');
    setDhikrTarget(33);

    setDhikrSuccessMsg(`Saved Dhikr "${newDhikr.title}"! You can now combine it into a Wazifah.`);
    setTimeout(() => setDhikrSuccessMsg(''), 4000);
  };

  // Add a Dhikr from library to Wazifah steps
  const handleAddStepFromDhikr = (dhikr: Dhikr) => {
    const newStep: WazifahStep = {
      dhikrId: dhikr.id,
      dhikrTitle: dhikr.title,
      arabicText: dhikr.arabicText,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
      targetCount: dhikr.recommendedTarget || 33,
      benefits: dhikr.benefits,
      niyyah: dhikr.niyyah,
    };
    setSelectedSteps(prev => [...prev, newStep]);
    setWazifahError('');
  };

  // Step reordering & modification
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedSteps.length) return;
    const updated = [...selectedSteps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSelectedSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    setSelectedSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepTargetChange = (index: number, val: number) => {
    const updated = [...selectedSteps];
    updated[index] = { ...updated[index], targetCount: Math.max(1, val) };
    setSelectedSteps(updated);
  };

  // Save Combined Wazifah
  const handleSaveWazifah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wazifahTitle.trim()) {
      setWazifahError('Please enter a Title for this Wazifah routine.');
      return;
    }
    if (selectedSteps.length === 0) {
      setWazifahError('Please add at least 1 Dhikr to combine into this Wazifah.');
      return;
    }

    const newWazifah: Wazifah = {
      id: 'wazifah_custom_' + Date.now(),
      title: wazifahTitle.trim(),
      category: wazifahCategory,
      description: wazifahDescription.trim() || undefined,
      steps: selectedSteps,
      isCustom: true,
    };

    const currentCustom = getCustomWazifahs();
    saveCustomWazifahs([newWazifah, ...currentCustom]);

    onWazifahCreated(newWazifah);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Dhikr & Wazifah Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('create_dhikr')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'create_dhikr'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Create a Dhikr</span>
          </button>

          <button
            onClick={() => setActiveTab('combine_wazifah')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'combine_wazifah'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Combine Dhikrs into Wazifah ({selectedSteps.length})</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'create_dhikr' && (
            <form onSubmit={handleSaveDhikr} className="space-y-4">
              <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                Define an individual Dhikr phrase with its Arabic, transliteration, translation, and target count.
              </p>

              {dhikrSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{dhikrSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Dhikr Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SubhanAllah or Durood Taj"
                    value={dhikrTitle}
                    onChange={e => setDhikrTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={dhikrCategory}
                    onChange={e => setDhikrCategory(e.target.value as DhikrCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Praise">Praise</option>
                    <option value="Forgiveness">Forgiveness</option>
                    <option value="Protection">Protection</option>
                    <option value="Relief & Hajat">Relief & Hajat</option>
                    <option value="Salawat">Salawat</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Arabic Text (Optional)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="e.g. سُبْحَانَ اللَّهِ"
                  value={dhikrArabic}
                  onChange={e => setDhikrArabic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-lg text-amber-200 font-serif text-right focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Transliteration (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., SubhanAllah"
                    value={dhikrTransliteration}
                    onChange={e => setDhikrTransliteration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Default Target Count</label>
                  <input
                    type="number"
                    min="1"
                    max="99999"
                    value={dhikrTarget}
                    onChange={e => setDhikrTarget(parseInt(e.target.value) || 33)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Translation (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Glory be to Allah"
                  value={dhikrTranslation}
                  onChange={e => setDhikrTranslation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Niyyah / Intention (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Intention for praising Allah's grandeur..."
                    value={dhikrNiyyah}
                    onChange={e => setDhikrNiyyah(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Spiritual Virtues (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Rewards, peace, and protection..."
                    value={dhikrBenefits}
                    onChange={e => setDhikrBenefits(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Individual Dhikr</span>
              </button>
            </form>
          )}

          {activeTab === 'combine_wazifah' && (
            <form onSubmit={handleSaveWazifah} className="space-y-5">
              <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                Create a custom combined <strong>Wazifah routine</strong> by selecting multiple Dhikrs in sequence (e.g. SubhanAllah 33x + Alhamdulillah 33x + Allahu Akbar 34x).
              </p>

              {wazifahError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
                  {wazifahError}
                </div>
              )}

              {/* Routine Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Wazifah Routine Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tasbeeh Fatimah or Morning Protection Set"
                    value={wazifahTitle}
                    onChange={e => setWazifahTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Routine Category</label>
                  <select
                    value={wazifahCategory}
                    onChange={e => setWazifahCategory(e.target.value as WazifahCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Protection">Protection</option>
                    <option value="Forgiveness">Forgiveness</option>
                    <option value="Relief & Hajat">Relief & Hajat</option>
                    <option value="Praise">Praise</option>
                    <option value="Custom Routine">Custom Routine</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Routine Description / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Post-prayer combined set for spiritual peace and focus"
                  value={wazifahDescription}
                  onChange={e => setWazifahDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Add Dhikr to Routine Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Select Dhikrs from Library to Add as Steps:
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  {dhikrsList.map(dhikr => (
                    <div
                      key={dhikr.id}
                      className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => handleAddStepFromDhikr(dhikr)}
                        className="text-xs text-slate-200 hover:text-amber-300 transition-all flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{dhikr.title} ({dhikr.recommendedTarget})</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete Dhikr "${dhikr.title}"?`)) {
                            deleteDhikr(dhikr.id);
                            setDhikrsList(getAllDhikrs());
                            onDhikrOrWazifahCreated();
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors ml-1"
                        title="Delete Dhikr"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configured Routine Steps */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Steps in this Wazifah ({selectedSteps.length}):
                  </label>
                  {selectedSteps.length > 0 && (
                    <span className="text-xs text-amber-300 font-semibold">
                      Total Target: {selectedSteps.reduce((acc, s) => acc + s.targetCount, 0)} counts
                    </span>
                  )}
                </div>

                {selectedSteps.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No Dhikrs added yet. Click on any Dhikr above to include it as a step in this Wazifah.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="text-sm font-bold text-slate-100 block truncate">
                              {step.dhikrTitle}
                            </span>
                            {step.arabicText && (
                              <span className="text-xs font-serif text-amber-200/90 block truncate">
                                {step.arabicText}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-xs text-slate-400">Target:</span>
                          <input
                            type="number"
                            min="1"
                            max="99999"
                            value={step.targetCount}
                            onChange={e => handleStepTargetChange(idx, parseInt(e.target.value) || 33)}
                            className="w-16 bg-slate-900 text-amber-300 font-mono text-center text-xs font-bold rounded border border-slate-700 px-1 py-1 focus:outline-none focus:border-amber-400"
                          />

                          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-amber-300 disabled:opacity-30 transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 'down')}
                              disabled={idx === selectedSteps.length - 1}
                              className="p-1 text-slate-400 hover:text-amber-300 disabled:opacity-30 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                              title="Remove Step"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={selectedSteps.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>Save & Recite Combined Wazifah</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
