'use client';

import { signInSchema } from '@cocostudio/shared';
import { Input } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { useAuth } from '@/context/auth-context';
import { SIGN_IN } from '@/lib/graphql/auth';
import { graphqlClient } from '@/lib/graphql-client';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/app');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const input = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validation = signInSchema.safeParse(input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of validation.error.errors) {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await graphqlClient.request(SIGN_IN, { input });
      await refetchUser();
      router.push('/app/collections');
    } catch (err: unknown) {
      const error = err as { response?: { errors?: { message: string }[] }; message?: string };
      const errorMessage =
        error?.response?.errors?.[0]?.message || error?.message || 'Login failed';

      // If email is not verified, redirect to verification page
      if (
        errorMessage.toLowerCase().includes('email is not verified') ||
        errorMessage.toLowerCase().includes('email not verified') ||
        errorMessage.toLowerCase().includes('verify your email')
      ) {
        router.push(`/verify-email?email=${encodeURIComponent(input.email)}`);
        return;
      }

      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-default-500 mt-1 text-sm">Sign in to your account to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              variant="primary"
              required
              autoComplete="email"
              className={errors.email ? 'border-danger' : ''}
              fullWidth
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              variant="primary"
              required
              autoComplete="current-password"
              fullWidth
              className={errors.password ? 'border-danger' : ''}
            />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
          </div>
        </div>

        {errors.form && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
            <p className="text-danger text-sm">{errors.form}</p>
          </div>
        )}

        <CustomButton type="submit" isDisabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </CustomButton>

        <p className="text-center text-sm text-default-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
