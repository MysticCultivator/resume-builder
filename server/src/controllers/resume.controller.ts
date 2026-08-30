import { Request, Response, NextFunction } from 'express';
import { resumeRepository } from '../repositories/resume.repository';
import { resumeService } from '../services/resume.service';
import { createResumeSchema, updateResumeSchema } from '../validators/resume.validator';

export const resumeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumes = await resumeRepository.findAllByUser(req.user!.user_id);
      res.json(resumes);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createResumeSchema.parse(req.body);
      const resume = await resumeRepository.create(req.user!.user_id, body);
      res.status(201).json({ resume });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      // Ownership is enforced inside resumeService.getFullResume via a
      // WHERE resume_id = $1 AND user_id = $2 lookup — a mismatched or
      // nonexistent resume both surface as 404.
      const full = await resumeService.getFullResume(resumeId, req.user!.user_id);
      res.json(full);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/resumes/:id/full — same payload as getOne, dedicated path (Part 2 §11). */
  async getFull(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      const full = await resumeService.getFullResume(resumeId, req.user!.user_id);
      res.json(full);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      const body = updateResumeSchema.parse(req.body);
      // Ownership-scoped UPDATE: WHERE resume_id = $1 AND user_id = $2.
      const resume = await resumeRepository.update(resumeId, req.user!.user_id, body);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      res.json({ resume });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      // Ownership-scoped DELETE: WHERE resume_id = $1 AND user_id = $2.
      const deleted = await resumeRepository.deleteByIdForUser(resumeId, req.user!.user_id);
      if (!deleted) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
