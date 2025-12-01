
import React from 'react';

interface GameStatsProps {
  remainingCount: number;
  totalCombinations: number;
}

const GameStats: React.FC<GameStatsProps> = ({ remainingCount, totalCombinations }) => {
  const percentLeft = (remainingCount / totalCombinations) * 100;
  const percentExcluded = 100 - percentLeft;
  
  return (
    <div className="flex flex-col gap-1.5 w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest text-neutral-500">
         <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
            剩餘: <span className="text-amber-100 font-bold">{remainingCount}</span>
         </span>
         <span>排除: <span className="text-neutral-300 font-bold">{percentExcluded.toFixed(1)}%</span></span>
      </div>
      
      {/* Luxury Progress Bar */}
      <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden relative">
        {/* Background glow for the track */}
        <div className="absolute inset-0 bg-white/5"></div>
        <div 
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-700 ease-out relative"
          style={{ width: `${percentExcluded}%` }}
        >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
