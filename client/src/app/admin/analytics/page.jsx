'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import getAdminApiUrl from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  TreePine,
  Target,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userChartMonth, setUserChartMonth] = useState(-1); // Default to Full Year
  const [userChartYear, setUserChartYear] = useState(new Date().getFullYear());
  const [revenueChartMonth, setRevenueChartMonth] = useState(-1); // Default to Full Year
  const [revenueChartYear, setRevenueChartYear] = useState(new Date().getFullYear());
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const [userChartType, setUserChartType] = useState('area');
  const [revenueChartType, setRevenueChartType] = useState('line');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const [metrics, setMetrics] = useState({
    users: {
      total: 0,
      growth: 0,
      trend: 'up',
      data: []
    },
    revenue: {
      total: 0,
      growth: 0,
      trend: 'up',
      data: []
    },
    projects: {
      total: 0,
      growth: 0,
      trend: 'up',
      data: []
    },
    carbonOffset: {
      total: 0,
      growth: 0,
      trend: 'up',
      data: []
    }
  });

  const [topProjects, setTopProjects] = useState([]);

  const [userActivity, setUserActivity] = useState([]);

  // Fetch analytics data from API
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const serverUrl = getAdminApiUrl();
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${serverUrl}/api/admin/analytics/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setMetrics(result.data.metrics);
        setTopProjects(result.data.topProjects || []);
        setUserActivity(result.data.userActivity || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Month and Year options
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year, label: year.toString() };
  });

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getSelectedPeriodText = () => {
    if (timeRange === 'custom') {
      const monthName = months.find(m => m.value === selectedMonth)?.label || 'Unknown';
      return `${monthName} ${selectedYear}`;
    }
    return timeRange;
  };

  const getFilteredData = () => {
    if (timeRange === 'custom') {
      // Filter data based on selected month and year
      const filteredUserActivity = userActivity.filter(day => {
        const date = new Date(day.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      });
      
      // For demo purposes, we'll return the original data
      // In a real app, you'd filter based on the selected period
      return {
        userActivity: filteredUserActivity.length > 0 ? filteredUserActivity : userActivity,
        metrics: metrics // Keep original metrics for demo
      };
    }
    
    return {
      userActivity,
      metrics
    };
  };

  const fetchRealTimeData = async () => {
    setIsLoading(true);
    try {
      const serverUrl = getAdminApiUrl();
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${serverUrl}/api/admin/analytics/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMetrics(result.data.metrics);
        }
        setLastUpdated(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchRealTimeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const generateCSV = () => {
    const csvData = [
      ['Metric', 'Value', 'Growth', 'Trend'],
      ['Total Users', metrics.users.total.toLocaleString(), `${metrics.users.growth}%`, metrics.users.trend],
      ['Total Revenue', `₹${(metrics.revenue.total/1000000).toFixed(1)}M`, `${metrics.revenue.growth}%`, metrics.revenue.trend],
      ['Active Projects', metrics.projects.total, `${metrics.projects.growth}%`, metrics.projects.trend],
      ['Carbon Offset', `${metrics.carbonOffset.total.toLocaleString()} kg`, `${metrics.carbonOffset.growth}%`, metrics.carbonOffset.trend],
      [''],
      ['Top Projects', 'Carbon Offset (kg)', 'Funding %', 'Contributors', 'Growth %'],
      ...topProjects.map(project => [
        project.name,
        project.carbonOffset.toLocaleString(),
        project.funding,
        project.contributors.toLocaleString(),
        project.growth
      ]),
      [''],
             ['User Activity', 'New Users', 'Active Users', 'Contributions'],
       ...getFilteredData().userActivity.map(day => [
         day.date,
         day.newUsers,
         day.activeUsers,
         day.contributions
       ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    return csvContent;
  };

  const generatePDF = () => {
    // Create a simple HTML structure for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .metric { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .metric h3 { margin: 0 0 10px 0; color: #333; }
            .metric p { margin: 5px 0; }
            .growth { color: green; }
            .decline { color: red; }
          </style>
        </head>
        <body>
          <h1>Analytics Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                     <p><strong>Time Range:</strong> ${getSelectedPeriodText()}</p>
          
          <h2>Key Metrics</h2>
          <div class="metric">
            <h3>Total Users</h3>
            <p><strong>Value:</strong> ${metrics.users.total.toLocaleString()}</p>
            <p class="${metrics.users.trend === 'up' ? 'growth' : 'decline'}"><strong>Growth:</strong> +${metrics.users.growth}%</p>
          </div>
          <div class="metric">
            <h3>Total Revenue</h3>
            <p><strong>Value:</strong> ₹${(metrics.revenue.total/1000000).toFixed(1)}M</p>
            <p class="${metrics.revenue.trend === 'up' ? 'growth' : 'decline'}"><strong>Growth:</strong> +${metrics.revenue.growth}%</p>
          </div>
          <div class="metric">
            <h3>Active Projects</h3>
            <p><strong>Value:</strong> ${metrics.projects.total}</p>
            <p class="${metrics.projects.trend === 'up' ? 'growth' : 'decline'}"><strong>Growth:</strong> +${metrics.projects.growth}%</p>
          </div>
          <div class="metric">
            <h3>Carbon Offset</h3>
            <p><strong>Value:</strong> ${metrics.carbonOffset.total.toLocaleString()} kg</p>
            <p class="${metrics.carbonOffset.trend === 'up' ? 'growth' : 'decline'}"><strong>Growth:</strong> +${metrics.carbonOffset.growth}%</p>
          </div>
          
          <h2>Top Performing Projects</h2>
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Carbon Offset (kg)</th>
                <th>Funding %</th>
                <th>Contributors</th>
                <th>Growth %</th>
              </tr>
            </thead>
            <tbody>
              ${topProjects.map(project => `
                <tr>
                  <td>${project.name}</td>
                  <td>${project.carbonOffset.toLocaleString()}</td>
                  <td>${project.funding}%</td>
                  <td>${project.contributors.toLocaleString()}</td>
                  <td>+${project.growth}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>User Activity</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>New Users</th>
                <th>Active Users</th>
                <th>Contributions</th>
              </tr>
            </thead>
            <tbody>
                             ${getFilteredData().userActivity.map(day => `
                 <tr>
                   <td>${day.date}</td>
                   <td>${day.newUsers}</td>
                   <td>${day.activeUsers}</td>
                   <td>${day.contributions}</td>
                 </tr>
               `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    return htmlContent;
  };

  const renderUserChart = (chartType) => {
    // Generate data for full year or specific month
    const data = [];
    
    if (userChartMonth === -1) {
      // Show full year data
      for (let month = 0; month < 12; month++) {
        const monthName = months[month].label;
        const baseValue = 100 + (month * 50) + (userChartYear - 2023) * 100;
        // Use deterministic variation based on month and year instead of Math.random()
        const variation = 0.85 + ((month + userChartYear) % 10) * 0.03;
        const users = Math.floor(baseValue * variation);
        
        data.push({
          month: monthName,
          monthNum: month,
          users: users,
          growth: month > 0 ? 5 + ((month + userChartYear) % 15) : 0
        });
      }
    } else {
      // Show specific month data (daily)
      const selectedMonthName = months.find(m => m.value === userChartMonth)?.label || 'January';
      const daysInMonth = new Date(userChartYear, userChartMonth + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const baseValue = 100 + (userChartMonth * 50) + (day * 2);
        // Use deterministic variation based on day, month and year
        const variation = 0.85 + ((day + userChartMonth + userChartYear) % 10) * 0.03;
        const users = Math.floor(baseValue * variation);
        
        data.push({
          day: day,
          month: selectedMonthName,
          users: users,
          growth: day > 1 ? 5 + ((day + userChartMonth + userChartYear) % 15) : 0
        });
      }
    }

    const commonProps = {
      data,
      margin: isMobile ? { top: 4, right: 8, left: 8, bottom: 8 } : { top: 5, right: 30, left: 20, bottom: 10 },
    };

    const tooltipStyle = {
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      color: 'hsl(var(--foreground))'
    };

    switch (chartType) {
             case 'area':
         return (
           <AreaChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={userChartMonth === -1 ? "month" : "day"} interval="preserveStartEnd" tickCount={isMobile ? 3 : 6} tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} domain={[0, 'auto']} allowDecimals={false} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`${value} users`, 'Users']} />
             <Area 
               type="monotone" 
               dataKey="users" 
               stroke="hsl(var(--primary))" 
               fill="hsl(var(--primary))" 
               fillOpacity={0.3}
               strokeWidth={2}
             />
           </AreaChart>
         );

             case 'line':
         return (
           <LineChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={userChartMonth === -1 ? "month" : "day"} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`${value} users`, 'Users']} />
             <Line 
               type="monotone" 
               dataKey="users" 
               stroke="hsl(var(--primary))" 
               strokeWidth={3}
               dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
               activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
             />
           </LineChart>
         );

       case 'bar':
         return (
           <BarChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={userChartMonth === -1 ? "month" : "day"} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`${value} users`, 'Users']} />
             <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
           </BarChart>
         );

             case 'pie':
         return (
           <PieChart>
             <Pie
               data={userChartMonth === -1 ? data.slice(-6) : data.slice(-7)} // Last 6 months or 7 days
               cx="50%"
               cy="50%"
               labelLine={false}
               label={userChartMonth === -1 ? ({ month, users }) => `${month}: ${users}` : ({ day, users }) => `Day ${day}: ${users}`}
               outerRadius={80}
               fill="#8884d8"
               dataKey="users"
             >
               {(userChartMonth === -1 ? data.slice(-6) : data.slice(-7)).map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 30}, 70%, 50%)`} />
               ))}
             </Pie>
             <Tooltip contentStyle={tooltipStyle} />
           </PieChart>
         );

       case 'radar':
         return (
           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userChartMonth === -1 ? data.slice(-6) : data.slice(-7)}>
             <PolarGrid />
             <PolarAngleAxis dataKey={userChartMonth === -1 ? "month" : "day"} />
             <PolarRadiusAxis />
             <Radar name="Users" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
             <Tooltip contentStyle={tooltipStyle} />
           </RadarChart>
         );

             default:
         return (
           <AreaChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={userChartMonth === -1 ? "month" : "day"} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`${value} users`, 'Users']} />
             <Area 
               type="monotone" 
               dataKey="users" 
               stroke="hsl(var(--primary))" 
               fill="hsl(var(--primary))" 
               fillOpacity={0.3}
               strokeWidth={2}
             />
           </AreaChart>
         );
    }
  };

  const renderRevenueChart = (chartType) => {
    // Generate revenue data for full year or specific month
    const data = [];
    
    if (revenueChartMonth === -1) {
      // Show full year data
      for (let month = 0; month < 12; month++) {
        const monthName = months[month].label;
        const baseValue = 50000 + (month * 10000) + (revenueChartYear - 2023) * 50000;
        // Use deterministic variation based on month and year instead of Math.random()
        const variation = 0.8 + ((month + revenueChartYear) % 10) * 0.04;
        const revenue = Math.floor(baseValue * variation);
        
        data.push({
          month: monthName,
          monthNum: month,
          revenue: revenue / 1000, // Convert to thousands for display
          growth: month > 0 ? 10 + ((month + revenueChartYear) % 20) : 0
        });
      }
    } else {
      // Show specific month data (daily)
      const selectedMonthName = months.find(m => m.value === revenueChartMonth)?.label || 'January';
      const daysInMonth = new Date(revenueChartYear, revenueChartMonth + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const baseValue = 50000 + (revenueChartMonth * 10000) + (day * 500);
        // Use deterministic variation based on day, month and year
        const variation = 0.8 + ((day + revenueChartMonth + revenueChartYear) % 10) * 0.04;
        const revenue = Math.floor(baseValue * variation);
        
        data.push({
          day: day,
          month: selectedMonthName,
          revenue: revenue / 1000, // Convert to thousands for display
          growth: day > 1 ? 10 + ((day + revenueChartMonth + revenueChartYear) % 20) : 0
        });
      }
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const tooltipStyle = {
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      color: 'hsl(var(--foreground))'
    };

         switch (chartType) {
       case 'line':
         return (
           <LineChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={revenueChartMonth === -1 ? "month" : "day"} interval="preserveStartEnd" tickCount={isMobile ? 3 : 6} tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} domain={[0, 'auto']} allowDecimals={false} tickFormatter={(value) => `₹${value}k`} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`₹${value}k`, 'Revenue']} />
             <Line 
               type="monotone" 
               dataKey="revenue" 
               stroke="hsl(var(--primary))" 
               strokeWidth={3}
               dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
               activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
             />
           </LineChart>
         );

       case 'area':
         return (
           <AreaChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={revenueChartMonth === -1 ? "month" : "day"} interval="preserveStartEnd" tickCount={isMobile ? 3 : 6} tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} domain={[0, 'auto']} allowDecimals={false} tickFormatter={(value) => `₹${value}k`} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`₹${value}k`, 'Revenue']} />
             <Area 
               type="monotone" 
               dataKey="revenue" 
               stroke="hsl(var(--primary))" 
               fill="hsl(var(--primary))" 
               fillOpacity={0.3}
               strokeWidth={2}
             />
           </AreaChart>
         );

       case 'bar':
         return (
           <BarChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={revenueChartMonth === -1 ? "month" : "day"} interval="preserveStartEnd" tickCount={isMobile ? 3 : 6} tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} domain={[0, 'auto']} allowDecimals={false} tickFormatter={(value) => `₹${value}k`} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`₹${value}k`, 'Revenue']} />
             <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
           </BarChart>
         );

       case 'combo':
         return (
           <ComposedChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={revenueChartMonth === -1 ? "month" : "day"} interval="preserveStartEnd" tickCount={isMobile ? 3 : 6} tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} tickLine={false} axisLine={false} domain={[0, 'auto']} allowDecimals={false} tickFormatter={(value) => `₹${value}k`} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`₹${value}k`, 'Revenue']} />
             <Area 
               type="monotone" 
               dataKey="revenue" 
               fill="hsl(var(--primary))" 
               fillOpacity={0.1}
               stroke="none"
             />
             <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
           </ComposedChart>
         );

       default:
         return (
           <LineChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey={revenueChartMonth === -1 ? "month" : "day"} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
             <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}k`} />
             <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} formatter={(value) => [`₹${value}k`, 'Revenue']} />
             <Line 
               type="monotone" 
               dataKey="revenue" 
               stroke="hsl(var(--primary))" 
               strokeWidth={3}
               dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
               activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
             />
           </LineChart>
         );
     }
  };

  const handleExportData = () => {
    let content, mimeType, filename;
    
    if (exportFormat === 'csv') {
      content = generateCSV();
      mimeType = 'text/csv';
      filename = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (exportFormat === 'pdf') {
      content = generatePDF();
      mimeType = 'text/html';
      filename = `analytics-export-${new Date().toISOString().split('T')[0]}.html`;
      
      // For PDF, we'll create an HTML file that can be printed to PDF
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    } else {
      // JSON fallback
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange,
        metrics,
        lastUpdated
      };
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      filename = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
           <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
           <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
           {timeRange === 'custom' && (
             <p className="text-sm text-primary font-medium mt-1">
               Showing data for: {getSelectedPeriodText()}
             </p>
           )}
         </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
           <Select value={timeRange} onValueChange={setTimeRange}>
             <SelectTrigger className="w-full sm:w-32">
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="7d">Last 7 days</SelectItem>
               <SelectItem value="30d">Last 30 days</SelectItem>
               <SelectItem value="90d">Last 90 days</SelectItem>
               <SelectItem value="1y">Last year</SelectItem>
               <SelectItem value="custom">Custom Period</SelectItem>
             </SelectContent>
           </Select>
           
           {timeRange === 'custom' && (
             <>
               <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                 <SelectTrigger className="w-32">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {months.map(month => (
                     <SelectItem key={month.value} value={month.value.toString()}>
                       {month.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               
               <Select value={selectedYear} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                 <SelectTrigger className="w-24">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {years.map(year => (
                     <SelectItem key={year.value} value={year.value.toString()}>
                       {year.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </>
           )}
          <Button 
            variant="outline" 
            onClick={fetchRealTimeData}
            disabled={isLoading}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Data
          </Button>
          <div className="relative w-full sm:w-auto" ref={exportMenuRef}>
            <Button 
              variant="default" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Download className="h-4 w-4" />
              Generate Report
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                    Export Format
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setExportFormat('csv');
                        setShowExportMenu(false);
                        handleExportData();
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => {
                        setExportFormat('pdf');
                        setShowExportMenu(false);
                        handleExportData();
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => {
                        setExportFormat('json');
                        setShowExportMenu(false);
                        handleExportData();
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      JSON Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(metrics.users.trend)}
              <span className={`ml-1 ${getTrendColor(metrics.users.trend)}`}>
                +{metrics.users.growth}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(metrics.revenue.total/1000000).toFixed(1)}M</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(metrics.revenue.trend)}
              <span className={`ml-1 ${getTrendColor(metrics.revenue.trend)}`}>
                +{metrics.revenue.growth}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.projects.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(metrics.projects.trend)}
              <span className={`ml-1 ${getTrendColor(metrics.projects.trend)}`}>
                +{metrics.projects.growth}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Offset</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.carbonOffset.total.toLocaleString()} kg</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(metrics.carbonOffset.trend)}
              <span className={`ml-1 ${getTrendColor(metrics.carbonOffset.trend)}`}>
                +{metrics.carbonOffset.growth}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* User Growth Chart */}
         <Card>
           <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="w-full sm:w-auto">
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </div>
              <div className="flex flex-wrap w-full sm:w-auto gap-2" aria-label="User growth chart filters">
                <Select value={userChartType} onValueChange={setUserChartType}>
                  <SelectTrigger className="min-w-[110px] sm:w-32 flex-1 sm:flex-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="pie">Pie</SelectItem>
                    <SelectItem value="radar">Radar</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userChartMonth.toString()} onValueChange={(value) => setUserChartMonth(parseInt(value))}>
                  <SelectTrigger className="min-w-[120px] sm:w-28 flex-1 sm:flex-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Full Year</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={userChartYear.toString()} onValueChange={(value) => setUserChartYear(parseInt(value))}>
                  <SelectTrigger className="min-w-[90px] sm:w-20 flex-1 sm:flex-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </CardHeader>
           <CardContent>
             <div className="h-48 sm:h-64 md:h-72">
               <ResponsiveContainer width="100%" height="100%">
                 {renderUserChart(userChartType)}
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>

                 {/* Revenue Chart */}
         <Card>
           <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div className="w-full sm:w-auto">
               <CardTitle>Revenue Trends</CardTitle>
               <CardDescription>Monthly revenue performance</CardDescription>
             </div>
             <div className="flex flex-wrap w-full sm:w-auto gap-2" aria-label="Revenue chart filters">
               <Select value={revenueChartType} onValueChange={setRevenueChartType}>
                 <SelectTrigger className="min-w-[110px] sm:w-32 flex-1 sm:flex-none">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="line">Line</SelectItem>
                   <SelectItem value="area">Area</SelectItem>
                   <SelectItem value="bar">Bar</SelectItem>
                   <SelectItem value="combo">Combo</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={revenueChartMonth.toString()} onValueChange={(value) => setRevenueChartMonth(parseInt(value))}>
                 <SelectTrigger className="min-w-[120px] sm:w-28 flex-1 sm:flex-none">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="-1">Full Year</SelectItem>
                   {months.map(month => (
                     <SelectItem key={month.value} value={month.value.toString()}>
                       {month.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Select value={revenueChartYear.toString()} onValueChange={(value) => setRevenueChartYear(parseInt(value))}>
                 <SelectTrigger className="min-w-[90px] sm:w-20 flex-1 sm:flex-none">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {years.map(year => (
                     <SelectItem key={year.value} value={year.value.toString()}>
                       {year.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </CardHeader>
           <CardContent>
             <div className="h-56 sm:h-64 md:h-72">
               <ResponsiveContainer width="100%" height="100%">
                 {renderRevenueChart(revenueChartType)}
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
      </div>

      {/* Top Performing Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Projects</CardTitle>
          <CardDescription>Projects with highest carbon offset and funding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div key={index} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors overflow-hidden">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-1 min-w-0">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge variant="secondary">
                      +{project.growth}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Target className="h-3 w-3" />
                      {project.carbonOffset.toLocaleString()} kg CO₂
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <DollarSign className="h-3 w-3" />
                      {project.funding}% funded
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Users className="h-3 w-3" />
                      {project.contributors.toLocaleString()} contributors
                    </span>
                  </div>
                </div>

                {/* Right growth block for larger screens */}
                <div className="hidden sm:block text-right">
                  <div className="text-lg font-bold text-green-600">+{project.growth}%</div>
                  <div className="text-xs text-muted-foreground">Growth</div>
                </div>

                {/* Floating growth badge on mobile to avoid overflow */}
                <Badge className="sm:hidden absolute top-2 right-2 bg-green-100 text-green-800">+{project.growth}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Daily user activity and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium whitespace-nowrap">Date</th>
                  <th className="text-left py-2 px-2 font-medium whitespace-nowrap">New</th>
                  <th className="text-left py-2 px-2 font-medium whitespace-nowrap">Active</th>
                  <th className="text-left py-2 px-2 font-medium whitespace-nowrap">Contrib</th>
                  <th className="text-right py-2 px-2 font-medium whitespace-nowrap">Growth</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredData().userActivity.map((day, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="py-2 px-2 whitespace-nowrap">{day.date}</td>
                    <td className="py-2 px-2">{day.newUsers}</td>
                    <td className="py-2 px-2">{day.activeUsers}</td>
                    <td className="py-2 px-2">{day.contributions}</td>
                    <td className="py-2 px-2">
                      <div className="flex justify-end">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          +{Math.floor(Math.random() * 20 + 5)}%
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>User and project distribution by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">North America</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Users</span>
                  <span>45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects</span>
                  <span>38%</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span>52%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Europe</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Users</span>
                  <span>32%</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects</span>
                  <span>28%</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span>35%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Asia Pacific</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Users</span>
                  <span>23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects</span>
                  <span>34%</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span>13%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage; 