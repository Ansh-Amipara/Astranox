import { z } from 'zod';

/**
 * Rank exam and promotion balance constants and schema.
 */

export const rankBalanceSchema = z.object({
  PROMOTION_COOLDOWN_SECONDS: z.number().min(0).max(86400).describe('Cooldown in seconds before retrying a failed rank promotion exam'),
  EXAM_BASE_LEVEL: z.number().min(1).max(5000).describe('Base level baseline for rank exam scaling'),
  AUTO_HEAL_AFTER_EXAM: z.boolean().describe('Whether the player party is auto-healed after rank exam completion'),
});

export type RankBalanceConfig = z.infer<typeof rankBalanceSchema>;

export const RANK_BALANCE_DEFAULTS: RankBalanceConfig = {
  PROMOTION_COOLDOWN_SECONDS: 0,
  EXAM_BASE_LEVEL: 1,
  AUTO_HEAL_AFTER_EXAM: true,
};
