/**
 * Game Controller Module
 * Orchestrates game flow by combining gameState and phaseRenderer
 * Manages phase transitions and display updates
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
   * Initialize game and start setup phase
   */
  startGame() {
    this.gameState.initializeGame();
    this.updateDisplay();
  }

  /**
   * Set up all event listeners for game interactions
   * Uses event delegation for dynamically created elements
   */
  setupEventListeners() {
    const appMain = document.querySelector('.app-main');
    
    if (!appMain) {
      console.error('Cannot find .app-main element');
      return;
    }

    // Event delegation for dynamic elements
    appMain.addEventListener('click', (e) => {
      // Add player button
      if (e.target.closest('.add-player-btn')) {
        this.handleAddPlayer();
      }
      
      // Remove player button
      if (e.target.closest('.remove-player-btn')) {
        const playerIndex = parseInt(e.target.closest('.remove-player-btn').dataset.playerIndex);
        this.handleRemovePlayer(playerIndex);
      }
      
      // Submit bid button
      if (e.target.closest('.submit-bid-btn')) {
        this.handleSubmitBid();
      }
      
      // Submit tricks button
      if (e.target.closest('.submit-tricks-btn')) {
        this.handleSubmitTricks();
      }
      
      // Next round button
      if (e.target.closest('.next-round-btn')) {
        this.handleNextRound();
      }
      
      // Restart game button
      if (e.target.closest('.restart-game-btn')) {
        this.handleRestartGame();
      }
    });

    // Original calculate score button if it exists
    const calculateScoreBtn = document.getElementById('calculate-score-btn');
    if (calculateScoreBtn) {
      calculateScoreBtn.addEventListener('click', () => {
        this.handleCalculateScore();
      });
    }
  }

  /**
   * Handle adding a new player
   */
  handleAddPlayer() {
    const playerInput = document.querySelector('.player-name-input');
    if (playerInput && playerInput.value.trim()) {
      this.gameState.addPlayer(playerInput.value.trim());
      playerInput.value = '';
      this.updateDisplay();
      
      // Check if we should transition to bidding phase
      this.handlePhaseTransition();
    }
  }

  /**
   * Handle removing a player
   */
  handleRemovePlayer(playerIndex) {
    this.gameState.removePlayer(playerIndex);
    this.updateDisplay();
  }

  /**
   * Handle submitting bids
   */
  handleSubmitBid() {
    const bidInputs = document.querySelectorAll('.bid-input');
    const bids = Array.from(bidInputs).map((input, index) => {
      const value = parseInt(input.value) || 0;
      return { playerIndex: index, bid: value };
    });

    let allBidsValid = true;
    bids.forEach(({ playerIndex, bid }) => {
      if (!this.gameState.setBid(playerIndex, bid)) {
        allBidsValid = false;
      }
    });

    if (allBidsValid) {
      this.updateDisplay();
      // Check if we should transition to tricks phase
      this.handlePhaseTransition();
    }
  }

  /**
   * Handle submitting tricks taken
   */
  handleSubmitTricks() {
    const trickInputs = document.querySelectorAll('.tricks-input');
    const tricks = Array.from(trickInputs).map((input, index) => {
      const value = parseInt(input.value) || 0;
      return { playerIndex: index, tricks: value };
    });

    let allTricksValid = true;
    tricks.forEach(({ playerIndex, tricks }) => {
      if (!this.gameState.setTricksTaken(playerIndex, tricks)) {
        allTricksValid = false;
      }
    });

    if (allTricksValid) {
      this.gameState.calculateRoundScores();
      this.updateDisplay();
      // Check if we should transition to next round or show completion
      this.handlePhaseTransition();
    }
  }

  /**
   * Handle advancing to the next round
   */
  handleNextRound() {
    if (this.gameState.advanceRound()) {
      this.updateDisplay();
    }
  }

  /**
   * Handle restarting the game
   */
  handleRestartGame() {
    this.gameState.initializeGame();
    this.updateDisplay();
  }

  /**
   * Handle calculate score (legacy button)
   */
  handleCalculateScore() {
    this.gameState.calculateRoundScores();
    this.updateDisplay();
  }

  /**
   * Check current game state and transition phases if needed
   */
  handlePhaseTransition() {
    const currentPhase = this.gameState.getCurrentPhase();
    const numPlayers = this.gameState.getPlayers().length;

    // Transition from setup to bidding when 2+ players added
    if (currentPhase === 'setup' && numPlayers >= 2) {
      this.gameState.transitionToPhase('bidding');
      this.updateDisplay();
    }
    // Transition from bidding to tricks when all bids collected
    else if (currentPhase === 'bidding' && this.gameState.allBidsCollected()) {
      this.gameState.transitionToPhase('tricks');
      this.updateDisplay();
    }
    // Transition from tricks to completion/next round when all tricks collected
    else if (currentPhase === 'tricks' && this.gameState.allTricksCollected()) {
      // Check if game is complete (after round 10)
      if (this.gameState.getCurrentRound() >= 10) {
        this.gameState.transitionToPhase('completion');
      } else {
        this.gameState.transitionToPhase('round_complete');
      }
      this.updateDisplay();
    }
  }

  /**
   * Update the display based on current game state
   * Delegates to phaseRenderer to render the appropriate phase
   */
  updateDisplay() {
    const currentPhase = this.gameState.getCurrentPhase();
    const gameState = this.gameState;

    // Clear previous phase content
    const appMain = document.querySelector('.app-main');
    if (appMain) {
      // Clear phase-specific content (but keep other sections)
      const existingPhaseContent = appMain.querySelector('[data-phase]');
      if (existingPhaseContent) {
        existingPhaseContent.remove();
      }
    }

    // Render phase-specific content
    const phaseContent = this.phaseRenderer.renderPhase(
      currentPhase,
      gameState
    );

    if (appMain && phaseContent) {
      appMain.insertAdjacentHTML('beforeend', phaseContent);
    }

    // Update scoreboard if it exists
    this.updateScoreboard();
  }

  /**
   * Update the scoreboard table with current game data
   */
  updateScoreboard() {
    const scoreboardBody = document.getElementById('scoreboard-body');
    if (!scoreboardBody) return;

    const players = this.gameState.getPlayers();
    
    // Clear existing rows (but keep them for visual consistency)
    const playerRows = scoreboardBody.querySelectorAll('.player-row');
    playerRows.forEach((row, index) => {
      if (index < players.length) {
        const player = players[index];
        const cells = row.querySelectorAll('td');
        
        // Update player name
        cells[0].querySelector('.player-name').textContent = player.name;
        
        // Update bid
        const bidInput = cells[1].querySelector('.bid-input');
        if (bidInput) {
          bidInput.value = player.bid !== null ? player.bid : '';
          bidInput.disabled = this.gameState.getCurrentPhase() === 'tricks' ||
                             this.gameState.getCurrentPhase() === 'round_complete' ||
                             this.gameState.getCurrentPhase() === 'completion';
        }
        
        // Update tricks
        const tricksInput = cells[2].querySelector('.tricks-input');
        if (tricksInput) {
          tricksInput.value = player.tricksTaken !== null ? player.tricksTaken : '';
          tricksInput.disabled = this.gameState.getCurrentPhase() !== 'tricks';
        }
        
        // Update round score
        cells[3].textContent = player.roundScore || 0;
        
        // Update total score
        cells[4].textContent = player.totalScore || 0;
      } else {
        row.style.display = 'none';
      }
    });
  }
}
