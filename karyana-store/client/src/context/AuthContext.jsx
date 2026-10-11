import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('karyana_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.success) {
      localStorage.setItem('karyana_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('karyana_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager' || isAdmin;
  const isCashier = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        isCashier
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
