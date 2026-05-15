import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
axios.defaults.baseURL = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = (token) => {
    if (token) { localStorage.setItem('token', token); axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; }
    else { localStorage.removeItem('token'); delete axios.defaults.headers.common['Authorization']; }
  };

  const fetchMe = useCallback(async () => {
    try { const { data } = await axios.get('/auth/me'); setUser(data); }
    catch { setToken(null); setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; fetchMe(); }
    else setLoading(false);
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setToken(data.token); setUser(data.user); return data;
  };

  const register = async (name, email, password, role = 'student') => {
    const { data } = await axios.post('/auth/register', { name, email, password, role });
    setToken(data.token); setUser(data.user); return data;
  };

  const logout = () => { setToken(null); setUser(null); };
  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateUser, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
