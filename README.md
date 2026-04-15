# Skull King Score Calculation - Zero Bids

This implementation provides scoring logic for zero bids in the Skull King card game.

## Scoring Rules for Zero Bids

When a player bids **0 cards** in a round:

- **Successful (took exactly 0 tricks)**: +10 × round_number points
- **Failed (took 1 or more tricks)**: -10 × round_number points

The round_number corresponds to the number of cards dealt in that round.

## Examples

- Bid 0 in round 7, take 0 tricks → **+70 points** (successful)
- Bid 0 in round 9, take 2 tricks → **-90 points** (failed)
- Bid 0 in round 1, take 0 tricks → **+10 points** (successful)
- Bid 0 in round 10, take 1 trick → **-100 points** (failed)

## Implementation

The scoring logic is implemented in `skull_king/scoring.py` with the function:

```python
def calculate_zero_bid_score(round_number: int, tricks_taken: int) -> int:
    """Calculate score for a zero bid."""
```

## Testing

Comprehensive tests are provided in `tests/test_zero_bid_scoring.py` covering:

1. Successful zero bids in various rounds
2. Failed zero bids with different trick counts
3. Verification that bonus points only apply on success
4. Confirmation that round number is used correctly in calculations
5. Error handling for invalid inputs

Run tests with:

```bash
pytest tests/test_zero_bid_scoring.py -v
```
