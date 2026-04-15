import React, { useMemo } from 'react';
import { GameState, PlayerScore } from '../types/game';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  gameState: GameState;
  currentRound: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ gameState, currentRound }) => {
  // Ensure we have valid data
  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return <div className="score-display empty">No players to display</div>;
  }

  const TOTAL_ROUNDS = 10;
  const isGameComplete = currentRound > TOTAL_ROUNDS;

  // Calculate running totals for each player
  const playerScores = useMemo(() => {
    return gameState.players.map((player) => {
      const roundScores = player.roundScores || [];
      const runningTotal = roundScores.reduce((sum, score) => sum + score, 0);
      return {
        name: player.name,
        roundScores,
        runningTotal,
      };
    });
  }, [gameState.players]);

  // Determine the maximum number of rounds to display
  const maxRoundsPlayed = Math.max(
    ...playerScores.map((p) => p.roundScores.length),
    currentRound - 1
  );
  const roundsToDisplay = Math.min(maxRoundsPlayed, TOTAL_ROUNDS);

  return (
    <div className="score-display">
      <div className="score-display-header">
        <h2>Score Summary</h2>
        <p className="round-indicator">
          Round: <strong>{isGameComplete ? `${TOTAL_ROUNDS} (Final)` : currentRound}</strong>
        </p>
      </div>

      <div className="score-table-container">
        <table className="score-table">
          <thead>
            <tr>
              <th className="player-name-header">Player</th>
              {Array.from({ length: roundsToDisplay }, (_, i) => (
                <th
                  key={`round-${i + 1}`}
                  className={`round-header ${currentRound === i + 1 ? 'current-round' : ''}`}
                >
                  R{i + 1}
                </th>
              ))}
              <th className="total-header">Total</th>
            </tr>
          </thead>
          <tbody>
            {playerScores.map((playerScore, playerIndex) => (
              <tr key={playerIndex} className="score-row">
                <td className="player-name-cell">{playerScore.name}</td>
                {Array.from({ length: roundsToDisplay }, (_, roundIndex) => {
                  const score = playerScore.roundScores[roundIndex];
                  const isCurrent = currentRound === roundIndex + 1;
                  return (
                    <td
                      key={`${playerIndex}-round-${roundIndex + 1}`}
                      className={`round-score ${isCurrent ? 'current-round' : ''} ${score === undefined ? 'not-played' : ''}`}
                    >
                      {score !== undefined ? score : '-'}
                    </td>
                  );
                })}
                <td className="total-score">{playerScore.runningTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isGameComplete && (
        <div className="game-complete-banner">
          <h3>Game Complete!</h3>
          <p className="final-scores">
            {playerScores
              .sort((a, b) => b.runningTotal - a.runningTotal)
              .map((p, i) => (
                <span key={i}>
                  {i > 0 && ' | '}
                  <strong>{p.name}:</strong> {p.runningTotal}
                </span>
              ))}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
