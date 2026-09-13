import React, { useState } from 'react';
import { EEGStatus } from '../types';
import { FacesGame } from './FacesGame';
import { GardenPathsGame } from './GardenPathsGame';
import { WordSparksGame } from './WordSparksGame';
import { speakText } from '../utils/audio';

interface GamesScreenProps {
  onExitGame: () => void;
  onGameComplete: (score: { memoryScore: number; focusLevel: string; timeSpent: string }) => void;
  eegStatus: EEGStatus;
}

type GameType = 'hub' | 'faces' | 'garden' | 'words';

interface GameInfo {
  id: 'faces' | 'garden' | 'words';
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  colorClass: string;
  badgeText: string;
  cognitiveArea: string;
  timeEstimate: string;
}

const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'faces',
    title: 'Match the Faces',
    subtitle: 'Family & Loved Ones',
    description: 'Explore pairs of photographs featuring your cherished family members and caregivers.',
    icon: 'diversity_1',
    colorClass: 'bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c]',
    badgeText: 'Facial Memory',
    cognitiveArea: 'Visual & Personal Recall',
    timeEstimate: '5-8 min',
  },
  {
    id: 'garden',
    title: 'Garden Paths',
    subtitle: 'Melodic Sequence Recall',
    description: 'Follow gentle glowing flowers and harmonious nature chimes through a peaceful garden stroll.',
    icon: 'local_florist',
    colorClass: 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-[#001e2c]',
    badgeText: 'Sequence Recall',
    cognitiveArea: 'Auditory-Spatial Working Memory',
    timeEstimate: '4-6 min',
  },
  {
    id: 'words',
    title: 'Daily Word Sparks',
    subtitle: 'Scene & Category Association',
    description: 'Identify familiar everyday objects that belong together in morning kitchens, gardens, and music rooms.',
    icon: 'category',
    colorClass: 'bg-amber-600 dark:bg-amber-400 text-white dark:text-[#2b1700]',
    badgeText: 'Word Association',
    cognitiveArea: 'Semantic Retrieval & Attention',
    timeEstimate: '5-7 min',
  },
];

export const GamesScreen: React.FC<GamesScreenProps> = ({
  onExitGame,
  onGameComplete,
  eegStatus,
}) => {
  const [activeGame, setActiveGame] = useState<GameType>('hub');

  const handleStartGame = (gameId: 'faces' | 'garden' | 'words') => {
    setActiveGame(gameId);
    const game = GAMES_CATALOG.find((g) => g.id === gameId);
    if (game) {
      speakText(`Starting ${game.title}. ${game.description}`);
    }
  };

  const handleBackToHub = () => {
    setActiveGame('hub');
    speakText('Returned to the cognitive games menu.');
  };

  if (activeGame === 'faces') {
    return (
      <FacesGame
        onExitGame={handleBackToHub}
        onGameComplete={onGameComplete}
        eegStatus={eegStatus}
      />
    );
  }

  if (activeGame === 'garden') {
    return (
      <GardenPathsGame
        onExitGame={handleBackToHub}
        onGameComplete={onGameComplete}
        eegStatus={eegStatus}
      />
    );
  }

  if (activeGame === 'words') {
    return (
      <WordSparksGame
        onExitGame={handleBackToHub}
        onGameComplete={onGameComplete}
        eegStatus={eegStatus}
      />
    );
  }

  // Games Hub Selector
  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Background Silk Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onExitGame}
          className="flex items-center gap-3 px-6 h-14 rounded-2xl bg-white dark:bg-[#1e2023] text-[#191c1e] dark:text-white shadow-neu-extruded hover:shadow-neu-extruded-lg active:shadow-neu-recessed transition-all font-semibold text-lg"
        >
          <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0]">home</span>
          <span className="text-[#40484d] dark:text-[#c0c7ce]">Back to Home</span>
        </button>

        {/* Live EEG Indicator */}
        <div className="flex items-center gap-6 px-8 h-14 rounded-full bg-[#85B7D6]/20 dark:bg-[#104c67]/40 backdrop-blur-[20px] ring-1 ring-white/40 dark:ring-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#306480] dark:text-[#9bcded] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monitor_heart
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-[#40484d] dark:text-[#c0c7ce] font-medium leading-none mb-1">
                EEG Active
              </span>
              <span className="text-sm font-bold text-[#191c1e] dark:text-white leading-none">
                {eegStatus.signalStrength} ({eegStatus.focusLevel}% Focus)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            speakText(
              'Welcome to your cognitive games. Choose Match the Faces to see family photos, Garden Paths for melody and flower sequences, or Daily Word Sparks for category recall.'
            )
          }
          className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-semibold text-lg shadow-neu-extruded hover:bg-[#0b5471] active:shadow-neu-recessed transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">volume_up</span>
          <span>Audio Guide</span>
        </button>
      </div>

      {/* Main Title & Welcome */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="font-bold text-4xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight mb-3">
          Cognitive Memory Challenges
        </h1>
        <p className="text-xl md:text-2xl text-[#40484d] dark:text-[#c0c7ce] max-w-3xl mx-auto">
          Engage your mind with gentle, clinically designed exercises adapted to your daily pace.
        </p>
      </div>

      {/* 3 Game Cards Bento Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full pb-12">
        {GAMES_CATALOG.map((game) => (
          <div
            key={game.id}
            onClick={() => handleStartGame(game.id)}
            className="group relative bg-white dark:bg-[#1e2023] rounded-3xl p-8 shadow-neu-extruded hover:shadow-neu-extruded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex flex-col justify-between cursor-pointer border border-white/60 dark:border-white/5"
          >
            <div>
              {/* Game Icon & Cognitive Badge */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-18 h-18 rounded-2xl ${game.colorClass} flex items-center justify-center shadow-md group-hover:rotate-3 transition-transform`}
                >
                  <span
                    className="material-symbols-outlined text-[40px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {game.icon}
                  </span>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-[#f2f4f6] dark:bg-[#282a2d] text-xs font-bold text-[#003c53] dark:text-[#94cef0] border border-[#c0c7ce]/40">
                  {game.badgeText}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-bold text-2xl md:text-3xl text-[#191c1e] dark:text-white mb-1.5">
                {game.title}
              </h2>
              <p className="text-sm font-semibold text-[#003c53] dark:text-[#94cef0] mb-4">
                {game.subtitle}
              </p>

              {/* Description */}
              <p className="text-base text-[#40484d] dark:text-[#c0c7ce] leading-relaxed mb-6">
                {game.description}
              </p>

              {/* Cognitive Area & Time Meta */}
              <div className="space-y-2 py-4 border-t border-[#e1e2e5] dark:border-[#282a2d] text-xs text-[#71787e] dark:text-[#a0a6ac]">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Focus Area</span>
                  <span className="font-bold text-[#191c1e] dark:text-white">{game.cognitiveArea}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Duration</span>
                  <span className="font-bold text-[#191c1e] dark:text-white">{game.timeEstimate}</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartGame(game.id);
              }}
              className="mt-4 w-full h-14 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-bold text-lg flex items-center justify-center gap-2 shadow-neu-extruded group-hover:bg-[#0b5471] transition-all"
            >
              <span>Play Now</span>
              <span className="material-symbols-outlined text-[22px]">play_arrow</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
