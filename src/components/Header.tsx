import React from 'react';
import { Flame, History, BarChart3, Settings, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { UserSettings } from '../types/wazifah';

interface HeaderProps {
  currentStreak: number;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenSelector: () => void;
  onOpenHistory: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  settings,
  onUpdateSettings,
  onOpenSelector,
  onOpenHistory,
  onOpenAnalytics,
  onOpenSettings,
}) => {
  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-3 transition-colors">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-900/20 border border-amber-300/30">
            📿
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-1.5 font-sans">
              <span>Wazifah Tracker</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Offline Tasbeeh & Timed Dhikr</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak Badge */}
          <div
            title="Active Daily Streak"
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />
            <span>{currentStreak}d</span>
          </div>

          {/* Quick Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Selector Button */}
          <button
            onClick={onOpenSelector}
            title="Browse Wazifahs"
            className="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="Session Log"
            className="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Analytics Button */}
          <button
            onClick={onOpenAnalytics}
            title="Reports & Analytics"
            className="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
