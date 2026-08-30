import { Request, Response, NextFunction } from 'express';
import { experienceRepository } from '../repositories/experience.repository';
import { resumeService } from '../services/resume.service';
import { experienceSchema } from '../validators/resume.validator';

export const experienceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      res.json(await experienceRepository.findAllByResume(resumeId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      const body = experienceSchema.parse(req.body);
      const experience = await experienceRepository.create(resumeId, body);
      res.status(201).json({ experience });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const experienceId = Number(req.params.expId);
      const existing = await experienceRepository.findById(experienceId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Experience entry not found');

      const body = experienceSchema.partial().parse(req.body);
      const experience = await experienceRepository.update(experienceId, body);
      res.json({ experience });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const experienceId = Number(req.params.expId);
      const existing = await experienceRepository.findById(experienceId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Experience entry not found');

      await experienceRepository.deleteById(experienceId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
