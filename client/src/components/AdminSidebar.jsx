'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  X
} from 'lucide-react';

const AdminSidebar = () => {
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'user',
      title: 'New User Registration',
      message: 'John Doe has joined the platform',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'project',
      title: 'Project Milestone',
      message: 'Urban Garden Project reached 50% completion',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'order',
      title: 'New Marketplace Order',
      message: 'Order #12345 for Eco-friendly Water Bottle',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'Platform maintenance completed successfully',
      time: '1 day ago',
      read: true
    }
  ]);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Users', href: '/admin/users', icon: Users, badge: '156' },
    { title: 'Projects', href: '/admin/projects', icon: TreePine, badge: '24' },
    { title: 'Marketplace', href: '/admin/marketplace', icon: ShoppingCart, badge: '89' },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Reports', href: '/admin/reports', icon: FileText },
    { title: 'Security', href: '/admin/security', icon: Shield },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "h-4 w-4";
    switch (type) {
      case 'user':
        return <Users className={`${iconClasses} text-blue-500`} />;
      case 'project':
        return <TreePine className={`${iconClasses} text-green-500`} />;
      case 'order':
        return <ShoppingCart className={`${iconClasses} text-purple-500`} />;
      case 'system':
        return <SettingsIcon className={`${iconClasses} text-gray-500`} />;
      default:
        return <Bell className={`${iconClasses} text-gray-400`} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 border-blue-200';
      case 'project':
        return 'bg-green-50 border-green-200';
      case 'order':
        return 'bg-purple-50 border-purple-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    router.push('/login');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <TreePine className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">Green Admin</h2>
              <p className="text-xs text-gray-600">Control Panel</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <div className="relative notifications-dropdown">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto transform transition-all duration-200 ease-out">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
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
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-white">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No notifications</p>
                      <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 notification-item ${
                            notification.read 
                              ? 'bg-white border-gray-200 hover:bg-gray-50' 
                              : getNotificationColor(notification.type) + ' hover:shadow-sm'
                          } ${!notification.read ? 'notification-unread' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className={`text-sm font-semibold ${
                                    notification.read ? 'text-gray-600' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className={`text-sm mt-1 line-clamp-2 ${
                                    notification.read ? 'text-gray-500' : 'text-gray-700'
                                  }`}>
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
                  <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = mounted && (
            pathname === item.href || 
            (item.href === '/admin/projects' && pathname.startsWith('/admin/projects')) ||
            (item.href === '/admin/marketplace' && pathname.startsWith('/admin/marketplace'))
          );
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer
                ${isActive 
                  ? 'bg-green-500 text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}>
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
              <div className="text-sm font-medium text-gray-900">Admin User</div>
              <div className="text-xs text-gray-600">admin@greencommunity.com</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/settings')}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;