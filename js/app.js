/**
 * Main application controller for Skull King scoreboard
 * Connects UI to scoring logic and manages game state
 */

// Mock calculateScore function - in production, import from scoring.js
// If js/scoring.js becomes available with calculateScore export, replace with:
// import { calculateScore } from './scoring.js';
const calculateScore = (bid, tricks) => {
  if (bid === tricks) {
    return 10 + bid;
  } else {
    return -Math.abs(bid - tricks);
  }
};

/**
 * Game state object to track scores across rounds
 * Initialized from DOM on app startup
 */
let gameState = {
  players: [],
  currentRound: 0
};

/**
 * Initialize game state from DOM structure
 * Dynamically discovers players from .player-row elements
 */
function initializeGameState() {
  const playerRows = document.querySelectorAll('.player-row');
  gameState.players = [];
  gameState.currentRound = 0;

  playerRows.forEach((row, index) => {
    const nameCell = row.querySelector('.player-name');
    const playerName = nameCell ? nameCell.textContent.trim() : `Player ${index + 1}`;

    gameState.players.push({
      id: index,
      name: playerName,
      bid: 0,
      tricks: 0,
      roundScore: 0,
      totalScore: 0
    });
  });

  console.log('Game state initialized with', gameState.players.length, 'players');
}

/**
 * Validate bid and tricks input for a player
 * @param {number} bid - The bid value
 * @param {number} tricks - The tricks taken value
 * @returns {object} - { valid: boolean, error: string }
 */
function validateInput(bid, tricks) {
  // Check if values are valid numbers
  if (isNaN(bid) || isNaN(tricks)) {
    return { valid: false, error: 'Bid and tricks must be valid numbers' };
  }

  // Parse as integers to ensure whole numbers
  const bidInt = parseInt(bid, 10);
  const tricksInt = parseInt(tricks, 10);

  // Check if parsing changed the value (indicates float input like 2.5)
  if (bidInt !== parseFloat(bid) || tricksInt !== parseFloat(tricks)) {
    return { valid: false, error: 'Bid and tricks must be whole numbers (no decimals)' };
  }

  // Check bounds
  if (bidInt < 0 || bidInt > 13) {
    return { valid: false, error: 'Bid must be between 0 and 13' };
  }

  if (tricksInt < 0 || tricksInt > 13) {
    return { valid: false, error: 'Tricks must be between 0 and 13' };
  }

  return { valid: true, error: null };
}

/**
 * Update the scoreboard display with calculated scores
 * Only increments total score once per round
 */
function updateScoreboard() {
  const playerRows = document.querySelectorAll('.player-row');

  playerRows.forEach((row, playerIndex) => {
    if (playerIndex < gameState.players.length) {
      const player = gameState.players[playerIndex];
      const roundScoreCell = row.querySelector('.round-score');
      const totalScoreCell = row.querySelector('.total-score');

      if (roundScoreCell) {
        roundScoreCell.textContent = player.roundScore;
      }

      if (totalScoreCell) {
        totalScoreCell.textContent = player.totalScore;
      }
    }
  });

  console.log('Scoreboard updated', gameState);
}

/**
 * Handle calculate score button click
 * Validates inputs, calculates scores, updates state and DOM
 */
function handleCalculateScore() {
  const playerRows = document.querySelectorAll('.player-row');
  let hasErrors = false;
  const errors = [];

  // First pass: validate all inputs
  playerRows.forEach((row, index) => {
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');

    if (!bidInput || !tricksInput) return;

    const bid = bidInput.value;
    const tricks = tricksInput.value;
    const validation = validateInput(bid, tricks);

    // Clear previous error styling
    bidInput.classList.remove('error');
    tricksInput.classList.remove('error');

    if (!validation.valid) {
      hasErrors = true;
      errors.push(`Player ${index + 1}: ${validation.error}`);
      bidInput.classList.add('error');
      tricksInput.classList.add('error');
    }
  });

  // If there are errors, show alert and stop processing
  if (hasErrors) {
    const errorMessage = 'Please fix the following errors:\n\n' + errors.join('\n');
    alert(errorMessage);
    console.warn('Input validation failed:', errorMessage);
    return;
  }

  // Second pass: calculate and update scores
  playerRows.forEach((row, playerIndex) => {
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');

    if (!bidInput || !tricksInput || playerIndex >= gameState.players.length) return;

    const bid = parseInt(bidInput.value, 10);
    const tricks = parseInt(tricksInput.value, 10);
    const player = gameState.players[playerIndex];

    // Store bid and tricks for current round
    player.bid = bid;
    player.tricks = tricks;

    // Calculate round score
    player.roundScore = calculateScore(bid, tricks);

    // Increment total score (only once per round)
    player.totalScore += player.roundScore;
  });

  // Update UI
  updateScoreboard();

  console.log('Score calculation completed for round', gameState.currentRound);
}

/**
 * Reset for new round
 * Clears bid/tricks inputs and increments round counter
 */
function handleNewRound() {
  gameState.currentRound += 1;

  const playerRows = document.querySelectorAll('.player-row');
  playerRows.forEach((row) => {
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');

    if (bidInput) {
      bidInput.value = '0';
      bidInput.classList.remove('error');
    }
    if (tricksInput) {
      tricksInput.value = '0';
      tricksInput.classList.remove('error');
    }
  });

  console.log('New round started:', gameState.currentRound);
}

/**
 * Add input validation on blur event
 * Provides immediate feedback to user about invalid inputs
 */
function setupInputValidation() {
  const scoreboardBody = document.getElementById('scoreboard-body');

  if (scoreboardBody) {
    scoreboardBody.addEventListener('blur', function (event) {
      const target = event.target;

      // Only validate input elements with bid-input or tricks-input classes
      if (!target.classList.contains('bid-input') && !target.classList.contains('tricks-input')) {
        return;
      }

      // Find the corresponding bid and tricks inputs in this row
      const row = target.closest('.player-row');
      if (!row) return;

      const bidInput = row.querySelector('.bid-input');
      const tricksInput = row.querySelector('.tricks-input');

      if (!bidInput || !tricksInput) return;

      const validation = validateInput(bidInput.value, tricksInput.value);

      // Update error styling
      if (!validation.valid) {
        bidInput.classList.add('error');
        tricksInput.classList.add('error');
        console.warn(`Player row validation error: ${validation.error}`);
      } else {
        bidInput.classList.remove('error');
        tricksInput.classList.remove('error');
      }
    }, true); // Use capture phase for consistent event handling
  }
}

/**
 * Initialize the application
 * Set up event listeners and initialize game state
 */
function initializeApp() {
  console.log('Initializing Skull King app...');

  // Initialize game state from DOM
  initializeGameState();

  // Set up event listeners
  const calculateBtn = document.getElementById('calculate-score-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculateScore);
  } else {
    console.error('Calculate score button not found');
  }

  // Set up input validation
  setupInputValidation();

  console.log('App initialization complete');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded (e.g., script was deferred)
  initializeApp();
}
