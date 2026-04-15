/**
 * Game Controller
 * Orchestrates game flow by combining gameState and phaseRenderer
 * Handles phase transitions and user interactions
 */

import { GameState } from './gameState.js';
import { PhaseRenderer } from './phaseRenderer.js';

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.phaseRenderer = new PhaseRenderer();
    this.phaseContainer = document.getElementById('phase-container');
    
    if (!this.phaseContainer) {
      throw new Error('phase-container element not found in DOM');
    }

    // Bind event handlers
    this.handleAddPlayer = this.handleAddPlayer.bind(this);
    this.handleSubmitBid = this.handleSubmitBid.bind(this);
    this.handleCalculateScore = this.handleCalculateScore.bind(this);
    this.handleAdvanceRound = this.handleAdvanceRound.bind(this);
  }

  /**
   * Start the game - initialize state and render setup phase
   */
  startGame() {
    this.gameState.initialize();
    this.setupEventListeners();
    this.updateDisplay();
  }

  /**
   * Setup event delegation for dynamic elements
   */
  setupEventListeners() {
    this.phaseContainer.addEventListener('click', (e) => {
      // Add player button
      if (e.target.id === 'add-player-btn') {
        const nameInput = this.phaseContainer.querySelector('#player-name-input');
        if (nameInput && nameInput.value.trim()) {
          this.handleAddPlayer(nameInput.value.trim());
          nameInput.value = '';
        }
      }

      // Submit bid button
      if (e.target.id === 'submit-bid-btn') {
        const bidInput = this.phaseContainer.querySelector('#bid-input');
        if (bidInput && bidInput.value !== '') {
          this.handleSubmitBid(parseInt(bidInput.value, 10));
        }
      }

      // Calculate score button
      if (e.target.id === 'calculate-score-btn') {
        const trickInputs = this.phaseContainer.querySelectorAll('.trick-input');
        const tricks = {};
        trickInputs.forEach((input) => {
          const playerId = input.dataset.playerId;
          tricks[playerId] = parseInt(input.value, 10) || 0;
        });
        this.handleCalculateScore(tricks);
      }

      // Advance round button
      if (e.target.id === 'advance-round-btn') {
        this.handleAdvanceRound();
      }
    });
  }

  /**
   * Handle adding a new player
   */
  handleAddPlayer(playerName) {
    this.gameState.addPlayer(playerName);
    this.updateDisplay();

    // Transition to bidding when 2+ players are added
    if (this.gameState.getPlayerCount() >= 2 && this.gameState.getCurrentPhase() === 'setup') {
      this.handlePhaseTransition('bidding');
    }
  }

  /**
   * Handle submitting a bid
   */
  handleSubmitBid(bidAmount) {
    const currentPlayerIndex = this.gameState.getCurrentPlayerIndexForBidding();
    if (currentPlayerIndex === null) {
      console.error('No valid player for bidding');
      return;
    }

    this.gameState.recordBid(currentPlayerIndex, bidAmount);
    this.updateDisplay();

    // Check if all bids are collected
    if (this.gameState.allBidsCollected()) {
      // Automatically transition to scoring
      this.handlePhaseTransition('scoring');
    }
  }

  /**
   * Handle calculating score after tricks are submitted
   */
  handleCalculateScore(tricks) {
    this.gameState.calculateRoundScore(tricks);
    this.updateDisplay();

    // Automatically advance after a short delay to show results
    setTimeout(() => {
      this.handleAdvanceRound();
    }, 2000);
  }

  /**
   * Handle advancing to next round or game completion
   */
  handleAdvanceRound() {
    const currentRound = this.gameState.getCurrentRound();

    if (currentRound >= 10) {
      // Game is complete after round 10
      this.handlePhaseTransition('complete');
    } else {
      // Move to next round (back to setup/bidding phase)
      this.gameState.nextRound();
      this.handlePhaseTransition('bidding');
    }
  }

  /**
   * Handle phase transitions
   */
  handlePhaseTransition(newPhase) {
    this.gameState.setCurrentPhase(newPhase);
    this.updateDisplay();
  }

  /**
   * Update the display based on current game state
   */
  updateDisplay() {
    const currentPhase = this.gameState.getCurrentPhase();
    const gameState = this.gameState.getState();

    // Render the appropriate phase UI
    const htmlContent = this.phaseRenderer.renderPhase(currentPhase, gameState);

    // Update the phase container with the rendered HTML
    this.phaseContainer.innerHTML = htmlContent;
  }
}
