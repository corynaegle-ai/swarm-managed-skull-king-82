// Bid Collection Module
// Manages the bid collection phase of the game

// Initialize bid collection module
const BidCollection = (() => {
  let gameState = {
    bids: {},
    currentRound: null,
    numPlayers: 0
  };

  /**
   * Validates that a bid is within acceptable range
   * @param {number} bid - The bid to validate
   * @param {number} maxBid - Maximum allowed bid (typically the round number)
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateBid = (bid, maxBid) => {
    const bidNum = parseInt(bid, 10);
    
    // Check if bid is a valid number
    if (isNaN(bidNum)) {
      return false;
    }
    
    // Check if bid is within valid range (0 to maxBid)
    if (bidNum < 0 || bidNum > maxBid) {
      return false;
    }
    
    return true;
  };

  /**
   * Displays the bid collection form for all players
   * @param {number} roundNumber - Current round number
   * @param {number} numPlayers - Number of players in the game (defaults to 2)
   */
  const showBidCollection = (roundNumber, numPlayers = 2) => {
    // Validate inputs
    if (typeof roundNumber !== 'number' || roundNumber < 1) {
      console.error('Invalid round number:', roundNumber);
      return;
    }

    gameState.currentRound = roundNumber;
    gameState.numPlayers = numPlayers;
    gameState.bids = {}; // Reset bids for new round

    const container = document.getElementById('bid-collection-container');
    if (!container) {
      console.error('Bid collection container not found in DOM');
      return;
    }

    // Clear previous content
    container.innerHTML = '';

    // Create round info section
    const roundInfo = document.createElement('div');
    roundInfo.className = 'bid-round-info';
    roundInfo.innerHTML = `
      <h2>Bid Collection</h2>
      <p class="round-number">Round <span id="round-display">${roundNumber}</span></p>
      <p class="max-bid-info">Maximum bid: <span id="max-bid-display">${roundNumber}</span></p>
    `;
    container.appendChild(roundInfo);

    // Create form section
    const form = document.createElement('form');
    form.id = 'bid-form';
    form.className = 'bid-form';

    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'bid-inputs-container';

    // Create input field for each player
    for (let i = 1; i <= numPlayers; i++) {
      const playerGroup = document.createElement('div');
      playerGroup.className = 'player-bid-group';

      const label = document.createElement('label');
      label.htmlFor = `player-${i}-bid`;
      label.textContent = `Player ${i} Bid:`;

      const input = document.createElement('input');
      input.type = 'number';
      input.id = `player-${i}-bid`;
      input.name = `player-${i}-bid`;
      input.min = '0';
      input.max = roundNumber;
      input.placeholder = `0-${roundNumber}`;
      input.className = 'bid-input';
      input.required = true;

      const errorMsg = document.createElement('span');
      errorMsg.id = `error-player-${i}`;
      errorMsg.className = 'bid-error-message';
      errorMsg.textContent = '';
      errorMsg.style.display = 'none';

      playerGroup.appendChild(label);
      playerGroup.appendChild(input);
      playerGroup.appendChild(errorMsg);

      inputsContainer.appendChild(playerGroup);
    }

    form.appendChild(inputsContainer);

    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'bid-submit-btn';
    submitBtn.textContent = 'Submit All Bids';

    form.appendChild(submitBtn);

    // Add form submit event handler
    form.addEventListener('submit', handleFormSubmit);

    container.appendChild(form);
  };

  /**
   * Handles form submission for bid collection
   * @param {Event} event - The form submission event
   */
  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    if (validateAndCollectBids()) {
      // All bids are valid - show summary
      displayBidSummary();
    }
  };

  /**
   * Validates all bids and collects them if valid
   * @returns {boolean} - True if all bids are valid, false otherwise
   */
  const validateAndCollectBids = () => {
    const maxBid = gameState.currentRound;
    let allValid = true;
    gameState.bids = {};

    // Validate and collect each player's bid
    for (let i = 1; i <= gameState.numPlayers; i++) {
      const input = document.getElementById(`player-${i}-bid`);
      const errorElement = document.getElementById(`error-player-${i}`);
      const bid = input.value.trim();

      if (!bid) {
        errorElement.textContent = 'Please enter a bid';
        errorElement.style.display = 'block';
        input.classList.add('bid-input-error');
        allValid = false;
        continue;
      }

      if (!validateBid(bid, maxBid)) {
        errorElement.textContent = `Bid must be between 0 and ${maxBid}`;
        errorElement.style.display = 'block';
        input.classList.add('bid-input-error');
        allValid = false;
        continue;
      }

      // Bid is valid
      gameState.bids[`player${i}`] = parseInt(bid, 10);
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      input.classList.remove('bid-input-error');
    }

    return allValid;
  };

  /**
   * Displays a summary of collected bids for player verification
   */
  const displayBidSummary = () => {
    const container = document.getElementById('bid-collection-container');
    const form = document.getElementById('bid-form');
    
    if (!form) return;

    // Hide form
    form.style.display = 'none';

    // Create summary section
    const summary = document.createElement('div');
    summary.className = 'bid-summary';
    summary.innerHTML = '<h3>Bids Collected</h3>';

    const bidsList = document.createElement('ul');
    bidsList.className = 'bids-list';

    Object.entries(gameState.bids).forEach(([player, bid]) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${player.charAt(0).toUpperCase() + player.slice(1)}: ${bid}`;
      bidsList.appendChild(listItem);
    });

    summary.appendChild(bidsList);

    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'bid-edit-btn';
    editBtn.textContent = 'Edit Bids';
    editBtn.addEventListener('click', () => {
      form.style.display = 'block';
      summary.style.display = 'none';
    });

    summary.appendChild(editBtn);
    container.appendChild(summary);
  };

  /**
   * Collects all bids from the current round
   * @returns {Object} - Object containing all player bids
   */
  const collectAllBids = () => {
    if (Object.keys(gameState.bids).length === 0) {
      console.warn('No bids have been collected yet');
      return {};
    }
    return { ...gameState.bids };
  };

  /**
   * Gets the current game state (for testing/debugging)
   * @returns {Object} - Current game state
   */
  const getGameState = () => {
    return { ...gameState };
  };

  /**
   * Resets the bid collection state
   */
  const reset = () => {
    gameState = {
      bids: {},
      currentRound: null,
      numPlayers: 0
    };
  };

  // Public API
  return {
    showBidCollection,
    validateBid,
    collectAllBids,
    getGameState,
    reset
  };
})();

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BidCollection;
}
