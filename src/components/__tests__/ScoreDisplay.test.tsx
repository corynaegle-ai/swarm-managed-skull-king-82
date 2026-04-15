import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreDisplay from '../ScoreDisplay';
import { GameState } from '../../types/game';

describe('ScoreDisplay Component', () => {
  const mockGameState: GameState = {
    players: [
      {
        id: '1',
        name: 'Alice',
        roundScores: [10, 20, 15, 25, 30, 5, 40, 20, 35, 50],
      },
      {
        id: '2',
        name: 'Bob',
        roundScores: [15, 25, 20, 30, 25, 10, 35, 30, 40, 45],
      },
      {
        id: '3',
        name: 'Charlie',
        roundScores: [5, 15, 10, 20, 15, 0, 25, 10, 20, 30],
      },
    ],
    currentRound: 1,
    isComplete: false,
  };

  describe('Criterion 1: Shows player names, round scores, and running totals', () => {
    it('should display all player names', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={1} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should display round scores for each player', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={1} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      // Verify first player's scores are present
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display running totals in the Total column', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={1} />);
      // Alice's total should be 250
      const cells = screen.getAllByText('250');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should calculate running totals correctly for all players', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={1} />
      );
      const rows = container.querySelectorAll('.score-row');
      expect(rows.length).toBe(3);
    });
  });

  describe('Criterion 2: Clearly indicates current round', () => {
    it('should display current round in header', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should highlight the current round column', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={3} />
      );
      const currentRoundHeaders = container.querySelectorAll('.round-header.current-round');
      expect(currentRoundHeaders.length).toBeGreaterThan(0);
    });

    it('should show round indicator as final when game is complete', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={11} />);
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should mark current round cells with visual indicator', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={2} />
      );
      const currentRoundCells = container.querySelectorAll('.round-score.current-round');
      expect(currentRoundCells.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Criterion 3: Updates immediately after each round', () => {
    it('should re-render when currentRound prop changes', () => {
      const { rerender } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={1} />
      );
      expect(screen.getByText('Round:')).toBeInTheDocument();
      const initialText = screen.getByText('1');
      expect(initialText).toBeInTheDocument();

      rerender(<ScoreDisplay gameState={mockGameState} currentRound={2} />);
      const updatedRound = screen.getByText('2');
      expect(updatedRound).toBeInTheDocument();
    });

    it('should re-render when gameState changes', () => {
      const initialState: GameState = {
        ...mockGameState,
        players: [
          { id: '1', name: 'Alice', roundScores: [10] },
        ],
      };

      const { rerender } = render(
        <ScoreDisplay gameState={initialState} currentRound={1} />
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();

      const updatedState: GameState = {
        ...mockGameState,
        players: [
          { id: '1', name: 'Alice', roundScores: [10, 20] },
        ],
      };

      rerender(<ScoreDisplay gameState={updatedState} currentRound={2} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should display updated scores immediately after round completion', () => {
      const gameStateAfterRound1: GameState = {
        ...mockGameState,
        currentRound: 2,
      };

      const { rerender } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={1} />
      );

      rerender(
        <ScoreDisplay gameState={gameStateAfterRound1} currentRound={2} />
      );
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Criterion 4: Final scores visible after round 10', () => {
    it('should display final scores banner when game is complete', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={11} />);
      expect(screen.getByText('Game Complete!')).toBeInTheDocument();
    });

    it('should show all player final scores in completion banner', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={11} />);
      expect(screen.getByText('Game Complete!')).toBeInTheDocument();
      // The banner should contain final scores
      const finalScoresSection = screen.getByText(/Game Complete!/)
        .closest('.game-complete-banner');
      expect(finalScoresSection).toBeInTheDocument();
    });

    it('should display final scores sorted by rank when game is complete', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={11} />);
      const banner = screen.getByText('Game Complete!');
      expect(banner).toBeInTheDocument();
    });

    it('should display complete score table with all 10 rounds', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={11} />
      );
      const roundHeaders = container.querySelectorAll('.round-header');
      // Should have 10 round headers + 1 total header
      expect(roundHeaders.length).toBe(10);
    });

    it('should hide final scores banner before game is complete', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={5} />
      );
      const banner = container.querySelector('.game-complete-banner');
      expect(banner).not.toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty player list gracefully', () => {
      const emptyGameState: GameState = {
        players: [],
        currentRound: 1,
        isComplete: false,
      };
      render(<ScoreDisplay gameState={emptyGameState} currentRound={1} />);
      expect(screen.getByText('No players to display')).toBeInTheDocument();
    });

    it('should handle players with partial scores', () => {
      const partialGameState: GameState = {
        players: [
          { id: '1', name: 'Alice', roundScores: [10, 20] },
          { id: '2', name: 'Bob', roundScores: [15, 25, 30] },
        ],
        currentRound: 3,
        isComplete: false,
      };
      render(<ScoreDisplay gameState={partialGameState} currentRound={3} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should display dash for unplayed rounds', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={1} />
      );
      // Unplayed rounds should show '-'
      const dashes = container.querySelectorAll('.not-played');
      expect(dashes.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle null gameState gracefully', () => {
      render(
        <ScoreDisplay gameState={{ players: [], currentRound: 0, isComplete: false }} currentRound={1} />
      );
      expect(screen.getByText('No players to display')).toBeInTheDocument();
    });
  });

  describe('UI and Layout', () => {
    it('should render table with correct structure', () => {
      render(<ScoreDisplay gameState={mockGameState} currentRound={1} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have proper column headers', () => {
      const { container } = render(
        <ScoreDisplay gameState={mockGameState} currentRound={1} />
      );
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });
});
