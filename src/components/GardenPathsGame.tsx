import React, { useState, useEffect, useRef } from 'react';
import { EEGStatus } from '../types';
import { speakText, playGardenNote, playSuccessFanfare } from '../utils/audio';

interface GardenPathsGameProps {
  onExitGame: () => void;
  onGameComplete: (score: { memoryScore: number; focusLevel: string; timeSpent: string }) => void;
  eegStatus: EEGStatus;
}

interface FlowerNode {
  id: number;
  name: string;
  colorName: string;
  icon: string;
  freq: number;
  bgActive: string;
  bgIdle: string;
  textColor: string;
  ringColor: string;
}

const FLOWERS: FlowerNode[] = [
  {
    id: 0,
    name: 'Rose',
    colorName: 'Rose Pink',
    icon: 'local_florist',
    freq: 261.63, // C4
    bgActive: 'bg-rose-500 text-white shadow-rose-300 ring-rose-400',
    bgIdle: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
    textColor: 'text-rose-600 dark:text-rose-300',
    ringColor: 'ring-rose-400',
  },
  {
    id: 1,
    name: 'Hydrangea',
    colorName: 'Sky Blue',
    icon: 'spa',
    freq: 293.66, // D4
    bgActive: 'bg-sky-500 text-white shadow-sky-300 ring-sky-400',
    bgIdle: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50',
    textColor: 'text-sky-600 dark:text-sky-300',
    ringColor: 'ring-sky-400',
  },
  {
    id: 2,
    name: 'Marigold',
    colorName: 'Warm Amber',
    icon: 'sunny',
    freq: 329.63, // E4
    bgActive: 'bg-amber-500 text-white shadow-amber-300 ring-amber-400',
    bgIdle: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    textColor: 'text-amber-600 dark:text-amber-300',
    ringColor: 'ring-amber-400',
  },
  {
    id: 3,
    name: 'Lavender',
    colorName: 'Purple',
    icon: 'nature',
    freq: 392.0, // G4
    bgActive: 'bg-purple-500 text-white shadow-purple-300 ring-purple-400',
    bgIdle: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
    textColor: 'text-purple-600 dark:text-purple-300',
    ringColor: 'ring-purple-400',
  },
  {
    id: 4,
    name: 'Jasmine',
    colorName: 'Emerald',
    icon: 'yard',
    freq: 440.0, // A4
    bgActive: 'bg-emerald-500 text-white shadow-emerald-300 ring-emerald-400',
    bgIdle: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
    textColor: 'text-emerald-600 dark:text-emerald-300',
    ringColor: 'ring-emerald-400',
  },
  {
    id: 5,
    name: 'Sunflower',
    colorName: 'Golden Yellow',
    icon: 'filter_vintage',
    freq: 523.25, // C5
    bgActive: 'bg-yellow-400 text-stone-900 shadow-yellow-200 ring-yellow-400',
    bgIdle: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-900/50',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    ringColor: 'ring-yellow-400',
  },
];

