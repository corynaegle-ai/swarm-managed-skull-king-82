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
