"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ACTIVITY_TYPES,
  FUEL_TYPES,
  FLIGHT_CLASSES,
  ENERGY_SOURCES,
  FOOD_TYPES,
  WASTE_TYPES,
  WATER_TEMPERATURES,
  CLOTHING_TYPES,
  ELECTRONICS_TYPES,
  FURNITURE_TYPES,
} from "@/config/footprintConfig";
import {
  Car,
  Home,
  Utensils,
  Plus,
  Calculator,
  Calendar as CalendarIcon,
  TrendingDown,
  Filter,
  Clock,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Plane,
  Zap,
  Bike,
  Fuel,
  Flame,
  ShoppingCart,
  Factory,
  Droplets,
  Bus,
  Milk,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";

import AuthGuard from "@/components/AuthGuard";
import ChatBot from "@/components/ChatBot";
import Layout from "@/components/Layout";
import { useFootprintLog } from "@/lib/useFootprintLog";
import { useTranslation } from "@/context/PreferencesContext";
import Link from "next/link";

const FootprintLog = () => {
  const { t } = useTranslation(["footprint", "common"]);

  // Use the custom hook for API operations
  const {
    logs,
    totalEmissions,
    loading,
    error,
    createLog,
    updateLog,
    calculateEmissions,
    calculateEmissionsWithAPI,
    getWeeklyTotal,
    getMonthlyTotal,
    refresh,
  } = useFootprintLog();

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityType, setActivityType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calculatedEmissions, setCalculatedEmissions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Check if a date is valid (today or in the past)
  const isDateValid = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    return date <= today;
  };

  // Additional details based on activity type
  const [fuelType, setFuelType] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [flightClass, setFlightClass] = useState("");
  const [energySource, setEnergySource] = useState("");
  const [foodType, setFoodType] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [clothingType, setClothingType] = useState("");
  const [electronicsType, setElectronicsType] = useState("");
  const [furnitureType, setFurnitureType] = useState("");
  // Search state for activity type dropdown
  const [activitySearch, setActivitySearch] = useState("");

  // Validation constraints for different activity types
  const getActivityConstraints = (activityType) => {
    const constraints = {
      // Transportation (per day)
  "transport-car": { min: 0, max: 1000, unit: "km", message: "Daily car travel should be between 0-1000 km" },
      "transport-bus": { min: 0, max: 500, unit: "km", message: "Daily bus travel should be between 0-500 km" },
      "transport-train": { min: 0, max: 2000, unit: "km", message: "Daily train travel should be between 0-2000 km" },
      "transport-subway": { min: 0, max: 100, unit: "km", message: "Daily subway travel should be between 0-100 km" },
      "transport-taxi": { min: 0, max: 200, unit: "km", message: "Daily taxi travel should be between 0-200 km" },
      "transport-motorcycle": { min: 0, max: 800, unit: "km", message: "Daily motorcycle travel should be between 0-800 km" },
      "transport-flight": { min: 0, max: 20000, unit: "km", message: "Flight distance should be between 0-20,000 km" },
      "transport-ferry": { min: 0, max: 1000, unit: "km", message: "Ferry travel should be between 0-1000 km" },
      "transport-bicycle": { min: 0, max: 160, unit: "km", message: "Daily bicycle travel should be between 0-160 km" },
      "transport-walking": { min: 0, max: 32, unit: "km", message: "Daily walking distance should be between 0-32 km" },
      
      // Energy (per day)
      "energy-electricity": { min: 0, max: 100, unit: "kWh", message: "Daily electricity usage should be between 0-100 kWh" },
      "energy-gas": { min: 0, max: 20, unit: "therms", message: "Daily gas usage should be between 0-20 therms" },
      "energy-heating-oil": { min: 0, max: 190, unit: "liters", message: "Daily heating oil should be between 0-190 liters" },
      "energy-propane": { min: 0, max: 115, unit: "liters", message: "Daily propane usage should be between 0-115 liters" },
      "energy-coal": { min: 0, max: 90, unit: "kg", message: "Daily coal usage should be between 0-90 kg" },
      "energy-wood": { min: 0, max: 23, unit: "kg", message: "Daily wood usage should be between 0-23 kg" },
      
      // Food (per day)
      "food-beef": { min: 0, max: 2.3, unit: "kg", message: "Daily beef consumption should be between 0-2.3 kg" },
      "food-pork": { min: 0, max: 1.4, unit: "kg", message: "Daily pork consumption should be between 0-1.4 kg" },
      "food-chicken": { min: 0, max: 0.9, unit: "kg", message: "Daily chicken consumption should be between 0-0.9 kg" },
      "food-fish": { min: 0, max: 0.9, unit: "kg", message: "Daily fish consumption should be between 0-0.9 kg" },
      "food-dairy": { min: 0, max: 3, unit: "servings", message: "Daily dairy should be between 0-3 servings" },
      "food-eggs": { min: 0, max: 12, unit: "eggs", message: "Daily eggs should be between 0-12 eggs" },
      "food-rice": { min: 0, max: 2, unit: "cups", message: "Daily rice should be between 0-2 cups" },
      "food-vegetables": { min: 0, max: 10, unit: "servings", message: "Daily vegetables should be between 0-10 servings" },
      "food-fruits": { min: 0, max: 10, unit: "servings", message: "Daily fruits should be between 0-10 servings" },
      
      // Waste (per day)
      "waste-general": { min: 0, max: 9, unit: "kg", message: "Daily general waste should be between 0-9 kg" },
      "waste-recycling": { min: 0, max: 4.5, unit: "kg", message: "Daily recycling should be between 0-4.5 kg" },
      "waste-compost": { min: 0, max: 4.5, unit: "kg", message: "Daily compost should be between 0-4.5 kg" },
      
      // Water (per day)
      "water-usage": { min: 0, max: 1900, unit: "liters", message: "Daily water usage should be between 0-1900 liters" },
      "water-shower": { min: 0, max: 60, unit: "minutes", message: "Daily shower time should be between 0-60 minutes" },
      "water-dishwasher": { min: 0, max: 5, unit: "loads", message: "Daily dishwasher loads should be between 0-5" },
      "water-laundry": { min: 0, max: 3, unit: "loads", message: "Daily laundry loads should be between 0-3" },
      
      // Shopping (reasonable daily amounts)
      "shopping-clothing": { min: 0, max: 10, unit: "items", message: "Daily clothing items should be between 0-10" },
      "shopping-electronics": { min: 0, max: 3, unit: "items", message: "Daily electronics should be between 0-3 items" },
      "shopping-books": { min: 0, max: 20, unit: "books", message: "Daily books should be between 0-20" },
      "shopping-furniture": { min: 0, max: 5, unit: "items", message: "Daily furniture items should be between 0-5" },
    };
    
    return constraints[activityType] || { min: 0, max: 1000, unit: "", message: "Please enter a reasonable value" };
  };

  // Validate quantity based on activity type
  const validateQuantity = (activityType, quantity) => {
    const constraints = getActivityConstraints(activityType);
    const numQuantity = parseFloat(quantity);
    
    if (isNaN(numQuantity)) {
      return { valid: false, message: "Please enter a valid number" };
    }
    
    if (numQuantity < constraints.min) {
      return { valid: false, message: `Minimum value is ${constraints.min} ${constraints.unit}` };
    }
    
    if (numQuantity > constraints.max) {
      return { valid: false, message: constraints.message };
    }
    
    return { valid: true, message: "" };
  };

  // Validate daily aggregate for activity type
  const validateDailyAggregate = (activityType, newQuantity, targetDate = selectedDate) => {
    const constraints = getActivityConstraints(activityType);
    const newNumQuantity = parseFloat(newQuantity);
    
    if (isNaN(newNumQuantity)) {
      return { valid: false, message: "Please enter a valid number" };
    }

    // Get the base activity type (e.g., "transport-car" -> "transport-car")
    const baseActivityType = activityType;
    
    // Filter logs for the same day and same activity type
    const targetDateStr = targetDate.toDateString();
    const sameDayLogs = logs.filter(log => {
      const logDate = new Date(log.selectedDate || log.createdAt);
      return logDate.toDateString() === targetDateStr && log.activityType === baseActivityType;
    });

    // Calculate current total for this activity type on this day
    const currentDayTotal = sameDayLogs.reduce((total, log) => {
      return total + (parseFloat(log.quantity) || 0);
    }, 0);

    // Check if adding the new quantity would exceed daily limit
    const newDayTotal = currentDayTotal + newNumQuantity;
    const dailyLimit = constraints.max;

    if (newDayTotal > dailyLimit) {
      const remaining = Math.max(0, dailyLimit - currentDayTotal);
      return { 
        valid: false, 
        message: `Daily limit exceeded! You've already logged ${currentDayTotal.toFixed(1)} ${constraints.unit} of ${activityType.replace(/-/g, ' ')} today. Maximum daily limit is ${dailyLimit} ${constraints.unit}. You can add up to ${remaining.toFixed(1)} ${constraints.unit} more.`
      };
    }

    return { valid: true, message: "" };
  };

  // Import activity types and options from configuration
  const activityTypes = ACTIVITY_TYPES;
  const fuelTypes = FUEL_TYPES;
  const flightClasses = FLIGHT_CLASSES;
  const energySources = ENERGY_SOURCES;
  const foodTypes = FOOD_TYPES;
  const wasteTypes = WASTE_TYPES;
  const waterTemperatures = WATER_TEMPERATURES;
  const clothingTypes = CLOTHING_TYPES;
  const electronicsTypes = ELECTRONICS_TYPES;
  const furnitureTypes = FURNITURE_TYPES;

  // Helper function to get dynamic field label based on activity type
  const getQuantityLabel = () => {
    if (!activityType) return "Quantity";

    const selectedActivity = activityTypes.find(
      (type) => type.value === activityType
    );
    if (!selectedActivity) return "Quantity";

    const unit = selectedActivity.unit;

    // Create contextual labels based on activity category and unit
    switch (selectedActivity.category) {
      case "Transportation":
        if (unit === "km") return "Distance (km)";
        if (unit === "kg") return "Weight";
        if (unit === "liters") return "Volume";
        return "Quantity";

      case "Energy":
        if (unit === "kWh") return "Energy Usage";
        if (unit === "therms") return "Gas Usage";
        if (unit === "gallons") return "Fuel Amount";
        if (unit === "lbs") return "Weight";
        if (unit === "cords") return "Wood Amount";
        return "Quantity";

      case "Food":
        if (unit === "lbs") return "Weight";
        if (unit === "dozen") return "Number of Dozens";
        return "Amount";

      case "Waste":
        if (unit === "lbs") return "Weight";
        return "Amount";

      case "Water":
        if (unit === "gallons") return "Water Volume";
        if (unit === "minutes") return "Duration";
        if (unit === "loads") return "Number of Loads";
        return "Amount";

      case "Shopping":
        if (unit === "items") return "Number of Items";
        return "Quantity";

      default:
        return "Quantity";
    }
  };

  // Helper function to get placeholder text based on activity type
  const getQuantityPlaceholder = () => {
    if (!activityType) return "0";

    const selectedActivity = activityTypes.find(
      (type) => type.value === activityType
    );
    if (!selectedActivity) return "0";

    const unit = selectedActivity.unit;

    switch (selectedActivity.category) {
      case "Transportation":
        if (unit === "km") return "Enter distance (km)";
        if (unit === "kg") return "Enter weight";
        if (unit === "liters") return "Enter volume";
        return "Enter quantity";

      case "Energy":
        if (unit === "kWh") return "Enter kWh used";
        if (unit === "therms") return "Enter therms used";
        if (unit === "gallons") return "Enter gallons used";
        return "Enter amount";

      case "Food":
        return unit === "dozen" ? "Enter dozens" : "Enter weight in lbs";

      case "Waste":
        return "Enter weight in lbs";

      case "Water":
        if (unit === "minutes") return "Enter minutes";
        if (unit === "loads") return "Enter number";
        return "Enter gallons";

      case "Shopping":
        return "Enter number of items";

      default:
        return "Enter amount";
    }
  };

  // Helper function to check if all required fields are filled
  const isFormValid = () => {
    if (!activityType || !quantity) return false;

    const selectedActivity = activityTypes.find(
      (type) => type.value === activityType
    );
    if (!selectedActivity) return false;

    // Check required fields based on activity type
    if (selectedActivity.requiresFuelType && !fuelType) return false;
    if (selectedActivity.requiresFlightClass && !flightClass) return false;
    if (selectedActivity.requiresEnergySource && !energySource) return false;
    if (selectedActivity.requiresFoodType && !foodType) return false;
    if (selectedActivity.requiresWasteType && !wasteType) return false;
    if (selectedActivity.requiresWaterTemp && !waterTemp) return false;
    if (selectedActivity.requiresClothingType && !clothingType) return false;
    if (selectedActivity.requiresElectronicsType && !electronicsType)
      return false;
    if (selectedActivity.requiresFurnitureType && !furnitureType) return false;

    return true;
  };

  // Calculate emissions preview (using backend API)
  const calculateEmissionsPreview = async () => {
    const selectedActivity = activityTypes.find(
      (type) => type.value === activityType
    );
    if (selectedActivity && quantity) {
      // Validate quantity before proceeding
      const validation = validateQuantity(activityType, quantity);
      if (!validation.valid) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {validation.message}
          </div>
        );
        return;
      }

      // Validate daily aggregate
      const dailyValidation = validateDailyAggregate(activityType, quantity, selectedDate);
      if (!dailyValidation.valid) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <div className="font-semibold">Daily Limit Exceeded</div>
              <div className="text-sm">{dailyValidation.message}</div>
            </div>
          </div>
        );
        return;
      }

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
            unit: selectedActivity.unit,
          },
        };

        const result = await calculateEmissionsWithAPI(activityData);
        setCalculatedEmissions(result.emission);
        setShowResult(true);

        // Show success message with calculation method
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Impact calculated successfully using{" "}
            {result.calculation?.method || "backend"} method
          </div>
        );
      } catch (error) {
        console.error("Failed to calculate emissions:", error);
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
            unit: selectedActivity.unit,
          },
        });
        setCalculatedEmissions(fallbackEmissions);
        setShowResult(true);
        toast.error(
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Backend calculation failed, using offline calculation method
          </div>
        );
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const getSelectedActivityDetails = () => {
    return activityTypes.find((type) => type.value === activityType);
  };

  // Add handler for Add to Log with API integration
  const handleAddToLog = async () => {
    const selectedActivity = activityTypes.find(
      (type) => type.value === activityType
    );
    if (!selectedActivity || !quantity) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Please fill in all required fields to calculate impact
        </div>
      );
      return;
    }

    // Validate quantity before proceeding
    const validation = validateQuantity(activityType, quantity);
    if (!validation.valid) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {validation.message}
        </div>
      );
      return;
    }

    // Validate daily aggregate
    const dailyValidation = validateDailyAggregate(activityType, quantity, selectedDate);
    if (!dailyValidation.valid) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <div className="font-semibold">Daily Limit Exceeded</div>
            <div className="text-sm">{dailyValidation.message}</div>
          </div>
        </div>
      );
      return;
    }

    try {
      // Create detailed activity description
      let activityDescription = selectedActivity.label;

      // Enhanced activity descriptions based on specific fields
      if (activityType.startsWith("transport-")) {
        if (fuelType) {
          const fuelLabel = fuelTypes.find((f) => f.value === fuelType)?.label;
          activityDescription = `${fuelLabel} ${selectedActivity.label}`;
        }
        if (flightClass) {
          const classLabel = flightClasses.find(
            (f) => f.value === flightClass
          )?.label;
          activityDescription = `${classLabel} ${selectedActivity.label}`;
        }
      } else if (activityType.startsWith("energy-")) {
        if (energySource) {
          const sourceLabel = energySources.find(
            (e) => e.value === energySource
          )?.label;
          activityDescription = `${sourceLabel} Usage`;
        }
      } else if (activityType.startsWith("food-")) {
        if (foodType) {
          const foodLabel = foodTypes.find((f) => f.value === foodType)?.label;
          activityDescription = `${foodLabel} Consumption`;
        }
      } else if (activityType.startsWith("waste-")) {
        if (wasteType) {
          const wasteLabel = wasteTypes.find(
            (w) => w.value === wasteType
          )?.label;
          activityDescription = `${wasteLabel} ${selectedActivity.label}`;
        }
      } else if (activityType.startsWith("shopping-")) {
        if (clothingType) {
          const clothingLabel = clothingTypes.find(
            (c) => c.value === clothingType
          )?.label;
          activityDescription = `${clothingLabel} Purchase`;
        } else if (electronicsType) {
          const electronicsLabel = electronicsTypes.find(
            (e) => e.value === electronicsType
          )?.label;
          activityDescription = `${electronicsLabel} Purchase`;
        } else if (furnitureType) {
          const furnitureLabel = furnitureTypes.find(
            (f) => f.value === furnitureType
          )?.label;
          activityDescription = `${furnitureLabel} Purchase`;
        }
      }

      // Prepare comprehensive log data for API
      const logData = {
        activityType,
        quantity,
        selectedDate,
        activity: activityDescription,
        emission: calculatedEmissions, // Include the calculated emission
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
          unit: selectedActivity.unit,
          category: selectedActivity.category,
        },
      };

      // Submit to API
      await createLog(logData);

      // Refresh the logs to show the new entry immediately
      await refresh();

      // Reset form
      setShowResult(false);
      setActivityType("");
      setQuantity("");
      setFuelType("");
      setPassengers("1");
      setFlightClass("");
      setEnergySource("");
      setFoodType("");
      setWasteType("");
      setWaterTemp("");
      setClothingType("");
      setElectronicsType("");
      setFurnitureType("");
      setSelectedDate(new Date());
    } catch (error) {
      console.error("Failed to add log:", error);
      toast.error(`Failed to add activity: ${error.message}`);
    }
  };

  // Format log for display
  const formatLogForDisplay = (log) => {
    // Comprehensive icon map matching dashboard
    const iconMap = {
      transport: Car,
      car: Car,
      bus: Bus,
      motorcycle: Bike,
      bike: Bike,
      flight: Plane,
      plane: Plane,
      energy: Zap,
      electricity: Zap,
      home: Home,
      housing: Home,
      food: Utensils,
      dairy: Milk,
      waste: Trash2,
      shopping: ShoppingCart,
      other: Clock,
      fuel: Fuel,
      heating: Flame,
      manufacturing: Factory,
      water: Droplets,
      "water usage": Droplets,
      // Specific activity types
      "transport-car": Car,
      "transport-bus": Bus,
      "transport-train": Bike,
      "transport-subway": Bike,
      "transport-taxi": Car,
      "transport-motorcycle": Bike,
      "transport-flight": Plane,
      "transport-ferry": Bus,
      "transport-bicycle": Bike,
      "transport-walking": Clock,
      "energy-electricity": Zap,
      "energy-gas": Flame,
      "energy-heating-oil": Fuel,
      "energy-propane": Fuel,
      "energy-coal": Factory,
      "energy-wood": Flame,
      "food-beef": Utensils,
      "food-pork": Utensils,
      "food-chicken": Utensils,
      "food-fish": Utensils,
      "food-dairy": Milk,
      "food-eggs": Utensils,
      "food-rice": Utensils,
      "food-vegetables": Utensils,
      "food-fruits": Utensils,
      "waste-general": Trash2,
      "waste-recycling": Trash2,
      "waste-compost": Trash2,
      "water-usage": Droplets,
      "water-shower": Droplets,
      "water-dishwasher": Droplets,
      "water-laundry": Droplets,
      "shopping-clothing": ShoppingCart,
      "shopping-electronics": ShoppingCart,
      "shopping-books": ShoppingCart,
      "shopping-furniture": ShoppingCart,
    };

    // Function to find the best matching icon
    const findBestMatch = (key) => {
      if (!key) return Clock;
      
      const normalizedKey = key.toLowerCase();
      
      // Direct match
      if (iconMap[normalizedKey]) return iconMap[normalizedKey];
      
      // Specific pattern matches
      if (normalizedKey.includes('dairy') || normalizedKey.includes('milk')) return Milk;
      if (normalizedKey.includes('motor') || normalizedKey.includes('bike')) return Bike;
      if (normalizedKey.includes('bus') || normalizedKey.includes('public transport')) return Bus;
      if (normalizedKey.includes('water') || normalizedKey.includes('h2o')) return Droplets;
      if (normalizedKey.includes('electric') || normalizedKey.includes('power')) return Zap;
      if (normalizedKey.includes('car') || normalizedKey.includes('vehicle')) return Car;
      if (normalizedKey.includes('flight') || normalizedKey.includes('airplane')) return Plane;
      if (normalizedKey.includes('home') || normalizedKey.includes('house')) return Home;
      if (normalizedKey.includes('food') || normalizedKey.includes('eat')) return Utensils;
      if (normalizedKey.includes('waste') || normalizedKey.includes('trash')) return Trash2;
      if (normalizedKey.includes('shop')) return ShoppingCart;
      if (normalizedKey.includes('fuel') || normalizedKey.includes('gas')) return Fuel;
      if (normalizedKey.includes('heat')) return Flame;
      
      // Default fallback
      return Clock;
    };

    // Handle date formatting with validation
    let formattedDate = "Invalid Date";
    try {
      const dateValue =
        log.createdAt || log.date || log.selectedDate || new Date();
      const dateObj = new Date(dateValue);

      // Check if date is valid
      if (!isNaN(dateObj.getTime())) {
        formattedDate = format(dateObj, "yyyy-MM-dd");
      } else {
        // Fallback to current date if invalid
        formattedDate = format(new Date(), "yyyy-MM-dd");
      }
    } catch (error) {
      console.warn("Date formatting error:", error, "for log:", log);
      formattedDate = format(new Date(), "yyyy-MM-dd");
    }

    // Get the correct unit from the activity type config
    const activityConfig = activityTypes.find(type => type.value === log.activityType);
    const correctUnit = activityConfig?.unit || log.details?.unit || "units";
    
    return {
      id: log._id,
      date: formattedDate,
      activity: log.activity,
      type: log.category || log.activityType,
      amount: log.details?.quantity || log.quantity || 0,
      unit: correctUnit,
      co2: log.emission || 0,
      icon: findBestMatch(log.activityType),
      rawLog: log,
    };
  };

  // Get formatted logs for display
  const displayLogs = (logs || [])
    .filter((log) => log && log._id)
    .map(formatLogForDisplay);

  // Calculate weekly and monthly totals
  const weeklyTotal = getWeeklyTotal();
  const monthlyTotal = getMonthlyTotal();
  const averageDaily = weeklyTotal / 7;

  return (
  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      <Toaster position="top-right" />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading footprint logs: {error}</p>
          <Button onClick={refresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
            {t("footprint:carbon_footprint_log")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("footprint:monitor_environmental_impact")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/CarbonCalculator">
            <Button variant="default" size="sm" className="shrink-0">
              <Calculator className="h-4 w-4 mr-2" />
              {t("footprint:full_assessment")}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t("footprint:refresh")}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("footprint:this_week")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {weeklyTotal.toFixed(1)}{" "}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                kg CO₂
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
              <span className="text-xs sm:text-sm text-success">
                8% lower than last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("footprint:total_entries")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {logs.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              {t("footprint:activities_logged")}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("footprint:average_daily")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {averageDaily.toFixed(1)}{" "}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                kg CO₂
              </span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              {t("footprint:per_day_this_week")}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("footprint:total_emissions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {totalEmissions.toFixed(1)}{" "}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                kg CO₂
              </span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              All time
            </div>
          </CardContent>
        </Card>
      </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Activity Form */}
        <div className="lg:col-span-1">
          <Card className="card-gradient">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t("footprint:log_new_activity")}
              </CardTitle>
              <CardDescription>
                {t("footprint:record_daily_activities")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Activity Type */}
              <div>
                <Label className="text-sm sm:text-base">
                  {t("footprint:activity_type")}
                </Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={t("footprint:choose_activity_type")}
                    />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-96 overflow-hidden p-0 focus:outline-none"
                  >
                    {/* Search box (does not close the select) */}
                    <div className="sticky top-0 z-10 bg-popover p-2 pb-2 border-b border-border">
                      <Input
                        autoFocus
                        value={activitySearch}
                        onChange={(e) => setActivitySearch(e.target.value)}
                        placeholder={
                          t("footprint:search_activity") || "Search activity..."
                        }
                        className="h-8 text-xs"
                      />
                      {activitySearch && (
                        <div className="mt-1 text-[10px] text-muted-foreground flex justify-between">
                          <span>
                            {t("footprint:searching_for") || "Searching for"}: "
                            {activitySearch}"
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivitySearch("")}
                            className="text-primary hover:underline"
                          >
                            {t("common:clear") || "Clear"}
                          </button>
                        </div>
                      )}
                    </div>
                    {(() => {
                      const filtered = activityTypes.filter((type) => {
                        if (!activitySearch.trim()) return true;
                        const q = activitySearch.toLowerCase();
                        return (
                          type.label.toLowerCase().includes(q) ||
                          type.category.toLowerCase().includes(q) ||
                          type.value.toLowerCase().includes(q)
                        );
                      });
                      const categories = [
                        "Transportation",
                        "Energy",
                        "Food",
                        "Waste",
                        "Water",
                        "Shopping",
                      ];
                      return (
                        <div
                          className="overflow-y-auto overscroll-contain scroll-py-2 flex-1"
                          style={{ 
                            WebkitOverflowScrolling: "touch",
                            maxHeight: "calc(24rem - 80px)" // Subtract search box height
                          }}
                          onWheel={(e) => {
                            // Prevent page scroll when dropdown is scrolling
                            e.stopPropagation();
                            const target = e.currentTarget;
                            const { scrollTop, scrollHeight, clientHeight } = target;
                            
                            // Only prevent default if we're not at the boundaries
                            if (
                              (e.deltaY < 0 && scrollTop > 0) || // Scrolling up and not at top
                              (e.deltaY > 0 && scrollTop < scrollHeight - clientHeight) // Scrolling down and not at bottom
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {filtered.length === 0 && (
                            <div className="px-3 py-4 text-xs text-muted-foreground">
                              {t("footprint:no_results_found") ||
                                "No results found"}
                            </div>
                          )}
                          {categories.map((category) => {
                            const categoryActivities = filtered.filter(
                              (t) => t.category === category
                            );
                            if (categoryActivities.length === 0) return null;
                            return (
                              <div key={category}>
                                <div className="px-2 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-popover/80 backdrop-blur supports-[backdrop-filter]:bg-popover/60 sticky top-0">
                                  {category}
                                </div>
                                {categoryActivities.map((type) => {
                                  const Icon = type.icon;
                                  return (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                      className="text-xs py-1.5"
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                          {type.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                          ({type.unit})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity and Unit */}
              {activityType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm sm:text-base">
                      {getQuantityLabel()}
                    </Label>
                    <Input
                      type="number"
                      placeholder={getQuantityPlaceholder()}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={cn(
                        "mt-1",
                        quantity && activityType && !validateQuantity(activityType, quantity).valid 
                          ? "border-red-500 focus:border-red-500" 
                          : ""
                      )}
                    />
                    {activityType && (
                      <div className="space-y-1 mt-1">
                        <p className="text-xs text-gray-500">
                          Max: {getActivityConstraints(activityType).max} {getActivityConstraints(activityType).unit}
                        </p>
                        {(() => {
                          // Calculate daily usage for this activity type
                          const targetDateStr = selectedDate.toDateString();
                          const sameDayLogs = logs.filter(log => {
                            const logDate = new Date(log.selectedDate || log.createdAt);
                            return logDate.toDateString() === targetDateStr && log.activityType === activityType;
                          });
                          const dailyUsed = sameDayLogs.reduce((total, log) => total + (parseFloat(log.quantity) || 0), 0);
                          const constraints = getActivityConstraints(activityType);
                          const remaining = Math.max(0, constraints.max - dailyUsed);
                          
                          if (dailyUsed > 0) {
                            return (
                              <p className="text-xs text-blue-600">
                                Today's usage: {dailyUsed.toFixed(1)} {constraints.unit} 
                                ({remaining.toFixed(1)} {constraints.unit} remaining)
                              </p>
                            );
                          }
                          return null;
                        })()}
                        {quantity && !validateQuantity(activityType, quantity).valid && (
                          <p className="text-xs text-red-500">
                            {validateQuantity(activityType, quantity).message}
                          </p>
                        )}
                        {quantity && validateQuantity(activityType, quantity).valid && !validateDailyAggregate(activityType, quantity, selectedDate).valid && (
                          <p className="text-xs text-red-500">
                            {validateDailyAggregate(activityType, quantity, selectedDate).message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Unit</Label>
                    <Input
                      value={getSelectedActivityDetails()?.unit || ""}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                </div>
              )}

              {/* Fuel Type for Car/Motorcycle/Taxi Travel */}
              {(activityType === "transport-car" ||
                activityType === "transport-motorcycle" ||
                activityType === "transport-taxi") && (
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
              {activityType === "transport-flight" && (
                <div>
                  <Label className="text-sm sm:text-base">Flight Class</Label>
                  <Select value={flightClass} onValueChange={setFlightClass}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select flight class" />
                    </SelectTrigger>
                    <SelectContent>
                      {flightClasses.map((classType) => (
                        <SelectItem
                          key={classType.value}
                          value={classType.value}
                        >
                          {classType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Energy Source for Electricity */}
              {activityType === "energy-electricity" && (
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
              {(activityType === "food-beef" ||
                activityType === "food-pork" ||
                activityType === "food-chicken" ||
                activityType === "food-fish" ||
                activityType === "food-dairy") && (
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
              {(activityType === "waste-general" ||
                activityType === "waste-recycling") && (
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
              {activityType === "water-laundry" && (
                <div>
                  <Label className="text-sm sm:text-base">
                    Water Temperature
                  </Label>
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
              {activityType === "shopping-clothing" && (
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
              {activityType === "shopping-electronics" && (
                <div>
                  <Label className="text-sm sm:text-base">
                    Electronics Type
                  </Label>
                  <Select
                    value={electronicsType}
                    onValueChange={setElectronicsType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select electronics type" />
                    </SelectTrigger>
                    <SelectContent>
                      {electronicsTypes.map((electronics) => (
                        <SelectItem
                          key={electronics.value}
                          value={electronics.value}
                        >
                          {electronics.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Furniture Type for Furniture Purchases */}
              {activityType === "shopping-furniture" && (
                <div>
                  <Label className="text-sm sm:text-base">Furniture Type</Label>
                  <Select
                    value={furnitureType}
                    onValueChange={setFurnitureType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select furniture type" />
                    </SelectTrigger>
                    <SelectContent>
                      {furnitureTypes.map((furniture) => (
                        <SelectItem
                          key={furniture.value}
                          value={furniture.value}
                        >
                          {furniture.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Number of Passengers for Transport */}
              {activityType.startsWith("transport-") &&
                !["transport-bicycle", "transport-walking"].includes(
                  activityType
                ) && (
                  <div>
                    <Label className="text-sm sm:text-base">
                      Total Passengers
                    </Label>
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
                          setPassengers("1");
                        }
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Impact will be calculated per person based on total
                      passengers
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
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Choose activity date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (isDateValid(date)) {
                          setSelectedDate(date);
                        }
                      }}
                      disabled={(date) => !isDateValid(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  You can only log activities for today or past dates
                </p>
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
                    {t("footprint:calculate_impact")}
                  </>
                )}
              </Button>

              {/* Results */}
              {showResult && (
                <div className="p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Environmental Impact
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {calculatedEmissions.toFixed(2)} kg CO₂
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Carbon dioxide equivalent
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 btn-hero text-sm sm:text-base"
                    onClick={handleAddToLog}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to My Timeline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2 lg:h-full lg:flex lg:flex-col">
          <Card className="card-gradient lg:h-full lg:flex lg:flex-col">
            <CardHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    {t("footprint:activity_timeline")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm md:text-sm lg:text-base">
                    {t("footprint:environmental_impact_journey")}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded-md border">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    Once logged, activities become permanent records and cannot be deleted
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:bg-primary/10 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t("footprint:filter_activities")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="lg:flex-1 lg:overflow-y-auto lg:pr-2 custom-scroll">
              {loading && displayLogs.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t("footprint:loading_activities")}
                  </p>
                </div>
              ) : displayLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t("footprint:journey_starts_here")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Log your first activity to begin tracking your environmental
                    impact
                  </p>
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
                          <div className="font-medium text-foreground text-sm sm:text-base">
                            {entry.activity}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {entry.amount} {entry.unit} • {entry.date}
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className="mb-1 text-xs capitalize"
                          >
                            {entry.type}
                          </Badge>
                          <div className="text-base sm:text-lg font-bold text-foreground">
                            {entry.co2.toFixed(2)} kg
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CO₂
                          </div>
                        </div>

                        {/* Delete functionality removed - logs are permanent once added */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          {/* Delete button removed to prevent log deletion */}
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
    <AuthGuard intent="footprintlog">
      <Layout>
        <FootprintLog />
      </Layout>
    </AuthGuard>
  );
}
