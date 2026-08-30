import { Router } from 'express';
import { certificationController } from '../controllers/certification.controller';

const router = Router({ mergeParams: true });

router.get('/', certificationController.list);
router.post('/', certificationController.create);

export default router;
