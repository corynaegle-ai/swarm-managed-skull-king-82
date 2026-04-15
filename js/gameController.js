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
    this.setupEventListeners();
  }

  /**
   * Initialize and start the game
   */
  startGame() {
    try {
      this.gameState.initialize();
      this.updateDisplay();
      this.phaseRenderer.renderGamePhase(this.gameState.getCurrentPhase());
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  /**
   * Handle transitions between game phases
   * @param {string} nextPhase - The next phase to transition to
   */
  handlePhaseTransition(nextPhase) {
    try {
      const currentPhase = this.gameState.getCurrentPhase();
      
      // Validate phase transition
      if (!this.isValidTransition(currentPhase, nextPhase)) {
        console.warn(`Invalid transition from ${currentPhase} to ${nextPhase}`);
        return;
      }

      // Update game state
      this.gameState.setPhase(nextPhase);
      
      // Render the new phase
      this.phaseRenderer.renderGamePhase(nextPhase);
      
      // Update display
      this.updateDisplay();
    } catch (error) {
      console.error('Error during phase transition:', error);
    }
  }

  /**
   * Update the display based on current game state
   */
  updateDisplay() {
    try {
      const gameState = this.gameState.getState();
      this.phaseRenderer.updateScoreboard(gameState.players, gameState.round);
      this.phaseRenderer.updateGameInfo(gameState);
    } catch (error) {
      console.error('Error updating display:', error);
    }
  }

  /**
   * Validate if a phase transition is allowed
   * @param {string} from - Current phase
   * @param {string} to - Target phase
   * @returns {boolean} - Whether transition is valid
   */
  isValidTransition(from, to) {
    const validTransitions = {
      'setup': ['bidding'],
      'bidding': ['playing'],
      'playing': ['scoring'],
      'scoring': ['bidding', 'gameEnd']
    };

    return validTransitions[from] && validTransitions[from].includes(to);
  }

  /**
   * Set up event listeners for user interactions
   * Uses event delegation for dynamically created elements
   */
  setupEventListeners() {
    const mainContainer = document.getElementById('main-game-container');
    
    if (!mainContainer) {
      console.warn('Main game container not found');
      return;
    }

    // Bid input changes
    mainContainer.addEventListener('change', (event) => {
      if (event.target.classList.contains('bid-input')) {
        this.handleBidInput(event.target);
      }
      if (event.target.classList.contains('tricks-input')) {
        this.handleTricksInput(event.target);
      }
    });

    // Calculate score button
    mainContainer.addEventListener('click', (event) => {
      if (event.target.id === 'calculate-score-btn') {
        this.handleCalculateScore();
      }
    });
  }

  /**
   * Handle bid input changes
   * @param {HTMLInputElement} input - The bid input element
   */
  handleBidInput(input) {
    try {
      const playerIndex = this.getPlayerIndexFromElement(input);
      const bid = parseInt(input.value) || 0;
      this.gameState.updatePlayerBid(playerIndex, bid);
      this.updateDisplay();
    } catch (error) {
      console.error('Error handling bid input:', error);
    }
  }

  /**
   * Handle tricks input changes
   * @param {HTMLInputElement} input - The tricks input element
   */
  handleTricksInput(input) {
    try {
      const playerIndex = this.getPlayerIndexFromElement(input);
      const tricks = parseInt(input.value) || 0;
      this.gameState.updatePlayerTricks(playerIndex, tricks);
      this.updateDisplay();
    } catch (error) {
      console.error('Error handling tricks input:', error);
    }
  }

  /**
   * Handle score calculation
   */
  handleCalculateScore() {
    try {
      this.gameState.calculateRoundScore();
      this.updateDisplay();
      this.handlePhaseTransition('scoring');
    } catch (error) {
      console.error('Error calculating score:', error);
    }
  }

  /**
   * Get player index from a DOM element in the scoreboard
   * @param {HTMLElement} element - The element to check
   * @returns {number} - The player index
   */
  getPlayerIndexFromElement(element) {
    const row = element.closest('.player-row');
    if (!row) {
      throw new Error('Could not find player row for element');
    }
    const rows = Array.from(document.querySelectorAll('.player-row'));
    return rows.indexOf(row);
  }

  /**
   * Get current game state (for debugging)
   * @returns {object} - Current game state
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
    this.appContainer = document.getElementById('app');
    this.mainContainer = document.getElementById('main-game-container');
    this.scoreboardBody = document.getElementById('scoreboard-body');
    this.calculateScoreBtn = document.getElementById('calculate-score-btn');
    this.phaseTransitionTimeout = null;
  }

  /**
   * Initialize and start the game
   */
  startGame() {
    this.gameState.initializeGame();
    this.attachEventListeners();
    this.updateDisplay();
  }

  /**
   * Attach event listeners with proper delegation
   */
  attachEventListeners() {
    // Event delegation for dynamically created elements
    this.mainContainer.addEventListener('click', (e) => {
      // Handle add player button
      if (e.target.id === 'add-player-btn') {
        this.handleAddPlayer();
      }
      // Handle remove player button
      if (e.target.classList.contains('remove-player-btn')) {
        const playerIndex = parseInt(e.target.dataset.playerIndex, 10);
        this.handleRemovePlayer(playerIndex);
      }
      // Handle submit bids button
      if (e.target.id === 'submit-bids-btn') {
        this.handleSubmitBids();
      }
      // Handle submit tricks button
      if (e.target.id === 'submit-tricks-btn') {
        this.handleSubmitTricks();
      }
      // Handle next round button
      if (e.target.id === 'next-round-btn') {
        this.handleNextRound();
      }
      // Handle start new game button
      if (e.target.id === 'start-new-game-btn') {
        this.handleStartNewGame();
      }
    });

    // Calculate score button (separate listener as per existing HTML)
    if (this.calculateScoreBtn) {
      this.calculateScoreBtn.addEventListener('click', () => {
        this.handleCalculateScore();
      });
    }
  }

  /**
   * Handle adding a player
   */
  handleAddPlayer() {
    const playerName = this.phaseRenderer.getPlayerNameInput();
    if (!playerName || playerName.trim() === '') {
      alert('Please enter a player name');
      return;
    }
    this.gameState.addPlayer(playerName);
    this.updateDisplay();
    this.handlePhaseTransition();
  }

  /**
   * Handle removing a player
   */
  handleRemovePlayer(playerIndex) {
    this.gameState.removePlayer(playerIndex);
    this.updateDisplay();
    this.handlePhaseTransition();
  }

  /**
   * Handle submitting bids
   */
  handleSubmitBids() {
    const bids = this.phaseRenderer.getBidsFromUI();
    if (!bids) {
      alert('All players must enter a bid');
      return;
    }
    bids.forEach((bid, index) => {
      this.gameState.setBid(index, bid);
    });
    this.handlePhaseTransition();
  }

  /**
   * Handle submitting tricks taken
   */
  handleSubmitTricks() {
    const tricks = this.phaseRenderer.getTricksFromUI();
    if (!tricks) {
      alert('All players must enter tricks taken');
      return;
    }
    tricks.forEach((trickCount, index) => {
      this.gameState.setTricksTaken(index, trickCount);
    });
    this.handlePhaseTransition();
  }

  /**
   * Handle next round button click
   */
  handleNextRound() {
    this.gameState.advanceRound();
    this.handlePhaseTransition();
  }

  /**
   * Handle start new game button click
   */
  handleStartNewGame() {
    this.gameState.initializeGame();
    this.updateDisplay();
  }

  /**
   * Handle calculate score button click (legacy)
   */
  handleCalculateScore() {
    // This is kept for backward compatibility with existing HTML
    // The main flow uses calculateRoundScores() during phase transitions
    this.gameState.calculateRoundScores();
    this.updateScoreboard();
  }

  /**
   * Handle phase transitions based on game state
   */
  handlePhaseTransition() {
    const currentPhase = this.gameState.getCurrentPhase();
    const playerCount = this.gameState.getPlayers().length;

    // Setup phase: transition to bidding when 2+ players
    if (currentPhase === 'setup' && playerCount >= 2) {
      this.gameState.transitionToPhase('bidding');
      this.updateDisplay();
      return;
    }

    // Setup phase: stay in setup if players drop below 2
    if (currentPhase === 'setup' && playerCount < 2) {
      this.updateDisplay();
      return;
    }

    // Bidding phase: check if all bids collected
    if (currentPhase === 'bidding' && this.gameState.allBidsCollected()) {
      this.gameState.transitionToPhase('tricks');
      this.updateDisplay();
      return;
    }

    // Tricks phase: check if all tricks collected
    if (currentPhase === 'tricks' && this.gameState.allTricksCollected()) {
      this.gameState.calculateRoundScores();
      this.gameState.transitionToPhase('scoring');
      this.updateDisplay();
      // Auto-advance after 2 seconds
      this.schedulePhaseTransition();
      return;
    }

    // Scoring phase: advance to next round or completion
    if (currentPhase === 'scoring') {
      const currentRound = this.gameState.getCurrentRound();
      if (currentRound >= 10) {
        // After round 10 is complete, show completion
        this.gameState.transitionToPhase('completion');
        this.updateDisplay();
      } else {
        // Advance to next round
        this.gameState.advanceRound();
        this.gameState.transitionToPhase('bidding');
        this.updateDisplay();
      }
      return;
    }
  }

  /**
   * Schedule automatic phase transition from scoring to next bidding/completion
   */
  schedulePhaseTransition() {
    // Cancel any existing timeout
    if (this.phaseTransitionTimeout) {
      clearTimeout(this.phaseTransitionTimeout);
    }
    // Schedule transition after 2 seconds
    this.phaseTransitionTimeout = setTimeout(() => {
      this.handlePhaseTransition();
    }, 2000);
  }

  /**
   * Update the display based on current phase
   */
  updateDisplay() {
    const currentPhase = this.gameState.getCurrentPhase();

    // Remove previous phase content
    const oldPhaseElement = this.mainContainer.querySelector('[data-phase]');
    if (oldPhaseElement) {
      oldPhaseElement.remove();
    }

    // Render current phase
    const phaseContent = this.phaseRenderer.renderPhase(
      currentPhase,
      this.gameState
    );

    // Insert phase content before scoreboard section
    const scoreboardSection = this.mainContainer.querySelector('.scoreboard-section');
    if (scoreboardSection) {
      scoreboardSection.insertAdjacentHTML('beforebegin', phaseContent);
    }

    // Update scoreboard
    this.updateScoreboard();
  }

  /**
   * Update scoreboard with current game state
   */
  updateScoreboard() {
    const players = this.gameState.getPlayers();
    const rows = this.scoreboardBody.querySelectorAll('.player-row');

    rows.forEach((row, index) => {
      if (index < players.length) {
        const player = players[index];
        const cells = row.querySelectorAll('td');

        // Update player name
        const playerNameCell = cells[0];
        if (playerNameCell) {
          const playerNameElement = playerNameCell.querySelector('.player-name');
          if (playerNameElement) {
            playerNameElement.textContent = player.name;
          }
        }

        // Update bid
        const bidInput = row.querySelector('.bid-input');
        if (bidInput) {
          bidInput.value = player.bid || 0;
        }

        // Update tricks
        const tricksInput = row.querySelector('.tricks-input');
        if (tricksInput) {
          tricksInput.value = player.tricksTaken || 0;
        }

        // Update round score
        if (cells[3]) {
          cells[3].textContent = player.roundScore || 0;
        }

        // Update total score
        if (cells[4]) {
          cells[4].textContent = player.totalScore || 0;
        }

        // Show row
        row.style.display = '';
      } else {
        // Hide unused rows
        row.style.display = 'none';
      }
    });
  }
}
