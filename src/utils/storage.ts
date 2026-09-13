// Local storage persistence helper for real-world reliability and offline use
import { UserProfile, ReminderItem, EEGStatus, CaregiverAlert } from '../types';
import { INITIAL_USER_PROFILE, INITIAL_REMINDERS, INITIAL_ALERTS } from '../data/mockData';

const KEYS = {
  USER_PROFILE: 'mindspark_user_profile_v2',
  REMINDERS: 'mindspark_reminders_v2',
  EEG_STATUS: 'mindspark_eeg_status_v2',
  ALERTS: 'mindspark_alerts_v2',
  GAME_SCORES: 'mindspark_game_scores_v2',
  CAREGIVER_NOTES: 'mindspark_caregiver_notes_v2',
  DARK_MODE: 'mindspark_dark_mode_v2',
};

export interface SavedGameScore {
  id: string;
  gameTitle: string;
  memoryScore: number;
  focusLevel: string;
  timeSpent: string;
  date: string;
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const contacts = Array.isArray(parsed.emergencyContacts) && parsed.emergencyContacts.length > 0
        ? parsed.emergencyContacts
        : INITIAL_USER_PROFILE.emergencyContacts;
      return {
        ...INITIAL_USER_PROFILE,
        ...parsed,
        emergencyContacts: contacts,
      };
    }
  } catch (err) {
    console.warn('Failed to load user profile from storage', err);
  }
  return INITIAL_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save user profile', err);
  }
}

export function loadReminders(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(KEYS.REMINDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load reminders from storage', err);
  }
  return INITIAL_REMINDERS;
}

export function saveReminders(reminders: ReminderItem[]): void {
  try {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.warn('Failed to save reminders', err);
  }
}

export function loadEEGStatus(): EEGStatus {
  const defaultStatus: EEGStatus = {
    isConnected: true,
    signalStrength: 'Strong',
    focusLevel: 85,
    batteryLevel: 92,
    isImpedanceHigh: false,
  };
  try {
    const raw = localStorage.getItem(KEYS.EEG_STATUS);
    if (raw) {
      return { ...defaultStatus, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to load EEG status', err);
  }
  return defaultStatus;
}

export function saveEEGStatus(status: EEGStatus): void {
  try {
    localStorage.setItem(KEYS.EEG_STATUS, JSON.stringify(status));
  } catch (err) {
    console.warn('Failed to save EEG status', err);
  }
}

export function loadAlerts(): CaregiverAlert[] {
  try {
    const raw = localStorage.getItem(KEYS.ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load alerts', err);
  }
  return INITIAL_ALERTS;
}

export function saveAlerts(alerts: CaregiverAlert[]): void {
  try {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  } catch (err) {
    console.warn('Failed to save alerts', err);
  }
}

export function loadGameScores(): SavedGameScore[] {
  try {
    const raw = localStorage.getItem(KEYS.GAME_SCORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load game scores', err);
  }
  return [];
}

export function saveGameScore(score: Omit<SavedGameScore, 'id' | 'date'>): SavedGameScore[] {
  try {
    const current = loadGameScores();
    const newEntry: SavedGameScore = {
      id: `score-${Date.now()}`,
      ...score,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updated = [newEntry, ...current].slice(0, 30); // keep last 30 scores
    localStorage.setItem(KEYS.GAME_SCORES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save game score', err);
    return [];
  }
}

export function loadDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(KEYS.DARK_MODE);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return false;
}

export function saveDarkMode(isDark: boolean): void {
  try {
    localStorage.setItem(KEYS.DARK_MODE, JSON.stringify(isDark));
  } catch {
    // fallback
  }
}
