import React from 'react';
import { UserProfile, ReminderItem, NavigationTab } from '../types';
import { FAMILY_MEMBERS } from '../data/mockData';
import { speakText } from '../utils/audio';
import { getTranslation } from '../utils/translations';
import { getLanguageByCode } from '../utils/languages';

interface HomeScreenProps {
  userProfile: UserProfile;
  reminders: ReminderItem[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenSparky: () => void;
  onOpenEmergency: () => void;
  onPrepareTablet: () => void;
  isOffline: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onNavigate,
  onOpenSparky,
  onOpenEmergency,
  onPrepareTablet,
  isOffline,
}) => {
  const sarah = FAMILY_MEMBERS.find((f) => f.id === 'sarah') || FAMILY_MEMBERS[0];
  const t = getTranslation(userProfile.language);
  const langOpt = getLanguageByCode(userProfile.language);

  const handleHearSummary = () => {
    let summaryText = '';
    if (userProfile.language === 'assamese') {
      summaryText = `শুভ প্ৰভাত, ${userProfile.name}। গুৱাহাটীত আজি বতৰ অতি মনোৰম। এতিয়া আপোনাৰ ৰাতিপুৱাৰ ঔষধ খোৱাৰ সময়। দুপৰীয়া ২ বজাত শ্বিলঙৰ পৰা চাৰাহে ফোন কৰিব।`;
    } else if (userProfile.language === 'bengali') {
      summaryText = `শুভ সকাল, ${userProfile.name}। গুয়াহাটিতে আজকের আবহাওয়া চমৎকার। এখন আপনার সকালের ওষুধ নেওয়ার সময়। দুপুর ২টায় শিলং থেকে সারা ফোন করবে।`;
    } else if (userProfile.language === 'hindi') {
      summaryText = `शुभ प्रभात, ${userProfile.name}। पूर्वोत्तर भारत के गुवाहाटी में आज 24 डिग्री और सुहानी हवा है। अगला कार्य आपकी सुबह की दवा है, और दोपहर 2 बजे शिलांग से सारा कॉल करेगी।`;
    } else if (userProfile.language === 'telugu') {
      summaryText = `శుభోదయం, ${userProfile.name}। గౌహతిలో వాతావరణం ఆహ్లాదకరంగా ఉంది. తదుపరి కార్యాచరణ ఉదయం మందులు, మరియు మధ్యాహ్నం 2 గంటలకు సారా కాల్ చేస్తుంది.`;
    } else if (userProfile.language === 'nepali') {
      summaryText = `शुभ प्रभात, ${userProfile.name}। आज मौसम धेरै राम्रो छ। अब बिहानको औषधि लिने समय भयो। दिउँसो २ बजे साराको कल आउनेछ।`;
    } else if (userProfile.language === 'bodo') {
      summaryText = `फुंबिलि, ${userProfile.name}। दिनै बारहावा जोबोद मोजां। दानि खामानिया फुंनि मुलि जानाय, आरो साराया कल खालामगोन।`;
    } else if (userProfile.language === 'meitei') {
      summaryText = `অয়ুক ফজরবা, ${userProfile.name}। অদোমসি কমদৌৰিবগে? নুংথি ২ তারকপদা সারানা শিল্লংদগী কোল তৌরকখিগনি।`;
    } else {
      // Use localized strings from dictionary for Mizo, Khasi, Garo, Kokborok, Nagamese, Nyishi, English
      summaryText = `${t.goodMorning}, ${userProfile.name}. ${t.weatherLocation} ${t.nextUp}: ${t.takeMorningMed}. ${t.familyCallScheduled}.`;
    }

    speakText(
      summaryText,
      undefined,
      userProfile.language,
      userProfile.speechRate,
      userProfile.speechPitch
    );
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Background Watermark Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      {/* Header Greeting Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-3xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight">
              {t.goodMorning}, {userProfile.name}.
            </h1>
            <button
              onClick={handleHearSummary}
              title="Listen to daily summary"
              className="w-10 h-10 rounded-full bg-[#edeef0] dark:bg-[#1e2023] shadow-neu-extruded flex items-center justify-center text-[#003c53] dark:text-[#94cef0] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>

          {/* Patient Details Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-[#003c53]/10 dark:bg-[#94cef0]/20 text-[#003c53] dark:text-[#94cef0] text-xs font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">person</span>
              {userProfile.name}, {userProfile.age} yrs
            </span>
            <span className="px-3 py-1 rounded-full bg-[#edeef0] dark:bg-[#1e2023] text-[#40484d] dark:text-[#c0c7ce] text-xs font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {userProfile.city || 'Guwahati'}, {userProfile.state || 'Assam'}
            </span>
            <button
              onClick={() => onNavigate('onboarding')}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/40 text-[#003c53] dark:text-[#94cef0] text-xs font-bold hover:bg-[#abdefe]/20 transition-all flex items-center gap-1 shadow-sm"
              title="Edit personal details or emergency contacts"
            >
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              <span>Edit Details & Contacts</span>
            </button>
          </div>

          <p className="text-base md:text-xl text-[#40484d] dark:text-[#c0c7ce] mt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">wb_sunny</span>
            <span>{t.weatherLocation}</span>
          </p>
        </div>

        {isOffline && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffdad6] dark:bg-[#93000a]/40 text-[#93000a] dark:text-[#ffdad6] font-semibold text-base shadow-sm self-start md:self-auto border border-[#ba1a1a]/20">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            <span>{t.offlineMode}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Next Up & Today's Activity */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Next Up Section */}
          <div>
            <h2 className="font-bold text-2xl md:text-3xl text-[#191c1e] dark:text-white mb-4">
              {t.nextUp}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Medication */}
              <div
                onClick={() => onNavigate('reminders')}
                className="p-5 rounded-2xl bg-white dark:bg-[#1e2023] shadow-neu-extruded hover:shadow-neu-extruded-lg transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#0b5471] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    medication
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-[#191c1e] dark:text-white truncate">
                    {t.takeMorningMed}
                  </h3>
                  <p className="text-sm text-[#40484d] dark:text-[#c0c7ce] mt-0.5">
                    {t.afterBreakfast}
                  </p>
                </div>
              </div>

              {/* Card 2: Garden Walk */}
              <div
                onClick={() => onNavigate('reminders')}
                className="p-5 rounded-2xl bg-white dark:bg-[#1e2023] shadow-neu-extruded hover:shadow-neu-extruded-lg transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#abdefe] text-[#003c53] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_florist
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-[#191c1e] dark:text-white truncate">
                    {t.gardenWalk}
                  </h3>
                  <p className="text-sm text-[#40484d] dark:text-[#c0c7ce] mt-0.5">
                    10:30 AM • 30 mins
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#71787e] group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>

          {/* Today's Activity Section */}
          <div>
            <h2 className="font-bold text-2xl md:text-3xl text-[#191c1e] dark:text-white mb-4">
              {t.todaysActivity}
            </h2>

            <div className="bg-[#f2f4f6] dark:bg-[#191c1e] rounded-3xl p-6 md:p-8 shadow-neu-extruded border border-[#e1e2e5]/60 dark:border-[#282a2d] flex flex-col md:flex-row gap-6 items-center">
              {/* Photo */}
              <div className="relative w-full md:w-56 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={sarah.image}
                  alt={sarah.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-[#003c53]/70 backdrop-blur-sm py-1.5 px-3 text-center">
                  <span className="text-white font-medium text-sm">
                    Sarah (Shillong, Meghalaya)
                  </span>
                </div>
              </div>

              {/* Activity Details */}
              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-bold text-2xl md:text-3xl text-[#003c53] dark:text-[#94cef0] mb-2">
                    {t.familyCallScheduled}
                  </h3>
                  <p className="text-lg md:text-xl text-[#40484d] dark:text-[#c0c7ce] leading-relaxed mb-6">
                    {t.familyCallDesc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={onPrepareTablet}
                    className="min-h-[56px] px-8 rounded-2xl bg-[#003c53] hover:bg-[#0b5471] text-white font-semibold text-lg flex items-center justify-center gap-3 shadow-neu-extruded transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[24px]">videocam</span>
                    <span>{t.prepareTablet}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('game')}
                    className="min-h-[56px] px-6 rounded-2xl bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] font-semibold text-lg flex items-center justify-center gap-2 shadow-neu-extruded transition-all hover:scale-105 active:scale-95 border border-[#c0c7ce]/30"
                  >
                    <span className="material-symbols-outlined text-[24px]">extension</span>
                    <span>{t.playGame}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Talk to Sparky & Emergency SOS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Talk to Sparky Card */}
          <div
            onClick={onOpenSparky}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#abdefe]/30 to-white/70 dark:from-[#104c67]/40 dark:to-[#1e2023] backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-neu-extruded hover:shadow-neu-extruded-lg transition-all cursor-pointer flex flex-col items-center text-center group relative overflow-hidden"
          >
            {/* Ambient Pulse circle */}
            <div className="w-20 h-20 rounded-full bg-white dark:bg-[#0b5471] shadow-neu-extruded flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0] text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                record_voice_over
              </span>
            </div>

            <h3 className="font-bold text-3xl text-[#003c53] dark:text-[#94cef0] mb-3">
              {t.talkToSparky}
            </h3>

            <p className="text-lg text-[#40484d] dark:text-[#c0c7ce] leading-relaxed mb-6">
              {t.sparkyPrompt}
            </p>

            <div className="w-full py-3.5 px-6 rounded-full bg-[#003c53] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md group-hover:bg-[#0b5471] transition-colors">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span>{t.startSpeaking}</span>
            </div>
          </div>

          {/* Emergency SOS Card */}
          <div className="p-6 rounded-3xl bg-[#ffdad6]/40 dark:bg-[#93000a]/20 border border-[#ffdad6] dark:border-[#ba1a1a]/30 shadow-neu-extruded flex flex-col gap-4">
            <p className="text-center text-base font-semibold text-[#ba1a1a] dark:text-[#ffdad6]">
              {t.needHelpPrompt}
            </p>
            <button
              onClick={onOpenEmergency}
              className="w-full min-h-[64px] rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-xl flex items-center justify-center gap-3 shadow-[6px_6px_14px_rgba(186,26,26,0.35),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-neu-recessed transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                emergency
              </span>
              <span>{t.emergencySOS}</span>
            </button>
          </div>

          {/* Quick Emergency Contacts Directory Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] border border-white/60 dark:border-white/10 shadow-neu-extruded flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[20px]">contact_phone</span>
                <h4 className="font-bold text-base text-[#191c1e] dark:text-white">
                  Emergency Contacts ({userProfile.emergencyContacts?.length || 0})
                </h4>
              </div>
              <button
                onClick={() => onNavigate('onboarding')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                title="Add more emergency contacts"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Add (+)</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {userProfile.emergencyContacts?.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-[#f8f9fc] dark:bg-[#282a2d] flex items-center justify-between gap-2 text-xs border border-transparent hover:border-[#c0c7ce]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#191c1e] dark:text-white truncate">
                      {c.name} {c.isPrimary && <span className="text-[10px] text-red-600 font-bold ml-1">(Primary)</span>}
                    </p>
                    <p className="text-[11px] text-[#71787e] truncate">
                      {c.relationship} • {c.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold flex items-center gap-1 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
