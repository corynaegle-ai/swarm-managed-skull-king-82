from enum import Enum

class Phase(Enum):
    """Enum representing the different phases of the game."""
    SETUP = "setup"
    BIDDING = "bidding"
    SCORING = "scoring"
    COMPLETE = "complete"
