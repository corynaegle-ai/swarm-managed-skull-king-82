import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Paper, Typography, Box, Alert } from '@mui/material';

interface PlayerTricksBonus {
  playerId: string;
  playerName: string;
  bid: number;
  tricksTaken: number | '';
  bonusPoints: number | '';
}

interface TricksAndBonusFormProps {
  players: Array<{ id: string; name: string }>;
  roundNumber: number;
  bids: Record<string, number>;
  onSubmit: (data: Record<string, { tricksTaken: number; bonusPoints: number }>) => void;
  onCancel: () => void;
}

const TricksAndBonusForm: React.FC<TricksAndBonusFormProps> = ({
  players,
  roundNumber,
  bids,
  onSubmit,
  onCancel,
}) => {
  const [playerData, setPlayerData] = useState<PlayerTricksBonus[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize player data with bids
  useEffect(() => {
    const initialized = players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      bid: bids[player.id] || 0,
      tricksTaken: '' as number | '',
      bonusPoints: '' as number | '',
    }));
    setPlayerData(initialized);
  }, [players, bids]);

  const handleTrickChange = (playerId: string, value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    setPlayerData((prev) =>
      prev.map((p) =>
        p.playerId === playerId ? { ...p, tricksTaken: numValue } : p
      )
    );
    // Clear error for this field
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`${playerId}-tricks`];
      return updated;
    });
  };

  const handleBonusChange = (playerId: string, value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    setPlayerData((prev) =>
      prev.map((p) =>
        p.playerId === playerId ? { ...p, bonusPoints: numValue } : p
      )
    );
    // Clear error for this field
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`${playerId}-bonus`];
      return updated;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    playerData.forEach((player) => {
      // Validate tricks taken
      if (player.tricksTaken === '') {
        newErrors[`${player.playerId}-tricks`] = 'Tricks taken is required';
      } else if (
        typeof player.tricksTaken === 'number' &&
        (player.tricksTaken < 0 || player.tricksTaken > roundNumber)
      ) {
        newErrors[`${player.playerId}-tricks`] = `Tricks must be 0 to ${roundNumber}`;
      }

      // Validate bonus points
      if (player.bonusPoints === '') {
        newErrors[`${player.playerId}-bonus`] = 'Bonus points is required';
      } else if (typeof player.bonusPoints === 'number' && player.bonusPoints < 0) {
        newErrors[`${player.playerId}-bonus`] = 'Bonus points cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formattedData: Record<string, { tricksTaken: number; bonusPoints: number }> = {};
    playerData.forEach((player) => {
      formattedData[player.playerId] = {
        tricksTaken: typeof player.tricksTaken === 'number' ? player.tricksTaken : 0,
        bonusPoints: typeof player.bonusPoints === 'number' ? player.bonusPoints : 0,
      };
    });

    onSubmit(formattedData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        Round {roundNumber} - Enter Tricks and Bonus
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Enter the number of tricks each player actually took and the bonus points earned. Bonus
        points only apply if the player's bid was exact.
      </Alert>

      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={2} sx={{ minWidth: 600 }}>
          {/* Header Row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Player
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Bid
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Tricks Taken
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Bonus Points
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Player Data Rows */}
          {playerData.map((player) => (
            <Grid item xs={12} key={player.playerId}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="body2">{player.playerName}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">{player.bid}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    type="number"
                    inputProps={{
                      min: 0,
                      max: roundNumber,
                    }}
                    value={player.tricksTaken}
                    onChange={(e) => handleTrickChange(player.playerId, e.target.value)}
                    error={!!errors[`${player.playerId}-tricks`]}
                    helperText={errors[`${player.playerId}-tricks`]}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    type="number"
                    inputProps={{
                      min: 0,
                    }}
                    value={player.bonusPoints}
                    onChange={(e) => handleBonusChange(player.playerId, e.target.value)}
                    error={!!errors[`${player.playerId}-bonus`]}
                    helperText={errors[`${player.playerId}-bonus`]}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Review and Confirm
        </Button>
      </Box>
    </Paper>
  );
};

export default TricksAndBonusForm;
