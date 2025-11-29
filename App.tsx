
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateAllCombinations, generateSecret, calculateAB, filterPossibilities, getImpossibleDigits, getConfirmedPositions, getPositionalPossibilities, getDigitProbabilities, generateGameReview, ReviewStep } from './utils/gameEngine';
import { GuessResult, GameState } from './types';
import NumberPad from './components/NumberPad';
import GameStats from './components/GameStats';

// Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const UnlockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

// --- Custom Logo Component ---
const GameLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" className="text-slate-600" strokeDasharray="4 4" />
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" className="text-cyan-500" />
    <path d="M16 2V6M16 26V30M2 16H6M26 16H30" stroke="currentColor" strokeWidth="2" className="text-cyan-800" />
    <text x="16" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">1A</text>
  </svg>
);

// --- Background Component ---
const CyberBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-900"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <circle cx="10%" cy="20%" r="100" fill="url(#grid)" className="text-cyan-800/20" />
      <circle cx="90%" cy="80%" r="150" fill="url(#grid)" className="text-cyan-800/20" />
    </svg>
  </div>
);


// --- Sub-component for Game Rules ---
const GameRules = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden transition-all z-10 relative ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-bold">
          <InfoIcon />
          <span>遊戲規則說明</span>
        </div>
        <ChevronDownIcon className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-3 pt-0 text-xs md:text-sm text-slate-400 border-t border-slate-700/50 bg-slate-900/30">
          <div className="space-y-3 mt-3">
            <div>
              <h3 className="text-slate-200 font-bold mb-1">🎯 遊戲目標</h3>
              <p>猜出系統產生的一組 <span className="text-cyan-400 font-mono">4</span> 位不重複數字（例如：1234）。</p>
            </div>
            
            {/* Visual Diagram */}
            <div className="my-2 p-2 bg-slate-800/80 rounded border border-slate-700/50 overflow-hidden flex justify-center">
              <svg viewBox="0 0 300 130" className="w-full max-w-[280px] h-auto font-mono select-none">
                <defs>
                  <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6" fill="#4ade80" />
                  </marker>
                  <marker id="arrow-yellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6" fill="#facc15" />
                  </marker>
                </defs>

                {/* Secret Row */}
                <text x="0" y="25" fill="#94a3b8" fontSize="12" fontWeight="bold">謎底</text>
                <g transform="translate(60, 5)">
                  <rect x="0" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="15" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">5</text>
                  
                  <rect x="40" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="55" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">6</text>
                  
                  <rect x="80" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="95" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">7</text>
                  
                  <rect x="120" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="135" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">8</text>
                </g>

                {/* Guess Row */}
                <text x="0" y="105" fill="#94a3b8" fontSize="12" fontWeight="bold">猜測</text>
                <g transform="translate(60, 85)">
                  <rect x="0" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="15" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">5</text>
                  
                  <rect x="40" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="55" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">7</text>
                  
                  <rect x="80" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="95" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">2</text>
                  
                  <rect x="120" y="0" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x="135" y="20" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">1</text>
                </g>

                {/* Connections */}
                {/* 5 -> 5 (Green, A) */}
                <path d="M75,35 L75,85" stroke="#4ade80" strokeWidth="2" markerEnd="url(#arrow-green)" strokeDasharray="4"/>
                <circle cx="75" cy="60" r="10" fill="#14532d" stroke="#4ade80" strokeWidth="1" />
                <text x="75" y="64" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">A</text>

                {/* 7 -> 7 (Yellow, B) */}
                <path d="M155,35 L115,85" stroke="#facc15" strokeWidth="2" markerEnd="url(#arrow-yellow)" strokeDasharray="4"/>
                <circle cx="135" cy="60" r="10" fill="#713f12" stroke="#facc15" strokeWidth="1" />
                <text x="135" y="64" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="bold">B</text>

                {/* Explanation text */}
                <text x="210" y="55" fill="#4ade80" fontSize="11" fontWeight="bold">位置正確</text>
                <text x="210" y="75" fill="#facc15" fontSize="11" fontWeight="bold">數字對但位置錯</text>
              </svg>
            </div>

            <div>
              <h3 className="text-slate-200 font-bold mb-1">💡 文字舉例</h3>
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                <p>謎底 <span className="font-mono text-white">5678</span>，猜 <span className="font-mono text-white">5721</span></p>
                <p className="mt-1">結果：<span className="font-mono text-green-400 font-bold">1A</span><span className="font-mono text-yellow-400 font-bold">1B</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component for Positional Analysis ---
