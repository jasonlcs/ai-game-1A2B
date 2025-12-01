
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
          // TIER 1: HIGH PROBABILITY - GOLD (Amber)
          tierClasses = 'bg-gradient-to-br from-amber-300 to-amber-500 text-neutral-900 font-bold border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-200/50';
        } else if (probability >= 0.15) {
          // TIER 2: MEDIUM PROBABILITY - GREEN (Emerald)
          tierClasses = 'bg-emerald-800 text-emerald-100 border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
        } else {
          // TIER 3: LOW PROBABILITY - GREY (Brighter Slate)
          tierClasses = 'bg-slate-700 text-slate-300 border-slate-600';
        }
      } else {
        // --- Smart / Hard Mode (Neutral Luxury) ---
        // Elegant glassmorphism - Brightened for visibility
        tierClasses = 'bg-neutral-800 border-white/20 text-white hover:bg-neutral-700 hover:border-amber-500/40 hover:text-amber-100 shadow-sm backdrop-blur-sm';
      }
    }

    return (
      <div className={`${gridClass} flex items-center justify-center w-full h-full`}>
        <button
          key={digit}
          onClick={() => onDigitClick(digit)}
          disabled={isBtnDisabled}
          className={`
            relative flex items-center justify-center rounded-full aspect-square w-full border transition-all duration-300 ease-out
            ${compact ? 'text-xl' : 'text-3xl'}
            font-mono
            ${isBtnDisabled 
              ? 'bg-neutral-900/30 text-neutral-600 border-transparent shadow-none cursor-not-allowed' 
              : isConfirmed
                ? 'bg-indigo-800 text-indigo-100 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] ring-1 ring-indigo-400 z-20 font-bold scale-105'
                : `${tierClasses} hover:scale-105 active:scale-95`
            }
          `}
        >
          {digit}
          
          {/* Confirmed Position Badge */}
          {isConfirmed && (
            <span className={`absolute -top-1 -right-1 flex items-center justify-center bg-indigo-500 text-white rounded-full font-serif font-bold shadow-lg border border-indigo-300 ${compact ? 'w-4 h-4 text-[9px]' : 'w-6 h-6 text-xs'}`}>
              {confirmedPos + 1}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={`mx-auto w-full ${compact ? 'max-w-[250px]' : 'max-w-[380px]'} ${compact ? 'mt-0' : 'mt-4'}`}>
      
      {/* Legend Row */}
      {!disabled && showProbabilities && (
        <div className="flex justify-center items-center gap-4 mb-2 text-[10px] font-medium tracking-widest uppercase text-neutral-300 bg-neutral-800/80 py-1 px-4 rounded-full border border-white/10 mx-auto w-fit animate-in fade-in slide-in-from-bottom-2 shadow-lg">
             <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"></span>
               <span className="text-amber-100 font-bold">推薦</span>
             </div>
             <div className="flex items-center gap-1.5 border-l border-white/20 pl-3">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               <span className="text-emerald-100 font-bold">普通</span>
             </div>
        </div>
      )}
      
      {/* Smart Mode Legend */}
      {!disabled && !showProbabilities && (impossibleDigits.length > 0 || Object.keys(confirmedPositions).length > 0) && (
         <div className="flex justify-center items-center gap-2 mb-2 text-[9px] tracking-widest uppercase text-neutral-400 bg-neutral-800/60 py-1 px-3 rounded-full border border-white/10 mx-auto w-fit">
            <span>智慧記憶已啟用</span>
         </div>
      )}

      <div className={`grid grid-cols-4 ${compact ? 'gap-2' : 'gap-4'}`}>
        
        {/* Row 1: 1, 2, 3, Delete */}
        {renderDigitBtn('1', 'col-start-1 row-start-1')}
        {renderDigitBtn('2', 'col-start-2 row-start-1')}
        {renderDigitBtn('3', 'col-start-3 row-start-1')}
        
        <div className="col-start-4 row-start-1 flex items-center justify-center w-full h-full">
          <button
            onClick={onDelete}
            disabled={disabled}
            className={`w-full aspect-square rounded-full bg-neutral-800 hover:bg-red-950/80 active:bg-red-900 text-neutral-400 hover:text-red-200 border border-white/10 hover:border-red-900/50 flex items-center justify-center font-bold transition-all duration-200 shadow-sm
            ${compact ? 'text-sm' : 'text-2xl'}
            ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
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
            className={`w-full h-full rounded-full flex flex-col items-center justify-center font-bold shadow-lg transition-all duration-300 border
            ${compact ? 'text-sm gap-0.5' : 'text-xl gap-1'}
            ${
              currentLength === 4 && !disabled
                ? 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 text-neutral-900 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95'
                : 'bg-neutral-800 text-neutral-600 border-white/5 cursor-not-allowed'
            }`}
          >
            <span className="leading-none text-base font-serif">猜</span>
            <span className="leading-none text-[8px] opacity-70 mt-0.5 tracking-widest">ENTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;
