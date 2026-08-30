import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.use(requireAuth, requireAdmin);

// Users
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.get('/users/:id/resumes', adminController.getUserResumes);
router.delete('/users/:id', adminController.removeUser);

// Resumes
router.get('/resumes', adminController.listResumes);
router.get('/resumes/:id', adminController.getResume);
router.delete('/resumes/:id', adminController.removeResume);

// Platform statistics (Part 2 §20: GET /api/admin/statistics)
router.get('/statistics', adminController.stats);

// Template usage (Part 10 / Part 11)
router.get('/template-usage', adminController.templateUsage);

// CSV export (Part 12)
router.get('/export/users', adminController.exportUsers);
router.get('/export/resumes', adminController.exportResumes);
router.get('/export/templates', adminController.exportTemplates);

export default router;
