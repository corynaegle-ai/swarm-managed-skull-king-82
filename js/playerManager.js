/**
 * PlayerManager - Manages player data and operations for Skull King game
 * Handles adding/removing players, validation, and game readiness checks
 */
class PlayerManager {
  constructor() {
    this.players = [];
    this.MIN_PLAYERS = 2;
    this.MAX_PLAYERS = 8;
  }

  /**
   * Generates a unique ID using timestamp and random value
   * @returns {string} Unique player ID
   */
  generateId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Checks if a name already exists in the player list
   * @param {string} name - Player name to check
   * @returns {boolean} True if name exists (case-insensitive)
   */
  nameExists(name) {
    return this.players.some(player => player.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Adds a new player to the game
   * @param {string} name - Player name (must be unique, 1+ characters)
   * @returns {object} The created player object or error object
   * @throws {Error} If constraints are violated
   */
  addPlayer(name) {
    // Validate name is provided and is a string
    if (!name || typeof name !== 'string') {
      throw new Error('Player name must be a non-empty string');
    }

    // Trim whitespace
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('Player name cannot be empty or whitespace only');
    }

    // Check if at maximum capacity
    if (this.players.length >= this.MAX_PLAYERS) {
      throw new Error(`Cannot add more than ${this.MAX_PLAYERS} players`);
    }

    // Check for duplicate name
    if (this.nameExists(trimmedName)) {
      throw new Error(`A player named "${trimmedName}" already exists`);
    }

    // Create new player object
    const newPlayer = {
      id: this.generateId(),
      name: trimmedName,
      score: 0
    };

    // Add player to array
    this.players.push(newPlayer);

    return newPlayer;
  }

  /**
   * Removes a player by ID
   * @param {string} id - Player ID to remove
   * @returns {boolean} True if player was removed, false if not found
   */
  removePlayer(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid player ID');
    }

    const initialLength = this.players.length;
    this.players = this.players.filter(player => player.id !== id);

    return this.players.length < initialLength;
  }

  /**
   * Gets all current players
   * @returns {array} Array of player objects
   */
  getPlayers() {
    // Return a copy to prevent external modifications
    return JSON.parse(JSON.stringify(this.players));
  }

  /**
   * Checks if game can start (minimum 2 players required)
   * @returns {boolean} True if 2 or more players exist
   */
  canStartGame() {
    return this.players.length >= this.MIN_PLAYERS;
  }

  /**
   * Gets the count of current players
   * @returns {number} Number of players
   */
  getPlayerCount() {
    return this.players.length;
  }

  /**
   * Clears all players (useful for game reset)
   */
  clearPlayers() {
    this.players = [];
  }

  /**
   * Gets a player by ID
   * @param {string} id - Player ID
   * @returns {object|null} Player object or null if not found
   */
  getPlayerById(id) {
    const player = this.players.find(p => p.id === id);
    return player ? JSON.parse(JSON.stringify(player)) : null;
  }

  /**
   * Gets a player by name
   * @param {string} name - Player name
   * @returns {object|null} Player object or null if not found
   */
  getPlayerByName(name) {
    const player = this.players.find(p => p.name.toLowerCase() === name.toLowerCase());
    return player ? JSON.parse(JSON.stringify(player)) : null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerManager;
}
