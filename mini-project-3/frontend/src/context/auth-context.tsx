'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    } else {
      if (storedUser === 'undefined' || storedUser === 'null') {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: any) => {
    if (!data) return;

    // Safely unwrap data in case Axios response or nested object is passed
    const payload = data.data || data;
    const extractedToken = payload.accessToken || payload.token || payload.access_token;
    const extractedUser = payload.user || (payload.email ? payload : null);

    if (extractedToken) {
      localStorage.setItem('accessToken', extractedToken);
      setToken(extractedToken);
    } else {
      console.warn('Login attempt made without a valid access token in payload:', payload);
    }

    if (extractedUser) {
      localStorage.setItem('user', JSON.stringify(extractedUser));
      setUser(extractedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};