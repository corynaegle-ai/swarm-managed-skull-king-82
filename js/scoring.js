/**
 * Calculate the score for a regular bid in Skull King
 * @param {number} bid - The number of tricks bid
 * @param {number} tricksTaken - The number of tricks actually taken
 * @returns {number} The score points (positive for exact bid, negative for missed bid)
 */
function calculateRegularBidScore(bid, tricksTaken) {
  if (bid === tricksTaken) {
    // Exact bid: +20 points per trick
    return bid * 20;
  } else {
    // Missed bid: -10 points per trick difference
    return -(Math.abs(bid - tricksTaken) * 10);
  }
}

export { calculateRegularBidScore };
