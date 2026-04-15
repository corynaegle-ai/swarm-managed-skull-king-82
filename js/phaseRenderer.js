/**
 * Phase Renderer Module
 * Generates DOM elements for each game phase
 * Used by gameController to render UI for Setup, Bidding, Scoring, and Game Complete phases
 */

/**
 * Render Setup Phase
 * Shows player list and Add Player form
 * @param {Array} players - Array of player objects with at least a name property
 * @returns {DocumentFragment} - Fragment containing setup phase UI
 */
function renderSetupPhase(players = []) {
  const fragment = document.createDocumentFragment();

  // Container
  const container = document.createElement('div');
  container.className = 'phase-container setup-phase';
  container.id = 'setup-phase';

  // Phase heading
  const heading = document.createElement('h2');
  heading.className = 'phase-heading';
  heading.textContent = 'Game Setup';
  container.appendChild(heading);

  // Player list section
  const playerListSection = document.createElement('section');
  playerListSection.className = 'player-list-section';

  const playerListHeading = document.createElement('h3');
  playerListHeading.className = 'player-list-heading';
  playerListHeading.textContent = 'Players';
  playerListSection.appendChild(playerListHeading);

  // Player list
  const playerList = document.createElement('ul');
  playerList.className = 'player-list';
  playerList.id = 'player-list';

  if (players && players.length > 0) {
    players.forEach((player, index) => {
      const playerItem = document.createElement('li');
      playerItem.className = 'player-list-item';
      playerItem.setAttribute('data-player-id', index);

      const playerName = document.createElement('span');
      playerName.className = 'player-list-name';
      playerName.textContent = player.name || `Player ${index + 1}`;

      playerItem.appendChild(playerName);
      playerList.appendChild(playerItem);
    });
  }

  playerListSection.appendChild(playerList);
  container.appendChild(playerListSection);

  // Add Player Form
  const formSection = document.createElement('section');
  formSection.className = 'add-player-section';

  const formHeading = document.createElement('h3');
  formHeading.className = 'form-heading';
  formHeading.textContent = 'Add Player';
  formSection.appendChild(formHeading);

  const form = document.createElement('form');
  form.className = 'add-player-form';
  form.id = 'add-player-form';

  // Player name input
  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';

  const label = document.createElement('label');
  label.htmlFor = 'player-name-input';
  label.className = 'form-label';
  label.textContent = 'Player Name';
  formGroup.appendChild(label);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'player-name-input';
  input.className = 'form-input';
  input.placeholder = 'Enter player name';
  input.required = true;
  formGroup.appendChild(input);

  form.appendChild(formGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.id = 'add-player-btn';
  submitBtn.textContent = 'Add Player';
  form.appendChild(submitBtn);

  formSection.appendChild(form);
  container.appendChild(formSection);

  // Start Game button
  const startGameBtn = document.createElement('button');
  startGameBtn.type = 'button';
  startGameBtn.className = 'btn btn-success';
  startGameBtn.id = 'start-game-btn';
  startGameBtn.textContent = 'Start Game';
  startGameBtn.disabled = players.length < 2;
  container.appendChild(startGameBtn);

  fragment.appendChild(container);
  return fragment;
}

/**
 * Render Bidding Phase
 * Shows each player with bid input field
 * @param {Array} players - Array of player objects
 * @param {number} round - Current round number
 * @returns {DocumentFragment} - Fragment containing bidding phase UI
 */
function renderBiddingPhase(players = [], round = 1) {
  const fragment = document.createDocumentFragment();

  // Container
  const container = document.createElement('div');
  container.className = 'phase-container bidding-phase';
  container.id = 'bidding-phase';

  // Phase heading with round info
  const heading = document.createElement('h2');
  heading.className = 'phase-heading';
  heading.textContent = `Round ${round} - Bidding Phase`;
  container.appendChild(heading);

  // Instructions
  const instructions = document.createElement('p');
  instructions.className = 'phase-instructions';
  instructions.textContent = 'Enter your bid for this round (0 is valid)';
  container.appendChild(instructions);

  // Bidding form
  const form = document.createElement('form');
  form.className = 'bidding-form';
  form.id = 'bidding-form';

  // Player bidding inputs
  const playersSection = document.createElement('div');
  playersSection.className = 'bidding-players-section';

  if (players && players.length > 0) {
    players.forEach((player, index) => {
      const playerBidGroup = document.createElement('div');
      playerBidGroup.className = 'bidding-player-group';
      playerBidGroup.setAttribute('data-player-id', index);

      const playerLabel = document.createElement('label');
      playerLabel.className = 'bidding-player-label';
      playerLabel.htmlFor = `bid-input-${index}`;
      playerLabel.textContent = player.name || `Player ${index + 1}`;
      playerBidGroup.appendChild(playerLabel);

      const input = document.createElement('input');
      input.type = 'number';
      input.id = `bid-input-${index}`;
      input.className = 'bid-input-field';
      input.min = '0';
      input.max = '13';
      input.value = '0';
      input.required = true;
      input.setAttribute('data-player-id', index);
      playerBidGroup.appendChild(input);

      playersSection.appendChild(playerBidGroup);
    });
  }

  form.appendChild(playersSection);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.id = 'submit-bids-btn';
  submitBtn.textContent = 'Submit Bids';
  form.appendChild(submitBtn);

  container.appendChild(form);
  fragment.appendChild(container);
  return fragment;
}

/**
 * Render Scoring Phase
 * Displays all bids and score calculation
 * @param {Array} players - Array of player objects with bid and tricks properties
 * @param {number} round - Current round number
 * @returns {DocumentFragment} - Fragment containing scoring phase UI
 */
function renderScoringPhase(players = [], round = 1) {
  const fragment = document.createDocumentFragment();

  // Container
  const container = document.createElement('div');
  container.className = 'phase-container scoring-phase';
  container.id = 'scoring-phase';

  // Phase heading
  const heading = document.createElement('h2');
  heading.className = 'phase-heading';
  heading.textContent = `Round ${round} - Scoring Phase`;
  container.appendChild(heading);

  // Instructions
  const instructions = document.createElement('p');
  instructions.className = 'phase-instructions';
  instructions.textContent = 'Enter tricks taken for each player';
  container.appendChild(instructions);

  // Scoring form
  const form = document.createElement('form');
  form.className = 'scoring-form';
  form.id = 'scoring-form';

  // Score display section
  const scoresSection = document.createElement('div');
  scoresSection.className = 'scoring-section';

  if (players && players.length > 0) {
    players.forEach((player, index) => {
      const playerScoreGroup = document.createElement('div');
      playerScoreGroup.className = 'player-score-group';
      playerScoreGroup.setAttribute('data-player-id', index);

      // Player name and bid
      const playerInfo = document.createElement('div');
      playerInfo.className = 'player-score-info';

      const playerName = document.createElement('h3');
      playerName.className = 'player-score-name';
      playerName.textContent = player.name || `Player ${index + 1}`;
      playerInfo.appendChild(playerName);

      const bidDisplay = document.createElement('p');
      bidDisplay.className = 'player-bid-display';
      bidDisplay.innerHTML = `<strong>Bid:</strong> <span class="bid-value">${player.bid !== undefined ? player.bid : 0}</span>`;
      playerInfo.appendChild(bidDisplay);

      playerScoreGroup.appendChild(playerInfo);

      // Tricks input
      const tricksInputGroup = document.createElement('div');
      tricksInputGroup.className = 'tricks-input-group';

      const tricksLabel = document.createElement('label');
      tricksLabel.className = 'tricks-input-label';
      tricksLabel.htmlFor = `tricks-input-${index}`;
      tricksLabel.textContent = 'Tricks Taken';
      tricksInputGroup.appendChild(tricksLabel);

      const tricksInput = document.createElement('input');
      tricksInput.type = 'number';
      tricksInput.id = `tricks-input-${index}`;
      tricksInput.className = 'tricks-input-field';
      tricksInput.min = '0';
      tricksInput.max = '13';
      tricksInput.value = '0';
      tricksInput.required = true;
      tricksInput.setAttribute('data-player-id', index);
      tricksInputGroup.appendChild(tricksInput);

      playerScoreGroup.appendChild(tricksInputGroup);
      scoresSection.appendChild(playerScoreGroup);
    });
  }

  form.appendChild(scoresSection);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.id = 'submit-scores-btn';
  submitBtn.textContent = 'Calculate Scores';
  form.appendChild(submitBtn);

  container.appendChild(form);
  fragment.appendChild(container);
  return fragment;
}

/**
 * Render Game Complete Screen
 * Shows final scores and winner
 * @param {Array} players - Array of player objects with totalScore property
 * @returns {DocumentFragment} - Fragment containing game complete UI
 */
function renderGameComplete(players = []) {
  const fragment = document.createDocumentFragment();

  // Container
  const container = document.createElement('div');
  container.className = 'phase-container game-complete-phase';
  container.id = 'game-complete-phase';

  // Game over heading
  const heading = document.createElement('h2');
  heading.className = 'phase-heading';
  heading.textContent = 'Game Over!';
  container.appendChild(heading);

  // Find winner
  let winner = null;
  let maxScore = -Infinity;

  if (players && players.length > 0) {
    players.forEach((player) => {
      const score = player.totalScore || 0;
      if (score > maxScore) {
        maxScore = score;
        winner = player;
      }
    });
  }

  // Winner announcement
  if (winner) {
    const winnerSection = document.createElement('section');
    winnerSection.className = 'winner-section';

    const winnerHeading = document.createElement('h3');
    winnerHeading.className = 'winner-heading';
    winnerHeading.textContent = '🎉 Winner 🎉';
    winnerSection.appendChild(winnerHeading);

    const winnerName = document.createElement('p');
    winnerName.className = 'winner-name';
    winnerName.textContent = winner.name || 'Player';
    winnerSection.appendChild(winnerName);

    const winnerScore = document.createElement('p');
    winnerScore.className = 'winner-score';
    winnerScore.innerHTML = `<strong>Final Score:</strong> ${winner.totalScore || 0}`;
    winnerSection.appendChild(winnerScore);

    container.appendChild(winnerSection);
  }

  // Final scores table
  const scoresSection = document.createElement('section');
  scoresSection.className = 'final-scores-section';

  const scoresHeading = document.createElement('h3');
  scoresHeading.className = 'scores-heading';
  scoresHeading.textContent = 'Final Scores';
  scoresSection.appendChild(scoresHeading);

  const table = document.createElement('table');
  table.className = 'final-scores-table';

  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'table-header-row';

  const playerNameHeader = document.createElement('th');
  playerNameHeader.className = 'table-header';
  playerNameHeader.textContent = 'Player';
  headerRow.appendChild(playerNameHeader);

  const scoreHeader = document.createElement('th');
  scoreHeader.className = 'table-header';
  scoreHeader.textContent = 'Score';
  headerRow.appendChild(scoreHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');

  if (players && players.length > 0) {
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      return (b.totalScore || 0) - (a.totalScore || 0);
    });

    sortedPlayers.forEach((player, index) => {
      const row = document.createElement('tr');
      row.className = 'table-body-row';
      if (index === 0) {
        row.classList.add('winner-row');
      }

      const playerNameCell = document.createElement('td');
      playerNameCell.className = 'table-cell player-cell';
      playerNameCell.textContent = player.name || `Player ${index + 1}`;
      row.appendChild(playerNameCell);

      const scoreCell = document.createElement('td');
      scoreCell.className = 'table-cell score-cell';
      scoreCell.textContent = player.totalScore || 0;
      row.appendChild(scoreCell);

      tbody.appendChild(row);
    });
  }

  table.appendChild(tbody);
  scoresSection.appendChild(table);
  container.appendChild(scoresSection);

  // Action buttons
  const buttonsSection = document.createElement('div');
  buttonsSection.className = 'game-complete-buttons';

  const playAgainBtn = document.createElement('button');
  playAgainBtn.type = 'button';
  playAgainBtn.className = 'btn btn-success';
  playAgainBtn.id = 'play-again-btn';
  playAgainBtn.textContent = 'Play Again';
  buttonsSection.appendChild(playAgainBtn);

  const exitBtn = document.createElement('button');
  exitBtn.type = 'button';
  exitBtn.className = 'btn btn-secondary';
  exitBtn.id = 'exit-game-btn';
  exitBtn.textContent = 'Exit Game';
  buttonsSection.appendChild(exitBtn);

  container.appendChild(buttonsSection);
  fragment.appendChild(container);
  return fragment;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderSetupPhase,
    renderBiddingPhase,
    renderScoringPhase,
    renderGameComplete
  };
}
