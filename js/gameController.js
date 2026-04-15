/**
 * Game Flow Controller
 * Orchestrates game flow by combining gameState and phaseRenderer modules
 */

import { GameState } from './gameState.js';
import { PhaseRenderer } from './phaseRenderer.js';

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.phaseRenderer = new PhaseRenderer();
    this.gameContainer = null;
  }

  /**
   * Initializes the game controller with a container element
   * @param {HTMLElement} containerElement - The container to render game UI
   */
  initialize(containerElement) {
    if (!containerElement) {
      throw new Error('Game container element is required');
    }
    this.gameContainer = containerElement;
    this.gameState.initialize();
    this.attachEventListeners();
  }

  /**
   * Starts a new game
   * @param {array} playerNames - Array of player names
   */
  startGame(playerNames) {
    if (!Array.isArray(playerNames) || playerNames.length < 2) {
      throw new Error('At least 2 players are required');
    }

    // Reset and initialize game state
    this.gameState.initialize();
    playerNames.forEach(name => this.gameState.addPlayer(name));

    // Start with bidding phase
    this.gameState.setCurrentPhase('bidding');
    this.updateDisplay();
  }

  /**
   * Handles transitions between game phases
   * @param {string} nextPhase - The phase to transition to
   */
  handlePhaseTransition(nextPhase) {
    const currentPhase = this.gameState.getCurrentPhase();
    const currentRound = this.gameState.getCurrentRound();

    // Validate phase transitions
    const validTransitions = {
      'setup': ['bidding'],
      'bidding': ['scoring'],
      'scoring': ['bidding', 'completion'],
      'completion': []
    };

    if (!validTransitions[currentPhase] || !validTransitions[currentPhase].includes(nextPhase)) {
      throw new Error(`Invalid transition from ${currentPhase} to ${nextPhase}`);
    }

    // Handle phase-specific logic
    if (nextPhase === 'scoring') {
      // Scoring phase requires tricks to be recorded
      const roundData = this.gameState.getRoundData();
      if (!roundData.bids || Object.keys(roundData.bids).length === 0) {
        throw new Error('Cannot transition to scoring without recorded bids');
      }
    } else if (nextPhase === 'bidding' && currentPhase === 'scoring') {
      // Moving from scoring to next round's bidding
      if (currentRound < 10) {
        this.gameState.nextRound();
      } else {
        // If we're at round 10, move to completion instead
        this.gameState.setCurrentPhase('completion');
        this.updateDisplay();
        return;
      }
    }

    this.gameState.setCurrentPhase(nextPhase);
    this.updateDisplay();
  }

  /**
   * Records bids for the current round
   * @param {object} bids - { playerIndex: bidAmount }
   */
  recordBids(bids) {
    this.gameState.recordBids(bids);
    this.updateDisplay();
  }

  /**
   * Records tricks won for the current round and calculates scores
   * @param {object} tricks - { playerIndex: tricksWon }
   */
  recordTricks(tricks) {
    this.gameState.calculateRoundScore(tricks);
    this.updateDisplay();
  }

  /**
   * Updates the game display based on current state
   */
  updateDisplay() {
    if (!this.gameContainer) {
      console.warn('Game container not initialized');
      return;
    }

    const state = this.gameState.getState();
    const currentPhase = state.currentPhase;

    // Clear container
    this.gameContainer.innerHTML = '';

    // Render appropriate phase UI
    if (currentPhase === 'setup') {
      this.phaseRenderer.renderSetup(this.gameContainer, state);
    } else if (currentPhase === 'bidding') {
      this.phaseRenderer.renderBidding(this.gameContainer, state);
    } else if (currentPhase === 'scoring') {
      this.phaseRenderer.renderScoring(this.gameContainer, state);
    } else if (currentPhase === 'completion') {
      this.phaseRenderer.renderCompletion(this.gameContainer, state);
    }
  }

  /**
   * Attaches event listeners for game interactions
   * Uses event delegation for dynamically created elements
   */
  attachEventListeners() {
    if (!this.gameContainer) {
      return;
    }

    // Event delegation: handle dynamically created elements
    this.gameContainer.addEventListener('click', (event) => {
      const target = event.target;

      // Start game button
      if (target.matches('[data-action="start-game"]')) {
        const playerInputs = this.gameContainer.querySelectorAll('[data-player-name]');
        const playerNames = Array.from(playerInputs)
          .map(input => input.value.trim())
          .filter(name => name.length > 0);
        
        if (playerNames.length < 2) {
          alert('Please enter at least 2 player names');
          return;
        }
        
        this.startGame(playerNames);
      }

      // Submit bids button
      if (target.matches('[data-action="submit-bids"]')) {
        const bidInputs = this.gameContainer.querySelectorAll('[data-player-bid]');
        const bids = {};
        bidInputs.forEach(input => {
          const playerIndex = input.dataset.playerIndex;
          const bid = parseInt(input.value) || 0;
          bids[playerIndex] = bid;
        });
        
        this.recordBids(bids);
        this.handlePhaseTransition('scoring');
      }

      // Submit tricks button
      if (target.matches('[data-action="submit-tricks"]')) {
        const trickInputs = this.gameContainer.querySelectorAll('[data-player-tricks]');
        const tricks = {};
        trickInputs.forEach(input => {
          const playerIndex = input.dataset.playerIndex;
          const tricksWon = parseInt(input.value) || 0;
          tricks[playerIndex] = tricksWon;
        });
        
        this.recordTricks(tricks);
        if (this.gameState.getCurrentRound() < 10) {
          this.handlePhaseTransition('bidding');
        } else {
          this.handlePhaseTransition('completion');
        }
      }

      // Next round button
      if (target.matches('[data-action="next-round"]')) {
        if (this.gameState.getCurrentRound() < 10) {
          this.handlePhaseTransition('bidding');
        } else {
          this.handlePhaseTransition('completion');
        }
      }

      // Restart game button
      if (target.matches('[data-action="restart-game"]')) {
        this.gameState.initialize();
        this.gameState.setCurrentPhase('setup');
        this.updateDisplay();
      }
    });
  }

  /**
   * Gets the current game state
   * @returns {object} Current game state
   */
  getState() {
    return this.gameState.getState();
  }
}
/**
 * Game Controller
 * Orchestrates game flow by combining gameState and phaseRenderer modules
 */

