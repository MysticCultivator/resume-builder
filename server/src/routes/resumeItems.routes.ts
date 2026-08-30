import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { educationController } from '../controllers/education.controller';
import { experienceController } from '../controllers/experience.controller';
import { projectController } from '../controllers/project.controller';
import { skillController } from '../controllers/skill.controller';
import { certificationController } from '../controllers/certification.controller';
import { achievementController } from '../controllers/achievement.controller';

/**
 * Flat, item-level routes for updating/deleting a single sub-resource by its
 * own primary key, matching the Part 1 API spec:
 *   PUT/DELETE /education/:eduId
 *   PUT/DELETE /experience/:expId
 *   PUT/DELETE /projects/:projId
 *   PUT/DELETE /skills/:skillId
 *   PUT/DELETE /certifications/:certId
 *   PUT/DELETE /achievements/:achId
 * (Listing/creating these items happens on the nested /resumes/:id/... routes instead.)
 */
const router = Router();

router.use(requireAuth);

router.put('/education/:eduId', educationController.update);
router.delete('/education/:eduId', educationController.remove);

router.put('/experience/:expId', experienceController.update);
router.delete('/experience/:expId', experienceController.remove);

router.put('/projects/:projId', projectController.update);
router.delete('/projects/:projId', projectController.remove);

router.put('/skills/:skillId', skillController.update);
router.delete('/skills/:skillId', skillController.remove);

router.put('/certifications/:certId', certificationController.update);
router.delete('/certifications/:certId', certificationController.remove);

router.put('/achievements/:achId', achievementController.update);
router.delete('/achievements/:achId', achievementController.remove);

export default router;
