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
 * Logic: If 'Candidate' was the secret, would 'Guess' produce the same 'A' and 'B'?
 * If yes, keep Candidate. If no, discard Candidate.
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
