import React, { useState } from 'react';
import { speakText } from '../utils/audio';

interface PrivacyConsentModalProps {
  hasConsented: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  hasConsented,
  onAgree,
  onClose,
}) => {
  const [agreed, setAgreed] = useState<boolean>(hasConsented);

  const handleConsentSubmit = () => {
    if (!agreed) return;
    onAgree();
    speakText('Medical consent confirmed. Your privacy preferences are active.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#f8f9fc] dark:bg-[#191c1e] rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/60 dark:border-white/10 my-8">
        {/* Header Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
          </div>
          <div>
            <h2 className="font-bold text-2xl md:text-3xl text-[#003c53] dark:text-[#94cef0]">
              Medical Data & Consent
            </h2>
            <p className="text-sm text-[#40484d] dark:text-[#c0c7ce]">
              HIPAA Compliant & Regional Privacy Protection
            </p>
          </div>
        </div>

        {/* Informative Text Sections */}
        <div className="space-y-4 text-sm text-[#40484d] dark:text-[#c0c7ce] max-h-[50vh] overflow-y-auto pr-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#282a2d] shadow-sm">
            <h3 className="font-bold text-base text-[#191c1e] dark:text-white mb-1">
              1. EEG & Cognitive Biomarker Collection
            </h3>
            <p className="leading-relaxed">
              MindSpark records low-voltage EEG frequencies (Alpha, Beta, Theta) from forehead sensor pads during cognitive memory games. This data evaluates focus and daily alertness variations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#282a2d] shadow-sm">
            <h3 className="font-bold text-base text-[#191c1e] dark:text-white mb-1">
              2. Edge Storage & Offline Encryption
            </h3>
            <p className="leading-relaxed">
              All recordings and notes are encrypted on this device using AES-256 encryption. If you are offline, all records remain strictly local and queue securely until internet connectivity resumes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#282a2d] shadow-sm">
            <h3 className="font-bold text-base text-[#191c1e] dark:text-white mb-1">
              3. Authorized Caregiver & Clinical Sharing
            </h3>
            <p className="leading-relaxed">
              Only designated family caregivers (such as Sarah Miller) and authorized neurology clinicians have access to summarized trends. Your personal medical data is never sold or shared with advertisers.
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <div className="mt-6 pt-4 border-t border-[#c0c7ce]/40">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-6 h-6 mt-0.5 rounded-lg text-[#003c53] focus:ring-[#003c53] cursor-pointer"
            />
            <span className="font-semibold text-sm text-[#191c1e] dark:text-white leading-snug">
              I understand and agree to the secure collection of EEG and cognitive adherence data for my care plan.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] font-semibold text-base"
          >
            Close
          </button>
          <button
            onClick={handleConsentSubmit}
            disabled={!agreed}
            className="px-8 py-3 rounded-2xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white font-bold text-base shadow-neu-extruded disabled:opacity-50 transition-all"
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
