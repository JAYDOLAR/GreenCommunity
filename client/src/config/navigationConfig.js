// Navigation Configuration
// This file contains all navigation items and menu configurations
// TODO: Make this configurable via admin panel or API

import { LayoutDashboard, FileText, ShoppingCart, TreePine, Users, Settings } from 'lucide-react';

export const SIDEBAR_ITEMS = [
    { name: 'navigation:dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'navigation:footprint_log', path: '/footprintlog', icon: FileText },
    { name: 'navigation:marketplace', path: '/marketplace', icon: ShoppingCart },
    { name: 'navigation:projects', path: '/projects', icon: TreePine },
    { name: 'navigation:community', path: '/community', icon: Users },
    { name: 'navigation:settings', path: '/settings', icon: Settings },
];

// Simple sidebar items for basic components
export const SIMPLE_SIDEBAR_ITEMS = [
    { name: "navigation:dashboard", path: "/" },
    { name: "navigation:footprint_log", path: "/footprint" },
    { name: "navigation:marketplace", path: "/marketplace" },
    { name: "navigation:projects", path: "/projects" },
    { name: "navigation:community", path: "/community" },
    { name: "navigation:settings", path: "/settings" },
];

// Admin navigation items
export const ADMIN_NAVIGATION_ITEMS = [
    // This will be populated when admin panel is properly configured
    // TODO: Move admin navigation configuration here
];

// Helper function to get navigation items based on user role
export const getNavigationItems = (userRole = 'user') => {
    switch (userRole) {
        case 'admin':
            return [...SIDEBAR_ITEMS, ...ADMIN_NAVIGATION_ITEMS];
        default:
            return SIDEBAR_ITEMS;
    }
};

// Routes that should not have layout
export const NO_LAYOUT_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/landing'
];

// Routes that require authentication
export const AUTH_GUARD_ROUTES = [
    '/dashboard',
    '/footprintlog',
    '/marketplace',
    '/projects',
    '/community',
    '/settings',
    '/admin'
];
