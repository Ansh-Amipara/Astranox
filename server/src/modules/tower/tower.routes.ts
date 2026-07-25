import { Router } from 'express';
import { requireAuth } from '../../common/middleware/require-auth';
import { getTowerState, startFloor, startBattle, completeBattle, skipFloors } from './tower.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getTowerState);
router.post('/floor/start', startFloor);
router.post('/battle/start', startBattle);
router.post('/battle/complete', completeBattle);
router.post('/skip', skipFloors);

export default router;
