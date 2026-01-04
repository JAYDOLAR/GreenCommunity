// Optimized navigation hook that prevents router dependency issues
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export const useOptimizedNavigation = () => {
    const router = useRouter();
    const redirectingRef = useRef(false);

    // Stable navigation function that doesn't change on every render
    const navigate = useCallback((path, options = {}) => {
        if (redirectingRef.current) {
            return; // Prevent multiple simultaneous redirects
        }

        redirectingRef.current = true;

        const { replace = false, delay = 0 } = options;

        const performNavigation = () => {
            try {
                if (replace) {
                    router.replace(path);
                } else {
                    router.push(path);
                }
            } catch (error) {
                console.error('Navigation error:', error);
            } finally {
                // Reset the flag after a short delay
                setTimeout(() => {
                    redirectingRef.current = false;
                }, 100);
            }
        };

        if (delay > 0) {
            setTimeout(performNavigation, delay);
        } else {
            performNavigation();
        }
    }, [router]);

    // Check if currently redirecting
    const isRedirecting = () => redirectingRef.current;

    return { navigate, isRedirecting };
};

// Hook for handling protected routes
export const useProtectedRoute = () => {
    const { navigate } = useOptimizedNavigation();

    const redirectToLogin = useCallback((intent = 'login') => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('loginIntent', intent);
        }
        navigate('/login', { replace: true, delay: 100 });
    }, [navigate]);

    const redirectToDashboard = useCallback(() => {
        navigate('/dashboard', { replace: true, delay: 100 });
    }, [navigate]);

    return { redirectToLogin, redirectToDashboard };
};

// Hook for OAuth redirects
export const useOAuthRedirect = () => {
    const { navigate } = useOptimizedNavigation();

    const handleOAuthSuccess = useCallback((intent = 'login') => {
        const redirectPath = intent === 'signup' ? '/CarbonCalculator' : '/dashboard';
        navigate(redirectPath, { replace: true, delay: 100 });
    }, [navigate]);

    return { handleOAuthSuccess };
};
