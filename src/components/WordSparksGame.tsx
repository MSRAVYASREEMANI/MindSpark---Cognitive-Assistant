import React, { useState, useEffect } from 'react';
import { EEGStatus } from '../types';
import { speakText, playFlipSound, playMatchSound, playSuccessFanfare } from '../utils/audio';

interface WordSparksGameProps {
  onExitGame: () => void;
  onGameComplete: (score: { memoryScore: number; focusLevel: string; timeSpent: string }) => void;
  eegStatus: EEGStatus;
}

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isCorrect: boolean;
}

interface SceneChallenge {
  themeTitle: string;
  themePrompt: string;
  themeIcon: string;
  targetCount: number;
  items: CategoryItem[];
}

const CHALLENGES: SceneChallenge[] = [
  {
    themeTitle: 'The Morning Kitchen',
    themePrompt: 'Select the 4 items that belong in a cozy morning kitchen.',
    themeIcon: 'restaurant',
    targetCount: 4,
    items: [
      { id: 'k1', name: 'Porcelain Teapot', description: 'Brewing warm chamomile tea', icon: 'coffee', isCorrect: true },
      { id: 'k2', name: 'Fresh Coffee Mug', description: 'Steaming morning roast', icon: 'local_cafe', isCorrect: true },
      { id: 'k3', name: 'Bread Toaster', description: 'Golden warm toast for breakfast', icon: 'breakfast_dining', isCorrect: true },
      { id: 'k4', name: 'Wooden Mixing Spoon', description: 'Stirring batter and honey', icon: 'soup_kitchen', isCorrect: true },
      { id: 'k5', name: 'Garden Trowel', description: 'Digging garden soil outdoors', icon: 'hardware', isCorrect: false },
      { id: 'k6', name: 'Violin Bow', description: 'Playing classical melodies', icon: 'music_note', isCorrect: false },
    ],
  },
  {
    themeTitle: 'The Blooming Garden',
    themePrompt: 'Select the 4 items you would find in your flower garden.',
    themeIcon: 'yard',
    targetCount: 4,
    items: [
      { id: 'g1', name: 'Watering Can', description: 'Sprinkling morning water on hydrangeas', icon: 'water_drop', isCorrect: true },
      { id: 'g2', name: 'Sun Hat', description: 'Keeping the sunshine gentle on your walk', icon: 'wb_sunny', isCorrect: true },
      { id: 'g3', name: 'Flower Seed Packet', description: 'Planting fragrant summer marigolds', icon: 'eco', isCorrect: true },
      { id: 'g4', name: 'Pruning Shears', description: 'Trimming sweet rose bushes', icon: 'content_cut', isCorrect: true },
      { id: 'g5', name: 'Bedside Lamp', description: 'Reading books at night in bedroom', icon: 'light', isCorrect: false },
      { id: 'g6', name: 'Alarm Clock', description: 'Ticking on the nightstand', icon: 'alarm', isCorrect: false },
    ],
  },
  {
    themeTitle: 'Music & Melodies',
    themePrompt: 'Select the 4 items that belong in a music and listening room.',
    themeIcon: 'library_music',
    targetCount: 4,
    items: [
      { id: 'm1', name: 'Grand Piano', description: 'Playing gentle piano chords', icon: 'piano', isCorrect: true },
      { id: 'm2', name: 'Sheet Music', description: 'Notes for your favorite waltz', icon: 'queue_music', isCorrect: true },
      { id: 'm3', name: 'Acoustic Guitar', description: 'Strumming evening folk songs', icon: 'graphic_eq', isCorrect: true },
      { id: 'm4', name: 'Gramophone Record', description: 'Vintage vinyl spinning classic jazz', icon: 'album', isCorrect: true },
      { id: 'm5', name: 'Frying Pan', description: 'Cooking pancakes on the stove', icon: 'skillet', isCorrect: false },
      { id: 'm6', name: 'Car Keys', description: 'Driving along the Brahmaputra in Guwahati', icon: 'key', isCorrect: false },
    ],
  },
];

