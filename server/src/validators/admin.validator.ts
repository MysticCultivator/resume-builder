import { z } from 'zod';

// Every "sort" query param below is resolved through one of these lookup
// tables before it ever touches SQL — the value that reaches the database
// is always one of these fixed, hard-coded `ORDER BY` fragments, never the
// raw query string itself. This is the whitelist called for in Part 15
// ("For sorting, filtering, and dynamic query behavior, use a whitelist of
// allowed fields. Never insert arbitrary query parameters directly into SQL.").

export const USER_SORT_SQL = {
  newest: 'u.created_at DESC',
  oldest: 'u.created_at ASC',
  name_asc: 'u.full_name ASC',
  name_desc: 'u.full_name DESC',
} as const;

export type UserSort = keyof typeof USER_SORT_SQL;

export const RESUME_SORT_SQL = {
  updated_desc: 'r.updated_at DESC',
  updated_asc: 'r.updated_at ASC',
  created_desc: 'r.created_at DESC',
  created_asc: 'r.created_at ASC',
  title_asc: 'r.title ASC',
} as const;

export type ResumeSort = keyof typeof RESUME_SORT_SQL;

/** Shared page/limit parsing — coerces the querystring's strings to numbers
 *  and clamps them to sane bounds so nobody can request `limit=999999999`
 *  and force the server to pull the entire table into memory. */
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(15),
});

export const listUsersQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  role: z.enum(['all', 'user', 'admin']).optional().default('all'),
  sort: z.enum(Object.keys(USER_SORT_SQL) as [UserSort, ...UserSort[]]).optional().default('newest'),
});

export const listResumesQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  template_id: z.coerce.number().int().positive().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  sort: z.enum(Object.keys(RESUME_SORT_SQL) as [ResumeSort, ...ResumeSort[]]).optional().default('updated_desc'),
});

/** Same filters as the list endpoints but without pagination — the export
 *  endpoints always return every matching row. */
export const exportUsersQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  role: z.enum(['all', 'user', 'admin']).optional().default('all'),
});

export const exportResumesQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  template_id: z.coerce.number().int().positive().optional(),
  user_id: z.coerce.number().int().positive().optional(),
});
