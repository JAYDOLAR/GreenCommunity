'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FloatingParticles from './FloatingParticles';
import ProfessionalProgress from './ProfessionalProgress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Leaf, Menu, X, User, TrendingUp, LogOut, LayoutDashboard, FileText, ShoppingCart, TreePine, Users, Settings, Bell } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useMediaQuery } from 'react-responsive';
import { useOptimizedNavigation } from '@/lib/useOptimizedNavigation';
import { SIDEBAR_ITEMS } from '@/config/navigationConfig';
import { useTranslation } from '@/context/PreferencesContext';

const sidebarItems = SIDEBAR_ITEMS;

export default function Layout({ children }) {
  const { t } = useTranslation(['navigation', 'common']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user, clearUser } = useUser();
  const router = useRouter();
  const { navigate } = useOptimizedNavigation();
  const isAuthenticated = !!user;
  const name = user?.name || 'Guest';
  const city = (user?.userInfo?.location?.city || '').trim();
  const country = (user?.userInfo?.location?.country || '').trim();
  const locationText = [city, country].filter(Boolean).join(', ');
  const hasLocation = Boolean(locationText);
  const [fallbackLocation, setFallbackLocation] = useState('');
  const monthlyGoal = isAuthenticated ? 75 : 0;
  const pathname = usePathname();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });

  // Sample notification data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Challenge Available",
      message: "Join the 'Green Week' challenge and reduce your carbon footprint!",
      time: "2 minutes ago",
      unread: true
    },
    {
      id: 2,
      title: "Goal Achievement",
      message: "Congratulations! You've reached 75% of your monthly goal.",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      title: "Community Update",
      message: "Your community has saved 500kg of CO2 this week!",
      time: "3 hours ago",
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, unread: false })));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('selectedLocation');
      if (saved) {
        const parsed = JSON.parse(saved);
        const stateName = (parsed?.stateName || '').trim();
        const countryName = (parsed?.countryName || '').trim();
        const composed = [stateName, countryName].filter(Boolean).join(', ');
        if (composed) setFallbackLocation(composed);
      }
    } catch { }
  }, []);

  // Lock body scroll when sidebar is open (mobile/tablet)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [sidebarOpen]);

  // Don't render the layout if logging out to prevent flash
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Logging out...</span>
        </div>
      </div>
    );
  }

  // Logo click handler
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Navigation click handler
  const handleNavigationClick = (path) => {
    // Emit custom event to close any open dialogs
    window.dispatchEvent(new CustomEvent('navigation-starting', { detail: { path } }));
    
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login');
    }
    // Close mobile sidebar after navigation
    setSidebarOpen(false);
  };

  // Logout functionality
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call server logout endpoint to clear cookies
      await authAPI.logout();

      // Clear user data and localStorage token
      clearUser();

      // Navigate to home page
      navigate('/', { replace: true, delay: 100 });

      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);

      // Even if server logout fails, clear local data
      clearUser();
      router.replace('/login');
    }
    // Don't reset isLoggingOut here to prevent flash
  };

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingParticles />
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b border-border/30 shadow-sm ${sidebarOpen ? 'bg-background isolate' : 'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16 md:h-20 relative">
          {/* Logo and Navigation */}
          {isMobile || isTablet ? (
            <>
              {/* Hamburger menu for sidebar */}
              <Button variant="ghost" size="icon" className="p-2 sm:p-3 z-10" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-8 w-8 sm:h-10 sm:w-10" />
              </Button>
              {/* Centered logo with reduced width to prevent overlap */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img
                  src="/logo.png"
                  alt="GreenCommunity Logo"
                  className="h-12 w-auto sm:h-14 sm:w-auto max-w-[140px] sm:max-w-[160px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleLogoClick}
                />
              </div>
              {/* User Avatar for mobile/tablet - positioned on right with proper spacing */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Notification Icon */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative p-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end" side="bottom" sideOffset={8}>
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t">
                      <Button variant="ghost" className="w-full text-xs" onClick={markAllAsRead}>Mark all as read</Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="focus:outline-none">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-3 border-primary/30 hover:border-primary/60 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        <AvatarImage src={user?.userInfo?.avatar?.url || null} alt={name} />
                        <AvatarFallback className="bg-gradient-primary text-black font-bold text-xs sm:text-sm">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 sm:w-60 p-4 flex flex-col gap-3" align="end">
                    <div className="flex items-center justify-center">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/30">
                        <AvatarImage src={user?.userInfo?.avatar?.url || null} alt={name} />
                        <AvatarFallback className="bg-gradient-primary text-black font-bold text-xs sm:text-sm">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <Link href="/settings">
                        <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">Settings</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                            Log out
                          </>
                        )}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={handleLogoClick}>
              <img
                src="/logo.png"
                alt="GreenCommunity Logo"
                className="h-14 w-auto md:h-18 lg:h-16 max-w-[200px] md:max-w-[300px] lg:max-w-[240px] object-contain hover:opacity-80 transition-opacity"
              />
            </div>
          )}
          {/* Navigation Buttons (desktop only) */}
          {!isMobile && !isTablet && (
            <nav className="hidden lg:flex gap-0.5 md:gap-1 lg:gap-2 flex-1 justify-center">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigationClick(item.path)}
                    className={`px-1.5 md:px-2 lg:px-2 py-1.5 md:py-2 lg:py-2 rounded-full font-medium transition-colors duration-200 text-xs md:text-sm lg:text-sm whitespace-nowrap flex items-center gap-1.5 md:gap-2
                       ${(item.path === '/' && (pathname === '/' || pathname.startsWith('/dashboard'))) || (item.path !== '/' && (pathname === item.path || pathname.startsWith(item.path + '/')))
                        ? 'bg-primary/90 text-white shadow-sm'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'}
                     `}
                    style={{ fontWeight: 500, letterSpacing: '0.01em' }}
                  >
                    <Icon className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                    {t(item.name)}
                  </button>
                );
              })}
            </nav>
          )}
          {/* User Info and Profile (desktop only) */}
          {!isMobile && !isTablet && (
            <div className="flex items-center gap-1 md:gap-2 lg:gap-2">
              {/* Notification Icon */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative p-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end" side="bottom" sideOffset={8}>
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t">
                    <Button variant="ghost" className="w-full text-xs" onClick={markAllAsRead}>Mark all as read</Button>
                  </div>
                </PopoverContent>
              </Popover>
              {/* User Profile Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 lg:h-9 lg:w-9 border-3 border-primary/30 hover:border-primary/60 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      <AvatarImage src={user?.userInfo?.avatar?.url || null} alt={name} />
                      <AvatarFallback className="bg-gradient-primary text-black font-bold text-xs md:text-sm lg:text-sm">
                        <User className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 md:w-60 lg:w-64 p-4 flex flex-col gap-3" align="end">
                  <div className="flex items-center justify-center">
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 border-2 border-primary/30">
                      <AvatarImage src={user?.userInfo?.avatar?.url || null} alt={name} />
                      <AvatarFallback className="bg-gradient-primary text-black font-bold text-xs md:text-sm lg:text-sm">
                        <User className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Link href="/settings">
                      <Button variant="outline" className="w-full text-xs md:text-sm lg:text-sm h-8 md:h-9 lg:h-10">Settings</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="w-full flex items-center gap-2 text-xs md:text-sm lg:text-sm h-8 md:h-9 lg:h-10 bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4" />
                          Log out
                        </>
                      )}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          {/* Sidebar for mobile and tablet */}
          {(isMobile || isTablet) && (
            <>
              {/* Sidebar Drawer */}
              <div>
                {sidebarOpen && (
                  <div className="fixed inset-0 z-[9998] bg-black/40" onClick={() => setSidebarOpen(false)}></div>
                )}
                <div className={`fixed top-0 left-0 z-[9999] h-full w-64 md:w-80 bg-[#ffffff] opacity-100 bg-opacity-100 backdrop-blur-0 mix-blend-normal border-r border-border shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 flex flex-col isolate`}>
                  <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                    <img
                      src="/logo.png"
                      alt="GreenCommunity Logo"
                      className="h-10 w-auto sm:h-12 sm:w-auto max-w-[140px] sm:max-w-[160px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        handleLogoClick();
                        setSidebarOpen(false);
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                      <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </div>
                  <nav className="flex-1 flex flex-col gap-2 md:gap-3 p-4 md:p-6 bg-white">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            handleNavigationClick(item.path);
                            setSidebarOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full font-medium transition-colors duration-200 text-sm md:text-base text-left ${(item.path === '/' && (pathname === '/' || pathname.startsWith('/dashboard'))) || (item.path !== '/' && (pathname === item.path || pathname.startsWith(item.path + '/'))) ? 'bg-primary/90 text-white shadow-sm' : 'text-foreground hover:bg-primary/10 hover:text-primary'}`}
                          style={{ fontWeight: 500, letterSpacing: '0.01em' }}
                        >
                          <Icon className="h-4 w-4 md:h-5 md:w-5" />
                          {t(item.name)}
                        </button>
                      );
                    })}
                  </nav>
                  <div className="mt-auto p-4 md:p-6 border-t border-border">
                    <Button
                      variant="destructive"
                      className="w-full flex items-center gap-2 text-sm md:text-base bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                          Log out
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 min-h-screen relative z-10 pt-16 md:pt-20">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}