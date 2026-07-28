import { COIN_REWARDS, ExploreLocation } from '../config/coinRewards.config';

export class RewardGeneratorService {
  generateCoins(location: ExploreLocation): number {
    const range = COIN_REWARDS[location];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
}
