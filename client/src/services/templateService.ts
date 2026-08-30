import { apiRequest } from './apiClient';
import { Template } from '../types/template';

export const templateService = {
  list: () => apiRequest<Template[]>('/templates'),
  getOne: (id: number) => apiRequest<{ template: Template }>(`/templates/${id}`),

  // Admin-only writes — the backend's requireAdmin middleware enforces this;
  // these live under /templates itself, not /admin/templates (Part 2 §19).
  create: (data: { template_name: string; thumbnail_url?: string }) =>
    apiRequest<{ template: Template }>('/templates', { method: 'POST', body: data }),
  update: (id: number, data: Partial<{ template_name: string; thumbnail_url: string }>) =>
    apiRequest<{ template: Template }>(`/templates/${id}`, { method: 'PUT', body: data }),
  remove: (id: number) => apiRequest<{ success: true }>(`/templates/${id}`, { method: 'DELETE' }),
};
