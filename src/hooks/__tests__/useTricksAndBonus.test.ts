import { renderHook, act } from '@testing-library/react';
import { useTricksAndBonus } from '../useTricksAndBonus';

describe('useTricksAndBonus', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    expect(result.current.tricksTaken).toEqual({});
    expect(result.current.bonusPoints).toEqual({});
  });

  it('sets tricks taken for a player', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setTricksTaken('player1', 3);
    });

    expect(result.current.tricksTaken).toEqual({ player1: 3 });
  });

  it('sets bonus points for a player', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setBonusPoints('player1', 10);
    });

    expect(result.current.bonusPoints).toEqual({ player1: 10 });
  });

  it('updates tricks taken for multiple players', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setTricksTaken('player1', 3);
      result.current.setTricksTaken('player2', 2);
    });

    expect(result.current.tricksTaken).toEqual({ player1: 3, player2: 2 });
  });

  it('updates bonus points for multiple players', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setBonusPoints('player1', 10);
      result.current.setBonusPoints('player2', 5);
    });

    expect(result.current.bonusPoints).toEqual({ player1: 10, player2: 5 });
  });

  it('sets data from form', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    const formData = {
      player1: { tricksTaken: 3, bonusPoints: 10 },
      player2: { tricksTaken: 2, bonusPoints: 5 },
    };

    act(() => {
      result.current.setFromForm(formData);
    });

    expect(result.current.tricksTaken).toEqual({ player1: 3, player2: 2 });
    expect(result.current.bonusPoints).toEqual({ player1: 10, player2: 5 });
  });

  it('resets all state', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setTricksTaken('player1', 3);
      result.current.setBonusPoints('player1', 10);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.tricksTaken).toEqual({});
    expect(result.current.bonusPoints).toEqual({});
  });

  it('overwrites existing values when setting tricks', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setTricksTaken('player1', 3);
    });

    act(() => {
      result.current.setTricksTaken('player1', 5);
    });

    expect(result.current.tricksTaken).toEqual({ player1: 5 });
  });

  it('overwrites existing values when setting bonus', () => {
    const { result } = renderHook(() => useTricksAndBonus());

    act(() => {
      result.current.setBonusPoints('player1', 10);
    });

    act(() => {
      result.current.setBonusPoints('player1', 15);
    });

    expect(result.current.bonusPoints).toEqual({ player1: 15 });
  });
});
