import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface CertificationRow {
  certification_id: number;
  resume_id: number;
  certification_name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  order_index: number;
}

export const certificationRepository = {
  async findAllByResume(resumeId: number): Promise<CertificationRow[]> {
    const { rows } = await pool.query<CertificationRow>(
      'SELECT * FROM certifications WHERE resume_id = $1 ORDER BY order_index, certification_id',
      [resumeId]
    );
    return rows;
  },

  async findById(certificationId: number): Promise<CertificationRow | null> {
    const { rows } = await pool.query<CertificationRow>(
      'SELECT * FROM certifications WHERE certification_id = $1',
      [certificationId]
    );
    return rows[0] ?? null;
  },

  async create(resumeId: number, data: Partial<CertificationRow>): Promise<CertificationRow> {
    const { rows } = await pool.query<CertificationRow>(
      `INSERT INTO certifications (resume_id, certification_name, issuing_organization, issue_date, credential_id, credential_url, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 0)) RETURNING *`,
      [
        resumeId,
        data.certification_name,
        data.issuing_organization ?? null,
        data.issue_date ?? null,
        data.credential_id ?? null,
        data.credential_url ?? null,
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
  async update(certificationId: number, data: Partial<CertificationRow>): Promise<CertificationRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(certificationId);
    }

    const { rows } = await pool.query<CertificationRow>(
      `UPDATE certifications SET ${setSql} WHERE certification_id = $1 RETURNING *`,
      [certificationId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(certificationId: number): Promise<void> {
    await pool.query('DELETE FROM certifications WHERE certification_id = $1', [certificationId]);
  },
};
