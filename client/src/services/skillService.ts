import { apiRequest } from './apiClient';
import { Skill, SkillInput } from '../types/skill';

export const skillService = {
  list: (resumeId: number) => apiRequest<Skill[]>(`/resumes/${resumeId}/skills`),

  create: (resumeId: number, data: SkillInput) =>
    apiRequest<{ skill: Skill }>(`/resumes/${resumeId}/skills`, { method: 'POST', body: data }),

  update: (skillId: number, data: Partial<SkillInput>) =>
    apiRequest<{ skill: Skill }>(`/skills/${skillId}`, { method: 'PUT', body: data }),

  remove: (skillId: number) =>
    apiRequest<{ success: true }>(`/skills/${skillId}`, { method: 'DELETE' }),
};
