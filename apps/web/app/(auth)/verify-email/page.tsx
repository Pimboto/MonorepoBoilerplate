'use client';

import { InputOTP, REGEXP_ONLY_DIGITS, toast } from '@heroui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { SEND_VERIFICATION_OTP, VERIFY_EMAIL } from '@/lib/graphql/otp';
import { graphqlClient } from '@/lib/graphql-client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (code?: string) => {
    const otpValue = code || otp;
    if (!email || otpValue.length !== 6) return;

    setVerifying(true);
    setError('');

    try {
      await graphqlClient.request(VERIFY_EMAIL, {
        input: { email, otp: otpValue },
      });
      toast.success('Email verified! You can now sign in.');
      router.push('/login');
    } catch (err: unknown) {
      const error = err as { response?: { errors?: { message: string }[] }; message?: string };
      const errorMessage =
        error?.response?.errors?.[0]?.message || 'Invalid or expired code. Please try again.';
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError('');

    try {
      await graphqlClient.request(SEND_VERIFICATION_OTP, {
        input: { email, type: 'email-verification' },
      });
      toast.success('Verification code resent to your email.');
    } catch {
      toast.danger('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-default-500 text-sm">No email address provided. Please sign up first.</p>
        <Link href="/signup" className="text-primary hover:underline font-medium text-sm">
          Go to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-default-500 mt-1 text-sm">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleVerify();
        }}
        className="space-y-5"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium mb-1.5 block self-start">Verification code</span>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleVerify}
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

        <CustomButton type="submit" isDisabled={verifying || otp.length !== 6} className="w-full">
          {verifying ? 'Verifying...' : 'Verify Email'}
        </CustomButton>

        <div className="text-center">
          <p className="text-sm text-default-500">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary hover:underline font-medium cursor-pointer disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend code'}
            </button>
          </p>
        </div>

        <p className="text-center text-sm text-default-500">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
