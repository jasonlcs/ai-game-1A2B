
import React from 'react';

interface NumberPadProps {
  onDigitClick: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
  currentLength: number;
  impossibleDigits?: string[];
  confirmedPositions?: Record<string, number>; // digit -> index (0-3)
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
  compact = false
}) => {
  // Helper to render a single digit button
  const renderDigitBtn = (digit: string, gridClass: string) => {
    const isImpossible = impossibleDigits.includes(digit);
    const confirmedPos = confirmedPositions[digit];
    const isConfirmed = confirmedPos !== undefined;
    
    // If the game is disabled OR this specific digit is impossible, disable the button
    const isBtnDisabled = disabled || isImpossible;

    return (
      <div className={`${gridClass} flex items-center justify-center`}>
        <button
          key={digit}
          onClick={() => onDigitClick(digit)}
          disabled={isBtnDisabled}
          className={`
            relative font-bold shadow transition-all border flex items-center justify-center rounded-full aspect-square w-full
            ${compact ? 'text-xl' : 'text-2xl'}
            ${isBtnDisabled 
              ? 'bg-slate-800 text-slate-600 border-slate-800 shadow-none cursor-not-allowed opacity-50' 
              : isConfirmed
                ? 'bg-cyan-900/40 hover:bg-cyan-800/60 active:bg-cyan-700 text-cyan-100 border-cyan-600/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white border-slate-600'
            }
          `}
        >
          {digit}
          {isConfirmed && (
            <span className={`absolute bottom-1 right-1.5 font-mono leading-none text-cyan-400 font-extrabold opacity-90 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
              #{confirmedPos + 1}
            </span>
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
      
      <div className="col-start-4 row-start-1 flex items-center justify-center">
        <button
          onClick={onDelete}
          disabled={disabled}
          className={`w-full aspect-square rounded-full bg-red-900/30 hover:bg-red-900/50 active:bg-red-800 text-red-200 border border-red-900/50 flex items-center justify-center font-bold transition-colors
          ${compact ? 'text-sm' : 'text-lg'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          刪除
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
          className={`w-full h-full rounded-2xl flex items-center justify-center font-bold shadow transition-all border
          ${compact ? 'text-base' : 'text-xl'}
          ${
            currentLength === 4 && !disabled
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-cyan-900/50 shadow-lg'
              : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
        >
          {compact ? '猜' : '猜測'}
        </button>
      </div>
    </div>
  );
};

export default NumberPad;
