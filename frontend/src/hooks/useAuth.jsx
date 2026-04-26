import { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import { mockUser } from '../utils/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get('user'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    const userData = { ...mockUser, email };
    setUser(userData);
    storage.set('user', userData);
    storage.set('token', 'mock-jwt-token-' + Date.now());
    setLoading(false);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const userData = {
      ...mockUser,
      name: data.name,
      email: data.email,
      phone: data.phone,
    };
    setUser(userData);
    storage.set('user', userData);
    storage.set('token', 'mock-jwt-token-' + Date.now());
    setLoading(false);
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storage.remove('user');
    storage.remove('token');
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated }}>
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
