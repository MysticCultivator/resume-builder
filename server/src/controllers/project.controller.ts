import { Request, Response, NextFunction } from 'express';
import { projectRepository } from '../repositories/project.repository';
import { resumeService } from '../services/resume.service';
import { projectSchema } from '../validators/resume.validator';

export const projectController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      res.json(await projectRepository.findAllByResume(resumeId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      const body = projectSchema.parse(req.body);
      const project = await projectRepository.create(resumeId, body);
      res.status(201).json({ project });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projId);
      const existing = await projectRepository.findById(projectId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Project not found');

      const body = projectSchema.partial().parse(req.body);
      const project = await projectRepository.update(projectId, body);
      res.json({ project });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projId);
      const existing = await projectRepository.findById(projectId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Project not found');

      await projectRepository.deleteById(projectId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
