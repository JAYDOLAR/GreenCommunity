// Navigation Configuration
// This file contains all navigation items and menu configurations
// TODO: Make this configurable via admin panel or API

import { LayoutDashboard, FileText, ShoppingCart, TreePine, Users, Settings } from 'lucide-react';

export const SIDEBAR_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Footprint Log', path: '/footprintlog', icon: FileText },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingCart },
    { name: 'Projects', path: '/projects', icon: TreePine },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
];

// Simple sidebar items for basic components
export const SIMPLE_SIDEBAR_ITEMS = [
    { name: "Dashboard", path: "/" },
    { name: "Footprint Log", path: "/footprint" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Projects", path: "/projects" },
    { name: "Community", path: "/community" },
    { name: "Settings", path: "/settings" },
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
