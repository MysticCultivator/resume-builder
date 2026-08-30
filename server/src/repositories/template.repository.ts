import { pool } from '../config/db';
import { buildSetClause } from '../utils/dynamicUpdate';

export interface TemplateRow {
  template_id: number;
  template_name: string;
  thumbnail_url: string | null;
}

export const templateRepository = {
  async findAll(): Promise<TemplateRow[]> {
    const { rows } = await pool.query<TemplateRow>('SELECT * FROM templates ORDER BY template_id');
    return rows;
  },

  async findById(templateId: number): Promise<TemplateRow | null> {
    const { rows } = await pool.query<TemplateRow>('SELECT * FROM templates WHERE template_id = $1', [templateId]);
    return rows[0] ?? null;
  },

  async create(name: string, thumbnailUrl?: string | null): Promise<TemplateRow> {
    const { rows } = await pool.query<TemplateRow>(
      `INSERT INTO templates (template_name, thumbnail_url) VALUES ($1, $2) RETURNING *`,
      [name, thumbnailUrl ?? null]
    );
    return rows[0];
  },

  /**
   * Partial update: only columns present on `data` are touched. Omitted
   * fields are left as-is; fields explicitly set to `null` (e.g. clearing
   * thumbnail_url) are cleared. See utils/dynamicUpdate.ts.
   */
  async update(templateId: number, data: Partial<Pick<TemplateRow, 'template_name' | 'thumbnail_url'>>): Promise<TemplateRow | null> {
    const { setSql, values, hasChanges } = buildSetClause(data, 2);
    if (!hasChanges) {
      return this.findById(templateId);
    }

    const { rows } = await pool.query<TemplateRow>(
      `UPDATE templates SET ${setSql} WHERE template_id = $1 RETURNING *`,
      [templateId, ...values]
    );
    return rows[0] ?? null;
  },

  async deleteById(templateId: number): Promise<void> {
    await pool.query('DELETE FROM templates WHERE template_id = $1', [templateId]);
  },
};
