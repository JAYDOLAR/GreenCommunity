'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState({});

  const [reports] = useState([
    {
      id: 1,
      name: 'User Activity Report',
      type: 'user-activity',
      description: 'Comprehensive user engagement and activity metrics',
      lastGenerated: '2024-01-20',
      status: 'ready',
      size: '2.3 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Revenue Analysis Report',
      type: 'revenue',
      description: 'Detailed revenue breakdown and financial performance',
      lastGenerated: '2024-01-19',
      status: 'ready',
      size: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 3,
      name: 'Project Performance Report',
      type: 'project-performance',
      description: 'Carbon offset projects performance and metrics',
      lastGenerated: '2024-01-18',
      status: 'generating',
      size: '3.1 MB',
      format: 'PDF'
    },
    {
      id: 4,
      name: 'Carbon Offset Impact Report',
      type: 'carbon-impact',
      description: 'Environmental impact and carbon offset achievements',
      lastGenerated: '2024-01-17',
      status: 'ready',
      size: '4.2 MB',
      format: 'PDF'
    },
    {
      id: 5,
      name: 'Marketplace Sales Report',
      type: 'marketplace',
      description: 'Eco-friendly product sales and inventory analysis',
      lastGenerated: '2024-01-16',
      status: 'ready',
      size: '1.5 MB',
      format: 'PDF'
    }
  ]);

  const [reportTemplates] = useState([
    {
      id: 'user-activity',
      name: 'User Activity Report',
      icon: Users,
      description: 'Track user engagement, registrations, and activity patterns',
      metrics: ['New Users', 'Active Users', 'User Retention', 'Engagement Rate']
    },
    {
      id: 'revenue',
      name: 'Revenue Analysis Report',
      icon: DollarSign,
      description: 'Financial performance, revenue trends, and payment analytics',
      metrics: ['Total Revenue', 'Revenue Growth', 'Payment Methods', 'Revenue by Region']
    },
    {
      id: 'project-performance',
      name: 'Project Performance Report',
      icon: TreePine,
      description: 'Carbon offset project metrics and funding progress',
      metrics: ['Project Funding', 'Carbon Offset', 'Contributors', 'Project Status']
    },
    {
      id: 'carbon-impact',
      name: 'Carbon Offset Impact Report',
      icon: Target,
      description: 'Environmental impact and carbon reduction achievements',
      metrics: ['Carbon Offset', 'Environmental Impact', 'Project Efficiency', 'Impact Metrics']
    },
    {
      id: 'marketplace',
      name: 'Marketplace Sales Report',
      icon: TrendingUp,
      description: 'Eco-friendly product sales and inventory management',
      metrics: ['Product Sales', 'Inventory Levels', 'Customer Satisfaction', 'Sales Trends']
    }
  ]);

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
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newReport = {
        id: Date.now(),
        name: selectedTemplate.name,
        type: selectedReport,
        description: selectedTemplate.description,
        lastGenerated: new Date().toISOString().split('T')[0],
        status: 'ready',
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        format: reportFormat.toUpperCase()
      };

      setGeneratedReports(prev => [newReport, ...prev]);

      // Automatically download the generated report
      downloadReport(newReport, reportFormat);

      // Show success popup
      alert(`Report Generated Successfully!\n\n` +
        `Report: ${selectedTemplate.name}\n` +
        `Date: ${newReport.lastGenerated}\n` +
        `Format: ${reportFormat.toUpperCase()}\n` +
        `Size: ${newReport.size}\n\n` +
        `The report has been downloaded automatically.`
      );
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report, format = 'pdf') => {
    if (format === 'csv') {
      // Generate CSV content
      const csvData = [
        ['Report Name', report.name],
        ['Generated Date', report.lastGenerated],
        ['Time Range', timeRange],
        ['Description', report.description],
        [''],
        ['Metric', 'Value', 'Status', 'Growth'],
        ['Total Users', '1,247', 'Active', '+12.5%'],
        ['Total Revenue', '₹1.25M', 'Growing', '+8.3%'],
        ['Active Projects', '45', 'Active', '+15.2%'],
        ['Carbon Offset', '125,000 kg', 'On Track', '+18.7%'],
        ['Marketplace Sales', '₹450K', 'Growing', '+22.1%'],
        ['User Engagement', '78%', 'High', '+5.2%'],
        ['Project Funding', '₹2.1M', 'On Track', '+14.3%'],
        ['Environmental Impact', '85,000 trees', 'Excellent', '+25.8%']
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '-')}-${report.lastGenerated}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // Generate PDF content (HTML that can be printed to PDF)
      const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${report.name}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
                color: #333;
              }
              h1 { 
                color: #2c3e50; 
                border-bottom: 3px solid #3498db; 
                padding-bottom: 10px; 
                margin-bottom: 30px;
                font-size: 28px;
              }
              h2 { 
                color: #34495e; 
                margin-top: 30px; 
                margin-bottom: 15px;
                font-size: 20px;
                border-left: 4px solid #3498db;
                padding-left: 10px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
              }
              th { 
                background-color: #3498db; 
                color: white; 
                font-weight: bold;
              }
              tr:nth-child(even) { background-color: #f8f9fa; }
              .metric { 
                margin: 20px 0; 
                padding: 20px; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                background-color: #f8f9fa;
              }
              .metric h3 { 
                margin: 0 0 10px 0; 
                color: #2c3e50; 
                font-size: 18px;
              }
              .metric p { margin: 8px 0; }
              .header-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 15px;
                background-color: #ecf0f1;
                border-radius: 8px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
              }
              .status-active { background-color: #d4edda; color: #155724; }
              .status-growing { background-color: #d1ecf1; color: #0c5460; }
              .status-excellent { background-color: #fff3cd; color: #856404; }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
              }
              .summary-card {
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: white;
              }
              .summary-card h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 16px;
              }
              .summary-card p {
                margin: 5px 0;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <h1>${report.name}</h1>
            
            <div class="header-info">
              <div>
                <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
                <strong>Time Range:</strong> ${timeRange}<br>
                <strong>Report Type:</strong> ${report.name}
              </div>
              <div>
                <strong>Status:</strong> <span class="status-badge status-active">Ready</span><br>
                <strong>Format:</strong> PDF<br>
                <strong>Size:</strong> ${report.size}
              </div>
            </div>
            
            <h2>Report Summary</h2>
            <div class="metric">
              <h3>Report Description</h3>
              <p>${report.description}</p>
            </div>
            
            <h2>Key Metrics Overview</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>User Metrics</h3>
                <p><strong>Total Users:</strong> 1,247</p>
                <p><strong>Active Users:</strong> 892</p>
                <p><strong>Growth Rate:</strong> +12.5%</p>
              </div>
              <div class="summary-card">
                <h3>Financial Metrics</h3>
                <p><strong>Total Revenue:</strong> ₹1.25M</p>
                <p><strong>Revenue Growth:</strong> +8.3%</p>
                <p><strong>Marketplace Sales:</strong> ₹450K</p>
              </div>
              <div class="summary-card">
                <h3>Project Metrics</h3>
                <p><strong>Active Projects:</strong> 45</p>
                <p><strong>Project Funding:</strong> ₹2.1M</p>
                <p><strong>Funding Rate:</strong> +14.3%</p>
              </div>
              <div class="summary-card">
                <h3>Environmental Impact</h3>
                <p><strong>Carbon Offset:</strong> 125,000 kg</p>
                <p><strong>Trees Planted:</strong> 85,000</p>
                <p><strong>Impact Growth:</strong> +25.8%</p>
              </div>
            </div>
            
            <h2>Detailed Metrics</h2>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Users</td>
                  <td>1,247</td>
                  <td><span class="status-badge status-active">Active</span></td>
                  <td>+12.5%</td>
                </tr>
                <tr>
                  <td>Total Revenue</td>
                  <td>₹1.25M</td>
                  <td><span class="status-badge status-growing">Growing</span></td>
                  <td>+8.3%</td>
                </tr>
                <tr>
                  <td>Active Projects</td>
                  <td>45</td>
                  <td><span class="status-badge status-active">Active</span></td>
                  <td>+15.2%</td>
                </tr>
                <tr>
                  <td>Carbon Offset</td>
                  <td>125,000 kg</td>
                  <td><span class="status-badge status-active">On Track</span></td>
                  <td>+18.7%</td>
                </tr>
                <tr>
                  <td>Marketplace Sales</td>
                  <td>₹450K</td>
                  <td><span class="status-badge status-growing">Growing</span></td>
                  <td>+22.1%</td>
                </tr>
                <tr>
                  <td>User Engagement</td>
                  <td>78%</td>
                  <td><span class="status-badge status-excellent">High</span></td>
                  <td>+5.2%</td>
                </tr>
                <tr>
                  <td>Project Funding</td>
                  <td>₹2.1M</td>
                  <td><span class="status-badge status-active">On Track</span></td>
                  <td>+14.3%</td>
                </tr>
                <tr>
                  <td>Environmental Impact</td>
                  <td>85,000 trees</td>
                  <td><span class="status-badge status-excellent">Excellent</span></td>
                  <td>+25.8%</td>
                </tr>
              </tbody>
            </table>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
              <p><strong>Generated by Green Community Platform</strong></p>
              <p>This report was automatically generated on ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '-')}-${report.lastGenerated}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show instructions for PDF conversion
      setTimeout(() => {
        alert('HTML file downloaded! To convert to PDF:\n\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (or Cmd+P on Mac)\n3. Select "Save as PDF" in the print dialog\n4. Click "Save"');
      }, 100);
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
                      const Icon = template.icon;
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
              <div className="space-y-4">
                {[...generatedReports, ...reports].map((report) => (
                  <div key={report.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors overflow-hidden">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                        <h3 className="font-medium">{report.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline">
                          {report.format}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2 break-words">
                        {report.description}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="h-3 w-3" />
                          Generated {report.lastGenerated}
                        </span>
                        <span className="whitespace-nowrap">Size: {report.size}</span>
                        <span className="whitespace-nowrap">Format: {report.format}</span>
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <Button variant="ghost" size="sm" onClick={() => viewReport(report)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDownloadMenu(prev => ({ ...prev, [report.id]: !prev[report.id] }))}
                        >
                          <Download className="h-4 w-4" />
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                        {showDownloadMenu[report.id] && (
                          <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg z-50 min-w-[120px] download-menu">
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  downloadReport(report, 'pdf');
                                  setShowDownloadMenu(prev => ({ ...prev, [report.id]: false }));
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                              >
                                Download PDF
                              </button>
                              <button
                                onClick={() => {
                                  downloadReport(report, 'csv');
                                  setShowDownloadMenu(prev => ({ ...prev, [report.id]: false }));
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