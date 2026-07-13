import { Router } from 'express';
import { SocialController } from './social.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();
const controller = new SocialController();

router.use(requireAuth);

router.get('/search', controller.searchUsers);
router.get('/friends', controller.getFriendsList);
router.post('/friends/request', controller.sendFriendRequest);
router.post('/friends/accept/:id', controller.acceptFriendRequest);

export const socialRoutes = router;
