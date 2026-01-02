'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const adminAuthenticated = typeof window !== 'undefined' ? localStorage.getItem('adminAuthenticated') : null;
      if (adminAuthenticated === 'true') {
        setIsAuthenticated(true);
      } else if (pathname !== '/admin/login') {
        // Use replace to avoid back button loop; also provide a delayed fallback
        router.replace('/admin/login');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        }, 300);
      }
    } finally {
      setIsLoading(false);
    }
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

  // If on login page, don't show sidebar
  if (pathname === '/admin/login') {
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
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 