'use client';

import { Input, InputOTP, REGEXP_ONLY_DIGITS, toast } from '@heroui/react';
import { Eye, EyeSlash } from 'iconsax-reactjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { REQUEST_PASSWORD_RESET, RESET_PASSWORD } from '@/lib/graphql/otp';
import { graphqlClient } from '@/lib/graphql-client';

type Step = 'email' | 'otp' | 'new-password';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      await graphqlClient.request(REQUEST_PASSWORD_RESET, {
        input: { email: email.trim() },
      });
      setStep('otp');
    } catch {
      // Always move to OTP step to prevent email enumeration
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setError('');
    setStep('new-password');
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await graphqlClient.request(RESET_PASSWORD, {
        input: { email, otp, newPassword },
      });
      toast.success('Password reset! You can now sign in with your new password.');
      router.push('/login');
    } catch (err: unknown) {
      const error = err as { response?: { errors?: { message: string }[] }; message?: string };
      const errorMessage =
        error?.response?.errors?.[0]?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      // If OTP was invalid, go back to OTP step
      if (
        errorMessage.toLowerCase().includes('otp') ||
        errorMessage.toLowerCase().includes('expired')
      ) {
        setStep('otp');
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-default-500 mt-1 text-sm">
          {step === 'email' && 'Enter your email to receive a reset code.'}
          {step === 'otp' && (
            <>
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </>
          )}
          {step === 'new-password' && 'Choose a new password for your account.'}
        </p>
      </div>

      {step === 'email' && (
        <form onSubmit={handleRequestReset} className="space-y-5">
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <CustomButton type="submit" isDisabled={loading || !email.trim()} className="w-full">
            {loading ? 'Sending code...' : 'Send Reset Code'}
          </CustomButton>

          <p className="text-center text-sm text-default-500">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium mb-1.5 block self-start">Reset code</span>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={() => {
                setError('');
                setStep('new-password');
              }}
              pattern={REGEXP_ONLY_DIGITS}
              isInvalid={!!error}
              autoFocus
            >
              <InputOTP.Group>
                <InputOTP.Slot index={0} />
                <InputOTP.Slot index={1} />
                <InputOTP.Slot index={2} />
              </InputOTP.Group>
              <InputOTP.Separator />
              <InputOTP.Group>
                <InputOTP.Slot index={3} />
                <InputOTP.Slot index={4} />
                <InputOTP.Slot index={5} />
              </InputOTP.Group>
            </InputOTP>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <CustomButton type="submit" isDisabled={otp.length !== 6} className="w-full">
            Continue
          </CustomButton>

          <p className="text-center text-sm text-default-500">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setError('');
              }}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Use a different email
            </button>
          </p>
        </form>
      )}

      {step === 'new-password' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="new-password" className="text-sm font-medium mb-1.5 block">
                New password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  variant="primary"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium mb-1.5 block">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  variant="primary"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <CustomButton
            type="submit"
            isDisabled={loading || !newPassword || !confirmPassword}
            className="w-full"
          >
            {loading ? 'Resetting password...' : 'Reset Password'}
          </CustomButton>

          <p className="text-center text-sm text-default-500">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
