/**
 * Skull King Game - Main Application Logic
 * Handles game state management, round progression, and bid collection integration
 */

// Game state object
const gameState = {
  currentRound: 1,
  maxRounds: 13,
  players: [],
  gamePhase: 'setup', // 'setup', 'bidCollection', 'gameplay', 'roundComplete', 'gameComplete'
  bidsCollected: {},
  roundBids: {},
  roundTricks: {},
  scores: {}, // Track cumulative scores
  tricksCounted: false // Track if tricks have been recorded
};

/**
 * Initialize the game
 */
function initializeGame() {
  try {
    // Initialize players from the scoreboard
    const playerRows = document.querySelectorAll('.player-row');
    gameState.players = [];
    gameState.scores = {};
    
    playerRows.forEach((row, index) => {
      const playerName = row.querySelector('.player-name').textContent;
      gameState.players.push({
        id: index,
        name: playerName,
        index: index
      });
      gameState.scores[index] = 0;
    });
    
    // Set initial game phase
    gameState.gamePhase = 'bidCollection';
    gameState.currentRound = 1;
    
    // Start the first round bid collection
    startBidCollection(gameState.currentRound);
  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

/**
 * Start bid collection for a specific round
 * @param {number} roundNumber - The current round number
 */
function startBidCollection(roundNumber) {
  try {
    if (roundNumber < 1 || roundNumber > gameState.maxRounds) {
      console.error(`Invalid round number: ${roundNumber}`);
      return;
    }
    
    // Update game state
    gameState.gamePhase = 'bidCollection';
    gameState.currentRound = roundNumber;
    gameState.roundBids = {};
    gameState.tricksCounted = false;
    
    // Clear previous round inputs
    const bidInputs = document.querySelectorAll('.bid-input');
    const tricksInputs = document.querySelectorAll('.tricks-input');
    const roundScores = document.querySelectorAll('.round-score');
    
    bidInputs.forEach(input => input.value = '0');
    tricksInputs.forEach(input => input.value = '0');
    roundScores.forEach(score => score.textContent = '0');
    
    // Enable bid inputs and disable tricks inputs
    bidInputs.forEach(input => input.disabled = false);
    tricksInputs.forEach(input => input.disabled = true);
    
    // Add event listeners for bid inputs
    bidInputs.forEach((input, index) => {
      input.addEventListener('change', (e) => handleBidInput(index, e));
    });
    
    // Update UI to indicate bid collection phase
    updateBidCollectionUI(roundNumber);
    
    console.log(`Bid collection started for round ${roundNumber}`);
  } catch (error) {
    console.error('Error starting bid collection:', error);
  }
}

/**
 * Handle bid input changes
 * @param {number} playerIndex - Index of the player
 * @param {Event} event - The input change event
 */
function handleBidInput(playerIndex, event) {
  try {
    const bidValue = parseInt(event.target.value) || 0;
    
    // Validate bid value
    if (bidValue < 0 || bidValue > 13) {
      console.warn(`Invalid bid value: ${bidValue}. Must be between 0 and 13.`);
      event.target.value = '0';
      return;
    }
    
    // Store bid in game state
    gameState.roundBids[playerIndex] = bidValue;
    
    console.log(`Player ${playerIndex} bid: ${bidValue}`);
  } catch (error) {
    console.error('Error handling bid input:', error);
  }
}

/**
 * Update UI to reflect bid collection phase
 * @param {number} roundNumber - The current round number
 */
function updateBidCollectionUI(roundNumber) {
  try {
    // Update calculate score button to reflect bid collection phase
    const calculateBtn = document.getElementById('calculate-score-btn');
    if (calculateBtn) {
      calculateBtn.textContent = `Round ${roundNumber}: Enter Bids`;
      calculateBtn.disabled = false;
      
      // Update button to proceed to tricks phase when all bids are entered
      calculateBtn.addEventListener('click', proceedToTricksPhase);
    }
  } catch (error) {
    console.error('Error updating bid collection UI:', error);
  }
}

/**
 * Proceed to tricks phase after bids are collected
 */
function proceedToTricksPhase() {
  try {
    // Validate all bids are entered
    const bidInputs = document.querySelectorAll('.bid-input');
    let allBidsEntered = true;
    
    bidInputs.forEach((input, index) => {
      const bidValue = parseInt(input.value) || 0;
      if (bidValue < 0 || bidValue > 13) {
        console.warn(`Invalid bid for player ${index}: ${bidValue}`);
        allBidsEntered = false;
      }
      gameState.roundBids[index] = bidValue;
    });
    
    if (!allBidsEntered) {
      console.warn('Not all bids have been entered correctly.');
      return;
    }
    
    // Update game phase
    gameState.gamePhase = 'gameplay';
    gameState.tricksCounted = false;
    
    // Enable tricks inputs and disable bid inputs
    bidInputs.forEach(input => input.disabled = true);
    const tricksInputs = document.querySelectorAll('.tricks-input');
    tricksInputs.forEach(input => input.disabled = false);
    
    // Update button to calculate scores
    const calculateBtn = document.getElementById('calculate-score-btn');
    if (calculateBtn) {
      calculateBtn.textContent = 'Calculate Round Score';
      calculateBtn.removeEventListener('click', proceedToTricksPhase);
      calculateBtn.addEventListener('click', calculateRoundScore);
    }
    
    // Add event listeners for tricks inputs
    tricksInputs.forEach((input, index) => {
      input.addEventListener('change', (e) => handleTricksInput(index, e));
    });
    
    console.log('Proceeding to tricks phase.');
  } catch (error) {
    console.error('Error proceeding to tricks phase:', error);
  }
}

/**
 * Handle tricks input changes
 * @param {number} playerIndex - Index of the player
 * @param {Event} event - The input change event
 */
function handleTricksInput(playerIndex, event) {
  try {
    const tricksValue = parseInt(event.target.value) || 0;
    
    // Validate tricks value
    if (tricksValue < 0 || tricksValue > 13) {
      console.warn(`Invalid tricks value: ${tricksValue}. Must be between 0 and 13.`);
      event.target.value = '0';
      return;
    }
    
    // Store tricks in game state
    gameState.roundTricks[playerIndex] = tricksValue;
    
    console.log(`Player ${playerIndex} tricks: ${tricksValue}`);
  } catch (error) {
    console.error('Error handling tricks input:', error);
  }
}

/**
 * Calculate round score and update game state
 */
function calculateRoundScore() {
  try {
    const tricksInputs = document.querySelectorAll('.tricks-input');
    let allTricksEntered = true;
    
    // Collect tricks data
    tricksInputs.forEach((input, index) => {
      const tricksValue = parseInt(input.value) || 0;
      if (tricksValue < 0 || tricksValue > 13) {
        console.warn(`Invalid tricks for player ${index}: ${tricksValue}`);
        allTricksEntered = false;
      }
      gameState.roundTricks[index] = tricksValue;
    });
    
    if (!allTricksEntered) {
      console.warn('Not all tricks have been entered correctly.');
      return;
    }
    
    // Calculate scores for each player
    const playerRows = document.querySelectorAll('.player-row');
    playerRows.forEach((row, index) => {
      const bid = gameState.roundBids[index] || 0;
      const tricks = gameState.roundTricks[index] || 0;
      
      let roundScore = 0;
      if (bid === tricks) {
        // Bid was accurate
        roundScore = 10 + (bid * 5);
      } else {
        // Bid was inaccurate
        roundScore = -Math.abs(bid - tricks) * 5;
      }
      
      // Update cumulative score
      gameState.scores[index] += roundScore;
      
      // Update UI
      const roundScoreCell = row.querySelector('.round-score');
      const totalScoreCell = row.querySelector('.total-score');
      
      if (roundScoreCell) roundScoreCell.textContent = roundScore;
      if (totalScoreCell) totalScoreCell.textContent = gameState.scores[index];
    });
    
    gameState.tricksCounted = true;
    gameState.gamePhase = 'roundComplete';
    
    // Proceed to next round or end game
    proceedToNextRound();
  } catch (error) {
    console.error('Error calculating round score:', error);
  }
}

/**
 * Proceed to the next round or end the game
 */
function proceedToNextRound() {
  try {
    const calculateBtn = document.getElementById('calculate-score-btn');
    
    if (gameState.currentRound >= gameState.maxRounds) {
      // Game is complete
      gameState.gamePhase = 'gameComplete';
      if (calculateBtn) {
        calculateBtn.textContent = 'Game Complete!';
        calculateBtn.disabled = true;
      }
      console.log('Game complete!');
    } else {
      // Start next round
      gameState.currentRound++;
      if (calculateBtn) {
        calculateBtn.textContent = `Next Round (${gameState.currentRound})`;
        calculateBtn.removeEventListener('click', calculateRoundScore);
        calculateBtn.addEventListener('click', () => startBidCollection(gameState.currentRound));
      }
    }
  } catch (error) {
    console.error('Error proceeding to next round:', error);
  }
}

/**
 * Get current game state (for external modules)
 * @returns {Object} Current game state
 */
function getGameState() {
  return { ...gameState };
}

/**
 * Get collected bids for a round
 * @returns {Object} Round bids
 */
function getRoundBids() {
  return { ...gameState.roundBids };
}

/**
 * Set game phase (for external modules)
 * @param {string} phase - The phase to set
 */
function setGamePhase(phase) {
  if (['setup', 'bidCollection', 'gameplay', 'roundComplete', 'gameComplete'].includes(phase)) {
    gameState.gamePhase = phase;
  } else {
    console.error(`Invalid game phase: ${phase}`);
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}
