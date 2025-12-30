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
  
  // Auth pages, landing page, and admin routes don't need main layout
  if (noLayoutRoutes.includes(pathname) || isAdminRoute) {
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
