"""Player management for Skull King game."""

from typing import List


class PlayerManager:
    """Manages player addition and validation."""
    
    MIN_PLAYERS = 2
    MAX_PLAYERS = 8
    
    def __init__(self):
        """Initialize player manager."""
        self._players: List[str] = []
        self._game_started = False
    
    def add_player(self, name: str) -> None:
        """Add a player with the given name.
        
        Args:
            name: The player's name (must be unique and non-empty)
            
        Raises:
            ValueError: If game has started, name is empty, name is not unique,
                       or max player limit is reached
        """
        if self._game_started:
            raise ValueError("Cannot add players after game has started")
        
        if not name or not name.strip():
            raise ValueError("Player name cannot be empty")
        
        name = name.strip()
        
        if name in self._players:
            raise ValueError(f"Player '{name}' already exists")
        
        if len(self._players) >= self.MAX_PLAYERS:
            raise ValueError(
                f"Maximum {self.MAX_PLAYERS} players allowed"
            )
        
        self._players.append(name)
    
    def remove_player(self, name: str) -> None:
        """Remove a player by name.
        
        Args:
            name: The player's name to remove
            
        Raises:
            ValueError: If game has started or player doesn't exist
        """
        if self._game_started:
            raise ValueError("Cannot remove players after game has started")
        
        if name not in self._players:
            raise ValueError(f"Player '{name}' not found")
        
        self._players.remove(name)
    
    def get_players(self) -> List[str]:
        """Get list of players in order added.
        
        Returns:
            List of player names in order they were added
        """
        return self._players.copy()
    
    def get_player_count(self) -> int:
        """Get number of players.
        
        Returns:
            Number of players currently in game
        """
        return len(self._players)
    
    def has_valid_player_count(self) -> bool:
        """Check if current player count is valid to start game.
        
        Returns:
            True if player count is between MIN_PLAYERS and MAX_PLAYERS
        """
        return self.MIN_PLAYERS <= len(self._players) <= self.MAX_PLAYERS
    
    def can_start_game(self) -> bool:
        """Check if game can be started.
        
        Returns:
            True if game has not started and player count is valid
        """
        return not self._game_started and self.has_valid_player_count()
    
    def start_game(self) -> None:
        """Mark game as started.
        
        Raises:
            ValueError: If not enough players or game already started
        """
        if self._game_started:
            raise ValueError("Game has already started")
        
        if not self.has_valid_player_count():
            raise ValueError(
                f"Need between {self.MIN_PLAYERS} and {self.MAX_PLAYERS} "
                f"players to start game (currently {len(self._players)})"
            )
        
        self._game_started = True
    
    def is_game_started(self) -> bool:
        """Check if game has started.
        
        Returns:
            True if game has been started
        """
        return self._game_started
    
    def reset(self) -> None:
        """Reset player manager to initial state."""
        self._players = []
        self._game_started = False
