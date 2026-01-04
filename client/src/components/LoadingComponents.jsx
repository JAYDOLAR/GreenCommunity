'use client';

import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', color = 'green' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };

    const colors = {
        green: 'border-green-600',
        blue: 'border-blue-600',
        gray: 'border-gray-600'
    };

    return (
        <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
    );
};

export const PageLoader = ({ message = 'Loading...', showLogo = false }) => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-green-50 via-white to-white relative overflow-hidden flex items-center justify-center">
            <motion.div
                className="flex flex-col items-center gap-4 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {showLogo && (
                    <img
                        src="/logo.png"
                        alt="GreenCommunity Logo"
                        className="h-12 w-auto mb-2"
                    />
                )}
                <LoadingSpinner size="lg" />
                <span className="text-lg font-medium text-green-700">
                    {message}
                </span>
            </motion.div>
        </div>
    );
};

export const ComponentLoader = ({ message = 'Loading...', className = '' }) => {
    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner />
                <span className="text-sm text-muted-foreground">{message}</span>
            </div>
        </div>
    );
};

export const RedirectLoader = ({ message = 'Redirecting...', destination = '' }) => {
    return (
        <PageLoader
            message={`${message}${destination ? ` to ${destination}` : ''}`}
            showLogo={true}
        />
    );
};
