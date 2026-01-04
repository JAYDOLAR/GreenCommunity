"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FALLBACK_EMISSIONS_BREAKDOWN,
  ACHIEVEMENT_TYPES,
  formatRecentActivities
} from '@/config/dashboardConfig';

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
  CheckCircle
} from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import ProfessionalProgress from '@/components/ProfessionalProgress';
import AnimatedCircularProgress from '@/components/AnimatedCircularProgress';
import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { usePreferences, useTranslation } from "@/context/PreferencesContext";
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { Calendar as CustomCalendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { useFootprintLog } from '@/lib/useFootprintLog';
import ReactMarkdown from 'react-markdown';

const translations = {
  en: {
    welcome: "Welcome back!",
    emissions: "Your emissions by category this month",
    achievements: "Your eco-friendly milestones",
    // ... add more as needed
  },
  hi: {
    welcome: "वापसी पर स्वागत है!",
    emissions: "इस महीने श्रेणी के अनुसार आपके उत्सर्जन",
    achievements: "आपकी पर्यावरण-अनुकूल उपलब्धियाँ",
    // ...
  },
  gu: {
    welcome: "પાછા આવવા માટે સ્વાગત છે!",
    emissions: "આ મહિને કેટેગરી પ્રમાણે તમારા ઉત્સર્જન",
    achievements: "તમારી પર્યાવરણ-મૈત્રીપૂર્ણ સિદ્ધિઓ",
    // ...
  },
};

const currencySymbols = {
  usd: "$",
  eur: "€",
  inr: "₹",
};

const unitLabels = {
  metric: { distance: "km", weight: "kg" },
  imperial: { distance: "mi", weight: "lb" },
};

const getGreetingKey = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting_morning';
  if (hour < 18) return 'greeting_afternoon';
  return 'greeting_evening';
};

