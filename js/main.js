/**
 * Main Application Entry Point
 * Initializes the game controller and sets up the application
 */

import { GameController } from './gameController.js';

// Module-level variable for debugging and extension
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
    // Expose for debugging
    window.gameController = gameController;
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}
