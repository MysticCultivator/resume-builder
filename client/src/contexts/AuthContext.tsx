import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The JWT lives in an HttpOnly cookie, invisible to JavaScript, so
    // there's no client-side flag to check before deciding whether to load
    // the profile — we always ask the server via /auth/me and let it tell
    // us (via 401) whether we have a valid session.
    async function loadProfile() {
      try {
        const { user: profile } = await authService.me();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // If any API call comes back 401 (missing/invalid/expired session),
  // apiClient fires this event — drop the in-memory user immediately so
  // ProtectedRoute redirects to /login instead of leaving the page in a
  // half-authenticated, broken state.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  async function login(identifier: string, password: string) {
    const { user: loggedInUser } = await authService.login(identifier, password);
    setUser(loggedInUser);
  }

  async function register(fullName: string, username: string, email: string, password: string) {
    const { user: newUser } = await authService.register(fullName, username, email, password);
    setUser(newUser);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
