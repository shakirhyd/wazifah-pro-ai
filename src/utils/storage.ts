import { Dhikr, Wazifah, WazifahSession, UserSettings, DailySummary } from '../types/wazifah';
import { PRESET_DHIKRS, PRESET_WAZIFAHS } from '../data/presetDhikrsAndWazifahs';
import {
  auth,
  saveUserCustomWazifahCloud,
  deleteUserCustomWazifahCloud,
  saveUserSessionCloud,
  deleteUserSessionCloud,
  clearAllUserSessionsCloud,
  saveUserSettingsCloud,
} from '../lib/firebase';

const KEYS = {
  CUSTOM_DHIKRS: 'wazifah_custom_dhikrs_v2',
  CUSTOM_WAZIFAHS: 'wazifah_custom_wazifahs_v2',
  DELETED_DHIKR_IDS: 'wazifah_deleted_dhikrs_v2',
  DELETED_WAZIFAH_IDS: 'wazifah_deleted_wazifahs_v2',
  SESSIONS_LOG: 'wazifah_sessions_log_v2',
  USER_SETTINGS: 'wazifah_user_settings_v2',
  SELECTED_WAZIFAH_ID: 'wazifah_selected_id_v2',
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  soundVolume: 0.5,
  soundType: 'bead',
  theme: 'emerald',
  dailyTargetCount: 300,
  speedUnit: 'cpm',
  tapAnywhere: false,
  showArabic: true,
  showTransliteration: true,
  showTranslation: true,
};

// --- Deleted IDs helpers ---
export function getDeletedDhikrIds(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.DELETED_DHIKR_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedDhikrIds(ids: string[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEYS.DELETED_DHIKR_IDS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save deleted dhikrs list', e);
  }
}

export function getDeletedWazifahIds(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.DELETED_WAZIFAH_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedWazifahIds(ids: string[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEYS.DELETED_WAZIFAH_IDS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save deleted wazifahs list', e);
  }
}

// --- Custom Dhikrs ---
export function getCustomDhikrs(): Dhikr[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_DHIKRS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomDhikrs(dhikrs: Dhikr[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEYS.CUSTOM_DHIKRS, JSON.stringify(dhikrs));
  } catch (e) {
    console.error('Failed to save custom dhikrs', e);
  }
}

export function getAllDhikrs(): Dhikr[] {
  const custom = getCustomDhikrs();
  const deletedIds = getDeletedDhikrIds();
  const combined = [...PRESET_DHIKRS, ...custom];
  return combined.filter(d => !deletedIds.includes(d.id));
}

export function deleteDhikr(dhikrId: string): void {
  // If custom, remove from custom list
  const custom = getCustomDhikrs();
  const filteredCustom = custom.filter(d => d.id !== dhikrId);
  if (filteredCustom.length !== custom.length) {
    saveCustomDhikrs(filteredCustom);
  } else {
    // If preset, record as deleted
    const deleted = getDeletedDhikrIds();
    if (!deleted.includes(dhikrId)) {
      saveDeletedDhikrIds([...deleted, dhikrId]);
    }
  }

  // Also remove corresponding single wazifah if deleted
  const singleWazifahId = `single_wazifah_${dhikrId}`;
  const deletedWazifahs = getDeletedWazifahIds();
  if (!deletedWazifahs.includes(singleWazifahId)) {
    saveDeletedWazifahIds([...deletedWazifahs, singleWazifahId]);
  }
}

// --- Custom Wazifahs ---
export function getCustomWazifahs(): Wazifah[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_WAZIFAHS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomWazifahs(wazifahs: Wazifah[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEYS.CUSTOM_WAZIFAHS, JSON.stringify(wazifahs));
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      wazifahs.forEach(w => {
        saveUserCustomWazifahCloud(uid, w);
      });
    }
  } catch (e) {
    console.error('Failed to save custom wazifahs', e);
  }
}

export function getAllWazifahs(): Wazifah[] {
  const customWazifahs = getCustomWazifahs();

  // Also build single-item Wazifahs for individual Dhikrs so user can recite any single Dhikr as a Wazifah
  const allDhikrs = getAllDhikrs();
  const singleDhikrWazifahs: Wazifah[] = allDhikrs.map(d => ({
    id: `single_wazifah_${d.id}`,
    title: d.title,
    description: d.benefits || `Individual Dhikr recitation (${d.title})`,
    category: d.category,
    isCustom: d.isCustom,
    steps: [
      {
        dhikrId: d.id,
        dhikrTitle: d.title,
        arabicText: d.arabicText,
        transliteration: d.transliteration,
        translation: d.translation,
        targetCount: d.recommendedTarget,
        benefits: d.benefits,
        niyyah: d.niyyah,
      },
    ],
  }));

  const combined = [...PRESET_WAZIFAHS, ...customWazifahs, ...singleDhikrWazifahs];
  const deletedIds = getDeletedWazifahIds();
  return combined.filter(w => !deletedIds.includes(w.id));
}

export function deleteWazifah(wazifahId: string): void {
  // If custom wazifah, filter out from custom list
  const custom = getCustomWazifahs();
  const filteredCustom = custom.filter(w => w.id !== wazifahId);
  if (filteredCustom.length !== custom.length) {
    saveCustomWazifahs(filteredCustom);
    if (auth.currentUser) {
      deleteUserCustomWazifahCloud(auth.currentUser.uid, wazifahId);
    }
  } else {
    // If preset or single wazifah, record in deleted list
    const deleted = getDeletedWazifahIds();
    if (!deleted.includes(wazifahId)) {
      saveDeletedWazifahIds([...deleted, wazifahId]);
    }
  }
}

// --- User Settings ---
export function getUserSettings(): UserSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEYS.USER_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
    if (auth.currentUser) {
      saveUserSettingsCloud(auth.currentUser.uid, settings);
    }
  } catch (e) {
    console.error('Failed to save user settings', e);
  }
}

