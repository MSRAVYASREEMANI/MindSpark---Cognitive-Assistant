import React, { useState, useEffect } from 'react';
import { NavigationTab, UserProfile, ReminderItem, EEGStatus } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { GamesScreen } from './components/GamesScreen';
import { ScoreModal } from './components/ScoreModal';
import { HeadsetScreen } from './components/HeadsetScreen';
import { RemindersScreen } from './components/RemindersScreen';
import { CaregiverPortal } from './components/CaregiverPortal';
import { ProfileScreen } from './components/ProfileScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PrivacyConsentModal } from './components/PrivacyConsentModal';
import { SparkyAssistantModal } from './components/SparkyAssistantModal';
import { EmergencyModal } from './components/EmergencyModal';
import { FamilyCallModal } from './components/FamilyCallModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { speakText } from './utils/audio';
import { getLanguageByCode } from './utils/languages';
import {
  loadUserProfile,
  saveUserProfile,
  loadReminders,
  saveReminders,
  loadEEGStatus,
  saveEEGStatus,
  loadDarkMode,
  saveDarkMode,
  saveGameScore,
} from './utils/storage';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    const profile = loadUserProfile();
    return profile.hasCompletedOnboarding ? 'home' : 'onboarding';
  });
  const [reminders, setReminders] = useState<ReminderItem[]>(() => loadReminders());
  const [eegStatus, setEegStatus] = useState<EEGStatus>(() => loadEEGStatus());

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadDarkMode());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [gameScore, setGameScore] = useState<{ memoryScore: number; focusLevel: string; timeSpent: string } | null>(null);
  const [showSparkyModal, setShowSparkyModal] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showFamilyCallModal, setShowFamilyCallModal] = useState<boolean>(false);
  const [showPrivacyConsentModal, setShowPrivacyConsentModal] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);

  // Sync dark mode class with root html/body and storage
  useEffect(() => {
    saveDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist user profile changes
  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  // Persist reminders changes
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Persist EEG status changes
  useEffect(() => {
    saveEEGStatus(eegStatus);
  }, [eegStatus]);

  const handleUpdateReminderStatus = (id: string, newStatus: 'overdue' | 'completed' | 'upcoming') => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleAddReminder = (newItem: ReminderItem) => {
    setReminders((prev) => [...prev, newItem]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSnoozeReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'upcoming',
            time: 'In 15 mins',
          };
        }
        return item;
      })
    );
  };

  const handleGameComplete = (score: { memoryScore: number; focusLevel: string; timeSpent: string }) => {
    setGameScore(score);
    saveGameScore({
      gameTitle: 'Cognitive Challenge',
      ...score,
    });
    speakText(
      'Wonderful job! You completed the memory challenge.',
      undefined,
      userProfile.language,
      userProfile.speechRate,
      userProfile.speechPitch
    );
  };

  const handleSelectLanguage = (langCode: string) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      language: langCode,
    };
    setUserProfile(updatedProfile);
    const lang = getLanguageByCode(langCode);
    speakText(
      lang.greeting,
      undefined,
      langCode,
      updatedProfile.speechRate,
      updatedProfile.speechPitch
    );
  };

  const handleForceSync = () => {
    saveReminders(reminders);
    saveUserProfile(userProfile);
    saveEEGStatus(eegStatus);
  };

  const handleCallPatient = () => {
    setShowFamilyCallModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#111416] text-[#191c1e] dark:text-[#e1e2e5] flex flex-col font-sans transition-colors duration-200">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'privacy-consent') {
            setShowPrivacyConsentModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        unreadAlertsCount={2}
        language={userProfile.language}
      />

      {/* Top Header */}
      <Header
        eegStatus={eegStatus}
        userProfile={userProfile}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onNavigate={(tab) => {
          if (tab === 'privacy-consent') {
            setShowPrivacyConsentModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        isOffline={isOffline}
        onToggleOffline={() => {
          const next = !isOffline;
          setIsOffline(next);
          speakText(
            next ? 'Switched to offline mode. Data is saved locally.' : 'Connected to network. Cloud sync enabled.',
            undefined,
            userProfile.language,
            userProfile.speechRate,
            userProfile.speechPitch
          );
        }}
        onOpenLanguageModal={() => setShowLanguageModal(true)}
      />

      {/* Main Content Area */}
      <main className="lg:pl-[280px] pt-20 flex-1 flex flex-col min-h-screen">
        {activeTab === 'home' && (
          <HomeScreen
            userProfile={userProfile}
            reminders={reminders}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSparky={() => setShowSparkyModal(true)}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            onPrepareTablet={() => setShowFamilyCallModal(true)}
            isOffline={isOffline}
          />
        )}

        {activeTab === 'game' && (
          <GamesScreen
            onExitGame={() => setActiveTab('home')}
            onGameComplete={handleGameComplete}
            eegStatus={eegStatus}
          />
        )}

        {activeTab === 'connect-headset' && (
          <HeadsetScreen
            eegStatus={eegStatus}
            onUpdateEEGStatus={(updated) => setEegStatus((prev) => ({ ...prev, ...updated }))}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersScreen
            reminders={reminders}
            userProfile={userProfile}
            onUpdateReminderStatus={handleUpdateReminderStatus}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onSnoozeReminder={handleSnoozeReminder}
            onCallCare={() => setShowEmergencyModal(true)}
          />
        )}

        {(activeTab === 'caregiver-overview' || activeTab === 'alerts') && (
          <CaregiverPortal
            userProfile={userProfile}
            eegStatus={eegStatus}
            isOffline={isOffline}
            onForceSync={handleForceSync}
            onNavigate={(tab) => {
              if (tab === 'privacy-consent') {
                setShowPrivacyConsentModal(true);
              } else {
                setActiveTab(tab);
              }
            }}
            onCallPatient={handleCallPatient}
            onAddReminder={handleAddReminder}
          />
        )}

        {activeTab === 'profile-creation' && (
          <ProfileScreen
            userProfile={userProfile}
            onSaveProfile={(updated) => setUserProfile(updated)}
            onNavigate={(tab) => {
              if (tab === 'privacy-consent') {
                setShowPrivacyConsentModal(true);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingScreen
            initialProfile={userProfile}
            isEditing={userProfile.hasCompletedOnboarding}
            onSaveAndContinue={(updated) => {
              setUserProfile(updated);
              setActiveTab('home');
            }}
            onCancel={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Game Score / Completion Modal */}
      {gameScore && (
        <ScoreModal
          score={gameScore}
          onBackToHome={() => {
            setGameScore(null);
            setActiveTab('home');
          }}
          onPlayAgain={() => {
            setGameScore(null);
            setActiveTab('game');
          }}
        />
      )}

      {/* Sparky AI Companion Modal */}
      {showSparkyModal && (
        <SparkyAssistantModal
          userProfile={userProfile}
          reminders={reminders}
          onClose={() => setShowSparkyModal(false)}
        />
      )}

      {/* Emergency SOS Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          userProfile={userProfile}
          onClose={() => setShowEmergencyModal(false)}
          onOpenSparky={() => {
            setShowEmergencyModal(false);
            setShowSparkyModal(true);
          }}
          onOpenManageContacts={() => {
            setShowEmergencyModal(false);
            setActiveTab('onboarding');
          }}
        />
      )}

      {/* Family Call Modal */}
      {showFamilyCallModal && (
        <FamilyCallModal onClose={() => setShowFamilyCallModal(false)} />
      )}

      {/* Medical Data & Privacy Consent Modal */}
      {showPrivacyConsentModal && (
        <PrivacyConsentModal
          hasConsented={userProfile.hasConsentedToMedicalData}
          onAgree={() => setUserProfile((prev) => ({ ...prev, hasConsentedToMedicalData: true }))}
          onClose={() => setShowPrivacyConsentModal(false)}
        />
      )}

      {/* Language Selector Modal */}
      {showLanguageModal && (
        <LanguageSelectorModal
          currentLanguage={userProfile.language}
          onSelectLanguage={handleSelectLanguage}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </div>
  );
}

export default App;
