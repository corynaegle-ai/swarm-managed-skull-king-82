"""Tests for bid collection module."""

import pytest
from src.bidding.bid_collector import BidCollector


class TestBidCollectorInitialization:
    """Test BidCollector initialization."""

    def test_init_valid_parameters(self):
        """Test initialization with valid parameters."""
        collector = BidCollector(num_players=4, round_number=3)
        assert collector.num_players == 4
        assert collector.round_number == 3
        assert collector.max_bid == 3

    def test_init_invalid_player_count(self):
        """Test initialization with invalid player count."""
        with pytest.raises(ValueError, match="Number of players must be at least 2"):
            BidCollector(num_players=1, round_number=1)

    def test_init_invalid_round_number(self):
        """Test initialization with invalid round number."""
        with pytest.raises(ValueError, match="Round number must be at least 1"):
            BidCollector(num_players=4, round_number=0)


class TestRoundInfoDisplay:
    """Test round information display (Criterion 1)."""

    def test_display_shows_round_number(self):
        """Test that display shows current round number."""
        collector = BidCollector(num_players=4, round_number=3)
        info = collector.display_round_info()
        assert "Round 3" in info

    def test_display_shows_max_bid(self):
        """Test that display shows max bid allowed."""
        collector = BidCollector(num_players=4, round_number=5)
        info = collector.display_round_info()
        assert "5" in info
        assert "Max" in info.lower() or "max" in info

    def test_display_format_round_1(self):
        """Test display format for round 1."""
        collector = BidCollector(num_players=2, round_number=1)
        info = collector.display_round_info()
        assert "Round 1" in info
        assert "1" in info


class TestBidValidation:
    """Test bid validation (Criterion 2)."""

    def test_valid_bid_zero(self):
        """Test that bid of 0 is valid."""
        collector = BidCollector(num_players=4, round_number=3)
        assert collector.submit_bid("player1", 0) is True

    def test_valid_bid_max(self):
        """Test that bid equal to round number is valid."""
        collector = BidCollector(num_players=4, round_number=3)
        assert collector.submit_bid("player1", 3) is True

    def test_valid_bid_middle(self):
        """Test that bid in middle range is valid."""
        collector = BidCollector(num_players=4, round_number=5)
        assert collector.submit_bid("player1", 3) is True

    def test_invalid_bid_negative(self):
        """Test that negative bid is rejected."""
        collector = BidCollector(num_players=4, round_number=3)
        with pytest.raises(ValueError, match="Bid must be between"):
            collector.submit_bid("player1", -1)

    def test_invalid_bid_exceeds_max(self):
        """Test that bid exceeding round number is rejected."""
        collector = BidCollector(num_players=4, round_number=3)
        with pytest.raises(ValueError, match="Bid must be between"):
            collector.submit_bid("player1", 4)

    def test_invalid_bid_non_integer(self):
        """Test that non-integer bid is rejected."""
        collector = BidCollector(num_players=4, round_number=3)
        with pytest.raises(ValueError, match="Bid must be an integer"):
            collector.submit_bid("player1", 2.5)

    def test_invalid_bid_string(self):
        """Test that string bid is rejected."""
        collector = BidCollector(num_players=4, round_number=3)
        with pytest.raises(ValueError, match="Bid must be an integer"):
            collector.submit_bid("player1", "2")


class TestPlayerBidTracking:
    """Test tracking of player bids."""

    def test_get_bids_empty(self):
        """Test getting bids when none submitted."""
        collector = BidCollector(num_players=4, round_number=3)
        assert collector.get_bids() == {}

    def test_get_bids_single_player(self):
        """Test getting bids with one player."""
        collector = BidCollector(num_players=4, round_number=3)
        collector.submit_bid("player1", 2)
        assert collector.get_bids() == {"player1": 2}

    def test_get_bids_multiple_players(self):
        """Test getting bids with multiple players."""
        collector = BidCollector(num_players=3, round_number=3)
        collector.submit_bid("player1", 2)
        collector.submit_bid("player2", 1)
        collector.submit_bid("player3", 3)
        bids = collector.get_bids()
        assert bids == {"player1": 2, "player2": 1, "player3": 3}

    def test_overwrite_bid(self):
        """Test that player can update their bid."""
        collector = BidCollector(num_players=4, round_number=3)
        collector.submit_bid("player1", 2)
        collector.submit_bid("player1", 1)
        assert collector.get_bids()["player1"] == 1


