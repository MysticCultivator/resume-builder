import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Public (authenticated) reads — used by the template gallery.
router.get('/', requireAuth, templateController.list);
router.get('/:id', requireAuth, templateController.getOne);

// Admin-only writes, per Part 2 §19: POST/PUT/DELETE live under /api/templates
// itself (not /api/admin/templates).
router.post('/', requireAuth, requireAdmin, templateController.create);
router.put('/:id', requireAuth, requireAdmin, templateController.update);
router.delete('/:id', requireAuth, requireAdmin, templateController.remove);

export default router;
