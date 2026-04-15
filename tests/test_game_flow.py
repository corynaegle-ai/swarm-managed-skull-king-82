import pytest
from src.game.game_flow import GameFlow
from src.game.phase import Phase
from src.player.player import Player


class TestGameFlowSetupPhase:
    """Test cases for the SETUP phase."""
    
    def test_game_starts_in_setup_phase(self):
        """AC1: Game should start in SETUP phase."""
        game = GameFlow()
        assert game.get_current_phase() == Phase.SETUP
        assert game.get_current_round() == 1
    
    def test_add_single_player_stays_in_setup(self):
        """With only 1 player, game should stay in SETUP phase."""
        game = GameFlow()
        player1 = Player("Alice")
        game.add_player(player1)
        assert game.get_current_phase() == Phase.SETUP
        assert game.get_player_count() == 1
    
    def test_cannot_add_none_player(self):
        """Should raise ValueError when adding None as player."""
        game = GameFlow()
        with pytest.raises(ValueError, match="Player cannot be None"):
            game.add_player(None)
    
    def test_cannot_add_player_outside_setup(self):
        """Should raise RuntimeError when adding player outside SETUP phase."""
        game = GameFlow()
        player1 = Player("Alice")
        player2 = Player("Bob")
        player3 = Player("Charlie")
        
        game.add_player(player1)
        game.add_player(player2)  # Transitions to BIDDING
        
        with pytest.raises(RuntimeError, match="Cannot add players during bidding phase"):
            game.add_player(player3)


class TestGameFlowBiddingPhase:
    """Test cases for the BIDDING phase."""
    
    def test_moves_to_bidding_with_two_players(self):
        """AC2: Game should move to BIDDING phase after 2+ players added."""
        game = GameFlow()
        player1 = Player("Alice")
        player2 = Player("Bob")
        
        game.add_player(player1)
        assert game.get_current_phase() == Phase.SETUP
        
        game.add_player(player2)
        assert game.get_current_phase() == Phase.BIDDING
    
    def test_moves_to_bidding_with_three_players(self):
        """Game should move to BIDDING with 3+ players."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        assert game.get_current_phase() == Phase.BIDDING
        
        # After transition to BIDDING, cannot add more players
        with pytest.raises(RuntimeError):
            game.add_player(Player("Charlie"))
    
    def test_record_bid_negative_bid_raises_error(self):
        """Should raise ValueError for negative bids."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        
        with pytest.raises(ValueError, match="Bid cannot be negative"):
            game.record_bid(Player("Alice"), -1)
    
    def test_cannot_record_bid_outside_bidding_phase(self):
        """Should raise RuntimeError when recording bid outside BIDDING phase."""
        game = GameFlow()
        with pytest.raises(RuntimeError, match="Cannot record bids during setup phase"):
            game.record_bid(Player("Alice"), 5)


class TestGameFlowScoringPhase:
    """Test cases for the SCORING phase."""
    
    def test_moves_to_scoring_after_all_bids_collected(self):
        """AC3: Game should move to SCORING phase after all bids collected."""
        game = GameFlow()
        player1 = Player("Alice")
        player2 = Player("Bob")
        
        game.add_player(player1)
        game.add_player(player2)
        assert game.get_current_phase() == Phase.BIDDING
        
        game.record_bid(player1, 5)
        assert game.get_current_phase() == Phase.BIDDING  # Still bidding
        
        game.record_bid(player2, 3)
        assert game.get_current_phase() == Phase.SCORING  # Now scoring
    
    def test_moves_to_scoring_with_three_players(self):
        """Game should move to SCORING after all 3 players bid."""
        game = GameFlow()
        players = [Player("Alice"), Player("Bob"), Player("Charlie")]
        
        for player in players:
            game.add_player(player)
        
        assert game.get_current_phase() == Phase.BIDDING
        
        for i, player in enumerate(players):
            game.record_bid(player, i + 1)
            if i < len(players) - 1:
                assert game.get_current_phase() == Phase.BIDDING
        
        assert game.get_current_phase() == Phase.SCORING
    
    def test_cannot_record_bid_during_scoring(self):
        """Should raise RuntimeError when recording bid during SCORING phase."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        
        game.record_bid(Player("Alice"), 5)
        game.record_bid(Player("Bob"), 3)  # Transition to SCORING
        
        with pytest.raises(RuntimeError, match="Cannot record bids during scoring phase"):
            game.record_bid(Player("Alice"), 4)


class TestGameFlowRoundProgression:
    """Test cases for 10-round progression."""
    
    def test_starts_at_round_one(self):
        """Game should start at round 1."""
        game = GameFlow()
        assert game.get_current_round() == 1
    
    def test_advance_round_requires_scoring_phase(self):
        """Should raise RuntimeError when advancing round outside SCORING phase."""
        game = GameFlow()
        with pytest.raises(RuntimeError, match="Cannot advance round during setup phase"):
            game.advance_round()
    
    def test_advance_to_round_two(self):
        """AC4: Game should advance to round 2 after scoring round 1."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        game.record_bid(Player("Alice"), 5)
        game.record_bid(Player("Bob"), 3)
        
        assert game.get_current_round() == 1
        assert game.get_current_phase() == Phase.SCORING
        
        game.advance_round()
        
        assert game.get_current_round() == 2
        assert game.get_current_phase() == Phase.BIDDING
    
    def test_advance_through_multiple_rounds(self):
        """Game should progress through multiple rounds."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        
        # Progress through first 3 rounds
        for expected_round in range(1, 4):
            assert game.get_current_round() == expected_round
            assert game.get_current_phase() == Phase.BIDDING
            
            game.record_bid(Player("Alice"), 5)
            game.record_bid(Player("Bob"), 3)
            assert game.get_current_phase() == Phase.SCORING
            
            game.advance_round()
            assert game.get_current_round() == expected_round + 1
            assert game.get_current_phase() == Phase.BIDDING
    
    def test_game_complete_after_round_ten(self):
        """AC5: Game should show complete after round 10."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        
        # Progress through all 10 rounds
        for round_num in range(1, 11):
            assert game.get_current_round() == round_num
            assert game.get_current_phase() == Phase.BIDDING
            
            game.record_bid(Player("Alice"), 5)
            game.record_bid(Player("Bob"), 3)
            assert game.get_current_phase() == Phase.SCORING
            
            game.advance_round()
        
        # After round 10 is completed
        assert game.get_current_round() == 10
        assert game.get_current_phase() == Phase.COMPLETE
        assert game.is_game_complete() == True
    
    def test_cannot_advance_from_complete_phase(self):
        """Should raise RuntimeError when trying to advance from COMPLETE phase."""
        game = GameFlow()
        game.add_player(Player("Alice"))
        game.add_player(Player("Bob"))
        
        # Complete all 10 rounds
        for _ in range(10):
            game.record_bid(Player("Alice"), 5)
            game.record_bid(Player("Bob"), 3)
            game.advance_round()
        
        assert game.is_game_complete()
        
        with pytest.raises(RuntimeError, match="Cannot advance round during complete phase"):
            game.advance_round()
