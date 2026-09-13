import React, { useState, useEffect } from 'react';
import { MemoryCard, EEGStatus } from '../types';
import { FAMILY_MEMBERS } from '../data/mockData';
import { speakText, playFlipSound, playMatchSound } from '../utils/audio';

interface FacesGameProps {
  onExitGame: () => void;
  onGameComplete: (score: { memoryScore: number; focusLevel: string; timeSpent: string }) => void;
  eegStatus: EEGStatus;
}

export const FacesGame: React.FC<FacesGameProps> = ({
  onExitGame,
  onGameComplete,
  eegStatus,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const [hintMessage, setHintMessage] = useState<string>('Tap a tile to reveal a family member.');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const cardPairs: MemoryCard[] = [];
    FAMILY_MEMBERS.forEach((member) => {
      cardPairs.push({
        id: `${member.id}-1`,
        memberId: member.id,
        name: member.name,
        image: member.image,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: `${member.id}-2`,
        memberId: member.id,
        name: member.name,
        image: member.image,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCardIds([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsProcessing(false);
    setHintMessage('Tap a tile to reveal a family member.');
  };

  const handleCardClick = (clickedCard: MemoryCard) => {
    if (isProcessing || clickedCard.isFlipped || clickedCard.isMatched) {
      return;
    }

    playFlipSound();

    const updatedCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCardIds, clickedCard.id];
    setFlippedCardIds(newFlipped);

    if (newFlipped.length === 1) {
      setHintMessage(`You found ${clickedCard.name}. Can you find the matching pair?`);
      return;
    }

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves((prev) => prev + 1);

      const firstCard = updatedCards.find((c) => c.id === newFlipped[0])!;
      const secondCard = clickedCard;

      if (firstCard.memberId === secondCard.memberId) {
        playMatchSound();
        const memberInfo = FAMILY_MEMBERS.find((f) => f.id === firstCard.memberId);
        const relation = memberInfo ? ` (${memberInfo.relation})` : '';

        setHintMessage(`Great match! That's ${firstCard.name}${relation}.`);
        speakText(`Wonderful! You matched ${firstCard.name}.`);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.memberId === firstCard.memberId
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedCardIds([]);
          setIsProcessing(false);

          const newMatchCount = matchedPairs + 1;
          setMatchedPairs(newMatchCount);

          if (newMatchCount === 6) {
            const elapsedMins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
            const calculatedScore = Math.max(75, Math.min(100, 100 - (moves - 6) * 3));
            
            setTimeout(() => {
              onGameComplete({
                memoryScore: calculatedScore,
                focusLevel: 'High',
                timeSpent: `${elapsedMins} min`,
              });
            }, 800);
          }
        }, 600);
      } else {
        setHintMessage('Not a match this time. Try remembering their positions!');
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCardIds([]);
          setIsProcessing(false);
        }, 1200);
      }
    }
  };

  const handleListenHelp = () => {
    speakText(
      `Match the Faces game. Tap a tile to reveal a family member, then find their matching photograph. Take your time, there is no rush.`
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

        {/* Indicators Panel */}
        <div className="flex items-center gap-6 px-8 h-14 rounded-full bg-[#85B7D6]/20 dark:bg-[#104c67]/40 backdrop-blur-[20px] ring-1 ring-white/40 dark:ring-white/10 shadow-sm">
          {/* EEG Signal */}
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#306480] dark:text-[#9bcded] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monitor_heart
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-[#40484d] dark:text-[#c0c7ce] font-medium leading-none mb-1">
                EEG Signal
              </span>
              <span className="text-sm font-bold text-[#191c1e] dark:text-white leading-none">
                {eegStatus.signalStrength}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-[#c0c7ce]/50 dark:bg-[#40484d]"></div>

          {/* Focus Level */}
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-[#40484d] dark:text-[#c0c7ce] font-medium leading-none mb-1">
                Focus Level
              </span>
              <div className="w-24 h-2.5 bg-[#edeef0] dark:bg-[#282a2d] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-[#003c53] dark:bg-[#94cef0] rounded-full transition-all duration-500"
                  style={{ width: `${eegStatus.focusLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Listen / Help Button */}
        <button
          onClick={handleListenHelp}
          className="flex items-center gap-3 px-8 h-14 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-semibold text-lg shadow-neu-extruded hover:bg-[#0b5471] active:shadow-neu-recessed transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">volume_up</span>
          <span>Listen</span>
        </button>
      </div>

      {/* Game Title & Prompt */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="font-bold text-4xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight mb-2">
          Match the Faces
        </h1>
        <p className="text-xl md:text-2xl text-[#40484d] dark:text-[#c0c7ce]">
          {hintMessage}
        </p>
      </div>

      {/* 4x3 Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto pb-12">
        {cards.map((card) => {
          const isShown = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isShown || isProcessing}
              className={`relative w-full aspect-square rounded-3xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300 transform ${
                isShown
                  ? 'bg-white dark:bg-[#1e2023] shadow-neu-recessed-deep ring-2 ring-[#003c53]/30 scale-[0.98]'
                  : 'bg-white dark:bg-[#1e2023] shadow-neu-extruded hover:shadow-neu-extruded-lg hover:scale-[1.03] active:scale-[0.97]'
              }`}
            >
              {isShown ? (
                <div className="relative w-full h-full">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-2.5 bg-[#85B7D6]/30 dark:bg-[#003c53]/60 backdrop-blur-[16px] ring-1 ring-white/40 flex items-center justify-center">
                    <span className="font-bold text-lg text-[#191c1e] dark:text-white drop-shadow-sm">
                      {card.name}
                    </span>
                  </div>

                  {card.isMatched && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#003c53] text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4">
                  <span className="material-symbols-outlined text-[#003c53]/35 dark:text-[#94cef0]/40 text-[56px] md:text-[68px]">
                    diversity_1
                  </span>
                  <span className="text-xs font-semibold text-[#71787e] tracking-wider uppercase">
                    Tap to Flip
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
