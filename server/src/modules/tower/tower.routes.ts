import { container } from 'tsyringe';
import { Router } from 'express';
import { requireAuth } from '../../core/middleware/require-auth';
import { TowerController } from './tower.controller';

const router = Router();
const controller = container.resolve(TowerController);

router.use(requireAuth);

router.get('/', controller.getTowerState);
router.post('/floor/start', controller.startFloor);
router.post('/battle/start', controller.startBattle);
router.post('/battle/complete', controller.completeBattle);
router.post('/skip', controller.skipFloors);

export default router;
