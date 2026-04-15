import { calculateScore } from './scoring.js';

// Game state
const gameState = {
  players: [
    { name: 'Player 1', bids: [], tricks: [], roundScores: [], totalScore: 0 },
    { name: 'Player 2', bids: [], tricks: [], roundScores: [], totalScore: 0 },
    { name: 'Player 3', bids: [], tricks: [], roundScores: [], totalScore: 0 },
    { name: 'Player 4', bids: [], tricks: [], roundScores: [], totalScore: 0 },
  ],
  currentRound: 1,
  roundHistory: {}, // { roundNum: [{ bid, tricks, score }] }
  formLocked: false,
};

const STORAGE_KEY = 'skullKingGameState';
const OLD_STORAGE_KEY = 'skull-king-state'; // for migration

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeApp() {
  loadGameState();
  renderScoreboard();
  attachEventListeners();
}

function loadGameState() {
  // Try to load from new key
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(gameState, parsed);
    } catch (error) {
      console.error('Failed to parse stored game state:', error);
      // Fall through to default gameState
    }
  } else {
    // Try to migrate from old key
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldStored) {
      try {
        const parsed = JSON.parse(oldStored);
        Object.assign(gameState, parsed);
        localStorage.removeItem(OLD_STORAGE_KEY); // Remove old key
        saveGameState(); // Save under new key
      } catch (error) {
        console.error('Failed to migrate old game state:', error);
      }
    }
  }
}

function saveGameState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

// ============================================================================
// DOM MANIPULATION
// ============================================================================

function renderScoreboard() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  const rows = scoreboardBody.querySelectorAll('.player-row');

  rows.forEach((row, playerIndex) => {
    const player = gameState.players[playerIndex];

    // Update player name
    const nameCell = row.querySelector('.player-name');
    if (nameCell) {
      nameCell.textContent = player.name;
    }

    // Update bid input and sync from gameState
    const bidInput = row.querySelector('.bid-input');
    if (bidInput) {
      const currentBid = player.bids[gameState.currentRound - 1];
      if (currentBid !== undefined) {
        bidInput.value = currentBid;
      }
      // Disable if form is locked
      bidInput.disabled = gameState.formLocked;
    }

    // Update tricks input and sync from gameState
    const tricksInput = row.querySelector('.tricks-input');
    if (tricksInput) {
      const currentTricks = player.tricks[gameState.currentRound - 1];
      if (currentTricks !== undefined) {
        tricksInput.value = currentTricks;
      }
      // Disable if form is locked
      tricksInput.disabled = gameState.formLocked;
    }

    // Update round score (from history)
    const roundScoreCell = row.querySelector('.round-score');
    if (roundScoreCell) {
      const roundKey = `round-${gameState.currentRound}`;
      const historyData = gameState.roundHistory[roundKey];
      const roundScore = historyData && historyData[playerIndex] ? historyData[playerIndex].score : 0;
      roundScoreCell.textContent = roundScore;
    }

    // Update total score
    const totalScoreCell = row.querySelector('.total-score');
    if (totalScoreCell) {
      totalScoreCell.textContent = player.totalScore;
    }
  });

  // Update round indicator
  const roundIndicator = document.querySelector('.round-indicator');
  if (roundIndicator) {
    roundIndicator.textContent = `Round ${gameState.currentRound}`;
  }

  updateFormLockUI();
}

