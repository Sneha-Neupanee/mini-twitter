import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mt_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const loginUser = useCallback(async (credentials) => {
    const { data } = await apiLogin(credentials);
    localStorage.setItem('mt_token', data.token);
    localStorage.setItem('mt_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const registerUser = useCallback(async (formData) => {
    const { data } = await apiRegister(formData);
    localStorage.setItem('mt_token', data.token);
    localStorage.setItem('mt_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mt_token');
    localStorage.removeItem('mt_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
