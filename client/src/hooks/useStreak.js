import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

const useStreak = () => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalLoggingDays: 0,
    lastLogDate: null,
    streakStartDate: null,
    isStreakActive: false,
    streakHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/streak', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Failed to fetch streak data (HTTP ${response.status})`);
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { throw new Error(`Invalid response (HTTP ${response.status})`); }
      setStreakData(data.streak);
      setError(null);
    } catch (err) {
      console.error('Error fetching streak data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreakData();
  }, [user]);

  // Generate streak calendar data for the last 30 days
  const getStreakCalendar = () => {
    const calendar = [];
    const today = new Date();
    const lastLogDate = streakData.lastLogDate ? new Date(streakData.lastLogDate) : null;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      let hasActivity = false;
      
      // Check current streak
      if (lastLogDate && streakData.currentStreak > 0) {
        const lastLogDateNormalized = new Date(lastLogDate);
        lastLogDateNormalized.setHours(0, 0, 0, 0);
        
        // Calculate how many days back from lastLogDate this current date is
        const daysFromLastLog = Math.floor((lastLogDateNormalized - date) / (1000 * 60 * 60 * 24));
        
        // If this date is within the current streak (counting backwards from lastLogDate)
        if (daysFromLastLog >= 0 && daysFromLastLog < streakData.currentStreak) {
          hasActivity = true;
        }
      }
      
      // Also check streak history for this period
      if (!hasActivity && streakData.streakHistory) {
        for (const streak of streakData.streakHistory) {
          const streakStart = new Date(streak.startDate);
          const streakEnd = new Date(streak.endDate);
          streakStart.setHours(0, 0, 0, 0);
          streakEnd.setHours(0, 0, 0, 0);
          
          if (date >= streakStart && date <= streakEnd) {
            hasActivity = true;
            break;
          }
        }
      }
      
      calendar.push({
        date: date,
        hasActivity,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return calendar;
  };

  // Get streak status for today
  const getTodayStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLogDate = streakData.lastLogDate ? new Date(streakData.lastLogDate) : null;
    
    if (!lastLogDate) {
      return { hasLoggedToday: false, canContinueStreak: true };
    }
    
    lastLogDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastLogDate) / (1000 * 60 * 60 * 24));
    
    return {
      hasLoggedToday: daysDiff === 0,
      canContinueStreak: daysDiff <= 1
    };
  };

  const refreshStreak = () => {
    fetchStreakData();
  };

  return {
    streakData,
    loading,
    error,
    getStreakCalendar,
    getTodayStatus,
    refreshStreak
  };
};

export default useStreak;
