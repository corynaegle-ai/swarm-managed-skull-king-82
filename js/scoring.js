/**
 * Calculate score for a zero bid
 * @param {number} bid - The bid amount (should be 0 for zero bid scoring)
 * @param {number} actualTricks - The actual number of tricks won
 * @param {number} roundNumber - The current round number (1-indexed)
 * @returns {number} Points earned/lost for the zero bid
 */
function calculateZeroBidScore(bid, actualTricks, roundNumber) {
  // Only apply zero bid scoring if bid is 0
  if (bid !== 0) {
    return 0;
  }

  // Validate inputs
  if (typeof roundNumber !== 'number' || roundNumber < 1) {
    return 0;
  }

  // Successful zero bid: bid=0 and tricks=0
  if (actualTricks === 0) {
    return 10 * roundNumber;
  }

  // Failed zero bid: bid=0 but tricks>0
  if (actualTricks > 0) {
    return -10 * roundNumber;
  }

  // Default case (shouldn't reach here with valid inputs)
  return 0;
}

/**
 * Update a player's score based on their bid and actual tricks
 * @param {string} playerId - The player's unique identifier
 * @param {number} bid - The bid amount
 * @param {number} actualTricks - The actual number of tricks won
 * @param {number} roundNumber - The current round number (1-indexed)
 * @param {object} playerScores - Object mapping playerId to their current score
 * @returns {number} The points earned/lost in this round
 */
function updatePlayerScore(playerId, bid, actualTricks, roundNumber, playerScores) {
  // Validate inputs
  if (typeof playerId !== 'string' || !playerScores) {
    return 0;
  }

  let roundScore = 0;

  // Apply zero bid scoring if bid is 0
  if (bid === 0) {
    roundScore = calculateZeroBidScore(bid, actualTricks, roundNumber);
  } else {
    // Regular scoring: points equal to tricks if bid matches actual tricks, 0 otherwise
    roundScore = (actualTricks === bid) ? bid : 0;
  }

  // Update player's total score
  if (!playerScores[playerId]) {
    playerScores[playerId] = 0;
  }
  playerScores[playerId] += roundScore;

  return roundScore;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateZeroBidScore,
    updatePlayerScore
  };
}
