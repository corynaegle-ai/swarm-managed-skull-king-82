// Import scoring functions
import { updatePlayerScore } from './scoring.js';

// Game state object
const gameState = {
  players: [
    { name: 'Player 1', bid: 0, tricksTaken: 0, roundScore: 0, totalScore: 0 },
    { name: 'Player 2', bid: 0, tricksTaken: 0, roundScore: 0, totalScore: 0 },
    { name: 'Player 3', bid: 0, tricksTaken: 0, roundScore: 0, totalScore: 0 },
    { name: 'Player 4', bid: 0, tricksTaken: 0, roundScore: 0, totalScore: 0 }
  ],
  currentRound: 1,
  maxRounds: 13
};

/**
 * Initialize game state
 */
function initializeGame() {
  gameState.currentRound = 1;
  gameState.players.forEach(player => {
    player.bid = 0;
    player.tricksTaken = 0;
    player.roundScore = 0;
    player.totalScore = 0;
  });
}

/**
 * Process end of round - calculate and update scores for all players
 * using zero bid aware scoring rules
 */
function processRoundEnd() {
  if (!gameState || !gameState.players) {
    console.error('Invalid game state');
    return;
  }

  try {
    // Update score for each player using the zero bid aware scoring function
    gameState.players.forEach((player, index) => {
      const bid = player.bid;
      const tricksTaken = player.tricksTaken;
      const roundNumber = gameState.currentRound;

      // Call updatePlayerScore with player data and round number
      // This function handles both zero bid and regular scoring rules
      const roundScore = updatePlayerScore(
        bid,
        tricksTaken,
        roundNumber
      );

      // Update player's round score and total score
      player.roundScore = roundScore;
      player.totalScore += roundScore;
    });

    // Increment round for next round
    gameState.currentRound++;

    // Update UI with new scores
    updateScoreboard();
  } catch (error) {
    console.error('Error processing round end:', error);
  }
}

/**
 * Update the scoreboard UI with current game state
 */
function updateScoreboard() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  if (!scoreboardBody) {
    console.error('Scoreboard body element not found');
    return;
  }

  const rows = scoreboardBody.querySelectorAll('.player-row');
  if (rows.length !== gameState.players.length) {
    console.error('Mismatch between game state players and DOM rows');
    return;
  }

  rows.forEach((row, index) => {
    const player = gameState.players[index];
    const roundScoreCell = row.querySelector('.round-score');
    const totalScoreCell = row.querySelector('.total-score');

    if (roundScoreCell && totalScoreCell) {
      roundScoreCell.textContent = player.roundScore;
      totalScoreCell.textContent = player.totalScore;
    }
  });
}

/**
 * Get input values from the scoreboard and update game state
 */
function captureRoundInputs() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  if (!scoreboardBody) {
    console.error('Scoreboard body element not found');
    return false;
  }

  const rows = scoreboardBody.querySelectorAll('.player-row');
  if (rows.length !== gameState.players.length) {
    console.error('Mismatch between game state players and DOM rows');
    return false;
  }

  try {
    rows.forEach((row, index) => {
      const bidInput = row.querySelector('.bid-input');
      const tricksInput = row.querySelector('.tricks-input');

      if (bidInput && tricksInput) {
        const bid = parseInt(bidInput.value, 10);
        const tricks = parseInt(tricksInput.value, 10);

        // Validate inputs
        if (isNaN(bid) || isNaN(tricks) || bid < 0 || tricks < 0) {
          console.error(`Invalid input for player ${index + 1}`);
          return false;
        }

        gameState.players[index].bid = bid;
        gameState.players[index].tricksTaken = tricks;
      }
    });
    return true;
  } catch (error) {
    console.error('Error capturing round inputs:', error);
    return false;
  }
}

/**
 * Handle calculate score button click
 */
function handleCalculateScore() {
  if (!captureRoundInputs()) {
    alert('Please enter valid bid and tricks values for all players');
    return;
  }

  processRoundEnd();
}

/**
 * Initialize event listeners
 */
function setupEventListeners() {
  const calculateBtn = document.getElementById('calculate-score-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculateScore);
  } else {
    console.error('Calculate score button not found');
  }
}

/**
 * Main initialization function
 */
function init() {
  try {
    initializeGame();
    setupEventListeners();
    updateScoreboard();
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export functions for testing or external use
export {
  gameState,
  initializeGame,
  processRoundEnd,
  captureRoundInputs,
  handleCalculateScore,
  updateScoreboard
};
