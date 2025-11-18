export interface GuessResult {
  guess: string;
  a: number;
  b: number;
}

export interface GameState {
  secret: string;
  guesses: GuessResult[];
  possibleAnswers: string[];
  status: 'playing' | 'won' | 'lost';
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
