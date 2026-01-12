'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Bell } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false); // must be before any conditional return
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);
  const notifPanelRef = useRef(null);
  const [notifications, setNotifications] = useState(() => {
    const fallback = [
      { id: 1, type: 'user', title: 'New User Registration', message: 'John Doe has joined the platform', time: '2 minutes ago', read: false },
      { id: 2, type: 'project', title: 'Project Milestone', message: 'Urban Garden Project reached 50% completion', time: '1 hour ago', read: false },
      { id: 3, type: 'order', title: 'New Marketplace Order', message: 'Order #12345 for Eco-friendly Water Bottle', time: '3 hours ago', read: true },
    ];
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem('admin_notifications');
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  });
  const [notificationsHydrated, setNotificationsHydrated] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('admin_notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
    } catch {}
    setNotificationsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e) => {
      if (bellRef.current && bellRef.current.contains(e.target)) return;
      if (notifPanelRef.current && notifPanelRef.current.contains(e.target)) return;
      setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

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

      {/* Mobile top bar (fixed for persistent visibility during scroll) */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-semibold text-gray-800 text-sm">Admin Panel</h1>
        <div className="ml-auto flex items-center">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationsHydrated && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">{unreadCount}</span>
            )}
          </button>
        </div>
        {showNotifications && (
          <div
            ref={notifPanelRef}
            className="absolute right-3 top-12 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden"
          >
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {notificationsHydrated && unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{unreadCount} new</span>
                )}
              </div>
              {notificationsHydrated && unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-green-600 hover:text-green-700 font-medium">Mark all</button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-600 text-sm">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 border-b last:border-b-0 cursor-pointer ${n.read ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="text-sm font-medium text-gray-900">{n.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                    <div className="text-[11px] text-gray-500 mt-1">{n.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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
        <main className="min-h-screen w-full px-4 md:px-8 pb-16 pt-16 lg:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 