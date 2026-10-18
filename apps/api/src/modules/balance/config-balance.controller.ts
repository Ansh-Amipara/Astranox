import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { BalanceService } from './balance.service';
import { PUBLIC_BALANCE_SECTIONS } from '@astranox/constants';

@injectable()
export class ConfigBalanceController {
  constructor(private balanceService: BalanceService) {}

  getPublicBalanceConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const publicConfig: Record<string, any> = {};

      for (const section of PUBLIC_BALANCE_SECTIONS) {
        publicConfig[section] = await this.balanceService.get(section);
      }

      const bodyString = JSON.stringify(publicConfig);
      const etag = `W/"${crypto.createHash('md5').update(bodyString).digest('hex')}"`;

      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }

      res.json({
        success: true,
        data: publicConfig,
      });
    } catch (err) {
      next(err);
    }
  };
}
