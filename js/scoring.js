/**
 * Calculate the score for a player in a round of Skull King.
 * 
 * Scoring Rules:
 * - If tricks taken === bid: score = bid * 20
 * - If tricks taken !== bid: score = 0
 * 
 * @param {number} bid - The number of tricks the player bid (0-13)
 * @param {number} tricks - The number of tricks the player actually took (0-13)
 * @returns {number} The calculated score for the round
 */
export function calculateScore(bid, tricks) {
  // If the player exactly matched their bid, they get 20 points per trick
  if (bid === tricks) {
    return bid * 20;
  }
  // Otherwise, they get 0 points
  return 0;
}
