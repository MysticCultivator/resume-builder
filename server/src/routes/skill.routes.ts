import { Router } from 'express';
import { skillController } from '../controllers/skill.controller';

const router = Router({ mergeParams: true });

router.get('/', skillController.list);
router.post('/', skillController.create);

export default router;
