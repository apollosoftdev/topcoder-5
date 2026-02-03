/**
 * Marathon Rating Process
 * Orchestrates the marathon match rating calculation process
 */

import database from '../../common/database';
import { loadMarathonData } from '../loader';
import { persistRatings } from '../persistor';
import { calculateRatings } from '../algorithm';
import { CalculatedRating } from '../models';
import logger from '../../common/logger';

export interface ProcessResult {
  status: 'SUCCESS' | 'FAIL' | 'ALREADY_CALCULATED';
  message: string;
}

/**
 * Process marathon ratings for a given round
 *
 * Flow:
 * 1. Check if round already rated -> return ALREADY_CALCULATED
 * 2. Load data (provisional + non-provisional)
 * 3. If no unrated attendees -> return SUCCESS (nothing to process)
 * 4. Run algorithm on provisional coders (filter to numRatings=1 after)
 * 5. Run algorithm on non-provisional coders
 * 6. Persist all results in transaction
 * 7. Return SUCCESS
 *
 * @param roundId - The round ID to process
 * @returns ProcessResult with status and message
 */
export async function processMarathonRatings(roundId: number): Promise<ProcessResult> {
  logger.info(`Starting marathon rating process for round ${roundId}`);

  try {
    // Step 1: Check if round already rated
    const isAlreadyRated = await isRoundAlreadyRated(roundId);
    if (isAlreadyRated) {
      logger.info(`Round ${roundId} has already been rated`);
      return {
        status: 'ALREADY_CALCULATED',
        message: `Round ${roundId} has already been rated`
      };
    }

    // Step 2: Load data
    const { provisional, nonProvisional } = await loadMarathonData(roundId);

    // Step 3: Check if there are any coders to process
    if (provisional.length === 0 && nonProvisional.length === 0) {
      logger.info(`No unrated attendees found for round ${roundId}`);
      return {
        status: 'SUCCESS',
        message: 'No unrated attendees to process'
      };
    }

    const allResults: CalculatedRating[] = [];

    // Step 4: Process provisional coders (two-phase processing)
    // For provisional coders, we calculate ratings including them to get their initial rating
    if (provisional.length > 0) {
      logger.info(`Processing ${provisional.length} provisional coders`);

      // Combine all coders for the provisional calculation
      // This ensures provisional coders are rated against the full field
      const allCoders = [...provisional, ...nonProvisional];
      const provisionalResults = calculateRatings(allCoders);

      // Filter to only include provisional coders (those who had numRatings=0)
      const provisionalCoderIds = new Set(provisional.map(c => c.coderId));
      const filteredProvisionalResults = provisionalResults.filter(
        r => provisionalCoderIds.has(r.coderId)
      );

      allResults.push(...filteredProvisionalResults);
      logger.info(`Calculated ratings for ${filteredProvisionalResults.length} provisional coders`);
    }

    // Step 5: Process non-provisional coders
    if (nonProvisional.length > 0) {
      logger.info(`Processing ${nonProvisional.length} non-provisional coders`);

      // For non-provisional coders, we also include provisional coders in the calculation
      // so they are rated against the full field
      const allCoders = [...provisional, ...nonProvisional];
      const nonProvisionalResults = calculateRatings(allCoders);

      // Filter to only include non-provisional coders
      const nonProvisionalCoderIds = new Set(nonProvisional.map(c => c.coderId));
      const filteredNonProvisionalResults = nonProvisionalResults.filter(
        r => nonProvisionalCoderIds.has(r.coderId)
      );

      allResults.push(...filteredNonProvisionalResults);
      logger.info(`Calculated ratings for ${filteredNonProvisionalResults.length} non-provisional coders`);
    }

    // Step 6: Persist all results
    logger.info(`Persisting ${allResults.length} rating results`);
    await persistRatings(roundId, allResults);

    // Step 7: Return success
    logger.info(`Successfully processed marathon ratings for round ${roundId}`);
    return {
      status: 'SUCCESS',
      message: `Successfully calculated and persisted ratings for ${allResults.length} coders`
    };
  } catch (error) {
    logger.error(`Error processing marathon ratings for round ${roundId}`, { error });
    return {
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if a round has already been rated
 *
 * @param roundId - The round ID to check
 * @returns true if round is already rated
 */
async function isRoundAlreadyRated(roundId: number): Promise<boolean> {
  const prisma = database.getClient();

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { ratedInd: true }
  });

  // If round doesn't exist, it's not rated
  if (!round) {
    return false;
  }

  // ratedInd = 1 means rated, 0 or null means not rated
  return round.ratedInd === 1;
}
