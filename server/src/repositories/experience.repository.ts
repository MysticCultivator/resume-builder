import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface ExperienceRow {
  experience_id: number;
  resume_id: number;
  company_name: string;
  job_title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  order_index: number;
}

export const experienceRepository = {
  async findAllByResume(resumeId: number): Promise<ExperienceRow[]> {
    const { rows } = await pool.query<ExperienceRow>(
      'SELECT * FROM experience WHERE resume_id = $1 ORDER BY order_index, experience_id',
      [resumeId]
    );
    return rows;
  },

  async findById(experienceId: number): Promise<ExperienceRow | null> {
    const { rows } = await pool.query<ExperienceRow>('SELECT * FROM experience WHERE experience_id = $1', [experienceId]);
    return rows[0] ?? null;
  },

  async create(resumeId: number, data: Partial<ExperienceRow>): Promise<ExperienceRow> {
    const { rows } = await pool.query<ExperienceRow>(
      `INSERT INTO experience (resume_id, company_name, job_title, start_date, end_date, is_current, description, order_index)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, false), $7, COALESCE($8, 0)) RETURNING *`,
      [
        resumeId,
        data.company_name,
        data.job_title,
        data.start_date ?? null,
        data.end_date ?? null,
        data.is_current ?? null,
        data.description ?? null,
        data.order_index ?? null,
      ]
    );
    return rows[0];
  },

  /**
   * Partial update: only columns present on `data` are touched. Omitted
   * fields are left as-is; fields explicitly set to `null` are cleared.
   * See utils/dynamicUpdate.ts.
   */
  async update(experienceId: number, data: Partial<ExperienceRow>): Promise<ExperienceRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(experienceId);
    }

    const { rows } = await pool.query<ExperienceRow>(
      `UPDATE experience SET ${setSql} WHERE experience_id = $1 RETURNING *`,
      [experienceId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(experienceId: number): Promise<void> {
    await pool.query('DELETE FROM experience WHERE experience_id = $1', [experienceId]);
  },
};
