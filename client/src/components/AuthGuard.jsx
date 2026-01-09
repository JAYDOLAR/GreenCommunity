'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useProtectedRoute } from '@/lib/useOptimizedNavigation';
import { RedirectLoader, PageLoader } from '@/components/LoadingComponents';
import BlockedAccount from '@/components/BlockedAccount';

const AuthGuard = ({ children, redirectTo = '/login', intent = 'protected' }) => {
    const { user, isLoading, isLocked } = useUser();
    const { redirectToLogin } = useProtectedRoute();
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        // Only proceed with auth check after loading is complete
        if (!isLoading && !hasCheckedAuth) {
            setHasCheckedAuth(true);

            // If no user, initiate redirect
            if (!user) {
                setShouldRedirect(true);
                // Store the intended destination
                if (typeof window !== 'undefined') {
                    localStorage.setItem('loginIntent', intent);
                    localStorage.setItem('intendedDestination', window.location.pathname);
                }
                redirectToLogin(intent);
            }
        }
    }, [user, isLoading, hasCheckedAuth, redirectToLogin, intent]);

    // Show loading while checking authentication
    if (isLoading || !hasCheckedAuth) {
        return <PageLoader message="Verifying authentication..." showLogo={true} />;
    }

    // Show blocked screen if account is locked
    if (isLocked) {
        return <BlockedAccount />;
    }

    // Show redirect loader if redirecting
    if (shouldRedirect || (!user && hasCheckedAuth)) {
        return <RedirectLoader message="Access denied. Redirecting" destination="login" />;
    }

    // Only render children if user is authenticated
    return user ? <>{children}</> : null;
};

export default AuthGuard;
