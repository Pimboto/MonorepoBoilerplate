'use client';

import { signUpSchema } from '@cocostudio/shared';
import { Input } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { useAuth } from '@/context/auth-context';
import { SIGN_UP } from '@/lib/graphql/auth';
import { graphqlClient } from '@/lib/graphql-client';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
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
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validation = signUpSchema.safeParse(input);
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
      await graphqlClient.request(SIGN_UP, { input });
      // Redirect to email verification instead of app
      router.push(`/verify-email?email=${encodeURIComponent(input.email)}`);
    } catch (err: unknown) {
      const error = err as { response?: { errors?: { message: string }[] }; message?: string };
      const errorMessage =
        error?.response?.errors?.[0]?.message || error?.message || 'Sign up failed';
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
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-default-500 mt-1 text-sm">Sign up to get started with your workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium mb-1.5 block">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              variant="primary"
              required
              autoComplete="name"
              className={errors.name ? 'border-danger' : ''}
              fullWidth
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
          </div>

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
            <label htmlFor="password" className="text-sm font-medium mb-1.5 block">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              variant="primary"
              required
              autoComplete="new-password"
              className={errors.password ? 'border-danger' : ''}
              fullWidth
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
          {loading ? 'Creating account...' : 'Create Account'}
        </CustomButton>

        <p className="text-center text-sm text-default-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
