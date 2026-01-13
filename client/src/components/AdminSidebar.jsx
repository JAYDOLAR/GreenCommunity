"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  TreePine,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Shield,
  LogOut,
  Bell,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Settings as SettingsIcon,
  X,
} from "lucide-react";

const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [isDesktop, setIsDesktop] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalMarketplace: 0
  });

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    fetchStats();
  }, []);

  // Fetch dashboard stats for sidebar badges
  const fetchStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setStats({
            totalUsers: data.stats.totalUsers || 0,
            totalProjects: data.stats.totalProjects || 0,
            totalMarketplace: data.stats.activeProjects || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${serverUrl}/api/admin/notifications?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            time: n.time,
            read: n.isRead
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Track desktop vs mobile for responsive behavior
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)"); // lg breakpoint
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Position notifications dropdown just to the right of the sidebar
  useEffect(() => {
    if (!showNotifications || !isDesktop) return;
    const updatePosition = () => {
      if (bellRef.current) {
        const rect = bellRef.current.getBoundingClientRect();
        const left = rect.right + 12;
        const top = rect.top + rect.height + 8;
        setDropdownPos({ top, left });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showNotifications, isDesktop]);

  // No localStorage persistence; backend is source of truth

  // Close on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e) => {
      if (!bellRef.current) return;
      if (bellRef.current.contains(e.target)) return;
      if (e.target.closest('[data-role="notifications-panel"]')) return;
      setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  const navigation = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Users", href: "/admin/users", icon: Users, badge: stats.totalUsers > 0 ? String(stats.totalUsers) : null },
    { title: "Projects", href: "/admin/projects", icon: TreePine, badge: stats.totalProjects > 0 ? String(stats.totalProjects) : null },
    {
      title: "Marketplace",
      href: "/admin/marketplace",
      icon: ShoppingCart,
      badge: stats.totalMarketplace > 0 ? String(stats.totalMarketplace) : null,
    },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { title: "Reports", href: "/admin/reports", icon: FileText },
    { title: "Security", href: "/admin/security", icon: Shield },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "h-4 w-4";
    switch (type) {
      case "user":
        return <Users className={`${iconClasses} text-blue-500`} />;
      case "project":
        return <TreePine className={`${iconClasses} text-green-500`} />;
      case "order":
        return <ShoppingCart className={`${iconClasses} text-purple-500`} />;
      case "system":
        return <SettingsIcon className={`${iconClasses} text-gray-500`} />;
      default:
        return <Bell className={`${iconClasses} text-gray-400`} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "user":
        return "bg-blue-50 border-blue-200";
      case "project":
        return "bg-green-50 border-green-200";
      case "order":
        return "bg-purple-50 border-purple-200";
      case "system":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const handleLogout = async () => {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');
      
      // Call server logout endpoint to clear cookies
      await fetch(`${serverUrl}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all admin-related localStorage items
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminUser');
      
      // Redirect to admin login page
      router.push("/admin/login");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-full z-40 transform transition-transform duration-200 ease-in-out
      ${isDesktop ? "" : isOpen ? "translate-x-0" : "-translate-x-full"}`}
      aria-hidden={!isDesktop && !isOpen}
      aria-label="Admin sidebar"
    >
      {/* Header without notification button */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <TreePine className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <h2 className="font-bold text-lg text-gray-900">Green Admin</h2>
              <p className="text-[11px] text-gray-600">Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isDesktop && (
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Desktop floating notifications panel */}
      {showNotifications && isDesktop && (
        <div
          data-role="notifications-panel"
          className="fixed w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-[70vh] overflow-hidden animate-in fade-in slide-in-from-top-2"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Mark all
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-3 overflow-y-auto custom-scrollbar max-h-[50vh]">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 notification-item ${
                      notification.read
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : getNotificationColor(notification.type) +
                          " hover:shadow-sm"
                    } ${!notification.read ? "notification-unread" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold ${
                                notification.read
                                  ? "text-gray-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p
                              className={`text-sm mt-1 line-clamp-2 ${
                                notification.read
                                  ? "text-gray-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-right text-xs text-gray-500">
              {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Mobile inline notifications */}
      {showNotifications && !isDesktop && (
        <div
          className="mt-2 mx-4 mb-4 border border-gray-200 rounded-lg bg-white overflow-hidden lg:hidden"
          data-role="notifications-panel"
        >
          <div className="p-3 flex items-center justify-between border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Mark all
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 notification-item ${
                      notification.read
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : getNotificationColor(notification.type) +
                          " hover:shadow-sm"
                    } ${!notification.read ? "notification-unread" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold ${
                                notification.read
                                  ? "text-gray-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p
                              className={`text-sm mt-1 line-clamp-2 ${
                                notification.read
                                  ? "text-gray-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            mounted &&
            (pathname === item.href ||
              (item.href === "/admin/projects" &&
                pathname.startsWith("/admin/projects")) ||
              (item.href === "/admin/marketplace" &&
                pathname.startsWith("/admin/marketplace")));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer
                ${
                  isActive
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }
              `}
                onClick={() => { if (!isDesktop) onClose(); }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Action Buttons */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Admin User
              </div>
              <div className="text-xs text-gray-600">
                admin@greencommunity.com
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { router.push("/admin/settings"); if (!isDesktop) onClose(); }}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              size="sm"
              onClick={() => { handleLogout(); if (!isDesktop) onClose(); }}
              className="flex-1 text-white bg-red-600 hover:bg-red-700 font-medium shadow-sm focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            >
              <LogOut className="h-4 w-4 mr-2 text-white" />
              <span className="tracking-wide">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
