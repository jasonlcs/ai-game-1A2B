
import React from 'react';

interface GameStatsProps {
  remainingCount: number;
  totalCombinations: number;
}

const GameStats: React.FC<GameStatsProps> = ({ remainingCount, totalCombinations }) => {
  const percentLeft = (remainingCount / totalCombinations) * 100;
  const percentExcluded = 100 - percentLeft;
  
  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-wider text-slate-500">
         <span>剩餘: <span className="text-cyan-400 font-bold">{remainingCount}</span></span>
         <span>排除: <span className="text-emerald-400 font-bold">{percentExcluded.toFixed(1)}%</span></span>
      </div>
      
      {/* Slim Progress Bar */}
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all duration-700 ease-out"
          style={{ width: `${percentExcluded}%` }}
        ></div>
      </div>
    </div>
  );
};

export default GameStats;
