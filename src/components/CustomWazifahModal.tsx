import React, { useState } from 'react';
import { Wazifah, WazifahCategory } from '../types/wazifah';
import { Plus, X, BookOpen } from 'lucide-react';

interface CustomWazifahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wazifah: Wazifah) => void;
}

const CATEGORIES: WazifahCategory[] = [
  'Custom',
  'Daily',
  'Praise',
  'Protection',
  'Forgiveness',
  'Relief & Hajat',
];

export const CustomWazifahModal: React.FC<CustomWazifahModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [translation, setTranslation] = useState('');
  const [recommendedTarget, setRecommendedTarget] = useState(100);
  const [category, setCategory] = useState<WazifahCategory>('Custom');
  const [niyyah, setNiyyah] = useState('');
  const [benefits, setBenefits] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newWazifah: Wazifah = {
      id: 'custom_' + Date.now(),
      title: title.trim(),
      arabicText: arabicText.trim() || undefined,
      transliteration: transliteration.trim() || undefined,
      translation: translation.trim() || undefined,
      recommendedTarget: recommendedTarget || 100,
      category,
      niyyah: niyyah.trim() || undefined,
      benefits: benefits.trim() || undefined,
      isCustom: true,
    };

    onSave(newWazifah);

    // Reset Form
    setTitle('');
    setArabicText('');
    setTransliteration('');
    setTranslation('');
    setRecommendedTarget(100);
    setCategory('Custom');
    setNiyyah('');
    setBenefits('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Add Custom Wazifah</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Title / Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Special Durood, Dua for Ease"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Count
              </label>
              <input
                type="number"
                min="1"
                max="99999"
                value={recommendedTarget}
                onChange={e => setRecommendedTarget(parseInt(e.target.value) || 100)}
                className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as WazifahCategory)}
                className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Arabic Text (Optional)
            </label>
            <input
              type="text"
              dir="rtl"
              placeholder="e.g., سُبْحَانَ اللَّهِ"
              value={arabicText}
              onChange={e => setArabicText(e.target.value)}
              className="w-full bg-slate-950 text-amber-200 placeholder-slate-600 rounded-xl border border-slate-700 px-3 py-2 font-serif text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Transliteration (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., SubhanAllah"
              value={transliteration}
              onChange={e => setTransliteration(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Translation / Meaning (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Glory be to Allah"
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Niyyah / Spiritual Intention (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Reciting after Fajr prayer for peace of mind..."
              value={niyyah}
              onChange={e => setNiyyah(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Virtue / Benefits (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Protection and peace"
              value={benefits}
              onChange={e => setBenefits(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save Wazifah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
