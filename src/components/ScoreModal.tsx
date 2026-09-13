import React from 'react';

interface ScoreModalProps {
  score: {
    memoryScore: number;
    focusLevel: string;
    timeSpent: string;
  };
  onBackToHome: () => void;
  onPlayAgain: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  score,
  onBackToHome,
  onPlayAgain,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#f8f9fc]/95 dark:bg-[#191c1e]/95 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/60 dark:border-white/10 my-8">
        {/* Star Icon Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#0b5471] dark:bg-[#004c68] rounded-full flex items-center justify-center shadow-neu-extruded">
            <span
              className="material-symbols-outlined text-[44px] md:text-[52px] text-amber-300"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-bold text-3xl md:text-5xl text-[#191c1e] dark:text-white tracking-tight mb-2">
            Wonderful Job!
          </h2>
          <p className="text-xl text-[#40484d] dark:text-[#c0c7ce]">
            You've completed today's exercise session.
          </p>
        </div>

        {/* 3 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Stat 1: Memory */}
          <div className="bg-[#edeef0] dark:bg-[#282a2d] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-[32px] text-[#003c53] dark:text-[#94cef0] mb-2">
              psychology
            </span>
            <span className="text-xs font-bold text-[#40484d] dark:text-[#c0c7ce] uppercase tracking-wider mb-1">
              Memory Score
            </span>
            <span className="font-bold text-3xl text-[#003c53] dark:text-[#94cef0]">
              {score.memoryScore}%
            </span>
            <div className="w-full bg-[#e1e2e5] dark:bg-[#1e2023] h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#003c53] dark:bg-[#94cef0] h-full rounded-full transition-all duration-1000"
                style={{ width: `${score.memoryScore}%` }}
              ></div>
            </div>
          </div>

          {/* Stat 2: Focus Level */}
          <div className="bg-[#edeef0] dark:bg-[#282a2d] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-[32px] text-[#306480] dark:text-[#9bcded] mb-2">
              visibility
            </span>
            <span className="text-xs font-bold text-[#40484d] dark:text-[#c0c7ce] uppercase tracking-wider mb-1">
              Focus Level
            </span>
            <span className="font-bold text-3xl text-[#306480] dark:text-[#9bcded]">
              {score.focusLevel}
            </span>
            <div className="w-full flex gap-1.5 mt-3">
              <div className="h-2 flex-1 rounded-full bg-[#306480] dark:bg-[#9bcded]"></div>
              <div className="h-2 flex-1 rounded-full bg-[#306480] dark:bg-[#9bcded]"></div>
              <div className="h-2 flex-1 rounded-full bg-[#306480] dark:bg-[#9bcded]"></div>
              <div className="h-2 flex-1 rounded-full bg-[#e1e2e5] dark:bg-[#1e2023]"></div>
            </div>
          </div>

          {/* Stat 3: Time */}
          <div className="bg-[#edeef0] dark:bg-[#282a2d] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
            <span className="material-symbols-outlined text-[32px] text-[#513000] dark:text-[#f6bb77] mb-2">
              timer
            </span>
            <span className="text-xs font-bold text-[#40484d] dark:text-[#c0c7ce] uppercase tracking-wider mb-1">
              Time Spent
            </span>
            <span className="font-bold text-3xl text-[#513000] dark:text-[#f6bb77]">
              {score.timeSpent}
            </span>
            <span className="text-xs text-[#71787e] mt-3">Active Session</span>
          </div>
        </div>

        {/* Next Level Notification Box */}
        <div className="bg-[#6e4509]/15 dark:bg-[#653e02]/40 rounded-2xl p-5 mb-8 flex items-center gap-4 border border-[#efb571]/30">
          <div className="w-14 h-14 bg-[#513000] dark:bg-[#f6bb77] shrink-0 rounded-full flex items-center justify-center shadow-md">
            <span
              className="material-symbols-outlined text-[28px] text-[#ffddb9] dark:text-[#2b1700]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xl text-[#513000] dark:text-[#ffddb9] mb-0.5">
              Next Level Unlocked!
            </h3>
            <p className="text-base text-[#513000]/80 dark:text-[#ffddb9]/80">
              You've unlocked the 'Garden Paths' memory challenge.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto min-w-[200px] min-h-[56px] px-8 rounded-full bg-white dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0] font-semibold text-lg flex items-center justify-center gap-2 shadow-neu-extruded transition-all hover:scale-105 active:scale-95 border border-[#c0c7ce]/40"
          >
            <span className="material-symbols-outlined">replay</span>
            <span>Play Again</span>
          </button>

          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto min-w-[220px] min-h-[56px] px-8 rounded-full bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-semibold text-lg flex items-center justify-center gap-2 shadow-neu-extruded transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined">home</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
