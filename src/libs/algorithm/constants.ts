/**
 * Constants for marathon match rating calculation algorithm
 * Ported from Java ratings-calculation-service
 */

/** Initial rating for new coders */
export const INITIAL_SCORE = 1200;

/** Standard deviation equivalent in rating points */
export const ONE_STD_DEV_EQUALS = 1200;

/** Initial weight factor for new players */
export const INITIAL_WEIGHT = 0.60;

/** Final weight factor after many competitions */
export const FINAL_WEIGHT = 0.18;

/** Volatility after first rated competition */
export const FIRST_VOLATILITY = 385;

/** Initial volatility for new coders */
export const INITIAL_VOLATILITY = 515;

/** Rating type ID for Marathon Match */
export const MM_RATING_TYPE_ID = 3;
