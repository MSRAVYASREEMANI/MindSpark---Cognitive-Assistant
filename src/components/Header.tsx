import React from 'react';
import { EEGStatus, UserProfile, NavigationTab } from '../types';
import { getLanguageByCode } from '../utils/languages';
import { getTranslation } from '../utils/translations';

interface HeaderProps {
  eegStatus: EEGStatus;
  userProfile: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenMobileMenu: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenLanguageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  eegStatus,
  userProfile,
  isDarkMode,
  onToggleDarkMode,
  onNavigate,
  onOpenMobileMenu,
  isOffline,
  onToggleOffline,
  onOpenLanguageModal,
}) => {
  const currentLang = getLanguageByCode(userProfile.language);
  const t = getTranslation(userProfile.language);

  return (
    <header className="fixed top-0 left-0 lg:left-[280px] right-0 h-20 bg-[#f8f9fc]/85 dark:bg-[#111416]/85 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] z-40 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b border-[#e1e2e5]/60 dark:border-[#282a2d]">
      {/* Left side actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-[#edeef0] dark:bg-[#1e2023] text-[#191c1e] dark:text-white shadow-neu-extruded"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* EEG Connection Status Badge */}
        <button
          onClick={() => onNavigate('connect-headset')}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#e7e8eb] dark:bg-[#282a2d] rounded-full shadow-[4px_4px_8px_rgba(209,201,188,0.35),-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 active:scale-95 group"
          title="Click to manage EEG Headset"
        >
          <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${eegStatus.isConnected ? 'text-[#306480] dark:text-[#9bcded] animate-pulse' : 'text-gray-400'}`}>
            sensors
          </span>
          <span className="font-semibold text-xs sm:text-sm text-[#40484d] dark:text-[#c0c7ce] hidden xs:inline">
            {eegStatus.isConnected ? t.eegConnected : t.eegDisconnected}
          </span>
        </button>

        {/* Offline Simulator Pill */}
        <button
          onClick={onToggleOffline}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isOffline
              ? 'bg-[#ffdad6] text-[#93000a] dark:bg-[#93000a]/40 dark:text-[#ffdad6] border border-[#ba1a1a]/30'
              : 'bg-[#edeef0] dark:bg-[#1e2023] text-[#40484d] dark:text-[#c0c7ce]'
          }`}
          title="Toggle online / offline mode to test offline capabilities"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isOffline ? 'wifi_off' : 'wifi'}
          </span>
          <span>{isOffline ? t.offlineMode : t.onlineMode}</span>
        </button>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Language Switcher Pill Button */}
        <button
          onClick={onOpenLanguageModal}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#edeef0] dark:bg-[#1e2023] shadow-[4px_4px_8px_rgba(209,201,188,0.4),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3)] hover:border-[#003c53] transition-all hover:scale-105 active:scale-95 group border border-transparent"
          title="Change language (North-East Indian languages, Hindi, Telugu, English)"
        >
          <span className="material-symbols-outlined text-[18px] text-[#003c53] dark:text-[#94cef0]">
            {currentLang.iconName}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-bold text-[#003c53] dark:text-[#94cef0] leading-tight">
              {currentLang.name}
            </span>
            <span className="text-[10px] text-[#71787e] dark:text-[#a0a7ae] leading-none hidden sm:inline">
              {currentLang.nativeName.split(' ')[0]}
            </span>
          </div>
          <span className="material-symbols-outlined text-[#71787e] text-[18px] group-hover:translate-y-0.5 transition-transform">
            expand_more
          </span>
        </button>

        {/* Patient Details & Setup Quick Button */}
        <button
          onClick={() => onNavigate('onboarding')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#edeef0] dark:bg-[#1e2023] shadow-neu-extruded hover:bg-[#abdefe]/30 dark:hover:bg-[#104c67]/50 transition-all hover:scale-105 active:scale-95 border border-[#c0c7ce]/40"
          title="Click to view or edit patient details & emergency contacts"
        >
          <span className="material-symbols-outlined text-[18px] text-[#003c53] dark:text-[#94cef0]">
            badge
          </span>
          <span className="text-xs font-bold text-[#003c53] dark:text-[#94cef0]">
            {userProfile.name} ({userProfile.emergencyContacts?.length || 0} Contacts)
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          aria-label="Toggle dark mode"
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[#edeef0] dark:bg-[#1e2023] shadow-[4px_4px_8px_rgba(209,201,188,0.4),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-2px_-2px_6px_rgba(255,255,255,0.05)] active:shadow-neu-recessed transition-all"
        >
          <span className="material-symbols-outlined text-[#191c1e] dark:text-[#f8f9fc] text-[20px] sm:text-[22px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => onNavigate('onboarding')}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[#003c53] dark:bg-[#94cef0] flex items-center justify-center shadow-lg ring-2 ring-white/60 dark:ring-white/20 transition-transform hover:scale-105 active:scale-95"
          title={`Profile & Emergency Setup for ${userProfile.name}`}
        >
          {userProfile.photoUrl ? (
            <img
              src={userProfile.photoUrl}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-white dark:text-[#001e2c] text-[24px]">
              person
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
