/**
 * Database service using Prisma for PostgreSQL operations
 * Replaces Informix operations with equivalent PostgreSQL operations
 */

import { PrismaClient } from '@prisma/client';
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
}

export default new DatabaseService(); 