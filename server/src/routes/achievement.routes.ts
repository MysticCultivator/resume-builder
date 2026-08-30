import { Router } from 'express';
import { achievementController } from '../controllers/achievement.controller';

const router = Router({ mergeParams: true });

router.get('/', achievementController.list);
router.post('/', achievementController.create);

export default router;
