'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, X, Check, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'auth', 'network', 'validation', 'server', 'email'
  const [showError, setShowError] = useState(false);
  
  // Client-side validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Clear errors when user starts typing
  useEffect(() => {
    if (email && emailError) setEmailError('');
    if (password && passwordError) setPasswordError('');
  }, [email, password]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setTimeout(() => setError(''), 300); // Clear error after animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Client-side validation
  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else if (email.includes('@') && !email.includes('.')) {
      setEmailError('Please enter a complete email address');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      
      // Call the authentication API
      const response = await fetch(`${serverUrl}/api/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        
        // Store admin session
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        // Store the authentication token
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
        }
        
        // Small delay to ensure session is stored before redirect
        setTimeout(() => {
          router.push('/admin');
        }, 100);
        
      } else {
        // Handle different types of errors with user-friendly messages
        let errorMessage = 'Invalid admin credentials. Please try again.';
        let type = 'auth';
        
        if (data.message) {
          if (data.message.includes('Invalid email') || data.message.includes('Email not found')) {
            errorMessage = 'You entered wrong email. Please retype your email.';
            type = 'email';
          } else if (data.message.includes('Invalid password') || data.message.includes('Invalid credentials')) {
            errorMessage = 'You entered wrong password. Please retype your password.';
            type = 'auth';
          } else if (data.message.includes('Network error') || data.message.includes('fetch')) {
            errorMessage = 'Connection problem. Please check your internet and try again.';
            type = 'network';
          } else if (data.message.includes('Server error') || data.message.includes('500')) {
            errorMessage = 'Server is having issues. Please try again in a few minutes.';
            type = 'server';
          } else {
            errorMessage = data.message;
            type = 'auth';
          }
        }
        
        setError(errorMessage);
        setErrorType(type);
      }
    } catch (error) {
      // Handle network errors
      let errorMessage = 'Connection problem. Please check your internet and try again.';
      let type = 'network';
      
      if (error.message) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Connection problem. Please check your internet and try again.';
          type = 'network';
        } else {
          errorMessage = 'An error occurred. Please try again.';
          type = 'server';
        }
      }
      
      setError(errorMessage);
      setErrorType(type);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@greencommunity.com');
    setPassword('admin123');
    
    setIsSubmitting(true);
    setError('');
    setEmailError('');
    setPasswordError('');

    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@greencommunity.com',
          password: 'admin123'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminEmail', 'admin@greencommunity.com');
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        setTimeout(() => {
          router.push('/admin');
        }, 100);
      } else {
        setError('Demo login failed. Please try again.');
        setErrorType('auth');
      }
    } catch (error) {
      setError('Demo login failed. Please try again.');
      setErrorType('network');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissError = () => {
    setShowError(false);
    setTimeout(() => {
      setError('');
      setErrorType('');
    }, 300);
  };

  // Get error styling based on type
  const getErrorStyle = (type) => {
    switch (type) {
      case 'email':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-700',
          close: 'text-blue-400 hover:text-blue-600',
          titleText: 'Wrong Email'
        };
      case 'auth':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          close: 'text-red-400 hover:text-red-600',
          titleText: 'Wrong Password'
        };
      case 'network':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          close: 'text-yellow-400 hover:text-yellow-600',
          titleText: 'Connection Problem'
        };
      case 'server':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-500',
          title: 'text-orange-800',
          message: 'text-orange-700',
          close: 'text-orange-400 hover:text-orange-600',
          titleText: 'Server Issue'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          close: 'text-red-400 hover:text-red-600',
          titleText: 'Login Failed'
        };
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Toast Error Message - Right Side */}
      {error && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out ${
          showError ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        }`}>
          <div className={`${getErrorStyle(errorType).bg} ${getErrorStyle(errorType).border} rounded-lg p-4 shadow-lg max-w-sm`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 ${getErrorStyle(errorType).icon} mt-0.5 flex-shrink-0`} />
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${getErrorStyle(errorType).title} mb-1`}>
                  {getErrorStyle(errorType).titleText}
                </h3>
                <p className={`text-sm ${getErrorStyle(errorType).message}`}>
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={dismissError}
                className={`${getErrorStyle(errorType).close} transition-colors`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="App Logo"
            className="mx-auto h-15 w-80 mb-5"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
            Admin Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="admin@greencommunity.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground transition-colors ${
              emailError ? 'border-red-500 focus:ring-red-500' : 'border-border'
            }`}
          />
          {emailError && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle size={12} />
              <span>{emailError}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
            Admin Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`leaf-cursor w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground transition-colors ${
                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-border'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordError && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle size={12} />
              <span>{passwordError}</span>
            </div>
          )}
          <div className="text-right mt-1">
            <Link href="/admin/forgot-password" className="text-xs text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full flex items-center justify-center py-2 rounded-md font-semibold text-white transition-all ${
            isSubmitting
              ? 'bg-primary/70 cursor-not-allowed'
              : isSuccess
              ? 'bg-primary/90'
              : 'bg-primary hover:bg-primary/90'
          }`}
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center gap-2">
              <span>Success</span>
            </div>
          ) : (
            'Continue'
          )}
        </button>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@greencommunity.com" className="text-primary hover:underline">
            support@greencommunity.com
          </a>
        </p>
      </form>
    </main>
  );
} 