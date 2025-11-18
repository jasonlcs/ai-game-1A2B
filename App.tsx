
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateAllCombinations, generateSecret, calculateAB, filterPossibilities, getImpossibleDigits, getConfirmedPositions } from './utils/gameEngine';
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

const App: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>('');
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

  // Auto-scroll history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    <div className="space-y-2">
      {gameState.guesses.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-lg font-bold">?</div>
          <p className="text-sm">尚未開始猜測</p>
        </div>
      ) : (
        gameState.guesses.map((g, idx) => (
          <div key={idx} className={`flex items-center justify-between bg-slate-700/30 rounded-lg border border-slate-700/50 ${compact ? 'p-2' : 'p-3'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 w-5 text-right">#{idx + 1}</span>
              <span className={`font-mono font-bold text-white tracking-widest ${compact ? 'text-lg' : 'text-xl'}`}>{g.guess}</span>
            </div>
            <div className={`px-2 py-0.5 rounded-md font-bold font-mono text-sm
              ${g.a === 4 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                g.a > 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                'bg-slate-600 text-slate-300'}`}>
              {g.a}A {g.b}B
            </div>
          </div>
        ))
      )}
      {/* Spacer for scrolling visibility */}
      <div className="h-2"></div>
    </div>
  );

  const AnalysisPanel = () => (
    <div className="space-y-6">
      {/* Stats */}
      <GameStats 
        remainingCount={gameState.possibleAnswers.length} 
        totalCombinations={5040} 
      />

      {/* Possible Answers */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-3 bg-slate-900/50 border-b border-slate-700">
          <h2 className="font-bold text-slate-200 text-sm">可能的答案</h2>
          <p className="text-[10px] text-slate-400 mt-1">
            剩餘少於 50 個時顯示
          </p>
        </div>
        
        <div className="p-3 max-h-60 overflow-y-auto">
          {gameState.possibleAnswers.length < 50 ? (
            <div className="grid grid-cols-4 gap-2">
              {gameState.possibleAnswers.map((num) => (
                <div 
                  key={num} 
                  className="text-center py-1 rounded bg-cyan-900/30 text-cyan-300 font-mono text-xs border border-cyan-800/30"
                >
                  {num}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 text-center py-4">
              <div className="text-2xl font-bold text-slate-700 mb-1">{gameState.possibleAnswers.length}</div>
              <p className="text-xs">可能性太多</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main Layout ---

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-white font-sans">
      
      {/* ================= MOBILE LAYOUT (< 1024px) ================= */}
      <div className="lg:hidden h-[100dvh] flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <header className="flex-none flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700 z-20">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500 w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
              1A
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">猜數字大師</h1>
          </div>
          <button
            onClick={startNewGame}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs font-medium transition-colors"
          >
            <RefreshIcon />
            <span>重置</span>
          </button>
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
            
            {/* Possible Answers (Only when low count) */}
            {gameState.possibleAnswers.length < 20 && gameState.possibleAnswers.length > 0 && (
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-2">
                 <p className="text-[10px] text-emerald-400 mb-1 text-center">可能的答案</p>
                 <div className="flex flex-wrap justify-center gap-1">
                    {gameState.possibleAnswers.map(a => (
                      <span key={a} className="text-xs font-mono bg-emerald-900/30 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-800/50">{a}</span>
                    ))}
                 </div>
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
                impossibleDigits={impossibleDigits}
                confirmedPositions={confirmedPositions}
                compact={true}
              />
            </>
          )}
        </div>
      </div>

      {/* ================= DESKTOP LAYOUT (>= 1024px) ================= */}
      <div className="hidden lg:flex flex-col items-center p-8 max-w-6xl mx-auto min-h-screen">
        
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
              1A
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">1A2B 猜數字大師</h1>
          </div>
          <button
            onClick={startNewGame}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm font-medium transition-colors"
          >
            <RefreshIcon />
            <span>新遊戲</span>
          </button>
        </header>

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
                  impossibleDigits={impossibleDigits}
                  confirmedPositions={confirmedPositions}
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

          {/* Right Column: Stats (AI Removed) */}
          <div className="col-span-1 flex flex-col gap-6 sticky top-8">
            <AnalysisPanel />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default App;
