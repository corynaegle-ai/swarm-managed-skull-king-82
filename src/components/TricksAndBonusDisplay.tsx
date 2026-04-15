import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Alert, Button, Divider } from '@mui/material';

interface PlayerScore {
  playerId: string;
  playerName: string;
  bid: number;
  tricksTaken: number;
  bonusPoints: number;
  roundScore: number;
  bidAccurate: boolean;
  bonusApplied: boolean;
}

interface TricksAndBonusDisplayProps {
  players: Array<{ id: string; name: string }>;
  roundNumber: number;
  bids: Record<string, number>;
  tricksTaken: Record<string, number>;
  bonusPoints: Record<string, number>;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Calculate round score based on bid accuracy and bonus
 * Scoring rules (typical Skull King):
 * - If bid is accurate: 10 * bid + bonus points
 * - If bid is not accurate: -5 * |bid - tricksTaken|
 */
const calculateRoundScore = (
  bid: number,
  tricksTaken: number,
  bonusPoints: number
): { score: number; bidAccurate: boolean; bonusApplied: boolean } => {
  const bidAccurate = bid === tricksTaken;
  let score = 0;
  let bonusApplied = false;

  if (bidAccurate) {
    score = 10 * bid;
    if (bonusPoints > 0) {
      score += bonusPoints;
      bonusApplied = true;
    }
  } else {
    score = -5 * Math.abs(bid - tricksTaken);
  }

  return { score, bidAccurate, bonusApplied };
};

const TricksAndBonusDisplay: React.FC<TricksAndBonusDisplayProps> = ({
  players,
  roundNumber,
  bids,
  tricksTaken,
  bonusPoints,
  onConfirm,
  onCancel,
}) => {
  const scoreData = useMemo(() => {
    return players.map((player) => {
      const bid = bids[player.id] || 0;
      const tricks = tricksTaken[player.id] || 0;
      const bonus = bonusPoints[player.id] || 0;
      const { score, bidAccurate, bonusApplied } = calculateRoundScore(bid, tricks, bonus);

      return {
        playerId: player.id,
        playerName: player.name,
        bid,
        tricksTaken: tricks,
        bonusPoints: bonus,
        roundScore: score,
        bidAccurate,
        bonusApplied,
      };
    });
  }, [players, bids, tricksTaken, bonusPoints]);

  const totalScore = scoreData.reduce((sum, p) => sum + p.roundScore, 0);

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        Round {roundNumber} - Score Summary
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Review the calculated round scores below. Each player's bid accuracy determines if bonus
        points are applied.
      </Alert>

      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={2} sx={{ minWidth: 700 }}>
          {/* Header Row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Player
                </Typography>
              </Grid>
              <Grid item xs={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Bid
                </Typography>
              </Grid>
              <Grid item xs={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Tricks
                </Typography>
              </Grid>
              <Grid item xs={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Accurate
                </Typography>
              </Grid>
              <Grid item xs={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Bonus
                </Typography>
              </Grid>
              <Grid item xs={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Round Score
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Player Score Rows */}
          {scoreData.map((player) => (
            <Grid item xs={12} key={player.playerId}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid item xs={2}>
                  <Typography variant="body2">{player.playerName}</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="body2">{player.bid}</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="body2">{player.tricksTaken}</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: player.bidAccurate ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {player.bidAccurate ? '✓ Yes' : '✗ No'}
                  </Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="body2">
                    {player.bonusApplied ? `+${player.bonusPoints}` : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={2.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: player.roundScore >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {player.roundScore > 0 ? '+' : ''}{player.roundScore}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Total Row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  Round Total:
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    color: totalScore >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {totalScore > 0 ? '+' : ''}{totalScore}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm Scores
        </Button>
      </Box>
    </Paper>
  );
};

export default TricksAndBonusDisplay;
