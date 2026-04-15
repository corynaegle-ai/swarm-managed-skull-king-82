/**
 * Main Application Entry Point
 * Initializes the game controller and sets up the application
 */

import { GameController } from './gameController.js';

// Initialize game controller when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  try {
    const gameController = new GameController();
    gameController.startGame();
    
    // Make controller available globally for debugging if needed
    window.gameController = gameController;
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}
