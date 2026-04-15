/**
 * Scoring utilities for Skull King game
 * Handles calculation of round scores based on bids, tricks, and bonuses
 */

interface ScoreCalculationResult {
  roundScore: number;
  bidAccurate: boolean;
  bonusApplied: boolean;
  baseScore: number;
  bonusScore: number;
  explanation: string;
}

/**
 * Calculate the round score for a single player
 *
 * Scoring Rules:
 * - If bid is accurate (bid === tricks taken):
 *   - Base score = 10 * bid
 *   - Bonus points are applied (only if bid was accurate)
 *   - Total score = base score + bonus points
 * - If bid is inaccurate:
 *   - Score = -5 * |bid - tricks taken|
 *   - Bonus points are NOT applied
 *
 * @param bid - The bid made by the player
 * @param tricksTaken - The actual number of tricks taken
 * @param bonusPoints - The bonus points (only applied if bid is accurate)
 * @returns ScoreCalculationResult with detailed breakdown
 */
export const calculatePlayerRoundScore = (
  bid: number,
  tricksTaken: number,
  bonusPoints: number
): ScoreCalculationResult => {
  const bidAccurate = bid === tricksTaken;

  if (bidAccurate) {
    const baseScore = 10 * bid;
    const bonusScore = bonusPoints;
    const roundScore = baseScore + bonusScore;
    const explanation =
      bonusScore > 0
        ? `Bid accurate (${bid}=${tricksTaken}): ${baseScore} + ${bonusScore} bonus = ${roundScore}`
        : `Bid accurate (${bid}=${tricksTaken}): ${baseScore} points`;

    return {
      roundScore,
      bidAccurate: true,
      bonusApplied: bonusScore > 0,
      baseScore,
      bonusScore,
      explanation,
    };
  }

  // Inaccurate bid
  const difference = Math.abs(bid - tricksTaken);
  const roundScore = -5 * difference;
  const explanation = `Bid inaccurate: -5 × |${bid}-${tricksTaken}| = ${roundScore}`;

  return {
    roundScore,
    bidAccurate: false,
    bonusApplied: false,
    baseScore: 0,
    bonusScore: 0,
    explanation,
  };
};

/**
 * Validate tricks taken value
 * @param tricks - Number of tricks taken
 * @param roundNumber - Current round number
 * @returns true if valid, false otherwise
 */
export const isValidTricksTaken = (tricks: number, roundNumber: number): boolean => {
  return tricks >= 0 && tricks <= roundNumber && Number.isInteger(tricks);
};

/**
 * Validate bonus points value
 * @param bonusPoints - Bonus points to validate
 * @returns true if valid, false otherwise
 */
export const isValidBonusPoints = (bonusPoints: number): boolean => {
  return bonusPoints >= 0 && Number.isInteger(bonusPoints);
};
