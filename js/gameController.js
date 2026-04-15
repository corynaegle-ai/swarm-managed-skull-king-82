/**
 * Game Controller Module
 * Orchestrates game flow by combining gameState and phaseRenderer modules
 */

import { GameState } from './gameState.js';
import { PhaseRenderer } from './phaseRenderer.js';

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.phaseRenderer = new PhaseRenderer();
    this.phaseContainer = document.getElementById('phase-container');
    this.setupEventListeners();
  }

  /**
   * Initializes and starts the game
   */
  startGame() {
    this.gameState.initializeGame();
    this.updateDisplay();
  }

  /**
   * Sets up event listeners with proper delegation for dynamically created elements
   */
  setupEventListeners() {
    // Event delegation for dynamically created phase elements
    this.phaseContainer.addEventListener('click', (event) => {
      this.handlePhaseContainerClick(event);
    });

    // Listen for game state changes
    document.addEventListener('gameStateChanged', () => {
      this.updateDisplay();
    });
  }

  /**
   * Handles clicks within the phase container using event delegation
   * @param {Event} event - The click event
   */
  handlePhaseContainerClick(event) {
    const target = event.target;

    // Handle bid buttons
    if (target.classList.contains('bid-btn')) {
      const bid = parseInt(target.dataset.bid, 10);
      this.handleBidAction(bid);
    }

    // Handle trick winner selection
    if (target.classList.contains('trick-btn')) {
      const playerId = target.dataset.playerId;
      this.handleTrickWinner(playerId);
    }

    // Handle phase advancement
    if (target.classList.contains('next-phase-btn')) {
      this.handlePhaseTransition();
    }
  }

  /**
   * Handles bid actions from players
   * @param {number} bid - The bid amount
   */
  handleBidAction(bid) {
    const currentPlayer = this.gameState.getCurrentPlayer();
    if (currentPlayer) {
      this.gameState.recordBid(currentPlayer.id, bid);
      this.gameState.advancePlayer();
      this.updateDisplay();
    }
  }

  /**
   * Handles trick winner selection
   * @param {string} playerId - The ID of the player who won the trick
   */
  handleTrickWinner(playerId) {
    this.gameState.recordTrickWinner(playerId);
    this.gameState.advanceToNextTrick();
    this.updateDisplay();
  }

  /**
   * Handles phase transitions in the game flow
   * Advances game state and updates the display
   */
  handlePhaseTransition() {
    const currentPhase = this.gameState.getCurrentPhase();
    this.gameState.advancePhase();
    const nextPhase = this.gameState.getCurrentPhase();

    if (nextPhase === 'ended') {
      this.handleGameEnd();
    } else {
      this.updateDisplay();
    }
  }

  /**
   * Handles end-of-game logic
   */
  handleGameEnd() {
    this.gameState.calculateFinalScores();
    this.updateDisplay();
  }

  /**
   * Updates the display based on current game state
   * Re-renders the phase container with current game information
   */
  updateDisplay() {
    const currentPhase = this.gameState.getCurrentPhase();
    const gameData = this.gameState.getGameData();

    // Clear the phase container
    this.phaseContainer.innerHTML = '';

    // Render appropriate phase UI
    switch (currentPhase) {
      case 'setup':
        this.phaseRenderer.renderSetup(this.phaseContainer, gameData);
        break;
      case 'bidding':
        this.phaseRenderer.renderBidding(this.phaseContainer, gameData);
        break;
      case 'playing':
        this.phaseRenderer.renderPlaying(this.phaseContainer, gameData);
        break;
      case 'scoring':
        this.phaseRenderer.renderScoring(this.phaseContainer, gameData);
        break;
      case 'ended':
        this.phaseRenderer.renderGameEnd(this.phaseContainer, gameData);
        break;
      default:
        console.warn(`Unknown phase: ${currentPhase}`);
    }
  }
}
/**
 * Game Controller
 * Orchestrates game flow by managing phases and coordinating between gameState and phaseRenderer
 */

