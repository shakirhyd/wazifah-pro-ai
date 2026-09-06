import React, { useRef } from 'react';
import { UserSettings } from '../types/wazifah';
import { exportUserDataJSON, importUserDataJSON } from '../utils/storage';
import { Settings, Volume2, Smartphone, Download, Upload, X, Shield, RefreshCw, User as UserIcon, CloudCheck, LogIn, Sparkles, History, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onDataReload: () => void;
  onOpenAuth?: () => void;
  onOpenHistory?: () => void;
  onOpenAnalytics?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataReload,
  onOpenAuth,
  onOpenHistory,
  onOpenAnalytics,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportUserDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wazifah_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content && importUserDataJSON(content)) {
        alert('Data restored successfully!');
        onDataReload();
        onClose();
      } else {
        alert('Invalid backup file. Import failed.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs text-slate-300">
          {/* History & Analytics Metrics Section */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100">Activity & Records</span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">History & Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenHistory?.();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-750 hover:border-amber-400/40 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2.5 text-left cursor-pointer"
                title="View Session History Log"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300 shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 truncate">History</div>
                  <div className="text-[10px] text-slate-400 truncate">Session log</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAnalytics?.();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-750 hover:border-emerald-400/40 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2.5 text-left cursor-pointer"
                title="View Reports & Analytics"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 truncate">Metrics</div>
                  <div className="text-[10px] text-slate-400 truncate">Stats & trends</div>
                </div>
              </button>
            </div>
          </div>
          {/* Sound Settings */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio Feedback</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {settings.soundEnabled && (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Volume</span>
                    <span>{Math.round(settings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.soundVolume}
                    onChange={e => onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Bead Sound Effect</label>
                  <select
                    value={settings.soundType}
                    onChange={e => onUpdateSettings({ ...settings, soundType: e.target.value as 'bead' | 'click' | 'bell' })}
                    className="w-full bg-slate-900 text-slate-100 rounded-lg border border-slate-700 px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="bead">Wood Bead Click</option>
                    <option value="click">Mechanical Counter</option>
                    <option value="bell">Soft Metallic Chime</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Haptic Vibration */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-100">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Haptic Vibration</span>
            </div>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={e => onUpdateSettings({ ...settings, vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Daily Goal Target */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-100">Daily Goal Target Counts</label>
            <input
              type="number"
              min="10"
              max="99999"
              value={settings.dailyTargetCount}
              onChange={e => onUpdateSettings({ ...settings, dailyTargetCount: parseInt(e.target.value) || 300 })}
              className="w-full bg-slate-900 text-slate-100 rounded-lg border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Used to calculate daily streak progress on the dashboard.
            </p>
          </div>

          {/* Account & Cloud Sync */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <CloudCheck className="w-4 h-4 text-emerald-400" />
                <span>Account & Cloud Sync</span>
              </div>
              {currentUser && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Synced
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {currentUser.displayName || 'Wazifah Practitioner'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                </div>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manage Account & Cloud</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">
                  Sign in to automatically store your custom Wazifahs and metrics across devices.
                </p>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In or Create Free Account</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Data Backup & Restore */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-slate-100">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Backup & Restore Data</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Export your custom Wazifahs and session history to JSON backup or restore from a file.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExport}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/50">
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
