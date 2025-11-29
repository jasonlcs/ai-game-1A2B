
import React from 'react';

interface NumberPadProps {
  onDigitClick: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
  currentLength: number;
  impossibleDigits?: string[];
  confirmedPositions?: Record<string, number>; // digit -> index (0-3)
  digitProbabilities?: Record<string, number>; // digit -> probability (0-1)
  compact?: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({ 
  onDigitClick, 
  onDelete, 
  onSubmit, 
  disabled, 
  currentLength,
  impossibleDigits = [],
  confirmedPositions = {},
  digitProbabilities = {},
  compact = false
}) => {
  // Check if probability hints are active (Easy Mode only)
  const showProbabilities = Object.keys(digitProbabilities).length > 0;
  
  // Helper to render a single digit button
  const renderDigitBtn = (digit: string, gridClass: string) => {
    const isImpossible = impossibleDigits.includes(digit);
    const confirmedPos = confirmedPositions[digit];
    const isConfirmed = confirmedPos !== undefined;
    const probability = digitProbabilities[digit] ?? 0;
    
    // If the game is disabled OR this specific digit is impossible, disable the button
    const isBtnDisabled = disabled || isImpossible;

    // Define visual tiers
    let tierClasses = '';

    if (!isBtnDisabled && !isConfirmed) {
      if (showProbabilities) {
        // --- Easy Mode (Probability Colors) ---
        if (probability >= 0.4) {
          // TIER 1: HIGH PROBABILITY (>40%) - GOLD
          tierClasses = 'bg-amber-400 border-amber-300 text-black shadow-[0_0_10px_rgba(251,191,36,0.4)] font-black z-10 ring-2 ring-amber-300/50';
        } else if (probability >= 0.15) {
          // TIER 2: MEDIUM PROBABILITY (15% - 40%) - EMERALD GREEN
          tierClasses = 'bg-emerald-700 border-emerald-600 text-white font-bold shadow-[0_0_5px_rgba(16,185,129,0.3)]';
        } else {
          // TIER 3: LOW PROBABILITY (<15%) - DARK GREY
          tierClasses = 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700';
        }
      } else {
        // --- Smart Mode / Hard Mode (Neutral Colors) ---
        tierClasses = 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 hover:text-white shadow-sm font-semibold';
      }
    }

    return (
      <div className={`${gridClass} flex items-center justify-center w-full h-full`}>
        <button
          key={digit}
          onClick={() => onDigitClick(digit)}
          disabled={isBtnDisabled}
          className={`
            relative flex items-center justify-center rounded-full aspect-square w-full border transition-all duration-200
            ${compact ? 'text-xl' : 'text-3xl'}
            ${isBtnDisabled 
              ? 'bg-slate-900/40 text-slate-800 border-slate-800/30 shadow-none cursor-not-allowed opacity-60' 
              : isConfirmed
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.5)] ring-1 ring-purple-400 z-20 font-black scale-105'
                : `${tierClasses} hover:brightness-110 active:scale-95`
            }
          `}
        >
          {digit}
          
          {/* Confirmed Position Badge */}
          {isConfirmed && (
            <span className={`absolute -top-1 -right-1 flex items-center justify-center bg-purple-500 text-white rounded-full font-bold shadow-sm border border-purple-300 ${compact ? 'w-4 h-4 text-[9px]' : 'w-6 h-6 text-xs'}`}>
              {confirmedPos + 1}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={`mx-auto w-full ${compact ? 'max-w-[280px]' : 'max-w-[380px]'} ${compact ? 'mt-0' : 'mt-4'}`}>
      
      {/* Legend Row - Only show Probability Guide when active */}
      {!disabled && showProbabilities && (
        <div className="flex justify-center items-center gap-3 mb-1.5 text-[9px] font-bold text-slate-400 bg-slate-900/50 py-0.5 px-3 rounded-full border border-slate-800/50 mx-auto w-fit animate-in fade-in slide-in-from-bottom-2 h-6">
             <div className="flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"></span>
               <span className="text-amber-100">推薦</span>
             </div>
             <div className="flex items-center gap-1 border-l border-slate-700 pl-2 ml-1">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
               <span className="text-emerald-100">普通</span>
             </div>
        </div>
      )}

      <div className={`grid grid-cols-4 ${compact ? 'gap-1.5' : 'gap-4'}`}>
        
        {/* Row 1: 1, 2, 3, Delete */}
        {renderDigitBtn('1', 'col-start-1 row-start-1')}
        {renderDigitBtn('2', 'col-start-2 row-start-1')}
        {renderDigitBtn('3', 'col-start-3 row-start-1')}
        
        <div className="col-start-4 row-start-1 flex items-center justify-center w-full h-full">
          <button
            onClick={onDelete}
            disabled={disabled}
            className={`w-full aspect-square rounded-full bg-slate-700/50 hover:bg-red-900/40 active:bg-red-800/60 text-slate-400 hover:text-red-300 border border-slate-600 hover:border-red-800/50 flex items-center justify-center font-bold transition-colors
            ${compact ? 'text-lg' : 'text-2xl'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ✕
          </button>
        </div>
        
        {/* Row 2: 4, 5, 6, Submit(Start) */}
        {renderDigitBtn('4', 'col-start-1 row-start-2')}
        {renderDigitBtn('5', 'col-start-2 row-start-2')}
        {renderDigitBtn('6', 'col-start-3 row-start-2')}
        
        {/* Row 3: 7, 8, 9, Submit(Cont) */}
        {renderDigitBtn('7', 'col-start-1 row-start-3')}
        {renderDigitBtn('8', 'col-start-2 row-start-3')}
        {renderDigitBtn('9', 'col-start-3 row-start-3')}

        {/* Row 4: 0 (Center of left 3 cols), Submit(End) */}
        {renderDigitBtn('0', 'col-start-2 row-start-4')}

        {/* Submit Button - Spans Rows 2-4 in Col 4 */}
        <div className="col-start-4 row-start-2 row-span-3 flex items-center justify-center h-full py-0.5">
          <button
            onClick={onSubmit}
            disabled={disabled || currentLength !== 4}
            className={`w-full h-full rounded-full flex flex-col items-center justify-center font-bold shadow transition-all duration-200 border
            ${compact ? 'text-base gap-0' : 'text-xl gap-1'}
            ${
              currentLength === 4 && !disabled
                ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.6)] active:scale-95'
                : 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <span className="leading-none text-lg">猜</span>
            <span className="leading-none text-[9px] opacity-60 mt-0.5">GO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;
