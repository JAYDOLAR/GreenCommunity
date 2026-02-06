import React from 'react';
import { Calendar as CustomCalendar } from "@/components/ui/calendar";

const StreakCalendar = ({ 
  streakDays, 
  date, 
  onDateSelect, 
  className = "" 
}) => {
  return (
    <CustomCalendar
      mode="single"
      selected={date}
      onSelect={onDateSelect}
      streakDays={streakDays || []}
      className={`rounded-xl sm:rounded-2xl border-2 border-green-200 bg-white shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 w-full min-w-[340px] max-w-[520px] hover:shadow-green-200 transition-shadow duration-300 ${className}`}
    />
  );
};

export default StreakCalendar;