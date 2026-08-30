import { apiRequest } from './apiClient';
import { Education, EducationInput } from '../types/education';

export const educationService = {
  list: (resumeId: number) => apiRequest<Education[]>(`/resumes/${resumeId}/education`),

  create: (resumeId: number, data: EducationInput) =>
    apiRequest<{ education: Education }>(`/resumes/${resumeId}/education`, { method: 'POST', body: data }),

  update: (educationId: number, data: Partial<EducationInput>) =>
    apiRequest<{ education: Education }>(`/education/${educationId}`, { method: 'PUT', body: data }),

  remove: (educationId: number) =>
    apiRequest<{ success: true }>(`/education/${educationId}`, { method: 'DELETE' }),
};
