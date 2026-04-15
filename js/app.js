/**
 * Main application controller for Skull King game
 * Connects HTML UI to game logic, manages player state, and handles user interactions
 */

// Import scoring module (will be integrated when scoring.js is ready)
// For now, we define the scoring logic here
import { calculateRoundScore } from './scoring.js';

// Game state
const gameState = {
  players: [
    { name: 'Player 1', bid: 0, tricks: 0, roundScore: 0, totalScore: 0, hasSubmitted: false },
    { name: 'Player 2', bid: 0, tricks: 0, roundScore: 0, totalScore: 0, hasSubmitted: false },
    { name: 'Player 3', bid: 0, tricks: 0, roundScore: 0, totalScore: 0, hasSubmitted: false },
    { name: 'Player 4', bid: 0, tricks: 0, roundScore: 0, totalScore: 0, hasSubmitted: false }
  ],
  currentRound: 1
};

/**
 * Initialize the application
 */
function initApp() {
  loadGameState();
  attachEventListeners();
  renderScoreboard();
}

/**
 * Attach all event listeners
 */
function attachEventListeners() {
  const calculateBtn = document.getElementById('calculate-score-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculateScore);
  }

  // Find or create New Round button
  const scoreboard = document.querySelector('.scoreboard-section');
  if (scoreboard) {
    let newRoundBtn = document.getElementById('new-round-btn');
    if (!newRoundBtn) {
      // Create New Round button if it doesn't exist
      newRoundBtn = document.createElement('button');
      newRoundBtn.id = 'new-round-btn';
      newRoundBtn.className = 'new-round-btn';
      newRoundBtn.textContent = 'New Round';

      const controls = document.querySelector('.scoreboard-controls');
      if (controls) {
        controls.appendChild(newRoundBtn);
      }
    }
    newRoundBtn.addEventListener('click', handleNewRound);
  }
}

/**
 * Validate inputs for a specific player
 * @param {number} playerIndex - Index of player in gameState.players
 * @returns {object} { isValid: boolean, errors: { bid: string|null, tricks: string|null } }
 */
function validatePlayerInputs(playerIndex) {
  const player = gameState.players[playerIndex];
  const errors = { bid: null, tricks: null };
  let isValid = true;

  // Get input elements for this player
  const rows = document.querySelectorAll('.player-row');
  if (playerIndex >= rows.length) return { isValid: false, errors };

  const row = rows[playerIndex];
  const bidInput = row.querySelector('.bid-input');
  const tricksInput = row.querySelector('.tricks-input');

  if (!bidInput || !tricksInput) return { isValid: false, errors };

  const bid = parseInt(bidInput.value, 10) || 0;
  const tricks = parseInt(tricksInput.value, 10) || 0;

  // Validate bid: must be between 0 and 13
  if (bid < 0 || bid > 13) {
    errors.bid = 'Bid must be between 0 and 13';
    isValid = false;
  }

  // Validate tricks: must be between 0 and current round (max 13)
  const maxTricks = Math.min(gameState.currentRound, 13);
  if (tricks < 0 || tricks > maxTricks) {
    errors.tricks = `Tricks must be between 0 and ${maxTricks} (current round: ${gameState.currentRound})`;
    isValid = false;
  }

  return { isValid, errors };
}

/**
 * Handle Calculate Score button click
 */
function handleCalculateScore() {
  let hasErrors = false;
  const errors = [];

  // Validate all players and collect inputs
  const rows = document.querySelectorAll('.player-row');
  rows.forEach((row, playerIndex) => {
    const validation = validatePlayerInputs(playerIndex);

    if (!validation.isValid) {
      hasErrors = true;
      errors.push(`${gameState.players[playerIndex].name}: ${Object.values(validation.errors).filter(Boolean).join(', ')}`);
    }
  });

  if (hasErrors) {
    alert('Input validation failed:\n' + errors.join('\n'));
    return;
  }

  // Process each player's score
  rows.forEach((row, playerIndex) => {
    const player = gameState.players[playerIndex];
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');

    const bid = parseInt(bidInput.value, 10) || 0;
    const tricks = parseInt(tricksInput.value, 10) || 0;

    // Only calculate if not already submitted for this round
    if (!player.hasSubmitted) {
      player.bid = bid;
      player.tricks = tricks;

      // Calculate round score using scoring function
      player.roundScore = calculateRoundScore(bid, tricks);
      player.totalScore += player.roundScore;

      // Mark as submitted so clicking button again doesn't re-accumulate
      player.hasSubmitted = true;
    }
  });

  // Update display and persist state
  renderScoreboard();
  saveGameState();
}

/**
 * Handle New Round button click
 */
function handleNewRound() {
  // Validate round number stays within bounds (1-13 for standard Skull King)
  if (gameState.currentRound < 13) {
    gameState.currentRound++;
  }

  // Reset submission flags to allow new scoring for the round
  gameState.players.forEach(player => {
    player.hasSubmitted = false;
    player.bid = 0;
    player.tricks = 0;
    player.roundScore = 0;
  });

  // Clear input fields
  const rows = document.querySelectorAll('.player-row');
  rows.forEach(row => {
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');
    if (bidInput) bidInput.value = '0';
    if (tricksInput) tricksInput.value = '0';
  });

  renderScoreboard();
  saveGameState();
}

/**
 * Render the scoreboard with current game state
 */
function renderScoreboard() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  if (!scoreboardBody) return;

  const rows = scoreboardBody.querySelectorAll('.player-row');

  rows.forEach((row, playerIndex) => {
    if (playerIndex >= gameState.players.length) return;

    const player = gameState.players[playerIndex];
    const roundScoreCell = row.querySelector('.round-score');
    const totalScoreCell = row.querySelector('.total-score');
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');

    // Update score display (not input fields during display, only after calc)
    if (roundScoreCell) {
      roundScoreCell.textContent = player.roundScore;
    }
    if (totalScoreCell) {
      totalScoreCell.textContent = player.totalScore;
    }
  });

  // Update round indicator if exists
  const roundIndicator = document.querySelector('.round-indicator');
  if (roundIndicator) {
    roundIndicator.textContent = `Round ${gameState.currentRound}`;
  }
}

/**
 * Save game state to localStorage
 */
function saveGameState() {
  try {
    localStorage.setItem('skullKingGameState', JSON.stringify(gameState));
  } catch (error) {
    console.warn('Failed to save game state to localStorage:', error);
  }
}

/**
 * Load game state from localStorage
 */
function loadGameState() {
  try {
    const saved = localStorage.getItem('skullKingGameState');
    if (saved) {
      const loadedState = JSON.parse(saved);
      // Merge loaded state with defaults
      if (loadedState.players) {
        gameState.players = loadedState.players;
      }
      if (loadedState.currentRound) {
        gameState.currentRound = loadedState.currentRound;
      }
    }
  } catch (error) {
    console.warn('Failed to load game state from localStorage:', error);
  }
}

/**
 * Reset game to initial state
 */
function resetGame() {
  gameState.currentRound = 1;
  gameState.players.forEach(player => {
    player.bid = 0;
    player.tricks = 0;
    player.roundScore = 0;
    player.totalScore = 0;
    player.hasSubmitted = false;
  });

  const rows = document.querySelectorAll('.player-row');
  rows.forEach(row => {
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');
    if (bidInput) bidInput.value = '0';
    if (tricksInput) tricksInput.value = '0';
  });

  renderScoreboard();
  saveGameState();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
