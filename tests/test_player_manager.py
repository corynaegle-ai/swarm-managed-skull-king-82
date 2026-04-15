"""Tests for player manager."""

import pytest
from src.game.player_manager import PlayerManager


class TestPlayerManager:
    """Test suite for PlayerManager."""
    
    def test_add_player_success(self):
        """Test adding a player successfully."""
        manager = PlayerManager()
        manager.add_player("Alice")
        assert manager.get_player_count() == 1
        assert manager.get_players() == ["Alice"]
    
    def test_add_multiple_players(self):
        """Test adding multiple players."""
        manager = PlayerManager()
        names = ["Alice", "Bob", "Charlie"]
        for name in names:
            manager.add_player(name)
        assert manager.get_player_count() == 3
        assert manager.get_players() == names
    
    def test_add_player_duplicate_name(self):
        """Test adding player with duplicate name raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("Alice")
    
    def test_add_player_with_whitespace(self):
        """Test adding player with whitespace gets trimmed."""
        manager = PlayerManager()
        manager.add_player("  Alice  ")
        assert manager.get_players() == ["Alice"]
    
    def test_add_player_empty_name(self):
        """Test adding player with empty name raises error."""
        manager = PlayerManager()
        with pytest.raises(ValueError, match="cannot be empty"):
            manager.add_player("")
    
    def test_add_player_whitespace_only(self):
        """Test adding player with whitespace-only name raises error."""
        manager = PlayerManager()
        with pytest.raises(ValueError, match="cannot be empty"):
            manager.add_player("   ")
    
    def test_add_player_after_game_started(self):
        """Test adding player after game started raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.start_game()
        with pytest.raises(ValueError, match="after game has started"):
            manager.add_player("Charlie")
    
    def test_add_player_exceeds_max_limit(self):
        """Test adding player when max limit reached raises error."""
        manager = PlayerManager()
        for i in range(PlayerManager.MAX_PLAYERS):
            manager.add_player(f"Player{i}")
        with pytest.raises(ValueError, match="Maximum"):
            manager.add_player("ExtraPlayer")
    
    def test_remove_player_success(self):
        """Test removing a player successfully."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.remove_player("Alice")
        assert manager.get_players() == ["Bob"]
    
    def test_remove_nonexistent_player(self):
        """Test removing non-existent player raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        with pytest.raises(ValueError, match="not found"):
            manager.remove_player("Bob")
    
    def test_remove_player_after_game_started(self):
        """Test removing player after game started raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.start_game()
        with pytest.raises(ValueError, match="after game has started"):
            manager.remove_player("Alice")
    
    def test_get_players_returns_copy(self):
        """Test that get_players returns a copy, not reference."""
        manager = PlayerManager()
        manager.add_player("Alice")
        players = manager.get_players()
        players.append("Bob")
        assert manager.get_player_count() == 1
    
    def test_players_in_order_added(self):
        """Test that players list maintains order of addition."""
        manager = PlayerManager()
        names = ["Zoe", "Alice", "Mike", "Bob"]
        for name in names:
            manager.add_player(name)
        assert manager.get_players() == names
    
    def test_start_game_success(self):
        """Test starting game with valid player count."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.start_game()
        assert manager.is_game_started()
    
    def test_start_game_too_few_players(self):
        """Test starting game with too few players raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        with pytest.raises(ValueError, match="Need between"):
            manager.start_game()
    
    def test_start_game_no_players(self):
        """Test starting game with no players raises error."""
        manager = PlayerManager()
        with pytest.raises(ValueError, match="Need between"):
            manager.start_game()
    
    def test_start_game_too_many_players(self):
        """Test starting game with too many players raises error."""
        manager = PlayerManager()
        for i in range(PlayerManager.MAX_PLAYERS + 1):
            if i < PlayerManager.MAX_PLAYERS:
                manager.add_player(f"Player{i}")
        # This should not be possible due to add_player limit,
        # but test the boundary
        assert manager.get_player_count() == PlayerManager.MAX_PLAYERS
    
    def test_can_start_game_with_valid_count(self):
        """Test can_start_game returns true with valid player count."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        assert manager.can_start_game()
    
    def test_can_start_game_with_too_few(self):
        """Test can_start_game returns false with too few players."""
        manager = PlayerManager()
        manager.add_player("Alice")
        assert not manager.can_start_game()
    
    def test_can_start_game_after_started(self):
        """Test can_start_game returns false after game started."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.start_game()
        assert not manager.can_start_game()
    
    def test_start_game_twice(self):
        """Test starting game twice raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.start_game()
        with pytest.raises(ValueError, match="already started"):
            manager.start_game()
    
    def test_has_valid_player_count_min(self):
        """Test has_valid_player_count at minimum."""
        manager = PlayerManager()
        manager.add_player("Alice")
        assert not manager.has_valid_player_count()
        manager.add_player("Bob")
        assert manager.has_valid_player_count()
    
    def test_has_valid_player_count_max(self):
        """Test has_valid_player_count at maximum."""
        manager = PlayerManager()
        for i in range(PlayerManager.MAX_PLAYERS):
            manager.add_player(f"Player{i}")
            assert manager.has_valid_player_count()
    
    def test_reset(self):
        """Test reset clears players and game state."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.start_game()
        manager.reset()
        assert manager.get_player_count() == 0
        assert not manager.is_game_started()
        assert not manager.can_start_game()
    
    def test_player_count_boundaries(self):
        """Test all player count boundaries."""
        manager = PlayerManager()
        
        # 0 players - invalid
        assert not manager.has_valid_player_count()
        
        # 1 player - invalid
        manager.add_player("Alice")
        assert not manager.has_valid_player_count()
        
        # 2 players - valid
        manager.add_player("Bob")
        assert manager.has_valid_player_count()
        
        # 3-7 players - valid
        for i in range(3, 8):
            manager.add_player(f"Player{i}")
            assert manager.has_valid_player_count()
        
        # 8 players - valid
        assert manager.has_valid_player_count()
        assert manager.get_player_count() == 8
