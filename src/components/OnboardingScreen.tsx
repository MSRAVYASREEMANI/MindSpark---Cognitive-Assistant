import React, { useState } from 'react';
import { UserProfile, EmergencyContact } from '../types';
import { DEFAULT_AVATAR, PLACEHOLDER_AVATAR, FAMILY_MEMBERS, LOGO_URL } from '../data/mockData';
import { speakText, playReminderChime } from '../utils/audio';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { CustomDPModal } from './CustomDPModal';

interface OnboardingScreenProps {
  initialProfile: UserProfile;
  onSaveAndContinue: (profile: UserProfile) => void;
  isEditing?: boolean;
  onCancel?: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'av-1', url: DEFAULT_AVATAR, label: 'Gentleman with Glasses' },
  { id: 'av-2', url: PLACEHOLDER_AVATAR, label: 'Friendly Senior' },
  { id: 'av-3', url: FAMILY_MEMBERS[0].image, label: 'Senior Woman' },
  { id: 'av-4', url: FAMILY_MEMBERS[4].image, label: 'Elder Man' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  initialProfile,
  onSaveAndContinue,
  isEditing = false,
  onCancel,
}) => {
  const [showDPModal, setShowDPModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserProfile>(() => {
    return {
      ...initialProfile,
      name: initialProfile.name || 'Arthur',
      age: initialProfile.age || 76,
      gender: initialProfile.gender || 'Male',
      city: initialProfile.city || 'Guwahati',
      state: initialProfile.state || 'Assam',
      language: initialProfile.language || 'english',
      caregiverName: initialProfile.caregiverName || 'Sarah (Daughter)',
      caregiverPhone: initialProfile.caregiverPhone || '+91 98640 12345',
      emergencyPhone: initialProfile.emergencyPhone || '+91 98640 12345',
      emergencyContacts:
        initialProfile.emergencyContacts && initialProfile.emergencyContacts.length > 0
          ? initialProfile.emergencyContacts
          : [
              {
                id: 'emg-1',
                name: 'Sarah Miller',
                relationship: 'Daughter & Primary Caregiver',
                phone: '+91 98640 12345',
                isPrimary: true,
              },
              {
                id: 'emg-2',
                name: 'Guwahati Neurological Emergency (GMCH)',
                relationship: 'Hospital Emergency Unit',
                phone: '+91 361 234 5678',
                isPrimary: false,
              },
            ],
      hasCompletedOnboarding: true,
    };
  });

  const [validationError, setValidationError] = useState<string>('');

  // Add Emergency Contact with + button
  const handleAddEmergencyContact = () => {
    playReminderChime();
    const newContact: EmergencyContact = {
      id: `emg-${Date.now()}`,
      name: '',
      relationship: '',
      phone: '',
      isPrimary: formData.emergencyContacts.length === 0,
    };
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));
    speakText('Added new emergency contact slot. Please enter their details.');
  };

  // Remove Emergency Contact
  const handleRemoveEmergencyContact = (id: string) => {
    if (formData.emergencyContacts.length <= 1) {
      setValidationError('Please maintain at least one emergency contact for patient safety.');
      return;
    }
    setValidationError('');
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== id),
    }));
  };

  // Update specific emergency contact
  const handleUpdateContact = (id: string, field: keyof EmergencyContact, value: any) => {
    setFormData((prev) => {
      let updatedContacts = prev.emergencyContacts.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: value };
        }
        // If marking as primary, unmark others
        if (field === 'isPrimary' && value === true) {
          return { ...c, isPrimary: false };
        }
        return c;
      });

      // Update caregiver phone or primary emergency phone if primary changed
      const primary = updatedContacts.find((c) => c.isPrimary) || updatedContacts[0];
      return {
        ...prev,
        emergencyContacts: updatedContacts,
        emergencyPhone: primary ? primary.phone : prev.emergencyPhone,
      };
    });
  };

  // Quick Pre-fill sample North-East context details
  const handlePrefillDemo = () => {
    setFormData({
      name: 'Arthur',
      age: 76,
      gender: 'Male',
      city: 'Guwahati',
      state: 'Assam',
      language: 'assamese',
      photoUrl: DEFAULT_AVATAR,
      caregiverName: 'Sarah Miller',
      caregiverPhone: '+91 98640 12345',
      emergencyPhone: '+91 98640 12345',
      emergencyContacts: [
        {
          id: 'emg-1',
          name: 'Sarah Miller',
          relationship: 'Daughter in Shillong (Primary)',
          phone: '+91 98640 12345',
          isPrimary: true,
        },
        {
          id: 'emg-2',
          name: 'David Miller',
          relationship: 'Grandson at IIT Guwahati',
          phone: '+91 98640 67890',
          isPrimary: false,
        },
        {
          id: 'emg-3',
          name: 'Guwahati Neurological Emergency',
          relationship: 'GMCH Hospital Unit',
          phone: '+91 361 234 5678',
          isPrimary: false,
        },
        {
          id: 'emg-4',
          name: 'Assam Police & Ambulance Helpline',
          relationship: 'State 112 Dispatch',
          phone: '112',
          isPrimary: false,
        },
      ],
      medicalNotes: 'Early-stage cognitive support. Takes morning Donepezil and enjoys Brahmaputra garden walks.',
      hasConsentedToMedicalData: true,
      hasCompletedOnboarding: true,
    });
    playReminderChime();
    speakText('Prefilled sample patient and emergency contacts for Guwahati, Assam.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Please enter patient or user name.');
      return;
    }
    if (!formData.age || formData.age < 1) {
      setValidationError('Please enter a valid age.');
      return;
    }
    if (formData.emergencyContacts.length === 0) {
      setValidationError('Please add at least one emergency contact.');
      return;
    }

    setValidationError('');
    playReminderChime();

    // Ensure at least one primary contact is set
    let contacts = [...formData.emergencyContacts];
    if (!contacts.some((c) => c.isPrimary) && contacts.length > 0) {
      contacts[0].isPrimary = true;
    }

    const finalProfile: UserProfile = {
      ...formData,
      emergencyContacts: contacts,
      hasCompletedOnboarding: true,
    };

    const lang = getLanguageByCode(finalProfile.language);
    speakText(
      `Welcome to MindSpark, ${finalProfile.name}. Your details and emergency contacts have been saved.`,
      undefined,
      finalProfile.language
    );

    onSaveAndContinue(finalProfile);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#111416] text-[#191c1e] dark:text-[#e1e2e5] flex flex-col font-sans py-8 px-4 sm:px-6 md:px-12 relative transition-colors duration-200">
      {/* Background Weave Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-silk-pattern z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e1e2e5] dark:border-[#282a2d]">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="MindSpark logo" className="h-12 w-auto object-contain" />
            <div>
              <span className="px-3 py-0.5 rounded-full bg-[#abdefe]/40 dark:bg-[#104c67]/40 text-[#003c53] dark:text-[#94cef0] text-xs font-bold uppercase tracking-wider">
                Initial Patient & Emergency Setup
              </span>
              <h1 className="font-bold text-3xl sm:text-4xl text-[#003c53] dark:text-[#94cef0] tracking-tight">
                {isEditing ? 'Update Patient Details & Contacts' : 'Welcome to MindSpark'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1e2023] border border-[#c0c7ce]/50 text-xs font-bold text-[#003c53] dark:text-[#94cef0] shadow-neu-extruded hover:bg-[#edeef0] transition-all flex items-center gap-2"
              title="Click to quickly fill sample details"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Fill Demo Details</span>
            </button>
            {isEditing && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#71787e] font-semibold text-xs hover:bg-[#e1e2e5]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Intro Message */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-[#003c53] to-[#0b5471] text-white shadow-neu-extruded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-2xl mb-1">Set Up Your Profile & Safety Network</h2>
            <p className="text-sm text-white/90 leading-relaxed max-w-2xl">
              Please provide the patient's name, age, preferred regional language, and emergency contacts.
              These details will immediately configure the daily schedule, the Sparky voice assistant, the family video hub, and the one-touch Emergency SOS system.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              speakText(
                'Welcome. Please enter your name, age, preferred language, and emergency contacts. You can click the plus button to add as many emergency contacts as you need.',
                undefined,
                formData.language
              )
            }
            className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center shrink-0 transition-transform active:scale-95"
            title="Read instructions aloud"
          >
            <span className="material-symbols-outlined text-[24px]">volume_up</span>
          </button>
        </div>

        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-100 dark:bg-red-950/50 border border-red-400 text-red-800 dark:text-red-200 text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Personal Details */}
          <div className="bg-white dark:bg-[#1e2023] rounded-3xl p-6 sm:p-8 shadow-neu-extruded border border-white/60 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e1e2e5] dark:border-[#282a2d]">
              <div className="w-10 h-10 rounded-xl bg-[#003c53] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">person</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0]">
                  1. Patient Details
                </h3>
                <p className="text-xs text-[#71787e]">Basic information to personalize the interface and vocal greetings</p>
              </div>
            </div>

            {/* Avatar Selector & Custom DP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#71787e] uppercase tracking-wider">
                  Choose Profile Avatar / Custom DP
                </label>
                <button
                  id="onboarding-upload-dp-link"
                  type="button"
                  onClick={() => setShowDPModal(true)}
                  className="text-xs font-bold text-[#003c53] dark:text-[#94cef0] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                  <span>Upload Custom Photo</span>
                </button>
              </div>

              <div className="flex items-center gap-3.5 flex-wrap">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: av.url })}
                    className={`relative w-16 h-16 rounded-full overflow-hidden transition-all ${
                      formData.photoUrl === av.url
                        ? 'ring-4 ring-[#003c53] dark:ring-[#94cef0] scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100 ring-2 ring-gray-200 dark:ring-gray-700'
                    }`}
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* If current photoUrl is custom (not one of the 4 presets), show custom thumbnail */}
                {!AVATAR_OPTIONS.some((av) => av.url === formData.photoUrl) && (
                  <button
                    type="button"
                    onClick={() => setShowDPModal(true)}
                    className="relative w-16 h-16 rounded-full overflow-hidden transition-all ring-4 ring-[#003c53] dark:ring-[#94cef0] scale-105 shadow-md group"
                    title="Your Custom Uploaded Photo (Click to change)"
                  >
                    <img src={formData.photoUrl} alt="Custom DP" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                      Edit
                    </div>
                  </button>
                )}

                {/* Add Custom DP Button */}
                <button
                  id="onboarding-custom-dp-btn"
                  type="button"
                  onClick={() => setShowDPModal(true)}
                  className="w-16 h-16 rounded-full border-2 border-dashed border-[#003c53] dark:border-[#94cef0] text-[#003c53] dark:text-[#94cef0] flex flex-col items-center justify-center hover:bg-[#003c53]/10 dark:hover:bg-[#94cef0]/10 transition-all text-center p-1 group"
                  title="Upload a personal photo of the patient"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                    add_a_photo
                  </span>
                  <span className="text-[9px] font-bold leading-tight mt-0.5">
                    + Custom
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arthur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  placeholder="76"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender || 'Male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guwahati"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  State / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assam"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Preferred Regional Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setFormData({ ...formData, language: newLang });
                    const opt = getLanguageByCode(newLang);
                    speakText(opt.greeting, undefined, newLang);
                  }}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Primary Caregiver Details */}
          <div className="bg-white dark:bg-[#1e2023] rounded-3xl p-6 sm:p-8 shadow-neu-extruded border border-white/60 dark:border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e1e2e5] dark:border-[#282a2d]">
              <div className="w-10 h-10 rounded-xl bg-[#003c53] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">favorite</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0]">
                  2. Primary Family Caregiver
                </h3>
                <p className="text-xs text-[#71787e]">Primary person responsible for daily health and video check-ins</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Caregiver Name & Relation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Miller (Daughter)"
                  value={formData.caregiverName}
                  onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Caregiver Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98640 12345"
                  value={formData.caregiverPhone}
                  onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                  className="w-full px-4 h-13 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Emergency Contacts with PLUS SIGN (Core Requirement) */}
          <div className="bg-white dark:bg-[#1e2023] rounded-3xl p-6 sm:p-8 shadow-neu-extruded border-2 border-red-500/30 dark:border-red-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#e1e2e5] dark:border-[#282a2d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[22px]">emergency</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl text-[#ba1a1a] dark:text-[#ffdad6]">
                      3. Emergency Contacts
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-xs font-bold">
                      {formData.emergencyContacts.length} {formData.emergencyContacts.length === 1 ? 'Contact' : 'Contacts'}
                    </span>
                  </div>
                  <p className="text-xs text-[#71787e] mt-0.5">
                    Click the <strong>plus sign (+)</strong> below to add more family members, neighbors, or clinics.
                  </p>
                </div>
              </div>

              {/* Prominent Plus Button in Header */}
              <button
                type="button"
                onClick={handleAddEmergencyContact}
                className="h-12 px-5 rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-sm flex items-center gap-2 shadow-neu-extruded transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[22px]">add</span>
                <span>Add Emergency Contact</span>
              </button>
            </div>

            {/* Emergency Contacts List */}
            <div className="space-y-4">
              {formData.emergencyContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    contact.isPrimary
                      ? 'bg-red-50/60 dark:bg-red-950/20 border-red-400 dark:border-red-800'
                      : 'bg-[#f8f9fc] dark:bg-[#282a2d] border-[#c0c7ce]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-[#191c1e] dark:text-white">
                        Emergency Contact #{index + 1}
                      </span>
                      {contact.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Primary Dispatch
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-[#40484d] dark:text-[#c0c7ce] cursor-pointer">
                        <input
                          type="radio"
                          name="primaryEmergencyRadio"
                          checked={contact.isPrimary || false}
                          onChange={() => handleUpdateContact(contact.id, 'isPrimary', true)}
                          className="accent-red-600"
                        />
                        <span>Set as Primary</span>
                      </label>

                      {formData.emergencyContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmergencyContact(contact.id)}
                          title="Remove this contact"
                          className="w-8 h-8 rounded-lg text-[#71787e] hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#71787e] uppercase mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Miller"
                        value={contact.name}
                        onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                        className="w-full px-3.5 h-11 rounded-xl bg-white dark:bg-[#191c1e] border border-[#c0c7ce]/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#71787e] uppercase mb-1">
                        Relationship / Role *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Daughter, Neighbor, Hospital"
                        value={contact.relationship}
                        onChange={(e) => handleUpdateContact(contact.id, 'relationship', e.target.value)}
                        className="w-full px-3.5 h-11 rounded-xl bg-white dark:bg-[#191c1e] border border-[#c0c7ce]/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#71787e] uppercase mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98640 12345 or 112"
                        value={contact.phone}
                        onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                        className="w-full px-3.5 h-11 rounded-xl bg-white dark:bg-[#191c1e] border border-[#c0c7ce]/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prominent Plus Sign Banner Button */}
            <button
              type="button"
              onClick={handleAddEmergencyContact}
              className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-red-400 dark:border-red-600/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-[#ba1a1a] dark:text-[#ffdad6] font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-101 active:scale-99"
            >
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
              <span>Click to Add Another Emergency Contact (+)</span>
            </button>
          </div>

          {/* SECTION 4: Medical Notes (Optional) */}
          <div className="bg-white dark:bg-[#1e2023] rounded-3xl p-6 sm:p-8 shadow-neu-extruded border border-white/60 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-[#e1e2e5] dark:border-[#282a2d]">
              <div className="w-10 h-10 rounded-xl bg-[#003c53] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">notes</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0]">
                  4. Medical & Routine Notes (Optional)
                </h3>
                <p className="text-xs text-[#71787e]">Known allergies, preferred daily routines, or attending physician</p>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Mild Cognitive Impairment, manages blood pressure, enjoys Assam black tea with morning walks along the Brahmaputra."
              value={formData.medicalNotes || ''}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              className="w-full p-4 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003c53]"
            />
          </div>

          {/* Bottom Save & Continue CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#71787e]">
              Data is saved securely on your device and will be synced across the tablet application.
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto min-h-[58px] px-10 rounded-2xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-neu-extruded hover:scale-105 active:scale-95 transition-all"
            >
              <span>{isEditing ? 'Save Changes & Return' : 'Save Details & Start MindSpark'}</span>
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      {/* Custom DP Modal */}
      <CustomDPModal
        isOpen={showDPModal}
        currentPhotoUrl={formData.photoUrl}
        patientName={formData.name || 'Patient'}
        onClose={() => setShowDPModal(false)}
        onSavePhoto={(newPhotoUrl) => {
          setFormData((prev) => ({ ...prev, photoUrl: newPhotoUrl }));
        }}
      />
    </div>
  );
};
