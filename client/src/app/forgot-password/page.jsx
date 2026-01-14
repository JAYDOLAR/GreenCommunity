'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setStep(2);
    } catch (error) {
      setError(error.message || 'Failed to send code. Please try again.');
    } finally {
      setSubmitted(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    try {
      await authAPI.verifyResetCode(email, code);
      // Store email and code in sessionStorage for the update-password page
      sessionStorage.setItem('resetEmail', email);
      sessionStorage.setItem('resetCode', code);
      router.push('/update-password');
    } catch (error) {
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={step === 1 ? handleSendCode : handleVerify} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="App Logo"
            className="mx-auto h-15 w-80 mb-5"
          />
         
          {step === 1 ? (
            <p className="text-muted-foreground text-sm mb-4">
              Enter your email address and we will send you a code to reset your password.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm mb-4">
              Enter the verification code sent to your email.
            </p>
          )}
        </div>
        {step === 1 ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1 text-foreground">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              required
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center text-sm">{error}</div>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded-md font-semibold text-white bg-primary hover:bg-primary/90 transition"
          disabled={submitted}
        >
          {submitted
            ? (step === 1 ? 'Sending...' : 'Verifying...')
            : (step === 1 ? 'Send Code' : 'Verify')}
        </button>
        <div className="text-center">
          <Link href="/login" className="text-primary hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </main>
  );
} 