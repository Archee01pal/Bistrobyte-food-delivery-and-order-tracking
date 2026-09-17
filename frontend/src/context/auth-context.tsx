'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth.types';

export type UserRole = 'CUSTOMER' | 'RESTAURANT_MANAGER' | 'DRIVER' | 'SYSTEM_ADMIN';

// Extend base User interface with optional role and dynamic backend properties
export type ExtendedUser = User & {
  role?: UserRole;
  [key: string]: any;
};

interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  isLoading: boolean;
  role: UserRole;
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>;
  switchRole: (newRole: UserRole) => void;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(true);

  const updateRoleCookie = (activeRole: UserRole) => {
    if (typeof document !== 'undefined') {
      document.cookie = `user_role=${activeRole}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        const activeRole: UserRole = parsedUser.role || (localStorage.getItem('activeRole') as UserRole) || 'CUSTOMER';

        setToken(storedToken);
        setUser({ ...parsedUser, role: activeRole });
        setRole(activeRole);
        updateRoleCookie(activeRole);
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

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('activeRole', newRole);
    updateRoleCookie(newRole);
    if (user) {
      const updatedUser: ExtendedUser = { ...(user as any), role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = (data: any) => {
    if (!data) return;

    const payload = data.data || data;
    const extractedToken = payload.accessToken || payload.token || payload.access_token;
    const extractedUser = payload.user || (payload.email ? payload : null);

    if (extractedToken) {
      localStorage.setItem('accessToken', extractedToken);
      if (typeof document !== 'undefined') {
        document.cookie = `accessToken=${extractedToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      setToken(extractedToken);
    }

    if (extractedUser) {
      const userRole: UserRole = extractedUser.role || 'CUSTOMER';
      const finalUser: ExtendedUser = { ...extractedUser, role: userRole };
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      setRole(userRole);
      updateRoleCookie(userRole);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    if (typeof document !== 'undefined') {
      document.cookie = 'user_role=; path=/; max-age=0;';
      document.cookie = 'accessToken=; path=/; max-age=0;';
    }
    setToken(null);
    setUser(null);
    setRole('CUSTOMER');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, role, setUser, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};