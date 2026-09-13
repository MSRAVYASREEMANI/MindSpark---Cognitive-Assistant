export type NavigationTab = 
  | 'onboarding'
  | 'home' 
  | 'game' 
  | 'reminders' 
  | 'profile-creation' 
  | 'caregiver-overview' 
  | 'alerts' 
  | 'connect-headset'
  | 'privacy-consent';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  image: string;
  description: string;
  audioClue?: string;
}

export interface MemoryCard {
  id: string;
  memberId: string;
  name: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  category: 'medication' | 'meal' | 'activity' | 'call';
  status: 'overdue' | 'completed' | 'upcoming';
  dose?: string;
  details?: string;
}

export interface CaregiverAlert {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  priority: 'high' | 'system' | 'info';
  icon: string;
  actionText: string;
  actionType: 'call' | 'clinic' | 'reminder' | 'guide';
}

export interface SyncLogItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'synced' | 'pending' | 'queued';
  icon: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  gender?: string;
  city?: string;
  state?: string;
  language: string;
  voiceId?: string;
  voiceGender?: 'female' | 'male';
  speechRate?: number;
  speechPitch?: number;
  photoUrl: string;
  caregiverName: string;
  caregiverPhone: string;
  emergencyPhone: string;
  emergencyContacts: EmergencyContact[];
  medicalNotes?: string;
  hasConsentedToMedicalData: boolean;
  hasCompletedOnboarding: boolean;
}

export interface EEGStatus {
  isConnected: boolean;
  signalStrength: 'Strong' | 'Moderate' | 'Weak' | 'Disconnected';
  focusLevel: number; // 0 to 100
  batteryLevel: number; // 0 to 100
  isImpedanceHigh: boolean;
}

export interface CognitiveTrendDataPoint {
  id: string;
  day: string;
  dateLabel: string;
  fullDate: string;
  cognitiveScore: number;
  eegFocus: number;
  testsCompleted: number;
  primaryExercise: string;
  clinicalNote: string;
  prevWeekEegFocus?: number;
  prevWeekCognitiveScore?: number;
}
