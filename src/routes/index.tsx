import React, { useState, useEffect, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { NiyyahCard } from '../components/NiyyahCard';
import { TasbeehCounter } from '../components/TasbeehCounter';
import { WazifahSelectorModal } from '../components/WazifahSelectorModal';
import { CustomWazifahModal } from '../components/CustomWazifahModal';
import { SessionHistoryModal } from '../components/SessionHistoryModal';
import { AnalyticsModal } from '../components/AnalyticsModal';
import { SettingsModal } from '../components/SettingsModal';
import { Wazifah, WazifahSession, UserSettings } from '../types/wazifah';
import {
  getAllWazifahs,
  getSelectedWazifahId,
  saveSelectedWazifahId,
  getUserSettings,
  saveUserSettings,
  getSessionsLog,
  saveSessionLog,
  deleteSessionLog,
  clearAllSessionsLog,
  getDailySummaries,
  getCurrentStreak,
  saveCustomWazifahs,
  getCustomWazifahs,
} from '../utils/storage';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const [wazifahs, setWazifahs] = useState<Wazifah[]>([]);
  const [selectedWazifah, setSelectedWazifah] = useState<Wazifah | null>(null);
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [sessions, setSessions] = useState<WazifahSession[]>([]);

  // Modals state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load state on mount
  const reloadData = useCallback(() => {
    const all = getAllWazifahs();
    setWazifahs(all);

    const selId = getSelectedWazifahId();
    const found = all.find(w => w.id === selId) || all[0];
    setSelectedWazifah(found);

    setSettings(getUserSettings());
    setSessions(getSessionsLog());
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Handle selecting a Wazifah
  const handleSelectWazifah = (wazifah: Wazifah) => {
    setSelectedWazifah(wazifah);
    saveSelectedWazifahId(wazifah.id);
  };

  // Handle saving a session log
  const handleSaveSession = (session: WazifahSession) => {
    saveSessionLog(session);
    setSessions(getSessionsLog());
  };

  // Handle deleting a session
  const handleDeleteSession = (sessionId: string) => {
    deleteSessionLog(sessionId);
    setSessions(getSessionsLog());
  };

  // Handle clearing all sessions
  const handleClearAllSessions = () => {
    clearAllSessionsLog();
    setSessions([]);
  };

  // Handle saving custom wazifah
  const handleSaveCustomWazifah = (newWazifah: Wazifah) => {
    const currentCustom = getCustomWazifahs();
    const updated = [newWazifah, ...currentCustom];
    saveCustomWazifahs(updated);

    // Refresh state and select the new custom wazifah
    const all = getAllWazifahs();
    setWazifahs(all);
    setSelectedWazifah(newWazifah);
    saveSelectedWazifahId(newWazifah.id);
  };

  // Handle settings update
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveUserSettings(newSettings);
  };

  const streakInfo = getCurrentStreak();
  const dailySummaries = getDailySummaries(30);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentStreak={streakInfo.currentStreak}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col gap-5 justify-between">
        {selectedWazifah && (
          <>
            {/* Top Niyyah / Info Card */}
            <NiyyahCard
              wazifah={selectedWazifah}
              onOpenSelector={() => setIsSelectorOpen(true)}
            />

            {/* Central Tasbeeh Counter */}
            <TasbeehCounter
              wazifah={selectedWazifah}
              settings={settings}
              onSaveSession={handleSaveSession}
            />
          </>
        )}

        {/* Footer info */}
        <footer className="text-center text-[11px] text-slate-500 py-2 border-t border-slate-800/60">
          Wazifah Tracker PRO • Offline Tasbeeh & Timed Session Reports
        </footer>
      </main>

      {/* Modals */}
      {selectedWazifah && (
        <WazifahSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          wazifahs={wazifahs}
          selectedWazifahId={selectedWazifah.id}
          onSelect={handleSelectWazifah}
          onOpenCreateCustom={() => setIsCustomOpen(true)}
        />
      )}

      <CustomWazifahModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        onSave={handleSaveCustomWazifah}
      />

      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllSessions}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        dailySummaries={dailySummaries}
        streakInfo={streakInfo}
        sessions={sessions}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDataReload={reloadData}
      />
    </div>
  );
}
