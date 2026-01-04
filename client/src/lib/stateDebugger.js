import React from 'react';

// State debugging utility for development
export const debugState = {
    // Log state changes
    logStateChange: (componentName, stateName, oldValue, newValue) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${componentName}] ${stateName} changed:`, {
                from: oldValue,
                to: newValue,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Check for potential infinite loops
    checkLoopRisk: (componentName, count, limit = 10) => {
        if (process.env.NODE_ENV === 'development' && count > limit) {
            console.warn(`[${componentName}] Potential infinite loop detected - update count: ${count}`);
            return true;
        }
        return false;
    },

    // Debug router state
    logRouterState: (pathname, user, isLoading) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[Router Debug]', {
                pathname,
                hasUser: !!user,
                isLoading,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Clear problematic state
    clearProblematicState: () => {
        if (typeof window !== 'undefined') {
            try {
                // Clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                localStorage.removeItem('oauthIntent');

                // Clear sessionStorage
                sessionStorage.removeItem('dashboardVisited');

                console.log('Cleared potentially problematic state');
            } catch (error) {
                console.error('Error clearing state:', error);
            }
        }
    }
};

// React hook for debugging component renders
export const useRenderDebugger = (componentName, props) => {
    const renderCount = React.useRef(0);
    const prevProps = React.useRef();

    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            renderCount.current += 1;

            if (renderCount.current > 10) {
                console.warn(`[${componentName}] High render count: ${renderCount.current}`);
            }

            if (prevProps.current) {
                const changedProps = Object.keys(props).filter(
                    key => props[key] !== prevProps.current[key]
                );

                if (changedProps.length > 0) {
                    console.log(`[${componentName}] Props changed:`, changedProps);
                }
            }

            prevProps.current = props;
        }
    });
};
