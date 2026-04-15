/**
 * Skull King Score Calculator
 * Handles score calculation for bids and tricks taken
 */

/**
 * Calculates the round score for a single player
 * Rules:
 * - Exact bid: +20 points per trick
 * - Missed bid: -10 points per trick difference
 * 
 * @param {number} bid - The bid amount
 * @param {number} tricksTaken - The number of tricks taken
 * @returns {number} The calculated score for the round
 */
function calculateRoundScore(bid, tricksTaken) {
  // Validate inputs
  if (typeof bid !== 'number' || typeof tricksTaken !== 'number') {
    console.error('Invalid input types for score calculation');
    return 0;
  }
  
  if (bid < 0 || tricksTaken < 0) {
    console.error('Bid and tricks taken must be non-negative');
    return 0;
  }
  
  // Calculate difference
  const difference = Math.abs(bid - tricksTaken);
  
  // If bid is exact, award points
  if (difference === 0) {
    return bid * 20;
  }
  
  // If bid is missed, penalize
  return -1 * difference * 10;
}

/**
 * Updates the scoreboard with calculated scores
 */
function updateScoreboard() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  
  if (!scoreboardBody) {
    console.error('Scoreboard body element not found');
    return;
  }
  
  // Get all player rows
  const playerRows = scoreboardBody.querySelectorAll('.player-row');
  
  playerRows.forEach((row) => {
    // Get bid and tricks input values
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');
    const roundScoreCell = row.querySelector('.round-score');
    const totalScoreCell = row.querySelector('.total-score');
    
    if (!bidInput || !tricksInput || !roundScoreCell || !totalScoreCell) {
      console.warn('Missing required elements in player row');
      return;
    }
    
    // Parse values
    const bid = parseInt(bidInput.value, 10) || 0;
    const tricksTaken = parseInt(tricksInput.value, 10) || 0;
    
    // Calculate round score
    const roundScore = calculateRoundScore(bid, tricksTaken);
    
    // Update the round score cell
    roundScoreCell.textContent = roundScore;
    
    // Update the total score (for now, same as round score since only one round)
    totalScoreCell.textContent = roundScore;
  });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  const calculateBtn = document.getElementById('calculate-score-btn');
  
  if (!calculateBtn) {
    console.error('Calculate score button not found');
    return;
  }
  
  calculateBtn.addEventListener('click', updateScoreboard);
}

/**
 * Initialize the app
 */
function initializeApp() {
  initializeEventListeners();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
