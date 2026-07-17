import { Router } from 'express';
import { RealmsController } from './realms.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();
const controller = new RealmsController();

router.use(requireAuth);

router.get('/', controller.listRealms);
router.get('/:id', controller.getRealm);
router.post('/:id/explore', controller.exploreRealm);

export default router;
