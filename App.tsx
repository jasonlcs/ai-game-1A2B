
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateAllCombinations, generateSecret, calculateAB, filterPossibilities, getImpossibleDigits, getConfirmedPositions, getPositionalPossibilities, getDigitProbabilities, generateGameReview, ReviewStep } from './utils/gameEngine';
import { GuessResult, GameState } from './types';
import NumberPad from './components/NumberPad';

// Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

// --- Custom Logo Component ---
const GameLogo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center">
    <div className="absolute inset-0 border border-amber-500/30 rounded-full bg-neutral-900/50"></div>
    <div className="absolute inset-1 border border-amber-500/60 rounded-full rotate-45"></div>
    <div className="text-[10px] font-serif font-bold text-amber-100 tracking-tighter relative z-10">1A</div>
  </div>
);

// --- Luxury Background Component (Brightened) ---
const LuxuryBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-neutral-900">
    {/* Radial Gradient Base - Lighter Center */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(30,41,59,1)_0%,_rgba(10,10,10,1)_100%)]"></div>
    
    {/* Golden Glow Top - Stronger */}
    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full"></div>

    {/* Abstract Waves/Mesh - Higher Opacity */}
    <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
      <defs>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#d97706" /> {/* Amber 600 */}
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M0,100 Q 250,200 500,100 T 1000,100" fill="none" stroke="url(#goldLine)" strokeWidth="0.8" />
      <path d="M0,300 Q 250,400 500,300 T 1000,300" fill="none" stroke="url(#goldLine)" strokeWidth="0.8" opacity="0.6" />
      <path d="M0,500 Q 250,600 500,500 T 1000,500" fill="none" stroke="url(#goldLine)" strokeWidth="0.8" opacity="0.4" />
    </svg>
    
    {/* Noise Texture */}
    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
  </div>
);