const PositionalAnalysis = ({ possibleAnswers }: { possibleAnswers: string[] }) => {
  const positionalData = useMemo(() => getPositionalPossibilities(possibleAnswers), [possibleAnswers]);

  return (
    <div className="space-y-1.5">
       <div className="grid grid-cols-4 gap-1">
         {positionalData.map((digits, idx) => (
           <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded px-1 py-1 text-center flex flex-col h-full">
             <div className="text-[9px] text-slate-500 mb-0.5 font-bold border-b border-slate-800 pb-0.5">第 {idx + 1} 位</div>
             <div className="flex-1 flex items-center justify-center">
               <div className="text-[10px] leading-tight text-cyan-300 break-all font-mono">
                 {digits.join(' ')}
               </div>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

// --- Sub-component for Game History List ---
const GameHistory = ({ guesses, totalGuesses }: { guesses: GuessResult[], totalGuesses: number }) => {
  if (guesses.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {guesses.map((result, idx) => {
        // Since guesses are reversed, the first one (index 0) is the latest
        const isLatest = idx === 0;
        const realIndex = totalGuesses - idx; // Calculate original index (1-based)
        
        return (
          <div 
            key={`${result.guess}-${idx}`}
            className={`
              flex items-center justify-between px-2 py-1.5 rounded-lg border 
              ${isLatest 
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20 col-span-2' 
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 col-span-1'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${isLatest ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-700 text-slate-500'}`}>
                #{realIndex}
              </span>
              <span className={`font-mono font-bold tracking-widest ${isLatest ? 'text-lg text-white' : 'text-sm'}`}>
                {result.guess}
              </span>
            </div>
            
            <div className={`font-mono font-bold ${isLatest ? 'text-lg' : 'text-sm'}`}>
              <span className={result.a === 4 ? "text-green-400" : isLatest ? "text-green-400" : "text-slate-300"}>{result.a}A</span>
              <span className={result.b > 0 ? "text-yellow-400" : isLatest ? "text-yellow-400" : "text-slate-500"}>{result.b}B</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Sub-component for Game Review Modal ---
const GameReviewList = ({ guesses }: { guesses: GuessResult[] }) => {
  const steps = useMemo(() => generateGameReview(guesses), [guesses]);

  return (
    <div className="w-full flex-1 overflow-y-auto px-1 pr-2 space-y-3 custom-scrollbar">
      {steps.map((step) => (
        <div key={step.stepIndex} className="relative pl-4 border-l-2 border-slate-700 last:border-cyan-500 last:border-l-2">
          {/* Timeline Dot */}
          <div className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full ${step.stepIndex === steps.length ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`}></div>
          
          <div className="bg-slate-800/30 rounded p-2 border border-slate-700/50">
             <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">STEP {step.stepIndex}</span>
                    <span className="font-mono font-bold text-white tracking-widest">{step.guess}</span>
                </div>
                <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${step.guess === steps[steps.length-1].guess && step.result === '4A0B' ? 'bg-green-900 text-green-300' : 'bg-slate-900 text-slate-400'}`}>
                    {step.result}
                </span>
             </div>
             
             {/* Progress Bar for Reduction */}
             <div className="flex items-center gap-2 mb-1">
                 <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{width: `${step.reductionPercent}%`}}></div>
                 </div>
                 <span className="text-[9px] text-emerald-400 font-mono">-{Math.round(step.reductionPercent)}%</span>
             </div>
             
             {/* Text Analysis */}
             <div className="flex flex-col gap-0.5">
                 <span className="text-[11px] text-cyan-200 font-bold">{step.comment}</span>
                 <span className="text-[10px] text-slate-400 leading-tight">{step.insight}</span>
             </div>
          </div>
        </div>
      ))}
      
      {/* End Badge */}
      <div className="flex justify-center mt-4 mb-2">
          <div className="bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 px-4 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              解碼完成
          </div>
      </div>
    </div>
  );
};


// --- MAIN APP ---

type Difficulty = 'easy' | 'hard' | 'smart';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    secret: generateSecret(),
    guesses: [],
    possibleAnswers: generateAllCombinations(),
    status: 'playing',
  });
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Calculation Hooks
  const impossibleDigits = useMemo(() => getImpossibleDigits(gameState.possibleAnswers), [gameState.possibleAnswers]);
  const confirmedPositions = useMemo(() => getConfirmedPositions(gameState.possibleAnswers), [gameState.possibleAnswers]);
  const digitProbabilities = useMemo(() => getDigitProbabilities(gameState.possibleAnswers), [gameState.possibleAnswers]);
  
  // Logic: Hints are locked in EASY mode for the first 3 guesses. 
  // In SMART mode, hints (memory aids) are ALWAYS available, but probabilities are HIDDEN.
  // In HARD mode, everything is hidden.
  const isHintLocked = difficulty === 'easy' && gameState.guesses.length < 3;
  
  // What to pass to UI?
  const showMemoryHints = (difficulty === 'easy' && !isHintLocked) || difficulty === 'smart';
  const showPredictionHints = (difficulty === 'easy' && !isHintLocked);

  // Scroll ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when guesses change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameState.guesses]);

  const handleRestart = () => {
    setGameState({
      secret: generateSecret(),
      guesses: [],
      possibleAnswers: generateAllCombinations(),
      status: 'playing',
    });
    setInput('');
  };

  const toggleDifficulty = () => {
    setDifficulty(prev => {
        if (prev === 'easy') return 'smart';
        if (prev === 'smart') return 'hard';
        return 'easy';
    });
  };

  const handleGuess = () => {
    if (input.length !== 4) return;

    const { a, b } = calculateAB(gameState.secret, input);
    
    // Logic: Calculate next pool based on this guess
    const nextPool = filterPossibilities(gameState.possibleAnswers, input, a, b);
    
    // New guess object
    const newGuess: GuessResult = { guess: input, a, b };

    // Update state
    setGameState(prev => ({
      ...prev,
      guesses: [...prev.guesses, newGuess], // Store in chronological order (0 is oldest)
      possibleAnswers: nextPool,
      status: a === 4 ? 'won' : 'playing',
    }));

    setInput('');
  };

  const handleDigitClick = (digit: string) => {
    if (input.length < 4 && !input.includes(digit)) {
      setInput(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  // Derived state for display
  const reversedGuesses = [...gameState.guesses].reverse(); // Show latest first
  const remainingCount = gameState.possibleAnswers.length;

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto relative text-slate-100 overflow-hidden font-sans">
      <CyberBackground />
      
      {/* Header */}
      <header className="flex-none p-3 pb-2 flex items-center justify-between z-10 bg-gradient-to-b from-slate-900 to-slate-900/0">
        <div className="flex items-center gap-2">
           <GameLogo />
           <div>
             <h1 className="text-xl font-bold tracking-tight text-white leading-none">1A2B</h1>
             <p className="text-[10px] text-cyan-400 font-mono tracking-widest opacity-80">DECODER</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
              onClick={toggleDifficulty}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5
                ${difficulty === 'easy' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700 hover:bg-emerald-800' : ''}
                ${difficulty === 'smart' ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700 hover:bg-cyan-800' : ''}
                ${difficulty === 'hard' ? 'bg-red-900/50 text-red-300 border-red-700 hover:bg-red-800' : ''}
              `}
            >
              {difficulty === 'easy' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_currentColor]"></span>}
              {difficulty === 'smart' && <BrainIcon />}
              {difficulty === 'hard' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_5px_currentColor]"></span>}
              
              {difficulty === 'easy' && "簡單"}
              {difficulty === 'smart' && "智慧"}
              {difficulty === 'hard' && "困難"}
            </button>
            <button 
              onClick={handleRestart}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="重新開始"
            >
              <RefreshIcon />
            </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 pb-2 z-10 custom-scrollbar flex flex-col" ref={scrollRef}>
        
        {gameState.status === 'won' ? (
           // --- WIN STATE ---
           <div className="flex-1 flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="mt-4 mb-2 text-center">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                      YOU WIN!
                  </h2>
                  <p className="text-slate-400 text-sm font-mono mt-1">
                      共猜測 <span className="text-white font-bold text-lg">{gameState.guesses.length}</span> 次
                  </p>
              </div>
              
              {/* Review Timeline */}
              <div className="w-full flex-1 bg-slate-900/50 rounded-xl border border-slate-700/50 p-3 mb-4 flex flex-col overflow-hidden relative backdrop-blur-sm">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <HistoryIcon />
                    解題推導回顧
                  </div>
                  <GameReviewList guesses={gameState.guesses} />
              </div>
           </div>
        ) : (
          // --- PLAYING STATE ---
          <div className="flex flex-col gap-2 min-h-min pb-20">
            {/* Rules (Auto-collapsible, only show if no guesses) */}
            {gameState.guesses.length === 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <GameRules />
                </div>
            )}
            
            {/* Analysis Panel (Stats) */}
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50 backdrop-blur-sm">
                 <GameStats remainingCount={remainingCount} totalCombinations={5040} />
                 
                 {/* Only show positional analysis when meaningful and low count */}
                 {remainingCount < 50 && remainingCount > 0 && (
                     <div className="mt-2 pt-2 border-t border-slate-700/50 animate-in fade-in">
                        <PositionalAnalysis possibleAnswers={gameState.possibleAnswers} />
                     </div>
                 )}
            </div>

            {/* History List */}
            <GameHistory guesses={reversedGuesses} totalGuesses={gameState.guesses.length} />
          </div>
        )}
      </main>

      {/* Footer / Input Area */}
      <footer className="flex-none p-4 pt-1 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-20 pb-safe">
        {gameState.status === 'won' ? (
           <button 
             onClick={handleRestart}
             className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(8,145,178,0.4)] text-lg tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <RefreshIcon />
             再來一局
           </button>
        ) : (
            <div className="flex flex-col gap-1 max-w-md mx-auto w-full">
              {/* Input Display */}
              <div className="flex justify-center gap-3 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`
                      w-10 h-12 rounded-xl flex items-center justify-center text-2xl font-mono font-bold
                      bg-slate-800 border-2 transition-all duration-150
                      ${input[i] 
                        ? 'border-cyan-500/50 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)] scale-105' 
                        : 'border-slate-700 text-slate-600'
                      }
                    `}
                  >
                    {input[i] || ''}
                  </div>
                ))}
              </div>

              {/* Number Pad */}
              <NumberPad 
                onDigitClick={handleDigitClick}
                onDelete={handleDelete}
                onSubmit={handleGuess}
                disabled={gameState.status !== 'playing'}
                currentLength={input.length}
                // --- Hint Logic ---
                // Impossible/Confirmed passed if Smart OR (Easy & Unlocked)
                impossibleDigits={showMemoryHints ? impossibleDigits : []}
                confirmedPositions={showMemoryHints ? confirmedPositions : {}}
                // Probabilities passed ONLY if Easy & Unlocked
                digitProbabilities={showPredictionHints ? digitProbabilities : {}}
                compact={true}
              />
            </div>
        )}
      </footer>
    </div>
  );
}
