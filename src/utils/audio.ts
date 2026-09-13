// Clean Audio and Speech Synthesis Engine for MindSpark
// Features high-fidelity regional streaming TTS for North-East & Pan-Indian languages
// with graceful browser SpeechSynthesis fallback and strict single-audio concurrency.

import { getLanguageByCode } from './languages';

// Global listener for speech playback state
type SpeechListener = (isSpeaking: boolean) => void;
const speechListeners = new Set<SpeechListener>();

export const addSpeechListener = (listener: SpeechListener) => {
  speechListeners.add(listener);
  return () => {
    speechListeners.delete(listener);
  };
};

const notifySpeechState = (isSpeaking: boolean) => {
  speechListeners.forEach((fn) => {
    try {
      fn(isSpeaking);
    } catch {
      // Ignore listener errors
    }
  });
};

let currentAudioElement: HTMLAudioElement | null = null;
let activePlaybackToken = 0;

/**
 * Completely terminates any ongoing speech (streaming audio or speech synthesis).
 */
export const stopSpeaking = () => {
  // Invalidate any in-flight promises and callbacks
  activePlaybackToken++;

  // 1. Reset and detach streaming audio element
  if (currentAudioElement) {
    try {
      currentAudioElement.onplay = null;
      currentAudioElement.onended = null;
      currentAudioElement.onerror = null;
      currentAudioElement.pause();
      currentAudioElement.src = '';
      currentAudioElement.load();
    } catch {
      // Ignore cleanup error
    }
    currentAudioElement = null;
  }

  // 2. Cancel browser speech synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }

  notifySpeechState(false);
};

/**
 * Fallback to browser SpeechSynthesis when streaming TTS is unreachable.
 */
const fallbackToWebSpeech = (
  text: string,
  languageCode: string,
  rate: number,
  pitch: number,
  playbackToken: number,
  onEnd?: () => void
) => {
  if (playbackToken !== activePlaybackToken) return;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifySpeechState(false);
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = Math.max(0.6, Math.min(1.5, rate));
    utterance.pitch = Math.max(0.6, Math.min(1.5, pitch));

    const langOpt = getLanguageByCode(languageCode);
    const targetSpeechLang = langOpt?.speechCode || 'en-IN';
    utterance.lang = targetSpeechLang;

    // Pick matching browser system voice if available
    const systemVoices = window.speechSynthesis.getVoices();
    if (systemVoices.length > 0) {
      const targetNormalized = targetSpeechLang.toLowerCase().replace('_', '-');
      const langPrefix = targetNormalized.split('-')[0];

      const match =
        systemVoices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetNormalized) ||
        systemVoices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));

      if (match) {
        utterance.voice = match;
      }
    }

    const finish = () => {
      if (playbackToken === activePlaybackToken) {
        notifySpeechState(false);
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      if (playbackToken === activePlaybackToken) {
        notifySpeechState(true);
      } else {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  } catch {
    if (playbackToken === activePlaybackToken) {
      notifySpeechState(false);
      if (onEnd) onEnd();
    }
  }
};

/**
 * Speaks text using high-definition regional TTS audio stream with automatic browser fallback.
 */
export const speakText = (
  text: string,
  onEnd?: () => void,
  languageCode?: string,
  customRateOrLegacy?: number | string,
  customPitchOrRate?: number,
  customPitch?: number
) => {
  if (!text || typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  // Immediately stop and invalidate any active speech
  stopSpeaking();

  const playbackToken = ++activePlaybackToken;
  const effectiveLang = (languageCode || 'english').toLowerCase();

  // Normalize rate & pitch parameters
  let effectiveRate = 0.9;
  let effectivePitch = 1.0;

  if (typeof customRateOrLegacy === 'number') {
    effectiveRate = customRateOrLegacy;
    if (typeof customPitchOrRate === 'number') {
      effectivePitch = customPitchOrRate;
    }
  } else if (typeof customRateOrLegacy === 'string') {
    // Legacy voice identifier passed as 4th parameter
    if (typeof customPitchOrRate === 'number') {
      effectiveRate = customPitchOrRate;
    }
    if (typeof customPitch === 'number') {
      effectivePitch = customPitch;
    }
  }

  try {
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[#*`_~]/g, '')
      .trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }
    // Use regional TTS audio stream
    const ttsUrl = `/api/tts?lang=${encodeURIComponent(effectiveLang)}&text=${encodeURIComponent(cleanText.slice(0, 220))}`;

    const audio = new Audio(ttsUrl);
    currentAudioElement = audio;

    // Apply speaking rate
    audio.playbackRate = Math.max(0.6, Math.min(1.5, effectiveRate));

    const finish = () => {
      if (playbackToken === activePlaybackToken) {
        notifySpeechState(false);
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        if (onEnd) onEnd();
      }
    };

    audio.onplay = () => {
      if (playbackToken === activePlaybackToken) {
        notifySpeechState(true);
      } else {
        try {
          audio.pause();
        } catch {
          // Ignore
        }
      }
    };

    audio.onended = finish;

    audio.onerror = () => {
      // If superseded, ignore
      if (playbackToken !== activePlaybackToken) return;

      // Fallback to browser speech synthesis
      fallbackToWebSpeech(
        cleanText,
        effectiveLang,
        effectiveRate,
        effectivePitch,
        playbackToken,
        onEnd
      );
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If aborted because stopSpeaking() or a new speakText() was called, ignore!
        if (playbackToken !== activePlaybackToken || err?.name === 'AbortError') {
          return;
        }
        // Otherwise attempt fallback
        fallbackToWebSpeech(
          cleanText,
          effectiveLang,
          effectiveRate,
          effectivePitch,
          playbackToken,
          onEnd
        );
      });
    }
  } catch {
    fallbackToWebSpeech(
      text,
      effectiveLang,
      effectiveRate,
      effectivePitch,
      playbackToken,
      onEnd
    );
  }
};

// Play gentle web audio tones & musical cues
export const playTone = (frequency: number = 440, type: OscillatorType = 'sine', duration: number = 0.2) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context errors gracefully
  }
};

export const playMatchSound = () => {
  playTone(523.25, 'sine', 0.15); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.2), 120); // E5
};

export const playFlipSound = () => {
  playTone(330, 'triangle', 0.08);
};

export const playGardenNote = (frequency: number) => {
  playTone(frequency, 'sine', 0.35);
};

export const playSuccessFanfare = () => {
  playTone(523.25, 'sine', 0.15); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.15), 100); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.2), 200); // G5
  setTimeout(() => playTone(1046.5, 'sine', 0.35), 320); // C6
};

export const playReminderChime = () => {
  playTone(587.33, 'sine', 0.2); // D5
  setTimeout(() => playTone(880.0, 'sine', 0.35), 180); // A5
};

let beaconInterval: any = null;

export const playEmergencyBeacon = () => {
  stopEmergencyBeacon();
  const pulse = () => {
    playTone(880, 'sine', 0.15);
    setTimeout(() => playTone(659.25, 'sine', 0.25), 160);
  };
  pulse();
  beaconInterval = setInterval(pulse, 1200);
};

export const stopEmergencyBeacon = () => {
  if (beaconInterval) {
    clearInterval(beaconInterval);
    beaconInterval = null;
  }
};
