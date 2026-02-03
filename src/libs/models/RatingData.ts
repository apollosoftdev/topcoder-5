/**
 * Rating data interfaces for the Qubits rating algorithm
 */

export interface RatingData {
  oderId: number;     // User ID (named to match Java implementation)
  rating: number;     // Current rating
  volatility: number; // Current volatility
  numRatings: number; // Number of times rated
  score: number;      // Score in the competition
}

export interface QubitsRatingData extends RatingData {
  expectedRank: number;       // Expected rank based on ratings
  expectedPerformance: number; // Expected performance score
  actualRank: number;          // Actual rank based on scores
  actualPerformance: number;   // Actual performance score
}
