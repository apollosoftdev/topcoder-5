/**
 * Marathon Match Rating Service
 * Replaces Informix operations with PostgreSQL/Prisma operations
 * Follows the exact same business logic as the original
 */

import _ from 'lodash';
import * as helper from '../common/helper';
import database from '../common/database';
import logger, { buildService } from '../common/logger';
import { processMarathonRatings } from '../libs/process/MarathonRatingProcess';

/**
 * Calculate ratings for a Marathon Match challenge
 * Follows the exact same logic as the original calculate function
 */
export async function calculate(challengeId: string, legacyId: number): Promise<void> {
  try {
    logger.debug('=== Marathon Match ratings calculation start ===');

    // Get challenge ID from legacy ID (equivalent to getRoundId in original)
    const dbChallengeId = await database.getChallengeId(legacyId);
    if (!dbChallengeId) {
      throw new Error(`No challenge found for legacy ID: ${legacyId}`);
    }

    logger.debug(`challenge id ${dbChallengeId}`);

    // Get LCR entries for the challenge (equivalent to getLCREntries in original)
    // Using UserChallenge model instead of LongCompResult
    const lcrEntries = await database.getLCREntries(dbChallengeId);

    // Get submissions and final submissions (same as original)
    const submissions = await helper.getSubmissions(challengeId);
    const finalSubmissions = await helper.getFinalSubmissions(submissions);

    logger.debug(`Submissions: ${JSON.stringify(submissions)}`);
    logger.debug(`Final submissions: ${JSON.stringify(finalSubmissions)}`);
    

    // Update LCR entries for members who submitted and have attended='N' (same logic as original)
    // Note: using userId instead of coderId to match the new schema
    finalSubmissions.forEach(async (submission) => {
      const res = _.filter(lcrEntries, { userId: parseInt(submission.memberId) });
      if (res && res[0] && res[0].attended && res[0].attended === 'N') {
        // Update the attended flag (equivalent to updateLCREntry in original)
        await database.updateLCREntry(dbChallengeId, res[0].userId);
      }
    });
    
    // Initiate rating calculation locally instead of calling external API
    logger.debug(`=== Initiating local rating calculation for challenge: ${challengeId} ===`);

    // Get roundId for the challenge
    const roundId = await database.getRoundIdForChallenge(legacyId);
    if (!roundId) {
      logger.warn(`No round found for legacy ID ${legacyId}, skipping rating calculation`);
      return;
    }

    // Process ratings locally
    const result = await processMarathonRatings(roundId);
    logger.info(`Rating calculation result: ${result.status} - ${result.message}`);

    logger.debug('=== Marathon Match ratings calculation success ===');
  } catch (error) {
    logger.debug('=== Marathon Match ratings calculation failure ===');
    logger.error('Error in rating calculation', { error });
    throw new Error(error instanceof Error ? error.message : String(error));
  } finally {
    logger.debug('=== Marathon Match ratings calculation end ===');
  }
}

/**
 * Load ratings data to data warehouse
 * Follows the exact same logic as the original loadRatings function
 */
export async function loadRatings(challengeId: string): Promise<void> {
  try {
    logger.debug('=== Load Ratings start ===');

    await helper.initiateLoadRatings(challengeId);

    logger.debug('=== Load Ratings end ===');
  } catch (error) {
    logger.error('Error in load ratings', { error });
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Load coders data to data warehouse
 * Follows the exact same logic as the original loadCoders function
 */
export async function loadCoders(challengeId: string): Promise<void> {
  try {
    logger.debug('=== Load Coders start ===');

    await helper.initiateLoadCoders(challengeId);

    logger.debug('=== Load Coders end ===');
  } catch (error) {
    logger.error('Error in load coders', { error });
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

const MarathonRatingsService = {
  calculate,
  loadCoders,
  loadRatings
};

// Build service with logger methods (same as original)
buildService(MarathonRatingsService);

export default MarathonRatingsService; 