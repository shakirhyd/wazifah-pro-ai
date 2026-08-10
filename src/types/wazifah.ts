export type WazifahCategory = 'Daily' | 'Protection' | 'Forgiveness' | 'Relief & Hajat' | 'Praise' | 'Custom';

export interface Wazifah {
  id: string;
  title: string;
  arabicText?: string;
  transliteration?: string;
  translation?: string;
  recommendedTarget: number;
  category: WazifahCategory;
  benefits?: string;
  niyyah?: string; // Intention/Notes
  isCustom?: boolean;
}

export interface WazifahSession {
  id: string;
  wazifahId: string;
  wazifahTitle: string;
  arabicText?: string;
  count: number;
  targetCount: number;
  durationSeconds: number;
  startedAt: string; // ISO date string
  completedAt: string; // ISO date string
  speedCountPerMin: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  soundType: 'bead' | 'click' | 'bell';
  theme: 'dark' | 'emerald' | 'amber';
  dailyTargetCount: number;
  autoLap: boolean;
  tapAnywhere: boolean;
  showArabic: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  totalCount: number;
  totalDurationSeconds: number;
  completedSessions: number;
}
