
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateAllCombinations, generateSecret, calculateAB, filterPossibilities, getImpossibleDigits, getConfirmedPositions, getPositionalPossibilities } from './utils/gameEngine';
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

// --- Sub-component for Game Rules ---
const GameRules = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden transition-all ${className}`}>
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
            <div>
              <h3 className="text-slate-200 font-bold mb-1">🔍 提示說明</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="bg-green-900/40 text-green-400 font-bold px-1.5 rounded text-xs font-mono">A</span>
                  <span><strong className="text-slate-300">位置正確</strong>：數字對了，位置也對了。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-yellow-900/40 text-yellow-400 font-bold px-1.5 rounded text-xs font-mono">B</span>
                  <span><strong className="text-slate-300">位置錯誤</strong>：數字對了，但位置不對。</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
              <p className="font-bold text-slate-300 mb-1">💡 舉例：</p>
              <p>正確答案是 <span className="font-mono text-white">5678</span></p>
              <p>你猜 <span className="font-mono text-white">5721</span> → 得到 <span className="font-mono text-green-400">1A</span><span className="font-mono text-yellow-400">1B</span></p>
              <ul className="ml-4 mt-1 list-disc list-outside opacity-80">
                <li><span className="font-mono">5</span> 位置對了 (1A)</li>
                <li><span className="font-mono">7</span> 有這個數但位置錯了 (1B)</li>
              </ul>
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
       <p className="text-[10px] text-slate-400 mb-1 text-center">各位數可能的數字</p>
       <div className="grid grid-cols-4 gap-1.5">
         {positionalData.map((digits, idx) => (
           <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded p-2 text-center flex flex-col h-full">
             <div className="text-[10px] text-slate-500 mb-1 font-bold border-b border-slate-800 pb-1">第 {idx + 1} 位</div>
             <div className="flex-1 flex items-center justify-center">
                <div className="text-cyan-300 font-mono text-sm font-bold leading-snug break-all">
                  {digits.join(' ')}
                </div>
             </div>
           </div>
         ))}
       </div>
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
  }, [gameState.guesses]);

  // Calculate impossible digits
  const impossibleDigits = useMemo(() => {
    return getImpossibleDigits(gameState.possibleAnswers);
  }, [gameState.possibleAnswers]);

  // Calculate confirmed positions
  const confirmedPositions = useMemo(() => {
    return getConfirmedPositions(gameState.possibleAnswers);
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
          className={`flex items-center justify-center font-mono rounded-full border-2 transition-all
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

  const GameHistory = ({ compact = false }: { compact?: boolean }) => (
    <div className={gameState.guesses.length === 0 ? "" : "grid grid-cols-2 gap-2 content-start"}>
      {gameState.guesses.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-lg font-bold">?</div>
          <p className="text-sm">尚未開始猜測</p>
        </div>
      ) : (
        // REVERSE ORDER: Newest first
        [...gameState.guesses].reverse().map((g, idx) => {
          // Calculate the original index number for display (e.g., #1, #2)
          const realIndex = gameState.guesses.length - idx;
          const isLatest = idx === 0;

          return (
            <div 
              key={idx} 
              className={`
                relative flex items-center justify-between rounded-lg border transition-all duration-300
                ${compact ? 'p-2' : 'p-3'}
                ${isLatest 
                  ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-700/30 border-slate-700/50 opacity-80 hover:opacity-100'}
              `}
            >
              {/* Highlight Badge for Latest */}
              {isLatest && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>
              )}

              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-mono w-4 text-right ${isLatest ? 'text-cyan-300' : 'text-slate-500'}`}>
                  #{realIndex}
                </span>
                <span className={`font-mono font-bold tracking-wider ${isLatest ? 'text-cyan-50' : 'text-slate-200'} ${compact ? 'text-base' : 'text-lg'}`}>
                  {g.guess}
                </span>
              </div>
              
              <div className={`px-1.5 py-0.5 rounded font-bold font-mono text-xs whitespace-nowrap
                ${g.a === 4 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                  g.a > 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                  'bg-slate-600/50 text-slate-400'}`}>
                {g.a}A{g.b}B
              </div>
            </div>
          );
        })
      )}
      {/* Spacer for scrolling visibility */}
      <div className="h-2 col-span-2"></div>
    </div>
  );

  const AnalysisPanel = () => (
    <div className="space-y-6">
      {/* Stats */}
      <GameStats 
        remainingCount={gameState.possibleAnswers.length} 
        totalCombinations={5040} 
      />

      {/* Possible Answers Analysis - Only show in Easy Mode */}
      {difficulty === 'easy' ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-3 bg-slate-900/50 border-b border-slate-700">
            <h2 className="font-bold text-slate-200 text-sm">答案分析</h2>
            <p className="text-[10px] text-slate-400 mt-1">
              {gameState.possibleAnswers.length < 50 ? "詳細位數分析" : "剩餘少於 50 個時顯示詳細資訊"}
            </p>
          </div>
          
          <div className="p-3">
            {gameState.possibleAnswers.length < 50 && gameState.possibleAnswers.length > 0 ? (
               <PositionalAnalysis possibleAnswers={gameState.possibleAnswers} />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 text-center py-4 min-h-[100px]">
                <div className="text-2xl font-bold text-slate-700 mb-1">{gameState.possibleAnswers.length}</div>
                <p className="text-xs">組合過多，尚無詳細分析</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm mb-1">困難模式</p>
          <p className="text-xs text-slate-500">已隱藏答案分析</p>
        </div>
      )}
    </div>
  );

  const DifficultyButton = () => (
    <button 
      onClick={toggleDifficulty}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
        ${difficulty === 'easy' 
          ? 'bg-cyan-900/30 text-cyan-300 border-cyan-600/50 hover:bg-cyan-900/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
          : 'bg-red-900/30 text-red-300 border-red-600/50 hover:bg-red-900/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]'}`}
    >
      <BrainIcon />
      <span>{difficulty === 'easy' ? '簡單' : '困難'}</span>
    </button>
  );

  // --- Main Layout ---

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-white font-sans">
      
      {/* ================= MOBILE LAYOUT (< 1024px) ================= */}
      <div className="lg:hidden h-[100dvh] flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <header className="flex-none flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700 z-20">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs shadow-lg transition-colors ${difficulty === 'easy' ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
              1A
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">猜數字大師</h1>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyButton />
            <button
              onClick={startNewGame}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-200 transition-colors"
            >
              <RefreshIcon />
            </button>
          </div>
        </header>

        {/* Mobile Stats Bar (Fixed below header) */}
        <div className="flex-none bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-3 py-2 flex justify-between items-center text-xs z-10">
           <div className="flex gap-3 w-full justify-center">
             <span className="text-slate-400">剩餘 <span className="text-cyan-400 font-mono text-sm">{gameState.possibleAnswers.length}</span></span>
             <span className="text-slate-300">|</span>
             <span className="text-slate-400">排除 <span className="text-emerald-400 font-mono text-sm">{Math.round((1 - gameState.possibleAnswers.length / 5040) * 100)}%</span></span>
           </div>
        </div>

        {/* Mobile Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-slate-900 scroll-smooth" ref={scrollRef}>
          <div className="p-3 pb-4 space-y-3">
            
            {/* Game Rules (Mobile) - Hidden after first guess */}
            {gameState.guesses.length === 0 && <GameRules />}

            {/* Possible Answers (Easy Mode only) - MOBILE VIEW - ALWAYS VISIBLE AT TOP */}
            {difficulty === 'easy' && gameState.possibleAnswers.length < 50 && gameState.possibleAnswers.length > 0 && (
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-2">
                 <PositionalAnalysis possibleAnswers={gameState.possibleAnswers} />
              </div>
            )}

            <GameHistory compact={true} />
          </div>
        </div>

        {/* Mobile Fixed Bottom Input Area */}
        <div className="flex-none bg-slate-800 border-t border-slate-700 p-2 pb-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-30">
          {gameState.status === 'won' ? (
            <div className="text-center py-3 animate-bounce">
              <h2 className="text-xl font-bold text-green-400 mb-1">你贏了！</h2>
              <p className="text-slate-400 text-xs">答案是 <span className="font-mono text-white font-bold text-base">{gameState.secret}</span></p>
              <button 
                onClick={startNewGame}
                className="mt-2 px-5 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-500 font-bold text-sm shadow-lg shadow-green-600/30"
              >
                再玩一次
              </button>
            </div>
          ) : (
            <>
              <InputDisplay compact={true} />
              <NumberPad
                onDigitClick={handleDigitClick}
                onDelete={handleDelete}
                onSubmit={handleSubmitGuess}
                disabled={gameState.status !== 'playing'}
                currentLength={currentInput.length}
                // Pass filtered hints based on difficulty
                impossibleDigits={difficulty === 'easy' ? impossibleDigits : []}
                confirmedPositions={difficulty === 'easy' ? confirmedPositions : {}}
                compact={true}
              />
            </>
          )}
        </div>
      </div>

      {/* ================= DESKTOP LAYOUT (>= 1024px) ================= */}
      <div className="hidden lg:flex flex-col items-center p-8 max-w-6xl mx-auto min-h-screen">
        
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg transition-colors ${difficulty === 'easy' ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
              1A
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">1A2B 猜數字大師</h1>
          </div>
          <div className="flex items-center gap-4">
            <DifficultyButton />
            <button
              onClick={startNewGame}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm font-medium transition-colors"
            >
              <RefreshIcon />
              <span>新遊戲</span>
            </button>
          </div>
        </header>

        {/* Game Rules (Desktop) - Hidden after first guess */}
        {gameState.guesses.length === 0 && (
          <div className="w-full mb-6">
            <GameRules />
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 w-full items-start">
          
          {/* Left Column: Game Input & Status */}
          <div className="col-span-1 flex flex-col gap-6 sticky top-8">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <div className="text-center mb-4">
                 <p className="text-slate-400 text-sm mb-4">請輸入 4 個不重複數字</p>
                 <InputDisplay />
              </div>

              {gameState.status === 'won' ? (
                <div className="text-center py-8">
                  <h2 className="text-3xl font-bold text-green-400 mb-2">恭喜勝利！</h2>
                  <p className="text-slate-400 mb-6">答案是 <span className="font-mono text-white font-bold text-xl">{gameState.secret}</span></p>
                  <button 
                    onClick={startNewGame}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 font-bold shadow-lg shadow-green-600/20 transition-all transform hover:scale-105"
                  >
                    再玩一次
                  </button>
                </div>
              ) : (
                <NumberPad
                  onDigitClick={handleDigitClick}
                  onDelete={handleDelete}
                  onSubmit={handleSubmitGuess}
                  disabled={gameState.status !== 'playing'}
                  currentLength={currentInput.length}
                  // Pass filtered hints based on difficulty
                  impossibleDigits={difficulty === 'easy' ? impossibleDigits : []}
                  confirmedPositions={difficulty === 'easy' ? confirmedPositions : {}}
                />
              )}
            </div>
          </div>

          {/* Middle Column: History */}
          <div className="col-span-1 flex flex-col gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl min-h-[500px]">
              <h2 className="flex items-center gap-2 font-bold text-slate-300 mb-4 uppercase tracking-wider text-sm">
                <HistoryIcon />
                猜測紀錄
              </h2>
              <GameHistory />
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="col-span-1 flex flex-col gap-6 sticky top-8">
            <AnalysisPanel />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default App;
