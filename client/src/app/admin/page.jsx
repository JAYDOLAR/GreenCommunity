'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TreePine, 
  DollarSign, 
  TrendingUp, 
  Target,
  Activity,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  FileTextIcon,
  RefreshCw,
  Eye,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 1, // Default to 1 to prevent division by zero
    totalProjects: 1, // Default to 1 to prevent division by zero
    totalRevenue: 0,
    carbonOffset: 0,
    activeProjects: 0,
    pendingProjects: 0,
    totalContributors: 0,
    monthlyGrowth: 0
  });

  const fetchRealTimeData = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.warn('No admin token found');
        return;
      }
      
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.stats) {
        setDashboardStats(prevStats => ({
          ...prevStats,
          ...data.stats
        }));
      } else {
        console.error('Dashboard stats API error:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default values to prevent division by zero
      setDashboardStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers || 1,
        totalProjects: prevStats.totalProjects || 1
      }));
    }
  };

  const handleGenerateReport = async (format) => {
    setIsGeneratingReport(true);
    try {
      // Fetch fresh data for the report
      await fetchRealTimeData();
      
      if (format === 'excel') {
        await generateExcelReport();
      } else if (format === 'pdf') {
        await generatePDFReport();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
      setShowExportOptions(false);
    }
  };

  const generateExcelReport = async () => {
    try {
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Users', (dashboardStats.totalUsers || 0).toLocaleString('en-US')],
        ['Total Projects', (dashboardStats.totalProjects || 0).toLocaleString('en-US')],
        ['Total Revenue', `₹${(dashboardStats.totalRevenue || 0).toLocaleString('en-US')}`],
        ['Carbon Offset', `${(dashboardStats.carbonOffset || 0).toLocaleString('en-US')} kg`],
        ['Active Projects', (dashboardStats.activeProjects || 0).toLocaleString('en-US')],
        ['Pending Projects', (dashboardStats.pendingProjects || 0).toLocaleString('en-US')],
        ['Total Contributors', (dashboardStats.totalContributors || 0).toLocaleString('en-US')],
        ['Monthly Growth', `${dashboardStats.monthlyGrowth || 0}%`],
        ['Report Generated', new Date().toLocaleDateString('en-US')]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating Excel report:', error);
      throw error;
    }
  };

  const generatePDFReport = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admin Dashboard Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .stat-item { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
              .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
              .stat-label { color: #666; margin-top: 5px; }
              .footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>GreenCommunity Admin Dashboard Report</h1>
              <p>Generated on ${new Date().toLocaleDateString('en-US')}</p>
            </div>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${(dashboardStats.totalUsers || 0).toLocaleString('en-US')}</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${(dashboardStats.totalProjects || 0).toLocaleString('en-US')}</div>
                <div class="stat-label">Total Projects</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">₹${(dashboardStats.totalRevenue || 0).toLocaleString('en-US')}</div>
                <div class="stat-label">Total Revenue</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${(dashboardStats.carbonOffset || 0).toLocaleString('en-US')} kg</div>
                <div class="stat-label">Carbon Offset</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${(dashboardStats.activeProjects || 0).toLocaleString('en-US')}</div>
                <div class="stat-label">Active Projects</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${(dashboardStats.pendingProjects || 0).toLocaleString('en-US')}</div>
                <div class="stat-label">Pending Projects</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${(dashboardStats.totalContributors || 0).toLocaleString('en-US')}</div>
                <div class="stat-label">Total Contributors</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${dashboardStats.monthlyGrowth || 0}%</div>
                <div class="stat-label">Monthly Growth</div>
              </div>
            </div>
            <div class="footer">
              <p>This report was automatically generated by the GreenCommunity Admin Dashboard</p>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-dashboard-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  };

  const handleViewAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/admin/analytics');
    } catch (error) {
      console.error('Failed to navigate to analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Only fetch data after component is mounted to avoid SSR issues
    if (typeof window !== 'undefined') {
      fetchRealTimeData();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportOptions && !event.target.closest('.export-options')) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportOptions]);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRealTimeData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <div className="relative export-options">
            <Button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              disabled={isGeneratingReport}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </Button>
            {showExportOptions && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleGenerateReport('excel')}
                    disabled={isGeneratingReport}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleGenerateReport('pdf')}
                    disabled={isGeneratingReport}
                  >
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleViewAnalytics} disabled={isLoadingAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {isLoadingAnalytics ? 'Loading...' : 'View Analytics'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardStats.totalUsers || 0).toLocaleString('en-US')}</div>
            <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth || 0}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardStats.totalProjects || 0).toLocaleString('en-US')}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.activeProjects || 0} active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(dashboardStats.totalRevenue || 0).toLocaleString('en-US')}</div>
            <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth || 0}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Offset</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardStats.carbonOffset || 0).toLocaleString('en-US')} kg</div>
            <p className="text-xs text-muted-foreground">CO₂ removed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
            <CardDescription>Distribution of projects by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Active Projects</span>
                </div>
                <span className="text-sm font-medium">{dashboardStats.activeProjects || 0}</span>
              </div>
              <Progress value={dashboardStats.totalProjects > 0 ? (dashboardStats.activeProjects / dashboardStats.totalProjects) * 100 : 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pending Projects</span>
                </div>
                <span className="text-sm font-medium">{dashboardStats.pendingProjects || 0}</span>
              </div>
              <Progress value={dashboardStats.totalProjects > 0 ? (dashboardStats.pendingProjects / dashboardStats.totalProjects) * 100 : 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Total Contributors</span>
                </div>
                <span className="text-sm font-medium">{dashboardStats.totalContributors || 0}</span>
              </div>
              <Progress value={dashboardStats.totalUsers > 0 ? (dashboardStats.totalContributors / dashboardStats.totalUsers) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TreePine className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Project approved</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Carbon offset milestone</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => router.push('/admin/users')}>
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => router.push('/admin/projects')}>
              <TreePine className="h-6 w-6" />
              <span>Manage Projects</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => router.push('/admin/marketplace')}>
              <DollarSign className="h-6 w-6" />
              <span>Marketplace</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 