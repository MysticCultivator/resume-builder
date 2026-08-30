import { Router } from 'express';
import { experienceController } from '../controllers/experience.controller';

const router = Router({ mergeParams: true });

router.get('/', experienceController.list);
router.post('/', experienceController.create);

export default router;
