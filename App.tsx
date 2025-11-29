
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
      {/* Decorative circles */}
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
    <div className="space-y-2">
       <div className="grid grid-cols-4 gap-1.5">
         {positionalData.map((digits, idx) => (
           <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded p-1.5 text-center flex flex-col h-full">
             <div className="text-[9px] text-slate-500 mb-0.5 font-bold border-b border-slate-800 pb-0.5">第 {idx + 1} 位</div>
             <div className="flex-1 flex items-center justify-center">
                <div className="text-cyan-300 font-mono text-xs font-bold leading-snug break-all">
                  {digits.join(' ')}
                </div>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

// --- Reusable Game Review List Component ---
const GameReviewList = ({ guesses }: { guesses: GuessResult[] }) => {
  const [reviewData, setReviewData] = useState<ReviewStep[]>([]);

  useEffect(() => {
    const data = generateGameReview(guesses);
    setReviewData(data);
  }, [guesses]);

  return (
    <div className="space-y-3 pb-8">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 px-1 justify-center">
             <BrainIcon />
             <h3 className="font-bold text-sm uppercase tracking-wider">推導過程回顧</h3>
        </div>
       {reviewData.map((step) => (
         <div key={step.stepIndex} className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2 relative z-10">
               <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-mono border border-slate-600">
                    {step.stepIndex}
                  </span>
                  <span className="font-mono text-lg font-bold text-white tracking-wider">
                    {step.guess}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    step.result === '4A0B' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {step.result}
                  </span>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-cyan-300 block bg-cyan-900/30 px-2 py-0.5 rounded-full border border-cyan-800/30">
                    {step.comment}
                  </span>
               </div>
            </div>

            {/* Insight Text - Enhanced */}
            <div className="relative z-10 bg-slate-800/50 rounded p-2 mb-2 text-xs text-slate-300 leading-relaxed border border-white/5">
               {step.insight}
            </div>

            <div className="relative z-10 flex justify-between items-end text-[10px] text-slate-400 opacity-80 mt-1">
               <div className="font-mono">
                 剩餘: <span className="text-white font-bold">{step.candidatesAfter}</span>
               </div>
               <div className="font-bold">
                 <span className={`${step.reductionPercent > 50 ? 'text-emerald-400' : 'text-slate-400'}`}>
                   -{step.reductionPercent.toFixed(1)}%
                 </span>
               </div>
            </div>
            
            {/* Visual Bar at bottom */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-slate-700/30 w-full mt-2">
               <div 
                 className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" 
                 style={{ width: `${step.reductionPercent}%` }}
               ></div>
            </div>
         </div>
       ))}
    </div>
  );
};


const App: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [gameState, setGameState] = useState<GameState>({
    secret: '',
    guesses: [],
    possibleAnswers: [],
    status: 'playing',
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize game
  const startNewGame = () => {
    const newSecret = generateSecret();
    setGameState({
      secret: newSecret,
      guesses: [],
      possibleAnswers: generateAllCombinations(),
      status: 'playing',
    });
    setCurrentInput('');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Auto-scroll history to TOP (since we reverse order)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameState.guesses, gameState.status]);

  // Logic: Hints only show in Easy Mode AFTER 3 guesses have been made (guesses.length >= 3)
  const showHints = difficulty === 'easy' && gameState.guesses.length >= 3;

  // Calculate impossible digits
  const impossibleDigits = useMemo(() => {
    return getImpossibleDigits(gameState.possibleAnswers);
  }, [gameState.possibleAnswers]);

  // Calculate confirmed positions
  const confirmedPositions = useMemo(() => {
    return getConfirmedPositions(gameState.possibleAnswers);
  }, [gameState.possibleAnswers]);

  // Calculate digit probabilities
  const digitProbabilities = useMemo(() => {
    return getDigitProbabilities(gameState.possibleAnswers);
  }, [gameState.possibleAnswers]);

  const handleDigitClick = (digit: string) => {
    if (currentInput.length < 4 && !currentInput.includes(digit)) {
      setCurrentInput((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleSubmitGuess = () => {
    if (currentInput.length !== 4) return;

    const { a, b } = calculateAB(gameState.secret, currentInput);
    const newPossibilities = filterPossibilities(
      gameState.possibleAnswers,
      currentInput,
      a,
      b
    );
    const newGuessResult: GuessResult = { guess: currentInput, a, b };
    const newStatus = a === 4 ? 'won' : 'playing';

    setGameState((prev) => ({
      ...prev,
      guesses: [...prev.guesses, newGuessResult],
      possibleAnswers: newPossibilities,
      status: newStatus,
    }));

    setCurrentInput('');
  };

  const toggleDifficulty = () => {
    setDifficulty(prev => prev === 'easy' ? 'hard' : 'easy');
  };

  // --- Render Helpers ---

  const InputDisplay = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex justify-center gap-1.5 ${compact ? 'mb-1' : 'mb-2'}`}>
      {[0, 1, 2, 3].map((idx) => (
        <div 
          key={idx}
          className={`flex items-center justify-center font-mono rounded-full border-2 transition-all z-10
            ${compact ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-3xl'}
            ${currentInput[idx] 
              ? 'border-cyan-500 bg-cyan-900/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
              : 'border-slate-600 bg-slate-900/50 text-slate-500'}`}
        >
          {currentInput[idx] || ''}
        </div>
      ))}
    </div>
  );

  const GameHistory = ({ compact = false }: { compact?: boolean }) => {
    const reversedGuesses = [...gameState.guesses].reverse();
    return (
      <div className={gameState.guesses.length === 0 ? "" : "grid grid-cols-2 gap-2 content-start relative z-10"}>
        {gameState.guesses.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-600">
            <HistoryIcon />
            <p className="mt-2 text-sm">尚未有猜測紀錄</p>
          </div>
        ) : (
          reversedGuesses.map((g, index) => {
            // "Latest" is the first element because we reversed the array
            const isLatest = index === 0;
            return (
              <div 
                key={index} 
                className={`
                  flex items-center justify-between p-2 rounded-lg border font-mono animate-in fade-in slide-in-from-top-4 duration-300 fill-mode-backwards
                  ${compact ? 'text-sm' : 'text-base'}
                  ${isLatest 
                    ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isLatest ? 'bg-cyan-800 text-cyan-200' : 'bg-slate-700 text-slate-500'}`}>
                     {gameState.guesses.length - index}
                  </span>
                  <span className={`${isLatest ? 'text-cyan-100 font-bold' : ''}`}>{g.guess}</span>
                </div>
                <div className={`font-bold tracking-widest px-2 py-0.5 rounded ${
                  g.a === 4 
                    ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,199,89,0.5)]' 
                    : isLatest
                      ? 'bg-slate-900/50 text-cyan-300'
                      : 'bg-slate-900/30 text-slate-300'
                }`}>
                  {g.a}A{g.b}B
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const AnalysisPanel = ({ isMobile = false }) => (
    <div className={`space-y-3 ${isMobile ? 'text-sm' : ''} relative z-10`}>
      {/* Clean Stats */}
      <GameStats 
        remainingCount={gameState.possibleAnswers.length} 
        totalCombinations={5040} 
      />

      {/* Hints (Positional ONLY) - Simplified Logic: Show if unlocked AND useful (<=50) */}
      {showHints && gameState.possibleAnswers.length <= 50 && (
          <div className="animate-in fade-in duration-500 pt-1">
             <PositionalAnalysis possibleAnswers={gameState.possibleAnswers} />
          </div>
      )}
    </div>
  );

  const WinHeader = () => (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-4 text-center animate-in zoom-in duration-300 backdrop-blur-sm mb-4">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-xl font-bold text-green-400">破解成功！</h2>
        <p className="text-slate-300">謎底是 <span className="text-white font-mono text-lg font-bold mx-1">{gameState.secret}</span></p>
        <p className="text-xs text-slate-400">總共猜了 <span className="text-white font-bold">{gameState.guesses.length}</span> 次</p>
      </div>
  );

  // --- Mobile Layout ---
  const MobileLayout = () => (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-slate-100 overflow-hidden relative">
      <CyberBackground />
      {/* Header */}
      <header className="flex-none p-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <GameLogo />
          <h1 className="font-bold text-lg tracking-wider text-cyan-50">1A2B</h1>
        </div>
        <button 
          onClick={toggleDifficulty}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
            difficulty === 'easy' 
              ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700' 
              : 'bg-red-900/50 text-red-300 border-red-700'
          }`}
        >
          {difficulty === 'easy' ? '簡單' : '困難'}
        </button>
      </header>

      {gameState.status === 'won' ? (
        // --- Win State Layout (Mobile) ---
        <div className="flex-1 overflow-y-auto p-4 flex flex-col z-10">
          <WinHeader />
          <GameReviewList guesses={gameState.guesses} />
          
          <div className="mt-auto pt-4 sticky bottom-0 bg-slate-900/90 p-4 border-t border-slate-800 -mx-4">
            <button
              onClick={startNewGame}
              className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all active:scale-95"
            >
              再來一局
            </button>
          </div>
        </div>
      ) : (
        // --- Playing State Layout (Mobile) ---
        <>
          <div className="flex-none bg-slate-900/80 z-20 px-4 py-2 border-b border-slate-800">
             <AnalysisPanel isMobile />
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 scroll-smooth z-10"
          >
             {gameState.guesses.length === 0 && (
                <GameRules className="mb-4" />
             )}
             <GameHistory compact />
          </div>

          <div className="flex-none bg-slate-900/95 border-t border-slate-800 p-3 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
             <InputDisplay compact />
             <NumberPad 
               onDigitClick={handleDigitClick}
               onDelete={handleDelete}
               onSubmit={handleSubmitGuess}
               disabled={gameState.status !== 'playing'}
               currentLength={currentInput.length}
               impossibleDigits={showHints ? impossibleDigits : []}
               confirmedPositions={showHints ? confirmedPositions : {}}
               digitProbabilities={showHints ? digitProbabilities : {}}
               compact
             />
          </div>
        </>
      )}
    </div>
  );

  // --- Desktop Layout ---
  const DesktopLayout = () => (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-8 relative">
      <CyberBackground />
      <div className="w-full max-w-5xl grid grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Game Area */}
        <div className="col-span-7 bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col min-h-[600px]">
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <GameLogo />
              <h1 className="text-3xl font-bold tracking-wider text-white">1A2B <span className="text-cyan-400">Master</span></h1>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleDifficulty}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                  difficulty === 'easy' 
                    ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700 hover:bg-cyan-800' 
                    : 'bg-red-900/50 text-red-300 border-red-700 hover:bg-red-800'
                }`}
              >
                {difficulty === 'easy' ? '簡單模式' : '困難模式'}
              </button>
              <button 
                onClick={startNewGame}
                className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="重新開始"
              >
                <RefreshIcon />
              </button>
            </div>
          </header>

          {gameState.status === 'won' ? (
            <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300">
               <WinHeader />
               <div className="w-full max-w-md h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <GameReviewList guesses={gameState.guesses} />
               </div>
               <button
                  onClick={startNewGame}
                  className="mt-6 px-12 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xl shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all active:scale-95"
                >
                  再來一局
                </button>
            </div>
          ) : (
            <>
              {gameState.guesses.length === 0 && <GameRules className="mb-6" />}
              
              <div className="flex-1 bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-700/50 overflow-y-auto max-h-[400px]">
                <GameHistory />
              </div>

              <div className="mt-auto">
                <InputDisplay />
                <NumberPad 
                  onDigitClick={handleDigitClick}
                  onDelete={handleDelete}
                  onSubmit={handleSubmitGuess}
                  disabled={gameState.status !== 'playing'}
                  currentLength={currentInput.length}
                  impossibleDigits={showHints ? impossibleDigits : []}
                  confirmedPositions={showHints ? confirmedPositions : {}}
                  digitProbabilities={showHints ? digitProbabilities : {}}
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column: Analysis Panel (Only visible in playing mode) */}
        <div className="col-span-5 space-y-6">
           {gameState.status === 'playing' ? (
             <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700 shadow-xl sticky top-8">
               <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                 <BrainIcon /> 戰況分析
               </h2>
               <AnalysisPanel />
             </div>
           ) : (
             // Decorative placeholder for win state
             <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 h-full flex items-center justify-center text-slate-600">
                <div className="text-center opacity-50">
                   <GameLogo />
                   <p className="mt-4 text-sm font-mono">SYSTEM DECRYPTED</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <MobileLayout />
      </div>
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </>
  );
};

export default App;
