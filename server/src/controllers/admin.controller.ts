import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/user.repository';
import { adminRepository } from '../repositories/admin.repository';
import { resumeRepository } from '../repositories/resume.repository';
import { resumeService } from '../services/resume.service';
import { ApiError } from '../middleware/errorHandler';
import { toCsv } from '../utils/csv';
import {
  listUsersQuerySchema,
  listResumesQuerySchema,
  exportUsersQuerySchema,
  exportResumesQuerySchema,
} from '../validators/admin.validator';

export const adminController = {
  // ── Users ────────────────────────────────────────────────────────────

  /** GET /api/admin/users — search + role filter + sort + pagination. */
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listUsersQuerySchema.parse(req.query);
      const result = await adminRepository.listUsers(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/admin/users/:id — user detail with resume count. Never
   *  returns password_hash or any other credential/session field. */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminRepository.getUserById(Number(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/admin/users/:id/resumes — that user's resumes (title,
   *  template, timestamps) for the admin's "view user" page. */
  async getUserResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const user = await userRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const resumes = await adminRepository.getUserResumes(userId);
      res.json(resumes);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/admin/users/:id. Backend-enforced: an administrator can
   *  never delete their own currently logged-in account, even if the
   *  frontend button is somehow bypassed (Part 6: "This protection MUST
   *  exist on the backend, not only in JavaScript."). Associated resumes
   *  cascade-delete per the `resumes.user_id` FK's ON DELETE CASCADE. */
  async removeUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = Number(req.params.id);
      if (targetId === req.user!.user_id) {
        throw new ApiError(400, 'You cannot delete your own account while logged in.');
      }
      const existing = await userRepository.findById(targetId);
      if (!existing) return res.status(404).json({ error: 'User not found' });

      await userRepository.deleteById(targetId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  // ── Resumes ──────────────────────────────────────────────────────────

  /** GET /api/admin/resumes — search + template/user filter + sort + pagination. */
  async listResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listResumesQuerySchema.parse(req.query);
      const result = await adminRepository.listResumes({
        search: query.search,
        templateId: query.template_id,
        userId: query.user_id,
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/admin/resumes/:id — full resume (all sections) plus owner
   *  info, for the admin's read-only viewer. Reuses the exact same
   *  section-assembly + template-resolution logic as the user-facing
   *  preview (resumeService.assembleFullResume), just without the
   *  ownership check a normal user's read is scoped by. */
  async getResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      const full = await resumeService.getFullResumeForAdmin(resumeId);
      const owner = await userRepository.findById(full.resume.user_id);
      const safeOwner = owner ? { user_id: owner.user_id, full_name: owner.full_name, username: owner.username, email: owner.email } : null;
      res.json({ ...full, owner: safeOwner });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/admin/resumes/:id — unscoped delete (admin may remove any
   *  user's resume), gated entirely by requireAuth + requireAdmin above. */
  async removeResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.id);
      const existing = await resumeRepository.findById(resumeId);
      if (!existing) return res.status(404).json({ error: 'Resume not found' });

      await resumeRepository.deleteById(resumeId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  // ── Statistics / analytics ──────────────────────────────────────────

  /** GET /api/admin/statistics — platform overview (Part 5 + Part 11). */
  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await adminRepository.getStats());
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/admin/template-usage — per-template resume counts + usage
   *  percentages, most/least used first-to-last (Part 10). */
  async templateUsage(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await adminRepository.getTemplateUsage());
    } catch (err) {
      next(err);
    }
  },

  // ── CSV export ───────────────────────────────────────────────────────

  /** GET /api/admin/export/users — never includes password/password_hash,
   *  session, or secret data; only the same safe fields shown in the UI. */
  async exportUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = exportUsersQuerySchema.parse(req.query);
      const users = await adminRepository.listUsersForExport(query);
      const csv = toCsv(
        [
          { key: 'user_id', label: 'ID' },
          { key: 'username', label: 'Username' },
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'resume_count', label: 'Resume Count' },
          { key: 'created_at', label: 'Created At' },
        ],
        users
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/admin/export/resumes */
  async exportResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const query = exportResumesQuerySchema.parse(req.query);
      const resumes = await adminRepository.listResumesForExport({
        search: query.search,
        templateId: query.template_id,
        userId: query.user_id,
      });
      const csv = toCsv(
        [
          { key: 'resume_id', label: 'Resume ID' },
          { key: 'title', label: 'Resume Title' },
          { key: 'user_id', label: 'User ID' },
          { key: 'owner_username', label: 'Username' },
          { key: 'owner_email', label: 'Email' },
          { key: 'template_name', label: 'Template' },
          { key: 'accent_color', label: 'Color' },
          { key: 'created_at', label: 'Created At' },
          { key: 'updated_at', label: 'Updated At' },
        ],
        resumes
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="resumes.csv"');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/admin/export/templates */
  async exportTemplates(_req: Request, res: Response, next: NextFunction) {
    try {
      const usage = await adminRepository.getTemplateUsage();
      const csv = toCsv(
        [
          { key: 'template_name', label: 'Template' },
          { key: 'resume_count', label: 'Resume Count' },
          { key: 'percentage', label: 'Usage Percentage' },
        ],
        usage
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="template-usage.csv"');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },
};
