from typing import List
from src.game.phase import Phase
from src.player.player import Player


class GameFlow:
    """
    Manages the flow and state transitions of the Skull King game.
    
    The game progresses through phases:
    1. SETUP: Players are added
    2. BIDDING: Players place bids
    3. SCORING: Scores are calculated
    4. COMPLETE: Game ends after 10 rounds
    
    Attributes:
        players: List of players in the game
        current_phase: Current phase of the game (Phase enum)
        current_round: Current round number (1-10)
    """
    
    MINIMUM_PLAYERS = 2
    MAXIMUM_ROUNDS = 10
    
    def __init__(self):
        """
        Initialize the game in SETUP phase.
        """
        self.players: List[Player] = []
        self.current_phase: Phase = Phase.SETUP
        self.current_round: int = 1
        self.bids_collected: int = 0
    
    def add_player(self, player: Player) -> None:
        """
        Add a player to the game during SETUP phase.
        
        Automatically transitions to BIDDING phase when 2+ players are added.
        
        Args:
            player: Player object to add
            
        Raises:
            ValueError: If player is None
            RuntimeError: If not in SETUP phase
        """
        if player is None:
            raise ValueError("Player cannot be None")
        
        if self.current_phase != Phase.SETUP:
            raise RuntimeError(f"Cannot add players during {self.current_phase.value} phase")
        
        self.players.append(player)
        
        # Transition to BIDDING when 2+ players added
        if len(self.players) >= self.MINIMUM_PLAYERS:
            self.current_phase = Phase.BIDDING
            self.bids_collected = 0
    
    def record_bid(self, player: Player, bid: int) -> None:
        """
        Record a bid from a player.
        
        Automatically transitions to SCORING phase when all bids are collected.
        
        Args:
            player: Player placing the bid
            bid: The bid amount
            
        Raises:
            ValueError: If bid is negative
            RuntimeError: If not in BIDDING phase
        """
        if bid < 0:
            raise ValueError("Bid cannot be negative")
        
        if self.current_phase != Phase.BIDDING:
            raise RuntimeError(f"Cannot record bids during {self.current_phase.value} phase")
        
        self.bids_collected += 1
        
        # Transition to SCORING when all players have bid
        if self.bids_collected >= len(self.players):
            self.current_phase = Phase.SCORING
    
    def advance_round(self) -> None:
        """
        Advance to the next round.
        
        Transitions from SCORING back to BIDDING for the next round,
        or to COMPLETE if round 10 is finished.
        
        Raises:
            RuntimeError: If not in SCORING phase
        """
        if self.current_phase != Phase.SCORING:
            raise RuntimeError(f"Cannot advance round during {self.current_phase.value} phase")
        
        if self.current_round >= self.MAXIMUM_ROUNDS:
            # Game complete after round 10
            self.current_phase = Phase.COMPLETE
        else:
            # Move to next round
            self.current_round += 1
            self.current_phase = Phase.BIDDING
            self.bids_collected = 0
    
    def get_current_phase(self) -> Phase:
        """
        Get the current game phase.
        
        Returns:
            Current Phase enum value
        """
        return self.current_phase
    
    def get_current_round(self) -> int:
        """
        Get the current round number.
        
        Returns:
            Current round number (1-10)
        """
        return self.current_round
    
    def get_player_count(self) -> int:
        """
        Get the number of players in the game.
        
        Returns:
            Number of players
        """
        return len(self.players)
    
    def is_game_complete(self) -> bool:
        """
        Check if the game is complete.
        
        Returns:
            True if game is in COMPLETE phase, False otherwise
        """
        return self.current_phase == Phase.COMPLETE
