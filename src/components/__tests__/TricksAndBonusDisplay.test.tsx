import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TricksAndBonusDisplay from '../TricksAndBonusDisplay';

const mockPlayers = [
  { id: 'player1', name: 'Alice' },
  { id: 'player2', name: 'Bob' },
];

const mockBids = {
  player1: 3,
  player2: 2,
};

describe('TricksAndBonusDisplay', () => {
  let mockOnConfirm: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    mockOnConfirm = jest.fn();
    mockOnCancel = jest.fn();
  });

  it('renders display with player data', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 1 }}
        bonusPoints={{ player1: 10, player2: 0 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Round 3 - Score Summary')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('displays bid accuracy correctly (exact bid)', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 1 }}
        bonusPoints={{ player1: 10, player2: 0 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Alice bid 3 and took 3 tricks - accurate
    const accuracyIndicators = screen.getAllByText(/Yes|No/);
    expect(accuracyIndicators[0]).toHaveTextContent('✓ Yes');
  });

  it('displays bid accuracy correctly (inaccurate bid)', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 1 }}
        bonusPoints={{ player1: 10, player2: 0 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Bob bid 2 but took 1 trick - inaccurate
    const accuracyIndicators = screen.getAllByText(/Yes|No/);
    expect(accuracyIndicators[1]).toHaveTextContent('✗ No');
  });

  it('calculates correct score for accurate bid with bonus', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 1 }}
        bonusPoints={{ player1: 10, player2: 0 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Alice: bid=3, tricks=3 (accurate), bonus=10
    // Score = 10*3 + 10 = 40
    const scoreValues = screen.getAllByText(/\+/);
    expect(scoreValues.some((el) => el.textContent?.includes('40'))).toBe(true);
  });

  it('calculates correct score for inaccurate bid (no bonus)', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 1 }}
        bonusPoints={{ player1: 10, player2: 0 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Bob: bid=2, tricks=1 (inaccurate)
    // Score = -5 * |2-1| = -5
    const scoreValues = screen.getAllByText(/-5/);
    expect(scoreValues.length).toBeGreaterThan(0);
  });

  it('shows bonus points only when bid is accurate', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 2 }}
        bonusPoints={{ player1: 10, player2: 5 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Both have accurate bids
    const bonusDisplays = screen.getAllByText(/\+[0-9]+/);
    // Alice and Bob should both show bonus points
    expect(bonusDisplays.length).toBeGreaterThan(0);
  });

  it('displays round total score', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 2 }}
        bonusPoints={{ player1: 10, player2: 5 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Alice: 10*3 + 10 = 40
    // Bob: 10*2 + 5 = 25
    // Total: 65
    expect(screen.getByText('Round Total:')).toBeInTheDocument();
    const totalElement = screen.getByText(/65/);
    expect(totalElement).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 2 }}
        bonusPoints={{ player1: 10, player2: 5 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm Scores/i });
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when back button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 3, player2: 2 }}
        bonusPoints={{ player1: 10, player2: 5 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles zero tricks and bonus correctly', () => {
    render(
      <TricksAndBonusDisplay
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        tricksTaken={{ player1: 0, player2: 0 }}
        bonusPoints={{ player1: 0, player2: 0 }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Both inaccurate since bids > 0 but tricks = 0
    const accuracyIndicators = screen.getAllByText(/Yes|No/);
    expect(accuracyIndicators[0]).toHaveTextContent('✗ No');
    expect(accuracyIndicators[1]).toHaveTextContent('✗ No');
  });
});