// --- Sub-component for Game Rules ---
const GameRules = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-neutral-800/80 border border-white/10 backdrop-blur-xl rounded-xl overflow-hidden transition-all z-10 relative shadow-lg ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-neutral-300 hover:bg-white/5 hover:text-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
          <InfoIcon />
          <span>遊戲規則說明</span>
        </div>
        <ChevronDownIcon className={`transform transition-transform duration-200 text-amber-500/70 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0 text-xs md:text-sm text-neutral-300 border-t border-white/10 bg-black/20">
          <div className="space-y-4 mt-3">
            <div>
              <h3 className="text-amber-100 font-serif font-bold mb-1 tracking-wide">遊戲目標</h3>
              <p>猜出系統產生的一組 <span className="text-amber-400 font-mono">4</span> 位不重複數字。</p>
            </div>
            
            {/* Visual Diagram */}
            <div className="my-2 p-3 bg-neutral-900/60 rounded-lg border border-white/5 flex justify-center shadow-inner">
              <svg viewBox="0 0 300 130" className="w-full max-w-[280px] h-auto font-mono select-none">
                <defs>
                  <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6" fill="#10b981" />
                  </marker>
                  <marker id="arrow-yellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* Secret Row */}
                <text x="0" y="25" fill="#a3a3a3" fontSize="12" fontWeight="bold">謎底</text>
                <g transform="translate(60, 5)">
                  <rect x="0" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="15" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">5</text>
                  <rect x="40" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="55" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">6</text>
                  <rect x="80" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="95" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">7</text>
                  <rect x="120" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="135" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">8</text>
                </g>

                {/* Guess Row */}
                <text x="0" y="105" fill="#a3a3a3" fontSize="12" fontWeight="bold">猜測</text>
                <g transform="translate(60, 85)">
                  <rect x="0" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="15" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">5</text>
                  <rect x="40" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="55" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">7</text>
                  <rect x="80" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="95" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">2</text>
                  <rect x="120" y="0" width="30" height="30" rx="4" fill="#262626" stroke="#404040" />
                  <text x="135" y="20" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontWeight="bold">1</text>
                </g>

                {/* Connections */}
                <path d="M75,35 L75,85" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-green)" strokeDasharray="3"/>
                <circle cx="75" cy="60" r="8" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                <text x="75" y="63" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">A</text>

                <path d="M155,35 L115,85" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow-yellow)" strokeDasharray="3"/>
                <circle cx="135" cy="60" r="8" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
                <text x="135" y="63" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">B</text>

                <text x="210" y="55" fill="#34d399" fontSize="10" fontWeight="bold">位置正確</text>
                <text x="210" y="75" fill="#fbbf24" fontSize="10" fontWeight="bold">數字對但位置錯</text>
              </svg>
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
    <div className="flex gap-1.5 h-full items-center">
      {positionalData.map((digits, idx) => {
        const isMasked = digits.length > 3;
        
        return (
          <div key={idx} className="bg-neutral-900/40 border border-white/5 rounded-md min-w-[34px] h-9 flex items-center justify-center px-1 shadow-inner">
            <div className="flex items-center justify-center gap-0.5">
              {isMasked ? (
                 <span className="text-neutral-500 text-sm font-mono">*</span>
              ) : (
                digits.map((digit) => (
                    <div 
                      key={digit} 
                      className="w-4 h-5 flex items-center justify-center rounded-[3px] bg-amber-950/60 border border-amber-500/40 text-xs font-bold text-amber-50 shadow-[0_0_5px_rgba(245,158,11,0.2)]"
                    >
                      {digit}
                    </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Sub-component for Game History List ---
const GameHistory = ({ guesses, totalGuesses }: { guesses: GuessResult[], totalGuesses: number }) => {
  if (guesses.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {guesses.map((result, idx) => {
        // Since guesses are reversed, the first one (index 0) is the latest
        const isLatest = idx === 0;
        const realIndex = totalGuesses - idx; // Calculate original index (1-based)
        
        return (
          <div 
            key={`${result.guess}-${idx}`}
            className={`
              flex items-center justify-between px-3 py-2 rounded-lg border transition-all
              ${isLatest 
                ? 'bg-neutral-800/90 border-amber-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md col-span-2 relative overflow-hidden group' 
                : 'bg-neutral-800/60 border-white/10 text-neutral-400 col-span-1 hover:bg-neutral-800/80'
              }
            `}
          >
            {isLatest && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
            
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isLatest ? 'bg-amber-950/80 text-amber-200 border-amber-900' : 'bg-neutral-900/50 text-neutral-500 border-white/5'}`}>
                {realIndex.toString().padStart(2, '0')}
              </span>
              <span className={`font-mono font-bold tracking-[0.2em] ${isLatest ? 'text-xl text-white' : 'text-sm text-neutral-200'}`}>
                {result.guess}
              </span>
            </div>
            
            <div className={`font-mono font-bold flex gap-1 ${isLatest ? 'text-lg' : 'text-sm'}`}>
              <span className={result.a === 4 ? "text-emerald-400" : isLatest ? "text-emerald-400" : "text-neutral-400"}>{result.a}A</span>
              <span className={result.b > 0 ? "text-amber-400" : isLatest ? "text-amber-400" : "text-neutral-500"}>{result.b}B</span>
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
    <div className="w-full flex-1 overflow-y-auto px-1 pr-2 space-y-4 custom-scrollbar">
      {steps.map((step) => (
        <div key={step.stepIndex} className="relative pl-5 border-l border-neutral-700 last:border-amber-500/50">
          {/* Timeline Dot */}
          <div className={`absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full border-2 border-neutral-800 ${step.stepIndex === steps.length ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-neutral-600'}`}></div>
          
          <div className="bg-neutral-800/80 rounded-lg p-3 border border-white/10 shadow-sm backdrop-blur-md">
             <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-neutral-400 font-mono tracking-widest">STEP {step.stepIndex}</span>
                    <span className="font-mono font-bold text-white text-lg tracking-[0.2em]">{step.guess}</span>
                </div>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${step.guess === steps[steps.length-1].guess && step.result === '4A0B' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' : 'bg-neutral-900 text-neutral-400 border border-neutral-700'}`}>
                    {step.result}
                </span>
             </div>
             
             {/* Text Analysis */}
             <div className="flex flex-col gap-1">
                 <span className="text-xs text-amber-200/90 font-bold font-serif">{step.comment}</span>
                 <span className="text-[10px] text-neutral-300 leading-relaxed">{step.insight}</span>
             </div>

             {/* Progress Bar for Reduction */}
             <div className="mt-2 flex items-center gap-2 opacity-90">
                 <div className="flex-1 h-0.5 bg-neutral-700 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{width: `${step.reductionPercent}%`}}></div>
                 </div>
                 <span className="text-[9px] text-emerald-500 font-mono">-{Math.round(step.reductionPercent)}%</span>
             </div>
          </div>
        </div>
      ))}
      
      {/* End Badge */}
      <div className="flex justify-center mt-6 mb-4">
          <div className="bg-amber-950/30 text-amber-200 border border-amber-500/20 px-6 py-2 rounded-full text-xs font-serif font-bold tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              MISSION ACCOMPLISHED
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
  const [difficulty, setDifficulty] = useState<Difficulty>('smart');

  // Calculation Hooks
  const impossibleDigits = useMemo(() => getImpossibleDigits(gameState.possibleAnswers), [gameState.possibleAnswers]);
  const confirmedPositions = useMemo(() => getConfirmedPositions(gameState.possibleAnswers), [gameState.possibleAnswers]);
  const digitProbabilities = useMemo(() => getDigitProbabilities(gameState.possibleAnswers), [gameState.possibleAnswers]);
  
  const isHintLocked = difficulty === 'easy' && gameState.guesses.length < 3;
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

  const handleGuess = () => {
    if (input.length !== 4) return;

    const { a, b } = calculateAB(gameState.secret, input);
    const nextPool = filterPossibilities(gameState.possibleAnswers, input, a, b);
    const newGuess: GuessResult = { guess: input, a, b };

    setGameState(prev => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
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
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto relative text-neutral-100 overflow-hidden font-sans bg-black">
      <LuxuryBackground />
      
      {/* Header */}
      <header className="flex-none p-4 pb-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
           <GameLogo />
           <div className="flex flex-col justify-center">
             <h1 className="text-xl font-serif font-bold tracking-wider text-amber-50 leading-none drop-shadow-md">1A2B</h1>
             <p className="text-[9px] text-amber-400/90 font-mono tracking-[0.3em] uppercase mt-1">Mastermind</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
            {/* Segmented Control for Difficulty */}
            <div className="flex bg-neutral-800/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg">
               <button 
                 onClick={() => setDifficulty('easy')}
                 className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all tracking-wider ${difficulty === 'easy' ? 'bg-amber-600/90 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}
               >
                 簡單
               </button>
               <button 
                 onClick={() => setDifficulty('smart')}
                 className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all tracking-wider flex items-center gap-1.5 ${difficulty === 'smart' ? 'bg-indigo-600/90 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}
               >
                 <BrainIcon />
                 智慧
               </button>
               <button 
                 onClick={() => setDifficulty('hard')}
                 className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all tracking-wider ${difficulty === 'hard' ? 'bg-neutral-600/90 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}
               >
                 困難
               </button>
            </div>
            
            <button 
              onClick={handleRestart}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-amber-200 border border-white/10 transition-colors shadow-sm"
              title="重新開始"
            >
              <RefreshIcon />
            </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto px-5 pb-2 z-10 custom-scrollbar flex flex-col" ref={scrollRef}>
        
        {gameState.status === 'won' ? (
           // --- WIN STATE ---
           <div className="flex-1 flex flex-col items-center animate-in zoom-in-95 duration-700 ease-out">
              <div className="mt-6 mb-4 text-center relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
                  <h2 className="relative text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] tracking-widest">
                      VICTORY
                  </h2>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-2"></div>
                  <p className="text-neutral-400 text-xs font-mono tracking-widest uppercase relative z-10">
                      Attempts: <span className="text-amber-100 font-bold text-lg">{gameState.guesses.length}</span>
                  </p>
              </div>
              
              {/* Review Timeline */}
              <div className="w-full flex-1 bg-neutral-900/60 rounded-2xl border border-white/10 p-1 mb-4 flex flex-col overflow-hidden relative backdrop-blur-xl shadow-2xl">
                  <div className="px-4 py-3 text-xs text-neutral-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5">
                    <HistoryIcon />
                    Analysis Log
                  </div>
                  <div className="flex-1 overflow-hidden p-2">
                     <GameReviewList guesses={gameState.guesses} />
                  </div>
              </div>
           </div>
        ) : (
          // --- PLAYING STATE ---
          <div className="flex flex-col gap-3 min-h-min pb-24">
            {/* Rules */}
            {gameState.guesses.length === 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <GameRules />
                </div>
            )}
            
            {/* Analysis Panel (Stats) - COMPACT ROW LAYOUT */}
            <div className="bg-neutral-800/80 rounded-xl p-3 border border-white/10 backdrop-blur-md shadow-lg flex items-center justify-between relative overflow-hidden h-14">
                 
                 {/* Progress Bar Background (Bottom Line) */}
                 <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-600 via-amber-400 to-transparent transition-all duration-700" style={{ width: `${(100 - (remainingCount / 5040) * 100)}%` }}></div>
                 
                 {/* Stats */}
                 <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest">剩餘</span>
                        <span className="text-lg font-bold text-amber-100 font-mono leading-none">{remainingCount}</span>
                     </div>
                     <div className="w-px h-5 bg-white/5"></div>
                     <div className="flex flex-col">
                        <span className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest">排除</span>
                        <span className="text-xs font-bold text-neutral-400 font-mono leading-none">{(100 - (remainingCount / 5040) * 100).toFixed(1)}%</span>
                     </div>
                 </div>
                 
                 {/* Positional Analysis */}
                 {remainingCount < 50 && remainingCount > 0 && (
                     <div className="animate-in fade-in slide-in-from-right-4">
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
      <footer className="flex-none p-4 pt-2 bg-neutral-950/90 backdrop-blur-xl border-t border-white/10 z-20 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {gameState.status === 'won' ? (
           <button 
             onClick={handleRestart}
             className="w-full py-4 bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 text-amber-100 font-serif font-bold rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] text-lg tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase group"
           >
             <RefreshIcon />
             Play Again
           </button>
        ) : (
            <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
              {/* Input Display */}
              <div className="flex justify-center gap-3 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`
                      w-10 h-12 rounded-lg flex items-center justify-center text-2xl font-mono font-bold
                      bg-neutral-800/80 border transition-all duration-300 backdrop-blur-sm
                      ${input[i] 
                        ? 'border-amber-500/50 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-110' 
                        : 'border-white/10 text-white'
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
                impossibleDigits={showMemoryHints ? impossibleDigits : []}
                confirmedPositions={showMemoryHints ? confirmedPositions : {}}
                digitProbabilities={showPredictionHints ? digitProbabilities : {}}
                compact={true}
              />
            </div>
        )}
      </footer>
    </div>
  );
}
