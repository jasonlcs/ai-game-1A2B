
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateSecret, calculateAB, filterPossibilities, getImpossibleDigits, getConfirmedPositions, getPositionalPossibilities, getDigitProbabilities, generateGameReview, ReviewStep, INITIAL_POOL } from './utils/gameEngine';
import { GuessResult, GameState } from './types';
import NumberPad from './components/NumberPad';
import { db, fetchLeaderboard, submitScore, LeaderboardEntry } from './services/firebase';

// Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

const FeatherIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
);

const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);

// --- Custom Logo Component ---
const GameLogo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center">
    <div className="absolute inset-0 border border-amber-500/30 rounded-full bg-neutral-900/50"></div>
    <div className="absolute inset-1 border border-amber-500/60 rounded-full rotate-45"></div>
    <div className="text-[10px] font-serif font-bold text-amber-100 tracking-tighter relative z-10">1A</div>
  </div>
);

// --- Luxury Background Component ---
const LuxuryBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-neutral-900">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(30,41,59,1)_0%,_rgba(10,10,10,1)_100%)]"></div>
    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full"></div>
    <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
      <defs>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#d97706" /> 
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M0,100 Q 250,200 500,100 T 1000,100" fill="none" stroke="url(#goldLine)" strokeWidth="0.8" />
      <path d="M0,300 Q 250,400 500,300 T 1000,300" fill="none" stroke="url(#goldLine)" strokeWidth="0.8" opacity="0.6" />
      <path d="M0,500 Q 250,600 500,500 T 1000,500" fill="none" stroke="url(#goldLine)" strokeWidth="0.8" opacity="0.4" />
    </svg>
    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
  </div>
);


