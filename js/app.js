/**
 * Main application entry point for Skull King game
 * Handles game flow, scoring, and navigation between phases
 */

(function() {
  'use strict';

  /**
   * Application state
   */
  const state = {
    currentPhase: 'bidding', // 'bidding' or 'tricks'
    players: [
      { name: 'Player 1', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
      { name: 'Player 2', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
      { name: 'Player 3', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 },
      { name: 'Player 4', bid: 0, tricks: 0, roundScore: 0, totalScore: 0 }
    ]
  };

  /**
   * Initialize the application
   */
  function init() {
    attachEventListeners();
    loadGameState();
  }

  /**
   * Attach event listeners to interactive elements
   */
  function attachEventListeners() {
    const calculateBtn = document.getElementById('calculate-score-btn');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', handleCalculateScore);
    }
  }

  /**
   * Handle calculate score button click
   * Transitions from bidding phase to tricks entry phase
   */
  function handleCalculateScore() {
    // Validate bids
    const bidInputs = document.querySelectorAll('.bid-input');
    const bids = Array.from(bidInputs).map(input => parseInt(input.value) || 0);
    
    if (!validateBids(bids)) {
      alert('Invalid bid configuration. Please ensure bids are valid.');
      return;
    }

    // Update state with bid values
    state.players.forEach((player, index) => {
      player.bid = bids[index];
    });

    // Save state and navigate to tricks entry
    saveGameState();
    navigateToTricksEntry();
  }

  /**
   * Validate bids configuration
   * @param {number[]} bids - Array of bid values
   * @returns {boolean} - True if bids are valid
   */
  function validateBids(bids) {
    // All bids should be between 0 and 13
    return bids.every(bid => bid >= 0 && bid <= 13);
  }

  /**
   * Navigate to tricks entry page
   * Creates and displays the tricks entry form
   */
  function navigateToTricksEntry() {
    state.currentPhase = 'tricks';
    saveGameState();
    renderTricksEntryForm();
  }

  /**
   * Render the tricks entry form
   */
  function renderTricksEntryForm() {
    const appMain = document.querySelector('.app-main');
    if (!appMain) return;

    const form = createTricksEntryForm();
    appMain.innerHTML = '';
    appMain.appendChild(form);
  }

  /**
   * Create tricks entry form element
   * @returns {HTMLElement} - The tricks entry form container
   */
  function createTricksEntryForm() {
    const container = document.createElement('div');
    container.className = 'tricks-entry-container';

    // Header
    const header = document.createElement('div');
    header.className = 'tricks-entry-header';
    header.innerHTML = `
      <h2>Tricks Entry</h2>
      <p>Enter the number of tricks each player took in this round</p>
    `;
    container.appendChild(header);

    // Form
    const form = document.createElement('form');
    form.className = 'tricks-entry-form';
    form.addEventListener('submit', (e) => e.preventDefault());

    // Player Rows
    const playersSection = document.createElement('div');
    playersSection.className = 'tricks-form-section';

    const playersContainer = document.createElement('div');
    playersContainer.className = 'tricks-players-container';

    state.players.forEach((player, index) => {
      const playerRow = createPlayerTricksRow(player, index);
      playersContainer.appendChild(playerRow);
    });

    playersSection.appendChild(playersContainer);
    form.appendChild(playersSection);

    // Bonus Section
    const bonusSection = createBonusSection();
    form.appendChild(bonusSection);

    // Controls
    const controls = createFormControls();
    form.appendChild(controls);

    container.appendChild(form);
    return container;
  }

  /**
   * Create a single player tricks entry row
   * @param {Object} player - Player data
   * @param {number} index - Player index
   * @returns {HTMLElement} - Player row element
   */
  function createPlayerTricksRow(player, index) {
    const row = document.createElement('div');
    row.className = 'tricks-player-row';
    row.id = `tricks-player-${index}`;

    // Player name
    const nameCell = document.createElement('div');
    nameCell.className = 'tricks-player-name';
    nameCell.textContent = player.name;

    // Bid display
    const bidGroup = document.createElement('div');
    bidGroup.className = 'tricks-input-group';
    bidGroup.innerHTML = `
      <label class="tricks-input-label">Bid</label>
      <div class="tricks-score-display">${player.bid}</div>
    `;

    // Tricks input
    const tricksGroup = document.createElement('div');
    tricksGroup.className = 'tricks-input-group';
    tricksGroup.innerHTML = `
      <label class="tricks-input-label" for="tricks-input-${index}">Tricks Taken</label>
      <input 
        type="number" 
        id="tricks-input-${index}" 
        class="tricks-input-field" 
        data-player-index="${index}"
        min="0" 
        max="13" 
        value="0" 
        aria-label="${player.name} tricks taken"
      >
    `;

    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'tricks-input-group';
    scoreDisplay.innerHTML = `
      <label class="tricks-input-label">Round Score</label>
      <div class="tricks-score-display" id="tricks-score-${index}">0</div>
    `;

    row.appendChild(nameCell);
    row.appendChild(bidGroup);
    row.appendChild(tricksGroup);
    row.appendChild(scoreDisplay);

    // Add event listener for tricks input
    const tricksInput = tricksGroup.querySelector('.tricks-input-field');
    tricksInput.addEventListener('change', () => updatePlayerScore(index));
    tricksInput.addEventListener('input', () => updatePlayerScore(index));

    return row;
  }

  /**
   * Create bonus section
   * @returns {HTMLElement} - Bonus section element
   */
  function createBonusSection() {
    const section = document.createElement('div');
    section.className = 'tricks-form-section tricks-bonus-section';

    const title = document.createElement('div');
    title.className = 'tricks-bonus-title';
    title.textContent = 'Bonuses & Penalties';

    const items = document.createElement('div');
    items.className = 'tricks-bonus-items';

    const bonuses = [
      { id: 'pirate', label: 'Pirate bonus', points: '+20' },
      { id: 'skull-king', label: 'Skull King bonus', points: '+40' },
      { id: 'failed-bid', label: 'Failed bid penalty', points: '-10' },
      { id: 'overtricks', label: 'Overtricks', points: 'variable' }
    ];

    bonuses.forEach(bonus => {
      const item = document.createElement('div');
      item.className = 'tricks-bonus-item';
      item.innerHTML = `
        <input 
          type="checkbox" 
          id="bonus-${bonus.id}" 
          class="tricks-bonus-checkbox" 
          data-bonus-id="${bonus.id}"
        >
        <label for="bonus-${bonus.id}" class="tricks-bonus-label">${bonus.label}</label>
        <span class="tricks-bonus-points">${bonus.points}</span>
      `;
      items.appendChild(item);
    });

    section.appendChild(title);
    section.appendChild(items);
    return section;
  }

  /**
   * Create form controls (buttons)
   * @returns {HTMLElement} - Controls section element
   */
  function createFormControls() {
    const controls = document.createElement('div');
    controls.className = 'tricks-form-controls';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'tricks-btn tricks-btn-success';
    submitBtn.textContent = 'Submit Tricks';
    submitBtn.addEventListener('click', handleSubmitTricks);

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'tricks-btn tricks-btn-secondary';
    backBtn.textContent = 'Back to Bidding';
    backBtn.addEventListener('click', handleBackToBidding);

    controls.appendChild(submitBtn);
    controls.appendChild(backBtn);
    return controls;
  }

  /**
   * Update player score based on bid and tricks
   * @param {number} index - Player index
   */
  function updatePlayerScore(index) {
    const player = state.players[index];
    const tricksInput = document.getElementById(`tricks-input-${index}`);
    const scoreDisplay = document.getElementById(`tricks-score-${index}`);

    if (!tricksInput || !scoreDisplay) return;

    const tricks = parseInt(tricksInput.value) || 0;
    player.tricks = tricks;

    // Calculate round score
    let roundScore = 0;
    if (tricks === player.bid) {
      // Successful bid: bid * 10 + tricks * 1
      roundScore = (player.bid * 10) + tricks;
    } else {
      // Failed bid: -10 for each trick off
      roundScore = -(Math.abs(tricks - player.bid) * 10);
    }

    player.roundScore = roundScore;

    // Update display
    scoreDisplay.textContent = roundScore;
    scoreDisplay.className = 'tricks-score-display';
    if (roundScore > 0) {
      scoreDisplay.classList.add('positive');
    } else if (roundScore < 0) {
      scoreDisplay.classList.add('negative');
    } else {
      scoreDisplay.classList.add('zero');
    }
  }

  /**
   * Handle submit tricks button
   */
  function handleSubmitTricks() {
    // Validate tricks entries
    const tricksInputs = document.querySelectorAll('.tricks-input-field');
    const tricks = Array.from(tricksInputs).map(input => parseInt(input.value) || 0);

    // Update total scores
    state.players.forEach((player, index) => {
      player.totalScore += player.roundScore;
    });

    saveGameState();
    alert('Tricks submitted successfully!');
    // In a real app, this would proceed to the next round or end game screen
    navigateToBidding();
  }

  /**
   * Handle back to bidding button
   */
  function handleBackToBidding() {
    if (confirm('Are you sure? Any tricks entered will be lost.')) {
      navigateToBidding();
    }
  }

  /**
   * Navigate back to bidding phase
   */
  function navigateToBidding() {
    state.currentPhase = 'bidding';
    // Reset tricks for current round
    state.players.forEach(player => {
      player.tricks = 0;
      player.roundScore = 0;
    });
    saveGameState();
    location.reload(); // Reload to show bidding page
  }

  /**
   * Save game state to localStorage
   */
  function saveGameState() {
    try {
      localStorage.setItem('skull-king-state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  /**
   * Load game state from localStorage
   */
  function loadGameState() {
    try {
      const savedState = localStorage.getItem('skull-king-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(state, parsedState);
        
        // If returning to bidding phase, show scoreboard
        if (state.currentPhase === 'bidding') {
          updateScoreboard();
        }
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }

  /**
   * Update scoreboard with current state
   */
  function updateScoreboard() {
    const scoreboardBody = document.getElementById('scoreboard-body');
    if (!scoreboardBody) return;

    const rows = scoreboardBody.querySelectorAll('.player-row');
    rows.forEach((row, index) => {
      if (state.players[index]) {
        const player = state.players[index];
        // Update name
        row.querySelector('.player-name').textContent = player.name;
        // Reset inputs
        row.querySelector('.bid-input').value = 0;
        row.querySelector('.tricks-input').value = 0;
        // Update scores
        row.querySelector('.round-score').textContent = player.roundScore;
        row.querySelector('.total-score').textContent = player.totalScore;
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();