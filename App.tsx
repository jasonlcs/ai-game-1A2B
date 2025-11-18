
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateAllCombinations, generateSecret, calculateAB, filterPossibilities, getImpossibleDigits, getConfirmedPositions } from './utils/gameEngine';
import { GuessResult, GameState, LoadingState } from './types';
import { getAIHint } from './services/geminiService';
import NumberPad from './components/NumberPad';
import GameStats from './components/GameStats';

// Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

const App: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>({
    secret: '',
    guesses: [],
    possibleAnswers: [],
    status: 'playing',
  });
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<LoadingState>(LoadingState.IDLE);
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
    setAiHint(null);
    setAiLoading(LoadingState.IDLE);
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

  // Calculate impossible digits based on remaining possible answers
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
    
    // Calculate new possibilities
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
    // Reset hint on new turn
    setAiHint(null);
  };

  const handleGetHint = async () => {
    if (aiLoading === LoadingState.LOADING) return;
    
    setAiLoading(LoadingState.LOADING);
    const hint = await getAIHint(
      gameState.guesses,
      gameState.possibleAnswers.length,
      gameState.possibleAnswers.slice(0, 20)
    );
    setAiHint(hint);
    setAiLoading(LoadingState.SUCCESS);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-6xl mx-auto">
      
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
          <span className="hidden md:inline">新遊戲</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* Left Column: Game Input & Status */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Input Display */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="text-center mb-4">
               <p className="text-slate-400 text-sm mb-2">請輸入 4 個不重複數字</p>
               <div className="flex justify-center gap-2">
                 {[0, 1, 2, 3].map((idx) => (
                   <div 
                     key={idx}
                     className={`w-12 h-14 flex items-center justify-center text-3xl font-mono rounded-lg border-2 transition-all
                       ${currentInput[idx] 
                         ? 'border-cyan-500 bg-cyan-900/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                         : 'border-slate-600 bg-slate-900/50 text-slate-500'}`}
                   >
                     {currentInput[idx] || ''}
                   </div>
                 ))}
               </div>
            </div>

            {gameState.status === 'won' ? (
               <div className="text-center py-8 animate-bounce">
                 <h2 className="text-3xl font-bold text-green-400 mb-2">你贏了！</h2>
                 <p className="text-slate-300">答案是 {gameState.secret}</p>
                 <button 
                  onClick={startNewGame}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-500 font-bold"
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

          {/* Stats */}
          <GameStats 
            remainingCount={gameState.possibleAnswers.length} 
            totalCombinations={5040} 
          />

        </div>

        {/* Middle Column: History */}
        <div className="lg:col-span-1 h-[600px] flex flex-col">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-slate-200">猜測紀錄</h2>
              <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                {gameState.guesses.length} 回合
              </span>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {gameState.guesses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-xl font-bold">?</div>
                  <p>尚未開始猜測</p>
                </div>
              ) : (
                gameState.guesses.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-6 text-right">#{idx + 1}</span>
                      <span className="text-xl font-mono font-bold text-white tracking-widest">{g.guess}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-bold font-mono text-sm
                      ${g.a === 4 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        g.a > 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                        'bg-slate-600 text-slate-300'}`}>
                      {g.a}A {g.b}B
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI & Solver */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-indigo-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-indigo-200 flex items-center gap-2">
                  <BrainIcon />
                  AI 助手
                </h2>
                {gameState.status === 'playing' && gameState.guesses.length > 0 && (
                  <button
                    onClick={handleGetHint}
                    disabled={aiLoading === LoadingState.LOADING}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {aiLoading === LoadingState.LOADING ? '思考中...' : '取得提示'}
                  </button>
                )}
              </div>
              
              <div className="min-h-[100px] text-sm text-indigo-100/80 leading-relaxed">
                {aiHint ? (
                  <div className="animate-fadeIn">
                    <p>{aiHint}</p>
                  </div>
                ) : (
                   <p className="text-indigo-300/40 italic">
                     {gameState.guesses.length === 0 
                       ? "進行第一次猜測後，AI 將為你分析趨勢。" 
                       : "需要幫忙嗎？根據你的紀錄索取策略提示。"}
                   </p>
                )}
              </div>
            </div>

            {/* Possible Answers Panel (Conditional) */}
            <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col overflow-hidden">
              <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                <h2 className="font-bold text-slate-200">可能的答案</h2>
                <p className="text-xs text-slate-400 mt-1">
                  剩餘少於 50 個時顯示
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {gameState.possibleAnswers.length < 50 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {gameState.possibleAnswers.map((num) => (
                      <div 
                        key={num} 
                        className="text-center py-2 rounded bg-cyan-900/30 text-cyan-300 font-mono text-sm border border-cyan-800/30 hover:bg-cyan-800/50 transition-colors cursor-default"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                    <div className="text-4xl font-bold text-slate-700 mb-2">{gameState.possibleAnswers.length}</div>
                    <p className="text-sm">可能性太多</p>
                    <p className="text-xs text-slate-600 mt-2">繼續猜測以縮小範圍！</p>
                  </div>
                )}
              </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;
