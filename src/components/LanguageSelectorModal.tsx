import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption, getLanguageByCode } from '../utils/languages';
import { speakText, stopSpeaking, playTone } from '../utils/audio';

interface LanguageSelectorModalProps {
  currentLanguage: string;
  onSelectLanguage: (languageCode: string) => void;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'north-east' | 'national'>('all');
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesCategory = activeCategory === 'all' || lang.category === activeCategory;
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePreviewAudio = (e: React.MouseEvent, lang: LanguageOption) => {
    e.stopPropagation();
    if (playingCode === lang.code) {
      stopSpeaking();
      setPlayingCode(null);
      return;
    }
    setPlayingCode(lang.code);
    playTone(523.25, 'sine', 0.1);
    speakText(lang.greeting, () => setPlayingCode(null), lang.code);
  };

  const handleSelect = (lang: LanguageOption) => {
    onSelectLanguage(lang.code);
    playTone(659.25, 'sine', 0.15);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#f8f9fc] dark:bg-[#191c1e] rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/60 dark:border-white/10 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e1e2e5] dark:border-[#282a2d] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[26px]">translate</span>
            </div>
            <div>
              <h2 className="font-bold text-2xl md:text-3xl text-[#003c53] dark:text-[#94cef0] tracking-tight">
                Select Language
              </h2>
              <p className="text-xs md:text-sm text-[#40484d] dark:text-[#c0c7ce]">
                North-East Indian Languages, Hindi, Telugu & English
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-[#edeef0] dark:bg-[#282a2d] flex items-center justify-center text-[#71787e] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3 mb-4">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71787e]">
              search
            </span>
            <input
              type="text"
              placeholder="Search language, native script, or region (e.g. Assam, Mizo, Hindi, Telugu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#003c53] text-white shadow-sm'
                  : 'bg-white dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] border border-[#c0c7ce]/40'
              }`}
            >
              All Languages ({SUPPORTED_LANGUAGES.length})
            </button>
            <button
              onClick={() => setActiveCategory('north-east')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'north-east'
                  ? 'bg-[#003c53] text-white shadow-sm'
                  : 'bg-white dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] border border-[#c0c7ce]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">eco</span>
              <span>North-East India (11)</span>
            </button>
            <button
              onClick={() => setActiveCategory('national')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'national'
                  ? 'bg-[#003c53] text-white shadow-sm'
                  : 'bg-white dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] border border-[#c0c7ce]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">flag</span>
              <span>Hindi, Telugu & English (3)</span>
            </button>
          </div>
        </div>

        {/* Languages Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 pb-4">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            const isPlaying = playingCode === lang.code;

            return (
              <div
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                  isSelected
                    ? 'bg-[#003c53] text-white border-[#003c53] shadow-lg ring-2 ring-[#94cef0]'
                    : 'bg-white dark:bg-[#282a2d] text-[#191c1e] dark:text-white border-[#e1e2e5]/70 dark:border-[#383b40] hover:border-[#003c53] hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#f2f4f6] dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{lang.iconName}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base truncate">
                        {lang.name}
                      </h4>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-[#94cef0]' : 'text-[#306480] dark:text-[#9bcded]'
                      }`}
                    >
                      {lang.nativeName}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs block truncate ${
                          isSelected ? 'text-white/80' : 'text-[#71787e]'
                        }`}
                      >
                        {lang.region}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#edeef0] dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0]'
                        }`}
                      >
                        Audio Ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* Speaker Audio Preview Button */}
                <button
                  onClick={(e) => handlePreviewAudio(e, lang)}
                  title={`Listen to greeting in ${lang.name}`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110 active:scale-95 ${
                    isSelected
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-[#f2f4f6] dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] hover:bg-[#abdefe]/30'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isPlaying ? 'animate-bounce text-emerald-400' : ''}`}>
                    {isPlaying ? 'volume_up' : 'play_arrow'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-[#e1e2e5] dark:border-[#282a2d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71787e]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            <span>All North-East languages localized with native speech synthesizer tags</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#003c53] text-white font-bold text-sm shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
