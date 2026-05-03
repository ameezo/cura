import { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get('user'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const userData = data.user;
      setUser(userData);
      storage.set('user', userData);
      storage.set('token', data.access_token);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password, role }) => {
    setLoading(true);
    try {
      const data = await authApi.register({ email, password, role });
      const userData = data.user;
      setUser(userData);
      storage.set('user', userData);
      storage.set('token', data.access_token);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storage.remove('user');
    storage.remove('token');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    storage.set('user', updatedUser);
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
      storage.set('user', data);
      return data;
    } catch {
      // If token is invalid, clear auth state
      setUser(null);
      storage.remove('user');
      storage.remove('token');
      return null;
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated, updateUser, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
