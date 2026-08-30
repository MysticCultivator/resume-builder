import { resumeRepository, ResumeRow } from '../repositories/resume.repository';
import { educationRepository, EducationRow } from '../repositories/education.repository';
import { experienceRepository, ExperienceRow } from '../repositories/experience.repository';
import { projectRepository, ProjectRow } from '../repositories/project.repository';
import { skillRepository, SkillRow } from '../repositories/skill.repository';
import { certificationRepository, CertificationRow } from '../repositories/certification.repository';
import { achievementRepository, AchievementRow } from '../repositories/achievement.repository';
import { templateRepository } from '../repositories/template.repository';
import { ApiError } from '../middleware/errorHandler';

/**
 * Orchestrates a full resume read: the resume header, its selected template,
 * and every related sub-section table. Backs both:
 *   GET /api/resumes/:id       (Part 1)
 *   GET /api/resumes/:id/full  (Part 2 — same shape, dedicated path)
 */
export const resumeService = {
  /** Shared by getFullResume and getFullResumeForAdmin — loads every
   *  sub-section table plus the resolved template for an already-fetched
   *  resume row. Kept as one place so the admin read-only viewer renders
   *  from exactly the same data shape as the user-facing preview/PDF
   *  (Part 7 §8: "Reuse existing resume preview/rendering functionality"). */
  async assembleFullResume(resume: ResumeRow) {
    const [education, experience, projects, skills, certifications, achievements, template] = await Promise.all([
      educationRepository.findAllByResume(resume.resume_id),
      experienceRepository.findAllByResume(resume.resume_id),
      projectRepository.findAllByResume(resume.resume_id),
      skillRepository.findAllByResume(resume.resume_id),
      certificationRepository.findAllByResume(resume.resume_id),
      achievementRepository.findAllByResume(resume.resume_id),
      resume.template_id ? templateRepository.findById(resume.template_id) : Promise.resolve(null),
    ]);

    return { resume, template, education, experience, projects, skills, certifications, achievements };
  },

  async getFullResume(resumeId: number, requestingUserId: number) {
    const resume = await resumeRepository.findByIdForUser(resumeId, requestingUserId);
    if (!resume) {
      // Distinguish "doesn't exist" from "exists but isn't yours" without leaking
      // which case it is to the caller (both return 404 to avoid ID enumeration).
      throw new ApiError(404, 'Resume not found');
    }
    return this.assembleFullResume(resume);
  },

  /**
   * Admin-only, unscoped variant of getFullResume — no ownership check,
   * since an administrator may inspect any resume on the platform. Only
   * ever called from a route already gated behind requireAuth +
   * requireAdmin (see admin.controller.ts).
   */
  async getFullResumeForAdmin(resumeId: number) {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) {
      throw new ApiError(404, 'Resume not found');
    }
    return this.assembleFullResume(resume);
  },

  /** Throws 404 unless the resume exists AND belongs to requestingUserId. */
  async assertOwnership(resumeId: number, requestingUserId: number) {
    const resume = await resumeRepository.findByIdForUser(resumeId, requestingUserId);
    if (!resume) {
      throw new ApiError(404, 'Resume not found');
    }
    return resume;
  },

  /**
   * For flat item-level routes (e.g. PUT /education/:eduId) that don't carry
   * a resume_id in the URL: loads the sub-resource row, then verifies the
   * resume it belongs to is owned by requestingUserId. Throws 404 either way
   * a mismatch is found, so User A can never learn User B's resume exists.
   */
  async assertSubResourceOwnership<T extends { resume_id: number }>(
    row: T | null,
    requestingUserId: number,
    notFoundMessage: string
  ): Promise<T> {
    if (!row) {
      throw new ApiError(404, notFoundMessage);
    }
    const resume = await resumeRepository.findByIdForUser(row.resume_id, requestingUserId);
    if (!resume) {
      throw new ApiError(404, notFoundMessage);
    }
    return row;
  },
};

export type { EducationRow, ExperienceRow, ProjectRow, SkillRow, CertificationRow, AchievementRow };
