/**
 * Marathon Data Loader
 * Loads coder data for marathon match rating calculation from the database
 */

import database from '../../common/database';
import { RatingData } from '../models';
import { MM_RATING_TYPE_ID } from '../algorithm';
import logger from '../../common/logger';

export interface LoadedData {
  provisional: RatingData[];
  nonProvisional: RatingData[];
}

/**
 * Load marathon match data for rating calculation
 * Fetches LongCompResult entries with their existing AlgoRating data
 *
 * @param roundId - The round ID to load data for
 * @returns Object containing provisional (new) and non-provisional (existing) coders
 */
export async function loadMarathonData(roundId: number): Promise<LoadedData> {
  logger.info(`Loading marathon data for round ${roundId}`);

  const prisma = database.getClient();

  // Query LongCompResult entries that:
  // - Match the roundId
  // - Have attended = 'Y'
  // - Have not been rated yet (newRating IS NULL)
  const results = await prisma.longCompResult.findMany({
    where: {
      roundId,
      attended: 'Y',
      newRating: null
    },
    select: {
      coderId: true,
      systemPointTotal: true
    }
  });

  if (results.length === 0) {
    logger.info('No unrated attendees found for this round');
    return { provisional: [], nonProvisional: [] };
  }

  // Get AlgoRating data for all coders
  const coderIds = results.map(r => r.coderId);
  const algoRatings = await prisma.algoRating.findMany({
    where: {
      coderId: { in: coderIds },
      algoRatingTypeId: MM_RATING_TYPE_ID
    },
    select: {
      coderId: true,
      rating: true,
      vol: true,
      numRatings: true
    }
  });

  // Create a map of coderId to AlgoRating
  const ratingMap = new Map<number, { rating: number; vol: number; numRatings: number }>();
  for (const ar of algoRatings) {
    ratingMap.set(ar.coderId, {
      rating: ar.rating,
      vol: ar.vol,
      numRatings: ar.numRatings
    });
  }

  // Build RatingData for each coder
  const allCoders: RatingData[] = results.map(result => {
    const existing = ratingMap.get(result.coderId);
    return {
      coderId: result.coderId,
      rating: existing?.rating || 0,
      vol: existing?.vol || 0,
      numRatings: existing?.numRatings || 0,
      score: Number(result.systemPointTotal) || 0
    };
  });

  // Separate provisional (numRatings === 0) from non-provisional
  const provisional = allCoders.filter(c => c.numRatings === 0);
  const nonProvisional = allCoders.filter(c => c.numRatings > 0);

  logger.info(`Loaded ${provisional.length} provisional and ${nonProvisional.length} non-provisional coders`);

  return { provisional, nonProvisional };
}
