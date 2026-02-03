/**
 * Marathon Data Persistor
 * Persists calculated ratings back to the database
 */

import database from '../../common/database';
import { CalculatedRating } from '../models';
import { MM_RATING_TYPE_ID } from '../algorithm';
import logger from '../../common/logger';

/**
 * Persist calculated ratings to the database
 * Updates LongCompResult, upserts AlgoRating, inserts AlgoRatingHistory, and marks round as rated
 *
 * @param roundId - The round ID for which ratings were calculated
 * @param results - Array of calculated ratings to persist
 */
export async function persistRatings(
  roundId: number,
  results: CalculatedRating[]
): Promise<void> {
  if (results.length === 0) {
    logger.info('No results to persist');
    return;
  }

  logger.info(`Persisting ${results.length} ratings for round ${roundId}`);

  const prisma = database.getClient();

  // Execute all operations in a transaction
  await prisma.$transaction(async (tx) => {
    for (const result of results) {
      // 1. Update LongCompResult with rating data
      await tx.longCompResult.updateMany({
        where: {
          roundId,
          coderId: result.coderId
        },
        data: {
          rated: 1,
          oldRating: result.oldRating,
          oldVol: result.oldVol,
          newRating: result.newRating,
          newVol: result.newVol
        }
      });

      // 2. Upsert AlgoRating - update or create rating record
      const existingRating = await tx.algoRating.findFirst({
        where: {
          coderId: result.coderId,
          algoRatingTypeId: MM_RATING_TYPE_ID
        }
      });

      if (existingRating) {
        // Update existing rating
        await tx.algoRating.update({
          where: { id: existingRating.id },
          data: {
            rating: result.newRating,
            vol: result.newVol,
            numRatings: result.numRatings + 1,
            lastRatedRoundId: roundId,
            highestRating: Math.max(existingRating.highestRating || 0, result.newRating),
            lowestRating: existingRating.lowestRating
              ? Math.min(existingRating.lowestRating, result.newRating)
              : result.newRating,
            numCompetitions: (existingRating.numCompetitions || 0) + 1,
            roundId: roundId,
            modifyDate: new Date()
          }
        });
      } else {
        // Create new rating record
        await tx.algoRating.create({
          data: {
            coderId: result.coderId,
            rating: result.newRating,
            vol: result.newVol,
            numRatings: 1,
            algoRatingTypeId: MM_RATING_TYPE_ID,
            highestRating: result.newRating,
            lowestRating: result.newRating,
            firstRatedRoundId: roundId,
            lastRatedRoundId: roundId,
            numCompetitions: 1,
            roundId: roundId,
            modifyDate: new Date()
          }
        });
      }

      // 3. Insert AlgoRatingHistory
      await tx.algoRatingHistory.create({
        data: {
          coderId: result.coderId,
          roundId: roundId,
          algoRatingTypeId: MM_RATING_TYPE_ID,
          rating: result.newRating,
          vol: result.newVol,
          numRatings: result.numRatings + 1,
          numCompetitions: (result.numRatings || 0) + 1,
          modifyDate: new Date()
        }
      });
    }

    // 4. Mark round as rated
    await tx.round.update({
      where: { id: roundId },
      data: {
        ratedInd: 1,
        modifyDate: new Date()
      }
    });
  });

  logger.info(`Successfully persisted ratings for round ${roundId}`);
}
