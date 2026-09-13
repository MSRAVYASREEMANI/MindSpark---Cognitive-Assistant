import React, { useState, useEffect } from 'react';
import { UserProfile, EmergencyContact } from '../types';
import { speakText, stopSpeaking, playEmergencyBeacon, stopEmergencyBeacon } from '../utils/audio';
import { getTranslation } from '../utils/translations';

interface EmergencyModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onOpenSparky: () => void;
  onOpenManageContacts?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  userProfile,
  onClose,
  onOpenSparky,
  onOpenManageContacts,
}) => {
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState<number>(0);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const t = getTranslation(userProfile.language);

  const breathPhases = [t.inhale, t.hold, t.exhale];

  const contacts: EmergencyContact[] =
    userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0
      ? userProfile.emergencyContacts
      : [
          {
            id: 'default-cg',
            name: userProfile.caregiverName || 'Sarah',
            relationship: 'Primary Caregiver',
            phone: userProfile.caregiverPhone || '+91 98640 12345',
            isPrimary: true,
          },
          {
            id: 'default-ems',
            name: 'State Emergency Services',
            relationship: 'Ambulance & Police',
            phone: userProfile.emergencyPhone || '112',
            isPrimary: false,
          },
        ];

  useEffect(() => {
    speakText(
      `${t.safeAtHome} You have ${contacts.length} emergency contacts ready.`,
      undefined,
      userProfile.language
    );

    // Get real device coordinates if available
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        (err) => {
          console.log('Using default location', err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    const interval = setInterval(() => {
      setBreathPhaseIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
      clearInterval(interval);
      stopEmergencyBeacon();
      stopSpeaking();
    };
  }, [userProfile.name, userProfile.language, t.safeAtHome, contacts.length]);

  const toggleSiren = () => {
    if (isSirenActive) {
      stopEmergencyBeacon();
      setIsSirenActive(false);
    } else {
      playEmergencyBeacon();
      setIsSirenActive(true);
    }
  };

  const handleCallContact = (contact: EmergencyContact) => {
    setCallStatus(`Connecting call to ${contact.name} (${contact.phone})...`);
    speakText(
      `Calling ${contact.name}. Please hold on.`,
      undefined,
      userProfile.language
    );
    window.location.href = `tel:${contact.phone}`;
  };

  const handleShareWhatsAppSOS = (contact?: EmergencyContact) => {
    const locText = coords
      ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
      : `${userProfile.city || 'Guwahati'}, ${userProfile.state || 'Assam'}`;
    const msg = encodeURIComponent(
      `URGENT SOS from MindSpark for ${userProfile.name} (Age ${userProfile.age}). Needs immediate assistance at ${locText}. Emergency notification sent.`
    );
    const targetPhone = contact?.phone?.replace(/[^0-9]/g, '') || '';
    if (targetPhone.length >= 10) {
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  const handleDismiss = () => {
    stopEmergencyBeacon();
    setIsSirenActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#191c1e] rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl border-4 border-[#ba1a1a] my-8 text-center">
        {/* Header Icon */}
        <div className="w-20 h-20 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4 animate-bounce shadow-md">
          <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            emergency
          </span>
        </div>

        <h2 className="font-bold text-3xl md:text-4xl text-[#ba1a1a] mb-2 tracking-tight">
          {t.emergencySOS} & {t.helpReassurance}
        </h2>
        <p className="text-lg md:text-xl text-[#191c1e] dark:text-white font-medium mb-1">
          {t.safeAtHome}
        </p>
        <p className="text-xs text-[#71787e] mb-4">
          Emergency profile active for {userProfile.name} (Age {userProfile.age}) • {userProfile.city || 'Guwahati'}, {userProfile.state || 'Assam'}
        </p>

        {/* Siren Sound Beacon Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={toggleSiren}
            className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
              isSirenActive
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSirenActive ? 'volume_up' : 'campaign'}
            </span>
            <span>{isSirenActive ? 'Stop Emergency Siren' : 'Sound Audible Emergency Siren'}</span>
          </button>
        </div>

        {callStatus ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 mb-6 animate-pulse">
            <span className="material-symbols-outlined text-[36px] mb-2">call</span>
            <p className="font-bold text-xl">{callStatus}</p>
          </div>
        ) : (
          /* Dynamic Emergency Contacts List */
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71787e]">
                Direct 1-Tap Emergency Contacts ({contacts.length})
              </span>
              {onOpenManageContacts && (
                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                    onOpenManageContacts();
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Add / Manage (+)</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {contacts.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all ${
                    contact.isPrimary
                      ? 'bg-red-50/80 dark:bg-red-950/40 border-red-400 dark:border-red-800'
                      : 'bg-[#f8f9fc] dark:bg-[#282a2d] border-[#c0c7ce]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                        contact.isPrimary ? 'bg-red-600 shadow-md' : 'bg-[#003c53]'
                      }`}
                    >
                      {contact.isPrimary ? (
                        <span className="material-symbols-outlined text-[22px]">star</span>
                      ) : (
                        <span className="material-symbols-outlined text-[22px]">call</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-base text-[#191c1e] dark:text-white leading-tight">
                          {contact.name}
                        </p>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#71787e] dark:text-[#a0a7ae]">
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleCallContact(contact)}
                      className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => handleShareWhatsAppSOS(contact)}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center transition-transform active:scale-95"
                      title="Send WhatsApp SOS with GPS"
                    >
                      <span className="material-symbols-outlined text-[18px]">share_location</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* General WhatsApp Broadcast */}
            <button
              onClick={() => handleShareWhatsAppSOS()}
              className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-101 active:scale-99"
            >
              <span className="material-symbols-outlined text-[20px]">share_location</span>
              <span>Broadcast SOS with GPS Coordinates to Family via WhatsApp</span>
            </button>
          </div>
        )}

        {/* Calming Breathing Guide */}
        <div className="p-4 rounded-3xl bg-[#f2f4f6] dark:bg-[#282a2d] mb-5 flex flex-col items-center">
          <span className="text-xs font-bold text-[#71787e] uppercase tracking-wider mb-1">
            {t.breathingGuide}
          </span>
          <div className="w-14 h-14 rounded-full bg-[#abdefe]/40 dark:bg-[#104c67]/40 flex items-center justify-center animate-pulse mb-1">
            <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0] text-[26px]">
              self_improvement
            </span>
          </div>
          <span className="font-bold text-lg text-[#003c53] dark:text-[#94cef0]">
            {breathPhases[breathPhaseIndex]}
          </span>
        </div>

        {/* Location & Safe Dismissal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e1e2e5] dark:border-[#282a2d]">
          <div className="text-left text-xs text-[#71787e]">
            <p className="font-bold text-[#191c1e] dark:text-white text-sm">{t.locationActive}</p>
            <p>{userProfile.city || 'Guwahati'}, {userProfile.state || 'Assam'}</p>
            {coords && (
              <p className="text-[11px] text-emerald-600 font-mono mt-0.5">
                GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} (±{coords.accuracy}m)
              </p>
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => {
                handleDismiss();
                onOpenSparky();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0] font-semibold text-xs sm:text-sm hover:bg-[#abdefe]/20"
            >
              {t.talkWithSparkyBtn}
            </button>
            <button
              onClick={handleDismiss}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
            >
              {t.imOkNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
