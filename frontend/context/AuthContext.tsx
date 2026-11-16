import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type RegisterPayload } from '../services/authService';
import { TOKEN_KEY } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  updateUserState: (updated: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const response = await authService.register(payload);
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const updateUserState = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUserState }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
