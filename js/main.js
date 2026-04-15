/**
 * Main Application Entry Point
 * Initializes the game controller and sets up the application
 */

import { GameController } from './gameController.js';

// Module-level variable for game controller
let gameController;

// Initialize game controller when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  try {
    gameController = new GameController();
    gameController.startGame();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    const phaseContainer = document.getElementById('phase-container');
    if (phaseContainer) {
      phaseContainer.innerHTML = '<div class="error">Failed to initialize game. Please refresh the page.</div>';
    }
  }
}
