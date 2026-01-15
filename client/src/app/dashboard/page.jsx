"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FALLBACK_EMISSIONS_BREAKDOWN,
  ACHIEVEMENT_TYPES,
  formatRecentActivities,
  calculateAchievements,
} from "@/config/dashboardConfig";

import {
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Zap,
  Users,
  Calendar,
  Car,
  Home,
  Utensils,
  Plane,
  Award,
  Leaf,
  BarChart3,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  Flame,
  Bike,
  Fuel,
  Trash2,
  ShoppingCart,
  Factory,
  Droplets,
  Bus,
  Milk,
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import ProfessionalProgress from "@/components/ProfessionalProgress";
import AnimatedCircularProgress from "@/components/AnimatedCircularProgress";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import "react-circular-progressbar/dist/styles.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { usePreferences, useTranslation } from "@/context/PreferencesContext";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Calendar as CustomCalendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useFootprintLog } from "@/lib/useFootprintLog";
import useStreak from "@/hooks/useStreak";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL, goalsAPI } from "@/lib/api";
import ProtectedLayout from "@/components/ProtectedLayout";
import AuthGuard from "@/components/AuthGuard";
import ChatBot from "@/components/ChatBot";
import Layout from "@/components/Layout";

const Dashboard = () => {
  const { t } = useTranslation(["dashboard", "common"]);
  const { preferences } = usePreferences();
  const { user, isLoading } = useUser();
  const [greetingKey, setGreetingKey] = useState("greeting_morning"); // Default fallback
  const [date, setDate] = useState(new Date());
  const [userGoals, setUserGoals] = useState(null);

  const currencySymbols = {
    usd: "$",
    eur: "€",
    inr: "₹",
  };

  const currency = currencySymbols[preferences.currency] || "$";
  // General units removed; only carbonUnits retained elsewhere

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "greeting_morning";
    if (hour < 18) return "greeting_afternoon";
    return "greeting_evening";
  };

  // Footprint log integration - Real API data replacing mock data
  const {
    totalEmissions,
    weeklyEmissions,
    monthlyEmissions,
    recentActivities,
    logs,
    breakdownData,
    equivalents,
    getWeeklyTotal,
    getMonthlyTotal,
    loading: footprintLoading,
  } = useFootprintLog();

  // Streak data integration
  const {
    streakData,
    loading: streakLoading,
    getStreakCalendar,
    getTodayStatus,
    refreshStreak
  } = useStreak();

  // Fetch user goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const result = await goalsAPI.getGoals();
        if (result.success && result.goals) {
          setUserGoals(result.goals);
        }
      } catch (error) {
        console.error('Failed to fetch user goals:', error);
        // Use default goals on error
        setUserGoals({
          monthlyFootprintTarget: 2000,
          dailyFootprintTarget: 2.0,
          monthlyOffsetTarget: 100,
          monthlyActivityTarget: 75
        });
      }
    };
    
    if (user) {
      fetchGoals();
    }
  }, [user]);

  // Refresh streak when logs change (new log added)
  useEffect(() => {
    if (logs.length > 0) {
      refreshStreak();
    }
  }, [logs.length]);

  // AI Tips from Gemini (must be declared before any early returns)
  const [tips, setTips] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/generate-tips`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ electricity: 200, gas: 15, petrol: 30 }),
        });
        const data = await res.json();
        if (Array.isArray(data?.tips)) setTips(data.tips);
      } catch {}
    })();
  }, []);

  // Helper function to format emissions display
  const formatEmissions = (valueKg) => {
    if (!valueKg || valueKg === 0) return "0";
    const useTons = (preferences.carbonUnits || "kg") === "tons";
    const val = useTons ? valueKg / 1000 : valueKg; // 1000 kg in 1 metric ton
    if (val < 0.1) return "<0.1";
    return val.toFixed(1);
  };

  // Handle client-side tasks
  useEffect(() => {
    // Set the correct greeting when component mounts
    setGreetingKey(getGreetingKey());
  }, []);

  if (isLoading || footprintLoading || streakLoading) {
    return <DashboardSkeleton />;
  }

  // Ensure user is authenticated before rendering dashboard content
  if (!user) {
    return null; // AuthGuard will handle the redirect
  }

  const isAuthenticated = !!user;
  const name =
    user?.name && typeof user.name === "string" ? user.name : "Guest";

  // Calculate real-time metrics from API data with safety checks
  // API returns emissions in kg, so we need to convert based on user preference
  const currentFootprint =
    preferences.carbonUnits === "tons"
      ? (monthlyEmissions || 0) / 1000  // Convert kg to tons
      : (monthlyEmissions || 0);        // Keep in kg
  
  // Use user's custom goals or defaults
  const defaultTargetKg = userGoals?.monthlyFootprintTarget || 2000;
  const defaultTargetTons = userGoals?.dailyFootprintTarget || 2.0;
  const targetFootprint = preferences.carbonUnits === "tons" ? defaultTargetTons : defaultTargetKg;
  const goalProgress =
    isAuthenticated && targetFootprint > 0 && !isNaN(currentFootprint)
      ? Math.min((currentFootprint / targetFootprint) * 100, 100)
      : 0;
  const averageDailyEmissions = (weeklyEmissions || 0) / 7;

  // Calculate trends (mock calculation for now - could be enhanced with historical data)
  const isAboveTarget = currentFootprint > targetFootprint * 0.8; // 80% of target
  const weeklyTrend = weeklyEmissions > monthlyEmissions / 4 ? "up" : "down";
  const trendPercentage =
    Math.abs(
      ((weeklyEmissions - monthlyEmissions / 4) / (monthlyEmissions / 4)) * 100
    ) || 0;

  // Use real footprint breakdown data from API
  const footprintBreakdown = breakdownData.byActivityType.map((item) => {
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
      other: Target,
      fuel: Fuel,
      heating: Flame,
      manufacturing: Factory,
      water: Droplets,
      "water usage": Droplets,
    };

    const colorMap = {
      transport: "text-blue-500",
      car: "text-blue-500",
      bus: "text-blue-600",
      motorcycle: "text-purple-500",
      bike: "text-green-500",
      flight: "text-blue-600",
      plane: "text-blue-600",
      energy: "text-yellow-500",
      electricity: "text-yellow-500",
      home: "text-orange-500",
      housing: "text-orange-500",
      food: "text-green-500",
      dairy: "text-blue-100",
      waste: "text-red-500",
      shopping: "text-pink-500",
      other: "text-gray-500",
      fuel: "text-brown-500",
      heating: "text-red-600",
      manufacturing: "text-gray-600",
      water: "text-cyan-500",
      "water usage": "text-cyan-500",
    };

    const percentage =
      totalEmissions > 0 ? (item.total / totalEmissions) * 100 : 0;

    // Get the activity type key and normalize it
    const activityKey = item._id.toLowerCase();
    
    // Function to find the best matching icon and color
    const findBestMatch = (key, map) => {
      // Direct match
      if (map[key]) return map[key];
      
      // Specific food-related matches first (before generic patterns)
      if (key.includes('dairy') || key.includes('milk') || key.includes('cheese')) return map['dairy'];
      
      // Partial matches for common patterns
      if (key.includes('motor') || key.includes('bike')) return map['motorcycle'] || map['bike'];
      if (key.includes('bus') || key.includes('public transport')) return map['bus'];
      if (key.includes('water') || key.includes('h2o')) return map['water'];
      if (key.includes('electric') || key.includes('power')) return map['electricity'];
      if (key.includes('car') || key.includes('vehicle')) return map['car'];
      if (key.includes('flight') || key.includes('airplane') || key === 'air travel') return map['flight'];
      if (key.includes('home') || key.includes('house')) return map['home'];
      if (key.includes('food') || key.includes('eat')) return map['food'];
      if (key.includes('waste') || key.includes('trash')) return map['waste'];
      if (key.includes('shop')) return map['shopping'];
      if (key.includes('fuel') || key.includes('gas')) return map['fuel'];
      if (key.includes('heat')) return map['heating'];
      
      // Default fallbacks
      return map['other'] || Target;
    };

    return {
      category: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      amount: item.total,
      percentage: Math.round(percentage),
      icon: findBestMatch(activityKey, iconMap),
      color: findBestMatch(activityKey, colorMap),
    };
  });

  // Use configuration for fallback data
  const displayBreakdown =
    footprintBreakdown.length > 0
      ? footprintBreakdown
      : FALLBACK_EMISSIONS_BREAKDOWN;

  // Format recent activities from API data - use recentActivities from hook or fallback to logs
  const displayActivities = formatRecentActivities(recentActivities, logs);

  // Calculate achievements based on real streak data
  const achievements = calculateAchievements(streakData, logs);

  // Use real streak calendar data
  const streakCalendar = getStreakCalendar();
  const todayStatus = getTodayStatus();
  
  // Extract dates that have activity for the calendar
  const streakDays = streakCalendar
    .filter(day => day.hasActivity)
    .map(day => day.date);

  return (
    <div className="px-4 sm:px-8 md:px-10 pt-2 sm:pt-4 md:pt-6 pb-8 sm:pb-12 md:pb-16 space-y-4 sm:space-y-5 md:space-y-4 bg-gradient-to-br from-background via-accent/5 to-primary/5 min-h-screen relative">
      {/* Enhanced Header */}
      <div className="space-y-1 sm:space-y-2 md:space-y-2 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-gradient mb-1">
            {t(`common:${greetingKey}`)}, {name}!
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
            <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-muted-foreground">
              Here's your environmental impact overview
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards with Staggered Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {/* Monthly Footprint */}
        <div
          className="animate-slide-up h-full"
          style={{ animationDelay: "0.1s" }}
        >
          <Card className="card-premium hover-glow group cursor-pointer h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                {t("dashboard:monthly_footprint")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={currentFootprint} decimals={1} />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-base font-normal text-muted-foreground ml-1">
                    {(preferences.carbonUnits || "kg") === "tons"
                      ? "tons CO₂"
                      : "kg CO₂"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                  {isAboveTarget ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                  )}
                  <span
                    className={`text-xs sm:text-xs md:text-sm lg:text-sm font-semibold ${
                      isAboveTarget ? "text-warning" : "text-success"
                    }`}
                  >
                    {targetFootprint > 0
                      ? `${Math.abs(
                          ((currentFootprint - targetFootprint) /
                            targetFootprint) *
                            100
                        ).toFixed(1)}% ${
                          isAboveTarget
                            ? t("dashboard:above_target")
                            : t("dashboard:below_target")
                        }`
                      : "No target set"}
                  </span>
                </div>
                {equivalents && (
                  <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground">
                    ≈ {Math.round(equivalents.kwh)} kWh •{" "}
                    {equivalents.trees?.toFixed?.(1)} trees •{" "}
                    {equivalents.cars?.toFixed?.(3)} cars
                  </div>
                )}
              </div>
              <ProfessionalProgress 
                value={Math.min(
                  !isNaN(currentFootprint) && targetFootprint > 0 
                    ? (currentFootprint / targetFootprint) * 100 
                    : 0, 
                  100
                )} 
                className="mt-4" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Total */}
        <div
          className="animate-slide-up h-full"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="card-floating hover-lift group h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                {t("dashboard:this_week")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={weeklyEmissions} decimals={1} />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-base font-normal text-muted-foreground ml-1">
                    {t("dashboard:kg_co2")}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-h-[1.5rem]">
                  {weeklyTrend === "up" ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-warning animate-bounce" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-success animate-bounce" />
                  )}
                  <span
                    className={`text-xs sm:text-xs md:text-sm lg:text-sm font-semibold ${
                      weeklyTrend === "up" ? "text-warning" : "text-success"
                    }`}
                  >
                    {trendPercentage.toFixed(1)}%{" "}
                    {weeklyTrend === "up"
                      ? t("dashboard:above_monthly_average")
                      : t("dashboard:below_monthly_average")}
                  </span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  {t("dashboard:daily_average")}:{" "}
                  {formatEmissions(weeklyEmissions / 7)}{" "}
                  {preferences.carbonUnits === "tons" ? "tons CO₂" : t("dashboard:kg_co2")}
                </div>
              </div>
              <div className="mt-4">
                <ProfessionalProgress
                  value={Math.min(
                    weeklyEmissions > 0 && targetFootprint > 0
                      ? (weeklyEmissions / ((targetFootprint * 1000) / 4)) * 100
                      : 0,
                    100
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        <div
          className="animate-slide-up h-full"
          style={{ animationDelay: "0.3s" }}
        >
          <Card className="card-floating hover-lift group h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                {t("dashboard:goal_progress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={goalProgress} />%
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  {t("dashboard:target")}: {targetFootprint}{" "}
                  {preferences.carbonUnits === "tons" ? t("dashboard:tons_month") : "kg/month"}
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  {t("dashboard:current")}: {formatEmissions(monthlyEmissions)}{" "}
                  {preferences.carbonUnits === "tons" ? "tons" : "kg"}
                </div>
              </div>
              <ProfessionalProgress value={goalProgress} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Offset Credits - Shows user's carbon offset purchases from project contributions */}
        <div
          className="animate-slide-up h-full"
          style={{ animationDelay: "0.4s" }}
        >
          <Card className="card-premium hover-glow group cursor-pointer h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-success transition-colors">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                {t("dashboard:offset_credits")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter 
                    end={0} 
                    decimals={preferences.carbonUnits === "tons" ? 1 : 0} 
                  />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-base font-normal text-muted-foreground ml-1">
                    {preferences.carbonUnits === "tons" ? "tons" : "kg"}
                  </span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  {t("dashboard:carbon_offset_purchased")}
                </div>
                <div className="min-h-[1.5rem]">
                  <Link href="/projects">
                    <Badge
                      variant="secondary"
                      className="bg-primary/15 text-primary border-primary/30 font-semibold cursor-pointer hover:bg-primary/25 transition-colors text-xs sm:text-xs md:text-sm"
                    >
                      Start Offsetting →
                    </Badge>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Enhanced Footprint Breakdown */}
          <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <Card className="card-premium hover-lift">
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {t("dashboard:emissions")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-sm lg:text-base">
                  {t("dashboard:emissions_by_category")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-4">
                  {displayBreakdown.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.category}
                        className="flex items-center justify-between p-3 sm:p-4 md:p-4 rounded-xl border border-border/30 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group animate-fade-in"
                        style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 md:gap-4">
                          <div
                            className={`p-2 sm:p-3 md:p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/30 ${item.color} group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm sm:text-base md:text-base lg:text-lg">
                              {item.category}
                            </div>
                            <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground">
                              <AnimatedCounter
                                end={
                                  preferences.carbonUnits === "tons"
                                    ? item.amount / 1000
                                    : item.amount
                                }
                                decimals={1}
                              />{" "}
                              {(preferences.carbonUnits || "kg") === "tons"
                                ? "tons CO₂"
                                : "kg CO₂"}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] md:min-w-[60px]">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12">
                            <AnimatedCircularProgress
                              targetValue={item.percentage}
                              rotation={270}
                              textSize="18px"
                              pathColor="#22c55e"
                              textColor="#1a2e22"
                              trailColor="#e5e7eb"
                              textPosition={{ x: 50, y: 50 }}
                              className="seed-meter" // Add a class for potential CSS customization
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Recent Activities */}
          <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <Card className="card-floating hover-lift">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary" />
                  {t("dashboard:recent_activities")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-sm lg:text-base">
                  {t("dashboard:latest_carbon_footprint_entries")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {footprintLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">
                      Loading activities...
                    </p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      No activities logged yet
                    </p>
                    <Link href="/footprintlog">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Start Logging
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    {displayActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 sm:p-4 md:p-6 rounded-xl border border-border/30 hover:bg-accent/20 hover:shadow-lg transition-all duration-300 animate-fade-in hover-lift group"
                        style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-foreground text-sm sm:text-base md:text-base lg:text-lg group-hover:text-primary transition-colors">
                            {activity.description}
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground mt-1">
                            {activity.type} • {activity.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base sm:text-lg md:text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            +<AnimatedCounter end={activity.co2} decimals={1} />{" "}
                            kg
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground">
                            CO₂
                          </div>
                        </div>
                      </div>
                    ))}
                    {logs.length > 3 && (
                      <div className="pt-4 border-t">
                        <Link href="/footprintlog">
                          <Button variant="outline" className="w-full">
                            {t("dashboard:view_all_activities")}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Achievements */}
          <div className="animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <Card className="card-floating hover-lift">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {t("dashboard:achievements")}
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {t("dashboard:eco_friendly_milestones")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-5 p-4 md:p-6">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-6 rounded-xl border-2 transition-all duration-500 hover-lift ${
                        achievement.earned
                          ? "border-success/40 bg-gradient-to-r from-success/10 to-success/5 shadow-lg"
                          : "border-border/30 bg-muted/10 hover:border-primary/20"
                      }`}
                    >
                      <div
                        className={`p-2 sm:p-3 md:p-4 rounded-xl transition-all duration-300 ${
                          achievement.earned
                            ? "bg-success/20 text-success animate-pulse-eco"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-semibold text-base sm:text-lg md:text-xl ${
                            achievement.earned
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {achievement.title}
                        </div>
                        <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-success/20 text-success border-success/30 font-bold animate-pulse-eco text-xs md:text-sm flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Earned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column with Enhanced Styling */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Calendar Streak */}
          <div className="animate-slide-up" style={{ animationDelay: "0.7s" }}>
            <Card className="bg-gradient-to-br from-green-50 via-white to-green-100 border border-green-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl w-full mx-auto p-0 overflow-hidden">
              <CardHeader className="px-4 py-3 sm:px-6 sm:py-4 md:px-6 md:py-5">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <span className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-md mr-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-5 md:w-5 text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent font-extrabold">
                    {t("dashboard:streak_calendar")}
                  </span>
                </CardTitle>
                <div className="text-sm sm:text-base md:text-base text-gray-600 mt-1">
                  {streakData.currentStreak > 1 ? (
                    <>
                      {!todayStatus.hasLoggedToday && todayStatus.canContinueStreak && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                          Log today to continue!
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Log daily activities to build your streak!
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 py-2 sm:px-6 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-4">
                <div className="flex justify-center items-center w-full">
                  <CustomCalendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    streakDays={streakDays}
                    className="rounded-xl sm:rounded-2xl border-2 border-green-200 bg-white shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 w-full min-w-[320px] max-w-[450px] hover:shadow-green-200 transition-shadow duration-300"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Enhanced Quick Actions */}
          <div className="animate-slide-up" style={{ animationDelay: "0.75s" }}>
            <Card className="card-premium hover-glow">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  <Zap className="h-6 w-6 md:h-7 md:w-7 text-primary animate-pulse-eco" />
                  {t("dashboard:quick_actions")}
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {t("dashboard:track_your_impact_today")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 md:space-y-4 p-3 md:p-4">
                <Link href="/footprintlog" className="block">
                  <Button className="w-full justify-start h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-semibold btn-professional group">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    {t("dashboard:log_activity")}
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/projects" className="block">
                  <Button className="w-full justify-start h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-semibold btn-professional group">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    {t("dashboard:offset_emissions")}
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/community" className="block">
                  <Button className="w-full justify-start h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-semibold btn-professional group">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    {t("dashboard:join_challenge")}
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          {/* Enhanced Tip of the Day powered by Gemini */}
          <div className="animate-slide-up" style={{ animationDelay: "0.9s" }}>
            <Card className="card-premium hover-glow border-2 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2 font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  <Lightbulb className="h-6 w-6 md:h-8 md:w-8 animate-pulse text-yellow-500" />
                  {t("dashboard:eco_tip_of_the_day")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {tips && tips.length > 0 ? (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <ReactMarkdown>
                      {tips
                        .map((t) =>
                          t.startsWith("-") || t.startsWith("*") ? t : `- ${t}`
                        )
                        .join("\n")}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Getting your personalized tips...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Spacing for Mobile */}
      <div className="h-8 sm:h-12 md:h-16"></div>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <AuthGuard intent="dashboard">
      <Layout>
        <Dashboard />
      </Layout>
    </AuthGuard>
  );
}
