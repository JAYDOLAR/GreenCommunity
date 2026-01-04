// UI Configuration
// This file contains UI-related constants and configurations
import { Leaf, TreePine, Recycle, Globe, Leaf as Leaf2, Heart } from 'lucide-react';

// Floating particles configuration
export const FLOATING_PARTICLES_CONFIG = {
    icons: [
        () => <Leaf className="h-6 w-6 text-green-500" />,
        () => <TreePine className="h-6 w-6 text-green-600" />,
        () => <Recycle className="h-6 w-6 text-blue-500" />,
        () => <Globe className="h-6 w-6 text-blue-600" />,
        () => <Leaf2 className="h-6 w-6 text-green-400" />,
        () => <Heart className="h-6 w-6 text-green-500" />
    ],
    count: 3,
    positionRange: {
        left: { min: 15, max: 70 },
        top: { min: 20, max: 60 }
    },
    animationDelayRange: { min: 0, max: 12 }
};

// Particle colors for animated backgrounds
export const DEFAULT_PARTICLE_COLORS = ["#ffffff", "#ffffff", "#ffffff"];

// Theme configuration
export const THEME_CONFIG = {
    colors: {
        primary: '#22c55e',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        background: '#ffffff',
        foreground: '#000000'
    }
};

// Animation durations
export const ANIMATION_DURATIONS = {
    fadeIn: '0.5s',
    slideUp: '0.6s',
    bounce: '1s'
};

// Responsive breakpoints
export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
};

// Helper function to generate floating particles
export const generateFloatingParticles = (config = FLOATING_PARTICLES_CONFIG) => {
    const particles = [];
    for (let i = 0; i < config.count; i++) {
        particles.push({
            id: i,
            left: config.positionRange.left.min + Math.random() * (config.positionRange.left.max - config.positionRange.left.min),
            top: config.positionRange.top.min + Math.random() * (config.positionRange.top.max - config.positionRange.top.min),
            animationDelay: Math.random() * config.animationDelayRange.max,
            icon: config.icons[Math.floor(Math.random() * config.icons.length)]()
        });
    }
    return particles;
};
