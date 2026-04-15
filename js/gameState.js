/**
 * Game State Management
 * Manages the central game state including current phase, round number, players array, and bids.
 */

// Game state object
let gameState = {
  currentPhase: 'setup', // 'setup', 'bidding', 'scoring'
  currentRound: 1,
  players: [],
  gameComplete: false,
  nextPlayerId: 1
};

/**
 * Initialize the game to its starting state
 * Sets phase to 'setup', round to 1, clears players, and resets gameComplete
 */
function initializeGame() {
  gameState = {
    currentPhase: 'setup',
    currentRound: 1,
    players: [],
    gameComplete: false,
    nextPlayerId: 1
  };
  return gameState;
}

/**
 * Add a player to the game
 * @param {string} name - The player's name
 * @returns {object} The created player object with id, name, score, and currentBid
 */
function addPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Player name must be a non-empty string');
  }

  const player = {
    id: gameState.nextPlayerId,
    name: name.trim(),
    score: 0,
    currentBid: null
  };

  gameState.nextPlayerId += 1;
  gameState.players.push(player);
  return player;
}

/**
 * Get all bids from the current round
 * @returns {array} Array of bid objects with player id and bid amount
 */
function getAllBids() {
  return gameState.players
    .filter(player => player.currentBid !== null && player.currentBid !== undefined)
    .map(player => ({
      playerId: player.id,
      playerName: player.name,
      bid: player.currentBid
    }));
}

/**
 * Advance to the next phase
 * Phase progression: setup -> bidding -> scoring -> setup (next round)
 * After round 10 scoring phase, marks game as complete
 */
function advancePhase() {
  if (gameState.currentPhase === 'setup') {
    gameState.currentPhase = 'bidding';
  } else if (gameState.currentPhase === 'bidding') {
    gameState.currentPhase = 'scoring';
  } else if (gameState.currentPhase === 'scoring') {
    // Check if game is complete after round 10
    if (gameState.currentRound === 10) {
      gameState.gameComplete = true;
      gameState.currentPhase = 'setup'; // Reset phase for consistency
    } else {
      // Advance to next round
      gameState.currentRound += 1;
      gameState.currentPhase = 'setup';
      // Reset bids for next round
      gameState.players.forEach(player => {
        player.currentBid = null;
      });
    }
  }

  return gameState;
}

/**
 * Get the current game state
 * @returns {object} Copy of the current game state
 */
function getCurrentGameState() {
  return {
    currentPhase: gameState.currentPhase,
    currentRound: gameState.currentRound,
    players: [...gameState.players],
    gameComplete: gameState.gameComplete
  };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeGame,
    addPlayer,
    getAllBids,
    advancePhase,
    getCurrentGameState
  };
}
