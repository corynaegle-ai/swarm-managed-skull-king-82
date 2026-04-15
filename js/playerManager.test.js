/**
 * Unit tests for PlayerManager class
 * Tests all acceptance criteria and edge cases
 */

describe('PlayerManager', () => {
  let manager;

  beforeEach(() => {
    manager = new PlayerManager();
  });

  describe('addPlayer()', () => {
    test('should add a player with unique name', () => {
      const player = manager.addPlayer('Alice');
      expect(player.name).toBe('Alice');
      expect(player.id).toBeDefined();
      expect(player.score).toBe(0);
      expect(manager.getPlayers().length).toBe(1);
    });

    test('should reject duplicate names (case-insensitive)', () => {
      manager.addPlayer('Alice');
      expect(() => manager.addPlayer('Alice')).toThrow(/already exists/);
      expect(() => manager.addPlayer('ALICE')).toThrow(/already exists/);
      expect(() => manager.addPlayer('alice')).toThrow(/already exists/);
    });

    test('should enforce 8 player maximum', () => {
      for (let i = 1; i <= 8; i++) {
        manager.addPlayer(`Player ${i}`);
      }
      expect(manager.getPlayerCount()).toBe(8);
      expect(() => manager.addPlayer('Player 9')).toThrow(/Cannot add more than 8/);
    });

    test('should enforce 2 player minimum for game start', () => {
      expect(manager.canStartGame()).toBe(false);
      manager.addPlayer('Player 1');
      expect(manager.canStartGame()).toBe(false);
      manager.addPlayer('Player 2');
      expect(manager.canStartGame()).toBe(true);
    });

    test('should trim whitespace from names', () => {
      const player = manager.addPlayer('  Alice  ');
      expect(player.name).toBe('Alice');
    });

    test('should reject empty or whitespace-only names', () => {
      expect(() => manager.addPlayer('')).toThrow();
      expect(() => manager.addPlayer('   ')).toThrow();
      expect(() => manager.addPlayer(null)).toThrow();
      expect(() => manager.addPlayer(undefined)).toThrow();
    });

    test('should reject non-string names', () => {
      expect(() => manager.addPlayer(123)).toThrow();
      expect(() => manager.addPlayer({})).toThrow();
      expect(() => manager.addPlayer([])).toThrow();
    });
  });

  describe('removePlayer()', () => {
    test('should remove a player by ID', () => {
      const player = manager.addPlayer('Alice');
      expect(manager.getPlayerCount()).toBe(1);
      const removed = manager.removePlayer(player.id);
      expect(removed).toBe(true);
      expect(manager.getPlayerCount()).toBe(0);
    });

    test('should return false when removing non-existent player', () => {
      manager.addPlayer('Alice');
      const removed = manager.removePlayer('invalid_id');
      expect(removed).toBe(false);
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should reject invalid player IDs', () => {
      expect(() => manager.removePlayer(null)).toThrow();
      expect(() => manager.removePlayer(undefined)).toThrow();
      expect(() => manager.removePlayer(123)).toThrow();
    });
  });

  describe('getPlayers()', () => {
    test('should return array of all players', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      const players = manager.getPlayers();
      expect(Array.isArray(players)).toBe(true);
      expect(players.length).toBe(2);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
    });

    test('should return empty array when no players', () => {
      const players = manager.getPlayers();
      expect(Array.isArray(players)).toBe(true);
      expect(players.length).toBe(0);
    });

    test('should return a copy, not reference', () => {
      manager.addPlayer('Alice');
      const players1 = manager.getPlayers();
      const players2 = manager.getPlayers();
      expect(players1).not.toBe(players2);
      players1[0].name = 'Modified';
      const players3 = manager.getPlayers();
      expect(players3[0].name).toBe('Alice');
    });
  });

  describe('canStartGame()', () => {
    test('should return false with fewer than 2 players', () => {
      expect(manager.canStartGame()).toBe(false);
      manager.addPlayer('Alice');
      expect(manager.canStartGame()).toBe(false);
    });

    test('should return true with 2 or more players', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      expect(manager.canStartGame()).toBe(true);
      manager.addPlayer('Charlie');
      expect(manager.canStartGame()).toBe(true);
    });

    test('should return false after removing players below minimum', () => {
      const p1 = manager.addPlayer('Alice');
      const p2 = manager.addPlayer('Bob');
      expect(manager.canStartGame()).toBe(true);
      manager.removePlayer(p1.id);
      expect(manager.canStartGame()).toBe(false);
    });
  });

  describe('ID Generation', () => {
    test('should generate unique IDs for each player', () => {
      const p1 = manager.addPlayer('Alice');
      const p2 = manager.addPlayer('Bob');
      const p3 = manager.addPlayer('Charlie');
      const ids = [p1.id, p2.id, p3.id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    test('should generate IDs in expected format', () => {
      const player = manager.addPlayer('Alice');
      expect(player.id).toMatch(/^player_\d+_[a-z0-9]+$/);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle full game lifecycle', () => {
      expect(manager.canStartGame()).toBe(false);
      const p1 = manager.addPlayer('Alice');
      expect(manager.canStartGame()).toBe(false);
      const p2 = manager.addPlayer('Bob');
      expect(manager.canStartGame()).toBe(true);
      const p3 = manager.addPlayer('Charlie');
      expect(manager.getPlayerCount()).toBe(3);
      manager.removePlayer(p3.id);
      expect(manager.getPlayerCount()).toBe(2);
      expect(manager.canStartGame()).toBe(true);
    });

    test('should maintain player data integrity', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      const players = manager.getPlayers();
      expect(players[0].score).toBe(0);
      expect(players[0].id).toBeDefined();
      expect(players[0].name).toBe('Alice');
    });
  });
});
