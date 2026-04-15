import { useState, useCallback } from 'react';

interface TricksAndBonusState {
  tricksTaken: Record<string, number>;
  bonusPoints: Record<string, number>;
}

interface UseTricksAndBonusReturn extends TricksAndBonusState {
  setTricksTaken: (playerId: string, tricks: number) => void;
  setBonusPoints: (playerId: string, bonus: number) => void;
  setFromForm: (data: Record<string, { tricksTaken: number; bonusPoints: number }>) => void;
  reset: () => void;
}

/**
 * Hook for managing tricks taken and bonus points state
 * Provides utilities for updating and resetting round data
 */
export const useTricksAndBonus = (): UseTricksAndBonusReturn => {
  const [state, setState] = useState<TricksAndBonusState>({
    tricksTaken: {},
    bonusPoints: {},
  });

  const setTricksTaken = useCallback((playerId: string, tricks: number) => {
    setState((prev) => ({
      ...prev,
      tricksTaken: {
        ...prev.tricksTaken,
        [playerId]: tricks,
      },
    }));
  }, []);

  const setBonusPoints = useCallback((playerId: string, bonus: number) => {
    setState((prev) => ({
      ...prev,
      bonusPoints: {
        ...prev.bonusPoints,
        [playerId]: bonus,
      },
    }));
  }, []);

  const setFromForm = useCallback(
    (data: Record<string, { tricksTaken: number; bonusPoints: number }>) => {
      const newTricksTaken: Record<string, number> = {};
      const newBonusPoints: Record<string, number> = {};

      Object.entries(data).forEach(([playerId, values]) => {
        newTricksTaken[playerId] = values.tricksTaken;
        newBonusPoints[playerId] = values.bonusPoints;
      });

      setState({
        tricksTaken: newTricksTaken,
        bonusPoints: newBonusPoints,
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      tricksTaken: {},
      bonusPoints: {},
    });
  }, []);

  return {
    tricksTaken: state.tricksTaken,
    bonusPoints: state.bonusPoints,
    setTricksTaken,
    setBonusPoints,
    setFromForm,
    reset,
  };
};
