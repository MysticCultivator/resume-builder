import { Router } from 'express';
import { projectController } from '../controllers/project.controller';

const router = Router({ mergeParams: true });

router.get('/', projectController.list);
router.post('/', projectController.create);

export default router;
