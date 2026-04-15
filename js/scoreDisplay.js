/**
 * ScoreDisplay Class
 * Manages the creation and updating of the game score table
 * Displays player names, round scores (1-10), and running totals
 */
class ScoreDisplay {
  /**
   * Constructor for ScoreDisplay
   * @param {string} containerId - The ID of the container element where the table will be inserted
   */
  constructor(containerId = 'app') {
    this.containerId = containerId;
    this.tableElement = null;
    this.playerData = [];
    this.currentRound = 0;
    this.totalRounds = 10;
    this.validateContainer();
  }

  /**
   * Validates that the container element exists
   * @throws {Error} If container element is not found
   */
  validateContainer() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container with ID '${this.containerId}' not found`);
    }
  }

  /**
   * Creates the HTML table structure for the score display
   * @param {Array} playerNames - Array of player names to display in the table
   * @returns {HTMLTableElement} The created table element
   * @throws {Error} If playerNames is not a valid array or is empty
   */
  createTable(playerNames = []) {
    // Validation
    if (!Array.isArray(playerNames)) {
      throw new Error('playerNames must be an array');
    }

    if (playerNames.length === 0) {
      console.warn('ScoreDisplay: createTable called with empty playerNames array');
      playerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    }

    // Store player data
    this.playerData = playerNames.map(name => ({
      name,
      scores: Array(this.totalRounds).fill(0),
      total: 0
    }));

    // Create table wrapper
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'score-display-wrapper';
    tableWrapper.id = 'score-display-table';

    // Create table
    this.tableElement = document.createElement('table');
    this.tableElement.className = 'score-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'score-table-header-row';

    // Player name header
    const playerHeader = document.createElement('th');
    playerHeader.className = 'score-table-player-column';
    playerHeader.textContent = 'Player';
    headerRow.appendChild(playerHeader);

    // Round headers (1-10)
    for (let i = 1; i <= this.totalRounds; i++) {
      const roundHeader = document.createElement('th');
      roundHeader.className = 'score-table-round-column';
      roundHeader.textContent = `R${i}`;
      roundHeader.setAttribute('data-round', i);
      headerRow.appendChild(roundHeader);
    }

    // Total header
    const totalHeader = document.createElement('th');
    totalHeader.className = 'score-table-total-column';
    totalHeader.textContent = 'Total';
    headerRow.appendChild(totalHeader);

    thead.appendChild(headerRow);
    this.tableElement.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');

    playerNames.forEach((playerName, playerIndex) => {
      const playerRow = document.createElement('tr');
      playerRow.className = 'score-table-player-row';
      playerRow.setAttribute('data-player', playerIndex);

      // Player name cell
      const playerCell = document.createElement('td');
      playerCell.className = 'score-table-player-cell';
      playerCell.textContent = playerName;
      playerRow.appendChild(playerCell);

      // Round score cells
      for (let round = 1; round <= this.totalRounds; round++) {
        const scoreCell = document.createElement('td');
        scoreCell.className = 'score-table-score-cell';
        scoreCell.setAttribute('data-round', round);
        scoreCell.textContent = '0';
        playerRow.appendChild(scoreCell);
      }

      // Total cell
      const totalCell = document.createElement('td');
      totalCell.className = 'score-table-total-cell';
      totalCell.textContent = '0';
      playerRow.appendChild(totalCell);

      tbody.appendChild(playerRow);
    });

    this.tableElement.appendChild(tbody);
    tableWrapper.appendChild(this.tableElement);

    // Insert into container
    const container = document.getElementById(this.containerId);
    const main = container.querySelector('.app-main') || container;
    main.appendChild(tableWrapper);

    return this.tableElement;
  }

  /**
   * Updates the score table with current game data
   * @param {Array} playerData - Array of player data objects with structure: {name, scores: [round1, round2, ...]}
   * @throws {Error} If playerData is invalid or table has not been created
   */
  updateScores(playerData) {
    // Validation
    if (!this.tableElement) {
      throw new Error('Table has not been created. Call createTable() first.');
    }

    if (!Array.isArray(playerData)) {
      throw new Error('playerData must be an array');
    }

    if (playerData.length === 0) {
      console.warn('ScoreDisplay: updateScores called with empty playerData array');
      return;
    }

    // Update player data
    this.playerData = playerData.map((player, index) => ({
      name: player.name || this.playerData[index]?.name || `Player ${index + 1}`,
      scores: Array.isArray(player.scores) ? player.scores : Array(this.totalRounds).fill(0),
      total: player.total || this.calculateTotal(player.scores || [])
    }));

    // Update table rows
    const tbody = this.tableElement.querySelector('tbody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, playerIndex) => {
      if (playerIndex >= this.playerData.length) return;

      const playerInfo = this.playerData[playerIndex];
      const cells = row.querySelectorAll('td');

      // Update round score cells
      for (let round = 0; round < this.totalRounds; round++) {
        const cellIndex = round + 1; // +1 to account for player name cell
        if (cells[cellIndex]) {
          cells[cellIndex].textContent = playerInfo.scores[round] || 0;
        }
      }

      // Update total cell
      const totalCellIndex = this.totalRounds + 1;
      if (cells[totalCellIndex]) {
        cells[totalCellIndex].textContent = playerInfo.total;
      }
    });
  }

  /**
   * Calculates the total score from an array of round scores
   * @param {Array} scores - Array of round scores
   * @returns {number} The sum of all scores
   */
  calculateTotal(scores) {
    return Array.isArray(scores) ? scores.reduce((sum, score) => sum + (score || 0), 0) : 0;
  }

  /**
   * Highlights the current round column visually
   * @param {number} roundNum - The round number to highlight (1-10)
   * @throws {Error} If roundNum is invalid or table has not been created
   */
  highlightCurrentRound(roundNum) {
    // Validation
    if (!this.tableElement) {
      throw new Error('Table has not been created. Call createTable() first.');
    }

    if (typeof roundNum !== 'number' || roundNum < 1 || roundNum > this.totalRounds) {
      throw new Error(`roundNum must be a number between 1 and ${this.totalRounds}`);
    }

    // Update current round
    this.currentRound = roundNum;

    // Remove previous highlighting
    const previousHighlights = this.tableElement.querySelectorAll('.score-current-round');
    previousHighlights.forEach(cell => {
      cell.classList.remove('score-current-round');
    });

    // Add highlighting to current round column
    const roundColumns = this.tableElement.querySelectorAll(`[data-round="${roundNum}"]`);
    roundColumns.forEach(column => {
      column.classList.add('score-current-round');
    });
  }

  /**
   * Displays final scores with special formatting
   * Called after round 10 is complete
   * @throws {Error} If table has not been created
   */
  showFinalScores() {
    // Validation
    if (!this.tableElement) {
      throw new Error('Table has not been created. Call createTable() first.');
    }

    // Mark table as showing final scores
    this.tableElement.classList.add('score-final-scores');

    // Add final scores class to wrapper
    const wrapper = this.tableElement.parentElement;
    if (wrapper) {
      wrapper.classList.add('score-display-final');
    }

    // Highlight the total column
    const totalCells = this.tableElement.querySelectorAll('.score-table-total-cell');
    totalCells.forEach(cell => {
      cell.classList.add('score-total-final');
    });

    // Find and highlight the winner(s)
    if (this.playerData.length > 0) {
      const maxScore = Math.max(...this.playerData.map(p => p.total));
      const tbody = this.tableElement.querySelector('tbody');
      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
          if (this.playerData[index].total === maxScore) {
            row.classList.add('score-winner-row');
          }
        });
      }
    }
  }

  /**
   * Clears the score display table
   */
  clear() {
    if (this.tableElement) {
      const wrapper = this.tableElement.parentElement;
      if (wrapper) {
        wrapper.remove();
      }
    }
    this.tableElement = null;
    this.playerData = [];
    this.currentRound = 0;
  }

  /**
   * Gets the current player data
   * @returns {Array} Array of player data objects
   */
  getPlayerData() {
    return JSON.parse(JSON.stringify(this.playerData));
  }

  /**
   * Gets the current round
   * @returns {number} The current round number
   */
  getCurrentRound() {
    return this.currentRound;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplay;
}
