/**
 * Skull King - Main Application Controller
 * Connects UI to scoring logic and handles user interactions
 */

// Import scoring engine
import { calculateScore } from './scoring.js';

/**
 * Game state object to track scores across rounds
 */
const gameState = {
  players: [
    { name: 'Player 1', totalScore: 0 },
    { name: 'Player 2', totalScore: 0 },
    { name: 'Player 3', totalScore: 0 },
    { name: 'Player 4', totalScore: 0 }
  ]
};

/**
 * Initialize the application
 */
function initializeApp() {
  const calculateBtn = document.getElementById('calculate-score-btn');
  
  if (!calculateBtn) {
    console.error('Calculate score button not found');
    return;
  }

  // Add click listener to calculate score button
  calculateBtn.addEventListener('click', handleCalculateScore);

  // Optional: Add real-time validation listeners to inputs
  const scoreboardBody = document.getElementById('scoreboard-body');
  if (scoreboardBody) {
    scoreboardBody.addEventListener('change', handleInputChange);
  }
}

/**
 * Handle input change events for real-time validation
 */
function handleInputChange(event) {
  const target = event.target;
  
  // Validate bid and tricks inputs
  if (target.classList.contains('bid-input') || target.classList.contains('tricks-input')) {
    validateInput(target);
  }
}

/**
 * Validate individual input field
 * @param {HTMLInputElement} input - The input element to validate
 */
function validateInput(input) {
  const value = parseInt(input.value, 10);
  
  // Check if value is within valid range (0-13)
  if (isNaN(value) || value < 0 || value > 13) {
    input.classList.add('invalid');
    return false;
  }
  
  input.classList.remove('invalid');
  return true;
}

/**
 * Collect player data from the scoreboard
 * @returns {Array} Array of player objects with bid and tricks data
 */
function collectPlayerData() {
  const playerRows = document.querySelectorAll('#scoreboard-body .player-row');
  const players = [];
  
  playerRows.forEach((row, index) => {
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');
    const playerName = row.querySelector('.player-name');
    
    const bid = parseInt(bidInput.value, 10);
    const tricks = parseInt(tricksInput.value, 10);
    
    players.push({
      name: playerName.textContent,
      bid: bid,
      tricks: tricks,
      rowIndex: index,
      bidInput: bidInput,
      tricksInput: tricksInput
    });
  });
  
  return players;
}

/**
 * Validate all player inputs before calculation
 * @param {Array} players - Array of player objects
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateAllInputs(players) {
  for (const player of players) {
    const bid = player.bid;
    const tricks = player.tricks;
    
    // Check if values are within valid range
    if (isNaN(bid) || bid < 0 || bid > 13) {
      return {
        isValid: false,
        message: `${player.name}: Bid must be between 0 and 13`
      };
    }
    
    if (isNaN(tricks) || tricks < 0 || tricks > 13) {
      return {
        isValid: false,
        message: `${player.name}: Tricks taken must be between 0 and 13`
      };
    }
    
    // Check if tricks don't exceed bid (optional but common rule)
    // Commenting out for flexibility - uncomment if this rule applies
    // if (tricks > bid && bid !== 0) {
    //   return {
    //     isValid: false,
    //     message: `${player.name}: Tricks taken cannot exceed bid`
    //   };
    // }
  }
  
  return { isValid: true };
}

/**
 * Update the scoreboard display with calculated scores
 * @param {Array} players - Array of player objects with calculated scores
 */
function updateScoreDisplay(players) {
  const playerRows = document.querySelectorAll('#scoreboard-body .player-row');
  
  players.forEach((player, index) => {
    const row = playerRows[index];
    if (!row) return;
    
    // Update round score
    const roundScoreCell = row.querySelector('.round-score');
    if (roundScoreCell) {
      roundScoreCell.textContent = player.roundScore || 0;
    }
    
    // Update total score
    const totalScoreCell = row.querySelector('.total-score');
    if (totalScoreCell) {
      totalScoreCell.textContent = player.totalScore || 0;
    }
  });
}

/**
 * Handle the calculate score button click
 */
function handleCalculateScore() {
  try {
    // Collect player data from inputs
    const players = collectPlayerData();
    
    // Validate all inputs
    const validation = validateAllInputs(players);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    
    // Calculate scores for each player
    const playerScores = players.map((player, index) => {
      // Call the scoring engine
      const roundScore = calculateScore(player.bid, player.tricks);
      
      // Update total score by accumulating
      gameState.players[index].totalScore += roundScore;
      
      return {
        ...player,
        roundScore: roundScore,
        totalScore: gameState.players[index].totalScore
      };
    });
    
    // Update the DOM with calculated scores
    updateScoreDisplay(playerScores);
    
    // Log the calculation for debugging
    console.log('Scores calculated:', playerScores);
  } catch (error) {
    console.error('Error calculating scores:', error);
    alert('An error occurred while calculating scores. Please try again.');
  }
}

/**
 * Reset game state for a new game
 */
function resetGame() {
  gameState.players.forEach(player => {
    player.totalScore = 0;
  });
  
  // Clear all inputs and scores from the table
  const playerRows = document.querySelectorAll('#scoreboard-body .player-row');
  playerRows.forEach(row => {
    row.querySelector('.bid-input').value = '0';
    row.querySelector('.tricks-input').value = '0';
    row.querySelector('.round-score').textContent = '0';
    row.querySelector('.total-score').textContent = '0';
  });
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}