import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface EducationRow {
  education_id: number;
  resume_id: number;
  institution_name: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  order_index: number;
  education_level: 'primary' | 'secondary' | 'higher_secondary' | 'degree' | null;
}

export const educationRepository = {
  async findAllByResume(resumeId: number): Promise<EducationRow[]> {
    const { rows } = await pool.query<EducationRow>(
      'SELECT * FROM education WHERE resume_id = $1 ORDER BY order_index, education_id',
      [resumeId]
    );
    return rows;
  },

  async findById(educationId: number): Promise<EducationRow | null> {
    const { rows } = await pool.query<EducationRow>('SELECT * FROM education WHERE education_id = $1', [educationId]);
    return rows[0] ?? null;
  },

  async create(resumeId: number, data: Partial<EducationRow>): Promise<EducationRow> {
    const { rows } = await pool.query<EducationRow>(
      `INSERT INTO education (resume_id, institution_name, degree, field_of_study, start_date, end_date, gpa, order_index, education_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 0), $9) RETURNING *`,
      [
        resumeId,
        data.institution_name,
        data.degree ?? null,
        data.field_of_study ?? null,
        data.start_date ?? null,
        data.end_date ?? null,
        data.gpa ?? null,
        data.order_index ?? null,
        data.education_level ?? null,
      ]
    );
    return rows[0];
  },

  /**
   * Partial update: only columns present on `data` are touched. Omitted
   * fields are left as-is; fields explicitly set to `null` are cleared.
   * See utils/dynamicUpdate.ts.
   */
  async update(educationId: number, data: Partial<EducationRow>): Promise<EducationRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(educationId);
    }

    const { rows } = await pool.query<EducationRow>(
      `UPDATE education SET ${setSql} WHERE education_id = $1 RETURNING *`,
      [educationId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(educationId: number): Promise<void> {
    await pool.query('DELETE FROM education WHERE education_id = $1', [educationId]);
  },
};
