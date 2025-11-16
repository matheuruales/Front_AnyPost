import { useState, useEffect, useCallback } from 'react';
import { backendApi } from '../services/backend';
import { AuthResponse, AuthUser } from '../types/backend';

interface AuthContextType {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

const sanitizeEmail = (value: string) => value.trim().toLowerCase();
const sanitizePassword = (value: string) => value.trim();

const persistSession = (response: AuthResponse, setUser: (user: AuthUser | null) => void) => {
  if (!response.token) {
    throw new Error('El backend no devolvió un token válido.');
  }
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  setUser(response.user);
};

export const useAuth = (): AuthContextType => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const response = await backendApi.auth.me();
        if (response.user) {
          setCurrentUser(response.user);
        } else {
          clearSession();
        }
      } catch (error) {
        console.error('Error validating session:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [clearSession]);

  useEffect(() => {
    const ensureTokenExists = () => {
      const hasToken = Boolean(localStorage.getItem(TOKEN_KEY));
      if (!hasToken && currentUser) {
        clearSession();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY && event.newValue === null) {
        ensureTokenExists();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', ensureTokenExists);
    document.addEventListener('visibilitychange', ensureTokenExists);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', ensureTokenExists);
      document.removeEventListener('visibilitychange', ensureTokenExists);
    };
  }, [currentUser, clearSession]);

  const register = async (email: string, password: string, displayName: string) => {
    const payload = {
      email: sanitizeEmail(email),
      password: sanitizePassword(password),
      displayName: displayName.trim() || 'Creator',
    };

    const response = await backendApi.auth.register(payload);
    persistSession(response, setCurrentUser);
  };

  const login = async (email: string, password: string) => {
    const payload = {
      email: sanitizeEmail(email),
      password: sanitizePassword(password),
    };

    const response = await backendApi.auth.login(payload);
    persistSession(response, setCurrentUser);
  };

  const logout = useCallback(async () => {
    clearSession();
    window.location.href = '/login';
  }, [clearSession]);

  const resetPassword = async (_email: string) => {
    throw new Error('Password reset is not available yet. Please contact support.');
  };

  return {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    loading,
  };
};
