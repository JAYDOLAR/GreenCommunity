// React hook for managing footprint log state and operations
import { useState, useEffect, useCallback } from 'react';
import { footprintLogAPI } from '../lib/footprintlogApi.js';
import { toast } from 'react-hot-toast';

export const useFootprintLog = () => {
    const [logs, setLogs] = useState([]);
    const [totalEmissions, setTotalEmissions] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [breakdownData, setBreakdownData] = useState({
        byActivityType: [],
        byCategory: []
    });

    // Fetch user's footprint logs
    const fetchLogs = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await footprintLogAPI.getUserLogs(filters);
            setLogs(response || []);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch footprint logs');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch total emissions
    const fetchTotalEmissions = useCallback(async (filters = {}) => {
        try {
            const response = await footprintLogAPI.getTotalEmissions(filters);
            setTotalEmissions(response.total || 0);
        } catch (err) {
            console.error('Failed to fetch total emissions:', err);
        }
    }, []);

    // Fetch breakdown data
    const fetchBreakdownData = useCallback(async () => {
        try {
            const [activityTypeData, categoryData] = await Promise.all([
                footprintLogAPI.getEmissionsByActivityType(),
                footprintLogAPI.getEmissionsByCategory()
            ]);

            setBreakdownData({
                byActivityType: activityTypeData || [],
                byCategory: categoryData || []
            });
        } catch (err) {
            console.error('Failed to fetch breakdown data:', err);
        }
    }, []);

    // Create a new log entry
    const createLog = useCallback(async (logData) => {
        setLoading(true);
        setError(null);

        try {
            const formattedData = footprintLogAPI.formatLogData(logData);
            const newLog = await footprintLogAPI.createLog(formattedData);

            // Add to local state
            setLogs(prevLogs => [newLog, ...prevLogs]);

            // Update totals
            setTotalEmissions(prev => prev + newLog.emission);

            toast.success('Activity logged successfully!');
            return newLog;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to log activity');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update an existing log
    const updateLog = useCallback(async (logId, updateData) => {
        setLoading(true);
        setError(null);

        try {
            const updatedLog = await footprintLogAPI.updateLog(logId, updateData);

            // Update local state
            setLogs(prevLogs =>
                prevLogs.map(log =>
                    log._id === logId ? updatedLog : log
                )
            );

            toast.success('Activity updated successfully!');
            return updatedLog;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update activity');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a log entry
    const deleteLog = useCallback(async (logId) => {
        setLoading(true);
        setError(null);

        try {
            const logToDelete = logs.find(log => log._id === logId);
            await footprintLogAPI.deleteLog(logId);

            // Remove from local state
            setLogs(prevLogs => prevLogs.filter(log => log._id !== logId));

            // Update totals
            if (logToDelete) {
                setTotalEmissions(prev => prev - logToDelete.emission);
            }

            toast.success('Activity deleted successfully!');
        } catch (err) {
            setError(err.message);
            toast.error('Failed to delete activity');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [logs]);

    // Calculate emissions for preview (client-side only)
    const calculateEmissions = useCallback((activityData) => {
        return footprintLogAPI.calculateEmissions(activityData);
    }, []);

    // Calculate emissions using backend API (for real-time accurate calculation)
    const calculateEmissionsWithAPI = useCallback(async (activityData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await footprintLogAPI.calculateEmissionsPreview(activityData);
            return result;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to calculate emissions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get logs filtered by date range
    const getLogsInDateRange = useCallback((startDate, endDate) => {
        return logs.filter(log => {
            const logDate = new Date(log.createdAt || log.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return logDate >= start && logDate <= end;
        });
    }, [logs]);

    // Get weekly total emissions
    const getWeeklyTotal = useCallback(() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        return logs
            .filter(log => {
                const logDate = new Date(log.createdAt || log.date);
                return logDate >= weekAgo;
            })
            .reduce((total, log) => total + (log.emission || 0), 0);
    }, [logs]);

    // Get monthly total emissions
    const getMonthlyTotal = useCallback(() => {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        return logs
            .filter(log => {
                const logDate = new Date(log.createdAt || log.date);
                return logDate >= monthAgo;
            })
            .reduce((total, log) => total + (log.emission || 0), 0);
    }, [logs]);

    // Get activity type statistics
    const getActivityTypeStats = useCallback(() => {
        const stats = {};

        logs.forEach(log => {
            const type = log.activityType || 'other';
            if (!stats[type]) {
                stats[type] = {
                    count: 0,
                    totalEmissions: 0,
                };
            }
            stats[type].count++;
            stats[type].totalEmissions += log.emission || 0;
        });

        return Object.entries(stats).map(([type, data]) => ({
            type,
            ...data,
            averageEmissions: data.totalEmissions / data.count,
        }));
    }, [logs]);

    // Initial data fetch
    useEffect(() => {
        fetchLogs();
        fetchTotalEmissions();
        fetchBreakdownData();
    }, [fetchLogs, fetchTotalEmissions, fetchBreakdownData]);

    return {
        // State
        logs,
        totalEmissions,
        loading,
        error,
        breakdownData,

        // Actions
        fetchLogs,
        fetchTotalEmissions,
        fetchBreakdownData,
        createLog,
        updateLog,
        deleteLog,
        calculateEmissions,
        calculateEmissionsWithAPI,

        // Computed values
        getLogsInDateRange,
        getWeeklyTotal,
        getMonthlyTotal,
        getActivityTypeStats,

        // Utilities
        refresh: () => {
            fetchLogs();
            fetchTotalEmissions();
            fetchBreakdownData();
        }
    };
};

export default useFootprintLog;
