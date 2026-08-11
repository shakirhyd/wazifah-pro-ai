import React, { useState, useEffect, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { NiyyahCard } from '../components/NiyyahCard';
import { TasbeehCounter } from '../components/TasbeehCounter';
import { WazifahSelectorModal } from '../components/WazifahSelectorModal';
import { DhikrAndWazifahBuilderModal } from '../components/DhikrAndWazifahBuilderModal';
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
  deleteWazifah,
} from '../utils/storage';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const [wazifahs, setWazifahs] = useState<Wazifah[]>([]);
  const [selectedWazifah, setSelectedWazifah] = useState<Wazifah | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [sessions, setSessions] = useState<WazifahSession[]>([]);

  // Modals state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load data on mount / update
  const reloadData = useCallback(() => {
    const all = getAllWazifahs();
    setWazifahs(all);

    const selId = getSelectedWazifahId();
    const found = all.find(w => w.id === selId) || all[0];
    setSelectedWazifah(found);
    setActiveStepIndex(0);

    setSettings(getUserSettings());
    setSessions(getSessionsLog());
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Handle selecting a Wazifah
  const handleSelectWazifah = (wazifah: Wazifah) => {
    setSelectedWazifah(wazifah);
    setActiveStepIndex(0);
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

  // Handle creation of new combined Wazifah or Dhikr
  const handleWazifahCreated = (newWazifah: Wazifah) => {
    reloadData();
    setSelectedWazifah(newWazifah);
    setActiveStepIndex(0);
    saveSelectedWazifahId(newWazifah.id);
  };

  // Handle deleting a Wazifah
  const handleDeleteWazifah = (wazifahId: string) => {
    deleteWazifah(wazifahId);
    reloadData();
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
        onOpenBuilder={() => setIsBuilderOpen(true)}
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
              activeStepIndex={activeStepIndex}
              onSelectStep={idx => setActiveStepIndex(idx)}
              onOpenSelector={() => setIsSelectorOpen(true)}
            />

            {/* Central Tasbeeh Counter */}
            <TasbeehCounter
              wazifah={selectedWazifah}
              activeStepIndex={activeStepIndex}
              onSelectStep={idx => setActiveStepIndex(idx)}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onSaveSession={handleSaveSession}
            />
          </>
        )}

        {/* Footer info */}
        <footer className="text-center text-[11px] text-slate-500 py-2 border-t border-slate-800/60">
          Wazifah Tracker PRO • Combine Dhikrs & Track Timed Routines
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
          onDeleteWazifah={handleDeleteWazifah}
          onOpenCreateCustom={() => setIsBuilderOpen(true)}
        />
      )}

      <DhikrAndWazifahBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onWazifahCreated={handleWazifahCreated}
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
