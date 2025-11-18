import React from 'react';

interface GameStatsProps {
  remainingCount: number;
  totalCombinations: number;
}

const GameStats: React.FC<GameStatsProps> = ({ remainingCount, totalCombinations }) => {
  const percentLeft = ((remainingCount / totalCombinations) * 100).toFixed(2);
  
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4 flex justify-between items-center shadow-inner">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">剩餘組合</p>
        <p className="text-2xl font-mono text-cyan-400">{remainingCount}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">已排除</p>
        <p className="text-xl font-mono text-emerald-400">{100 - parseFloat(percentLeft)}%</p>
      </div>
    </div>
  );
};

export default GameStats;