
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { FullScreenLoader } from '@/components/FullScreenLoader';
import { useProtectedRoute } from '@/lib/useOptimizedNavigation';

const ProtectedLayout = ({ children }) => {
  const { user, isLoading } = useUser();
  const { redirectToLogin } = useProtectedRoute();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isLoading && !user && !shouldRedirect) {
      setShouldRedirect(true);
      redirectToLogin('protected');
    }
  }, [user, isLoading, shouldRedirect, redirectToLogin]);

  // If data is still loading or redirecting, show a full-screen loader
  if (isLoading || shouldRedirect) {
    return <FullScreenLoader />;
  }

  // If user is authenticated, render the children
  return user ? <>{children}</> : null;
};

export default ProtectedLayout;

