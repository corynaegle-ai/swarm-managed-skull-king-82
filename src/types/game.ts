export interface Player {
  id: string;
  name: string;
  roundScores: number[];
}

export interface GameState {
  players: Player[];
  currentRound: number;
  isComplete: boolean;
}

export interface PlayerScore {
  name: string;
  roundScores: number[];
  runningTotal: number;
}
