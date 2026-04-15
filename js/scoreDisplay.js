/**
 * ScoreDisplay Class
 * Manages the display and updating of the score table during gameplay
 */

class ScoreDisplay {
  constructor(container, players) {
    this.container = container;
    this.players = players;
    this.currentRound = 1;
    this.maxRounds = 10;
    this.init();
  }

  /**
   * Initialize the score display with table structure
   */
  init() {
    try {
      this.createTable();
      this.render();
    } catch (error) {
      console.error('Error initializing score display:', error);
    }
  }

  /**
   * Create the HTML table structure for the score display
   */
  createTable() {
    const table = document.createElement('table');
    table.className = 'score-table';

    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'score-header-row';

    // Player name header
    const playerHeader = document.createElement('th');
    playerHeader.className = 'score-header-cell player-name-cell';
    playerHeader.textContent = 'Player';
    headerRow.appendChild(playerHeader);

    // Round headers (1-10)
    for (let i = 1; i <= this.maxRounds; i++) {
      const roundHeader = document.createElement('th');
      roundHeader.className = 'score-header-cell round-header';
      roundHeader.textContent = `R${i}`;
      roundHeader.setAttribute('data-round', i);
      headerRow.appendChild(roundHeader);
    }

    // Total header
    const totalHeader = document.createElement('th');
    totalHeader.className = 'score-header-cell total-header';
    totalHeader.textContent = 'Total';
    headerRow.appendChild(totalHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body rows
    const tbody = document.createElement('tbody');
    this.players.forEach((player, index) => {
      const row = document.createElement('tr');
      row.className = 'score-row';
      row.setAttribute('data-player-id', player.id);

      // Player name cell
      const nameCell = document.createElement('td');
      nameCell.className = 'score-cell player-name-cell';
      nameCell.textContent = player.name;
      row.appendChild(nameCell);

      // Round score cells
      for (let i = 1; i <= this.maxRounds; i++) {
        const scoreCell = document.createElement('td');
        scoreCell.className = 'score-cell round-score-cell';
        scoreCell.setAttribute('data-round', i);
        scoreCell.textContent = '-';
        row.appendChild(scoreCell);
      }

      // Total cell
      const totalCell = document.createElement('td');
      totalCell.className = 'score-cell total-cell';
      totalCell.textContent = '0';
      totalCell.setAttribute('data-player-id', player.id);
      row.appendChild(totalCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    this.table = table;
  }

  /**
   * Render the score display
   */
  render() {
    if (this.table) {
      // Clear previous content
      this.container.innerHTML = '';
      this.container.appendChild(this.table);
    }
  }

  /**
   * Update scores for all players after round completion
   * @param {Array<Array<number>>} roundScores - 2D array of round scores [playerIndex][roundIndex]
   * @param {Array<number>} runningTotals - Running total for each player
   */
  updateScores(roundScores, runningTotals) {
    try {
      if (!Array.isArray(roundScores) || !Array.isArray(runningTotals)) {
        console.error('Invalid score data provided to updateScores');
        return false;
      }

      // Update each player's scores
      this.players.forEach((player, playerIndex) => {
        const playerRow = this.table.querySelector(`tr[data-player-id="${player.id}"]`);
        if (!playerRow) return;

        const playerScores = roundScores[playerIndex] || [];

        // Update round score cells
        playerScores.forEach((score, roundIndex) => {
          const roundCell = playerRow.querySelector(`td[data-round="${roundIndex + 1}"]`);
          if (roundCell && score !== undefined) {
            roundCell.textContent = score === 0 ? '0' : score;
            roundCell.classList.add('populated');
          }
        });

        // Update total cell
        const totalCell = playerRow.querySelector('td.total-cell');
        if (totalCell && runningTotals[playerIndex] !== undefined) {
          totalCell.textContent = runningTotals[playerIndex];
          totalCell.classList.add('populated');
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating scores:', error);
      return false;
    }
  }

  /**
   * Highlight the current round being played
   * @param {number} roundNumber - The current round number (1-10)
   */
  highlightCurrentRound(roundNumber) {
    try {
      if (roundNumber < 1 || roundNumber > this.maxRounds) {
        console.warn(`Invalid round number: ${roundNumber}`);
        return false;
      }

      this.currentRound = roundNumber;

      // Remove previous highlight from all round headers
      const allRoundHeaders = this.table.querySelectorAll('th.round-header');
      allRoundHeaders.forEach(header => {
        header.classList.remove('current-round');
      });

      // Add highlight to current round header
      const currentHeader = this.table.querySelector(`th[data-round="${roundNumber}"]`);
      if (currentHeader) {
        currentHeader.classList.add('current-round');
      }

      // Add highlight to current round cells in all rows
      const allRoundCells = this.table.querySelectorAll(`td[data-round="${roundNumber}"]`);
      allRoundCells.forEach(cell => {
        cell.classList.add('current-round');
      });

      return true;
    } catch (error) {
      console.error('Error highlighting current round:', error);
      return false;
    }
  }

  /**
   * Display final scores and highlight the winner
   * @param {Array<Object>} players - Array of player objects with final scores
   * @param {Object} winner - The winning player object
   */
  showFinalScores(players, winner) {
    try {
      if (!winner || typeof winner !== 'object') {
        console.error('Invalid winner data');
        return false;
      }

      // Add final-game class to table to trigger final styling
      this.table.classList.add('final-scores-active');

      // Highlight the winner's row
      const winnerRow = this.table.querySelector(`tr[data-player-id="${winner.id}"]`);
      if (winnerRow) {
        winnerRow.classList.add('winner-row');
      }

      // Create and insert a winner announcement
      const announcement = document.createElement('div');
      announcement.className = 'score-display-announcement';
      announcement.innerHTML = `
        <div class="announcement-content">
          <h2>Game Complete!</h2>
          <p class="winner-name">${winner.name}</p>
          <p class="winner-score">Final Score: ${winner.runningTotal} points</p>
        </div>
      `;

      this.container.insertBefore(announcement, this.table);

      return true;
    } catch (error) {
      console.error('Error showing final scores:', error);
      return false;
    }
  }

  /**
   * Get the current state of the score display
   */
  getState() {
    return {
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      playerCount: this.players.length,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        roundScores: p.roundScores || [],
        runningTotal: p.runningTotal || 0
      }))
    };
  }
}