import { Request, Response, NextFunction } from 'express';
import { templateRepository } from '../repositories/template.repository';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { BUILT_IN_TEMPLATE_NAMES, isBuiltInTemplateName } from '../utils/builtinTemplates';

const templateSchema = z.object({
  template_name: z.string().min(1).max(100),
  // nullable so an admin can explicitly clear the thumbnail instead of it
  // silently staying set (see utils/dynamicUpdate.ts for why).
  thumbnail_url: z.string().url().nullable().optional(),
});

export const templateController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await templateRepository.findAll());
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateRepository.findById(Number(req.params.id));
      if (!template) return res.status(404).json({ error: 'Template not found' });
      res.json({ template });
    } catch (err) {
      next(err);
    }
  },

  // The application only has real renderers for the four built-in designs
  // (see utils/builtinTemplates.ts). Allowing an admin to create, say,
  // "Professional Blue" would add a row the gallery/selector can show, but
  // it would silently render as Classic — misleading (Part 3 §14). So a new
  // template row's name must match one of the built-ins, and can't already
  // exist (the seed data + this check together keep the four names unique
  // in practice without adding a DB constraint that could reject pre-existing,
  // unrelated duplicate rows).
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = templateSchema.parse(req.body);
      if (!isBuiltInTemplateName(body.template_name)) {
        throw new ApiError(
          400,
          `"${body.template_name}" has no matching resume layout. Template names must be one of: ${BUILT_IN_TEMPLATE_NAMES.join(', ')}.`
        );
      }
      const existing = await templateRepository.findAll();
      if (existing.some((t) => t.template_name === body.template_name)) {
        throw new ApiError(409, `A "${body.template_name}" template already exists.`);
      }
      const template = await templateRepository.create(body.template_name, body.thumbnail_url);
      res.status(201).json({ template });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = templateSchema.partial().parse(req.body);
      const templateId = Number(req.params.id);
      const current = await templateRepository.findById(templateId);
      if (!current) return res.status(404).json({ error: 'Template not found' });

      // A built-in template's identity (the name the React/PDF renderers
      // look it up by) must stay stable — renaming "Modern" to "My Modern
      // Resume" would make resolveTemplate() fall back to Classic for every
      // resume using it (Part 3 §13). Thumbnail edits are still allowed.
      if (isBuiltInTemplateName(current.template_name) && body.template_name !== undefined && body.template_name !== current.template_name) {
        throw new ApiError(400, `"${current.template_name}" is a built-in template and can't be renamed.`);
      }
      if (body.template_name !== undefined && !isBuiltInTemplateName(current.template_name) && !isBuiltInTemplateName(body.template_name)) {
        throw new ApiError(
          400,
          `"${body.template_name}" has no matching resume layout. Template names must be one of: ${BUILT_IN_TEMPLATE_NAMES.join(', ')}.`
        );
      }

      const template = await templateRepository.update(templateId, body);
      res.json({ template });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const templateId = Number(req.params.id);
      const current = await templateRepository.findById(templateId);
      if (!current) return res.status(404).json({ error: 'Template not found' });

      // Deleting a built-in template wouldn't remove its renderer — it
      // would just make every resume that had it selected fall back to
      // Classic silently (Part 3 §13). Existing resumes referencing it
      // must keep working.
      if (isBuiltInTemplateName(current.template_name)) {
        throw new ApiError(400, `"${current.template_name}" is a built-in template and can't be deleted.`);
      }

      await templateRepository.deleteById(templateId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