export const WordSparksGame: React.FC<WordSparksGameProps> = ({
  onExitGame,
  onGameComplete,
  eegStatus,
}) => {
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Tap the items that belong in this scene.');
  const [startTime] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState<number>(0);

  const currentChallenge = CHALLENGES[challengeIndex];

  useEffect(() => {
    // Announce new challenge
    setSelectedIds([]);
    setFeedbackMessage(currentChallenge.themePrompt);
    speakText(`${currentChallenge.themeTitle}. ${currentChallenge.themePrompt}`);
  }, [challengeIndex]);

  const handleSelectItem = (item: CategoryItem) => {
    if (selectedIds.includes(item.id)) {
      // Toggle off
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      playFlipSound();
      return;
    }

    if (item.isCorrect) {
      playMatchSound();
      const updated = [...selectedIds, item.id];
      setSelectedIds(updated);
      setFeedbackMessage(`Yes! ${item.name} belongs here (${item.description}).`);
      speakText(`Correct! ${item.name}.`);

      // Check if all 4 targets found
      if (updated.length === currentChallenge.targetCount) {
        playSuccessFanfare();

        if (challengeIndex + 1 < CHALLENGES.length) {
          setFeedbackMessage(`Splendid! All items found. Loading next scene...`);
          speakText(`Splendid! You completed this scene.`);
          setTimeout(() => {
            setChallengeIndex((prev) => prev + 1);
          }, 1800);
        } else {
          // Game Completed
          setFeedbackMessage(`All scenes completed! Outstanding category association.`);
          speakText(`Wonderful cognitive work! You completed all memory scenes.`);

          const elapsedMins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
          const score = Math.max(80, 100 - mistakes * 4);
          setTimeout(() => {
            onGameComplete({
              memoryScore: score,
              focusLevel: 'High',
              timeSpent: `${elapsedMins} min`,
            });
          }, 1200);
        }
      }
    } else {
      // Incorrect item
      playFlipSound();
      setMistakes((prev) => prev + 1);
      setFeedbackMessage(`${item.name} is usually used elsewhere (${item.description}). Try another!`);
      speakText(`${item.name} doesn't quite fit here. Try another one.`);
    }
  };

  const handleHelp = () => {
    speakText(
      `Daily Word Sparks. Read the theme "${currentChallenge.themeTitle}", then tap the 4 items that belong in this room. You can also tap the audio button on any card to hear its description.`
    );
  };

  const handleHearCard = (e: React.MouseEvent, item: CategoryItem) => {
    e.stopPropagation();
    speakText(`${item.name}: ${item.description}`);
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Background Weave Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      {/* Header Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onExitGame}
          className="flex items-center gap-3 px-6 h-14 rounded-2xl bg-white dark:bg-[#1e2023] text-[#191c1e] dark:text-white shadow-neu-extruded hover:shadow-neu-extruded-lg active:shadow-neu-recessed transition-all font-semibold text-lg"
        >
          <span className="material-symbols-outlined text-[#ba1a1a]">logout</span>
          <span className="text-[#40484d] dark:text-[#c0c7ce]">Exit Game</span>
        </button>

        {/* Scene Indicator & EEG */}
        <div className="flex items-center gap-4 md:gap-6 px-6 md:px-8 h-14 rounded-full bg-[#85B7D6]/20 dark:bg-[#104c67]/40 backdrop-blur-[20px] ring-1 ring-white/40 dark:ring-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0] text-[24px]">
              {currentChallenge.themeIcon}
            </span>
            <span className="text-sm font-bold text-[#191c1e] dark:text-white">
              Scene {challengeIndex + 1} of {CHALLENGES.length}
            </span>
          </div>

          <div className="w-px h-6 bg-[#c0c7ce]/50 dark:bg-[#40484d]"></div>

          {/* Targets Found */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#40484d] dark:text-[#c0c7ce]">
              Found:
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {selectedIds.length} / {currentChallenge.targetCount}
            </span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-[#c0c7ce]/50 dark:bg-[#40484d]"></div>

          {/* EEG Signal */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="material-symbols-outlined text-[#306480] dark:text-[#9bcded] text-[22px]">
              psychology
            </span>
            <span className="text-xs font-bold text-[#191c1e] dark:text-white">
              Focus: {eegStatus.focusLevel}%
            </span>
          </div>
        </div>

        {/* Listen Button */}
        <button
          onClick={handleHelp}
          className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-semibold text-lg shadow-neu-extruded hover:bg-[#0b5471] active:shadow-neu-recessed transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">volume_up</span>
          <span>Listen</span>
        </button>
      </div>

      {/* Theme Title & Prompt */}
      <div className="relative z-10 text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#003c53]/10 dark:bg-[#94cef0]/10 text-[#003c53] dark:text-[#94cef0] text-sm font-bold mb-3">
          <span className="material-symbols-outlined text-[18px]">category</span>
          <span>Association & Word Recall</span>
        </div>
        <h1 className="font-bold text-4xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight mb-2">
          {currentChallenge.themeTitle}
        </h1>
        <p className="text-xl md:text-2xl text-[#40484d] dark:text-[#c0c7ce] max-w-3xl mx-auto">
          {feedbackMessage}
        </p>
      </div>

      {/* 6 Category Item Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full pb-12">
        {currentChallenge.items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-neu-recessed-deep ring-4 ring-emerald-400/30 scale-[0.98]'
                  : 'bg-white dark:bg-[#1e2023] shadow-neu-extruded hover:shadow-neu-extruded-lg hover:scale-[1.02] active:scale-[0.98] border border-transparent dark:border-white/5'
              }`}
            >
              {/* Card Header with Icon and Audio Cue */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#abdefe]/30 dark:bg-[#104c67]/40 text-[#003c53] dark:text-[#94cef0]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[36px]"
                    style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleHearCard(e, item)}
                    className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0] flex items-center justify-center hover:bg-[#abdefe]/30 transition-colors"
                    title="Hear description"
                  >
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                  </button>

                  {isSelected && (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm animate-fade-in">
                      <span className="material-symbols-outlined text-[24px]">check</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3
                  className={`font-bold text-2xl mb-1.5 ${
                    isSelected
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-[#191c1e] dark:text-white'
                  }`}
                >
                  {item.name}
                </h3>
                <p
                  className={`text-base leading-relaxed ${
                    isSelected
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-[#40484d] dark:text-[#c0c7ce]'
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-[#e1e2e5] dark:border-[#282a2d] flex items-center justify-between text-xs font-bold">
                <span className={isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#71787e]'}>
                  {isSelected ? '✓ Matched to Scene' : 'Tap to Select'}
                </span>
                <span className="text-[#003c53] dark:text-[#94cef0]">
                  {isSelected ? 'Selected' : 'Examine'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
