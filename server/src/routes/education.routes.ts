import { Router } from 'express';
import { educationController } from '../controllers/education.controller';

// mergeParams so this router can read :id (resume_id) from the parent router
const router = Router({ mergeParams: true });

router.get('/', educationController.list);
router.post('/', educationController.create);

export default router;
