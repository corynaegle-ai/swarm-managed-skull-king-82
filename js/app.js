// Import PlayerManager
import PlayerManager from './playerManager.js';

// Initialize PlayerManager
const playerManager = new PlayerManager();

// DOM element references
const app = document.getElementById('app');
const scoreboardBody = document.getElementById('scoreboard-body');
const calculateScoreBtn = document.getElementById('calculate-score-btn');

// Get or create player management UI elements
let addPlayerForm = document.getElementById('add-player-form');
let addPlayerInput = document.getElementById('player-name-input');
let addPlayerBtn = document.getElementById('add-player-btn');
let startGameBtn = document.getElementById('start-game-btn');
let errorMessageDiv = document.getElementById('error-message');

/**
 * Initialize the application
 * This function sets up event listeners and initializes the UI
 */
function initializeApp() {
  // Create player management section if it doesn't exist
  if (!addPlayerForm) {
    createPlayerManagementUI();
  }

  // Set up event listeners
  setupEventListeners();

  // Initial UI state update
  updateStartGameButtonState();
}

/**
 * Create the player management UI section
 */
function createPlayerManagementUI() {
  const playerManagementSection = document.createElement('section');
  playerManagementSection.className = 'player-management-section';
  playerManagementSection.innerHTML = `
    <h2>Manage Players</h2>
    <div class="add-player-form-container">
      <form id="add-player-form" class="add-player-form">
        <input 
          type="text" 
          id="player-name-input" 
          class="player-name-input" 
          placeholder="Enter player name" 
          aria-label="Player name input"
        >
        <button type="submit" id="add-player-btn" class="add-player-btn">Add Player</button>
      </form>
      <div id="error-message" class="error-message" style="display: none;"></div>
    </div>
    <div id="players-list" class="players-list"></div>
    <button id="start-game-btn" class="start-game-btn" disabled>Start Game</button>
  `;

  // Insert player management section after the header
  const header = document.querySelector('.app-header');
  header.parentNode.insertBefore(playerManagementSection, header.nextSibling);

  // Update references
  addPlayerForm = document.getElementById('add-player-form');
  addPlayerInput = document.getElementById('player-name-input');
  addPlayerBtn = document.getElementById('add-player-btn');
  startGameBtn = document.getElementById('start-game-btn');
  errorMessageDiv = document.getElementById('error-message');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Form submission for adding players
  if (addPlayerForm) {
    addPlayerForm.addEventListener('submit', handleAddPlayer);
  }

  // Input enter key for adding players
  if (addPlayerInput) {
    addPlayerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddPlayer(e);
      }
    });
  }

  // Calculate score button
  if (calculateScoreBtn) {
    calculateScoreBtn.addEventListener('click', handleCalculateScore);
  }

  // Start game button
  if (startGameBtn) {
    startGameBtn.addEventListener('click', handleStartGame);
  }
}

/**
 * Handle adding a new player
 */
function handleAddPlayer(e) {
  e.preventDefault();
  clearErrorMessage();

  const playerName = addPlayerInput.value.trim();

  // Validate input
  if (!playerName) {
    showErrorMessage('Please enter a player name.');
    return;
  }

  try {
    playerManager.addPlayer(playerName);
    addPlayerInput.value = '';
    addPlayerInput.focus();
    updatePlayersList();
    updateStartGameButtonState();
  } catch (error) {
    // Handle duplicate name or other errors
    showErrorMessage(error.message);
  }
}

/**
 * Handle removing a player
 */
function handleRemovePlayer(playerId) {
  try {
    playerManager.removePlayer(playerId);
    updatePlayersList();
    updateStartGameButtonState();
    clearErrorMessage();
  } catch (error) {
    showErrorMessage(error.message);
  }
}

/**
 * Handle calculate score button
 */
function handleCalculateScore() {
  // Placeholder for score calculation logic
  console.log('Calculate Score clicked');
}

/**
 * Handle start game button
 */
function handleStartGame() {
  const players = playerManager.getPlayers();
  if (players.length >= 2) {
    console.log('Starting game with players:', players);
    // Game start logic would go here
  }
}

/**
 * Update the players list display
 */
function updatePlayersList() {
  const playersList = document.getElementById('players-list');
  if (!playersList) return;

  const players = playerManager.getPlayers();
  playersList.innerHTML = '';

  if (players.length === 0) {
    playersList.innerHTML = '<p class="no-players-message">No players added yet.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'players-list-items';

  players.forEach((player) => {
    const li = document.createElement('li');
    li.className = 'player-list-item';
    li.innerHTML = `
      <span class="player-list-name">${escapeHtml(player.name)}</span>
      <button 
        class="remove-player-btn" 
        data-player-id="${player.id}" 
        aria-label="Remove ${escapeHtml(player.name)}"
      >
        Remove
      </button>
    `;

    // Add click listener to remove button
    const removeBtn = li.querySelector('.remove-player-btn');
    removeBtn.addEventListener('click', () => {
      handleRemovePlayer(player.id);
    });

    ul.appendChild(li);
  });

  playersList.appendChild(ul);
}

/**
 * Update the Start Game button state
 */
function updateStartGameButtonState() {
  if (!startGameBtn) return;

  const players = playerManager.getPlayers();
  const isEnabled = players.length >= 2 && players.length <= 6;

  startGameBtn.disabled = !isEnabled;

  if (isEnabled) {
    startGameBtn.setAttribute('aria-disabled', 'false');
  } else {
    startGameBtn.setAttribute('aria-disabled', 'true');
  }
}

/**
 * Show an error message to the user
 */
function showErrorMessage(message) {
  if (errorMessageDiv) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
  }
}

/**
 * Clear error message display
 */
function clearErrorMessage() {
  if (errorMessageDiv) {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
