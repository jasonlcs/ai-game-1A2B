
/**
 * Checks if a 4-digit string has unique digits.
 */
const hasUniqueDigits = (numStr: string): boolean => {
  if (numStr.length !== 4) return false;
  const unique = new Set(numStr.split(''));
  return unique.size === 4;
};

/**
 * Generates all valid 4-digit numbers with unique digits (0-9).
 * Total: 10 * 9 * 8 * 7 = 5040 combinations.
 */
export const generateAllCombinations = (): string[] => {
  const combos: string[] = [];
  for (let i = 0; i < 10000; i++) {
    const numStr = i.toString().padStart(4, '0');
    if (hasUniqueDigits(numStr)) {
      combos.push(numStr);
    }
  }
  return combos;
};

// Cache the initial pool to avoid re-generating strings, but we will fully analyze it each time.
export const INITIAL_POOL = generateAllCombinations();

/**
 * Generates a random secret number with unique digits.
 */
export const generateSecret = (): string => {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let secret = '';
  while (secret.length < 4) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    secret += digits[randomIndex];
    digits.splice(randomIndex, 1);
  }
  return secret;
};

/**
 * Generates a random player name (e.g., Guest_8392)
 */
export const generateRandomName = (): string => {
  const prefix = ["Guest", "Player", "Agent", "Master", "Solver"];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${randomPrefix}_${randomNum}`;
};

/**
 * Calculates A (Bulls) and B (Cows).
 */
export const calculateAB = (secret: string, guess: string): { a: number; b: number } => {
  let a = 0;
  let b = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      a++;
    } else if (secret.includes(guess[i])) {
      b++;
    }
  }
  return { a, b };
};

/**
 * Filters the list of possible answers based on a guess and its result.
 */
export const filterPossibilities = (
  currentPool: string[],
  guess: string,
  targetA: number,
  targetB: number
): string[] => {
  return currentPool.filter((candidate) => {
    const result = calculateAB(candidate, guess);
    return result.a === targetA && result.b === targetB;
  });
};

/**
 * Identifies digits (0-9) that do not appear in ANY of the remaining possible answers.
 */
export const getImpossibleDigits = (possibleAnswers: string[]): string[] => {
  const presentDigits = new Set<string>();
  
  for (const answer of possibleAnswers) {
    for (const char of answer) {
      presentDigits.add(char);
    }
    // Optimization: If we've found all 10 digits, none are impossible.
    if (presentDigits.size === 10) return [];
  }

  const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return allDigits.filter(digit => !presentDigits.has(digit));
};

/**
 * Identifies digits that are confirmed to be in a specific position (0-3).
 */
export const getConfirmedPositions = (possibleAnswers: string[]): Record<string, number> => {
  const result: Record<string, number> = {};
  if (possibleAnswers.length === 0) return result;
  
  for (let col = 0; col < 4; col++) {
    const firstVal = possibleAnswers[0][col];
    let allMatch = true;
    
    for (let i = 1; i < possibleAnswers.length; i++) {
      if (possibleAnswers[i][col] !== firstVal) {
        allMatch = false;
        break;
      }
    }
    
    if (allMatch) {
      result[firstVal] = col;
    }
  }
  
  return result;
};

/**
 * Analyzes the remaining answers and returns the possible digits for each position.
 */
export const getPositionalPossibilities = (possibleAnswers: string[]): string[][] => {
  if (possibleAnswers.length === 0) return [[], [], [], []];
  // Skip visually if too many possibilities (UI cleanup only)
  if (possibleAnswers.length > 100) return [[], [], [], []];

  const positions: Set<string>[] = [new Set(), new Set(), new Set(), new Set()];

  for (const answer of possibleAnswers) {
    for (let i = 0; i < 4; i++) {
      positions[i].add(answer[i]);
    }
  }

  return positions.map(set => Array.from(set).sort());
};

/**
 * Calculates the probability of each digit (0-9).
 */
export const getDigitProbabilities = (possibleAnswers: string[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  digits.forEach(d => counts[d] = 0);

  if (possibleAnswers.length === 0) return counts;

  for (const answer of possibleAnswers) {
    for (const char of answer) {
      counts[char]++;
    }
  }

  const total = possibleAnswers.length;
  const probabilities: Record<string, number> = {};
  
  for (const digit of digits) {
    probabilities[digit] = counts[digit] / total;
  }

  return probabilities;
};

export interface ReviewStep {
  stepIndex: number;
  guess: string;
  result: string;
  candidatesBefore: number;
  candidatesAfter: number;
  reductionPercent: number;
  insight: string; 
}

/**
 * Replays the game history to generate a step-by-step logic review.
 */
export const generateGameReview = (guesses: { guess: string; a: number; b: number }[]): ReviewStep[] => {
  // Always start with the full pool
  let currentPool = INITIAL_POOL; 
  const steps: ReviewStep[] = [];

  for (let i = 0; i < guesses.length; i++) {
    const g = guesses[i];
    const beforeCount = currentPool.length;
    
    const prevImpossible = getImpossibleDigits(currentPool);
    const prevConfirmed = getConfirmedPositions(currentPool);

    const nextPool = filterPossibilities(currentPool, g.guess, g.a, g.b);
    const afterCount = nextPool.length;
    
    const nextImpossible = getImpossibleDigits(nextPool);
    const nextConfirmed = getConfirmedPositions(nextPool);

    const newlyExcluded = nextImpossible.filter(d => !prevImpossible.includes(d));
    
    const newlyConfirmed: string[] = [];
    Object.keys(nextConfirmed).forEach(digit => {
        const pos = nextConfirmed[digit];
        if (prevConfirmed[digit] !== pos) {
            newlyConfirmed.push(`[${digit}]在第${pos + 1}位`);
        }
    });

    const diff = beforeCount - afterCount;
    const percent = beforeCount > 0 ? (diff / beforeCount) * 100 : 0;
    
    const insightParts: string[] = [];
    
    if (newlyConfirmed.length > 0) {
        insightParts.push(`鎖定：${newlyConfirmed.join('、')}`);
    }

    if (newlyExcluded.length > 0) {
        if (newlyExcluded.length > 6) {
             insightParts.push(`排除 ${newlyExcluded.length} 個數字`);
        } else {
             insightParts.push(`排除數字：${newlyExcluded.join(', ')}`);
        }
    }
    
    steps.push({
      stepIndex: i + 1,
      guess: g.guess,
      result: `${g.a}A${g.b}B`,
      candidatesBefore: beforeCount,
      candidatesAfter: afterCount,
      reductionPercent: percent,
      insight: insightParts.join('，')
    });
    
    currentPool = nextPool;
  }
  return steps;
};
