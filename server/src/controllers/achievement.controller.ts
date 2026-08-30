import { Request, Response, NextFunction } from 'express';
import { achievementRepository } from '../repositories/achievement.repository';
import { resumeService } from '../services/resume.service';
import { achievementSchema } from '../validators/resume.validator';

export const achievementController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      res.json(await achievementRepository.findAllByResume(resumeId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      const body = achievementSchema.parse(req.body);
      const achievement = await achievementRepository.create(resumeId, body);
      res.status(201).json({ achievement });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const achievementId = Number(req.params.achId);
      const existing = await achievementRepository.findById(achievementId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Achievement not found');

      const body = achievementSchema.partial().parse(req.body);
      const achievement = await achievementRepository.update(achievementId, body);
      res.json({ achievement });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const achievementId = Number(req.params.achId);
      const existing = await achievementRepository.findById(achievementId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Achievement not found');

      await achievementRepository.deleteById(achievementId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
