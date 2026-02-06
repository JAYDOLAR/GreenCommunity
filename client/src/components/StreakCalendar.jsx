import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Calendar as CustomCalendar } from "@/components/ui/calendar";
import { useTranslation } from "@/context/PreferencesContext";

const StreakCalendar = ({ 
  streakData, 
  todayStatus, 
  streakDays, 
  date, 
  onDateSelect, 
  className = "" 
}) => {
  const { t } = useTranslation(["dashboard"]);

  return (
    <div className={`animate-slide-up ${className}`} style={{ animationDelay: "0.7s" }}>
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
            {streakData?.currentStreak > 1 ? (
              <>
                {todayStatus && !todayStatus.hasLoggedToday && todayStatus.canContinueStreak && (
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
              onSelect={onDateSelect}
              streakDays={streakDays || []}
              className="rounded-xl sm:rounded-2xl border-2 border-green-200 bg-white shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 w-full min-w-[320px] max-w-[450px] hover:shadow-green-200 transition-shadow duration-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakCalendar;