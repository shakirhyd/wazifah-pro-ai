export type DhikrCategory = 'Praise' | 'Forgiveness' | 'Protection' | 'Relief & Hajat' | 'Salawat' | 'Custom';
export type WazifahCategory = 'Daily' | 'Protection' | 'Forgiveness' | 'Relief & Hajat' | 'Praise' | 'Custom Routine';

export interface Dhikr {
  id: string;
  title: string;
  arabicText?: string;
  transliteration?: string;
  translation?: string;
  recommendedTarget: number;
  category: DhikrCategory;
  benefits?: string;
  niyyah?: string;
  isCustom?: boolean;
}

export interface WazifahStep {
  dhikrId: string;
  dhikrTitle: string;
  arabicText?: string;
  transliteration?: string;
  translation?: string;
  targetCount: number;
  benefits?: string;
  niyyah?: string;
}

export interface Wazifah {
  id: string;
  title: string;
  description?: string;
  category: WazifahCategory | string;
  steps: WazifahStep[];
  isCustom?: boolean;
}

export interface DhikrStepDetail {
  dhikrId?: string;
  dhikrTitle: string;
  count: number;
  targetCount: number;
  durationSeconds: number;
}

export interface WazifahSession {
  id: string;
  wazifahId: string;
  wazifahTitle: string;
  stepsSummary?: string; // e.g., "3 Dhikrs completed (SubhanAllah x33, Alhamdulillah x33, Allahu Akbar x34)"
  count: number; // Total count across all steps
  targetCount: number; // Total target across all steps
  durationSeconds: number;
  startedAt: string; // ISO date string
  completedAt: string; // ISO date string
  speedCountPerMin: number;
  dhikrDetails?: DhikrStepDetail[];
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  soundType: 'bead' | 'click' | 'bell';
  theme: 'dark' | 'emerald' | 'amber';
  dailyTargetCount: number;
  speedUnit: 'cpm' | 'sec_per_count';
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

