import { Role } from './user';
import { ResumeWithSections } from './resume';

/** A user row as returned by the admin users list/detail endpoints — same
 *  safe fields as `User`, plus a resume count computed server-side. Never
 *  carries a password hash or any session/secret data. */
export interface AdminUser {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
  resume_count: number;
}

/** One of a user's resumes, as shown on the admin "view user" page. */
export interface AdminUserResume {
  resume_id: number;
  title: string;
  template_name: string | null;
  created_at: string;
  updated_at: string;
}

/** A resume row as returned by the admin resumes list endpoint — owner and
 *  template already joined server-side so the table needs no extra requests. */
export interface AdminResumeListItem {
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

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type UserRoleFilter = 'all' | 'user' | 'admin';
export type UserSort = 'newest' | 'oldest' | 'name_asc' | 'name_desc';
export type ResumeSort = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'title_asc';

export interface ListUsersParams {
  search?: string;
  role?: UserRoleFilter;
  sort?: UserSort;
  page?: number;
  limit?: number;
}

export interface ListResumesParams {
  search?: string;
  template_id?: number;
  user_id?: number;
  sort?: ResumeSort;
  page?: number;
  limit?: number;
}

export interface RecentResumeActivity {
  resume_id: number;
  title: string;
  user_id: number;
  user_full_name: string;
  created_at: string;
  updated_at: string;
}

export interface RecentUser {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  role: Role;
  created_at: string;
}

/** GET /api/admin/statistics — platform overview for the dashboard. */
export interface PlatformStats {
  total_users: number;
  total_resumes: number;
  total_templates: number;
  users_today: number;
  users_last_7_days: number;
  users_last_30_days: number;
  resumes_today: number;
  resumes_last_7_days: number;
  resumes_last_30_days: number;
  avg_resumes_per_user: number;
  most_used_template: string | null;
  recent_activity: RecentResumeActivity[];
  recent_users: RecentUser[];
}

/** GET /api/admin/template-usage — one row per template. */
export interface TemplateUsage {
  template_id: number | null;
  template_name: string;
  resume_count: number;
  percentage: number;
}

/** GET /api/admin/resumes/:id — the same full resume shape a user sees in
 *  their own preview, plus the owner's safe identity fields, for the
 *  admin's read-only viewer. */
export interface AdminResumeDetail extends ResumeWithSections {
  owner: { user_id: number; full_name: string; username: string; email: string } | null;
}
