import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface ResumeRow {
  resume_id: number;
  user_id: number;
  template_id: number | null;
  title: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  /** Simple layout customization (font size / spacing / accent color) as a
   *  JSONB blob, or null for resumes that haven't set one — the client and
   *  PDF generator both apply their own defaults in that case. */
  customization: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/** Same shape as ResumeRow plus the joined template name, used by the
 *  dashboard list view so it can show which template each resume uses
 *  without a second round trip per row. */
export interface ResumeRowWithTemplate extends ResumeRow {
  template_name: string | null;
}

export const resumeRepository = {
  async findAllByUser(userId: number): Promise<ResumeRowWithTemplate[]> {
    const { rows } = await pool.query<ResumeRowWithTemplate>(
      `SELECT r.*, t.template_name
       FROM resumes r
       LEFT JOIN templates t ON t.template_id = r.template_id
       WHERE r.user_id = $1
       ORDER BY r.updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async findById(resumeId: number): Promise<ResumeRow | null> {
    const { rows } = await pool.query<ResumeRow>('SELECT * FROM resumes WHERE resume_id = $1', [resumeId]);
    return rows[0] ?? null;
  },

  /** Ownership-scoped lookup: WHERE resume_id = $1 AND user_id = $2. */
  async findByIdForUser(resumeId: number, userId: number): Promise<ResumeRow | null> {
    const { rows } = await pool.query<ResumeRow>(
      'SELECT * FROM resumes WHERE resume_id = $1 AND user_id = $2',
      [resumeId, userId]
    );
    return rows[0] ?? null;
  },

  async create(userId: number, data: Partial<ResumeRow>): Promise<ResumeRow> {
    const { rows } = await pool.query<ResumeRow>(
      `INSERT INTO resumes (user_id, template_id, title, full_name, email, phone, location, summary, customization)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        userId,
        data.template_id ?? null,
        data.title ?? 'Untitled Resume',
        data.full_name ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.location ?? null,
        data.summary ?? null,
        data.customization ?? null,
      ]
    );
    return rows[0];
  },

  /**
   * Ownership-scoped partial update: WHERE resume_id = $1 AND user_id = $2.
   * Only columns actually present on `data` are touched — omitted fields
   * are left as-is, and fields explicitly set to `null` are cleared. See
   * utils/dynamicUpdate.ts for why this replaces the old COALESCE-based
   * query, which couldn't distinguish "not provided" from "clear this".
   */
  async update(resumeId: number, userId: number, data: Partial<ResumeRow>): Promise<ResumeRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 3);
    if (!hasChanges) {
      return this.findByIdForUser(resumeId, userId);
    }

    const { rows } = await pool.query<ResumeRow>(
      `UPDATE resumes SET ${setSql} WHERE resume_id = $1 AND user_id = $2 RETURNING *`,
      [resumeId, userId, ...values]
    );
    return rows[0] ?? null;
  },

  /** Ownership-scoped delete: WHERE resume_id = $1 AND user_id = $2. */
  async deleteByIdForUser(resumeId: number, userId: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM resumes WHERE resume_id = $1 AND user_id = $2', [resumeId, userId]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Unscoped delete — no `user_id` check. Only ever called from the admin
   * module (server/src/controllers/admin.controller.ts), which is already
   * gated behind requireAuth + requireAdmin, so an administrator may delete
   * any resume regardless of who owns it.
   */
  async deleteById(resumeId: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM resumes WHERE resume_id = $1', [resumeId]);
    return (result.rowCount ?? 0) > 0;
  },
};
