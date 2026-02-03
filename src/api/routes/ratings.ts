/**
 * REST API routes for marathon match ratings calculation
 */

import { Router, Request, Response } from 'express';
import { processMarathonRatings } from '../../libs/process/MarathonRatingProcess';
import logger from '../../common/logger';

const router = Router();

/**
 * POST /ratings/mm/calculate
 * Calculate marathon match ratings for a given round
 */
router.post('/mm/calculate', async (req: Request, res: Response): Promise<void> => {
  const { roundId } = req.body;

  // Validate roundId
  if (roundId === undefined || roundId === null) {
    logger.warn('Missing roundId in request body');
    res.status(400).json({ error: 'roundId is required' });
    return;
  }

  const parsedRoundId = typeof roundId === 'string' ? parseInt(roundId, 10) : roundId;

  if (!Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
    logger.warn(`Invalid roundId: ${roundId}`);
    res.status(400).json({ error: 'roundId must be a positive integer' });
    return;
  }

  try {
    logger.info(`Received request to calculate marathon ratings for round ${parsedRoundId}`);
    const result = await processMarathonRatings(parsedRoundId);
    logger.info(`Rating calculation result for round ${parsedRoundId}: ${result.status} - ${result.message}`);
    res.json(result);
  } catch (error) {
    logger.error('Error processing marathon ratings request', { error, roundId: parsedRoundId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