import { GameState } from './gameState.js';
import { PhaseRenderer } from './phaseRenderer.js';

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.phaseRenderer = new PhaseRenderer();
    this.phaseContainer = document.getElementById('phase-container');
    
    if (!this.phaseContainer) {
      throw new Error('Phase container element not found');
    }
    
    // Track active timeout to prevent double-advances
    this.advanceRoundTimeout = null;
  }

  /**
   * Starts the game - initializes state and renders setup phase
   */
  startGame() {
    try {
      this.gameState.initialize();
      this.updateDisplay();
    } catch (error) {
      console.error('Failed to start game:', error);
      this.phaseContainer.innerHTML = '<div class="error">Failed to initialize game. Please refresh.</div>';
    }
  }

  /**
   * Handles adding a new player to the setup phase
   */
  handleAddPlayer(event) {
    const nameInput = this.phaseContainer.querySelector('#player-name-input');
    
    if (!nameInput) {
      console.error('Player name input not found');
      return;
    }
    
    const playerName = nameInput.value.trim();
    
    // Input validation
    if (!playerName) {
      alert('Please enter a player name');
      return;
    }
    
    if (playerName.length > 50) {
      alert('Player name is too long (max 50 characters)');
      return;
    }
    
    try {
      this.gameState.addPlayer(playerName);
      nameInput.value = '';
      this.updateDisplay();
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Could not add player: ' + error.message);
    }
  }

  /**
   * Handles start game button click - transitions from setup to bidding
   * Only available when 2+ players are present
   */
  handleStartGameClick(event) {
    const playerCount = this.gameState.getPlayerCount();
    
    if (playerCount < 2) {
      alert('Need at least 2 players to start');
      return;
    }
    
    try {
      this.gameState.setCurrentPhase('bidding');
      this.updateDisplay();
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Could not start game: ' + error.message);
    }
  }

  /**
   * Handles bid submission - collects all player bids
   * When all bids are collected, transitions to scoring
   */
  handleSubmitBids(event) {
    try {
      const bidInputs = this.phaseContainer.querySelectorAll('[data-bid-player]');
      const playerCount = this.gameState.getPlayerCount();
      const bids = {};
      let collectedCount = 0;
      
      // Collect bids from all input fields
      bidInputs.forEach(input => {
        const playerIndex = parseInt(input.dataset.bidPlayer, 10);
        const bidValue = input.value.trim();
        
        if (bidValue === '') {
          throw new Error(`Player ${playerIndex + 1} has not entered a bid`);
        }
        
        const bid = parseInt(bidValue, 10);
        
        // Validate bid range (0-13 for Skull King)
        if (isNaN(bid) || bid < 0 || bid > 13) {
          throw new Error(`Player ${playerIndex + 1} bid must be between 0 and 13`);
        }
        
        bids[playerIndex] = bid;
        collectedCount++;
      });
      
      // Verify all players have bid
      if (collectedCount !== playerCount) {
        throw new Error('Not all players have submitted bids');
      }
      
      // Record bids in game state
      this.gameState.recordBids(bids);
      
      // Transition to scoring phase
      this.gameState.setCurrentPhase('scoring');
      this.updateDisplay();
    } catch (error) {
      console.error('Error submitting bids:', error);
      alert('Error submitting bids: ' + error.message);
    }
  }

  /**
   * Handles trick recording in scoring phase
   * Calculates round score and auto-advances after brief delay
   */
  handleCalculateScore(event) {
    try {
      // Collect tricks from all inputs
      const trickInputs = this.phaseContainer.querySelectorAll('[data-trick-player]');
      const playerCount = this.gameState.getPlayerCount();
      const tricks = {};
      let collectedCount = 0;
      
      trickInputs.forEach(input => {
        const playerIndex = parseInt(input.dataset.trickPlayer, 10);
        const trickValue = input.value.trim();
        
        if (trickValue === '') {
          throw new Error(`Player ${playerIndex + 1} has not entered tricks won`);
        }
        
        const tricks_won = parseInt(trickValue, 10);
        
        // Validate tricks range (0 to current round number)
        const currentRound = this.gameState.getCurrentRound();
        if (isNaN(tricks_won) || tricks_won < 0 || tricks_won > currentRound) {
          throw new Error(`Player ${playerIndex + 1} tricks must be between 0 and ${currentRound}`);
        }
        
        tricks[playerIndex] = tricks_won;
        collectedCount++;
      });
      
      // Verify all players entered tricks
      if (collectedCount !== playerCount) {
        throw new Error('Not all players have entered tricks won');
      }
      
      // Calculate and record round score
      this.gameState.calculateRoundScore(tricks);
      
      // Check if game is complete (after 10 rounds)
      const currentRound = this.gameState.getCurrentRound();
      if (currentRound >= 10) {
        // Show completion screen
        this.gameState.setCurrentPhase('completion');
        this.updateDisplay();
      } else {
        // Auto-advance to next round after brief delay
        this.scheduleRoundAdvance();
      }
    } catch (error) {
      console.error('Error calculating score:', error);
      alert('Error calculating score: ' + error.message);
    }
  }

  /**
   * Schedules the round advance with timeout management
   * Prevents double-advance by clearing any existing timeout
   */
  scheduleRoundAdvance() {
    // Clear any existing timeout
    if (this.advanceRoundTimeout !== null) {
      clearTimeout(this.advanceRoundTimeout);
    }
    
    // Schedule new advance after 2 seconds
    this.advanceRoundTimeout = setTimeout(() => {
      this.advanceRoundTimeout = null;
      this.handleAdvanceRound();
    }, 2000);
  }

  /**
   * Handles advancing to the next round
   * Only executes once per round to prevent double-advance
   */
  handleAdvanceRound(event) {
    try {
      // Move to next round
      this.gameState.nextRound();
      
      // Transition back to bidding phase for new round
      this.gameState.setCurrentPhase('bidding');
      this.updateDisplay();
    } catch (error) {
      console.error('Error advancing round:', error);
      alert('Error advancing round: ' + error.message);
    }
  }

  /**
   * Handles restart game from completion screen
   */
  handleRestartGame(event) {
    // Clear any pending timeout
    if (this.advanceRoundTimeout !== null) {
      clearTimeout(this.advanceRoundTimeout);
      this.advanceRoundTimeout = null;
    }
    
    try {
      this.gameState.initialize();
      this.updateDisplay();
    } catch (error) {
      console.error('Error restarting game:', error);
      alert('Could not restart game: ' + error.message);
    }
  }

  /**
   * Updates the display based on current game state
   * Renders the appropriate phase and sets up event listeners
   */
  updateDisplay() {
    try {
      const currentPhase = this.gameState.getCurrentPhase();
      const gameStateSnapshot = this.gameState.getState();
      
      // Render phase UI
      const html = this.phaseRenderer.renderPhase(currentPhase, gameStateSnapshot);
      
      // Replace phase container content
      this.phaseContainer.innerHTML = html;
      
      // Set up event listeners based on current phase
      this.setupPhaseListeners(currentPhase);
    } catch (error) {
      console.error('Error updating display:', error);
      this.phaseContainer.innerHTML = '<div class="error">Error rendering phase. Check console.</div>';
    }
  }

  /**
   * Sets up event listeners for the current phase
   * Uses event delegation on the phase container
   */
  setupPhaseListeners(currentPhase) {
    // Remove old listeners by replacing container (clean slate)
    const container = this.phaseContainer;
    
    switch (currentPhase) {
      case 'setup':
        // Setup phase: add player and start game
        const addPlayerBtn = container.querySelector('#add-player-btn');
        const playerNameInput = container.querySelector('#player-name-input');
        const startGameBtn = container.querySelector('#start-game-btn');
        
        if (addPlayerBtn) {
          addPlayerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAddPlayer(e);
          });
        }
        
        if (playerNameInput) {
          playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.handleAddPlayer(e);
            }
          });
        }
        
        if (startGameBtn) {
          startGameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleStartGameClick(e);
          });
        }
        break;

      case 'bidding':
        // Bidding phase: submit bids
        const submitBidsBtn = container.querySelector('#submit-bids-btn');
        
        if (submitBidsBtn) {
          submitBidsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmitBids(e);
          });
        }
        break;

      case 'scoring':
        // Scoring phase: calculate score and advance
        const calculateScoreBtn = container.querySelector('#calculate-score-btn');
        const advanceRoundBtn = container.querySelector('#advance-round-btn');
        
        if (calculateScoreBtn) {
          calculateScoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleCalculateScore(e);
          });
        }
        
        if (advanceRoundBtn) {
          advanceRoundBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Only allow manual advance if no auto-advance is pending
            if (this.advanceRoundTimeout === null) {
              this.handleAdvanceRound(e);
            }
          });
        }
        break;

      case 'completion':
        // Completion phase: restart game
        const restartBtn = container.querySelector('#restart-game-btn');
        
        if (restartBtn) {
          restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRestartGame(e);
          });
        }
        break;
    }
  }
}
