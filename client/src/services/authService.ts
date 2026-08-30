import { apiRequest } from './apiClient';
import { User } from '../types/user';

interface AuthResponse {
  user: User;
}

export const authService = {
  async register(fullName: string, username: string, email: string, password: string): Promise<AuthResponse> {
    // The server sets the auth cookie on this response (Set-Cookie);
    // nothing further to store here — no token is returned in the body.
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { full_name: fullName, username, email, password },
      auth: false,
    });
  },

  async login(identifier: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
      auth: false,
    });
  },

  async logout(): Promise<void> {
    // The server clears the auth cookie on this response.
    await apiRequest('/auth/logout', { method: 'POST' });
  },

  async me(): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/auth/me');
  },
};
