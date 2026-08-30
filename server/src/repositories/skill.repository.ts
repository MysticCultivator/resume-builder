import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface SkillRow {
  skill_id: number;
  resume_id: number;
  skill_name: string;
  category: string | null;
  proficiency_level: string | null;
}

export const skillRepository = {
  async findAllByResume(resumeId: number): Promise<SkillRow[]> {
    const { rows } = await pool.query<SkillRow>(
      'SELECT * FROM skills WHERE resume_id = $1 ORDER BY skill_id',
      [resumeId]
    );
    return rows;
  },

  async findById(skillId: number): Promise<SkillRow | null> {
    const { rows } = await pool.query<SkillRow>('SELECT * FROM skills WHERE skill_id = $1', [skillId]);
    return rows[0] ?? null;
  },

  async create(resumeId: number, data: Partial<SkillRow>): Promise<SkillRow> {
    const { rows } = await pool.query<SkillRow>(
      `INSERT INTO skills (resume_id, skill_name, category, proficiency_level)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [resumeId, data.skill_name, data.category ?? null, data.proficiency_level ?? null]
    );
    return rows[0];
  },

  /**
   * Partial update: only columns present on `data` are touched. Omitted
   * fields are left as-is; fields explicitly set to `null` are cleared.
   * See utils/dynamicUpdate.ts.
   */
  async update(skillId: number, data: Partial<SkillRow>): Promise<SkillRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(skillId);
    }

    const { rows } = await pool.query<SkillRow>(
      `UPDATE skills SET ${setSql} WHERE skill_id = $1 RETURNING *`,
      [skillId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(skillId: number): Promise<void> {
    await pool.query('DELETE FROM skills WHERE skill_id = $1', [skillId]);
  },
};
