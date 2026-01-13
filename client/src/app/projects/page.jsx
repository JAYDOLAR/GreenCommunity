'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectsApi } from '@/lib/projectsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Trees,
  Wind,
  Sun,
  Droplets,
  MapPin,
  Award,
  Users,
  Calendar,
  Target,
  Heart,
  Search,
  Filter,
  Map,
  List,
  CheckCircle,
  ArrowRight,
  Globe,
  Store,
  Settings,
  Eye,
  EyeOff,
  Factory,
  Building2,
  CalendarDays
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ChatBot from '@/components/ChatBot';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import { usePreferences } from '@/context/PreferencesContext';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), {
  ssr: false,
  loading: () => null
});
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
  loading: () => null
});
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
  loading: () => null
});

// Import Leaflet CSS and fix default icons only on client side
const useLeafletSetup = () => {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        import('leaflet/dist/leaflet.css');
        
        // Fix default icon issue
        const L = require('leaflet');
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });
      } catch (error) {
        console.warn('Failed to load Leaflet setup:', error);
      }
    }
  }, []);
};

const Projects = () => {
  // Load Leaflet setup
  useLeafletSetup();
  const { preferences } = usePreferences();
  const carbonUnit = preferences?.carbonUnits || 'kg';
  const formatCO2 = (tonsValue) => carbonUnit === 'kg' ? `${(tonsValue * 1000).toLocaleString()} kg CO₂` : `${tonsValue.toLocaleString()} tons CO₂`;
  const displayCO2Value = (tonsValue) => carbonUnit === 'kg' ? (tonsValue * 1000).toLocaleString() : tonsValue.toLocaleString();
  const formatImpact = (tonsValue) => carbonUnit === 'kg' ? `${(tonsValue * 1000).toFixed(2)} kg CO₂` : `${tonsValue.toFixed(2)} tons CO₂`;
  
  const [viewMode, setViewMode] = useState(() => {
    // Initialize from localStorage if available, otherwise default to 'list'
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('projectsViewMode');
      return savedViewMode || 'list';
    }
    return 'list';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [contributionAmount, setContributionAmount] = useState([4150]); // in INR (~$50)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [customIcons, setCustomIcons] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();

  // Add error boundary
  useEffect(() => {
    try {
      // Component initialization
    } catch (err) {
      setError(err);
      console.error('Projects page error:', err);
    }
  }, []);

  // Close dialog when route changes or user navigates
  useEffect(() => {
    const handleRouteChange = () => {
      setDialogOpen(false);
      setSelectedProject(null);
    };

    const handleNavigationStart = () => {
      setDialogOpen(false);
      setSelectedProject(null);
    };

    // Listen for browser navigation
    window.addEventListener('popstate', handleRouteChange);
    // Listen for programmatic navigation from sidebar/navbar
    window.addEventListener('navigation-starting', handleNavigationStart);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('navigation-starting', handleNavigationStart);
    };
  }, []);

  // Close dialog when user clicks outside or presses escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDialogOpen(false);
        setSelectedProject(null);
      }
    };

    if (dialogOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [dialogOpen]);

  // Load custom icons for map markers
  useEffect(() => {
    const loadIcons = async () => {
      if (typeof window === 'undefined') return;

      try {
        const L = await import('leaflet');
        
        const getMarkerColor = (type) => {
          switch (type) {
            case 'forestry': return '#10B981';
            case 'renewable': return '#3B82F6';
            case 'water': return '#06B6D4';
            case 'agriculture': return '#F59E0B';
            default: return '#10B981';
          }
        };

        const types = ['forestry', 'renewable', 'water', 'agriculture', 'default'];
        const icons = {};

        types.forEach(type => {
          icons[type] = L.divIcon({
            html: `
              <div style="
                background-color: ${getMarkerColor(type)};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                ${type === 'forestry' ? '🌲' : type === 'renewable' ? '⚡' : type === 'water' ? '💧' : type === 'agriculture' ? '🌾' : '🌱'}
              </div>
            `,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
          });
        });

        setCustomIcons(icons);
      } catch (error) {
        console.error('Error loading leaflet icons:', error);
      }
    };

    loadIcons();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground">We're sorry, but something unexpected happened. Please try again.</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-background border border-border text-foreground font-medium py-3 px-6 rounded-md hover:bg-accent transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'north-india', label: 'North India' },
    { value: 'south-india', label: 'South India' },
    { value: 'west-india', label: 'West India' },
    { value: 'east-india', label: 'East India' },
    { value: 'central-india', label: 'Central India' },
    { value: 'northeast-india', label: 'Northeast India' },
  ];

  const projectTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'forestry', label: 'Forestry & Land Use' },
    { value: 'renewable', label: 'Renewable Energy' },
    { value: 'water', label: 'Water Conservation' },
    { value: 'agriculture', label: 'Sustainable Agriculture' },
  ];

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await projectsApi.getProjects({ limit: 1000, page: 1 });
        setProjects(response.data?.projects || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError(err.message || 'Failed to load projects');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (!project || !project.name) return false;

    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = selectedRegion === 'all' || project.region === selectedRegion;
    const matchesType = selectedType === 'all' || project.type === selectedType;
    return matchesSearch && matchesRegion && matchesType;
  });

  const handleProjectClick = (projectId) => {
    // Close dialog if open before navigating
    if (dialogOpen) {
      setDialogOpen(false);
      setSelectedProject(null);
    }
    router.push(`/projects/${projectId}`);
  };

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('projectsViewMode', newViewMode);
    }
  };

  const handleContribute = (e, project) => {
    e.stopPropagation(); // Prevent navigation when clicking contribute
    // Contribute logic here
    console.log(`Contribute to ${project.name}`);
  };

  const getProjectIcon = (type) => {
    switch (type) {
      case 'forestry': return Trees;
      case 'renewable': return Wind;
      case 'water': return Droplets;
      case 'agriculture': return Sun;
      default: return Trees;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'forestry': return 'text-green-600 bg-green-100';
      case 'renewable': return 'text-blue-600 bg-blue-100';
      case 'water': return 'text-cyan-600 bg-cyan-100';
      case 'agriculture': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateImpact = (amount) => {
    try {
      return ((amount * 83) * 0.00036).toFixed(1); // Average CO2 per rupee (adjusted for INR)
    } catch (err) {
      console.error('Error calculating impact:', err);
      return '0.0';
    }
  };

  // Map View Component
  const MapView = () => {
    const filteredMapProjects = filteredProjects.filter(project => project.coordinates);
    const [mapError, setMapError] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [hoveredProject, setHoveredProject] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [workingProjects, setWorkingProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [showVendors, setShowVendors] = useState(true);
    const [showWorkingProjects, setShowWorkingProjects] = useState(true);
    const [showCarbonProjects, setShowCarbonProjects] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [vendorIcons, setVendorIcons] = useState({});
    const [workingProjectIcons, setWorkingProjectIcons] = useState({});
    const [eventIcons, setEventIcons] = useState({});

    // Fetch vendors, working projects, and events
    useEffect(() => {
      const fetchNearbyData = async () => {
        try {
          // Fetch nearby vendors
          const vendorsRes = await fetch('/api/marketplace/nearby-vendors?limit=50');
          if (vendorsRes.ok) {
            const vendorsData = await vendorsRes.json();
            if (vendorsData.success) {
              setVendors(vendorsData.data.vendors || []);
            }
          }

          // Fetch nearby working projects  
          const workingRes = await fetch('/api/projects/nearby-working?limit=50');
          if (workingRes.ok) {
            const workingData = await workingRes.json();
            if (workingData.success) {
              setWorkingProjects(workingData.data.projects || []);
            }
          }

          // Fetch nearby events
          const eventsRes = await fetch('/api/events/nearby?limit=50');
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            if (eventsData.success) {
              setEvents(eventsData.data.events || []);
            }
          }
        } catch (error) {
          console.error('Error fetching nearby data:', error);
        }
      };

      fetchNearbyData();
    }, []);

    // Load vendor, working project, and event icons
    useEffect(() => {
      const loadAdditionalIcons = async () => {
        if (typeof window === 'undefined') return;

        try {
          const L = await import('leaflet');
          
          // Vendor icons
          const vendorIconsObj = {};
          vendorIconsObj['vendor'] = L.divIcon({
            html: `
              <div style="
                background-color: #F97316;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                🏪
              </div>
            `,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
          });

          setVendorIcons(vendorIconsObj);

          // Working project icons
          const workingIconsObj = {};
          workingIconsObj['working'] = L.divIcon({
            html: `
              <div style="
                background-color: #8B5CF6;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                🏗️
              </div>
            `,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
          });

          setWorkingProjectIcons(workingIconsObj);

          // Event icons
          const eventIconsObj = {};
          eventIconsObj['event'] = L.divIcon({
            html: `
              <div style="
                background-color: #EC4899;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                📅
              </div>
            `,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
          });

          setEventIcons(eventIconsObj);
        } catch (error) {
          console.error('Error loading additional icons:', error);
        }
      };

      loadAdditionalIcons();
    }, []);

    // Get custom icon from state
    const getCustomIcon = (type) => {
      return customIcons[type] || customIcons['default'] || null;
    };

    // Handle vendor click
    const handleVendorClick = (vendor) => {
      router.push('/marketplace');
    };

    // Handle working project click
    const handleWorkingProjectClick = (project) => {
      router.push(`/projects/${project.id || project._id}`);
    };

    // Handle event click
    const handleEventClick = (event) => {
      router.push('/community');
    };

    // Fallback map view when Leaflet fails
    if (mapError) {
      return (
        <div className="h-[700px] sm:h-[800px] lg:h-[900px] rounded-lg border-2 border-primary/20 bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-100 relative overflow-hidden">
          {/* Simple world map background */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-200"></div>
          </div>

          {/* Project markers */}
          {filteredMapProjects.map((project, index) => {
            const [lng, lat] = project.coordinates;
            const left = ((lng + 180) / 360) * 100;
            const top = ((90 - lat) / 180) * 100;

            const getPinStyle = (type) => {
              switch (type) {
                case 'forestry':
                  return 'text-green-500 text-2xl';
                case 'renewable':
                  return 'text-blue-500 text-2xl';
                case 'water':
                  return 'text-cyan-500 text-2xl';
                case 'agriculture':
                  return 'text-yellow-500 text-2xl';
                default:
                  return 'text-green-500 text-2xl';
              }
            };

            return (
              <motion.div
                key={project.id || project._id || index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                style={{ left: `${left}%`, top: `${top}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleProjectClick(project.id || project._id)}
              >
                <div className={`${getPinStyle(project.type)} group-hover:scale-125 transition-transform duration-200 drop-shadow-lg`}>
                  <MapPin className="h-5 w-5" />
                </div>
              </motion.div>
            );
          })}

          {/* Map controls */}
          <div className="absolute top-4 right-4 z-20">
            {/* Removed List View button */}
          </div>

          {/* Map title */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200 shadow-xl z-20">
            <div className="flex items-center gap-3">
              <Globe className="h-7 w-7 text-primary" />
              <div>
                <div className="font-semibold text-lg">Global Projects</div>
                <div className="text-sm text-gray-600">{filteredMapProjects.length} active projects</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-[700px] sm:h-[800px] lg:h-[900px] rounded-lg border-2 border-primary/20 overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={1}
          maxZoom={18}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          whenCreated={() => {
            setMapLoaded(true);
          }}
          whenReady={() => {
            setMapLoaded(true);
          }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution=""
          />

          {/* Carbon offset projects markers */}
          {showCarbonProjects && Object.keys(customIcons).length > 0 && filteredMapProjects.map((project, index) => {
            const [lng, lat] = project.coordinates;
            const customIcon = getCustomIcon(project.type);

            // Only render marker if we have a valid icon
            if (!customIcon) return null;

            return (
              <Marker
                key={`carbon-${project.id || project._id || index}`}
                position={[lat, lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleProjectClick(project.id || project._id),
                  mouseover: (e) => {
                    e.target.openPopup();
                    setHoveredProject(project.id || project._id);
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                    setHoveredProject(null);
                  },
                }}
              >
                <Popup autoPan={false} closeButton={false}>
                  <div className="p-3 min-w-[250px] cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleProjectClick(project.id || project._id)}>
                    <div className="font-semibold text-primary mb-2 text-base">{project.name}</div>
                    <div className="text-gray-600 mb-3 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-green-600 font-medium text-sm">
                          {(project.co2Removed || 0).toLocaleString()} tons CO₂
                        </div>
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Carbon Offset
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{(project.contributors || 0).toLocaleString()} contributors</span>
                        <span>{project.timeRemaining || 'Ongoing'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Click to view full details →
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Vendor markers */}
          {showVendors && Object.keys(vendorIcons).length > 0 && vendors.map((vendor, index) => {
            if (!vendor.coordinates) return null;
            const [lng, lat] = vendor.coordinates;

            return (
              <Marker
                key={`vendor-${vendor._id || index}`}
                position={[lat, lng]}
                icon={vendorIcons['vendor']}
                eventHandlers={{
                  click: () => handleVendorClick(vendor),
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  },
                }}
              >
                <Popup autoPan={false} closeButton={false}>
                  <div className="p-3 min-w-[250px] cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleVendorClick(vendor)}>
                    <div className="font-semibold text-orange-600 mb-2 text-base">{vendor.vendorName || 'Eco Vendor'}</div>
                    <div className="text-gray-600 mb-3 text-sm flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {vendor.address || vendor.city || 'Local Vendor'}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-orange-600 font-medium text-sm">
                          {vendor.productCount || 0} products
                        </div>
                        <Badge className="text-xs bg-orange-100 text-orange-800">
                          Vendor
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{vendor.totalProductsInStock || 0} in stock</span>
                        <span>⭐ {(vendor.avgEcoRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Click to visit marketplace →
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Working project markers */}
          {showWorkingProjects && Object.keys(workingProjectIcons).length > 0 && workingProjects.map((project, index) => {
            if (!project.coordinates) return null;
            const [lng, lat] = project.coordinates;

            return (
              <Marker
                key={`working-${project.id || project._id || index}`}
                position={[lat, lng]}
                icon={workingProjectIcons['working']}
                eventHandlers={{
                  click: () => handleWorkingProjectClick(project),
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  },
                }}
              >
                <Popup autoPan={false} closeButton={false}>
                  <div className="p-3 min-w-[250px] cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleWorkingProjectClick(project)}>
                    <div className="font-semibold text-purple-600 mb-2 text-base">{project.name}</div>
                    <div className="text-gray-600 mb-3 text-sm flex items-center gap-1">
                      <Factory className="h-3 w-3" />
                      {project.location}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-purple-600 font-medium text-sm">
                          {project.status || 'Active'}
                        </div>
                        <Badge className="text-xs bg-purple-100 text-purple-800">
                          Working Project
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project.type || 'Development'}</span>
                        {project.distanceKm && <span>{project.distanceKm}km away</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Click to view project details →
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Event markers */}
          {showEvents && Object.keys(eventIcons).length > 0 && events.map((event, index) => {
            if (!event.coordinates) return null;
            const [lng, lat] = event.coordinates;

            return (
              <Marker
                key={`event-${event._id || index}`}
                position={[lat, lng]}
                icon={eventIcons['event']}
                eventHandlers={{
                  click: () => handleEventClick(event),
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  },
                }}
              >
                <Popup autoPan={false} closeButton={false}>
                  <div className="p-3 min-w-[250px] cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleEventClick(event)}>
                    <div className="font-semibold text-pink-600 mb-2 text-base">{event.title}</div>
                    <div className="text-gray-600 mb-3 text-sm flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {event.location}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-pink-600 font-medium text-sm">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <Badge className="text-xs bg-pink-100 text-pink-800">
                          Event
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{event.type || 'Community Event'}</span>
                        <span>{event.attendees || 0} attending</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Click to view community →
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border-2 border-gray-200 shadow-xl">
            <div className="text-xs font-semibold text-gray-700 mb-2">Toggle Layers</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showCarbonProjects}
                  onChange={(e) => setShowCarbonProjects(e.target.checked)}
                  className="w-3 h-3"
                />
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Carbon Projects
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showVendors}
                  onChange={(e) => setShowVendors(e.target.checked)}
                  className="w-3 h-3"
                />
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  Vendors
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showWorkingProjects}
                  onChange={(e) => setShowWorkingProjects(e.target.checked)}
                  className="w-3 h-3"
                />
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Working Projects
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showEvents}
                  onChange={(e) => setShowEvents(e.target.checked)}
                  className="w-3 h-3"
                />
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  Events
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Map Title and Statistics */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200 shadow-xl z-30">
          <div className="flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" />
            <div>
              <div className="font-semibold text-lg">Eco Map</div>
              <div className="text-sm text-gray-600">
                {showCarbonProjects && `${filteredMapProjects.length} carbon projects`}
                {showCarbonProjects && (showVendors || showWorkingProjects || showEvents) && ' • '}
                {showVendors && `${vendors.length} vendors`}
                {showVendors && (showWorkingProjects || showEvents) && ' • '}
                {showWorkingProjects && `${workingProjects.length} working`}
                {showWorkingProjects && showEvents && ' • '}
                {showEvents && `${events.length} events`}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {showCarbonProjects && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>CO₂ Offset Projects</span>
                </div>
              )}
              {showVendors && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Eco-Friendly Vendors</span>
                </div>
              )}
              {showWorkingProjects && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Active Developments</span>
                </div>
              )}
              {showEvents && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span>Community Events</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  try {
    return (
      <div className="p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gradient-to-b from-background to-accent/5 min-h-screen">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-bold text-gradient">Carbon Offset Projects</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Support verified projects that remove CO₂ from the atmosphere</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full sm:w-36 text-sm">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-36 text-sm">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('map')}
                className="h-8 px-3"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'map' ? (
          <div className="relative flex-1">
            <MapView />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-6">
            {filteredProjects.map((project, index) => {
              const IconComponent = getProjectIcon(project.type);
              const totalTarget = project.fundingGoal || project.totalFunding || 0;
              const fundingPercentage = totalTarget > 0 ? ((project.currentFunding || 0) / totalTarget) * 100 : 0;

              return (
                <motion.div
                  key={project.id || project._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => handleProjectClick(project.id || project._id)}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Project Image */}
                        <div className="relative w-full sm:w-96 h-64 sm:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
                          <img
                            src={project.image || '/tree1.jpg'}
                            alt={project.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/tree1.jpg'; // Fallback image
                            }}
                          />
                          {project.verified && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-600 shadow-md">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          )}
                          {project.featured && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Award className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 space-y-3 sm:space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                                  {project.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-4 w-4" />
                                  {project.location}
                                </div>
                              </div>
                              <Badge className={getTypeColor(project.type)}>
                                <IconComponent className="h-3 w-3 mr-1" />
                                {projectTypes.find(t => t.value === project.type)?.label || project.type}
                              </Badge>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">
                              {project.description}
                            </p>
                          </div>

                          {/* Project Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="text-center">
                              <div className="text-lg sm:text-xl font-bold text-primary">
                                {(((project.impact && project.impact.carbonOffset) || project.co2Removed || 0)).toLocaleString()}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">{carbonUnit === 'kg' ? 'kg CO₂' : 'tons CO₂'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-xl font-bold text-primary">
                                {(project.contributors || 0).toLocaleString()}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">contributors</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-xl font-bold text-primary">
                                {project.timeRemaining}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">remaining</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg sm:text-xl font-bold text-primary">
                                ₹{(project.co2PerRupee * 1000000).toFixed(2)}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">per ton</div>
                            </div>
                          </div>

                          {/* Funding Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-xs sm:text-sm text-muted-foreground">Funding Progress</span>
                              <span className="font-medium text-xs sm:text-sm">
                                ₹{(project.currentFunding / 10000000).toFixed(1)}Cr / ₹{(project.totalFunding / 10000000).toFixed(1)}Cr
                              </span>
                            </div>
                            <Progress value={fundingPercentage} className="h-2 sm:h-3 progress-eco" />
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {fundingPercentage.toFixed(0)}% funded
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                            <Button
                              className="btn-hero text-xs sm:text-base px-3 sm:px-5 py-2 sm:py-3"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent navigation
                                e.preventDefault(); // Prevent default behavior
                                setSelectedProject(project);
                                setContributionAmount([4150]); // Reset to default ₹4150 (~$50)
                                setIsLoading(false);
                                setDialogOpen(true);
                              }}
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Contribute
                            </Button>
                            <Button
                              variant="outline"
                              className="text-xs sm:text-base px-3 sm:px-5 py-2 sm:py-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProjectClick(project.id || project._id);
                              }}
                            >
                              Learn More
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-muted-foreground text-sm sm:text-lg">No projects found</div>
            <p className="text-muted-foreground text-xs sm:text-base">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Contribution Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent 
            className="sm:max-w-md max-h-[90vh] overflow-y-auto z-[9999]"
            onPointerDownOutside={(e) => {
              e.preventDefault();
              setDialogOpen(false);
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              setDialogOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Support {selectedProject?.name}</DialogTitle>
              <DialogDescription className="text-sm">
                Choose your contribution amount to help offset carbon emissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-xs sm:text-sm">Contribution Amount: ₹{contributionAmount[0].toLocaleString()}</Label>
                <Slider
                  value={contributionAmount}
                  onValueChange={setContributionAmount}
                  max={100000}
                  min={1000}
                  step={500}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₹1,000</span>
                  <span>₹1,00,000</span>
                </div>
                
                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[2500, 5000, 10000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setContributionAmount([amount])}
                    >
                      ₹{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-primary/10 rounded-lg">
                <div className="text-center">
                  <div className="text-xs sm:text-sm text-muted-foreground">Your Impact</div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {formatImpact(contributionAmount[0] * 0.00036)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">will be offset</div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                className="w-full btn-hero text-xs sm:text-base px-3 sm:px-5 py-2 sm:py-3"
                onClick={() => {
                  setIsLoading(true);
                  try {
                    const projectName = selectedProject?.name;
                    setDialogOpen(false); // Close dialog before navigation
                    router.push(`/payment?project=${encodeURIComponent(projectName)}&amount=${contributionAmount[0]}`);
                  } catch (error) {
                    console.error('Navigation error:', error);
                    setIsLoading(false);
                    setDialogOpen(false); // Close dialog on error too
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Contribute ₹${contributionAmount[0].toLocaleString()}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ChatBot />
      </div>
    );
  } catch (err) {
    console.error('Error rendering Projects component:', err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground">We're sorry, but something unexpected happened. Please try again.</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-background border border-border text-foreground font-medium py-3 px-6 rounded-md hover:bg-accent transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }
};

const ProjectsPage = () => {
  return (
    <AuthGuard intent="projects">
      <Layout>
        <Projects />
      </Layout>
    </AuthGuard>
  );
};

export default ProjectsPage;