function updateFormLockUI() {
  const calculateBtn = document.getElementById('calculate-score-btn');
  if (calculateBtn) {
    calculateBtn.disabled = gameState.formLocked;
    if (gameState.formLocked) {
      calculateBtn.textContent = 'Score Locked - New Round to Continue';
    } else {
      calculateBtn.textContent = 'Calculate Score';
    }
  }
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

function validatePlayerInputs() {
  const scoreboardBody = document.getElementById('scoreboard-body');
  const rows = scoreboardBody.querySelectorAll('.player-row');
  const playerInputs = [];
  const errors = [];

  rows.forEach((row, playerIndex) => {
    const player = gameState.players[playerIndex];
    const bidInput = row.querySelector('.bid-input');
    const tricksInput = row.querySelector('.tricks-input');

    // Validate bid
    const bidValue = bidInput.value.trim();
    if (bidValue === '' || bidValue === null) {
      errors.push(`${player.name}: Bid is required`);
      return;
    }
    const bid = parseInt(bidValue, 10);
    if (isNaN(bid) || bid < 0 || bid > 13) {
      errors.push(`${player.name}: Bid must be between 0 and 13`);
      return;
    }

    // Validate tricks
    const tricksValue = tricksInput.value.trim();
    if (tricksValue === '' || tricksValue === null) {
      errors.push(`${player.name}: Tricks taken is required`);
      return;
    }
    const tricks = parseInt(tricksValue, 10);
    if (isNaN(tricks) || tricks < 0 || tricks > 13) {
      errors.push(`${player.name}: Tricks taken must be between 0 and 13`);
      return;
    }

    playerInputs.push({ playerIndex, player, bid, tricks });
  });

  if (errors.length > 0) {
    alert('Validation Errors:\n' + errors.join('\n'));
    return null;
  }

  return playerInputs;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleCalculateScore() {
  const inputs = validatePlayerInputs();
  if (!inputs) {
    return;
  }

  // Initialize round history if needed
  const roundKey = `round-${gameState.currentRound}`;
  if (!gameState.roundHistory[roundKey]) {
    gameState.roundHistory[roundKey] = [];
  }

  // Calculate and store scores
  inputs.forEach(({ playerIndex, player, bid, tricks }) => {
    const score = calculateScore(bid, tricks);

    // Store bid/tricks for this round
    player.bids[gameState.currentRound - 1] = bid;
    player.tricks[gameState.currentRound - 1] = tricks;

    // Store score in history
    gameState.roundHistory[roundKey][playerIndex] = { bid, tricks, score };

    // Update total score
    player.totalScore += score;
  });

  // Lock the form
  gameState.formLocked = true;

  // Save and re-render
  saveGameState();
  renderScoreboard();
}

function handleNewRound() {
  // Check if we've reached max rounds
  if (gameState.currentRound >= 13) {
    alert('Maximum 13 rounds reached. Please reset the game to play again.');
    return;
  }

  gameState.currentRound += 1;
  gameState.formLocked = false;

  // Save and re-render (preserves history, shows new round inputs)
  saveGameState();
  renderScoreboard();
}

function handleResetGame() {
  const confirm = window.confirm('Are you sure you want to reset the game? All progress will be lost.');
  if (!confirm) {
    return;
  }

  // Reset game state
  gameState.players = [
    { name: 'Player 1', bids: [], tricks: [], roundScores: [], totalScore: 0 },
    { name: 'Player 2', bids: [], tricks: [], roundScores: [], totalScore: 0 },
    { name: 'Player 3', bids: [], tricks: [], roundScores: [], totalScore: 0 },
    { name: 'Player 4', bids: [], tricks: [], roundScores: [], totalScore: 0 },
  ];
  gameState.currentRound = 1;
  gameState.roundHistory = {};
  gameState.formLocked = false;

  // Save and re-render
  saveGameState();
  renderScoreboard();
}

// ============================================================================
// EVENT LISTENER SETUP
// ============================================================================

function attachEventListeners() {
  // Calculate Score button
  const calculateBtn = document.getElementById('calculate-score-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculateScore);
  }

  // New Round button (may not exist in initial HTML, create if needed)
  let newRoundBtn = document.getElementById('new-round-btn');
  if (!newRoundBtn) {
    const controlsDiv = document.querySelector('.scoreboard-controls');
    if (controlsDiv) {
      newRoundBtn = document.createElement('button');
      newRoundBtn.id = 'new-round-btn';
      newRoundBtn.className = 'new-round-btn';
      newRoundBtn.textContent = 'New Round';
      controlsDiv.appendChild(newRoundBtn);
      newRoundBtn.addEventListener('click', handleNewRound);
    }
  } else {
    newRoundBtn.addEventListener('click', handleNewRound);
  }

  // Reset Game button (may not exist in initial HTML, create if needed)
  let resetBtn = document.getElementById('reset-btn');
  if (!resetBtn) {
    const controlsDiv = document.querySelector('.scoreboard-controls');
    if (controlsDiv) {
      resetBtn = document.createElement('button');
      resetBtn.id = 'reset-btn';
      resetBtn.className = 'reset-btn';
      resetBtn.textContent = 'Reset Game';
      controlsDiv.appendChild(resetBtn);
      resetBtn.addEventListener('click', handleResetGame);
    }
  } else {
    resetBtn.addEventListener('click', handleResetGame);
  }
}

// ============================================================================
// APP STARTUP
// ============================================================================

document.addEventListener('DOMContentLoaded', initializeApp);
