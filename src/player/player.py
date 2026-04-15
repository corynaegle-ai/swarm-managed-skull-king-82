class Player:
    """
    Represents a player in the Skull King game.
    
    Attributes:
        name: Player's name
        score: Player's current score
    """
    
    def __init__(self, name: str):
        """
        Initialize a player.
        
        Args:
            name: Player's name
        """
        self.name = name
        self.score = 0
    
    def __repr__(self) -> str:
        return f"Player({self.name})"
