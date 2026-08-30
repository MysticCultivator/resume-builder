import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { requireAuth } from '../middleware/requireAuth';
import educationRoutes from './education.routes';
import experienceRoutes from './experience.routes';
import projectRoutes from './project.routes';
import skillRoutes from './skill.routes';
import certificationRoutes from './certification.routes';
import achievementRoutes from './achievement.routes';

const router = Router();

router.use(requireAuth);

router.get('/', resumeController.list);
router.post('/', resumeController.create);
router.get('/:id', resumeController.getOne);
router.get('/:id/full', resumeController.getFull); // Part 2 §11 — complete resume in one response
router.put('/:id', resumeController.update);
router.delete('/:id', resumeController.remove);

// Nested sub-resource routes, e.g. GET/POST /resumes/:id/education
router.use('/:id/education', educationRoutes);
router.use('/:id/experience', experienceRoutes);
router.use('/:id/projects', projectRoutes);
router.use('/:id/skills', skillRoutes);
router.use('/:id/certifications', certificationRoutes);
router.use('/:id/achievements', achievementRoutes);

export default router;
