"use client";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Layout from "@/components/Layout";
import { PageLoader } from "@/components/LoadingComponents";
import { NO_LAYOUT_ROUTES, AUTH_GUARD_ROUTES } from "@/config/navigationConfig";

export default function AuthLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  // Routes that should NOT have the main layout (auth pages, landing, and admin pages)
  const noLayoutRoutes = [
    ...NO_LAYOUT_ROUTES,
    "/Signup",
    "/update-password",
    "/CarbonCalculator",
    "/verify-email"
  ];

  // Routes that use AuthGuard (now properly wrapped with Layout in each page)
  const authGuardRoutes = [
    ...AUTH_GUARD_ROUTES,
    "/payment",
    "/user-details"
  ];

  // Check if current path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');

  // Check if current path uses AuthGuard (which now includes Layout in each page)
  const isAuthGuardRoute = authGuardRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Routes that don't need the main layout wrapper
  const shouldSkipLayout = noLayoutRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  ) || isAdminRoute || isAuthGuardRoute; // AuthGuard pages handle their own Layout

  // Additional specific checks for common variations
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');
  const isSignupPage = pathname === '/Signup' || pathname === '/signup' || pathname.startsWith('/Signup') || pathname.startsWith('/signup');

  // Force skip layout for login and signup pages
  if (isLoginPage || isSignupPage) {
    return <>{children}</>;
  }

  // Auth pages, landing page, and admin routes don't need main layout
  if (shouldSkipLayout) {
    return <>{children}</>;
  }

  // For main page ("/"), only apply layout if user is authenticated
  // This prevents double navbar when showing landing page
  if (pathname === "/") {
    // While loading, show a consistent loading state
    if (isLoading) {
      return <PageLoader message="Loading..." />;
    }
    // If no user, show landing page without layout
    if (!user) {
      return <>{children}</>;
    }
    // If user exists and we're still on "/", they're likely being redirected
    // Don't apply layout to avoid flashing
    return <>{children}</>;
  }

  // All other routes should have layout ONLY if user is authenticated
  // This prevents navbar from showing during authentication loading
  if (isLoading) {
    // For protected routes during loading, don't show layout
    return <>{children}</>;
  }

  if (!user) {
    // For unauthenticated users on protected routes, don't show layout
    // The AuthGuard component will handle the redirect
    return <>{children}</>;
  }

  // Only show layout for authenticated users
  return <Layout>{children}</Layout>;
}
