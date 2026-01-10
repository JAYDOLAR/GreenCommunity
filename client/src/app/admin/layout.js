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
  const [mobileOpen, setMobileOpen] = useState(false); // must be before any conditional return

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

    // Add class to body to prevent horizontal scroll on admin pages
    if (typeof document !== 'undefined') {
      document.body.classList.add('overflow-x-hidden');
    }

    return () => {
      clearTimeout(timer);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('overflow-x-hidden');
      }
    };
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

  // (mobileOpen state moved above to keep hook order consistent)

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-x-hidden" style={{maxWidth:'100vw'}}>
      {/* Sidebar */}
      <AdminSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md bg-green-500 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-semibold text-gray-800 text-sm">Admin Panel</h1>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="min-h-screen w-full px-4 md:px-8 pb-16 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 