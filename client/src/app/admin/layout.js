'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Checking admin authentication...');
        const adminAuthenticated = typeof window !== 'undefined' ? localStorage.getItem('adminAuthenticated') : null;
        console.log('Admin authenticated:', adminAuthenticated);
        // Normalize pathname to avoid trailing slash issues
        const normalizedPath = (pathname || '').replace(/\/+$/, '');

        if (adminAuthenticated === 'true') {
          setIsAuthenticated(true);
        } else if (normalizedPath !== '/admin/login') {
          console.log('Not authenticated, redirecting to login...');
          router.replace('/admin/login');
          // Fallback in case router doesn't work
          setTimeout(() => {
            if (typeof window !== 'undefined' && (window.location.pathname || '').replace(/\/+$/, '') !== '/admin/login') {
              window.location.href = '/admin/login';
            }
          }, 300);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('An error occurred while checking authentication');
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If on login page, don't show sidebar (handle trailing slash)
  if ((pathname || '').replace(/\/+$/, '') === '/admin/login') {
    return <>{children}</>;
  }

  // If not authenticated, show a small fallback with manual link
  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Redirecting to admin login…</p>
          <a href="/admin/login" className="text-green-600 underline">Go to Admin Login</a>
        </div>
      </div>
    );
  }

  // Show admin layout with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <main className="w-full min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 