import { calculateScore } from './scoring.js';

/**
 * Game state manager - keeps track of current game state
 */
class GameStateManager {
  constructor() {
    this.currentRound = 1;
    this.players = [];
    this.formLocked = false;
    this.init();
  }

  init() {
    this.loadGameState();
    if (this.players.length === 0) {
      this.initializePlayers();
    }
  }

  initializePlayers() {
    this.players = [
      { name: 'Player 1', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
      { name: 'Player 2', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
      { name: 'Player 3', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
      { name: 'Player 4', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 }
    ];
  }

  loadGameState() {
    const saved = localStorage.getItem('skullKingGameState');
    if (saved) {
      const state = JSON.parse(saved);
      this.currentRound = state.currentRound || 1;
      this.players = state.players || [];
      this.formLocked = state.formLocked || false;
    }
  }

  saveGameState() {
    localStorage.setItem('skullKingGameState', JSON.stringify({
      currentRound: this.currentRound,
      players: this.players,
      formLocked: this.formLocked
    }));
  }

  resetGame() {
    this.currentRound = 1;
    this.formLocked = false;
    this.initializePlayers();
    this.saveGameState();
  }

  nextRound() {
    this.currentRound++;
    this.formLocked = false;
    // Reset bid and tricks for new round but keep totalScore
    this.players.forEach(player => {
      player.bid = 0;
      player.tricks = 0;
      player.roundScore = 0;
    });
    this.saveGameState();
  }
}

/**
 * Input validator - validates bid and tricks values
 */
class InputValidator {
  static validatePlayerInputs(bid, tricks) {
    const errors = [];

    const bidNum = parseInt(bid, 10);
    const tricksNum = parseInt(tricks, 10);

    if (bid === '' || tricks === '') {
      errors.push('All bid and tricks values must be filled in.');
      return { valid: false, errors };
    }

    if (isNaN(bidNum) || isNaN(tricksNum)) {
      errors.push('Bid and tricks must be valid numbers.');
      return { valid: false, errors };
    }

    if (bidNum < 0 || bidNum > 13) {
      errors.push('Bid must be between 0 and 13.');
    }

    if (tricksNum < 0 || tricksNum > 13) {
      errors.push('Tricks must be between 0 and 13.');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateAllPlayersInputs(playerRows) {
    const allErrors = [];

    playerRows.forEach((row, index) => {
      const bidInput = row.querySelector('.bid-input');
      const tricksInput = row.querySelector('.tricks-input');

      if (!bidInput || !tricksInput) {
        allErrors.push(`Row ${index + 1}: Input elements not found.`);
        return;
      }

      const { valid, errors } = this.validatePlayerInputs(
        bidInput.value,
        tricksInput.value
      );

      if (!valid) {
        allErrors.push(`Player ${index + 1}: ${errors.join(' ')}`);
      }
    });

    return { valid: allErrors.length === 0, errors: allErrors };
  }
}

/**
 * UI Manager - handles all DOM interactions and updates
 */
class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.calculateBtn = document.getElementById('calculate-score-btn');
    this.scoreBoardBody = document.getElementById('scoreboard-body');
    this.roundIndicator = document.querySelector('.round-indicator');
    this.validationMessage = null;
  }

  getPlayerRows() {
    return Array.from(this.scoreBoardBody.querySelectorAll('.player-row'));
  }

  getPlayerInputs() {
    const playerRows = this.getPlayerRows();
    return playerRows.map((row, index) => ({
      index,
      bidInput: row.querySelector('.bid-input'),
      tricksInput: row.querySelector('.tricks-input'),
      roundScoreCell: row.querySelector('.round-score'),
      totalScoreCell: row.querySelector('.total-score')
    }));
  }

  displayValidationError(errors) {
    this.clearValidationMessage();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'validation-error';
    messageDiv.setAttribute('role', 'alert');
    messageDiv.textContent = errors.join(' ');
    this.scoreBoardBody.parentElement.insertAdjacentElement('beforebegin', messageDiv);
    this.validationMessage = messageDiv;
  }

  clearValidationMessage() {
    if (this.validationMessage) {
      this.validationMessage.remove();
      this.validationMessage = null;
    }
  }

  updateScoreboard() {
    const playerInputs = this.getPlayerInputs();
    playerInputs.forEach(({ index, roundScoreCell, totalScoreCell }) => {
      const player = this.gameState.players[index];
      if (roundScoreCell) roundScoreCell.textContent = player.roundScore;
      if (totalScoreCell) totalScoreCell.textContent = player.totalScore;
    });
  }

  updateRoundIndicator() {
    if (this.roundIndicator) {
      this.roundIndicator.textContent = `Round ${this.gameState.currentRound}`;
    }
  }

  lockInputs() {
    this.getPlayerInputs().forEach(({ bidInput, tricksInput }) => {
      if (bidInput) bidInput.disabled = true;
      if (tricksInput) tricksInput.disabled = true;
    });
  }

  unlockInputs() {
    this.getPlayerInputs().forEach(({ bidInput, tricksInput }) => {
      if (bidInput) bidInput.disabled = false;
      if (tricksInput) tricksInput.disabled = false;
    });
  }

  disableCalculateButton() {
    if (this.calculateBtn) {
      this.calculateBtn.disabled = true;
    }
  }

  enableCalculateButton() {
    if (this.calculateBtn) {
      this.calculateBtn.disabled = false;
    }
  }

  attachEventListeners(onCalculate) {
    if (this.calculateBtn) {
      this.calculateBtn.addEventListener('click', onCalculate);
    }

    // Add input clamping for real-time validation
    this.getPlayerInputs().forEach(({ bidInput, tricksInput }) => {
      if (bidInput) {
        bidInput.addEventListener('change', (e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            e.target.value = Math.max(0, Math.min(13, val));
          }
        });
      }
      if (tricksInput) {
        tricksInput.addEventListener('change', (e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) {
            e.target.value = Math.max(0, Math.min(13, val));
          }
        });
      }
    });
  }
}

/**
 * Main application controller
 */
class SkullKingApp {
  constructor() {
    this.gameState = new GameStateManager();
    this.ui = new UIManager(this.gameState);
    this.init();
  }

