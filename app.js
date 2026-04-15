/**
 * Main game application file
 * Integrates score display with game logic
 */

class GameState {
  constructor(playerCount = 3) {
    this.players = [];
    this.currentRound = 1;
    this.maxRounds = 10;
    this.scoreDisplay = null;
    
    // Initialize players
    for (let i = 1; i <= playerCount; i++) {
      this.players.push({
        id: i,
        name: `Player ${i}`,
        roundScores: [],
        runningTotal: 0
      });
    }
  }

  /**
   * Initialize the game and set up score display
   */
  init() {
    try {
      const scoreDisplayContainer = document.getElementById('score-display');
      if (!scoreDisplayContainer) {
        console.error('Score display container not found');
        return false;
      }

      // Instantiate ScoreDisplay if the class exists
      if (typeof ScoreDisplay !== 'undefined') {
        this.scoreDisplay = new ScoreDisplay(scoreDisplayContainer, this.players);
        console.log('Score display initialized');
      } else {
        console.warn('ScoreDisplay class not found - score display will not be shown');
      }

      // Update welcome message
      const welcomeMsg = document.querySelector('.welcome-message');
      if (welcomeMsg) {
        welcomeMsg.textContent = `Game started with ${this.players.length} players. Round 1 of ${this.maxRounds}.`;
      }

      return true;
    } catch (error) {
      console.error('Error initializing game:', error);
      return false;
    }
  }

  /**
   * Process round completion and update scores
   * @param {Array} roundResults - Array of trick counts for each player
   */
  completeRound(roundResults) {
    try {
      if (!Array.isArray(roundResults) || roundResults.length !== this.players.length) {
        console.error('Invalid round results');
        return false;
      }

      // Update player scores for this round
      this.players.forEach((player, index) => {
        const trickCount = roundResults[index];
        const roundScore = trickCount * 20; // Simple scoring: 20 points per trick
        
        player.roundScores.push(roundScore);
        player.runningTotal += roundScore;
      });

      // Update score display with new round data
      if (this.scoreDisplay) {
        this.scoreDisplay.updateScores(
          this.players.map(p => p.roundScores),
          this.players.map(p => p.runningTotal)
        );
      }

      // Move to next round
      if (this.currentRound < this.maxRounds) {
        this.currentRound++;
        
        // Highlight the current round in the score display
        if (this.scoreDisplay) {
          this.scoreDisplay.highlightCurrentRound(this.currentRound);
        }

        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
          welcomeMsg.textContent = `Round ${this.currentRound} of ${this.maxRounds}.`;
        }
      } else if (this.currentRound === this.maxRounds) {
        // Game is complete after round 10
        this.endGame();
      }

      return true;
    } catch (error) {
      console.error('Error completing round:', error);
      return false;
    }
  }

  /**
   * End game and show final scores
   */
  endGame() {
    try {
      // Determine winner (highest running total)
      let winner = this.players[0];
      this.players.forEach(player => {
        if (player.runningTotal > winner.runningTotal) {
          winner = player;
        }
      });

      // Show final scores in score display
      if (this.scoreDisplay) {
        this.scoreDisplay.showFinalScores(this.players, winner);
      }

      // Update welcome message
      const welcomeMsg = document.querySelector('.welcome-message');
      if (welcomeMsg) {
        welcomeMsg.textContent = `Game Over! ${winner.name} wins with ${winner.runningTotal} points!`;
      }

      console.log('Game completed. Winner:', winner.name);
      return true;
    } catch (error) {
      console.error('Error ending game:', error);
      return false;
    }
  }

  /**
   * Get current game state
   */
  getState() {
    return {
      players: this.players,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      isGameActive: this.currentRound <= this.maxRounds
    };
  }
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new GameState(3); // 3 players
    game.init();

    // Simulate game rounds for demonstration
    // Round 1: Player 1 wins 2 tricks, Player 2 wins 1 trick, Player 3 wins 0 tricks
    setTimeout(() => game.completeRound([2, 1, 0]), 1000);
    
    // Round 2
    setTimeout(() => game.completeRound([1, 2, 0]), 3000);
    
    // Round 3
    setTimeout(() => game.completeRound([0, 1, 2]), 5000);
    
    // Round 4
    setTimeout(() => game.completeRound([2, 0, 1]), 7000);
    
    // Round 5
    setTimeout(() => game.completeRound([1, 2, 0]), 9000);
    
    // Round 6
    setTimeout(() => game.completeRound([2, 1, 0]), 11000);
    
    // Round 7
    setTimeout(() => game.completeRound([1, 0, 2]), 13000);
    
    // Round 8
    setTimeout(() => game.completeRound([0, 2, 1]), 15000);
    
    // Round 9
    setTimeout(() => game.completeRound([2, 1, 0]), 17000);
    
    // Round 10 - Final round
    setTimeout(() => game.completeRound([1, 2, 0]), 19000);

    // Make game accessible globally for testing
    window.game = game;
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});