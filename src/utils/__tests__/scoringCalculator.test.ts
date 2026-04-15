import {
  calculatePlayerRoundScore,
  isValidTricksTaken,
  isValidBonusPoints,
} from '../scoringCalculator';

describe('scoringCalculator', () => {
  describe('calculatePlayerRoundScore', () => {
    it('calculates score for accurate bid with bonus', () => {
      const result = calculatePlayerRoundScore(3, 3, 10);

      expect(result.roundScore).toBe(40); // 10*3 + 10
      expect(result.bidAccurate).toBe(true);
      expect(result.bonusApplied).toBe(true);
      expect(result.baseScore).toBe(30);
      expect(result.bonusScore).toBe(10);
    });

    it('calculates score for accurate bid without bonus', () => {
      const result = calculatePlayerRoundScore(3, 3, 0);

      expect(result.roundScore).toBe(30); // 10*3 + 0
      expect(result.bidAccurate).toBe(true);
      expect(result.bonusApplied).toBe(false);
      expect(result.baseScore).toBe(30);
      expect(result.bonusScore).toBe(0);
    });

    it('calculates score for inaccurate bid with bonus input (bonus ignored)', () => {
      const result = calculatePlayerRoundScore(3, 1, 10);

      expect(result.roundScore).toBe(-10); // -5 * |3-1|
      expect(result.bidAccurate).toBe(false);
      expect(result.bonusApplied).toBe(false);
      expect(result.baseScore).toBe(0);
      expect(result.bonusScore).toBe(0);
    });

    it('calculates score for zero bid and zero tricks (accurate)', () => {
      const result = calculatePlayerRoundScore(0, 0, 5);

      expect(result.roundScore).toBe(5); // 10*0 + 5
      expect(result.bidAccurate).toBe(true);
      expect(result.bonusApplied).toBe(true);
    });

    it('calculates score for high bid vs low tricks', () => {
      const result = calculatePlayerRoundScore(10, 0, 0);

      expect(result.roundScore).toBe(-50); // -5 * |10-0|
      expect(result.bidAccurate).toBe(false);
    });

    it('calculates score for low bid vs high tricks', () => {
      const result = calculatePlayerRoundScore(2, 5, 0);

      expect(result.roundScore).toBe(-15); // -5 * |2-5|
      expect(result.bidAccurate).toBe(false);
    });

    it('provides explanation for accurate bid', () => {
      const result = calculatePlayerRoundScore(3, 3, 10);
      expect(result.explanation).toContain('Bid accurate');
      expect(result.explanation).toContain('40');
    });

    it('provides explanation for inaccurate bid', () => {
      const result = calculatePlayerRoundScore(3, 1, 0);
      expect(result.explanation).toContain('Bid inaccurate');
      expect(result.explanation).toContain('-10');
    });
  });

  describe('isValidTricksTaken', () => {
    it('accepts valid tricks within range', () => {
      expect(isValidTricksTaken(0, 5)).toBe(true);
      expect(isValidTricksTaken(3, 5)).toBe(true);
      expect(isValidTricksTaken(5, 5)).toBe(true);
    });

    it('rejects tricks greater than round number', () => {
      expect(isValidTricksTaken(6, 5)).toBe(false);
    });

    it('rejects negative tricks', () => {
      expect(isValidTricksTaken(-1, 5)).toBe(false);
    });

    it('rejects non-integer tricks', () => {
      expect(isValidTricksTaken(3.5, 5)).toBe(false);
    });
  });

  describe('isValidBonusPoints', () => {
    it('accepts valid bonus points', () => {
      expect(isValidBonusPoints(0)).toBe(true);
      expect(isValidBonusPoints(5)).toBe(true);
      expect(isValidBonusPoints(100)).toBe(true);
    });

    it('rejects negative bonus points', () => {
      expect(isValidBonusPoints(-1)).toBe(false);
    });

    it('rejects non-integer bonus points', () => {
      expect(isValidBonusPoints(5.5)).toBe(false);
    });
  });
});
