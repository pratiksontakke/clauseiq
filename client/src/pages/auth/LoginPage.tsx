import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuthContext } from '../../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { login } = useAuthContext();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Login failed. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-rhythm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border border-ink-light/30 shadow-sm p-2 focus:border-coral-primary focus:ring focus:ring-coral-primary/20"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-text">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 block w-full rounded-md border border-ink-light/30 shadow-sm p-2 focus:border-coral-primary focus:ring focus:ring-coral-primary/20"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-coral-primary hover:text-coral-primary/90"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={login.isPending}
          fullWidth
        >
          Log in
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-ink-medium">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-coral-primary hover:text-coral-primary/90"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 