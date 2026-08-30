import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface ProjectRow {
  project_id: number;
  resume_id: number;
  project_name: string;
  description: string | null;
  project_link: string | null;
  order_index: number;
  technologies: string | null;
}

export const projectRepository = {
  async findAllByResume(resumeId: number): Promise<ProjectRow[]> {
    const { rows } = await pool.query<ProjectRow>(
      'SELECT * FROM projects WHERE resume_id = $1 ORDER BY order_index, project_id',
      [resumeId]
    );
    return rows;
  },

  async findById(projectId: number): Promise<ProjectRow | null> {
    const { rows } = await pool.query<ProjectRow>('SELECT * FROM projects WHERE project_id = $1', [projectId]);
    return rows[0] ?? null;
  },

  async create(resumeId: number, data: Partial<ProjectRow>): Promise<ProjectRow> {
    const { rows } = await pool.query<ProjectRow>(
      `INSERT INTO projects (resume_id, project_name, description, project_link, order_index, technologies)
       VALUES ($1, $2, $3, $4, COALESCE($5, 0), $6) RETURNING *`,
      [
        resumeId,
        data.project_name,
        data.description ?? null,
        data.project_link ?? null,
        data.order_index ?? null,
        data.technologies ?? null,
      ]
    );
    return rows[0];
  },

  /**
   * Partial update: only columns present on `data` are touched. Omitted
   * fields are left as-is; fields explicitly set to `null` are cleared.
   * See utils/dynamicUpdate.ts.
   */
  async update(projectId: number, data: Partial<ProjectRow>): Promise<ProjectRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(projectId);
    }

    const { rows } = await pool.query<ProjectRow>(
      `UPDATE projects SET ${setSql} WHERE project_id = $1 RETURNING *`,
      [projectId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(projectId: number): Promise<void> {
    await pool.query('DELETE FROM projects WHERE project_id = $1', [projectId]);
  },
};
