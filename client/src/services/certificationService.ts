import { apiRequest } from './apiClient';
import { Certification, CertificationInput } from '../types/certification';

export const certificationService = {
  list: (resumeId: number) => apiRequest<Certification[]>(`/resumes/${resumeId}/certifications`),

  create: (resumeId: number, data: CertificationInput) =>
    apiRequest<{ certification: Certification }>(`/resumes/${resumeId}/certifications`, { method: 'POST', body: data }),

  update: (certificationId: number, data: Partial<CertificationInput>) =>
    apiRequest<{ certification: Certification }>(`/certifications/${certificationId}`, { method: 'PUT', body: data }),

  remove: (certificationId: number) =>
    apiRequest<{ success: true }>(`/certifications/${certificationId}`, { method: 'DELETE' }),
};