// --- Game Rules Modal ---
const GameRulesModal = ({ onClose, mode = 'collapsible', onStart, initialName = '', onNameChange }: { onClose: () => void, mode?: 'collapsible' | 'static', onStart?: () => void, initialName?: string, onNameChange?: (name: string) => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[85%] max-w-md bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-neutral-800/50">
           <div className="flex items-center gap-2 text-amber-100 font-serif font-bold tracking-wider">
              <InfoIcon />
              <span>遊戲規則</span>
           </div>
           {mode === 'collapsible' && (
             <button 
               onClick={onClose}
               className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
             >
               <CloseIcon />
             </button>
           )}
        </div>
        <div className="p-5 text-sm text-neutral-300 bg-neutral-900/80 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <h3 className="text-amber-500 font-bold mb-1 text-xs tracking-widest uppercase">目標</h3>
                <p>猜出系統產生的一組 <span className="text-white font-mono font-bold">4</span> 位不重複數字。</p>
              </div>
              <div className="my-2 p-3 bg-neutral-950/60 rounded-lg border border-white/5 flex justify-center shadow-inner">
                <svg viewBox="0 0 300 130" className="w-full h-auto font-mono select-none">
                  <defs>
                    <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6" fill="#10b981" />
                    </marker>
                    <marker id="arrow-yellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6" fill="#f59e0b" />
                    </marker>
                  </defs>
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
              <div className="pt-2 border-t border-white/5">
                <h3 className="text-amber-500 font-bold mb-2 text-xs tracking-widest uppercase">計分規則 (SCORING)</h3>
                <div className="bg-neutral-950/60 p-3 rounded-lg border border-white/5 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                        <span className="text-neutral-400">基礎分數</span>
                        <span className="text-amber-100 font-bold">10,000</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400">時間懲罰</span>
                        <span className="text-red-400">-10 / 秒</span>
                    </div>
                    <div className="h-px bg-white/10 my-1"></div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                        <div className="bg-amber-900/20 rounded p-1 border border-amber-500/10">
                            <div className="text-amber-500 font-bold">簡單 EASY</div>
                            <div className="text-red-300">-500 / 次</div>
                            <div className="text-white">x 1.0</div>
                        </div>
                        <div className="bg-indigo-900/20 rounded p-1 border border-indigo-500/10">
                            <div className="text-indigo-400 font-bold">智慧 SMART</div>
                            <div className="text-red-300">-400 / 次</div>
                            <div className="text-white">x 1.2</div>
                        </div>
                        <div className="bg-neutral-700/30 rounded p-1 border border-neutral-500/10">
                            <div className="text-neutral-300 font-bold">困難 HARD</div>
                            <div className="text-red-300">-300 / 次</div>
                            <div className="text-white">x 1.5</div>
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-emerald-400 font-bold">上榜門檻：6,500 分</span>
                    </div>
                </div>
              </div>
            </div>
        </div>
        <div className="p-4 border-t border-white/10 bg-neutral-800/50 flex flex-col gap-3">
             {mode === 'static' && onStart ? (
                <>
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">您的暱稱 (用於排行榜)</label>
                      <input 
                        type="text" 
                        maxLength={10} 
                        value={initialName}
                        onChange={(e) => onNameChange && onNameChange(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded px-3 py-2 font-mono text-white focus:border-amber-500 focus:outline-none placeholder:text-neutral-600"
                        placeholder="請輸入暱稱以開始遊戲"
                      />
                  </div>
                  <button 
                    onClick={onStart}
                    disabled={!initialName?.trim()}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-900 font-bold tracking-widest shadow-lg transition-all active:scale-95 text-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    開始挑戰
                  </button>
                </>
             ) : (
                <button 
                  onClick={onClose}
                  className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold tracking-widest shadow-lg transition-all active:scale-95 border border-white/10"
                >
                  我瞭解了
                </button>
             )}
        </div>
      </div>
    </div>
  );
};

// --- Leaderboard Modal ---
const LeaderboardModal = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<{ nickname: string, guesses: GuessResult[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchLeaderboard();
        setEntries(data);
        setErrorMsg(null);
      } catch (e) {
        console.error("Fetch error:", e);
        setErrorMsg("connection_error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const isGoogleSandbox = window.location.hostname.includes('googleusercontent.com');

  if (!db) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="bg-neutral-900 p-6 rounded-xl border border-red-500/50 text-center max-w-sm">
                 <p className="text-red-300 mb-2">Firebase 連線失敗</p>
                 <p className="text-neutral-500 text-xs mb-4">請確認您的 API Key 設定與網路連線。</p>
                 <button onClick={onClose} className="px-4 py-2 bg-neutral-800 rounded text-neutral-300">關閉</button>
             </div>
        </div>
     );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '-';
    const date = timestamp.toDate();
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  const getDaysOnBoard = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 0;
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[95%] max-w-md h-[85vh] bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.1)] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-neutral-800/50">
           <div className="flex items-center gap-2 text-amber-100 font-serif font-bold tracking-wider">
              {selectedReplay ? (
                <button onClick={() => setSelectedReplay(null)} className="flex items-center gap-1 hover:text-white transition-colors">
                  <ArrowLeftIcon />
                  <span>BACK</span>
                </button>
              ) : (
                <>
                  <TrophyIcon />
                  <span>GLOBAL ELITE (TOP 10)</span>
                </>
              )}
           </div>
           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-700 transition-colors"><CloseIcon /></button>
        </div>

        {selectedReplay ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900/50">
              <div className="p-2 border-b border-white/5 bg-amber-950/20 text-center">
                 <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">Replay: {selectedReplay.nickname}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                 <GameReviewList guesses={selectedReplay.guesses} />
              </div>
              <div className="p-3 border-t border-white/5 bg-neutral-900">
                  <button 
                    onClick={() => setSelectedReplay(null)}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-amber-500 font-bold text-xs tracking-widest uppercase rounded-lg border border-white/5 shadow-lg"
                  >
                    Back to Leaderboard
                  </button>
              </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
             {loading ? (
               <div className="flex items-center justify-center h-full text-neutral-500 font-mono text-xs">LOADING DATA...</div>
             ) : errorMsg ? (
               <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-red-400 text-xs font-mono mb-2">連接失敗 (Connection Blocked)</p>
                  <p className="text-neutral-500 text-[10px] mb-2">Google Cloud API Key 拒絕了此請求。</p>
                  
                  <div className="bg-neutral-950/80 p-3 rounded-lg border border-red-900/30 text-left w-full">
                      <p className="text-[10px] text-amber-500 mb-1 font-bold">請將以下網址加入 Google Cloud Console 的 API Key 白名單：</p>
                      
                      {isGoogleSandbox ? (
                         <>
                            <p className="text-[9px] text-neutral-400 mt-2 mb-1">偵測到您正在使用 AI Studio 預覽，請加入萬用字元：</p>
                            <div className="bg-neutral-800 p-2 rounded text-emerald-400 text-xs font-mono select-all">*.googleusercontent.com</div>
                            <p className="text-[9px] text-neutral-500 mt-1 italic">這樣可以支援所有動態產生的預覽網址。</p>
                         </>
                      ) : (
                         <div className="bg-neutral-800 p-2 rounded text-emerald-400 text-xs font-mono select-all mt-1">{window.location.hostname}</div>
                      )}
                      
                      <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="block text-right text-[10px] text-amber-500 hover:underline mt-2">前往設定頁面 &rarr;</a>
                  </div>
               </div>
             ) : entries.length === 0 ? (
               <div className="flex items-center justify-center h-full text-neutral-500 font-mono text-xs">NO RECORDS YET</div>
             ) : (
               entries.map((entry, idx) => {
                 let rankStyle = "bg-neutral-800 text-neutral-400";
                 let borderStyle = "border-white/5";
                 if (idx === 0) { rankStyle = "bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-900 font-bold border-amber-400"; borderStyle = "border-amber-500/50"; }
                 else if (idx === 1) { rankStyle = "bg-gradient-to-br from-slate-300 to-slate-400 text-neutral-900 font-bold border-slate-300"; borderStyle = "border-slate-400/50"; }
                 else if (idx === 2) { rankStyle = "bg-gradient-to-br from-orange-400 to-orange-700 text-white font-bold border-orange-500"; borderStyle = "border-orange-600/50"; }

                 const daysOnBoard = getDaysOnBoard(entry.timestamp);

                 return (
                   <div key={idx} className={`flex items-start p-3 rounded-lg border ${borderStyle} bg-neutral-900/50 hover:bg-neutral-800/80 transition-colors group relative overflow-hidden`}>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-serif flex-shrink-0 mt-0.5 ${rankStyle}`}>
                         {idx + 1}
                      </div>
                      <div className="flex-1 ml-3 min-w-0 flex flex-col gap-1.5">
                         {/* Top Row: Name and Score */}
                         <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-amber-100 text-sm tracking-wide truncate">{entry.nickname}</span>
                            <span className="font-mono font-bold text-amber-400 text-sm shadow-amber-500/20 drop-shadow-sm">{entry.score.toLocaleString()}</span>
                         </div>
                         
                         {/* Middle Row: Game Stats Badges */}
                         <div className="flex gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase border flex items-center gap-1 ${entry.difficulty === 'hard' ? 'bg-red-900/20 text-red-400 border-red-500/30' : (entry.difficulty === 'smart' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30' : 'bg-amber-900/20 text-amber-400 border-amber-500/30')}`}>
                              {entry.difficulty === 'hard' && <FireIcon />}
                              {entry.difficulty === 'smart' && <BrainIcon />}
                              {entry.difficulty === 'easy' && <FeatherIcon />}
                              {entry.difficulty.toUpperCase()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10 bg-neutral-800 text-neutral-400">
                               {entry.guesses} Guess
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10 bg-neutral-800 text-neutral-400">
                               {entry.time}s
                            </span>
                         </div>

                         {/* Bottom Row: Date and Days on Board */}
                         <div className="flex justify-between items-center text-[9px] text-neutral-600 font-mono">
                            <span>{formatDate(entry.timestamp)}</span>
                            <span className={daysOnBoard === 0 ? "text-emerald-500 font-bold" : "text-amber-700/80 font-bold"}>
                               {daysOnBoard === 0 ? "新進榜" : `霸榜 ${daysOnBoard} 天`}
                            </span>
                         </div>
                      </div>
                      
                      {/* Play Button Column */}
                      {entry.replay_data && entry.replay_data.length > 0 && (
                        <div className="flex flex-col justify-center h-full ml-2">
                            <button 
                            onClick={() => setSelectedReplay({ nickname: entry.nickname, guesses: entry.replay_data! })}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-500 hover:bg-amber-500 hover:text-neutral-900 transition-all opacity-40 group-hover:opacity-100 flex-shrink-0 border border-white/5"
                            title="Watch Replay"
                            >
                            <PlayIcon />
                            </button>
                        </div>
                      )}
                   </div>
                 );
               })
             )}
          </div>
        )}
      </div>
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
    <div className="grid grid-cols-3 gap-2 mt-2 px-1">
      {guesses.map((result, idx) => {
        const isLatest = idx === 0;
        const realIndex = totalGuesses - idx; 
        
        return (
          <div 
            key={`${result.guess}-${idx}`}
            className={`
              col-span-1 flex flex-col justify-between items-center rounded-lg border transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
              ${isLatest 
                ? 'bg-neutral-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] z-20 ring-1 ring-amber-500/50' 
                : 'bg-neutral-900/40 border-white/5 text-neutral-500 opacity-70'
              }
            `}
          >
             <div className={`
                flex w-full justify-between items-center px-2 py-1.5 border-b
                ${isLatest ? 'bg-amber-600 border-amber-500' : 'bg-transparent border-white/5'}
             `}>
                <span className={`text-[9px] font-mono flex items-center gap-0.5 ${isLatest ? 'text-neutral-900 font-extrabold' : 'text-neutral-600'}`}>
                  #{realIndex.toString().padStart(2, '0')}
                  {isLatest && <span className="text-amber-900 animate-pulse"><StarIcon /></span>}
                </span>
                <div className={`font-mono font-bold flex gap-0.5 items-baseline ${isLatest ? 'text-sm' : 'text-[10px]'}`}>
                  <span className={isLatest ? "text-white drop-shadow-sm" : (result.a === 4 ? "text-emerald-500" : "text-neutral-500")}>{result.a}A</span>
                  <span className={isLatest ? "text-white drop-shadow-sm" : (result.b > 0 ? "text-amber-500" : "text-neutral-600")}>{result.b}B</span>
                </div>
             </div>
             
             <div className="flex items-center justify-center gap-1 py-2">
                 {result.guess.split('').map((digit, i) => {
                    return (
                        <div 
                            key={i} 
                            className={`
                                flex items-center justify-center rounded font-mono font-bold leading-none border shadow-sm
                                ${isLatest 
                                    ? 'w-5 h-6 text-sm bg-emerald-600 text-white border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' 
                                    : 'w-4 h-5 text-[10px] bg-emerald-900/40 text-emerald-100/60 border-emerald-800/50'
                                }
                            `}
                        >
                            {digit}
                        </div>
                    );
                 })}
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
    <div className="w-full flex-1 px-1 pr-2 space-y-4">
      {steps.map((step) => (
        <div key={step.stepIndex} className="relative pl-5 border-l border-neutral-700 last:border-amber-500/50">
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
             
             {step.insight && (
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-300 leading-relaxed">{step.insight}</span>
                </div>
             )}
             
             <div className="mt-2 flex items-center gap-2 opacity-90">
                 <div className="flex-1 h-0.5 bg-neutral-700 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{width: `${step.reductionPercent}%`}}></div>
                 </div>
                 <span className="text-[9px] text-emerald-500 font-mono">-{Math.round(step.reductionPercent)}%</span>
             </div>
          </div>
        </div>
      ))}
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
type UploadStatus = 'idle' | 'success' | 'low_score' | 'permission_error' | 'unknown_error';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    secret: generateSecret(),
    guesses: [],
    possibleAnswers: [...INITIAL_POOL], 
    status: 'playing',
  });
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('smart');
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [userName, setUserName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    console.log("🔥 Current Origin for Firebase Whitelist:", window.location.hostname);
    const storedName = localStorage.getItem('1a2b_username');
    if (storedName) {
      setUserName(storedName);
    } 
    // Removed automatic random name generation. User must input name.
  }, []);

  useEffect(() => {
    let interval: any;
    if (hasStarted && gameState.status === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, gameState.status]);

  const handleRestart = () => {
    // FORCE NEW REFERENCE
    const newPool = [...INITIAL_POOL];
    setGameState({
      secret: generateSecret(),
      guesses: [],
      possibleAnswers: newPool, 
      status: 'playing',
    });
    setInput('');
    setTimeElapsed(0);
    setScoreSubmitted(false);
    setUploadStatus('idle');
    setFinalScore(0);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    handleRestart();
  };

  const calculateScore = (guesses: number, time: number, mode: Difficulty) => {
    const BASE_SCORE = 10000;
    const TIME_PENALTY = 10;
    let guessPenalty = 500;
    let multiplier = 1.0;

    if (mode === 'smart') {
      guessPenalty = 400;
      multiplier = 1.2;
    }
    if (mode === 'hard') {
      guessPenalty = 300;
      multiplier = 1.5;
    }

    const penaltyGuesses = Math.max(0, guesses - 1);
    
    let rawScore = BASE_SCORE - (penaltyGuesses * guessPenalty) - (time * TIME_PENALTY);
    if (rawScore < 0) rawScore = 0;
    return Math.floor(rawScore * multiplier);
  };
  
  const currentLiveScore = useMemo(() => {
      if (gameState.status !== 'playing') return finalScore;
      return calculateScore(gameState.guesses.length + 1, timeElapsed, difficulty);
  }, [gameState.guesses.length, timeElapsed, difficulty, gameState.status, finalScore]);

  const impossibleDigits = useMemo(() => getImpossibleDigits(gameState.possibleAnswers), [gameState.possibleAnswers]);
  const confirmedPositions = useMemo(() => getConfirmedPositions(gameState.possibleAnswers), [gameState.possibleAnswers]);
  const digitProbabilities = useMemo(() => getDigitProbabilities(gameState.possibleAnswers), [gameState.possibleAnswers]);
  
  const isHintLocked = difficulty === 'easy' && gameState.guesses.length < 3;
  const showMemoryHints = (difficulty === 'easy' && !isHintLocked) || difficulty === 'smart';
  const showPredictionHints = (difficulty === 'easy' && !isHintLocked);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameState.guesses]);

  // Automatic Score Submission Effect
  useEffect(() => {
    const autoSubmit = async () => {
      if (gameState.status === 'won' && !scoreSubmitted && db && userName.trim()) {
         const scoreToSubmit = finalScore > 0 ? finalScore : calculateScore(gameState.guesses.length, timeElapsed, difficulty);
         
         if (finalScore === 0) setFinalScore(scoreToSubmit);

         if (scoreToSubmit < 6500) {
           setUploadStatus('low_score');
           setScoreSubmitted(true);
           return;
         }

         const result = await submitScore({
            nickname: userName.trim(),
            score: scoreToSubmit,
            difficulty,
            guesses: gameState.guesses.length,
            time: timeElapsed,
            replay_data: gameState.guesses
         });

         if (result.success) {
           setScoreSubmitted(true);
           setUploadStatus('success');
         } else if (result.errorType === 'permission') {
           setUploadStatus('permission_error');
           setPermissionError(true);
         } else {
           setUploadStatus('unknown_error');
         }
      }
    };
    
    autoSubmit();
  }, [gameState.status]);

  const handleStartGame = () => {
    if (userName.trim()) {
      localStorage.setItem('1a2b_username', userName.trim());
      setHasStarted(true);
    }
  };

  const handleGuess = () => {
    if (input.length !== 4) return;
    const { a, b } = calculateAB(gameState.secret, input);
    const nextPool = filterPossibilities(gameState.possibleAnswers, input, a, b);
    const newGuess: GuessResult = { guess: input, a, b };
    const newStatus = a === 4 ? 'won' : 'playing';
    
    if (newStatus === 'won') {
        setFinalScore(calculateScore(gameState.guesses.length + 1, timeElapsed, difficulty));
    }

    setGameState(prev => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
      possibleAnswers: nextPool,
      status: newStatus,
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

  const reversedGuesses = [...gameState.guesses].reverse();
  const remainingCount = gameState.possibleAnswers.length;

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto relative text-neutral-100 overflow-hidden font-sans bg-black">
      <LuxuryBackground />
      
      {permissionError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-neutral-900 border border-red-500 rounded-xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl">
               <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  權限不足 (Permission Denied)
               </div>
               <p className="text-neutral-300 text-sm">您的 Firebase 安全性規則拒絕了這次寫入。請前往 Firebase Console 的 <strong>Firestore Database &gt; Rules</strong> 標籤，將內容替換為以下<strong>極簡版安全規則</strong>：</p>
               
               <div className="bg-neutral-950 p-3 rounded border border-white/10 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all">
<pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document=**} {
      allow read: if true;
      allow create: if 
         request.resource.data.score >= 6500 &&
         request.resource.data.nickname.size() <= 10;
      allow update, delete: if false;
    }
  }
}`}</pre>
               </div>
               <button 
                 onClick={() => setPermissionError(false)}
                 className="mt-2 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold"
               >
                 關閉
               </button>
            </div>
        </div>
      )}

      {!hasStarted ? (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"></div>
             <div className="relative z-10 w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-700">
                <div className="scale-150 mb-4"><GameLogo /></div>
                <div className="text-center">
                   <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-amber-600 mb-2 drop-shadow-lg">1A2B</h1>
                   <p className="text-neutral-400 tracking-[0.5em] text-xs uppercase font-mono">Logic Mastermind</p>
                </div>
                <GameRulesModal 
                    onClose={() => {}} 
                    mode="static" 
                    onStart={handleStartGame} 
                    initialName={userName}
                    onNameChange={setUserName}
                />
             </div>
         </div>
      ) : (
        <>
          {showRules && <GameRulesModal onClose={() => setShowRules(false)} />}
          {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}

          <header className="flex-none p-4 pb-2 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
               <GameLogo />
               <button 
                  onClick={handleRestart}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-amber-500 hover:text-white border border-white/10 transition-colors shadow-sm"
                  title="重新開始"
               >
                  <RefreshIcon />
               </button>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowRules(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-amber-400 border border-white/10 transition-colors shadow-sm"
                  title="遊戲規則"
                >
                  <InfoIcon />
                </button>
                <button 
                  onClick={() => setShowLeaderboard(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-amber-500 border border-white/10 transition-colors shadow-sm"
                  title="排行榜"
                >
                  <TrophyIcon />
                </button>
                <div className="flex bg-neutral-800/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg gap-1">
                   <button onClick={() => handleDifficultyChange('easy')} title="Easy" className={`px-3 py-1.5 rounded-md transition-all flex items-center justify-center ${difficulty === 'easy' ? 'bg-amber-600/90 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}><FeatherIcon /></button>
                   <button onClick={() => handleDifficultyChange('smart')} title="Smart" className={`px-3 py-1.5 rounded-md transition-all flex items-center justify-center ${difficulty === 'smart' ? 'bg-indigo-600/90 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}><BrainIcon /></button>
                   <button onClick={() => handleDifficultyChange('hard')} title="Hard" className={`px-3 py-1.5 rounded-md transition-all flex items-center justify-center ${difficulty === 'hard' ? 'bg-red-900/90 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}><FireIcon /></button>
                </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden flex flex-col relative w-full max-w-md mx-auto z-10" ref={scrollRef}>
             {/* Info Bar */}
             <div className="flex-none px-4 py-1 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-amber-500 font-mono tracking-widest flex items-center gap-2">
                        SCORE: 
                        <span className="text-xl font-bold font-mono text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                            {currentLiveScore.toLocaleString()}
                        </span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
                        REMAIN: <span className="text-neutral-300 font-bold">{remainingCount}</span>
                    </span>
                </div>
                
                {remainingCount < 50 && gameState.status === 'playing' && (
                  <div className="h-6">
                     <PositionalAnalysis possibleAnswers={gameState.possibleAnswers} />
                  </div>
                )}
             </div>

             {/* Game Area */}
             {gameState.status === 'won' ? (
                <div className="flex-1 flex flex-col p-4 animate-in slide-in-from-bottom-5 fade-in duration-500 h-full relative">
                    <div className="text-center mb-4 flex-none">
                        <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 drop-shadow-sm mb-1">VICTORY</h2>
                        <div className="flex flex-col items-center gap-1">
                             <div className="text-sm font-mono text-amber-400 tracking-[0.2em] font-bold">
                                FINAL SCORE: {finalScore.toLocaleString()}
                             </div>
                             
                             <div className="h-5 flex items-center justify-center">
                                 {uploadStatus === 'success' && (
                                     <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 animate-in zoom-in">
                                         ✓ RANKING ENTRY SUCCESSFUL
                                     </span>
                                 )}
                                 {uploadStatus === 'permission_error' && (
                                     <span className="text-[10px] text-red-400 font-mono bg-red-900/30 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                                         ⚠ UPLOAD FAILED (PERMISSION)
                                     </span>
                                 )}
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-b border-white/5 py-2">
                        <GameReviewList guesses={gameState.guesses} />
                    </div>

                    <div className="flex-none sticky bottom-0 z-20 backdrop-blur-lg bg-neutral-900/60 pt-4 pb-8 -mx-4 px-4 border-t border-white/5 mt-auto">
                        <button 
                            onClick={handleRestart}
                            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-900 font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] active:scale-95 text-lg font-serif flex items-center justify-center gap-3"
                        >
                            <RefreshIcon />
                            PLAY AGAIN
                        </button>
                    </div>
                </div>
             ) : (
                <div className="flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar relative">
                   {gameState.guesses.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-4 opacity-50">
                          <div className="w-16 h-16 rounded-full border border-neutral-700 flex items-center justify-center">
                             <div className="text-2xl font-serif text-neutral-500">?</div>
                          </div>
                          <p className="text-xs font-mono tracking-widest uppercase">Awaiting Input</p>
                      </div>
                   ) : (
                      <GameHistory guesses={reversedGuesses} totalGuesses={gameState.guesses.length} />
                   )}
                </div>
             )}
          </main>

          {gameState.status !== 'won' && (
            <footer className="flex-none p-4 pb-6 bg-neutral-900/80 backdrop-blur-xl border-t border-white/5 z-20 absolute bottom-0 w-full left-0 right-0">
               
               {/* Mode Status Bar */}
               <div className="flex justify-center mb-3">
                  <div className={`
                    px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border flex items-center gap-2 shadow-lg
                    ${difficulty === 'easy' ? 'bg-amber-900/40 text-amber-300 border-amber-500/30' : (
                      difficulty === 'smart' ? 'bg-indigo-900/40 text-indigo-300 border-indigo-500/30' : 'bg-red-900/40 text-red-300 border-red-500/30'
                    )}
                  `}>
                      {difficulty === 'easy' && <FeatherIcon />}
                      {difficulty === 'smart' && <BrainIcon />}
                      {difficulty === 'hard' && <FireIcon />}
                      <span>
                        {difficulty} MODE
                        {isHintLocked ? ` - 提示鎖定中 (${3 - gameState.guesses.length})` : ''}
                      </span>
                  </div>
               </div>

               {/* Input Display */}
               <div className="flex justify-center gap-3 mb-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`w-10 h-12 flex items-center justify-center rounded-lg border transition-all duration-200 
                        ${input[i] 
                          ? 'border-amber-500/60 bg-neutral-800 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                          : 'border-neutral-800 bg-neutral-900/50'
                        }`}
                    >
                      <span className="text-2xl font-mono font-bold">{input[i]}</span>
                    </div>
                  ))}
               </div>

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
            </footer>
          )}
        </>
      )}
    </div>
  );
}