import ProtectedLayout from '@/components/ProtectedLayout';
import AuthGuard from '@/components/AuthGuard';
import ChatBot from '@/components/ChatBot';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { user, isLoading } = useUser();
  const [greetingKey, setGreetingKey] = useState('greeting_morning'); // Default fallback
  const { preferences } = usePreferences();
  const { t } = useTranslation();
  const currency = currencySymbols[preferences.currency] || "$";
  const units = unitLabels[preferences.units] || unitLabels.metric;
  const [date, setDate] = useState(new Date());

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
    loading: footprintLoading
  } = useFootprintLog();

  // AI Tips from Gemini (must be declared before any early returns)
  const [tips, setTips] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/ai/generate-tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ electricity: 200, gas: 15, petrol: 30 })
        });
        const data = await res.json();
        if (Array.isArray(data?.tips)) setTips(data.tips);
      } catch { }
    })();
  }, []);

  // Helper function to format emissions display
  const formatEmissions = (value, unit = 'kg') => {
    if (value === 0) return '0';
    if (value < 0.1) return '<0.1';
    return value.toFixed(1);
  };

  // Handle client-side tasks
  useEffect(() => {
    // Set the correct greeting when component mounts
    setGreetingKey(getGreetingKey());
  }, []);

  if (isLoading || footprintLoading) {
    return <DashboardSkeleton />;
  }

  // Ensure user is authenticated before rendering dashboard content
  if (!user) {
    return null; // AuthGuard will handle the redirect
  }

  const isAuthenticated = !!user;
  const name = (user?.name && typeof user.name === 'string') ? user.name : 'Guest';

  // Calculate real-time metrics from API data
  const currentFootprint = monthlyEmissions / 1000; // Convert kg to tons  
  const targetFootprint = 20.0; // User's target (could come from user settings)
  const goalProgress = isAuthenticated && targetFootprint > 0 ? Math.min((currentFootprint / targetFootprint) * 100, 100) : 0;
  const averageDailyEmissions = weeklyEmissions / 7;

  // Calculate trends (mock calculation for now - could be enhanced with historical data)
  const isAboveTarget = currentFootprint > (targetFootprint * 0.8); // 80% of target
  const weeklyTrend = weeklyEmissions > (monthlyEmissions / 4) ? 'up' : 'down';
  const trendPercentage = Math.abs(((weeklyEmissions - (monthlyEmissions / 4)) / (monthlyEmissions / 4)) * 100) || 0;

  // Use real footprint breakdown data from API
  const footprintBreakdown = breakdownData.byActivityType.map(item => {
    const iconMap = {
      'transport': Car,
      'energy': Home,
      'food': Utensils,
      'waste': BarChart3,
      'other': Target
    };

    const colorMap = {
      'transport': 'text-blue-500',
      'energy': 'text-yellow-500',
      'food': 'text-green-500',
      'waste': 'text-orange-500',
      'other': 'text-purple-500'
    };

    const percentage = totalEmissions > 0 ? (item.total / totalEmissions) * 100 : 0;

    return {
      category: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      amount: item.total,
      percentage: Math.round(percentage),
      icon: iconMap[item._id] || Target,
      color: colorMap[item._id] || 'text-gray-500'
    };
  });

  // Use configuration for fallback data
  const displayBreakdown = footprintBreakdown.length > 0 ? footprintBreakdown : FALLBACK_EMISSIONS_BREAKDOWN;

  // Format recent activities from API data - use recentActivities from hook or fallback to logs
  const displayActivities = formatRecentActivities(recentActivities, logs);

  const achievements = ACHIEVEMENT_TYPES;

  // Generate streak days from 1st to 13th of the current month
  const today = new Date();
  const streakDays = Array.from({ length: 13 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1));

  return (
    <div className="px-4 sm:px-8 md:px-10 pt-2 sm:pt-4 md:pt-6 pb-8 sm:pb-12 md:pb-16 space-y-4 sm:space-y-5 md:space-y-4 bg-gradient-to-br from-background via-accent/5 to-primary/5 min-h-screen relative">
      {/* Enhanced Header */}
      <div className="space-y-1 sm:space-y-2 md:space-y-2 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-gradient mb-1">{t(greetingKey)}, {name}!</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
            <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-muted-foreground">Here's your environmental impact overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards with Staggered Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {/* Monthly Footprint */}
        <div className="animate-slide-up h-full" style={{ animationDelay: '0.1s' }}>
          <Card className="card-premium hover-glow group cursor-pointer h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                Monthly Footprint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={currentFootprint} decimals={1} />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-base font-normal text-muted-foreground ml-1">tons CO₂</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                  {isAboveTarget ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                  )}
                  <span className={`text-xs sm:text-xs md:text-sm lg:text-sm font-semibold ${isAboveTarget ? 'text-warning' : 'text-success'}`}>
                    {targetFootprint > 0 ? (
                      `${Math.abs(((currentFootprint - targetFootprint) / targetFootprint) * 100).toFixed(1)}% ${isAboveTarget ? 'above' : 'below'} target`
                    ) : (
                      'No target set'
                    )}
                  </span>
                </div>
                {equivalents && (
                  <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground">
                    ≈ {Math.round(equivalents.kwh)} kWh • {equivalents.trees?.toFixed?.(1)} trees • {equivalents.cars?.toFixed?.(3)} cars
                  </div>
                )}
              </div>
              <ProfessionalProgress value={80} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Total */}
        <div className="animate-slide-up h-full" style={{ animationDelay: '0.2s' }}>
          <Card className="card-floating hover-lift group h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={weeklyEmissions} decimals={1} />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-base font-normal text-muted-foreground ml-1">kg CO₂</span>
                </div>
                <div className="flex items-center gap-2 min-h-[1.5rem]">
                  {weeklyTrend === 'up' ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-warning animate-bounce" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-success animate-bounce" />
                  )}
                  <span className={`text-xs sm:text-xs md:text-sm lg:text-sm font-semibold ${weeklyTrend === 'up' ? 'text-warning' : 'text-success'}`}>
                    {trendPercentage.toFixed(1)}% {weeklyTrend === 'up' ? 'above' : 'below'} monthly average
                  </span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  Daily average: {(weeklyEmissions / 7).toFixed(1)} kg CO₂
                </div>
              </div>
              <div className="mt-4">
                <ProfessionalProgress value={Math.min((weeklyEmissions / (monthlyEmissions / 4)) * 100, 100)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        <div className="animate-slide-up h-full" style={{ animationDelay: '0.3s' }}>
          <Card className="card-floating hover-lift group h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={goalProgress} />%
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  Target: {targetFootprint} tons/month
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  Current: {currentFootprint.toFixed(1)} tons
                </div>
              </div>
              <ProfessionalProgress value={goalProgress} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Offset Credits */}
        <div className="animate-slide-up h-full" style={{ animationDelay: '0.4s' }}>
          <Card className="card-premium hover-glow group cursor-pointer h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-success transition-colors">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                Offset Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-foreground">
                  <AnimatedCounter end={1.2} decimals={1} />
                  <span className="text-xs sm:text-sm md:text-sm lg:text-base font-normal text-muted-foreground ml-1">tons</span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground min-h-[1.5rem]">
                  Carbon offset purchased
                </div>
                <div className="min-h-[1.5rem]">
                  <Badge variant="secondary" className="bg-success/15 text-success border-success/30 font-semibold animate-pulse-eco text-xs sm:text-xs md:text-sm">
                    50% offset this month
                  </Badge>
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
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Card className="card-premium hover-lift">
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-xl lg:text-2xl">{t('emissions')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-sm lg:text-base">Your emissions by category this month</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-4">
                  {displayBreakdown.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.category}
                        className="flex items-center justify-between p-3 sm:p-4 md:p-4 rounded-xl border border-border/30 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group animate-fade-in"
                        style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 md:gap-4">
                          <div className={`p-2 sm:p-3 md:p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/30 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm sm:text-base md:text-base lg:text-lg">{item.category}</div>
                            <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground">
                              <AnimatedCounter end={item.amount} decimals={1} /> tons CO₂
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
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Card className="card-floating hover-lift">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-xl lg:text-2xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary" />
                  Recent Activities
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-sm lg:text-base">Your latest carbon footprint entries</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {footprintLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading activities...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">No activities logged yet</p>
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
                        style={{ animationDelay: `${0.7 + (index * 0.1)}s` }}
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
                            +<AnimatedCounter end={activity.co2} decimals={1} /> kg
                          </div>
                          <div className="text-xs sm:text-xs md:text-sm lg:text-sm text-muted-foreground">CO₂</div>
                        </div>
                      </div>
                    ))}
                    {logs.length > 3 && (
                      <div className="pt-4 border-t">
                        <Link href="/footprintlog">
                          <Button variant="outline" className="w-full">
                            View All Activities
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
          <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <Card className="card-floating hover-lift">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">{t('achievements')}</CardTitle>
                <CardDescription className="text-sm md:text-base">Your eco-friendly milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-5 p-4 md:p-6">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-6 rounded-xl border-2 transition-all duration-500 hover-lift ${achievement.earned
                        ? 'border-success/40 bg-gradient-to-r from-success/10 to-success/5 shadow-lg'
                        : 'border-border/30 bg-muted/10 hover:border-primary/20'
                        }`}
                    >
                      <div className={`p-2 sm:p-3 md:p-4 rounded-xl transition-all duration-300 ${achievement.earned
                        ? 'bg-success/20 text-success animate-pulse-eco'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold text-base sm:text-lg md:text-xl ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
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
          {/* Enhanced Quick Actions */}
          <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <Card className="card-premium hover-glow">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Zap className="h-6 w-6 md:h-7 md:w-7 text-primary animate-pulse-eco" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-sm md:text-base">Track your impact today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 md:space-y-4 p-3 md:p-4">
                <Link href="/footprintlog" className="block">
                  <Button className="w-full justify-start h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-semibold btn-professional group">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    Log Activity
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/projects" className="block">
                  <Button className="w-full justify-start h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-semibold btn-professional group">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    Offset Emissions
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/community" className="block">
                  <Button className="w-full justify-start h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-semibold btn-professional group">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    Join Challenge
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          {/* Calendar Streak */}
          <div className="animate-slide-up" style={{ animationDelay: '0.75s' }}>
            <Card className="bg-gradient-to-br from-green-50 via-white to-green-100 border border-green-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl w-full max-w-full sm:max-w-md mx-auto p-0 overflow-hidden">
              <CardHeader className="px-4 py-3 sm:px-6 sm:py-4 md:px-6 md:py-5">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <span className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-md mr-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-5 md:w-5 text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent font-extrabold">Streak Calendar</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base md:text-base text-gray-600 mt-1">Your activity streak this month</CardDescription>
              </CardHeader>
              <CardContent className="px-2 py-4 sm:px-4 sm:py-6 md:px-4 md:py-6 lg:px-6 lg:py-8">
                <div className="flex justify-center items-center">
                  <CustomCalendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    streakDays={streakDays}
                    className="rounded-xl sm:rounded-2xl border-2 border-green-200 bg-white shadow-lg p-2 sm:p-4 md:p-4 lg:p-6 w-full max-w-xs sm:max-w-[320px] md:max-w-[280px] lg:max-w-[360px] hover:shadow-green-200 transition-shadow duration-300"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Enhanced Tip of the Day powered by Gemini */}
          <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <Card className="card-premium hover-glow border-2 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 md:h-8 md:w-8 animate-pulse text-yellow-500" />
                  Eco Tip of the Day
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {tips && tips.length > 0 ? (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <ReactMarkdown>
                      {tips.map(t => t.startsWith('-') || t.startsWith('*') ? t : `- ${t}`).join('\n')}
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