import { GameState } from './gameState.js';
import { PhaseRenderer } from './phaseRenderer.js';

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.phaseRenderer = new PhaseRenderer();
    this.currentPhase = 'setup';
    this.currentRound = 1;
    this.phaseTransitionInProgress = false;
    this.attachEventListeners();
  }

  /**
   * Start the game by rendering the initial setup phase
   */
  startGame() {
    this.phaseRenderer.renderPhase(this.currentPhase, this.gameState.getGameState());
  }

  /**
   * Attach event listeners for game interactions
   */
  attachEventListeners() {
    document.addEventListener('addPlayer', (event) => {
      this.handleAddPlayer(event.detail);
    });

    document.addEventListener('submitBids', () => {
      this.handleSubmitBids();
    });

    document.addEventListener('submitTricks', () => {
      this.handleSubmitTricks();
    });

    document.addEventListener('calculateScore', () => {
      this.handleCalculateScore();
    });
  }

  /**
   * Handle adding a new player
   */
  handleAddPlayer(playerName) {
    try {
      if (!playerName || playerName.trim() === '') {
        throw new Error('Player name cannot be empty');
      }

      this.gameState.addPlayer(playerName.trim());
      this.updateDisplay();

      // Check if we have 2+ players to transition to bidding
      if (this.gameState.getPlayers().length >= 2 && this.currentPhase === 'setup') {
        this.handlePhaseTransition('bidding');
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  }

  /**
   * Handle bid submission
   */
  handleSubmitBids() {
    try {
      const state = this.gameState.getGameState();
      const bids = state.currentRoundBids || {};

      // Check if all players have submitted bids
      const allPlayersHaveBids = state.players.every((player) => bids[player.id] !== undefined);

      if (!allPlayersHaveBids) {
        console.warn('Not all players have submitted bids');
        return;
      }

      // All bids collected, transition to tricks phase
      this.handlePhaseTransition('tricks');
    } catch (error) {
      console.error('Error submitting bids:', error);
    }
  }

  /**
   * Handle tricks submission
   */
  handleSubmitTricks() {
    try {
      const state = this.gameState.getGameState();
      const tricks = state.currentRoundTricks || {};

      // Check if all players have submitted tricks
      const allPlayersHaveTricks = state.players.every((player) => tricks[player.id] !== undefined);

      if (!allPlayersHaveTricks) {
        console.warn('Not all players have submitted tricks');
        return;
      }

      // All tricks collected, transition to scoring phase
      this.handlePhaseTransition('scoring');
    } catch (error) {
      console.error('Error submitting tricks:', error);
    }
  }

  /**
   * Handle score calculation
   */
  handleCalculateScore() {
    try {
      this.gameState.calculateRoundScore();
      this.updateDisplay();

      // Schedule transition after displaying results for 2 seconds
      setTimeout(() => {
        this.transitionFromScoring();
      }, 2000);
    } catch (error) {
      console.error('Error calculating score:', error);
    }
  }

  /**
   * Transition from scoring phase to either game completion or next round
   */
  transitionFromScoring() {
    try {
      // Advance the round counter
      this.currentRound += 1;

      // Check if game is complete (after 10 rounds)
      if (this.currentRound > 10) {
        this.handlePhaseTransition('complete');
        return;
      }

      // Reset for next round and go back to setup
      this.gameState.prepareNextRound();
      this.handlePhaseTransition('bidding');
    } catch (error) {
      console.error('Error transitioning from scoring:', error);
    }
  }

  /**
   * Handle phase transitions with validation
   * Enforces the finite state machine: setup → bidding → tricks → scoring → (repeat or complete)
   */
  handlePhaseTransition(nextPhase) {
    if (this.phaseTransitionInProgress) {
      console.warn('Phase transition already in progress');
      return;
    }

    // Validate transition
    const validTransitions = {
      setup: ['bidding'],
      bidding: ['tricks'],
      tricks: ['scoring'],
      scoring: ['bidding', 'complete'],
      complete: []
    };

    if (!validTransitions[this.currentPhase] || !validTransitions[this.currentPhase].includes(nextPhase)) {
      console.error(`Invalid transition: ${this.currentPhase} → ${nextPhase}`);
      return;
    }

    try {
      this.phaseTransitionInProgress = true;
      this.currentPhase = nextPhase;
      this.updateDisplay();
      this.phaseTransitionInProgress = false;
    } catch (error) {
      console.error('Error during phase transition:', error);
      this.phaseTransitionInProgress = false;
    }
  }

  /**
   * Update the display to show current phase
   */
  updateDisplay() {
    try {
      const state = this.gameState.getGameState();
      const displayState = {
        ...state,
        currentPhase: this.currentPhase,
        currentRound: this.currentRound
      };
      this.phaseRenderer.renderPhase(this.currentPhase, displayState);
    } catch (error) {
      console.error('Error updating display:', error);
    }
  }
}