// --- Selected Wazifah ID ---
export function getSelectedWazifahId(): string {
  if (typeof localStorage === 'undefined') return PRESET_WAZIFAHS[0].id;
  try {
    return localStorage.getItem(KEYS.SELECTED_WAZIFAH_ID) || PRESET_WAZIFAHS[0].id;
  } catch {
    return PRESET_WAZIFAHS[0].id;
  }
}

export function saveSelectedWazifahId(id: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEYS.SELECTED_WAZIFAH_ID, id);
  } catch (e) {
    console.error('Failed to save selected wazifah id', e);
  }
}

// --- Sessions Log ---
export function getSessionsLog(): WazifahSession[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.SESSIONS_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessionLog(session: WazifahSession): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const current = getSessionsLog();
    const updated = [session, ...current];
    localStorage.setItem(KEYS.SESSIONS_LOG, JSON.stringify(updated));
    if (auth.currentUser) {
      saveUserSessionCloud(auth.currentUser.uid, session);
    }
  } catch (e) {
    console.error('Failed to save session log', e);
  }
}

export function deleteSessionLog(sessionId: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const current = getSessionsLog();
    const updated = current.filter(s => s.id !== sessionId);
    localStorage.setItem(KEYS.SESSIONS_LOG, JSON.stringify(updated));
    if (auth.currentUser) {
      deleteUserSessionCloud(auth.currentUser.uid, sessionId);
    }
  } catch (e) {
    console.error('Failed to delete session log', e);
  }
}

export function clearAllSessionsLog(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.SESSIONS_LOG);
    if (auth.currentUser) {
      clearAllUserSessionsCloud(auth.currentUser.uid);
    }
  } catch (e) {
    console.error('Failed to clear sessions log', e);
  }
}

// --- Analytics & Summaries ---
export function getDailySummaries(days: number = 30): DailySummary[] {
  const sessions = getSessionsLog();
  const map: Record<string, DailySummary> = {};

  // Initialize last `days` days with 0
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    map[dateStr] = {
      date: dateStr,
      totalCount: 0,
      totalDurationSeconds: 0,
      completedSessions: 0,
    };
  }

  sessions.forEach(s => {
    const dateStr = s.completedAt.split('T')[0];
    if (map[dateStr]) {
      map[dateStr].totalCount += s.count;
      map[dateStr].totalDurationSeconds += s.durationSeconds;
      map[dateStr].completedSessions += 1;
    }
  });

  return Object.values(map);
}

export function getCurrentStreak(): { currentStreak: number; longestStreak: number } {
  const sessions = getSessionsLog();
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const uniqueDates = Array.from(new Set(sessions.map(s => s.completedAt.split('T')[0]))).sort().reverse();
  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = new Date();

  // If active today or yesterday, count backwards
  const hasToday = uniqueDates.includes(todayStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    currentStreak = 0;
  } else {
    checkDate = hasToday ? new Date() : yesterday;
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  const sortedAsc = [...uniqueDates].sort();
  for (const dStr of sortedAsc) {
    const currDate = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  return { currentStreak, longestStreak };
}

// --- Data Backup Export/Import ---
export function exportUserDataJSON(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customWazifahs: getCustomWazifahs(),
    sessionsLog: getSessionsLog(),
    settings: getUserSettings(),
    selectedWazifahId: getSelectedWazifahId(),
  };
  return JSON.stringify(data, null, 2);
}

export function importUserDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.customWazifahs) saveCustomWazifahs(parsed.customWazifahs);
    if (parsed.sessionsLog) localStorage.setItem(KEYS.SESSIONS_LOG, JSON.stringify(parsed.sessionsLog));
    if (parsed.settings) saveUserSettings(parsed.settings);
    if (parsed.selectedWazifahId) saveSelectedWazifahId(parsed.selectedWazifahId);
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
}
