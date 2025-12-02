
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { GuessResult } from "../types";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYFDBt2PHqCnqm2N353ypd9Zs5uLW-VLA",
  authDomain: "jasonlcs-ai-game-1a2b.firebaseapp.com",
  projectId: "jasonlcs-ai-game-1a2b",
  storageBucket: "jasonlcs-ai-game-1a2b.firebasestorage.app",
  messagingSenderId: "983108416054",
  appId: "1:983108416054:web:84366e102e3a5fbee71e97",
  measurementId: "G-TKG0HL95HD"
};

// Initialize Firebase
let app;
let db: any = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization error. Please check your config.", e);
}

export { db };

// Types for Leaderboard
export interface LeaderboardEntry {
  id?: string;
  nickname: string;
  score: number;
  difficulty: string;
  guesses: number;
  time: number;
  replay_data?: GuessResult[]; 
  timestamp?: any;
}

// --- Helper functions ---

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
  } catch (e) {
    console.error("Error fetching leaderboard:", e);
    throw e;
  }
};

export interface SubmitResult {
  success: boolean;
  errorType?: 'permission' | 'unknown';
}

export const submitScore = async (entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<SubmitResult> => {
  if (!db) return { success: false, errorType: 'unknown' };
  try {
    await addDoc(collection(db, "leaderboard"), {
      ...entry,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (e: any) {
    console.error("Error submitting score:", e);
    
    // Detect specific Firestore Permission error
    if (e.code === 'permission-denied') {
      return { success: false, errorType: 'permission' };
    }
    
    return { success: false, errorType: 'unknown' };
  }
};
