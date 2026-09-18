import React from 'react';
import { Flame, Settings, BookOpen, Volume2, VolumeX, Plus, User, RefreshCw } from 'lucide-react';
import { UserSettings } from '../types/wazifah';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentStreak: number;
  wazifahTitle?: string;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenSelector: () => void;
  onOpenBuilder: () => void;
  onOpenHistory?: () => void;
  onOpenAnalytics?: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  wazifahTitle,
  settings,
  onUpdateSettings,
  onOpenSelector,
  onOpenBuilder,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { currentUser, syncState } = useAuth();

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
            <h1 className="text-lg font-bold tracking-tight text-slate-100 font-sans">
              Wazifah Tracker
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Streak Badge */}
          <div
            title={wazifahTitle ? `Daily Streak for ${wazifahTitle}: ${currentStreak} days` : `Daily Streak: ${currentStreak} days`}
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-full text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />
            <span>{currentStreak}d</span>
          </div>

          {/* Quick Builder Button */}
          <button
            onClick={onOpenBuilder}
            title="Create Dhikr / Combine Wazifah"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Builder</span>
          </button>

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

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Account / Cloud Sync Avatar Button */}
          <button
            onClick={onOpenAuth}
            aria-label={
              currentUser
                ? `Account: ${currentUser.displayName || currentUser.email} (Cloud Synced)`
                : 'Account & Cloud Sync (Click to Sign In)'
            }
            title={
              currentUser
                ? `Account: ${currentUser.displayName || currentUser.email} (Cloud Synced)`
                : 'Account & Cloud Backup (Sign In)'
            }
            className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              currentUser
                ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-xs border border-emerald-400/50 hover:brightness-110 shadow-sm'
                : 'bg-slate-800/90 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/15 shadow-sm shadow-amber-950/20'
            }`}
          >
            {currentUser ? (
              <>
                <span>
                  {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                </span>
                {syncState === 'syncing' ? (
                  <RefreshCw className="w-2.5 h-2.5 text-amber-300 animate-spin absolute -bottom-0.5 -right-0.5 bg-slate-900 rounded-full" />
                ) : (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center"
                    title="Cloud Synced"
                  />
                )}
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-amber-300" />
                {/* Conspicuous amber indicator dot showing account option is available */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-900" />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
