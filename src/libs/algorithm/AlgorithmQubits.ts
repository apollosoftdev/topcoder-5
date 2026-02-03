/**
 * AlgorithmQubits - Marathon Match Rating Calculation Algorithm
 * Ported from Java ratings-calculation-service
 *
 * This implements the Topcoder rating algorithm for marathon matches,
 * based on ELO-style rating with volatility adjustments.
 */

import { RatingData, CalculatedRating } from '../models';
import {
  INITIAL_SCORE,
  INITIAL_VOLATILITY,
  FIRST_VOLATILITY,
} from './constants';

/**
 * Error function (erf) approximation using Horner's method
 * Used in probability calculations
 *
 * @param x - Input value
 * @returns Approximation of erf(x)
 */
export function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Inverse normal distribution (normsinv)
 * Calculates the inverse of the standard normal cumulative distribution
 *
 * @param p - Probability value (0 < p < 1)
 * @returns The z-score corresponding to the probability
 */
export function normsinv(p: number): number {
  // Coefficients for rational approximation
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00
  ];

  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01
  ];

  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00
  ];

  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00
  ];

  // Define break-points
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  // Rational approximation for lower region
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // Rational approximation for central region
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  // Rational approximation for upper region
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/**
 * Calculate win probability between two coders
 * Uses their ratings and volatilities to determine expected outcome
 *
 * @param ratingA - Rating of coder A
 * @param volA - Volatility of coder A
 * @param ratingB - Rating of coder B
 * @param volB - Volatility of coder B
 * @returns Probability that coder A beats coder B
 */
export function winProbability(ratingA: number, volA: number, ratingB: number, volB: number): number {
  return 0.5 * (erf((ratingA - ratingB) / Math.sqrt(2.0 * (volA * volA + volB * volB))) + 1);
}

/**
 * Calculate the average rating of all coders
 *
 * @param coders - Array of rating data
 * @returns Average rating
 */
function calculateAverageRating(coders: RatingData[]): number {
  if (coders.length === 0) return 0;
  const sum = coders.reduce((acc, coder) => acc + coder.rating, 0);
  return sum / coders.length;
}

/**
 * Calculate competition factor (match standard deviation)
 * Used to scale rating changes based on match volatility
 *
 * @param coders - Array of rating data
 * @returns Competition factor
 */
function calculateCompetitionFactor(coders: RatingData[]): number {
  if (coders.length === 0) return 0;

  const avgRating = calculateAverageRating(coders);
  let sumSquares = 0;

  for (const coder of coders) {
    const diff = coder.rating - avgRating;
    sumSquares += diff * diff;
    sumSquares += coder.vol * coder.vol;
  }

  return Math.sqrt(sumSquares / coders.length);
}

/**
 * Calculate expected rank for a coder based on win probabilities
 *
 * @param coder - The coder to calculate expected rank for
 * @param allCoders - All coders in the competition
 * @returns Expected rank (1-based)
 */
function calculateExpectedRank(coder: RatingData, allCoders: RatingData[]): number {
  let expectedRank = 0.5; // Start with 0.5 for the coder's own position

  for (const other of allCoders) {
    if (other.coderId !== coder.coderId) {
      // Add probability that other coder beats this coder
      expectedRank += winProbability(other.rating, other.vol, coder.rating, coder.vol);
    }
  }

  return expectedRank;
}

/**
 * Calculate actual ranks based on scores, handling ties by averaging
 *
 * @param coders - Array of rating data with scores
 * @returns Map of coderId to actual rank
 */
function calculateActualRanks(coders: RatingData[]): Map<number, number> {
  // Sort by score descending
  const sorted = [...coders].sort((a, b) => b.score - a.score);
  const ranks = new Map<number, number>();

  let i = 0;
  while (i < sorted.length) {
    const currentScore = sorted[i].score;
    let j = i;

    // Find all coders with the same score (ties)
    while (j < sorted.length && sorted[j].score === currentScore) {
      j++;
    }

    // Average rank for tied coders (1-based)
    const avgRank = (i + 1 + j) / 2; // Average of first and last rank in tie

    for (let k = i; k < j; k++) {
      ranks.set(sorted[k].coderId, avgRank);
    }

    i = j;
  }

  return ranks;
}

