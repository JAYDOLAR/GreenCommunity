import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { API_BASE_URL } from '@/lib/api';

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

  const fetchStreakData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/streak`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
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
  }, [user]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  // Generate streak calendar data covering all history (not just 30 days)
  const getStreakCalendar = () => {
    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogDate = streakData.lastLogDate ? new Date(streakData.lastLogDate) : null;

    // Determine the earliest date we need to cover
    let earliestDate = new Date(today);
    earliestDate.setDate(earliestDate.getDate() - 29); // At minimum last 30 days

    // Extend back to cover all streak history
    if (streakData.streakHistory && streakData.streakHistory.length > 0) {
      for (const streak of streakData.streakHistory) {
        const streakStart = new Date(streak.startDate);
        streakStart.setHours(0, 0, 0, 0);
        if (streakStart < earliestDate) {
          earliestDate = streakStart;
        }
      }
    }

    // Also extend back to cover the full current streak
    if (lastLogDate && streakData.currentStreak > 0) {
      const currentStreakStart = new Date(lastLogDate);
      currentStreakStart.setHours(0, 0, 0, 0);
      currentStreakStart.setDate(currentStreakStart.getDate() - streakData.currentStreak + 1);
      if (currentStreakStart < earliestDate) {
        earliestDate = currentStreakStart;
      }
    }

    // Generate calendar entries from earliest date to today
    const totalDays = Math.floor((today - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      let hasActivity = false;
      
      // Check current streak
      if (lastLogDate && streakData.currentStreak > 0) {
        const lastLogDateNormalized = new Date(lastLogDate);
        lastLogDateNormalized.setHours(0, 0, 0, 0);
        
        const daysFromLastLog = Math.floor((lastLogDateNormalized - date) / (1000 * 60 * 60 * 24));
        
        if (daysFromLastLog >= 0 && daysFromLastLog < streakData.currentStreak) {
          hasActivity = true;
        }
      }
      
      // Also check streak history
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
