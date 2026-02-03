/**
 * Rating data interfaces for marathon match rating calculation
 */

/**
 * Input data for a coder in rating calculation
 */
export interface RatingData {
  coderId: number;
  rating: number;      // Current rating (0 if new)
  vol: number;         // Volatility (0 if new)
  numRatings: number;  // Past competitions count
  score: number;       // systemPointTotal from LongCompResult
}

/**
 * Output data after rating calculation with old and new values
 */
export interface CalculatedRating extends RatingData {
  oldRating: number;
  oldVol: number;
  newRating: number;
  newVol: number;
}
