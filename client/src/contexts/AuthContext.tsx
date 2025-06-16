import { createContext, useContext, ReactNode } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import type { User, AuthResponse } from '../types/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoadingUser: boolean;
  isAuthenticated: boolean;
  login: UseMutationResult<AuthResponse, Error, LoginCredentials>;
  register: UseMutationResult<AuthResponse, Error, LoginCredentials>;
  logout: UseMutationResult<void, Error, void>;
  resetPassword: UseMutationResult<void, Error, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 