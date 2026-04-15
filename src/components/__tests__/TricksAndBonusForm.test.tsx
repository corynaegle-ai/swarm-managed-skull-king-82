import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TricksAndBonusForm from '../TricksAndBonusForm';

const mockPlayers = [
  { id: 'player1', name: 'Alice' },
  { id: 'player2', name: 'Bob' },
];

const mockBids = {
  player1: 3,
  player2: 2,
};

describe('TricksAndBonusForm', () => {
  let mockOnSubmit: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    mockOnCancel = jest.fn();
  });

  it('renders form with player data', () => {
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Round 3 - Enter Tricks and Bonus')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders bid values correctly', () => {
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textContent = screen.getByText('Alice').closest('div')?.parentElement?.textContent;
    expect(textContent).toContain('3');
  });

  it('allows entering tricks taken', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    // First two should be tricks, next two should be bonus
    await user.clear(inputs[0]);
    await user.type(inputs[0], '2');

    expect(inputs[0]).toHaveValue(2);
  });

  it('allows entering bonus points', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[2]); // Bonus for first player
    await user.type(inputs[2], '5');

    expect(inputs[2]).toHaveValue(5);
  });

  it('validates tricks taken is required', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[2]); // Clear first bonus
    await user.type(inputs[2], '0');

    const submitButton = screen.getByRole('button', { name: /Review and Confirm/i });
    await user.click(submitButton);

    // Should show error for first player tricks
    expect(screen.getByText('Tricks taken is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates tricks taken range (0 to round number)', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]); // First player tricks
    await user.type(inputs[0], '5'); // Greater than round number
    await user.clear(inputs[2]); // First player bonus
    await user.type(inputs[2], '0');
    await user.clear(inputs[3]); // Second player bonus
    await user.type(inputs[3], '0');

    const submitButton = screen.getByRole('button', { name: /Review and Confirm/i });
    await user.click(submitButton);

    expect(screen.getByText('Tricks must be 0 to 3')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates bonus points is required', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]); // First player tricks
    await user.type(inputs[0], '3');

    const submitButton = screen.getByRole('button', { name: /Review and Confirm/i });
    await user.click(submitButton);

    // Should show error for first player bonus
    expect(screen.getByText('Bonus points is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    // First player
    await user.clear(inputs[0]);
    await user.type(inputs[0], '3');
    await user.clear(inputs[2]);
    await user.type(inputs[2], '10');

    // Second player
    await user.clear(inputs[1]);
    await user.type(inputs[1], '2');
    await user.clear(inputs[3]);
    await user.type(inputs[3], '5');

    const submitButton = screen.getByRole('button', { name: /Review and Confirm/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      player1: { tricksTaken: 3, bonusPoints: 10 },
      player2: { tricksTaken: 2, bonusPoints: 5 },
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TricksAndBonusForm
        players={mockPlayers}
        roundNumber={3}
        bids={mockBids}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
