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
  // Helper to render a single digit button
  const renderDigitBtn = (digit: string, gridClass: string) => {
    const isImpossible = impossibleDigits.includes(digit);
    const confirmedPos = confirmedPositions[digit];
    const isConfirmed = confirmedPos !== undefined;
    const probability = digitProbabilities[digit] ?? 0;
    
    // If the game is disabled OR this specific digit is impossible, disable the button
    const isBtnDisabled = disabled || isImpossible;

    // Define visual tiers based on probability
    let tierClasses = '';

    if (!isBtnDisabled && !isConfirmed) {
      if (probability >= 0.4) {
        // TIER 1: HIGH PROBABILITY (>40%) - HOT
        // Very Bright Cyan background, Black text for maximum readability and contrast
        tierClasses = 'bg-cyan-400 border-white/50 text-black shadow-[0_0_20px_rgba(34,211,238,0.6)] font-black scale-[1.02] z-10 ring-2 ring-cyan-300/50';
      } else if (probability >= 0.15) {
        // TIER 2: MEDIUM PROBABILITY (15% - 40%) - WARM
        // Deep Teal background, White text
        tierClasses = 'bg-teal-700 border-teal-500 text-white font-bold shadow-[0_0_5px_rgba(20,184,166,0.4)]';
      } else {
        // TIER 3: LOW PROBABILITY (<15%) - COLD
        // Dark Slate background, Dim text
        tierClasses = 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700';
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
            ${compact ? 'text-xl' : 'text-2xl'}
            ${isBtnDisabled 
              ? 'bg-slate-900/40 text-slate-800 border-slate-800/30 shadow-none cursor-not-allowed opacity-60' 
              : isConfirmed
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] ring-2 ring-indigo-400 z-20 font-black scale-105'
                : `${tierClasses} hover:brightness-110 active:scale-95`
            }
          `}
        >
          {digit}
          
          {/* Confirmed Position Badge */}
          {isConfirmed && (
            <span className={`absolute -top-1 -right-1 flex items-center justify-center bg-indigo-500 text-white rounded-full font-bold shadow-sm border border-indigo-300 ${compact ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'}`}>
              {confirmedPos + 1}
            </span>
          )}

          {/* Probability Bar for Medium Tier (Visual aid) */}
          {!isBtnDisabled && !isConfirmed && probability >= 0.15 && probability < 0.4 && (
             <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-teal-300/80"></div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-4 ${compact ? 'gap-2 max-w-[260px]' : 'gap-3 max-w-[340px]'} mx-auto ${compact ? 'mt-1' : 'mt-4'}`}>
      
      {/* Row 1: 1, 2, 3, Delete */}
      {renderDigitBtn('1', 'col-start-1 row-start-1')}
      {renderDigitBtn('2', 'col-start-2 row-start-1')}
      {renderDigitBtn('3', 'col-start-3 row-start-1')}
      
      <div className="col-start-4 row-start-1 flex items-center justify-center w-full h-full">
        <button
          onClick={onDelete}
          disabled={disabled}
          className={`w-full aspect-square rounded-full bg-slate-700/50 hover:bg-red-900/40 active:bg-red-800/60 text-slate-400 hover:text-red-300 border border-slate-600 hover:border-red-800/50 flex items-center justify-center font-bold transition-colors
          ${compact ? 'text-sm' : 'text-lg'}
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
      <div className="col-start-4 row-start-2 row-span-3 flex items-center justify-center h-full py-1">
        <button
          onClick={onSubmit}
          disabled={disabled || currentLength !== 4}
          className={`w-full h-full rounded-full flex flex-col items-center justify-center font-bold shadow transition-all duration-200 border
          ${compact ? 'text-base gap-0.5' : 'text-xl gap-1'}
          ${
            currentLength === 4 && !disabled
              ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.6)] active:scale-95'
              : 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <span className="leading-none">猜</span>
          <span className="leading-none text-[10px] opacity-60">GO</span>
        </button>
      </div>
    </div>
  );
};

export default NumberPad;