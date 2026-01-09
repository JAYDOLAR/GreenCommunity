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
      title: 'New User Registration',
              message: 'Demo User has registered as a new user',
      time: '2 minutes ago',
      type: 'user',
      read: false
    },
    {
      id: 2,
      title: 'Project Approval Required',
      message: 'Wind Farm Development project needs your review',
      time: '15 minutes ago',
      type: 'project',
      read: false
    },
    {
      id: 3,
      title: 'Payment Received',
      message: '₹5,000 received from Sarah Wilson',
      time: '1 hour ago',
      type: 'payment',
      read: false
    },
    {
      id: 4,
      title: 'System Update',
      message: 'Platform maintenance completed successfully',
      time: '2 hours ago',
      type: 'system',
      read: true
    }
  ]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const navigation = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      badge: null
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      badge: '12'
    },
    {
      title: 'Projects',
      href: '/admin/projects',
      icon: TreePine,
      badge: '5'
    },
    {
      title: 'Marketplace',
      href: '/admin/marketplace',
      icon: ShoppingCart,
      badge: null
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      badge: '3'
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      badge: null
    },
    {
      title: 'Security',
      href: '/admin/security',
      icon: Shield,
      badge: null
    }
  ];

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    
    // Redirect to admin login
    router.push('/admin/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'project':
        return <TreePine className="h-4 w-4 text-emerald-600" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'system':
        return <SettingsIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'project':
        return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
      case 'payment':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'system':
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="bg-card border-r border-border min-h-screen w-64 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="GreenCommunity Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
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
                       <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                         {unreadCount} new
                       </Badge>
                     )}
                   </div>
                   {unreadCount > 0 && (
                     <button
                       onClick={markAllAsRead}
                       className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                     >
                       Mark all as read
                     </button>
                   )}
                 </div>
               </div>
               
               <div className="p-3 bg-white">
                 {notifications.length === 0 ? (
                   <div className="text-center py-8 text-gray-500">
                     <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                     <p className="text-sm">No notifications</p>
                     <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
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
                                 <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                   {notification.time}
                                 </p>
                               </div>
                               {!notification.read && (
                                 <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
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
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
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
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-muted-foreground">admin@greencommunity.com</div>
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