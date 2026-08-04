'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '@/shared/types/auth.types';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock initializing auth from local storage/token
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const loginUser = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const response: any = await authService.loginUser(email, otp);
      // Update this later if the backend returns actual user details (like name/role)
      const userObj: User = { id: '1', email: response?.email || email, role: response?.role || 'User', name: 'Demo User' };
      setUser(userObj);
      localStorage.setItem('mockUser', JSON.stringify(userObj));
      // If a token is returned, save it here so it can be sent in subsequent requests
      if (response?.access_token || response?.data?.access_token) {
        localStorage.setItem('token', response.access_token || response.data.access_token);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const loginAdmin = async (email: string, password: string) => {
    // Mock API Call for Admin Password login
    setIsLoading(true);
    setTimeout(() => {
      if (password === 'admin123') { // Mock validation
        const role = email.includes('super') ? 'Super Admin' : 'Admin';
        const mockAdmin: User = { id: '2', email, role, name: role };
        setUser(mockAdmin);
        localStorage.setItem('mockUser', JSON.stringify(mockAdmin));
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        throw new Error('Invalid Credentials');
      }
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
