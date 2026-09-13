import React from 'react';
import { NavigationTab } from '../types';
import { LOGO_URL } from '../data/mockData';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  unreadAlertsCount?: number;
  language?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  unreadAlertsCount = 0,
  language = 'english',
}) => {
  const t = getTranslation(language);

  const navItems: { id: NavigationTab; label: string; icon: string; badge?: number }[] = [
    { id: 'home', label: t.home, icon: 'home' },
    { id: 'onboarding', label: 'Details & Contacts', icon: 'contact_phone' },
    { id: 'game', label: t.games, icon: 'extension' },
    { id: 'reminders', label: t.reminders, icon: 'event_note' },
    { id: 'profile-creation', label: t.profile, icon: 'person' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const isCaregiverActive = activeTab === 'caregiver-overview' || activeTab === 'alerts';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-[#f2f4f6] dark:bg-[#191c1e] z-50 flex flex-col pt-8 pb-8 shadow-[6px_0_16px_rgba(0,0,0,0.03)] border-r border-[#e1e2e5] dark:border-[#282a2d] transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div 
          onClick={() => handleNavClick('home')}
          className="px-8 mb-10 flex items-center gap-4 cursor-pointer group"
        >
          <img
            alt="MindSpark logo"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            src={LOGO_URL}
          />
          <span className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0] tracking-tight">
            MindSpark
          </span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-4 space-y-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold text-lg text-left ${
                  isActive
                    ? 'bg-[#abdefe] dark:bg-[#104c67] text-[#2e637e] dark:text-[#c4e7ff] shadow-[inset_4px_4px_8px_rgba(255,255,255,0.8),inset_-4px_-4px_8px_rgba(209,201,188,0.5)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]'
                    : 'text-[#40484d] dark:text-[#c0c7ce] hover:text-[#191c1e] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}

          <hr className="border-[#c0c7ce]/50 dark:border-[#40484d] mx-4 my-4" />

          {/* Caregiver Link */}
          <button
            onClick={() => handleNavClick('caregiver-overview')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold text-lg text-left relative ${
              isCaregiverActive
                ? 'bg-[#abdefe] dark:bg-[#104c67] text-[#2e637e] dark:text-[#c4e7ff] shadow-[inset_4px_4px_8px_rgba(255,255,255,0.8),inset_-4px_-4px_8px_rgba(209,201,188,0.5)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]'
                : 'text-[#40484d] dark:text-[#c0c7ce] hover:text-[#191c1e] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: isCaregiverActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              supervisor_account
            </span>
            <span className="flex-1">Caregiver</span>
            {unreadAlertsCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-[#ba1a1a] text-white text-xs font-bold flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom Quick Status */}
        <div className="px-6 pt-4 text-xs text-[#40484d] dark:text-[#8b9298] flex items-center justify-between">
          <span>v2.4 Cognitive Safe</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Ready
          </span>
        </div>
      </aside>
    </>
  );
};
