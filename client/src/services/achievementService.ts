import { apiRequest } from './apiClient';
import { Achievement, AchievementInput } from '../types/achievement';

export const achievementService = {
  list: (resumeId: number) => apiRequest<Achievement[]>(`/resumes/${resumeId}/achievements`),

  create: (resumeId: number, data: AchievementInput) =>
    apiRequest<{ achievement: Achievement }>(`/resumes/${resumeId}/achievements`, { method: 'POST', body: data }),

  update: (achievementId: number, data: Partial<AchievementInput>) =>
    apiRequest<{ achievement: Achievement }>(`/achievements/${achievementId}`, { method: 'PUT', body: data }),

  remove: (achievementId: number) =>
    apiRequest<{ success: true }>(`/achievements/${achievementId}`, { method: 'DELETE' }),
};
