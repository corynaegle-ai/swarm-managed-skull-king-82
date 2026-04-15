/**
 * Game State Management
 * Manages the core game state including players, rounds, and scores
 */

export class GameState {
  constructor() {
    this.state = {
      players: [],
      currentPhase: 'setup',
      currentRound: 1,
      roundData: {}, // { roundNum: { bids: {playerIndex: bid}, tricks: {playerIndex: tricks}, scores: {} } }
      totalScores: {} // { playerIndex: totalScore }
    };
  }

  /**
   * Initializes game state to default values
   */
  initialize() {
    this.state = {
      players: [],
      currentPhase: 'setup',
      currentRound: 1,
      roundData: {},
      totalScores: {}
    };
  }

  /**
   * Adds a player to the game
   * @param {string} name - Player name
   */
  addPlayer(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid player name');
    }
    
    // Check if player already exists
    if (this.state.players.some(p => p.name === name)) {
      throw new Error('Player with this name already exists');
    }
    
    const playerIndex = this.state.players.length;
    this.state.players.push({
      index: playerIndex,
      name: name
    });
    
    // Initialize score for new player
    this.state.totalScores[playerIndex] = 0;
  }

  /**
   * Gets the current number of players
   * @returns {number} Player count
   */
  getPlayerCount() {
    return this.state.players.length;
  }

  /**
   * Gets list of all players
   * @returns {array} Player objects
   */
  getPlayers() {
    return [...this.state.players];
  }

  /**
   * Gets the current game phase
   * @returns {string} Current phase (setup, bidding, scoring, completion)
   */
  getCurrentPhase() {
    return this.state.currentPhase;
  }

  /**
   * Sets the current game phase
   * @param {string} phase - Phase name
   */
  setCurrentPhase(phase) {
    const validPhases = ['setup', 'bidding', 'scoring', 'completion'];
    if (!validPhases.includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }
    this.state.currentPhase = phase;
  }

  /**
   * Gets the current round number
   * @returns {number} Current round (1-10)
   */
  getCurrentRound() {
    return this.state.currentRound;
  }

  /**
   * Records bids for the current round
   * @param {object} bids - { playerIndex: bidAmount }
   */
  recordBids(bids) {
    if (!this.state.roundData[this.state.currentRound]) {
      this.state.roundData[this.state.currentRound] = {
        bids: {},
        tricks: {},
        scores: {}
      };
    }
    
    this.state.roundData[this.state.currentRound].bids = bids;
  }

  /**
   * Gets bids for the current round
   * @returns {object} { playerIndex: bidAmount }
   */
  getRoundBids() {
    const roundData = this.state.roundData[this.state.currentRound];
    return (roundData && roundData.bids) || {};
  }

  /**
   * Calculates and records the score for the current round
   * Scoring rules:
   * - If tricks won === bid: 20 + (bid * 10) points
   * - If tricks won !== bid: -(bid * 10) points
   * @param {object} tricks - { playerIndex: tricksWon }
   */
  calculateRoundScore(tricks) {
    if (!this.state.roundData[this.state.currentRound]) {
      throw new Error('No bids recorded for current round');
    }
    
    const bids = this.state.roundData[this.state.currentRound].bids;
    const scores = {};
    
    // Calculate score for each player
    Object.keys(bids).forEach(playerIndex => {
      const bid = bids[playerIndex];
      const tricksWon = tricks[playerIndex];
      
      let roundScore = 0;
      if (tricksWon === bid) {
        roundScore = 20 + (bid * 10);
      } else {
        // Apply penalty for missing bid (including zero-bid cases)
        roundScore = -(bid * 10);
      }
      
      scores[playerIndex] = roundScore;
      
      // Update total score
      if (this.state.totalScores[playerIndex] === undefined) {
        this.state.totalScores[playerIndex] = 0;
      }
      this.state.totalScores[playerIndex] += roundScore;
    });
    
    // Store tricks and scores for this round
    this.state.roundData[this.state.currentRound].tricks = tricks;
    this.state.roundData[this.state.currentRound].scores = scores;
  }

  /**
   * Advances to the next round
   */
  nextRound() {
    if (this.state.currentRound >= 10) {
      throw new Error('Cannot advance past round 10');
    }
    this.state.currentRound++;
  }

  /**
   * Gets the current round data (bids, tricks, scores)
   * @returns {object} Round data
   */
  getRoundData() {
    return this.state.roundData[this.state.currentRound] || { bids: {}, tricks: {}, scores: {} };
  }

  /**
   * Gets total scores for all players
   * @returns {object} { playerIndex: totalScore }
   */
  getTotalScores() {
    return { ...this.state.totalScores };
  }

  /**
   * Gets the complete game state snapshot
   * @returns {object} Game state
   */
  getState() {
    return {
      players: [...this.state.players],
      currentPhase: this.state.currentPhase,
      currentRound: this.state.currentRound,
      roundData: JSON.parse(JSON.stringify(this.state.roundData)),
      totalScores: { ...this.state.totalScores }
    };
  }
}
