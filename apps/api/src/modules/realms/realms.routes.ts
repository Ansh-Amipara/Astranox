import { Router } from 'express';
import { container } from 'tsyringe';
import { RealmsController } from './realms.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { validate } from '../../core/middleware/validate';
import { realmSearchSchema } from '@astranox/types';

const router = Router();
const controller = container.resolve(RealmsController);

router.use(requireAuth);

router.get('/', controller.listRealms);
router.get('/:realmId', controller.getRealmDetail);
router.post('/search', validate({ body: realmSearchSchema }), controller.searchRealm);
router.post('/:realmId/search', controller.searchRealm);

export const realmsRoutes = router;
export default router;
