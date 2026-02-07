'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../lib/api';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isResetFlow, setIsResetFlow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if this is a password reset flow (coming from forgot-password)
    const resetEmail = sessionStorage.getItem('resetEmail');
    const resetCode = sessionStorage.getItem('resetCode');
    
    if (resetEmail && resetCode) {
      setEmail(resetEmail);
      setCode(resetCode);
      setIsResetFlow(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      if (isResetFlow) {
        // Password reset flow - use code-based update
        await authAPI.updatePasswordWithCode(email, code, password);
        // Clear session storage
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetCode');
      } else {
        // Authenticated user password change
        if (!currentPassword) {
          setError('Current password is required');
          setLoading(false);
          return;
        }
        await authAPI.updatePassword(currentPassword, password);
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push(isResetFlow ? '/login' : '/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">

          <img
            src="/logo.png"
            alt="App Logo"
            className="mx-auto h-15 w-80 mb-5"
          />
          
        </div>
        <div className="text-center">
          
          <p className="text-muted-foreground text-sm mb-4">
            {isResetFlow 
              ? 'Create a new password for your account.'
              : 'Enter your current password and choose a new one.'}
          </p>
        </div>
        {!isResetFlow && (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-1 text-foreground">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              placeholder="Current Password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="New Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-foreground">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
        {error && (
          <div className="text-red-600 text-center text-sm">{error}</div>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded-md font-semibold text-white bg-primary hover:bg-primary/90 transition"
          disabled={submitted || loading}
        >
          {loading ? 'Updating...' : (submitted ? 'Password Updated!' : 'Update Password')}
        </button>
        {submitted && (
          <div className="text-green-600 text-center text-sm mt-2">
            Password updated successfully! Redirecting to {isResetFlow ? 'login' : 'dashboard'}...
          </div>
        )}
        <div className="text-center">
          <Link href="/login" className="text-primary hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </main>
  );
} 