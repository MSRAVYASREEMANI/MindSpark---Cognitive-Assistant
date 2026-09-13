import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, NavigationTab } from '../types';
import { speakText, stopSpeaking, addSpeechListener, playTone, playReminderChime } from '../utils/audio';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { getTranslation } from '../utils/translations';
import { CustomDPModal, resizeImageToSquareDataUrl } from './CustomDPModal';
import { DEFAULT_AVATAR } from '../data/mockData';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onSaveProfile,
  onNavigate,
}) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showDPModal, setShowDPModal] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [isAvatarDragging, setIsAvatarDragging] = useState<boolean>(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslation(formData.language);
  const currentLang = getLanguageByCode(formData.language);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  useEffect(() => {
    const unsub = addSpeechListener((speaking) => {
      setIsPlayingVoice(speaking);
    });
    return () => {
      unsub();
      stopSpeaking();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    playTone(523.25, 'sine', 0.1);
    speakText(
      `Profile and speech preferences updated for ${formData.name}.`,
      undefined,
      formData.language,
      formData.speechRate,
      formData.speechPitch
    );
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLanguageChange = (newLangCode: string) => {
    const nextProfile: UserProfile = {
      ...formData,
      language: newLangCode,
    };
    setFormData(nextProfile);
    const selected = getLanguageByCode(newLangCode);
    speakText(
      selected.greeting,
      undefined,
      newLangCode,
      nextProfile.speechRate,
      nextProfile.speechPitch
    );
  };

  const handleTestSpeech = () => {
    if (isPlayingVoice) {
      stopSpeaking();
    } else {
      const selected = getLanguageByCode(formData.language);
      speakText(
        selected.greeting,
        undefined,
        formData.language,
        formData.speechRate,
        formData.speechPitch
      );
    }
  };

  const handleUpdatePhoto = (newPhotoUrl: string) => {
    const nextProfile = { ...formData, photoUrl: newPhotoUrl };
    setFormData(nextProfile);
    onSaveProfile(nextProfile);
    setSaveSuccess(true);
    playTone(659.25, 'sine', 0.15);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetPhotoToDefault = () => {
    handleUpdatePhoto(DEFAULT_AVATAR);
    speakText('Profile picture reset to default.', undefined, formData.language);
  };

  const handleQuickFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const optimized = await resizeImageToSquareDataUrl(files[0], 320);
        handleUpdatePhoto(optimized);
        playReminderChime();
        speakText('Custom display picture uploaded and updated.');
      } catch (err: any) {
        alert(err.message || 'Error uploading photo');
      }
    }
  };

  const handleAvatarDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        const optimized = await resizeImageToSquareDataUrl(e.dataTransfer.files[0], 320);
        handleUpdatePhoto(optimized);
        playReminderChime();
        speakText('Custom display picture updated.');
      } catch (err: any) {
        alert(err.message || 'Error processing dropped image');
      }
    }
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-8 max-w-4xl mx-auto">
      {/* Background Weave */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="font-bold text-4xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight mb-2">
            {t.profile} & Setup
          </h1>
          <p className="text-xl text-[#40484d] dark:text-[#c0c7ce]">
            Manage patient details, North-East Indian regional language preferences, and emergency caregiver links.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e2023] rounded-3xl p-6 md:p-10 shadow-neu-extruded border border-white/60 dark:border-white/10 space-y-8">
          {/* Avatar & Custom DP Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#e1e2e5] dark:border-[#282a2d]">
            {/* Hidden quick file input for direct device upload */}
            <input
              type="file"
              ref={quickFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleQuickFileChange}
            />

            {/* Clickable & Drag-and-Drop Display Picture (DP) Container */}
            <div
              id="profile-avatar-container"
              onClick={() => setShowDPModal(true)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAvatarDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAvatarDragging(false);
              }}
              onDrop={handleAvatarDrop}
              className={`relative w-28 h-28 rounded-full overflow-hidden shadow-neu-extruded ring-4 cursor-pointer group transition-all ${
                isAvatarDragging
                  ? 'ring-[#003c53] dark:ring-[#94cef0] scale-105'
                  : 'ring-white dark:ring-[#282a2d] hover:ring-[#003c53]/50'
              }`}
              title="Click or drag a photo here to change Display Picture (DP)"
            >
              <img
                src={formData.photoUrl}
                alt={formData.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Hover Camera Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-[2px]">
                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                <span className="text-[10px] font-bold mt-0.5">Edit DP</span>
              </div>

              {/* Verified / Camera Corner Badge */}
              <div className="absolute bottom-1 right-1 bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] p-1 rounded-full shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h3 className="font-bold text-2xl text-[#191c1e] dark:text-white">
                  {formData.name}
                </h3>
                {formData.photoUrl !== DEFAULT_AVATAR && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#003c53]/10 dark:bg-[#94cef0]/20 text-[#003c53] dark:text-[#94cef0] text-[11px] font-bold w-fit mx-auto sm:mx-0">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Custom DP Active
                  </span>
                )}
              </div>
              <p className="text-sm text-[#40484d] dark:text-[#c0c7ce] mb-3">
                Patient Profile • EEG Calibrated • {currentLang.name} Active
              </p>

              {/* DP Controls */}
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  id="open-change-dp-modal-btn"
                  type="button"
                  onClick={() => setShowDPModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                  <span>Change DP / Avatar</span>
                </button>

                <button
                  id="quick-upload-photo-btn"
                  type="button"
                  onClick={() => quickFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-xs font-semibold text-[#003c53] dark:text-[#94cef0] hover:bg-[#e1e2e5] transition-colors flex items-center gap-1"
                  title="Upload image directly from device"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>Browse File</span>
                </button>

                {formData.photoUrl !== DEFAULT_AVATAR && (
                  <button
                    id="reset-dp-btn"
                    type="button"
                    onClick={handleResetPhotoToDefault}
                    className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                    title="Revert to default portrait"
                  >
                    <span className="material-symbols-outlined text-[16px]">undo</span>
                    <span>Reset DP</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('privacy-consent')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-semibold border border-amber-300/40 hover:bg-amber-100 transition-colors"
                >
                  Consent Status
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce]">
                  Preferred Interface & Speech Language ({SUPPORTED_LANGUAGES.length} Languages Available)
                </label>
                <button
                  type="button"
                  onClick={() => speakText(currentLang.greeting, undefined, formData.language)}
                  className="text-xs font-bold text-[#003c53] dark:text-[#94cef0] flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                  <span>Preview "{currentLang.greeting}"</span>
                </button>
              </div>

              <select
                value={formData.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              >
                <optgroup label="North-East Indian Languages">
                  {SUPPORTED_LANGUAGES.filter((l) => l.category === 'north-east').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} — {lang.nativeName} ({lang.region})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="National / Pan-India Languages">
                  {SUPPORTED_LANGUAGES.filter((l) => l.category === 'national').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} — {lang.nativeName} ({lang.region})
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-xs text-[#71787e] mt-1.5">
                Includes Assamese, Meitei (Manipuri), Bodo, Mizo, Khasi, Garo, Kokborok, Bengali (Tripura/Barak), Nagamese, Nepali (Sikkim), Nyishi (Arunachal), Hindi, Telugu, and English.
              </p>
            </div>

            {/* Speech Audio Preferences Module */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-[#f2f4f6] dark:bg-[#222529] border border-[#c0c7ce]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0]">volume_up</span>
                    <h4 className="font-bold text-base text-[#191c1e] dark:text-white">
                      Speech Audio Preferences
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#003c53]/10 dark:bg-[#94cef0]/20 text-[#003c53] dark:text-[#94cef0] text-[11px] font-bold">
                      {currentLang.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#71787e] dark:text-[#a0a7ae] mt-0.5">
                    Adjust speaking pace and vocal pitch for clear, gentle audio guidance and reminders.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestSpeech}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 w-fit ${
                    isPlayingVoice
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] text-white dark:text-[#001e2c]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPlayingVoice ? 'stop' : 'volume_up'}
                  </span>
                  <span>{isPlayingVoice ? 'Stop Audio' : `Test ${currentLang.name} Speech`}</span>
                </button>
              </div>

              {/* Sliders for Rate & Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e1e2e5] dark:border-[#383b40]">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#40484d] dark:text-[#c0c7ce] mb-1">
                    <span>Speaking Pace (Speed)</span>
                    <span className="text-[#003c53] dark:text-[#94cef0] font-bold">
                      {(formData.speechRate || 0.88).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.70"
                    max="1.20"
                    step="0.05"
                    value={formData.speechRate || 0.88}
                    onChange={(e) => setFormData({ ...formData, speechRate: parseFloat(e.target.value) })}
                    className="w-full accent-[#003c53] dark:accent-[#94cef0]"
                  />
                  <div className="flex justify-between text-[10px] text-[#71787e] mt-1">
                    <span>Gentle & Slow (0.7x)</span>
                    <span>Standard (1.0x)</span>
                    <span>Brisk (1.2x)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#40484d] dark:text-[#c0c7ce] mb-1">
                    <span>Vocal Pitch</span>
                    <span className="text-[#003c53] dark:text-[#94cef0] font-bold">
                      {(formData.speechPitch || 1.0).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.25"
                    step="0.05"
                    value={formData.speechPitch || 1.0}
                    onChange={(e) => setFormData({ ...formData, speechPitch: parseFloat(e.target.value) })}
                    className="w-full accent-[#003c53] dark:accent-[#94cef0]"
                  />
                  <div className="flex justify-between text-[10px] text-[#71787e] mt-1">
                    <span>Deeper (0.8x)</span>
                    <span>Natural (1.0x)</span>
                    <span>Higher (1.25x)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                Primary Caregiver Name
              </label>
              <input
                type="text"
                value={formData.caregiverName}
                onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                Caregiver Emergency Phone (India)
              </label>
              <input
                type="text"
                value={formData.caregiverPhone}
                onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                Emergency SOS Dispatch (India Dial 112 / Regional)
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Profile details saved and interface localized successfully!</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-8 py-3.5 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] font-semibold text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3.5 rounded-2xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white font-bold text-lg shadow-neu-extruded hover:scale-105 active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Custom DP / Avatar Manager Modal */}
      <CustomDPModal
        isOpen={showDPModal}
        currentPhotoUrl={formData.photoUrl}
        patientName={formData.name}
        onClose={() => setShowDPModal(false)}
        onSavePhoto={(newPhotoUrl) => {
          handleUpdatePhoto(newPhotoUrl);
        }}
      />
    </div>
  );
};
