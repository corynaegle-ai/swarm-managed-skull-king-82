/**
 * Main application controller for Skull King scoring app
 * Connects HTML UI to game logic and manages user interactions
 */

import { calculateScore } from './game.js';

/**
 * Game state object to track scores across rounds
 */
const gameState = {
  players: [
    { name: 'Player 1', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
    { name: 'Player 2', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
    { name: 'Player 3', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
    { name: 'Player 4', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
  ],
};

/**
 * Validates a single input value
 * @param {HTMLInputElement} input - The input element to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateInput(input) {
  const value = parseInt(input.value, 10);
  const min = input.hasAttribute('min') ? parseInt(input.getAttribute('min'), 10) : -Infinity;
  const max = input.hasAttribute('max') ? parseInt(input.getAttribute('max'), 10) : Infinity;

  // Check if value is a valid number
  if (isNaN(value)) {
    input.classList.add('error');
    return false;
  }

  // Check if value is within bounds
  if (value < min || value > max) {
    input.classList.add('error');
    return false;
  }

  // Remove error styling if valid
  input.classList.remove('error');
  return true;
}

/**
 * Validates all inputs in a player row
 * @param {HTMLTableRowElement} row - The player row element
 * @returns {boolean} - True if all inputs in row are valid, false otherwise
 */
function validatePlayerRow(row) {
  const bidInput = row.querySelector('.bid-input');
  const tricksInput = row.querySelector('.tricks-input');

  const bidValid = validateInput(bidInput);
  const tricksValid = validateInput(tricksInput);

  return bidValid && tricksValid;
}

/**
 * Gets player data from a scoreboard row
 * @param {HTMLTableRowElement} row - The player row element
 * @returns {Object} - Object with bid and tricks properties
 */
function getPlayerData(row) {
  const bidInput = row.querySelector('.bid-input');
  const tricksInput = row.querySelector('.tricks-input');

  return {
    bid: parseInt(bidInput.value, 10),
    tricks: parseInt(tricksInput.value, 10),
  };
}

/**
 * Updates the scoreboard display with calculated scores
 * @param {number} playerIndex - Index of the player in gameState.players
 * @param {number} roundScore - The calculated round score
 */
function updateScoreboard(playerIndex, roundScore) {
  // Update game state
  gameState.players[playerIndex].roundScore = roundScore;
  gameState.players[playerIndex].totalScore += roundScore;

  // Get the DOM row for this player
  const rows = document.querySelectorAll('.player-row');
  const row = rows[playerIndex];

  if (!row) {
    console.error(`Player row ${playerIndex} not found in DOM`);
    return;
  }

  // Update round score display
  const roundScoreCell = row.querySelector('.round-score');
  if (roundScoreCell) {
    roundScoreCell.textContent = roundScore.toString();
  }

  // Update total score display
  const totalScoreCell = row.querySelector('.total-score');
  if (totalScoreCell) {
    totalScoreCell.textContent = gameState.players[playerIndex].totalScore.toString();
  }
}

/**
 * Handles the calculate score button click
 * Processes all player inputs and updates scores
 */
function handleCalculateScore() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  if (!scoreboardBody) {
    console.error('Scoreboard body element not found');
    return;
  }

  const rows = scoreboardBody.querySelectorAll('.player-row');
  let hasErrors = false;

  // First pass: validate all inputs
  rows.forEach((row) => {
    if (!validatePlayerRow(row)) {
      hasErrors = true;
    }
  });

  // If there are validation errors, stop processing
  if (hasErrors) {
    console.warn('Invalid input values detected. Please correct errors and try again.');
    return;
  }

  // Second pass: calculate and update scores
  rows.forEach((row, index) => {
    const playerData = getPlayerData(row);

    // Store current input values in game state
    gameState.players[index].bid = playerData.bid;
    gameState.players[index].tricks = playerData.tricks;

    // Calculate the round score
    const roundScore = calculateScore(playerData.bid, playerData.tricks);

    // Update scoreboard display
    updateScoreboard(index, roundScore);
  });
}

/**
 * Sets up input validation with event delegation
 * Validates inputs on change and blur events
 */
function setupInputValidation() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  if (!scoreboardBody) {
    console.error('Scoreboard body element not found during validation setup');
    return;
  }

  // Use event delegation for input validation
  scoreboardBody.addEventListener('change', (event) => {
    if (event.target.classList.contains('bid-input') || event.target.classList.contains('tricks-input')) {
      validateInput(event.target);
    }
  });

  scoreboardBody.addEventListener('blur', (event) => {
    if (event.target.classList.contains('bid-input') || event.target.classList.contains('tricks-input')) {
      validateInput(event.target);
    }
  }, true); // Use capture phase for blur since blur doesn't bubble
}

/**
 * Initializes event listeners for the application
 */
function initializeEventListeners() {
  const calculateBtn = document.getElementById('calculate-score-btn');
  if (!calculateBtn) {
    console.error('Calculate button not found');
    return;
  }

  calculateBtn.addEventListener('click', handleCalculateScore);
}

/**
 * Main initialization function - called when DOM is ready
 */
function initializeApp() {
  try {
    setupInputValidation();
    initializeEventListeners();
    console.log('Skull King app initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

/**
 * Wait for DOM to be fully loaded before initializing
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded (e.g., when script is deferred)
  initializeApp();
}
