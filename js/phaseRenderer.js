/**
 * Phase Renderer
 * Renders UI for each game phase (setup, bidding, scoring, completion)
 */

export class PhaseRenderer {
  /**
   * Renders the appropriate phase UI
   * @param {string} phase - Current game phase
   * @param {object} gameState - Current game state snapshot
   * @returns {string} HTML string
   */
  renderPhase(phase, gameState) {
    switch (phase) {
      case 'setup':
        return this.renderSetupPhase(gameState);
      case 'bidding':
        return this.renderBiddingPhase(gameState);
      case 'scoring':
        return this.renderScoringPhase(gameState);
      case 'completion':
        return this.renderCompletionPhase(gameState);
      default:
        return '<div class="error">Unknown game phase</div>';
    }
  }

  /**
   * Renders the setup phase
   * Players are added one by one, game starts when 2+ players present
   */
  renderSetupPhase(gameState) {
    const players = gameState.players || [];
    const playerCount = players.length;
    
    let html = '<div class="phase setup-phase">';
    html += '<h2>Game Setup</h2>';
    html += '<div class="setup-container">';
    
    // Player input section
    html += '<div class="player-input-section">';
    html += '<input type="text" id="player-name-input" placeholder="Enter player name" maxlength="50" />';
    html += '<button id="add-player-btn" type="button">Add Player</button>';
    html += '</div>';
    
    // Players list
    html += '<div class="players-list">';
    if (players.length > 0) {
      html += '<h3>Players (' + players.length + ')</h3>';
      html += '<ul>';
      players.forEach((player, index) => {
        html += '<li>' + this.escapeHtml(player.name) + '</li>';
      });
      html += '</ul>';
    } else {
      html += '<p>No players added yet</p>';
    }
    html += '</div>';
    
    // Start game button (disabled if fewer than 2 players)
    if (playerCount >= 2) {
      html += '<button id="start-game-btn" type="button" class="start-btn">Start Game</button>';
    } else {
      html += '<button id="start-game-btn" type="button" class="start-btn" disabled>Start Game (Need 2+ players)</button>';
    }
    
    html += '</div>';
    html += '</div>';
    
    return html;
  }

  /**
   * Renders the bidding phase
   * All players enter their bids simultaneously
   */
  renderBiddingPhase(gameState) {
    const players = gameState.players || [];
    const currentRound = gameState.currentRound || 1;
    
    let html = '<div class="phase bidding-phase">';
    html += '<h2>Round ' + currentRound + ' - Bidding</h2>';
    html += '<p>Each player bids how many tricks they will win (0-' + currentRound + ')</p>';
    html += '<div class="bids-container">';
    
    players.forEach((player, index) => {
      html += '<div class="player-bid-input">';
      html += '<label for="bid-input-' + index + '">'
        + this.escapeHtml(player.name) + '</label>';
      html += '<input type="number" id="bid-input-' + index + '" '
        + 'data-bid-player="' + index + '" '
        + 'min="0" max="' + currentRound + '" '
        + 'placeholder="Bid" />';
      html += '</div>';
    });
    
    html += '</div>';
    html += '<button id="submit-bids-btn" type="button" class="submit-btn">Submit Bids</button>';
    html += '</div>';
    
    return html;
  }

