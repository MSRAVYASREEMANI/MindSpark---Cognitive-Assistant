import React, { useState, useEffect, useRef } from 'react';
import { FAMILIES } from '../data/mockData';
import { speakText, playTone } from '../utils/audio';

interface FamilyCallModalProps {
  onClose: () => void;
}

export const FamilyCallModal: React.FC<FamilyCallModalProps> = ({ onClose }) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [audioTested, setAudioTested] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraOff, setCameraOff] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [sarahDialogue, setSarahDialogue] = useState<string>(
    "Hi Dad! It's so good to see your smile. How was your morning garden walk in Guwahati?"
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sarah = FAMILIES[0]; // Sarah in Shillong

  // Stop camera stream safely
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  const handleTestAudio = () => {
    setAudioTested(true);
    playTone(587.33, 'sine', 0.25);
    speakText("Audio check: Speakers and microphone are crystal clear.");
  };

  const handleStartCall = async () => {
    setCallActive(true);
    playTone(440, 'sine', 0.2);

    // Try to get real user webcam & microphone
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.log('Camera permission not granted or unavailable, showing fallback self-view', err);
      setHasCameraPermission(false);
    }

    setTimeout(() => {
      speakText(
        "Hi Dad! It's Sarah calling you from Shillong. It is so good to see you! How is your morning?"
      );
    }, 800);
  };

  const handleEndCall = () => {
    stopMediaTracks();
    setCallActive(false);
    speakText("Call ended with Sarah. Have a wonderful day!");
    onClose();
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
      }
      return next;
    });
  };

  const toggleCamera = () => {
    setCameraOff((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !next));
      }
      return next;
    });
  };

  const handlePatientReply = (patientSpeech: string, sarahResponse: string) => {
    speakText(patientSpeech, () => {
      setTimeout(() => {
        setSarahDialogue(sarahResponse);
        speakText(sarahResponse);
      }, 700);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#f8f9fc] dark:bg-[#191c1e] rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/60 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e1e2e5] dark:border-[#282a2d]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#abdefe] dark:bg-[#004c68] text-[#003c53] dark:text-[#94cef0] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[26px]">videocam</span>
            </div>
            <div>
              <h2 className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0]">
                {callActive ? 'Live Family Video Call' : 'Daily Family Call'}
              </h2>
              <p className="text-xs text-[#71787e] dark:text-[#a0a8b0]">
                {callActive ? 'Connected • Shillong, Meghalaya to Guwahati' : 'Check tablet & sound before starting'}
              </p>
            </div>
          </div>

          <button
            onClick={handleEndCall}
            className="w-10 h-10 rounded-full bg-[#edeef0] dark:bg-[#282a2d] flex items-center justify-center text-[#71787e] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {callActive ? (
          /* Active Call View */
          <div className="flex flex-col items-center gap-5 py-4">
            {/* Sarah Main Video Frame */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl ring-4 ring-[#003c53]/30 bg-black">
              <img
                src={sarah.image}
                alt={sarah.name}
                className="w-full h-full object-cover"
              />

              {/* Patient Self-View PIP (Real Webcam or Avatar) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 md:w-40 md:h-28 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/80 bg-[#1e2023] z-20">
                {hasCameraPermission && !cameraOff ? (
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current) el.srcObject = streamRef.current;
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#003c53] to-[#0b5471] text-white p-2 text-center">
                    <span className="material-symbols-outlined text-[24px]">account_circle</span>
                    <span className="text-[10px] font-bold mt-0.5">Arthur (You)</span>
                  </div>
                )}
                <span className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">
                  You
                </span>
              </div>

              {/* Status Header Overlay */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sarah • Shillong, Meghalaya</span>
              </div>

              {/* Sarah's Current Spoken Dialogue */}
              <div className="absolute bottom-4 left-4 right-36 md:right-44 p-3 rounded-2xl bg-black/65 backdrop-blur-md text-white">
                <p className="text-sm md:text-base font-medium leading-snug">
                  "{sarahDialogue}"
                </p>
              </div>
            </div>

            {/* Tap to Talk Quick Responses */}
            <div className="w-full space-y-2">
              <span className="text-xs font-bold text-[#71787e] uppercase tracking-wider block">
                Tap to speak to Sarah:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handlePatientReply(
                      'I had a peaceful walk in the garden, Sarah. The tea leaves and wild orchids are blooming!',
                      'Oh that sounds wonderful, Dad! I remember how much you loved tending the Assam tea shrubs.'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/40 text-left text-xs md:text-sm font-semibold text-[#003c53] dark:text-[#94cef0] hover:bg-[#abdefe]/20 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">yard</span>
                  <span>"The garden was lovely today!"</span>
                </button>

                <button
                  onClick={() =>
                    handlePatientReply(
                      'How is Shillong today, Sarah? Is it raining in the hills?',
                      'It is nice and cool here in Shillong, Dad! A gentle mist over the pines. David sends his love too!'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/40 text-left text-xs md:text-sm font-semibold text-[#003c53] dark:text-[#94cef0] hover:bg-[#abdefe]/20 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud</span>
                  <span>"How is Shillong today?"</span>
                </button>
              </div>
            </div>

            {/* Video Call Controls Bar */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={toggleMute}
                className={`w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isMuted
                    ? 'bg-red-500 text-white'
                    : 'bg-[#edeef0] dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isMuted ? 'mic_off' : 'mic'}
                </span>
              </button>

              <button
                onClick={toggleCamera}
                className={`w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-all ${
                  cameraOff
                    ? 'bg-red-500 text-white'
                    : 'bg-[#edeef0] dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0]'
                }`}
                title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {cameraOff ? 'videocam_off' : 'videocam'}
                </span>
              </button>

              <button
                onClick={handleEndCall}
                className="px-6 h-13 rounded-full bg-[#ba1a1a] text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-red-700 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">call_end</span>
                <span>End Call</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pre-call Readiness Checklist */
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white dark:bg-[#282a2d] shadow-sm">
              <img
                src={sarah.image}
                alt={sarah.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-md"
              />
              <div>
                <h3 className="font-bold text-xl text-[#191c1e] dark:text-white">
                  Sarah Miller (Daughter)
                </h3>
                <p className="text-sm text-[#40484d] dark:text-[#c0c7ce] mt-0.5">
                  "Can't wait to see your smile and hear about the garden flowers."
                </p>
                <span className="inline-block text-[11px] font-semibold text-[#003c53] dark:text-[#94cef0] bg-[#abdefe]/30 dark:bg-[#104c67]/40 px-2 py-0.5 rounded-full mt-1.5">
                  Calling from Shillong, Meghalaya
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#282a2d]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">battery_charging_full</span>
                  <span className="text-sm font-semibold text-[#191c1e] dark:text-white">Tablet Battery</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                  94% (Charging)
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#282a2d]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">wifi</span>
                  <span className="text-sm font-semibold text-[#191c1e] dark:text-white">WiFi Connection</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                  Guwahati High-Speed Fiber ✓
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#282a2d]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0]">volume_up</span>
                  <span className="text-sm font-semibold text-[#191c1e] dark:text-white">Sound & Speaker</span>
                </div>
                <button
                  onClick={handleTestAudio}
                  className="text-xs font-bold text-[#003c53] dark:text-[#94cef0] px-3 py-1 rounded-full bg-[#abdefe]/30 hover:bg-[#abdefe]/60 transition-all"
                >
                  {audioTested ? 'Audio Clear ✓' : 'Test Sound'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] font-semibold text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCall}
                className="px-8 py-3 rounded-xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white font-bold text-base shadow-neu-extruded flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">videocam</span>
                <span>Start Video Call Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
