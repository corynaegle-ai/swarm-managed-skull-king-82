"""Tests for zero bid scoring logic."""

import pytest
from skull_king.scoring import calculate_zero_bid_score


class TestZeroBidScoring:
    """Test cases for zero bid score calculation."""

    def test_zero_bid_successful_round_7(self):
        """Bid 0 in round 7, take 0 = +70 points."""
        score = calculate_zero_bid_score(round_number=7, tricks_taken=0)
        assert score == 70, f"Expected 70, got {score}"

    def test_zero_bid_failed_round_9(self):
        """Bid 0 in round 9, take 2 = -90 points."""
        score = calculate_zero_bid_score(round_number=9, tricks_taken=2)
        assert score == -90, f"Expected -90, got {score}"

    def test_zero_bid_bonus_only_if_successful(self):
        """Only adds bonus points if zero bid was successful."""
        # Taking 1 trick when bidding 0 is a failure
        score_1_trick = calculate_zero_bid_score(round_number=5, tricks_taken=1)
        assert score_1_trick == -50, f"Expected -50, got {score_1_trick}"
        
        # Taking 3 tricks when bidding 0 is a failure
        score_3_tricks = calculate_zero_bid_score(round_number=5, tricks_taken=3)
        assert score_3_tricks == -50, f"Expected -50, got {score_3_tricks}"
        
        # Only 0 tricks taken is successful
        score_0_tricks = calculate_zero_bid_score(round_number=5, tricks_taken=0)
        assert score_0_tricks == 50, f"Expected 50, got {score_0_tricks}"

    def test_zero_bid_uses_round_number(self):
        """Uses round number (cards dealt) for calculation."""
        # Round 1: bid 0, take 0 = +10
        score_r1 = calculate_zero_bid_score(round_number=1, tricks_taken=0)
        assert score_r1 == 10
        
        # Round 2: bid 0, take 0 = +20
        score_r2 = calculate_zero_bid_score(round_number=2, tricks_taken=0)
        assert score_r2 == 20
        
        # Round 10: bid 0, take 0 = +100
        score_r10 = calculate_zero_bid_score(round_number=10, tricks_taken=0)
        assert score_r10 == 100
        
        # Round 1: bid 0, take 1 = -10
        score_fail_r1 = calculate_zero_bid_score(round_number=1, tricks_taken=1)
        assert score_fail_r1 == -10
        
        # Round 10: bid 0, take 1 = -100
        score_fail_r10 = calculate_zero_bid_score(round_number=10, tricks_taken=1)
        assert score_fail_r10 == -100

    def test_invalid_round_number(self):
        """Raises error for invalid round numbers."""
        with pytest.raises(ValueError, match="round_number must be positive"):
            calculate_zero_bid_score(round_number=0, tricks_taken=0)
        
        with pytest.raises(ValueError, match="round_number must be positive"):
            calculate_zero_bid_score(round_number=-1, tricks_taken=0)

    def test_invalid_tricks_taken(self):
        """Raises error for invalid tricks_taken values."""
        with pytest.raises(ValueError, match="tricks_taken must be non-negative"):
            calculate_zero_bid_score(round_number=5, tricks_taken=-1)
