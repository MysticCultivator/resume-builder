import { Request, Response, NextFunction } from 'express';
import { educationRepository } from '../repositories/education.repository';
import { resumeService } from '../services/resume.service';
import { educationSchema } from '../validators/resume.validator';

export const educationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      res.json(await educationRepository.findAllByResume(resumeId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      const body = educationSchema.parse(req.body);
      const education = await educationRepository.create(resumeId, body);
      res.status(201).json({ education });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const educationId = Number(req.params.eduId);
      const existing = await educationRepository.findById(educationId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Education entry not found');

      const body = educationSchema.partial().parse(req.body);
      const education = await educationRepository.update(educationId, body);
      res.json({ education });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const educationId = Number(req.params.eduId);
      const existing = await educationRepository.findById(educationId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Education entry not found');

      await educationRepository.deleteById(educationId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