/**
 * Calculate weight factor based on number of ratings and current rating
 * Includes elite player weight penalty
 *
 * @param numRatings - Number of past rated competitions
 * @param rating - Current rating
 * @returns Weight factor
 */
function calculateWeight(numRatings: number, rating: number): number {
  // Base weight calculation
  const weight = 1 / (1 - (0.42 / (numRatings + 1) + 0.18)) - 1;

  // Apply elite weight penalty
  if (rating >= 2500) {
    return weight * 0.8;
  } else if (rating >= 2000) {
    return weight * 0.9;
  }

  return weight;
}

/**
 * Main rating calculation function
 * Processes all coders and returns updated ratings
 *
 * @param coders - Array of rating data for all participants
 * @returns Array of calculated ratings with old and new values
 */
export function calculateRatings(coders: RatingData[]): CalculatedRating[] {
  if (coders.length === 0) {
    return [];
  }

  // Single participant edge case - no competition to rate against
  if (coders.length === 1) {
    const coder = coders[0];
    return [{
      ...coder,
      oldRating: coder.rating,
      oldVol: coder.vol,
      newRating: coder.rating,
      newVol: coder.vol
    }];
  }

  // Step 1: Initialize new players
  const initializedCoders: RatingData[] = coders.map(coder => {
    if (coder.numRatings === 0) {
      return {
        ...coder,
        rating: INITIAL_SCORE,
        vol: INITIAL_VOLATILITY
      };
    }
    return { ...coder };
  });

  // Step 2: Calculate competition factor
  const cf = calculateCompetitionFactor(initializedCoders);

  // Step 3: Calculate actual ranks
  const actualRanks = calculateActualRanks(initializedCoders);

  // Step 4: Calculate new ratings for each coder
  const results: CalculatedRating[] = initializedCoders.map(coder => {
    const oldRating = coder.rating;
    const oldVol = coder.vol;

    // Calculate expected rank
    const expectedRank = calculateExpectedRank(coder, initializedCoders);
    const actualRank = actualRanks.get(coder.coderId) || expectedRank;

    // Calculate expected and actual performance
    const expectedPerf = -normsinv((expectedRank - 0.5) / initializedCoders.length);
    const actualPerf = -normsinv((actualRank - 0.5) / initializedCoders.length);

    // Calculate performance difference
    const perfDiff = actualPerf - expectedPerf;

    // Calculate weight
    const weight = calculateWeight(coder.numRatings, oldRating);

    // Calculate rating cap: cap = 150 + 1500/(2 + numRatings)
    const cap = 150 + 1500 / (2 + coder.numRatings);

    // Calculate rating change
    let ratingChange = cf * perfDiff / (weight + 1);

    // Apply cap
    if (ratingChange > cap) {
      ratingChange = cap;
    } else if (ratingChange < -cap) {
      ratingChange = -cap;
    }

    // Calculate new rating
    let newRating = Math.round(oldRating + ratingChange);

    // Ensure rating doesn't go below 1
    if (newRating < 1) {
      newRating = 1;
    }

    // Calculate new volatility
    let newVol: number;
    if (coder.numRatings === 0) {
      // First competition: use FIRST_VOLATILITY
      newVol = FIRST_VOLATILITY;
    } else {
      // Update volatility based on performance
      const volWeight = weight / (weight + 1);
      const perfSquare = perfDiff * perfDiff;
      newVol = Math.round(Math.sqrt(volWeight * oldVol * oldVol + (1 - volWeight) * cf * cf * perfSquare));

      // Ensure volatility doesn't go below 75 or above 500
      if (newVol < 75) {
        newVol = 75;
      } else if (newVol > 500) {
        newVol = 500;
      }
    }

    return {
      ...coder,
      rating: coder.rating, // Original rating (before initialization for new players)
      oldRating: coders.find(c => c.coderId === coder.coderId)?.rating || 0,
      oldVol: coders.find(c => c.coderId === coder.coderId)?.vol || 0,
      newRating,
      newVol
    };
  });

  return results;
}
