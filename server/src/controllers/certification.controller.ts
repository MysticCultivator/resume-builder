import { Request, Response, NextFunction } from 'express';
import { certificationRepository } from '../repositories/certification.repository';
import { resumeService } from '../services/resume.service';
import { certificationSchema } from '../validators/resume.validator';

export const certificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      res.json(await certificationRepository.findAllByResume(resumeId));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      await resumeService.assertOwnership(resumeId, req.user!.user_id);
      const body = certificationSchema.parse(req.body);
      const certification = await certificationRepository.create(resumeId, body);
      res.status(201).json({ certification });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const certificationId = Number(req.params.certId);
      const existing = await certificationRepository.findById(certificationId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Certification not found');

      const body = certificationSchema.partial().parse(req.body);
      const certification = await certificationRepository.update(certificationId, body);
      res.json({ certification });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const certificationId = Number(req.params.certId);
      const existing = await certificationRepository.findById(certificationId);
      await resumeService.assertSubResourceOwnership(existing, req.user!.user_id, 'Certification not found');

      await certificationRepository.deleteById(certificationId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
