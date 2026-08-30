import { pool } from '../config/db';
import { USER_SORT_SQL, UserSort, RESUME_SORT_SQL, ResumeSort } from '../validators/admin.validator';

export interface AdminUserRow {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  resume_count: number;
}

export interface AdminResumeRow {
  resume_id: number;
  title: string;
  user_id: number;
  owner_username: string;
  owner_full_name: string;
  owner_email: string;
  template_id: number | null;
  template_name: string | null;
  accent_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserResumeRow {
  resume_id: number;
  title: string;
  template_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateUsageRow {
  template_id: number | null;
  template_name: string;
  resume_count: number;
  percentage: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** `%like%`-safe wildcard escaping: an admin typing a literal `%` or `_`
 *  into search shouldn't be treated as a SQL LIKE wildcard. */
function likeTerm(search: string): string {
  return `%${search.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
}

export const adminRepository = {
  /**
   * Platform overview stats for the admin dashboard (Part 5): totals plus
   * today/7-day/30-day breakdowns for both users and resumes, average
   * resumes per user, the most-used template, and recent activity feeds.
   * Every number is computed from PostgreSQL — nothing here is hard-coded.
   */
  async getStats() {
    const [
      { rows: userCountRows },
      { rows: resumeCountRows },
      { rows: templateCountRows },
      { rows: userTimeRows },
      { rows: resumeTimeRows },
      { rows: recentActivity },
      { rows: recentUsers },
      templateUsage,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM resumes'),
      pool.query('SELECT COUNT(*)::int AS count FROM templates'),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS today,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS last_7_days,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days
         FROM users`
      ),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS today,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS last_7_days,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days
         FROM resumes`
      ),
      // Recent resume activity, enriched with the owning user's name so the
      // dashboard can show "<user> created/updated <resume>" instead of a bare
      // user_id. Derived entirely from existing columns (created_at vs
      // updated_at) — no separate activity-log table (Part 4 §3).
      pool.query(
        `SELECT r.resume_id, r.title, r.user_id, u.full_name AS user_full_name,
                r.created_at, r.updated_at
           FROM resumes r
           JOIN users u ON u.user_id = r.user_id
          ORDER BY r.updated_at DESC
          LIMIT 10`
      ),
      // Most recently registered users, for the admin dashboard's "recent
      // users" list (Part 4 §3).
      pool.query(
        `SELECT user_id, full_name, username, email, role, created_at
           FROM users
          ORDER BY created_at DESC
          LIMIT 5`
      ),
      this.getTemplateUsage(),
    ]);

    const totalUsers = userCountRows[0].count as number;
    const totalResumes = resumeCountRows[0].count as number;
    const mostUsedTemplate = templateUsage.length > 0 ? templateUsage[0] : null;

    return {
      total_users: totalUsers,
      total_resumes: resumeCountRows[0].count,
      total_templates: templateCountRows[0].count,
      users_today: userTimeRows[0].today,
      users_last_7_days: userTimeRows[0].last_7_days,
      users_last_30_days: userTimeRows[0].last_30_days,
      resumes_today: resumeTimeRows[0].today,
      resumes_last_7_days: resumeTimeRows[0].last_7_days,
      resumes_last_30_days: resumeTimeRows[0].last_30_days,
      // Guard against divide-by-zero on an empty platform (Part 5: "Handle
      // empty databases gracefully").
      avg_resumes_per_user: totalUsers > 0 ? Number((totalResumes / totalUsers).toFixed(2)) : 0,
      most_used_template: mostUsedTemplate && mostUsedTemplate.resume_count > 0 ? mostUsedTemplate.template_name : null,
      recent_activity: recentActivity,
      recent_users: recentUsers,
    };
  },

  /**
   * Usage count + percentage per template, most-used first. Includes
   * templates with zero resumes (LEFT JOIN) so the admin can see an unused
   * template exists, and a synthetic "No template selected" row for
   * resumes with template_id IS NULL, if any exist.
   */
  async getTemplateUsage(): Promise<TemplateUsageRow[]> {
    const { rows: totalRows } = await pool.query('SELECT COUNT(*)::int AS count FROM resumes');
    const totalResumes = totalRows[0].count as number;

    const { rows } = await pool.query(
      `SELECT t.template_id, t.template_name, COUNT(r.resume_id)::int AS resume_count
         FROM templates t
         LEFT JOIN resumes r ON r.template_id = t.template_id
        GROUP BY t.template_id, t.template_name
        ORDER BY resume_count DESC, t.template_name ASC`
    );

    const { rows: unassignedRows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM resumes WHERE template_id IS NULL'
    );
    const unassignedCount = unassignedRows[0].count as number;

    const usage: TemplateUsageRow[] = rows.map((row) => ({
      template_id: row.template_id,
      template_name: row.template_name,
      resume_count: row.resume_count,
      percentage: totalResumes > 0 ? Number(((row.resume_count / totalResumes) * 100).toFixed(1)) : 0,
    }));

    if (unassignedCount > 0) {
      usage.push({
        template_id: null,
        template_name: 'No template selected',
        resume_count: unassignedCount,
        percentage: totalResumes > 0 ? Number(((unassignedCount / totalResumes) * 100).toFixed(1)) : 0,
      });
      usage.sort((a, b) => b.resume_count - a.resume_count);
    }

    return usage;
  },

  /**
   * Search + filter + sort + paginate the users table. `search` matches
   * username, full_name, or email (case-insensitive substring). `role`
   * narrows to 'user' | 'admin' | 'all'. `sort` is resolved through the
   * USER_SORT_SQL whitelist — never interpolated directly (Part 15).
   */
  async listUsers(params: {
    search?: string;
    role: 'all' | 'user' | 'admin';
    sort: UserSort;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<AdminUserRow>> {
    const { search, role, sort, page, limit } = params;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(likeTerm(search));
      const idx = values.length;
      conditions.push(`(u.username ILIKE $${idx} ESCAPE '\\' OR u.full_name ILIKE $${idx} ESCAPE '\\' OR u.email ILIKE $${idx} ESCAPE '\\')`);
    }
    if (role !== 'all') {
      values.push(role);
      conditions.push(`u.role = $${values.length}`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderSql = USER_SORT_SQL[sort];

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM users u ${whereSql}`,
      values
    );
    const total = countRows[0].count as number;

    const dataValues = [...values, limit, offset];
    const { rows } = await pool.query(
      `SELECT u.user_id, u.full_name, u.username, u.email, u.role, u.created_at, u.updated_at,
              COUNT(r.resume_id)::int AS resume_count
         FROM users u
         LEFT JOIN resumes r ON r.user_id = u.user_id
         ${whereSql}
        GROUP BY u.user_id
        ORDER BY ${orderSql}
        LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    return { data: rows, total, page, limit };
  },

  /** All matching users, unpaginated — backs the Users CSV export. */
  async listUsersForExport(params: { search?: string; role: 'all' | 'user' | 'admin' }): Promise<AdminUserRow[]> {
    const { search, role } = params;
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(likeTerm(search));
      const idx = values.length;
      conditions.push(`(u.username ILIKE $${idx} ESCAPE '\\' OR u.full_name ILIKE $${idx} ESCAPE '\\' OR u.email ILIKE $${idx} ESCAPE '\\')`);
    }
    if (role !== 'all') {
      values.push(role);
      conditions.push(`u.role = $${values.length}`);
    }
    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT u.user_id, u.full_name, u.username, u.email, u.role, u.created_at, u.updated_at,
              COUNT(r.resume_id)::int AS resume_count
         FROM users u
         LEFT JOIN resumes r ON r.user_id = u.user_id
         ${whereSql}
        GROUP BY u.user_id
        ORDER BY u.created_at DESC`,
      values
    );
    return rows;
  },

