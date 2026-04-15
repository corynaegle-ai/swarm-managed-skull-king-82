/**
 * Skull King Game Scoring Engine
 * Implements game-specific scoring rules
 */

/**
 * Calculate round score for a player based on bid and tricks taken
 * Skull King scoring rules:
 * - If tricks == bid: 10 * (bid + 1) points
 * - If tricks != bid: -10 * |tricks - bid| points (penalty)
 * 
 * @param {number} bid - Number of tricks the player bid
 * @param {number} tricks - Actual number of tricks the player took
 * @returns {number} Round score
 */
export function calculateRoundScore(bid, tricks) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricks !== 'number') {
    console.warn('Invalid input to calculateRoundScore:', { bid, tricks });
    return 0;
  }

  const bidInt = Math.floor(bid);
  const tricksInt = Math.floor(tricks);

  // Exact match: player bid the exact number of tricks they took
  if (tricksInt === bidInt) {
    return 10 * (bidInt + 1);
  }

  // Mismatch: penalty based on difference
  const difference = Math.abs(tricksInt - bidInt);
  return -10 * difference;
}

/**
 * Validate if a bid is legal for a given round
 * In Skull King, players can bid 0 to round_number tricks
 * 
 * @param {number} bid - The bid amount
 * @param {number} round - The current round (1-13)
 * @returns {boolean} True if bid is valid
 */
export function isValidBid(bid, round) {
  const bidInt = Math.floor(bid);
  return bidInt >= 0 && bidInt <= round && round >= 1 && round <= 13;
}

/**
 * Validate if tricks taken is legal for a given round
 * In Skull King, players can take 0 to round_number tricks
 * 
 * @param {number} tricks - The number of tricks taken
 * @param {number} round - The current round (1-13)
 * @returns {boolean} True if tricks count is valid
 */
export function isValidTricks(tricks, round) {
  const tricksInt = Math.floor(tricks);
  return tricksInt >= 0 && tricksInt <= round && round >= 1 && round <= 13;
}

/**
 * Calculate total round scores for all players
 * Useful for displaying end-of-round summary
 * 
 * @param {array} playerBids - Array of bid amounts for each player
 * @param {array} playerTricks - Array of tricks taken for each player
 * @returns {array} Array of scores for each player
 */
export function calculateRoundScores(playerBids, playerTricks) {
  if (!Array.isArray(playerBids) || !Array.isArray(playerTricks)) {
    console.warn('Invalid input to calculateRoundScores');
    return [];
  }

  const scores = [];
  const minLength = Math.min(playerBids.length, playerTricks.length);

  for (let i = 0; i < minLength; i++) {
    scores.push(calculateRoundScore(playerBids[i], playerTricks[i]));
  }

  return scores;
}
