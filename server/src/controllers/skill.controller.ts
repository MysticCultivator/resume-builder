import { Request, Response, NextFunction } from 'express';
import { skillRepository } from '../repositories/skill.repository';
import { resumeService } from '../services/resume.service';
import { skillSchema } from '../validators/resume.validator';

export const skillController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      res.json(await skillRepository.findAllByResume(resumeId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      const body = skillSchema.parse(req.body);
      const skill = await skillRepository.create(resumeId, body);
      res.status(201).json({ skill });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const skillId = Number(req.params.skillId);
      const existing = await skillRepository.findById(skillId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Skill not found');

      const body = skillSchema.partial().parse(req.body);
      const skill = await skillRepository.update(skillId, body);
      res.json({ skill });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const skillId = Number(req.params.skillId);
      const existing = await skillRepository.findById(skillId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Skill not found');

      await skillRepository.deleteById(skillId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