  /** Single user detail (safe fields only) plus their resume count. */
  async getUserById(userId: number): Promise<AdminUserRow | null> {
    const { rows } = await pool.query(
      `SELECT u.user_id, u.full_name, u.username, u.email, u.role, u.created_at, u.updated_at,
              COUNT(r.resume_id)::int AS resume_count
         FROM users u
         LEFT JOIN resumes r ON r.user_id = u.user_id
        WHERE u.user_id = $1
        GROUP BY u.user_id`,
      [userId]
    );
    return rows[0] ?? null;
  },

  /** A user's resumes, for the admin's "view user" page. */
  async getUserResumes(userId: number): Promise<AdminUserResumeRow[]> {
    const { rows } = await pool.query(
      `SELECT r.resume_id, r.title, t.template_name, r.created_at, r.updated_at
         FROM resumes r
         LEFT JOIN templates t ON t.template_id = r.template_id
        WHERE r.user_id = $1
        ORDER BY r.updated_at DESC`,
      [userId]
    );
    return rows;
  },

  /**
   * Search + filter + sort + paginate every resume on the platform, joined
   * with its owner and template. `search` matches resume title, owner
   * username, or owner email. `sort` is resolved through RESUME_SORT_SQL.
   */
  async listResumes(params: {
    search?: string;
    templateId?: number;
    userId?: number;
    sort: ResumeSort;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<AdminResumeRow>> {
    const { search, templateId, userId, sort, page, limit } = params;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(likeTerm(search));
      const idx = values.length;
      conditions.push(`(r.title ILIKE $${idx} ESCAPE '\\' OR u.username ILIKE $${idx} ESCAPE '\\' OR u.email ILIKE $${idx} ESCAPE '\\')`);
    }
    if (templateId !== undefined) {
      values.push(templateId);
      conditions.push(`r.template_id = $${values.length}`);
    }
    if (userId !== undefined) {
      values.push(userId);
      conditions.push(`r.user_id = $${values.length}`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderSql = RESUME_SORT_SQL[sort];
    const baseFrom = `FROM resumes r
       JOIN users u ON u.user_id = r.user_id
       LEFT JOIN templates t ON t.template_id = r.template_id`;

    const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS count ${baseFrom} ${whereSql}`, values);
    const total = countRows[0].count as number;

    const dataValues = [...values, limit, offset];
    // Only the lightweight header columns are selected here — never the
    // full resume JSON/sub-sections (Part 19: "do not retrieve full resume
    // JSON unless needed" for list views). The accent color lives inside
    // the `customization` JSONB blob (Part 3 §7's "Color" column).
    const { rows } = await pool.query(
      `SELECT r.resume_id, r.title, r.user_id,
              u.username AS owner_username, u.full_name AS owner_full_name, u.email AS owner_email,
              r.template_id, t.template_name,
              r.customization->>'accentColor' AS accent_color,
              r.created_at, r.updated_at
         ${baseFrom}
         ${whereSql}
        ORDER BY ${orderSql}
        LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    return { data: rows, total, page, limit };
  },

  /** All matching resumes, unpaginated — backs the Resumes CSV export. */
  async listResumesForExport(params: { search?: string; templateId?: number; userId?: number }): Promise<AdminResumeRow[]> {
    const { search, templateId, userId } = params;
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(likeTerm(search));
      const idx = values.length;
      conditions.push(`(r.title ILIKE $${idx} ESCAPE '\\' OR u.username ILIKE $${idx} ESCAPE '\\' OR u.email ILIKE $${idx} ESCAPE '\\')`);
    }
    if (templateId !== undefined) {
      values.push(templateId);
      conditions.push(`r.template_id = $${values.length}`);
    }
    if (userId !== undefined) {
      values.push(userId);
      conditions.push(`r.user_id = $${values.length}`);
    }
    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT r.resume_id, r.title, r.user_id,
              u.username AS owner_username, u.full_name AS owner_full_name, u.email AS owner_email,
              r.template_id, t.template_name,
              r.customization->>'accentColor' AS accent_color,
              r.created_at, r.updated_at
         FROM resumes r
         JOIN users u ON u.user_id = r.user_id
         LEFT JOIN templates t ON t.template_id = r.template_id
         ${whereSql}
        ORDER BY r.updated_at DESC`,
      values
    );
    return rows;
  },
};
