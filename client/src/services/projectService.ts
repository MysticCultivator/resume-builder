import { apiRequest } from './apiClient';
import { Project, ProjectInput } from '../types/project';

export const projectService = {
  list: (resumeId: number) => apiRequest<Project[]>(`/resumes/${resumeId}/projects`),

  create: (resumeId: number, data: ProjectInput) =>
    apiRequest<{ project: Project }>(`/resumes/${resumeId}/projects`, { method: 'POST', body: data }),

  update: (projectId: number, data: Partial<ProjectInput>) =>
    apiRequest<{ project: Project }>(`/projects/${projectId}`, { method: 'PUT', body: data }),

  remove: (projectId: number) =>
    apiRequest<{ success: true }>(`/projects/${projectId}`, { method: 'DELETE' }),
};
