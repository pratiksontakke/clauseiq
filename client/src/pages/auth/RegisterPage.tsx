import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAuthContext } from '../../contexts/AuthContext';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const { register: registerMutation } = useAuthContext();
  const { register, handleSubmit, watch, formState: { errors }, setError } = useForm<RegisterFormData>();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Registration failed. Please try again.',
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-text">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 block w-full rounded-md border border-ink-light/30 shadow-sm p-2 focus:border-coral-primary focus:ring focus:ring-coral-primary/20"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-text">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="mt-1 block w-full rounded-md border border-ink-light/30 shadow-sm p-2 focus:border-coral-primary focus:ring focus:ring-coral-primary/20"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={registerMutation.isPending}
          fullWidth
        >
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-ink-medium">
          Already have an account?{' '}
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

export default RegisterPage; 