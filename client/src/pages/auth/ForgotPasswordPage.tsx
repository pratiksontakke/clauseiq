import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuthContext } from '../../contexts/AuthContext';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuthContext();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword.mutateAsync(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.',
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-ink-text">Check Your Email</h2>
        <p className="text-ink-medium">
          We've sent a password reset link to your email address.
        </p>
        <p className="text-sm text-ink-medium">
          <Link
            to="/login"
            className="text-coral-primary hover:text-coral-primary/90"
          >
            Return to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-rhythm">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-ink-text">Reset Password</h2>
        <p className="mt-2 text-ink-medium">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border border-ink-light/30 shadow-sm p-2 focus:border-coral-primary focus:ring focus:ring-coral-primary/20"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={resetPassword.isPending}
          fullWidth
        >
          Send Reset Link
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-ink-medium">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-coral-primary hover:text-coral-primary/90"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 