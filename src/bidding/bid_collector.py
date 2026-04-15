"""Bid collection module for managing player bids in each round."""

from typing import Dict, List


class BidCollector:
    """Manages bid collection from all players for a given round."""

    def __init__(self, num_players: int, round_number: int):
        """
        Initialize the bid collector.

        Args:
            num_players: Total number of players in the game
            round_number: Current round number (1-indexed)
        """
        if num_players < 2:
            raise ValueError("Number of players must be at least 2")
        if round_number < 1:
            raise ValueError("Round number must be at least 1")

        self.num_players = num_players
        self.round_number = round_number
        self.max_bid = round_number  # Bid cannot exceed round number
        self.bids: Dict[str, int] = {}  # player_id -> bid

    def display_round_info(self) -> str:
        """
        Display current round information.

        Returns:
            Formatted string showing round number and max bid allowed
        """
        return f"Round {self.round_number} - Max Bid Allowed: {self.max_bid}"

    def submit_bid(self, player_id: str, bid: int) -> bool:
        """
        Submit a bid from a player.

        Args:
            player_id: Unique identifier for the player
            bid: The bid amount (0 to round_number)

        Returns:
            True if bid is valid and accepted

        Raises:
            ValueError: If bid is invalid
        """
        if not isinstance(bid, int):
            raise ValueError(f"Bid must be an integer, got {type(bid).__name__}")

        if bid < 0 or bid > self.max_bid:
            raise ValueError(
                f"Bid must be between 0 and {self.max_bid}, got {bid}"
            )

        self.bids[player_id] = bid
        return True

    def is_complete(self) -> bool:
        """
        Check if all players have submitted bids.

        Returns:
            True if all players have submitted bids
        """
        return len(self.bids) == self.num_players

    def get_bids(self) -> Dict[str, int]:
        """
        Get all collected bids.

        Returns:
            Dictionary mapping player_id to bid amount
        """
        return dict(self.bids)

    def display_all_bids(self) -> str:
        """
        Display all collected bids for verification.

        Returns:
            Formatted string showing all player bids
        """
        if not self.bids:
            return "No bids collected yet."

        bid_lines = ["Collected Bids:"]
        for player_id, bid in sorted(self.bids.items()):
            bid_lines.append(f"  {player_id}: {bid}")

        return "\n".join(bid_lines)

    def remaining_players(self) -> List[str]:
        """
        Get list of players who haven't submitted bids yet.

        Returns:
            List of player IDs who still need to submit bids
        """
        # This would need player list passed in for full implementation
        # For now, return count of remaining
        return list(range(self.num_players - len(self.bids)))

    def reset(self) -> None:
        """
        Reset bids for a new round (if reusing collector).
        """
        self.bids.clear()
