import { apiRequest, API_BASE_URL } from './apiClient';
import {
  AdminUser,
  AdminUserResume,
  AdminResumeListItem,
  AdminResumeDetail,
  Paginated,
  ListUsersParams,
  ListResumesParams,
  PlatformStats,
  TemplateUsage,
} from '../types/admin';

/** Builds a `?a=1&b=2` query string, skipping undefined/empty values so
 *  optional filters don't show up as `?search=&role=all` in every request. */
function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const adminService = {
  // ── Users ────────────────────────────────────────────────────────────
  listUsers: (params: ListUsersParams = {}) =>
    apiRequest<Paginated<AdminUser>>(
      `/admin/users${toQueryString({
        search: params.search,
        role: params.role,
        sort: params.sort,
        page: params.page,
        limit: params.limit,
      })}`
    ),
  getUser: (id: number) => apiRequest<{ user: AdminUser }>(`/admin/users/${id}`),
  getUserResumes: (id: number) => apiRequest<AdminUserResume[]>(`/admin/users/${id}/resumes`),
  removeUser: (id: number) => apiRequest<{ success: true }>(`/admin/users/${id}`, { method: 'DELETE' }),

  // ── Resumes ──────────────────────────────────────────────────────────
  listResumes: (params: ListResumesParams = {}) =>
    apiRequest<Paginated<AdminResumeListItem>>(
      `/admin/resumes${toQueryString({
        search: params.search,
        template_id: params.template_id,
        user_id: params.user_id,
        sort: params.sort,
        page: params.page,
        limit: params.limit,
      })}`
    ),
  getResume: (id: number) => apiRequest<AdminResumeDetail>(`/admin/resumes/${id}`),
  removeResume: (id: number) => apiRequest<{ success: true }>(`/admin/resumes/${id}`, { method: 'DELETE' }),

  // ── Statistics / analytics ──────────────────────────────────────────
  /** GET /api/admin/statistics — platform overview. */
  statistics: () => apiRequest<PlatformStats>('/admin/statistics'),
  /** GET /api/admin/template-usage — per-template resume counts + percentages. */
  templateUsage: () => apiRequest<TemplateUsage[]>('/admin/template-usage'),

  // ── CSV export ───────────────────────────────────────────────────────
  /** Full download URLs for the three CSV export endpoints — plain <a href>
   *  links so the browser handles the download natively (Content-Disposition
   *  is set server-side); the HttpOnly auth cookie rides along automatically
   *  on this same top-level GET navigation. */
  exportUsersUrl: () => `${API_BASE_URL}/admin/export/users`,
  exportResumesUrl: () => `${API_BASE_URL}/admin/export/resumes`,
  exportTemplatesUrl: () => `${API_BASE_URL}/admin/export/templates`,
};
