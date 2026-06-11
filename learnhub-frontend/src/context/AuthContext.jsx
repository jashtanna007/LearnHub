import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('learnhub_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('learnhub_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
        setToken(storedToken);
      } catch (error) {
        // Token invalid or expired — clear it
        localStorage.removeItem('learnhub_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem('learnhub_token', newToken);
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    // First register
    await api.post('/api/auth/register', { name, email, password, role });

    // Then auto-login
    const userData = await login(email, password);
    return userData;
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('learnhub_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    role,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