class TestAllPlayersBidding:
    """Test that all players must submit bids (Criterion 3)."""

    def test_not_complete_no_bids(self):
        """Test is_complete returns False when no bids submitted."""
        collector = BidCollector(num_players=4, round_number=3)
        assert collector.is_complete() is False

    def test_not_complete_partial_bids(self):
        """Test is_complete returns False when only some players bid."""
        collector = BidCollector(num_players=4, round_number=3)
        collector.submit_bid("player1", 2)
        collector.submit_bid("player2", 1)
        assert collector.is_complete() is False

    def test_complete_all_bids(self):
        """Test is_complete returns True when all players bid."""
        collector = BidCollector(num_players=3, round_number=3)
        collector.submit_bid("player1", 2)
        collector.submit_bid("player2", 1)
        collector.submit_bid("player3", 3)
        assert collector.is_complete() is True

    def test_complete_with_different_player_ids(self):
        """Test is_complete with various player ID formats."""
        collector = BidCollector(num_players=3, round_number=2)
        collector.submit_bid("alice", 1)
        collector.submit_bid("bob", 0)
        collector.submit_bid("charlie", 2)
        assert collector.is_complete() is True


class TestBidDisplay:
    """Test display of all collected bids (Criterion 4)."""

    def test_display_no_bids(self):
        """Test display when no bids collected."""
        collector = BidCollector(num_players=4, round_number=3)
        display = collector.display_all_bids()
        assert "No bids" in display or "no bids" in display.lower()

    def test_display_single_bid(self):
        """Test display with single bid."""
        collector = BidCollector(num_players=4, round_number=3)
        collector.submit_bid("player1", 2)
        display = collector.display_all_bids()
        assert "player1" in display
        assert "2" in display

    def test_display_multiple_bids(self):
        """Test display with multiple bids."""
        collector = BidCollector(num_players=3, round_number=3)
        collector.submit_bid("player1", 2)
        collector.submit_bid("player2", 1)
        collector.submit_bid("player3", 3)
        display = collector.display_all_bids()
        assert "player1" in display
        assert "player2" in display
        assert "player3" in display
        assert "2" in display
        assert "1" in display
        assert "3" in display

    def test_display_contains_header(self):
        """Test that display contains descriptive header."""
        collector = BidCollector(num_players=2, round_number=2)
        collector.submit_bid("p1", 1)
        collector.submit_bid("p2", 2)
        display = collector.display_all_bids()
        assert "Bid" in display

    def test_display_organized(self):
        """Test that display is organized/sorted."""
        collector = BidCollector(num_players=3, round_number=3)
        collector.submit_bid("zebra", 1)
        collector.submit_bid("apple", 2)
        collector.submit_bid("monkey", 3)
        display = collector.display_all_bids()
        # Display should show players in sorted order
        assert display.index("apple") < display.index("monkey")
        assert display.index("monkey") < display.index("zebra")


class TestBidCollectorIntegration:
    """Integration tests for complete bid collection workflow."""

    def test_complete_round_workflow(self):
        """Test complete workflow for a single round."""
        # Setup
        num_players = 4
        round_num = 3
        collector = BidCollector(num_players=num_players, round_number=round_num)

        # Display round info
        info = collector.display_round_info()
        assert f"Round {round_num}" in info

        # Players submit bids
        bids_to_submit = [("player1", 2), ("player2", 1), ("player3", 3), ("player4", 0)]
        for player_id, bid in bids_to_submit:
            collector.submit_bid(player_id, bid)

        # Verify all bids collected
        assert collector.is_complete() is True

        # Display results
        display = collector.display_all_bids()
        for player_id, bid in bids_to_submit:
            assert player_id in display
            assert str(bid) in display

    def test_max_bids_escalate_with_rounds(self):
        """Test that max bids increase with round number."""
        for round_num in range(1, 11):
            collector = BidCollector(num_players=4, round_number=round_num)
            # Should be able to bid up to round number
            collector.submit_bid("player1", round_num)
            # Should fail to bid above round number
            with pytest.raises(ValueError):
                collector.submit_bid("player2", round_num + 1)

    def test_reset_for_new_round(self):
        """Test resetting collector for next round."""
        collector = BidCollector(num_players=2, round_number=1)
        collector.submit_bid("player1", 1)
        collector.submit_bid("player2", 0)

        # Reset for next round
        collector.reset()
        assert len(collector.get_bids()) == 0
        assert collector.is_complete() is False