export const GardenPathsGame: React.FC<GardenPathsGameProps> = ({
  onExitGame,
  onGameComplete,
  eegStatus,
}) => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 3;
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStepIndex, setUserStepIndex] = useState<number>(0);
  const [activeFlowerId, setActiveFlowerId] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Watch the flowers light up in the garden.');
  const [startTime] = useState<number>(Date.now());
  const [streakCount, setStreakCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate sequence based on round
  const generateSequenceForRound = (round: number) => {
    const length = 2 + round; // Round 1 = 3, Round 2 = 4, Round 3 = 5
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * FLOWERS.length));
    }
    return seq;
  };

  const playSequence = (seq: number[]) => {
    setIsPlayingSequence(true);
    setUserStepIndex(0);
    setStatusMessage('Watch the gentle sequence closely...');

    let step = 0;
    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActiveFlowerId(null);
        setIsPlayingSequence(false);
        setStatusMessage('Your turn! Tap the flowers in the same gentle sequence.');
        speakText('Now your turn! Tap the flowers in order.');
        return;
      }

      const flowerIdx = seq[step];
      setActiveFlowerId(flowerIdx);
      playGardenNote(FLOWERS[flowerIdx].freq);

      setTimeout(() => {
        setActiveFlowerId(null);
      }, 550);

      step++;
    }, 900);
  };

  // Start sequence when round changes or on initial mount
  useEffect(() => {
    const newSeq = generateSequenceForRound(currentRound);
    setSequence(newSeq);
    const delayTimer = setTimeout(() => {
      playSequence(newSeq);
    }, 1000);

    return () => {
      clearTimeout(delayTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentRound]);

  const handleFlowerClick = (flower: FlowerNode) => {
    if (isPlayingSequence) return;

    // Play note and visual tap feedback
    playGardenNote(flower.freq);
    setActiveFlowerId(flower.id);
    setTimeout(() => setActiveFlowerId(null), 300);

    // Verify step
    const expectedFlowerId = sequence[userStepIndex];

    if (flower.id === expectedFlowerId) {
      const nextStep = userStepIndex + 1;
      setUserStepIndex(nextStep);

      if (nextStep === sequence.length) {
        // Round Completed!
        playSuccessFanfare();
        setStreakCount((prev) => prev + 1);

        if (currentRound < totalRounds) {
          setStatusMessage(`Beautiful! Round ${currentRound} complete. Preparing next walk...`);
          speakText(`Wonderful job! Let's try the next garden path.`);
          setTimeout(() => {
            setCurrentRound((prev) => prev + 1);
          }, 1800);
        } else {
          // Game Completed
          setStatusMessage('Garden path completed! You recalled all floral melodies.');
          speakText('Exceptional memory! You completed the Garden Paths sequence challenge.');

          const elapsedMins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
          setTimeout(() => {
            onGameComplete({
              memoryScore: 92,
              focusLevel: 'High',
              timeSpent: `${elapsedMins} min`,
            });
          }, 1200);
        }
      } else {
        setStatusMessage(`Good! ${sequence.length - nextStep} steps remaining in this melody.`);
      }
    } else {
      // Mistake - Gentle retry
      setStatusMessage(`Let's listen again. Tap "Replay Path" to watch once more.`);
      speakText(`That was close! Tap replay to hear the sequence again.`);
    }
  };

  const handleReplay = () => {
    if (isPlayingSequence) return;
    playSequence(sequence);
  };

  const handleHelp = () => {
    speakText(
      'Garden Paths game. Watch the colorful flowers glow with musical notes, then tap them in the exact same order. Take all the time you need.'
    );
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Background Weave Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      {/* Control Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onExitGame}
          className="flex items-center gap-3 px-6 h-14 rounded-2xl bg-white dark:bg-[#1e2023] text-[#191c1e] dark:text-white shadow-neu-extruded hover:shadow-neu-extruded-lg active:shadow-neu-recessed transition-all font-semibold text-lg"
        >
          <span className="material-symbols-outlined text-[#ba1a1a]">logout</span>
          <span className="text-[#40484d] dark:text-[#c0c7ce]">Exit Game</span>
        </button>

        {/* Round Progress & EEG Indicators */}
        <div className="flex items-center gap-4 md:gap-6 px-6 md:px-8 h-14 rounded-full bg-[#85B7D6]/20 dark:bg-[#104c67]/40 backdrop-blur-[20px] ring-1 ring-white/40 dark:ring-white/10 shadow-sm">
          {/* Round Counter */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0] text-[24px]">
              route
            </span>
            <span className="text-sm font-bold text-[#191c1e] dark:text-white">
              Round {currentRound} of {totalRounds}
            </span>
          </div>

          <div className="w-px h-6 bg-[#c0c7ce]/50 dark:bg-[#40484d]"></div>

          {/* EEG Signal */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="material-symbols-outlined text-[#306480] dark:text-[#9bcded] text-[22px]">
              monitor_heart
            </span>
            <span className="text-xs font-bold text-[#191c1e] dark:text-white">
              EEG: {eegStatus.signalStrength}
            </span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-[#c0c7ce]/50 dark:bg-[#40484d]"></div>

          {/* Sequence Progress */}
          <div className="flex items-center gap-1.5">
            {sequence.map((_, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < userStepIndex
                    ? 'bg-emerald-500 scale-110 shadow-sm'
                    : i === userStepIndex
                    ? 'bg-[#003c53] dark:bg-[#94cef0] animate-pulse ring-2 ring-[#003c53]/30'
                    : 'bg-[#c0c7ce] dark:bg-[#40484d]'
                }`}
              ></span>
            ))}
          </div>
        </div>

        {/* Help & Replay Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplay}
            disabled={isPlayingSequence}
            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-white dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0] font-bold text-base shadow-neu-extruded hover:shadow-neu-extruded-lg active:scale-95 disabled:opacity-50 transition-all border border-[#c0c7ce]/40"
          >
            <span className="material-symbols-outlined text-[24px]">replay</span>
            <span>Replay Path</span>
          </button>

          <button
            onClick={handleHelp}
            className="flex items-center gap-2 px-6 h-14 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-bold text-base shadow-neu-extruded hover:bg-[#0b5471] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">volume_up</span>
            <span>Listen</span>
          </button>
        </div>
      </div>

      {/* Title & Guidance */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="font-bold text-4xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight mb-2">
          Garden Paths: Melodic Recall
        </h1>
        <p className="text-xl md:text-2xl text-[#40484d] dark:text-[#c0c7ce] max-w-2xl mx-auto">
          {statusMessage}
        </p>
      </div>

      {/* 6 Flower Stones Layout */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full pb-12">
        {FLOWERS.map((flower) => {
          const isActive = activeFlowerId === flower.id;

          return (
            <button
              key={flower.id}
              onClick={() => handleFlowerClick(flower)}
              disabled={isPlayingSequence}
              className={`relative min-h-[160px] md:min-h-[190px] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 transform ${
                isActive
                  ? `${flower.bgActive} scale-105 shadow-2xl ring-8 ${flower.ringColor}`
                  : `${flower.bgIdle} shadow-neu-extruded hover:shadow-neu-extruded-lg hover:scale-102 active:scale-98 border-2`
              }`}
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/30 text-white animate-bounce'
                    : 'bg-white/80 dark:bg-black/20 shadow-sm'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[40px] md:text-[48px] ${
                    isActive ? 'text-white' : flower.textColor
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {flower.icon}
                </span>
              </div>

              <div className="text-center">
                <span className={`font-bold text-xl md:text-2xl block ${isActive ? 'text-white' : 'text-[#191c1e] dark:text-white'}`}>
                  {flower.name}
                </span>
                <span className={`text-xs md:text-sm font-medium ${isActive ? 'text-white/90' : 'text-[#71787e] dark:text-[#a0a6ac]'}`}>
                  {flower.colorName}
                </span>
              </div>

              {isActive && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-white animate-ping"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
