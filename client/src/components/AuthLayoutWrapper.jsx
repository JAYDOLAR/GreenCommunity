"use client";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Layout from "@/components/Layout";

export default function AuthLayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  
  // Routes that should NOT have the main layout (auth pages, landing, and admin pages)
  const noLayoutRoutes = [
    "/login",
    "/signup", 
    "/Signup",
    "/forgot-password",
    "/update-password",
    "/landing",
    "/CarbonCalculator",
    "/verify-email"
  ];
  
  // Check if current path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  // More robust path matching - check if pathname starts with any of the no-layout routes
  const shouldSkipLayout = noLayoutRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  ) || isAdminRoute;
  
  // Additional specific checks for common variations
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');
  const isSignupPage = pathname === '/Signup' || pathname === '/signup' || pathname.startsWith('/Signup') || pathname.startsWith('/signup');
  
  // Debug logging (remove this after fixing)
  console.log('Current pathname:', pathname);
  console.log('Is login page:', isLoginPage);
  console.log('Is signup page:', isSignupPage);
  console.log('Should skip layout:', shouldSkipLayout);
  console.log('No layout routes:', noLayoutRoutes);
  
  // Force skip layout for login and signup pages
  if (isLoginPage || isSignupPage) {
    console.log('Forcing skip layout for auth page:', pathname);
    return <>{children}</>;
  }
  
  // Auth pages, landing page, and admin routes don't need main layout
  if (shouldSkipLayout) {
    console.log('Skipping layout for:', pathname);
    return <>{children}</>;
  }
  
  // For main page ("/"), only apply layout if user is authenticated
  // This prevents double navbar when showing landing page
  if (pathname === "/") {
    // While loading, don't apply layout (children will handle loading state)
    if (isLoading) {
      return <>{children}</>;
    }
    // If no user, show landing page without layout
    if (!user) {
      return <>{children}</>;
    }
    // If user exists, they should be redirected to dashboard
    // But in case they're still on "/", apply layout
    return <Layout>{children}</Layout>;
  }
  
  // All other routes should have layout
  return <Layout>{children}</Layout>;
}
