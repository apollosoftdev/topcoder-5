/**
 * Unit tests for AlgorithmQubits - Marathon Match Rating Calculation
 */

import {
  erf,
  normsinv,
  winProbability,
  calculateRatings
} from '../../../src/libs/algorithm/AlgorithmQubits';
import { RatingData } from '../../../src/libs/models';

describe('AlgorithmQubits', () => {
  describe('erf (error function)', () => {
    it('should return 0 for input 0', () => {
      expect(erf(0)).toBeCloseTo(0, 5);
    });

    it('should return approximately 0.8427 for input 1', () => {
      expect(erf(1)).toBeCloseTo(0.8427, 3);
    });

    it('should return approximately -0.8427 for input -1', () => {
      expect(erf(-1)).toBeCloseTo(-0.8427, 3);
    });

    it('should approach 1 for large positive values', () => {
      expect(erf(3)).toBeCloseTo(0.9999, 3);
    });

    it('should approach -1 for large negative values', () => {
      expect(erf(-3)).toBeCloseTo(-0.9999, 3);
    });

    it('should be symmetric: erf(-x) = -erf(x)', () => {
      const x = 0.5;
      expect(erf(-x)).toBeCloseTo(-erf(x), 5);
    });
  });

  describe('normsinv (inverse normal distribution)', () => {
    it('should return 0 for p=0.5', () => {
      expect(normsinv(0.5)).toBeCloseTo(0, 4);
    });

    it('should return approximately 1.645 for p=0.95', () => {
      expect(normsinv(0.95)).toBeCloseTo(1.645, 2);
    });

    it('should return approximately -1.645 for p=0.05', () => {
      expect(normsinv(0.05)).toBeCloseTo(-1.645, 2);
    });

    it('should return approximately 2.326 for p=0.99', () => {
      expect(normsinv(0.99)).toBeCloseTo(2.326, 2);
    });

    it('should return approximately -2.326 for p=0.01', () => {
      expect(normsinv(0.01)).toBeCloseTo(-2.326, 2);
    });

    it('should handle very low probability', () => {
      const result = normsinv(0.001);
      expect(result).toBeLessThan(-3);
    });

    it('should handle very high probability', () => {
      const result = normsinv(0.999);
      expect(result).toBeGreaterThan(3);
    });
  });

  describe('winProbability', () => {
    it('should return 0.5 for equal ratings and volatilities', () => {
      const prob = winProbability(1500, 300, 1500, 300);
      expect(prob).toBeCloseTo(0.5, 4);
    });

    it('should return > 0.5 when first coder has higher rating', () => {
      const prob = winProbability(1700, 300, 1500, 300);
      expect(prob).toBeGreaterThan(0.5);
    });

    it('should return < 0.5 when first coder has lower rating', () => {
      const prob = winProbability(1300, 300, 1500, 300);
      expect(prob).toBeLessThan(0.5);
    });

    it('should be symmetric: P(A beats B) + P(B beats A) ≈ 1', () => {
      const probAB = winProbability(1600, 250, 1400, 350);
      const probBA = winProbability(1400, 350, 1600, 250);
      expect(probAB + probBA).toBeCloseTo(1, 4);
    });

    it('should return probability close to 1 for much higher rating', () => {
      const prob = winProbability(2500, 200, 1200, 200);
      expect(prob).toBeGreaterThan(0.95);
    });

    it('should return probability close to 0 for much lower rating', () => {
      const prob = winProbability(1200, 200, 2500, 200);
      expect(prob).toBeLessThan(0.05);
    });

    it('should account for volatility differences', () => {
      // Higher volatility means more uncertainty
      const probLowVol = winProbability(1600, 100, 1400, 100);
      const probHighVol = winProbability(1600, 400, 1400, 400);
      // With higher volatility, the probability should be closer to 0.5
      expect(probHighVol).toBeLessThan(probLowVol);
      expect(probHighVol).toBeGreaterThan(0.5);
    });
  });

  describe('calculateRatings', () => {
    it('should return empty array for empty input', () => {
      const result = calculateRatings([]);
      expect(result).toEqual([]);
    });

    it('should initialize new players with rating 1200 and vol 515', () => {
      // Use a realistic scenario: new player competing against established players
      const coders: RatingData[] = [
        { coderId: 1, rating: 0, vol: 0, numRatings: 0, score: 100 },      // New player wins
        { coderId: 2, rating: 1600, vol: 300, numRatings: 10, score: 80 }, // Established player
        { coderId: 3, rating: 1400, vol: 300, numRatings: 5, score: 60 }   // Another established player
      ];

      const results = calculateRatings(coders);

      expect(results).toHaveLength(3);
      // New player who won should have rating > 1200 (beat expectations)
      const winner = results.find(r => r.coderId === 1);
      expect(winner?.newRating).toBeGreaterThan(1200);
      // New player's volatility should be set to 385 after first competition
      expect(winner?.newVol).toBe(385);
    });

    it('should increase rating for winners and decrease for losers', () => {
      // Use different ratings so performance vs expectation is measurable
      // Lower-rated player wins (upset) -> gains rating
      // Higher-rated player loses -> loses rating
      const coders: RatingData[] = [
        { coderId: 1, rating: 1400, vol: 300, numRatings: 5, score: 100 }, // Lower rated wins (upset)
        { coderId: 2, rating: 1600, vol: 300, numRatings: 5, score: 80 },  // Mid rated
        { coderId: 3, rating: 1800, vol: 300, numRatings: 5, score: 60 }   // Higher rated loses
      ];

      const results = calculateRatings(coders);

      const upset = results.find(r => r.coderId === 1);
      const loser = results.find(r => r.coderId === 3);

      // Upset winner (lower rated beat higher rated) should gain rating
      expect(upset?.newRating).toBeGreaterThan(upset?.oldRating || 0);
      // High rated player who lost to lower rated should lose rating
      expect(loser?.newRating).toBeLessThan(loser?.oldRating || 0);
    });

    it('should handle tied scores by averaging ranks', () => {
      const coders: RatingData[] = [
        { coderId: 1, rating: 1500, vol: 300, numRatings: 5, score: 100 },
        { coderId: 2, rating: 1500, vol: 300, numRatings: 5, score: 75 }, // Tied
        { coderId: 3, rating: 1500, vol: 300, numRatings: 5, score: 75 }, // Tied
        { coderId: 4, rating: 1500, vol: 300, numRatings: 5, score: 50 }
      ];

      const results = calculateRatings(coders);

      // Tied coders should have similar rating changes
      const coder2 = results.find(r => r.coderId === 2);
      const coder3 = results.find(r => r.coderId === 3);

      expect(coder2?.newRating).toBe(coder3?.newRating);
    });

    it('should apply rating cap based on numRatings', () => {
      // New player with huge score advantage should still be capped
      const coders: RatingData[] = [
        { coderId: 1, rating: 0, vol: 0, numRatings: 0, score: 1000 }, // New player, huge win
        { coderId: 2, rating: 1200, vol: 300, numRatings: 1, score: 1 }
      ];

      const results = calculateRatings(coders);
      const newPlayer = results.find(r => r.coderId === 1);

      // Cap for new player (numRatings=0): 150 + 1500/(2+0) = 150 + 750 = 900
      // New rating should be capped at 1200 + 900 = 2100 max
      expect(newPlayer?.newRating).toBeLessThanOrEqual(2100);
    });

    it('should set volatility to 385 after first competition', () => {
      // New player competing in their first match
      const coders: RatingData[] = [
        { coderId: 1, rating: 0, vol: 0, numRatings: 0, score: 100 },      // New player
        { coderId: 2, rating: 1500, vol: 300, numRatings: 10, score: 80 }  // Established player
      ];

      const results = calculateRatings(coders);
      const newPlayer = results.find(r => r.coderId === 1);

      // After first competition, new player's volatility should be FIRST_VOLATILITY (385)
      expect(newPlayer?.newVol).toBe(385);
    });

    it('should handle single participant rounds', () => {
      // Single participant is an edge case - rating should remain unchanged
      // as there's no competition to measure performance against
      const coders: RatingData[] = [
        { coderId: 1, rating: 1500, vol: 300, numRatings: 5, score: 100 }
      ];

      const results = calculateRatings(coders);

      expect(results).toHaveLength(1);
      // Single participant should have unchanged rating (no competition)
      expect(results[0].newRating).toBe(results[0].oldRating);
      expect(results[0].newVol).toBe(results[0].oldVol);
    });

    it('should preserve old rating values in output', () => {
      const coders: RatingData[] = [
        { coderId: 1, rating: 1650, vol: 280, numRatings: 5, score: 95 },
        { coderId: 2, rating: 1480, vol: 320, numRatings: 3, score: 88 }
      ];

      const results = calculateRatings(coders);

      const coder1 = results.find(r => r.coderId === 1);
      const coder2 = results.find(r => r.coderId === 2);

      expect(coder1?.oldRating).toBe(1650);
      expect(coder1?.oldVol).toBe(280);
      expect(coder2?.oldRating).toBe(1480);
      expect(coder2?.oldVol).toBe(320);
    });

    it('should handle mixed provisional and non-provisional coders', () => {
      const coders: RatingData[] = [
        { coderId: 1, rating: 1650, vol: 280, numRatings: 5, score: 95 },  // Veteran
        { coderId: 2, rating: 0, vol: 0, numRatings: 0, score: 88 },       // Provisional
        { coderId: 3, rating: 2100, vol: 200, numRatings: 15, score: 92 }  // Elite
      ];

      const results = calculateRatings(coders);

      expect(results).toHaveLength(3);

      // All should have valid new ratings
      results.forEach(r => {
        expect(r.newRating).toBeGreaterThan(0);
        expect(r.newVol).toBeGreaterThan(0);
      });
    });

    it('should ensure rating never goes below 1', () => {
      // Create scenario where loser might get very negative change
      const coders: RatingData[] = [
        { coderId: 1, rating: 2500, vol: 100, numRatings: 50, score: 100 },
        { coderId: 2, rating: 100, vol: 500, numRatings: 1, score: 0 }  // Very low rating, bad performance
      ];

      const results = calculateRatings(coders);
      const loser = results.find(r => r.coderId === 2);

      expect(loser?.newRating).toBeGreaterThanOrEqual(1);
    });

    it('should keep volatility within bounds (75-500)', () => {
      const coders: RatingData[] = [
        { coderId: 1, rating: 1500, vol: 100, numRatings: 10, score: 100 },
        { coderId: 2, rating: 1500, vol: 100, numRatings: 10, score: 50 }
      ];

      const results = calculateRatings(coders);

      results.forEach(r => {
        expect(r.newVol).toBeGreaterThanOrEqual(75);
        expect(r.newVol).toBeLessThanOrEqual(500);
      });
    });
  });
});