  init() {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.renderScoreboard();
    this.attachEventHandlers();
  }

  renderScoreboard() {
    this.ui.updateScoreboard();
    this.ui.updateRoundIndicator();
  }

  attachEventHandlers() {
    this.ui.attachEventListeners(() => this.handleCalculateScore());
  }

  handleCalculateScore() {
    // Clear previous validation messages
    this.ui.clearValidationMessage();

    // Validate all inputs first
    const playerRows = this.ui.getPlayerRows();
    const validation = InputValidator.validateAllPlayersInputs(playerRows);

    if (!validation.valid) {
      this.ui.displayValidationError(validation.errors);
      return;
    }

    // Prevent double-clicking (form already locked)
    if (this.gameState.formLocked) {
      return;
    }

    try {
      // Get current inputs
      const playerInputs = this.ui.getPlayerInputs();
      const currentScores = [];

      // Calculate scores for each player
      playerInputs.forEach(({ index, bidInput, tricksInput }) => {
        const bid = parseInt(bidInput.value, 10);
        const tricks = parseInt(tricksInput.value, 10);

        // Use the scoring module to calculate round score
        const roundScore = calculateScore(bid, tricks);

        currentScores.push({ index, bid, tricks, roundScore });
      });

      // Update game state with new round scores and total scores
      currentScores.forEach(({ index, bid, tricks, roundScore }) => {
        this.gameState.players[index].bid = bid;
        this.gameState.players[index].tricks = tricks;
        this.gameState.players[index].roundScore = roundScore;
        this.gameState.players[index].totalScore += roundScore;
      });

      // Lock the form to prevent re-calculation
      this.gameState.formLocked = true;
      this.ui.lockInputs();
      this.ui.disableCalculateButton();

      // Persist state
      this.gameState.saveGameState();

      // Update UI with new scores
      this.renderScoreboard();

      // Add controls for next round / reset
      this.addRoundControls();
    } catch (error) {
      console.error('Error calculating score:', error);
      this.ui.displayValidationError(['An error occurred while calculating scores. Please try again.']);
    }
  }

  addRoundControls() {
    // Check if controls already exist
    const existingControls = document.querySelector('.round-controls');
    if (existingControls) {
      return;
    }

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'round-controls';

    const newRoundBtn = document.createElement('button');
    newRoundBtn.textContent = 'Next Round';
    newRoundBtn.className = 'new-round-btn';
    newRoundBtn.addEventListener('click', () => this.handleNextRound());

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Game';
    resetBtn.className = 'reset-btn';
    resetBtn.addEventListener('click', () => this.handleResetGame());

    controlsDiv.appendChild(newRoundBtn);
    controlsDiv.appendChild(resetBtn);

    // Find scoreboard-controls container
    const scoreBoardControls = document.querySelector('.scoreboard-controls');
    if (scoreBoardControls) {
      scoreBoardControls.appendChild(controlsDiv);
    } else {
      // Fallback: insert after scoreboard-wrapper
      const scoreBoardWrapper = document.querySelector('.scoreboard-wrapper');
      if (scoreBoardWrapper) {
        scoreBoardWrapper.insertAdjacentElement('afterend', controlsDiv);
      }
    }
  }

  handleNextRound() {
    this.gameState.nextRound();
    this.ui.unlockInputs();
    this.ui.enableCalculateButton();
    this.ui.clearValidationMessage();

    // Clear inputs
    const playerInputs = this.ui.getPlayerInputs();
    playerInputs.forEach(({ bidInput, tricksInput }) => {
      if (bidInput) bidInput.value = '';
      if (tricksInput) tricksInput.value = '';
    });

    // Remove round controls
    const roundControls = document.querySelector('.round-controls');
    if (roundControls) {
      roundControls.remove();
    }

    this.renderScoreboard();
  }

  handleResetGame() {
    if (confirm('Are you sure you want to reset the entire game? All scores will be lost.')) {
      this.gameState.resetGame();
      this.ui.unlockInputs();
      this.ui.enableCalculateButton();
      this.ui.clearValidationMessage();

      // Clear inputs
      const playerInputs = this.ui.getPlayerInputs();
      playerInputs.forEach(({ bidInput, tricksInput }) => {
        if (bidInput) bidInput.value = '';
        if (tricksInput) tricksInput.value = '';
      });

      // Remove round controls
      const roundControls = document.querySelector('.round-controls');
      if (roundControls) {
        roundControls.remove();
      }

      this.renderScoreboard();
    }
  }
}

// Initialize the app when the module loads
const app = new SkullKingApp();
