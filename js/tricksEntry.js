/**
 * Tricks Entry Module - Handles tricks entry form functionality
 * Implements validation, bonus calculation, round scoring, and game state management
 */

const tricksEntry = (() => {
  // Private state
  let currentRound = 1;
  let playerBids = {};
  let playerTricks = {};
  let playerScores = {};
  let roundScores = {};

  /**
   * Validates that tricks entered are within valid range (0 to round number)
   * @param {number} tricks - Number of tricks claimed
   * @param {number} roundNumber - Current round number
   * @returns {object} {valid: boolean, error: string|null}
   */
  const validateTricksEntry = (tricks, roundNumber) => {
    // Input validation
    if (tricks === null || tricks === undefined || tricks === '') {
      return {
        valid: false,
        error: 'Tricks entry cannot be empty'
      };
    }

    const tricksNum = parseInt(tricks, 10);

    // Check for NaN
    if (isNaN(tricksNum)) {
      return {
        valid: false,
        error: 'Tricks must be a valid number'
      };
    }

    // Check for negative numbers
    if (tricksNum < 0) {
      return {
        valid: false,
        error: 'Tricks cannot be negative'
      };
    }

    // Check for exceeding round number
    if (tricksNum > roundNumber) {
      return {
        valid: false,
        error: `Tricks cannot exceed round number (${roundNumber})`
      };
    }

    return {
      valid: true,
      error: null
    };
  };

  /**
   * Calculates bonus points - bonus only applies when actual tricks equal bid exactly
   * @param {number} bid - Initial bid for the round
   * @param {number} actualTricks - Actual tricks won
   * @returns {number} Bonus points (0 if no bonus, otherwise bonus value)
   */
  const calculateBonus = (bid, actualTricks) => {
    // No bonus if tricks don't match bid
    if (bid !== actualTricks) {
      return 0;
    }

    // Bonus is awarded for matching bid exactly
    // Standard bonus calculation: 10 points for matching bid
    const bonusPoints = 10;
    return bonusPoints;
  };

  /**
   * Calculates total round score for a player
   * Score = tricks taken + bonus (if applicable) + penalties (if missed bid)
   * @param {number} bid - Initial bid
   * @param {number} actualTricks - Actual tricks won
   * @returns {number} Total round score
   */
  const calculateRoundScore = (bid, actualTricks) => {
    let score = 0;

    // Base score: tricks taken
    score = actualTricks;

    // Apply bonus if tricks match bid exactly
    const bonus = calculateBonus(bid, actualTricks);
    score += bonus;

    // Apply penalty if bid was missed
    if (bid !== actualTricks) {
      // Standard penalty: -10 for missing bid
      const penalty = -10;
      score += penalty;
    }

    return score;
  };

  /**
   * Calculates total scores for all players in the round
   * @param {object} roundData - Object with player IDs as keys and {bid, actualTricks} as values
   * @returns {object} Player scores for the round
   */
  const calculateRoundScores = (roundData) => {
    const scores = {};

    for (const playerId in roundData) {
      if (roundData.hasOwnProperty(playerId)) {
        const { bid, actualTricks } = roundData[playerId];

        // Validate the tricks entry
        const validation = validateTricksEntry(actualTricks, currentRound);
        if (!validation.valid) {
          throw new Error(`Validation error for player ${playerId}: ${validation.error}`);
        }

        // Calculate score for this player
        scores[playerId] = calculateRoundScore(bid, actualTricks);
      }
    }

    return scores;
  };

  /**
   * Updates game state with round results and advances to next round
   * Saves to localStorage for persistence
   * @param {object} roundResults - Player scores for the completed round
   * @returns {object} Updated game state
   */
  const updateGameState = (roundResults) => {
    // Store round scores
    roundScores[currentRound] = roundResults;

    // Update cumulative player scores
    for (const playerId in roundResults) {
      if (roundResults.hasOwnProperty(playerId)) {
        if (!playerScores[playerId]) {
          playerScores[playerId] = 0;
        }
        playerScores[playerId] += roundResults[playerId];
      }
    }

    // Save game state to localStorage
    const gameState = {
      currentRound,
      playerScores,
      roundScores,
      playerBids,
      playerTricks
    };

    try {
      localStorage.setItem('skullKingGameState', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
      throw new Error('Failed to persist game state');
    }

    // Advance to next round
    currentRound++;

    return {
      currentRound,
      playerScores,
      roundScores
    };
  };

  /**
   * Displays calculated scores for review before final confirmation
   * @param {object} roundData - Object with player data including calculated scores
   * @returns {string} HTML representation of scores for display
   */
  const displayCalculatedScores = (roundData) => {
    let html = '<div class="calculated-scores-display">';
    html += '<h3>Round Scores Review</h3>';
    html += '<table class="scores-table">';
    html += '<thead><tr><th>Player</th><th>Bid</th><th>Actual</th><th>Bonus</th><th>Penalty</th><th>Round Score</th></tr></thead>';
    html += '<tbody>';

    for (const playerId in roundData) {
      if (roundData.hasOwnProperty(playerId)) {
        const { bid, actualTricks, playerName } = roundData[playerId];
        const bonus = calculateBonus(bid, actualTricks);
        const penalty = bid !== actualTricks ? -10 : 0;
        const roundScore = calculateRoundScore(bid, actualTricks);

        html += '<tr>';
        html += `<td>${playerName || playerId}</td>`;
        html += `<td>${bid}</td>`;
        html += `<td>${actualTricks}</td>`;
        html += `<td>${bonus > 0 ? '+' + bonus : '-'}</td>`;
        html += `<td>${penalty < 0 ? penalty : '-'}</td>`;
        html += `<td><strong>${roundScore}</strong></td>`;
        html += '</tr>';
      }
    }

    html += '</tbody></table>';
    html += '</div>';

    return html;
  };

  /**
   * Loads game state from localStorage
   * @returns {object} Loaded game state or null if none exists
   */
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem('skullKingGameState');
      if (saved) {
        const state = JSON.parse(saved);
        currentRound = state.currentRound || 1;
        playerScores = state.playerScores || {};
        roundScores = state.roundScores || {};
        playerBids = state.playerBids || {};
        playerTricks = state.playerTricks || {};
        return state;
      }
    } catch (error) {
      console.error('Failed to load game state from localStorage:', error);
    }
    return null;
  };

  /**
   * Resets game state
   */
  const resetGameState = () => {
    currentRound = 1;
    playerBids = {};
    playerTricks = {};
    playerScores = {};
    roundScores = {};
    localStorage.removeItem('skullKingGameState');
  };

  /**
   * Gets current game state
   * @returns {object} Current game state
   */
  const getGameState = () => {
    return {
      currentRound,
      playerScores,
      roundScores,
      playerBids,
      playerTricks
    };
  };

  /**
   * Sets current round number
   * @param {number} roundNumber - New round number
   */
  const setCurrentRound = (roundNumber) => {
    if (roundNumber < 1) {
      throw new Error('Round number must be at least 1');
    }
    currentRound = roundNumber;
  };

  /**
   * Gets current round number
   * @returns {number} Current round number
   */
  const getCurrentRound = () => {
    return currentRound;
  };

  // Public API
  return {
    validateTricksEntry,
    calculateBonus,
    calculateRoundScore,
    calculateRoundScores,
    updateGameState,
    displayCalculatedScores,
    loadGameState,
    resetGameState,
    getGameState,
    setCurrentRound,
    getCurrentRound
  };
})();

// Export for use in Node.js/test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = tricksEntry;
}