  /**
   * Renders the scoring phase
   * Players enter how many tricks they actually won
   * Shows round results and scores
   */
  renderScoringPhase(gameState) {
    const players = gameState.players || [];
    const currentRound = gameState.currentRound || 1;
    const bids = (gameState.roundData && gameState.roundData[currentRound] && gameState.roundData[currentRound].bids) || {};
    const tricks = (gameState.roundData && gameState.roundData[currentRound] && gameState.roundData[currentRound].tricks) || {};
    const scores = (gameState.roundData && gameState.roundData[currentRound] && gameState.roundData[currentRound].scores) || {};
    const totalScores = gameState.totalScores || {};
    
    let html = '<div class="phase scoring-phase">';
    html += '<h2>Round ' + currentRound + ' - Scoring</h2>';
    
    // If tricks have been recorded, show results
    if (Object.keys(tricks).length > 0) {
      html += '<div class="round-results">';
      html += '<h3>Round Results</h3>';
      html += '<table class="scoring-table">';
      html += '<thead><tr><th>Player</th><th>Bid</th><th>Tricks</th><th>Round Score</th><th>Total Score</th></tr></thead>';
      html += '<tbody>';
      
      players.forEach((player, index) => {
        const bid = bids[index] !== undefined ? bids[index] : '-';
        const trickWon = tricks[index] !== undefined ? tricks[index] : '-';
        const roundScore = scores[index] !== undefined ? scores[index] : 0;
        const totalScore = totalScores[index] !== undefined ? totalScores[index] : 0;
        
        html += '<tr>';
        html += '<td>' + this.escapeHtml(player.name) + '</td>';
        html += '<td>' + bid + '</td>';
        html += '<td>' + trickWon + '</td>';
        html += '<td class="' + (roundScore >= 0 ? 'positive' : 'negative') + '">' + roundScore + '</td>';
        html += '<td>' + totalScore + '</td>';
        html += '</tr>';
      });
      
      html += '</tbody>';
      html += '</table>';
      html += '</div>';
      
      // Show advance button if tricks recorded
      if (currentRound >= 10) {
        html += '<p>Game completed! Final scores above.</p>';
      } else {
        html += '<p>Advancing to next round...</p>';
      }
    } else {
      // Tricks entry form
      html += '<p>Enter how many tricks each player actually won</p>';
      html += '<div class="tricks-container">';
      
      players.forEach((player, index) => {
        const bid = bids[index] !== undefined ? bids[index] : 0;
        html += '<div class="player-tricks-input">';
        html += '<label for="trick-input-' + index + '">'
          + this.escapeHtml(player.name) + ' (bid: ' + bid + ')</label>';
        html += '<input type="number" id="trick-input-' + index + '" '
          + 'data-trick-player="' + index + '" '
          + 'min="0" max="' + currentRound + '" '
          + 'placeholder="Tricks won" />';
        html += '</div>';
      });
      
      html += '</div>';
      html += '<button id="calculate-score-btn" type="button" class="submit-btn">Calculate Score</button>';
    }
    
    html += '</div>';
    
    return html;
  }

  /**
   * Renders the game completion screen
   * Shows final scores and winner
   */
  renderCompletionPhase(gameState) {
    const players = gameState.players || [];
    const totalScores = gameState.totalScores || {};
    
    // Find winner(s)
    let maxScore = -Infinity;
    const winners = [];
    
    players.forEach((player, index) => {
      const score = totalScores[index] || 0;
      if (score > maxScore) {
        maxScore = score;
        winners.length = 0;
        winners.push(player);
      } else if (score === maxScore) {
        winners.push(player);
      }
    });
    
    let html = '<div class="phase completion-phase">';
    html += '<h2>Game Complete!</h2>';
    
    if (winners.length === 1) {
      html += '<div class="winner">';
      html += '<h3>Winner: ' + this.escapeHtml(winners[0].name) + '</h3>';
      html += '<p>Final Score: ' + (totalScores[winners[0].index] || 0) + '</p>';
      html += '</div>';
    } else {
      html += '<div class="tie">';
      html += '<h3>It\'s a Tie!</h3>';
      html += '<p>Winners: ' + winners.map(p => this.escapeHtml(p.name)).join(', ') + '</p>';
      html += '<p>Final Score: ' + maxScore + '</p>';
      html += '</div>';
    }
    
    // Final scores table
    html += '<div class="final-scores">';
    html += '<h3>Final Scores</h3>';
    html += '<table class="scores-table">';
    html += '<thead><tr><th>Player</th><th>Total Score</th></tr></thead>';
    html += '<tbody>';
    
    // Sort by score descending
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = totalScores[a.index] || 0;
      const scoreB = totalScores[b.index] || 0;
      return scoreB - scoreA;
    });
    
    sortedPlayers.forEach(player => {
      const score = totalScores[player.index] || 0;
      html += '<tr>';
      html += '<td>' + this.escapeHtml(player.name) + '</td>';
      html += '<td>' + score + '</td>';
      html += '</tr>';
    });
    
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    
    html += '<button id="restart-game-btn" type="button" class="restart-btn">Play Again</button>';
    html += '</div>';
    
    return html;
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
