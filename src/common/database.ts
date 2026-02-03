/**
 * Database service using Prisma for PostgreSQL operations
 * Replaces Informix operations with equivalent PostgreSQL operations
 */

import { PrismaClient, AlgoRating } from '@prisma/client';
import logger from './logger';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  /**
   * Get Prisma client instance
   */
  getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Get challenge ID for the given legacy challenge ID
   * Replaces the original getRoundId function
   * @param legacyId - Legacy challenge ID (projectId)
   * @returns challengeId corresponding to the legacy ID
   */
  async getChallengeId(legacyId: number): Promise<number | null> {
    try {
      logger.info(`Getting challenge information for legacy ID: ${legacyId}`);
      
      const challenge = await this.prisma.challenge.findUnique({
        where: { legacyId },
        select: { id: true }
      });

      return challenge?.id ? Number(challenge.id) : null;
    } catch (error) {
      logger.error('Error getting challenge ID', { legacyId, error });
      throw error;
    }
  }

  /**
   * Get user challenge entries for the given challenge ID
   * Replaces the original getLCREntries function (long_comp_result → user_challenges)
   * @param challengeId - Challenge ID
   * @returns user challenge entries
   */
  async getLCREntries(challengeId: number) {
    try {
      return await this.prisma.userChallenge.findMany({
        where: { challengeId },
      });
    } catch (error) {
      logger.error('Error getting LCR entries', { challengeId, error });
      throw error;
    }
  }

  /**
   * Update user challenge entry to mark attendance
   * Replaces the original updateLCREntry function
   * @param challengeId - Challenge ID
   * @param userId - User ID (equivalent to coderId in original)
   */
  async updateLCREntry(challengeId: number, userId: number): Promise<void> {
    try {
      await this.prisma.userChallenge.updateMany({
        where: {
          challengeId,
          userId,
        },
        data: {
          attended: 'Y',
        },
      });
    } catch (error) {
      logger.error('Error updating LCR entry', { challengeId, userId, error });
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }

  // ============================================================================
  // Marathon Match Rating Methods
  // ============================================================================

  /**
   * Get round ID for a given legacy challenge ID
   * Uses the Round table to find the round associated with a challenge
   * @param legacyId - Legacy challenge ID
   * @returns round ID or null if not found
   */
  async getRoundIdForChallenge(legacyId: number): Promise<number | null> {
    try {
      logger.info(`Getting round ID for legacy challenge ID: ${legacyId}`);

      // First get the challenge
      const challenge = await this.prisma.challenge.findUnique({
        where: { legacyId },
        select: { id: true }
      });

      if (!challenge) {
        logger.warn(`No challenge found for legacy ID: ${legacyId}`);
        return null;
      }

      // Find the round associated with this challenge
      // The round is linked via tcDirectProjectId in the original schema
      // For now, we'll look for a round with matching tcDirectProjectId
      const round = await this.prisma.round.findFirst({
        where: { tcDirectProjectId: legacyId },
        select: { id: true }
      });

      if (!round) {
        logger.warn(`No round found for legacy ID: ${legacyId}`);
        return null;
      }

      return round.id;
    } catch (error) {
      logger.error('Error getting round ID for challenge', { legacyId, error });
      throw error;
    }
  }

  /**
   * Get coder's algo rating for a specific rating type
   * @param coderId - The coder ID
   * @param algoRatingTypeId - The rating type ID (3 for Marathon Match)
   * @returns AlgoRating or null if not found
   */
  async getCoderAlgoRating(coderId: number, algoRatingTypeId: number): Promise<AlgoRating | null> {
    try {
      return await this.prisma.algoRating.findFirst({
        where: {
          coderId,
          algoRatingTypeId
        }
      });
    } catch (error) {
      logger.error('Error getting coder algo rating', { coderId, algoRatingTypeId, error });
      throw error;
    }
  }

  /**
   * Check if a round has already been rated
   * @param roundId - The round ID to check
   * @returns true if the round is already rated
   */
  async isRoundAlreadyRated(roundId: number): Promise<boolean> {
    try {
      const round = await this.prisma.round.findUnique({
        where: { id: roundId },
        select: { ratedInd: true }
      });

      if (!round) {
        return false;
      }

      return round.ratedInd === 1;
    } catch (error) {
      logger.error('Error checking if round is rated', { roundId, error });
      throw error;
    }
  }

  /**
   * Mark a round as rated
   * @param roundId - The round ID to mark as rated
   */
  async markRoundAsRated(roundId: number): Promise<void> {
    try {
      await this.prisma.round.update({
        where: { id: roundId },
        data: {
          ratedInd: 1,
          modifyDate: new Date()
        }
      });
      logger.info(`Marked round ${roundId} as rated`);
    } catch (error) {
      logger.error('Error marking round as rated', { roundId, error });
      throw error;
    }
  }

  /**
   * Update LongCompResult with rating data
   * @param roundId - The round ID
   * @param coderId - The coder ID
   * @param data - Rating data to update
   */
  async updateLongCompResultRating(
    roundId: number,
    coderId: number,
    data: {
      rated: number;
      oldRating: number;
      oldVol: number;
      newRating: number;
      newVol: number;
    }
  ): Promise<void> {
    try {
      await this.prisma.longCompResult.updateMany({
        where: { roundId, coderId },
        data
      });
    } catch (error) {
      logger.error('Error updating LongCompResult rating', { roundId, coderId, error });
      throw error;
    }
  }

  /**
   * Upsert algo rating for a coder
   * @param data - AlgoRating data
   */
  async upsertAlgoRating(data: {
    coderId: number;
    algoRatingTypeId: number;
    rating: number;
    vol: number;
    numRatings: number;
    roundId: number;
    highestRating?: number;
    lowestRating?: number;
    firstRatedRoundId?: number;
    lastRatedRoundId?: number;
    numCompetitions?: number;
  }): Promise<void> {
    try {
      const existing = await this.prisma.algoRating.findFirst({
        where: {
          coderId: data.coderId,
          algoRatingTypeId: data.algoRatingTypeId
        }
      });

      if (existing) {
        await this.prisma.algoRating.update({
          where: { id: existing.id },
          data: {
            rating: data.rating,
            vol: data.vol,
            numRatings: data.numRatings,
            lastRatedRoundId: data.lastRatedRoundId || data.roundId,
            highestRating: data.highestRating
              ? Math.max(existing.highestRating || 0, data.highestRating)
              : existing.highestRating,
            lowestRating: data.lowestRating
              ? (existing.lowestRating ? Math.min(existing.lowestRating, data.lowestRating) : data.lowestRating)
              : existing.lowestRating,
            numCompetitions: data.numCompetitions || (existing.numCompetitions || 0) + 1,
            roundId: data.roundId,
            modifyDate: new Date()
          }
        });
      } else {
        await this.prisma.algoRating.create({
          data: {
            coderId: data.coderId,
            algoRatingTypeId: data.algoRatingTypeId,
            rating: data.rating,
            vol: data.vol,
            numRatings: data.numRatings,
            highestRating: data.highestRating || data.rating,
            lowestRating: data.lowestRating || data.rating,
            firstRatedRoundId: data.firstRatedRoundId || data.roundId,
            lastRatedRoundId: data.lastRatedRoundId || data.roundId,
            numCompetitions: data.numCompetitions || 1,
            roundId: data.roundId,
            modifyDate: new Date()
          }
        });
      }
    } catch (error) {
      logger.error('Error upserting algo rating', { data, error });
      throw error;
    }
  }

  /**
   * Insert algo rating history record
   * @param data - AlgoRatingHistory data
   */
  async insertAlgoRatingHistory(data: {
    coderId: number;
    roundId: number;
    algoRatingTypeId: number;
    rating: number;
    vol: number;
    numRatings: number;
    numCompetitions?: number;
  }): Promise<void> {
    try {
      await this.prisma.algoRatingHistory.create({
        data: {
          ...data,
          modifyDate: new Date()
        }
      });
    } catch (error) {
      logger.error('Error inserting algo rating history', { data, error });
      throw error;
    }
  }

  /**
   * Get marathon rating data for a round
   * @param roundId - The round ID
   * @returns Array of rating data objects
   */
  async getMarathonRatingData(roundId: number): Promise<Array<{
    coderId: number;
    rating: number;
    vol: number;
    numRatings: number;
    score: number;
  }>> {
    try {
      const results = await this.prisma.longCompResult.findMany({
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

      // Get existing ratings
      const coderIds = results.map(r => r.coderId);
      const algoRatings = await this.prisma.algoRating.findMany({
        where: {
          coderId: { in: coderIds },
          algoRatingTypeId: 3 // Marathon Match
        }
      });

      const ratingMap = new Map<number, { rating: number; vol: number; numRatings: number }>();
      for (const ar of algoRatings) {
        ratingMap.set(ar.coderId, {
          rating: ar.rating,
          vol: ar.vol,
          numRatings: ar.numRatings
        });
      }

      return results.map(r => {
        const existing = ratingMap.get(r.coderId);
        return {
          coderId: r.coderId,
          rating: existing?.rating || 0,
          vol: existing?.vol || 0,
          numRatings: existing?.numRatings || 0,
          score: Number(r.systemPointTotal) || 0
        };
      });
    } catch (error) {
      logger.error('Error getting marathon rating data', { roundId, error });
      throw error;
    }
  }
}

export default new DatabaseService(); 