import React from 'react';

interface NumberPadProps {
  onDigitClick: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
  currentLength: number;
}

const NumberPad: React.FC<NumberPadProps> = ({ onDigitClick, onDelete, onSubmit, disabled, currentLength }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto mt-4">
      {digits.map((digit) => (
        <button
          key={digit}
          onClick={() => onDigitClick(digit)}
          disabled={disabled}
          className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl py-4 rounded-lg shadow transition-colors border border-slate-600"
        >
          {digit}
        </button>
      ))}
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