'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import getAdminApiUrl from '@/lib/adminApi';
import useCurrency from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  TreePine,
  Target,
  TrendingUp,
  Eye,
  Filter,
  ChevronDown,
  CheckCircle,
  BarChart3,
  HardDrive,
  X
} from 'lucide-react';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('user-activity');
  const [timeRange, setTimeRange] = useState('30d');
  const [reportFormat, setReportFormat] = useState('pdf');
  const { getSymbol } = useCurrency();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState({});
  const [reports, setReports] = useState([]);
  const [reportTemplates, setReportTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports and templates from backend
  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const API_BASE = getAdminApiUrl();

      const headers = {};
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

      // Fetch reports
      const reportsResponse = await fetch(`${API_BASE}/api/admin/reports`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        if (reportsData.success && reportsData.reports) {
          setReports(reportsData.reports);
        }
      }

      // Fetch report templates
      const templatesResponse = await fetch(`${API_BASE}/api/admin/reports/templates`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        if (templatesData.success && templatesData.templates) {
          setReportTemplates(templatesData.templates);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      // Set default templates if fetch fails
      setReportTemplates([
        {
          id: 'user-activity',
          name: 'User Activity Report',
          icon: 'Users',
          description: 'Track user engagement, registrations, and activity patterns',
          metrics: ['New Users', 'Active Users', 'User Retention', 'Engagement Rate']
        },
        {
          id: 'revenue',
          name: 'Revenue Analysis Report',
          icon: 'DollarSign',
          description: 'Financial performance, revenue trends, and payment analytics',
          metrics: ['Total Revenue', 'Revenue Growth', 'Payment Methods', 'Revenue by Region']
        },
        {
          id: 'project-performance',
          name: 'Project Performance Report',
          icon: 'TreePine',
          description: 'Carbon offset project metrics and funding progress',
          metrics: ['Project Funding', 'Carbon Offset', 'Contributors', 'Project Status']
        },
        {
          id: 'carbon-impact',
          name: 'Carbon Offset Impact Report',
          icon: 'Target',
          description: 'Environmental impact and carbon reduction achievements',
          metrics: ['Carbon Offset', 'Environmental Impact', 'Project Efficiency', 'Impact Metrics']
        },
        {
          id: 'marketplace',
          name: 'Marketplace Sales Report',
          icon: 'TrendingUp',
          description: 'Eco-friendly product sales and inventory management',
          metrics: ['Product Sales', 'Inventory Levels', 'Customer Satisfaction', 'Sales Trends']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedTemplate = reportTemplates.find(t => t.id === selectedReport);

  const generateReport = async () => {
    // Show confirmation popup
    const confirmed = window.confirm(
      `Generate ${selectedTemplate.name}?\n\n` +
      `Report Type: ${selectedTemplate.name}\n` +
      `Time Range: ${timeRange}\n` +
      `Format: ${reportFormat.toUpperCase()}\n\n` +
      `This will generate and download the report automatically.`
    );

    if (!confirmed) {
      return;
    }

    setIsGenerating(true);

    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const API_BASE = getAdminApiUrl();

      const headers = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

      const response = await fetch(`${API_BASE}/api/admin/reports/generate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          type: selectedReport,
          timeRange,
          format: reportFormat
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();

      if (result.success && result.report) {
        const newReport = result.report;
        
        // Format the date
        newReport.lastGenerated = new Date(newReport.lastGenerated).toISOString().split('T')[0];
        
        // Add to local state
        setGeneratedReports(prev => [newReport, ...prev]);
        
        // Refresh reports list
        await fetchReportsData();

        // Automatically download the generated report
        downloadReport(newReport, reportFormat);

        // Show success popup (only for CSV; PDF opens print dialog automatically)
        if (reportFormat === 'csv') {
          alert(`Report Generated Successfully!\n\n` +
            `Report: ${newReport.name}\n` +
            `Date: ${newReport.lastGenerated}\n` +
            `Format: CSV\n\n` +
            `The CSV file has been downloaded.`
          );
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Build metric rows from real report.data based on report type
  const getReportMetricRows = (report) => {
    const data = report.data || {};
    switch (report.type) {
      case 'user-activity':
        return [
          ['Total Users', (data.totalUsers ?? 0).toLocaleString()],
          ['Active Users', (data.activeUsers ?? 0).toLocaleString()],
          ['User Retention', `${data.userRetention ?? 0}%`],
          ['Engagement Rate', `${data.engagementRate ?? 0}%`],
        ];
      case 'revenue':
        return [
          ['Total Revenue', `${getSymbol()}${(data.totalRevenue ?? 0).toLocaleString()}`],
          ['Order Count', (data.orderCount ?? 0).toLocaleString()],
          ['Revenue Growth', `+${data.revenueGrowth ?? 0}%`],
        ];
      case 'project-performance':
        return [
          ['Total Projects', (data.totalProjects ?? 0).toLocaleString()],
          ['Active Projects', (data.activeProjects ?? 0).toLocaleString()],
          ['Total Funding', `${getSymbol()}${(data.totalFunding ?? 0).toLocaleString()}`],
          ['Total Carbon Offset', `${(data.totalCarbonOffset ?? 0).toLocaleString()} kg`],
        ];
      case 'carbon-impact':
        return [
          ['Carbon Offset', `${(data.carbonOffset ?? 0).toLocaleString()} kg`],
          ['Project Count', (data.projectCount ?? 0).toLocaleString()],
          ['Environmental Impact', `${(data.environmentalImpact ?? 0).toLocaleString()} trees`],
          ['Impact Growth', `+${data.impactGrowth ?? 0}%`],
        ];
      case 'marketplace':
        return [
          ['Total Sales', `${getSymbol()}${(data.totalSales ?? 0).toLocaleString()}`],
          ['Order Count', (data.orderCount ?? 0).toLocaleString()],
          ['Sales Growth', `+${data.salesGrowth ?? 0}%`],
        ];
      default:
        // Generic: render each key-value pair from data
        return Object.entries(data).map(([key, value]) => [
          key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
          typeof value === 'number' ? value.toLocaleString() : String(value),
        ]);
    }
  };

  const downloadReport = (report, format = 'pdf') => {
    const metricRows = getReportMetricRows(report);
    const dateStr = report.lastGenerated || new Date().toISOString().split('T')[0];
    const fileName = `${report.name.replace(/\s+/g, '-')}-${dateStr}`;

    if (format === 'csv') {
      // Build CSV from real data
      const csvRows = [
        ['Report Name', report.name],
        ['Generated Date', dateStr],
        ['Time Range', report.timeRange || timeRange],
        ['Description', report.description || ''],
        [],
        ['Metric', 'Value'],
        ...metricRows,
      ];

      const escapeCsv = (val) => {
        const s = String(val ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const csvContent = csvRows.map(row => row.map(escapeCsv).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // Generate a proper PDF by opening a print-ready window
      const tableRows = metricRows
        .map(([metric, value]) => `<tr><td>${metric}</td><td>${value}</td></tr>`)
        .join('');

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${report.name}</title>
  <style>
    @page { margin: 20mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 30px; color: #333; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 26px; color: #166534; }
    .header-meta { text-align: right; font-size: 13px; color: #555; }
    .description { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px; }
    h2 { color: #166534; font-size: 18px; margin-top: 28px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #d1d5db; padding: 10px 14px; text-align: left; }
    th { background-color: #22c55e; color: white; font-weight: 600; }
    tr:nth-child(even) { background-color: #f9fafb; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #d1d5db; text-align: center; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${report.name}</h1>
      <p style="margin:4px 0 0;color:#555;">Green Community Platform</p>
    </div>
    <div class="header-meta">
      <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
      <div><strong>Period:</strong> ${report.timeRange || timeRange}</div>
      <div><strong>Format:</strong> ${format.toUpperCase()}</div>
    </div>
  </div>

  <div class="description">${report.description || ''}</div>

  <h2>Key Metrics</h2>
  <table>
    <thead><tr><th>Metric</th><th>Value</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">
    <p>Generated by Green Community Platform &mdash; ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

      // Open in a new window and trigger the browser print dialog for proper PDF
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // Wait for content to render, then trigger print (Save as PDF)
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 300);
        };
        // Fallback if onload already fired
        setTimeout(() => printWindow.print(), 500);
      } else {
        // Fallback: download as HTML if popup blocked
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('Popup was blocked. The report has been downloaded as HTML.\nOpen it and press Ctrl+P / Cmd+P to save as PDF.');
      }
    }
  };

  const viewReport = (report) => {
    // For demo purposes, we'll just log the report details
    console.log('Viewing report:', report);
    alert(`Viewing ${report.name}\n\nThis would open a detailed view of the report in a new window or modal.`);
  };

  // Handle click outside to close download menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.download-menu')) {
        setShowDownloadMenu({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and manage comprehensive reports</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto justify-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter Reports
          </Button>
          <Button variant="default" className="w-full sm:w-auto justify-center" onClick={generateReport} disabled={isGenerating}>
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create custom reports with specific metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => {
                      // Map icon name to actual icon component
                      const iconMap = {
                        'Users': Users,
                        'DollarSign': DollarSign,
                        'TreePine': TreePine,
                        'Target': Target,
                        'TrendingUp': TrendingUp
                      };
                      const Icon = iconMap[template.icon] || FileText;
                      
                      return (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {template.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Report Format</label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF (Professional Report)</SelectItem>
                    <SelectItem value="csv">CSV (Data Analysis)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-accent/20 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedTemplate.description}
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Included Metrics:</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.metrics.map((metric) => (
                        <Badge key={metric} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={generateReport} disabled={isGenerating}>
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Report...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Report Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Reports</span>
                <span className="font-medium">{reports.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ready Reports</span>
                <span className="font-medium">{reports.filter(r => r.status === 'ready').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Generating</span>
                <span className="font-medium">{reports.filter(r => r.status === 'generating').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Size</span>
                <span className="font-medium">13.9 MB</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>View and download generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading reports...
                </div>
              ) : [...generatedReports, ...reports].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet. Generate your first report above.
                </div>
              ) : (
                <div className="space-y-4">
                  {[...generatedReports, ...reports].map((report) => (
                    <div key={report.id || report._id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{report.name}</h3>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.format}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {report.description}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Generated {typeof report.lastGenerated === 'string' ? report.lastGenerated : new Date(report.lastGenerated).toLocaleDateString()}
                          </span>
                          <span>Size: {report.size}</span>
                          <span>Format: {report.format}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => viewReport(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDownloadMenu(prev => ({ ...prev, [report.id || report._id]: !prev[report.id || report._id] }))}
                          >
                            <Download className="h-4 w-4" />
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                          {showDownloadMenu[report.id || report._id] && (
                            <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg z-50 min-w-[120px] download-menu">
                              <div className="p-1">
                                <button
                                  onClick={() => {
                                    downloadReport(report, 'pdf');
                                    setShowDownloadMenu(prev => ({ ...prev, [report.id || report._id]: false }));
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                                >
                                  Download PDF
                                </button>
                                <button
                                  onClick={() => {
                                    downloadReport(report, 'csv');
                                    setShowDownloadMenu(prev => ({ ...prev, [report.id || report._id]: false }));
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                                >
                                  Download CSV
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automatically generated reports on schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg overflow-hidden">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-1 min-w-0">
                  <h3 className="font-medium">Weekly User Activity Report</h3>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground break-words">
                  Generated every Monday at 9:00 AM
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground mt-1">
                  <span className="whitespace-nowrap">Next: Monday, Jan 22, 2024</span>
                  <span className="whitespace-nowrap">Recipients: 3</span>
                </div>
              </div>

              <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Button variant="ghost" size="sm" title="View">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg overflow-hidden">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-1 min-w-0">
                  <h3 className="font-medium">Monthly Revenue Report</h3>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground break-words">
                  Generated on the 1st of every month at 6:00 AM
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground mt-1">
                  <span className="whitespace-nowrap">Next: Feb 1, 2024</span>
                  <span className="whitespace-nowrap">Recipients: 5</span>
                </div>
              </div>

              <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Button variant="ghost" size="sm" title="View">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage; 