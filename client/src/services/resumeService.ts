import { apiRequest } from './apiClient';
import { Resume, ResumeInput, ResumeWithSections } from '../types/resume';

export const resumeService = {
  list: () => apiRequest<Resume[]>('/resumes'),

  create: (data: ResumeInput) =>
    apiRequest<{ resume: Resume }>('/resumes', { method: 'POST', body: data }),

  getOne: (id: number) => apiRequest<ResumeWithSections>(`/resumes/${id}`),

  /** GET /api/resumes/:id/full — same shape as getOne, dedicated Part 2 endpoint. */
  getFull: (id: number) => apiRequest<ResumeWithSections>(`/resumes/${id}/full`),

  update: (id: number, data: ResumeInput) =>
    apiRequest<{ resume: Resume }>(`/resumes/${id}`, { method: 'PUT', body: data }),

  remove: (id: number) => apiRequest<{ success: true }>(`/resumes/${id}`, { method: 'DELETE' }),
};
