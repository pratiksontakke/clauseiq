import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import type { User, AuthResponse } from '../types/api';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user from localStorage
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => {
      const userId = localStorage.getItem('user_id');
      const email = localStorage.getItem('user_email');
      if (!userId || !email) {
        throw new Error('No user data');
      }
      return { id: userId, email };
    },
    retry: false,
    enabled: !!localStorage.getItem('auth_token'), // Only run if we have a token
  });

  // Login mutation
  const login = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials) => auth.login(credentials.email, credentials.password),
    onSuccess: (data, variables) => {
      // Store user data from login response
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_email', data.email || variables.email);
      // Invalidate user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Navigate after successful login
      navigate('/dashboard');
    },
  });

  // Register mutation
  const register = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials) => auth.register(credentials.email, credentials.password),
    onSuccess: (data, variables) => {
      // Store user data from register response
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_email', data.email || variables.email);
      // Invalidate user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: auth.logout,
    onSuccess: () => {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      queryClient.clear();
      navigate('/login');
    },
  });

  // Reset password mutation
  const resetPassword = useMutation<void, Error, string>({
    mutationFn: (email) => auth.resetPassword(email),
  });

  // Consider both the user object and loading state
  const isAuthenticated = !!user && !isLoadingUser;

  return {
    user,
    isLoadingUser,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
  };
} 