"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  ArrowRight
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
import ChatBot from '@/components/ChatBot';

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
    getWeeklyTotal,
    getMonthlyTotal,
    loading: footprintLoading
  } = useFootprintLog();

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

  // Fallback breakdown if no data
  const fallbackBreakdown = [
    { category: 'Transportation', amount: 0, percentage: 0, icon: Car, color: 'text-blue-500' },
    { category: 'Energy', amount: 0, percentage: 0, icon: Home, color: 'text-yellow-500' },
    { category: 'Food', amount: 0, percentage: 0, icon: Utensils, color: 'text-green-500' },
  ];

  const displayBreakdown = footprintBreakdown.length > 0 ? footprintBreakdown : fallbackBreakdown;

  // Format recent activities from API data - use recentActivities from hook or fallback to logs
  const formattedActivities = (recentActivities.length > 0 ? recentActivities : logs.slice(0, 3)).map(log => ({
    type: log.category || log.activityType,
    description: log.activity || `${log.activityType} activity`,
    co2: log.emission || 0,
    date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Today'
  }));

  // Fallback data if no logs available
  const fallbackActivities = [
    { type: 'Transportation', description: 'Start logging your activities!', co2: 0, date: 'Today' },
  ];

  const displayActivities = formattedActivities.length > 0 ? formattedActivities : fallbackActivities;

  const achievements = [
    { title: 'Week Streak', description: '7 days of logging', icon: Award, earned: true },
    { title: 'Green Commuter', description: 'Used public transport 5x', icon: Car, earned: true },
    { title: 'Plant-Based', description: 'Ate vegetarian for 3 days', icon: Leaf, earned: false },
  ];

  // Generate streak days from 1st to 13th of the current month
  const today = new Date();
  const streakDays = Array.from({ length: 13 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1));

  return (
    <div className="p-4 sm:p-8 md:p-10 pb-8 sm:pb-12 md:pb-16 space-y-6 sm:space-y-8 md:space-y-10 bg-gradient-to-br from-background via-accent/5 to-primary/5 min-h-screen relative">
      {/* Enhanced Header */}
      <div className="space-y-3 sm:space-y-4 md:space-y-5 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-4xl font-bold text-gradient mb-1">{t(greetingKey)}, {name}!</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Here's your environmental impact overview</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards with Staggered Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {/* Monthly Footprint */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card className="card-premium hover-glow group cursor-pointer">
            <CardHeader className="pb-0.5 md:pb-1">
              <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
                Monthly Footprint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={currentFootprint} decimals={1} />
                  <span className="text-sm sm:text-base md:text-lg font-normal text-muted-foreground ml-1">tons CO₂</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAboveTarget ? (
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-warning animate-bounce" />
                  ) : (
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-success animate-bounce" />
                  )}
                  <span className={`text-xs sm:text-sm md:text-base font-semibold ${isAboveTarget ? 'text-warning' : 'text-success'}`}>
                    {targetFootprint > 0 ? (
                      `${Math.abs(((currentFootprint - targetFootprint) / targetFootprint) * 100).toFixed(1)}% ${isAboveTarget ? 'above' : 'below'} target`
                    ) : (
                      'No target set'
                    )}
                  </span>
                </div>
                <ProfessionalProgress value={80} className="mt-2 sm:mt-3 md:mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Total */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="card-floating hover-lift group">
            <CardHeader className="pb-0.5 md:pb-1">
              <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={weeklyEmissions} decimals={1} />
                  <span className="text-sm sm:text-base md:text-lg font-normal text-muted-foreground ml-1">kg CO₂</span>
                </div>
                <div className="flex items-center gap-2">
                  {weeklyTrend === 'up' ? (
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-warning animate-bounce" />
                  ) : (
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-success animate-bounce" />
                  )}
                  <span className={`text-xs sm:text-sm md:text-base font-semibold ${weeklyTrend === 'up' ? 'text-warning' : 'text-success'}`}>
                    {trendPercentage.toFixed(1)}% {weeklyTrend === 'up' ? 'above' : 'below'} monthly average
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card className="card-floating hover-lift group">
            <CardHeader className="pb-1 md:pb-1">
              <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <Target className="h-5 w-5 md:h-6 md:w-6" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={goalProgress} />%
                </div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  Target: {targetFootprint} tons/month
                </div>
                <ProfessionalProgress value={goalProgress} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offset Credits */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card className="card-premium hover-glow group cursor-pointer">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2 group-hover:text-success transition-colors">
                <Leaf className="h-5 w-5 md:h-6 md:w-6" />
                Offset Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-3">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={1.2} decimals={1} />
                  <span className="text-sm sm:text-base md:text-lg font-normal text-muted-foreground ml-1">tons</span>
                </div>
                <Badge variant="secondary" className="bg-success/15 text-success border-success/30 font-semibold animate-pulse-eco text-xs sm:text-sm md:text-base">
                  50% offset this month
                </Badge>
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
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">{t('emissions')}</CardTitle>
                <CardDescription className="text-sm md:text-base">Your emissions by category this month</CardDescription>
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
                            <div className="font-semibold text-foreground text-base sm:text-lg md:text-lg">{item.category}</div>
                            <div className="text-xs sm:text-sm md:text-sm text-muted-foreground">
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
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Calendar className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  Recent Activities
                </CardTitle>
                <CardDescription className="text-sm md:text-base">Your latest carbon footprint entries</CardDescription>
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
                          <div className="font-semibold text-foreground text-base sm:text-lg md:text-xl group-hover:text-primary transition-colors">
                            {activity.description}
                          </div>
                          <div className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                            {activity.type} • {activity.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            +<AnimatedCounter end={activity.co2} decimals={1} /> kg
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">CO₂</div>
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
                        <Badge className="bg-success/20 text-success border-success/30 font-bold animate-pulse-eco text-xs md:text-sm">
                          ✓ Earned
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
          {/* Enhanced Tip of the Day */}
          <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <Card className="card-premium hover-glow border-2 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <span className="text-2xl md:text-3xl animate-pulse">💡</span>
                  Eco Tip of the Day
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Try meal prepping with seasonal, local ingredients this week. It can reduce your food-related emissions by up to
                  <span className="font-bold text-success"> 20%</span> while saving time and money!
                </p>
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
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  );
}
