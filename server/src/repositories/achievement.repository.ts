import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface AchievementRow {
  achievement_id: number;
  resume_id: number;
  title: string;
  description: string | null;
  achieved_date: string | null;
  order_index: number;
}

export const achievementRepository = {
  async findAllByResume(resumeId: number): Promise<AchievementRow[]> {
    const { rows } = await pool.query<AchievementRow>(
      'SELECT * FROM achievements WHERE resume_id = $1 ORDER BY order_index, achievement_id',
      [resumeId]
    );
    return rows;
  },

  async findById(achievementId: number): Promise<AchievementRow | null> {
    const { rows } = await pool.query<AchievementRow>('SELECT * FROM achievements WHERE achievement_id = $1', [achievementId]);
    return rows[0] ?? null;
  },

  async create(resumeId: number, data: Partial<AchievementRow>): Promise<AchievementRow> {
    const { rows } = await pool.query<AchievementRow>(
      `INSERT INTO achievements (resume_id, title, description, achieved_date, order_index)
       VALUES ($1, $2, $3, $4, COALESCE($5, 0)) RETURNING *`,
      [resumeId, data.title, data.description ?? null, data.achieved_date ?? null, data.order_index ?? null]
    );
    return rows[0];
  },

  /**
   * Partial update: only columns present on `data` are touched. Omitted
   * fields are left as-is; fields explicitly set to `null` are cleared.
   * See utils/dynamicUpdate.ts.
   */
  async update(achievementId: number, data: Partial<AchievementRow>): Promise<AchievementRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(achievementId);
    }

    const { rows } = await pool.query<AchievementRow>(
      `UPDATE achievements SET ${setSql} WHERE achievement_id = $1 RETURNING *`,
      [achievementId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(achievementId: number): Promise<void> {
    await pool.query('DELETE FROM achievements WHERE achievement_id = $1', [achievementId]);
  },
};
