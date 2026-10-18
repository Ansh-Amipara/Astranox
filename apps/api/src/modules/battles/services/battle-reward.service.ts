import { injectable, inject } from 'tsyringe';
import { Prisma, BattleStatus } from '@prisma/client';
import { getExpYield, getLevelFromXp, getXpForLevel, getMaxLevelForPotential, ProgressionBalanceConfig } from '@astranox/constants';
import { BalanceService } from '../../balance/balance.service';

@injectable()
export class BattleRewardService {
  constructor(
    @inject(BalanceService)
    private balanceService?: BalanceService
  ) {}

  async processFaintRewards(
    result: any, 
    wildPokemon: any, 
    tx: Prisma.TransactionClient,
    battleType?: string,
    trainerId?: string,
    balanceVersion?: number | null
  ): Promise<{ newStatus?: BattleStatus }> {
    let newStatus: BattleStatus | undefined = undefined;

    let progressionConfig: ProgressionBalanceConfig | undefined;
    if (this.balanceService) {
      try {
        progressionConfig = await this.balanceService.get<ProgressionBalanceConfig>('progression', balanceVersion);
      } catch {
        // Fallback to default canonical constants
      }
    }

    let xpYield = getExpYield(wildPokemon.baseExp, wildPokemon.level, progressionConfig);
    
    if (battleType === 'NPC' || wildPokemon.isRankExam) {
      xpYield = wildPokemon.examinerXp || xpYield || 500;
    }

    const maxLevel = getMaxLevelForPotential(result.p1State.potential, progressionConfig);
    const maxXpForPotential = getXpForLevel(maxLevel + 1, progressionConfig) - 1;

    let actualYield = xpYield;

    if (result.p1State.currentXp + xpYield > maxXpForPotential) {
      actualYield = Math.max(0, maxXpForPotential - result.p1State.currentXp);
    }
    
    result.p1State.currentXp += actualYield;
    
    if (actualYield > 0) {
      result.events.push({ type: 'xp_gain', pokemonId: result.p1State.id, amount: actualYield });
    } else {
      result.events.push({ type: 'xp_gain', pokemonId: result.p1State.id, amount: 0 }); // Show 0 if capped
    }

    const lostXp = xpYield - actualYield;
    if (lostXp > 0 && trainerId) {
      const storedXpGain = Math.floor(lostXp * 0.5);
      if (storedXpGain > 0) {
        await tx.trainerSave.update({
          where: { id: trainerId },
          data: { storedXp: { increment: storedXpGain } }
        });
        result.events.push({ type: 'stored_xp_gain', amount: storedXpGain });
      }
    }

    const oldLevel = result.p1State.level;
    const newLevel = getLevelFromXp(result.p1State.currentXp, progressionConfig);

    if (newLevel > oldLevel) {
      result.p1State.level = newLevel;
      result.events.push({ type: 'level_up', pokemonId: result.p1State.id, level: newLevel });
    }

    return { newStatus };
  }
}
