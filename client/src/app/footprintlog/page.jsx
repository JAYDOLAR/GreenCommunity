"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Car,
  Home,
  Utensils,
  Plane,
  Plus,
  Calculator,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Filter,
  Clock,
  Trash2,
  Edit3,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'react-hot-toast';

import ProtectedLayout from '@/components/ProtectedLayout';
import ChatBot from '@/components/ChatBot';
import { useFootprintLog } from '@/lib/useFootprintLog';
import Link from 'next/link';

const FootprintLog = () => {
  // Use the custom hook for API operations
  const {
    logs,
    totalEmissions,
    loading,
    error,
    createLog,
    deleteLog,
    updateLog,
    calculateEmissions,
    calculateEmissionsWithAPI,
    getWeeklyTotal,
    getMonthlyTotal,
    refresh
  } = useFootprintLog();

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityType, setActivityType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calculatedEmissions, setCalculatedEmissions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Additional details based on activity type
  const [fuelType, setFuelType] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [flightClass, setFlightClass] = useState('');
  const [energySource, setEnergySource] = useState('');
  const [foodType, setFoodType] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [clothingType, setClothingType] = useState('');
  const [electronicsType, setElectronicsType] = useState('');
  const [furnitureType, setFurnitureType] = useState('');

  const activityTypes = [
    // Transportation
    {
      value: 'transport-car',
      label: 'Car Travel',
      icon: Car,
      unit: 'miles',
      factor: 0.4,
      category: 'Transportation',
      requiresFuelType: true,
      requiresPassengers: true
    },
    {
      value: 'transport-bus',
      label: 'Bus Travel',
      icon: Car,
      unit: 'miles',
      factor: 0.15,
      category: 'Transportation',
      requiresPassengers: true
    },
    {
      value: 'transport-train',
      label: 'Train Travel',
      icon: Car,
      unit: 'miles',
      factor: 0.12,
      category: 'Transportation',
      requiresPassengers: true
    },
    {
      value: 'transport-subway',
      label: 'Subway/Metro',
      icon: Car,
      unit: 'miles',
      factor: 0.08,
      category: 'Transportation'
    },
    {
      value: 'transport-taxi',
      label: 'Taxi/Rideshare',
      icon: Car,
      unit: 'miles',
      factor: 0.45,
      category: 'Transportation',
      requiresFuelType: true,
      requiresPassengers: true
    },
    {
      value: 'transport-motorcycle',
      label: 'Motorcycle',
      icon: Car,
      unit: 'miles',
      factor: 0.25,
      category: 'Transportation',
      requiresFuelType: true
    },
    {
      value: 'transport-flight',
      label: 'Flight',
      icon: Plane,
      unit: 'miles',
      factor: 0.2,
      category: 'Transportation',
      requiresFlightClass: true,
      requiresPassengers: true
    },
    {
      value: 'transport-ferry',
      label: 'Ferry',
      icon: Plane,
      unit: 'miles',
      factor: 0.35,
      category: 'Transportation',
      requiresPassengers: true
    },
    {
      value: 'transport-bicycle',
      label: 'Bicycle',
      icon: Car,
      unit: 'miles',
      factor: 0,
      category: 'Transportation'
    },
    {
      value: 'transport-walking',
      label: 'Walking',
      icon: Car,
      unit: 'miles',
      factor: 0,
      category: 'Transportation'
    },
    
    // Energy & Utilities
    {
      value: 'energy-electricity',
      label: 'Electricity Usage',
      icon: Home,
      unit: 'kWh',
      factor: 0.5,
      category: 'Energy',
      requiresEnergySource: true
    },
    {
      value: 'energy-gas',
      label: 'Natural Gas',
      icon: Home,
      unit: 'therms',
      factor: 5.3,
      category: 'Energy'
    },
    {
      value: 'energy-heating-oil',
      label: 'Heating Oil',
      icon: Home,
      unit: 'gallons',
      factor: 22.4,
      category: 'Energy'
    },
    {
      value: 'energy-propane',
      label: 'Propane',
      icon: Home,
      unit: 'gallons',
      factor: 12.7,
      category: 'Energy'
    },
    {
      value: 'energy-coal',
      label: 'Coal',
      icon: Home,
      unit: 'lbs',
      factor: 2.0,
      category: 'Energy'
    },
    {
      value: 'energy-wood',
      label: 'Wood Burning',
      icon: Home,
      unit: 'cords',
      factor: 4200,
      category: 'Energy'
    },
    
    // Food & Diet
    {
      value: 'food-beef',
      label: 'Beef',
      icon: Utensils,
      unit: 'lbs',
      factor: 27.0,
      category: 'Food',
      requiresFoodType: true
    },
    {
      value: 'food-pork',
      label: 'Pork',
      icon: Utensils,
      unit: 'lbs',
      factor: 12.1,
      category: 'Food',
      requiresFoodType: true
    },
    {
      value: 'food-chicken',
      label: 'Chicken',
      icon: Utensils,
      unit: 'lbs',
      factor: 6.9,
      category: 'Food',
      requiresFoodType: true
    },
    {
      value: 'food-fish',
      label: 'Fish & Seafood',
      icon: Utensils,
      unit: 'lbs',
      factor: 5.4,
      category: 'Food',
      requiresFoodType: true
    },
    {
      value: 'food-dairy',
      label: 'Dairy Products',
      icon: Utensils,
      unit: 'lbs',
      factor: 3.2,
      category: 'Food',
      requiresFoodType: true
    },
    {
      value: 'food-eggs',
      label: 'Eggs',
      icon: Utensils,
      unit: 'dozen',
      factor: 4.8,
      category: 'Food'
    },
    {
      value: 'food-rice',
      label: 'Rice',
      icon: Utensils,
      unit: 'lbs',
      factor: 2.7,
      category: 'Food'
    },
    {
      value: 'food-vegetables',
      label: 'Vegetables',
      icon: Utensils,
      unit: 'lbs',
      factor: 0.4,
      category: 'Food'
    },
    {
      value: 'food-fruits',
      label: 'Fruits',
      icon: Utensils,
      unit: 'lbs',
      factor: 0.3,
      category: 'Food'
    },
    
    // Waste & Recycling
    {
      value: 'waste-general',
      label: 'General Waste',
      icon: Trash2,
      unit: 'lbs',
      factor: 0.94,
      category: 'Waste',
      requiresWasteType: true
    },
    {
      value: 'waste-recycling',
      label: 'Recycling',
      icon: RefreshCw,
      unit: 'lbs',
      factor: -0.5,
      category: 'Waste',
      requiresWasteType: true
    },
    {
      value: 'waste-compost',
      label: 'Composting',
      icon: RefreshCw,
      unit: 'lbs',
      factor: -0.2,
      category: 'Waste'
    },
    
    // Water Usage
    {
      value: 'water-usage',
      label: 'Water Usage',
      icon: Home,
      unit: 'gallons',
      factor: 0.006,
      category: 'Water'
    },
    {
      value: 'water-shower',
      label: 'Shower',
      icon: Home,
      unit: 'minutes',
      factor: 0.125,
      category: 'Water'
    },
    {
      value: 'water-dishwasher',
      label: 'Dishwasher Use',
      icon: Home,
      unit: 'loads',
      factor: 1.8,
      category: 'Water'
    },
    {
      value: 'water-laundry',
      label: 'Laundry',
      icon: Home,
      unit: 'loads',
      factor: 2.3,
      category: 'Water',
      requiresWaterTemp: true
    },
    
    // Shopping & Consumer Goods
    {
      value: 'shopping-clothing',
      label: 'Clothing Purchase',
      icon: Home,
      unit: 'items',
      factor: 15.0,
      category: 'Shopping',
      requiresClothingType: true
    },
    {
      value: 'shopping-electronics',
      label: 'Electronics',
      icon: Home,
      unit: 'items',
      factor: 300.0,
      category: 'Shopping',
      requiresElectronicsType: true
    },
    {
      value: 'shopping-books',
      label: 'Books/Media',
      icon: Home,
      unit: 'items',
      factor: 2.5,
      category: 'Shopping'
    },
    {
      value: 'shopping-furniture',
      label: 'Furniture',
      icon: Home,
      unit: 'items',
      factor: 250.0,
      category: 'Shopping',
      requiresFurnitureType: true
    },
  ];

  // Fuel type options
  const fuelTypes = [
    { value: 'petrol', label: 'Petrol/Gasoline', factor: 1.0 },
    { value: 'diesel', label: 'Diesel', factor: 1.2 },
    { value: 'cng', label: 'CNG', factor: 0.7 },
    { value: 'electric', label: 'Electric', factor: 0.3 },
    { value: 'hybrid', label: 'Hybrid', factor: 0.6 },
  ];

  // Flight class options
  const flightClasses = [
    { value: 'economy', label: 'Economy', factor: 1.0 },
    { value: 'business', label: 'Business', factor: 2.5 },
    { value: 'first', label: 'First Class', factor: 4.0 },
  ];

  // Energy source options
  const energySources = [
    { value: 'grid', label: 'Grid Electricity', factor: 1.0 },
    { value: 'solar', label: 'Solar Power', factor: 0.1 },
    { value: 'wind', label: 'Wind Power', factor: 0.1 },
    { value: 'hydro', label: 'Hydroelectric', factor: 0.2 },
  ];

  // Food type options
  const foodTypes = [
    { value: 'beef', label: 'Beef', factor: 1.5 },
    { value: 'pork', label: 'Pork', factor: 1.0 },
    { value: 'chicken', label: 'Chicken', factor: 0.6 },
    { value: 'fish', label: 'Fish', factor: 0.5 },
    { value: 'milk', label: 'Milk', factor: 1.0 },
    { value: 'cheese', label: 'Cheese', factor: 1.2 },
    { value: 'yogurt', label: 'Yogurt', factor: 0.8 },
    { value: 'grass-fed', label: 'Grass-Fed Beef', factor: 1.2 },
    { value: 'organic', label: 'Organic', factor: 0.9 },
    { value: 'local', label: 'Local/Seasonal', factor: 0.7 },
  ];

  // Waste type options
  const wasteTypes = [
    { value: 'general', label: 'General Waste', factor: 1.0 },
    { value: 'plastic', label: 'Plastic', factor: 1.2 },
    { value: 'paper', label: 'Paper', factor: 0.8 },
    { value: 'glass', label: 'Glass', factor: 0.6 },
    { value: 'metal', label: 'Metal', factor: 0.5 },
    { value: 'organic', label: 'Organic Waste', factor: 1.1 },
    { value: 'electronics', label: 'E-Waste', factor: 2.0 },
  ];

  // Water temperature options
  const waterTemperatures = [
    { value: 'cold', label: 'Cold Water', factor: 0.5 },
    { value: 'warm', label: 'Warm Water', factor: 1.0 },
    { value: 'hot', label: 'Hot Water', factor: 1.5 },
  ];

  // Clothing type options
  const clothingTypes = [
    { value: 't-shirt', label: 'T-Shirt', factor: 0.8 },
    { value: 'jeans', label: 'Jeans', factor: 2.0 },
    { value: 'dress', label: 'Dress', factor: 1.5 },
    { value: 'jacket', label: 'Jacket/Coat', factor: 3.0 },
    { value: 'shoes', label: 'Shoes', factor: 1.8 },
    { value: 'underwear', label: 'Underwear', factor: 0.3 },
    { value: 'synthetic', label: 'Synthetic Fabric', factor: 1.2 },
    { value: 'cotton', label: 'Cotton', factor: 1.0 },
    { value: 'wool', label: 'Wool', factor: 1.8 },
  ];

  // Electronics type options
  const electronicsTypes = [
    { value: 'smartphone', label: 'Smartphone', factor: 0.8 },
    { value: 'laptop', label: 'Laptop', factor: 1.5 },
    { value: 'tablet', label: 'Tablet', factor: 0.6 },
    { value: 'tv', label: 'Television', factor: 2.0 },
    { value: 'appliance', label: 'Home Appliance', factor: 3.0 },
    { value: 'gaming', label: 'Gaming Console', factor: 1.2 },
    { value: 'camera', label: 'Camera', factor: 0.9 },
  ];

  // Furniture type options
  const furnitureTypes = [
    { value: 'chair', label: 'Chair', factor: 0.8 },
    { value: 'table', label: 'Table', factor: 1.2 },
    { value: 'sofa', label: 'Sofa/Couch', factor: 2.0 },
    { value: 'bed', label: 'Bed', factor: 1.8 },
    { value: 'dresser', label: 'Dresser/Cabinet', factor: 1.5 },
    { value: 'bookshelf', label: 'Bookshelf', factor: 1.0 },
    { value: 'desk', label: 'Desk', factor: 1.1 },
  ];

  // Helper function to get dynamic field label based on activity type
  const getQuantityLabel = () => {
    if (!activityType) return 'Quantity';
    
    const selectedActivity = activityTypes.find(type => type.value === activityType);
    if (!selectedActivity) return 'Quantity';
    
    const unit = selectedActivity.unit;
    
    // Create contextual labels based on activity category and unit
    switch (selectedActivity.category) {
      case 'Transportation':
        if (unit === 'miles') return 'Distance';
        return 'Quantity';
        
      case 'Energy':
        if (unit === 'kWh') return 'Energy Usage';
        if (unit === 'therms') return 'Gas Usage';
        if (unit === 'gallons') return 'Fuel Amount';
        if (unit === 'lbs') return 'Weight';
        if (unit === 'cords') return 'Wood Amount';
        return 'Quantity';
        
      case 'Food':
        if (unit === 'lbs') return 'Weight';
        if (unit === 'dozen') return 'Number of Dozens';
        return 'Amount';
        
      case 'Waste':
        if (unit === 'lbs') return 'Weight';
        return 'Amount';
        
      case 'Water':
        if (unit === 'gallons') return 'Water Volume';
        if (unit === 'minutes') return 'Duration';
        if (unit === 'loads') return 'Number of Loads';
        return 'Amount';
        
      case 'Shopping':
        if (unit === 'items') return 'Number of Items';
        return 'Quantity';
        
      default:
        return 'Quantity';
    }
  };

  // Helper function to get placeholder text based on activity type
  const getQuantityPlaceholder = () => {
    if (!activityType) return '0';
    
    const selectedActivity = activityTypes.find(type => type.value === activityType);
    if (!selectedActivity) return '0';
    
    const unit = selectedActivity.unit;
    
    switch (selectedActivity.category) {
      case 'Transportation':
        return unit === 'miles' ? 'Enter distance' : 'Enter quantity';
        
      case 'Energy':
        if (unit === 'kWh') return 'Enter kWh used';
        if (unit === 'therms') return 'Enter therms used';
        if (unit === 'gallons') return 'Enter gallons used';
        return 'Enter amount';
        
      case 'Food':
        return unit === 'dozen' ? 'Enter dozens' : 'Enter weight in lbs';
        
      case 'Waste':
        return 'Enter weight in lbs';
        
      case 'Water':
        if (unit === 'minutes') return 'Enter minutes';
        if (unit === 'loads') return 'Enter number';
        return 'Enter gallons';
        
      case 'Shopping':
        return 'Enter number of items';
        
      default:
        return 'Enter amount';
    }
  };

  // Helper function to check if all required fields are filled
  const isFormValid = () => {
    if (!activityType || !quantity) return false;
    
    const selectedActivity = activityTypes.find(type => type.value === activityType);
    if (!selectedActivity) return false;
    
    // Check required fields based on activity type
    if (selectedActivity.requiresFuelType && !fuelType) return false;
    if (selectedActivity.requiresFlightClass && !flightClass) return false;
    if (selectedActivity.requiresEnergySource && !energySource) return false;
    if (selectedActivity.requiresFoodType && !foodType) return false;
    if (selectedActivity.requiresWasteType && !wasteType) return false;
    if (selectedActivity.requiresWaterTemp && !waterTemp) return false;
    if (selectedActivity.requiresClothingType && !clothingType) return false;
    if (selectedActivity.requiresElectronicsType && !electronicsType) return false;
    if (selectedActivity.requiresFurnitureType && !furnitureType) return false;
    
    return true;
  };

  // Calculate emissions preview (using backend API)
  const calculateEmissionsPreview = async () => {
    const selectedActivity = activityTypes.find(type => type.value === activityType);
    if (selectedActivity && quantity) {
      setIsCalculating(true);
      try {
        const activityData = {
          activityType,
          quantity,
          selectedDate,
          details: {
            fuelType,
            passengers,
            flightClass,
            energySource,
            foodType,
            wasteType,
            waterTemp,
            clothingType,
            electronicsType,
            furnitureType,
            unit: selectedActivity.unit
          }
        };

        const result = await calculateEmissionsWithAPI(activityData);
        setCalculatedEmissions(result.emission);
        setShowResult(true);
        
        // Show success message with calculation method
        toast.success(`✅ Impact calculated successfully using ${result.calculation?.method || 'backend'} method`);
      } catch (error) {
        console.error('Failed to calculate emissions:', error);
        // Fallback to client-side calculation if API fails
        const fallbackEmissions = calculateEmissions({
          activityType,
          quantity,
          details: {
            fuelType,
            passengers,
            flightClass,
            energySource,
            foodType,
            wasteType,
            waterTemp,
            clothingType,
            electronicsType,
            furnitureType,
            unit: selectedActivity.unit
          }
        });
        setCalculatedEmissions(fallbackEmissions);
        setShowResult(true);
        toast.error('⚠️ Backend calculation failed, using offline calculation method');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const getSelectedActivityDetails = () => {
    return activityTypes.find(type => type.value === activityType);
  };

  // Add handler for Add to Log with API integration
  const handleAddToLog = async () => {
    const selectedActivity = activityTypes.find(type => type.value === activityType);
    if (!selectedActivity || !quantity) {
      toast.error('⚠️ Please fill in all required fields to calculate impact');
      return;
    }

    try {
      // Create detailed activity description
      let activityDescription = selectedActivity.label;
      if (activityType === 'transport-car' && fuelType) {
        const fuelLabel = fuelTypes.find(f => f.value === fuelType)?.label;
        activityDescription = `${fuelLabel} Car Travel`;
      } else if (activityType === 'transport-flight' && flightClass) {
        const classLabel = flightClasses.find(f => f.value === flightClass)?.label;
        activityDescription = `${classLabel} Flight`;
      } else if (activityType === 'energy-electricity' && energySource) {
        const sourceLabel = energySources.find(e => e.value === energySource)?.label;
        activityDescription = `${sourceLabel} Usage`;
      } else if ((activityType === 'food-meat' || activityType === 'food-dairy') && foodType) {
        const foodLabel = foodTypes.find(f => f.value === foodType)?.label;
        activityDescription = `${foodLabel} Consumption`;
      }

      // Prepare log data for API
      const logData = {
        activityType,
        quantity,
        selectedDate,
        activity: activityDescription,
        details: {
          fuelType,
          passengers,
          flightClass,
          energySource,
          foodType,
          unit: selectedActivity.unit,
          category: selectedActivity.label.split(' ')[0].toLowerCase(),
        }
      };

      // Submit to API
      await createLog(logData);

      // Reset form
      setShowResult(false);
      setActivityType('');
      setQuantity('');
      setFuelType('');
      setPassengers('1');
      setFlightClass('');
      setEnergySource('');
      setFoodType('');
      setWasteType('');
      setWaterTemp('');
      setClothingType('');
      setElectronicsType('');
      setFurnitureType('');
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Failed to add log:', error);
    }
  };

  // Handle delete log
  const handleDeleteLog = async (logId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteLog(logId);
      } catch (error) {
        console.error('Failed to delete log:', error);
      }
    }
  };

  // Format log for display
  const formatLogForDisplay = (log) => {
    // Map activity types to icons
    const iconMap = {
      'transport': Car,
      'energy': Home,
      'food': Utensils,
      'waste': Trash2,
      'other': Clock
    };

    return {
      id: log._id,
      date: format(new Date(log.createdAt || log.date), "yyyy-MM-dd"),
      activity: log.activity,
      type: log.category || log.activityType,
      amount: log.details?.quantity || 0,
      unit: log.details?.unit || 'units',
      co2: log.emission || 0,
      icon: iconMap[log.activityType] || Clock,
      rawLog: log
    };
  };

  // Get formatted logs for display
  const displayLogs = logs.map(formatLogForDisplay);

  // Calculate weekly and monthly totals
  const weeklyTotal = getWeeklyTotal();
  const monthlyTotal = getMonthlyTotal();
  const averageDaily = weeklyTotal / 7;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Carbon Footprint Log</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor your environmental impact and make informed decisions for a greener lifestyle</p>
        </div>
        <div className="flex gap-2">
          <Link href="/CarbonCalculator">
            <Button
              variant="default"
              size="sm"
              className="shrink-0"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Full Assessment
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="card-eco">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {weeklyTotal.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-muted-foreground">kg CO₂</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
              <span className="text-xs sm:text-sm text-success">8% lower than last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{logs.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Activities logged</div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {averageDaily.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-muted-foreground">kg CO₂</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Per day this week</div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {totalEmissions.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-muted-foreground">kg CO₂</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">All time</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Activity Form */}
        <div className="lg:col-span-1">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Log New Activity
              </CardTitle>
              <CardDescription>Record your daily activities and instantly calculate their environmental impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Activity Type */}
              <div>
                <Label className="text-sm sm:text-base">Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose your activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Group activities by category */}
                    {['Transportation', 'Energy', 'Food', 'Waste', 'Water', 'Shopping'].map((category) => {
                      const categoryActivities = activityTypes.filter(type => type.category === category);
                      if (categoryActivities.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {category}
                          </div>
                          {categoryActivities.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{type.label}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">({type.unit})</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity and Unit */}
              {activityType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm sm:text-base">{getQuantityLabel()}</Label>
                    <Input
                      type="number"
                      placeholder={getQuantityPlaceholder()}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Unit</Label>
                    <Input
                      value={getSelectedActivityDetails()?.unit || ''}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                </div>
              )}

              {/* Fuel Type for Car/Motorcycle/Taxi Travel */}
              {(activityType === 'transport-car' || activityType === 'transport-motorcycle' || activityType === 'transport-taxi') && (
                <div>
                  <Label className="text-sm sm:text-base">Fuel Type</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((fuel) => (
                        <SelectItem key={fuel.value} value={fuel.value}>
                          {fuel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Flight Class for Air Travel */}
              {activityType === 'transport-flight' && (
                <div>
                  <Label className="text-sm sm:text-base">Flight Class</Label>
                  <Select value={flightClass} onValueChange={setFlightClass}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select flight class" />
                    </SelectTrigger>
                    <SelectContent>
                      {flightClasses.map((classType) => (
                        <SelectItem key={classType.value} value={classType.value}>
                          {classType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Energy Source for Electricity */}
              {activityType === 'energy-electricity' && (
                <div>
                  <Label className="text-sm sm:text-base">Energy Source</Label>
                  <Select value={energySource} onValueChange={setEnergySource}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select energy source" />
                    </SelectTrigger>
                    <SelectContent>
                      {energySources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Food Type for All Food Categories */}
              {(activityType === 'food-beef' || activityType === 'food-pork' || activityType === 'food-chicken' || 
                activityType === 'food-fish' || activityType === 'food-dairy') && (
                <div>
                  <Label className="text-sm sm:text-base">Food Type</Label>
                  <Select value={foodType} onValueChange={setFoodType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodTypes.map((food) => (
                        <SelectItem key={food.value} value={food.value}>
                          {food.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Waste Type for Waste Activities */}
              {(activityType === 'waste-general' || activityType === 'waste-recycling') && (
                <div>
                  <Label className="text-sm sm:text-base">Waste Type</Label>
                  <Select value={wasteType} onValueChange={setWasteType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select waste type" />
                    </SelectTrigger>
                    <SelectContent>
                      {wasteTypes.map((waste) => (
                        <SelectItem key={waste.value} value={waste.value}>
                          {waste.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Water Temperature for Laundry */}
              {activityType === 'water-laundry' && (
                <div>
                  <Label className="text-sm sm:text-base">Water Temperature</Label>
                  <Select value={waterTemp} onValueChange={setWaterTemp}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select water temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      {waterTemperatures.map((temp) => (
                        <SelectItem key={temp.value} value={temp.value}>
                          {temp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Clothing Type for Clothing Purchases */}
              {activityType === 'shopping-clothing' && (
                <div>
                  <Label className="text-sm sm:text-base">Clothing Type</Label>
                  <Select value={clothingType} onValueChange={setClothingType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select clothing type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clothingTypes.map((clothing) => (
                        <SelectItem key={clothing.value} value={clothing.value}>
                          {clothing.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Electronics Type for Electronics Purchases */}
              {activityType === 'shopping-electronics' && (
                <div>
                  <Label className="text-sm sm:text-base">Electronics Type</Label>
                  <Select value={electronicsType} onValueChange={setElectronicsType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select electronics type" />
                    </SelectTrigger>
                    <SelectContent>
                      {electronicsTypes.map((electronics) => (
                        <SelectItem key={electronics.value} value={electronics.value}>
                          {electronics.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Furniture Type for Furniture Purchases */}
              {activityType === 'shopping-furniture' && (
                <div>
                  <Label className="text-sm sm:text-base">Furniture Type</Label>
                  <Select value={furnitureType} onValueChange={setFurnitureType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select furniture type" />
                    </SelectTrigger>
                    <SelectContent>
                      {furnitureTypes.map((furniture) => (
                        <SelectItem key={furniture.value} value={furniture.value}>
                          {furniture.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Number of Passengers for Transport */}
              {(activityType.startsWith('transport-') && 
                !['transport-bicycle', 'transport-walking'].includes(activityType)) && (
                <div>
                  <Label className="text-sm sm:text-base">Total Passengers</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(e.target.value);
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) {
                        setPassengers('1');
                      }
                    }}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Impact will be calculated per person based on total passengers
                  </p>
                </div>
              )}

              {/* Date */}
              <div>
                <Label className="text-sm sm:text-base">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal text-sm sm:text-base",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Choose activity date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Calculate Button */}
              <Button
                onClick={calculateEmissionsPreview}
                disabled={isCalculating || !isFormValid()}
                className="w-full btn-hero text-sm sm:text-base"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Impact
                  </>
                )}
              </Button>

              {/* Results */}
              {showResult && (
                <div className="p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-muted-foreground">Environmental Impact</div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {calculatedEmissions.toFixed(2)} kg CO₂
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Carbon dioxide equivalent</div>
                  </div>
                  <Button className="w-full mt-3 btn-hero text-sm sm:text-base" onClick={handleAddToLog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to My Timeline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Your environmental impact journey - every activity counts</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Activities
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && displayLogs.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading activities...</p>
                </div>
              ) : displayLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Your journey starts here!</p>
                  <p className="text-sm text-muted-foreground mt-1">Log your first activity to begin tracking your environmental impact</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {displayLogs.map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-border/50 rounded-lg hover:bg-accent/20 transition-colors hover-lift group"
                      >
                        <div className="p-2 sm:p-3 bg-accent/20 rounded-lg">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm sm:text-base">{entry.activity}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {entry.amount} {entry.unit} • {entry.date}
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1 text-xs capitalize">
                            {entry.type}
                          </Badge>
                          <div className="text-base sm:text-lg font-bold text-foreground">
                            +{entry.co2.toFixed(2)} kg
                          </div>
                          <div className="text-xs text-muted-foreground">CO₂</div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLog(entry.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ChatBot />
    </div>
  );
};

export default function FootprintLogPage() {
  return (
    <ProtectedLayout>
      <FootprintLog />
    </ProtectedLayout>
  );
}
