
import React from 'react';

interface NumberPadProps {
  onDigitClick: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
  currentLength: number;
  impossibleDigits?: string[];
  confirmedPositions?: Record<string, number>; // New prop: digit -> index (0-3)
}

const NumberPad: React.FC<NumberPadProps> = ({ 
  onDigitClick, 
  onDelete, 
  onSubmit, 
  disabled, 
  currentLength,
  impossibleDigits = [],
  confirmedPositions = {}
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto mt-4">
      {digits.map((digit) => {
        const isImpossible = impossibleDigits.includes(digit);
        const confirmedPos = confirmedPositions[digit]; // 0, 1, 2, or 3 if confirmed
        const isConfirmed = confirmedPos !== undefined;
        
        return (
          <button
            key={digit}
            onClick={() => onDigitClick(digit)}
            disabled={disabled}
            className={`
              relative font-bold text-xl py-4 rounded-lg shadow transition-all border
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${isImpossible 
                ? 'bg-slate-800 text-slate-600 border-slate-800 shadow-none' 
                : isConfirmed
                  ? 'bg-cyan-900/40 hover:bg-cyan-800/60 active:bg-cyan-700 text-cyan-100 border-cyan-600/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white border-slate-600'
              }
            `}
          >
            {digit}
            {/* Position Indicator Badge */}
            {isConfirmed && (
              <span className="absolute bottom-1 right-1.5 text-[10px] font-mono leading-none text-cyan-400 font-extrabold opacity-90">
                #{confirmedPos + 1}
              </span>
            )}
          </button>
        );
      })}
      <button
        onClick={onDelete}
        disabled={disabled}
        className="bg-red-900/50 hover:bg-red-800/50 active:bg-red-800 disabled:opacity-50 text-red-200 font-bold text-lg py-4 rounded-lg shadow transition-colors border border-red-900"
      >
        刪除
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled || currentLength !== 4}
        className={`col-span-2 font-bold text-lg py-4 rounded-lg shadow transition-all border ${
          currentLength === 4 && !disabled
            ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-cyan-900/50 shadow-lg'
            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
        }`}
      >
        猜測
      </button>
    </div>
  );
};

export default NumberPad;
