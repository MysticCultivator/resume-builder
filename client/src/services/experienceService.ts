import { apiRequest } from './apiClient';
import { Experience, ExperienceInput } from '../types/experience';

export const experienceService = {
  list: (resumeId: number) => apiRequest<Experience[]>(`/resumes/${resumeId}/experience`),

  create: (resumeId: number, data: ExperienceInput) =>
    apiRequest<{ experience: Experience }>(`/resumes/${resumeId}/experience`, { method: 'POST', body: data }),

  update: (experienceId: number, data: Partial<ExperienceInput>) =>
    apiRequest<{ experience: Experience }>(`/experience/${experienceId}`, { method: 'PUT', body: data }),

  remove: (experienceId: number) =>
    apiRequest<{ success: true }>(`/experience/${experienceId}`, { method: 'DELETE' }),
};
