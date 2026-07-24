'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '@/shared/types/auth.types';
import { useRouter } from 'next/navigation';

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
    // Mock API Call for User OTP login
    setIsLoading(true);
    setTimeout(() => {
      if (otp === '123456') { // Mock verification
        const mockUser: User = { id: '1', email, role: 'User', name: 'Demo User' };
        setUser(mockUser);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
      } else {
        setIsLoading(false);
        throw new Error('Invalid OTP');
      }
      setIsLoading(false);
    }, 1000);
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
        router.push('/chat');
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
