"""Scoring module for Skull King game.

Handles all scoring logic including special cases like zero bids.
"""


def calculate_zero_bid_score(round_number: int, tricks_taken: int) -> int:
    """
    Calculate score for a zero bid.
    
    Special scoring rule: When a player bids 0 cards:
    - If they take exactly 0 tricks (successful): +10 × round_number
    - If they take any tricks (failed): -10 × round_number
    
    Args:
        round_number: The current round number (also equals cards dealt in that round)
        tricks_taken: Number of tricks taken by the player
    
    Returns:
        Points earned for the zero bid
    
    Raises:
        ValueError: If round_number is not positive or tricks_taken is negative
    """
    if round_number <= 0:
        raise ValueError(f"round_number must be positive, got {round_number}")
    if tricks_taken < 0:
        raise ValueError(f"tricks_taken must be non-negative, got {tricks_taken}")
    
    if tricks_taken == 0:
        # Successful zero bid: +10 × round_number
        return 10 * round_number
    else:
        # Failed zero bid: -10 × round_number
        return -10 * round_number
