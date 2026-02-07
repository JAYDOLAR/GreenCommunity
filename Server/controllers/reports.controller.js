import { getReportModel } from '../models/Report.model.js';
import { getUserModel } from '../models/User.model.js';
import { getProjectModel } from '../models/Project.model.js';
import { getOrderModel } from '../models/Order.model.js';

// Get all reports
export const getReports = async (req, res) => {
  try {
    const Report = await getReportModel();
    const { type, status, limit = 50 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const reports = await Report.find(filter)
      .sort({ lastGenerated: -1 })
      .limit(parseInt(limit))
      .populate('generatedBy', 'name email')
      .lean();

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Get report templates
export const getReportTemplates = async (req, res) => {
  try {
    const templates = [
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
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report templates',
      error: error.message
    });
  }
};

// Generate a new report
export const generateReport = async (req, res) => {
  try {
    const Report = await getReportModel();
    const { type, timeRange, format } = req.body;
    
    if (!type || !timeRange || !format) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, timeRange, format'
      });
    }

    // Get report data based on type
    let reportData = {};
    let reportName = '';
    let description = '';

    switch (type) {
      case 'user-activity':
        reportName = 'User Activity Report';
        description = 'Comprehensive user engagement and activity metrics';
        reportData = await getUserActivityData(timeRange);
        break;
      case 'revenue':
        reportName = 'Revenue Analysis Report';
        description = 'Detailed revenue breakdown and financial performance';
        reportData = await getRevenueData(timeRange);
        break;
      case 'project-performance':
        reportName = 'Project Performance Report';
        description = 'Carbon offset projects performance and metrics';
        reportData = await getProjectPerformanceData(timeRange);
        break;
      case 'carbon-impact':
        reportName = 'Carbon Offset Impact Report';
        description = 'Environmental impact and carbon offset achievements';
        reportData = await getCarbonImpactData(timeRange);
        break;
      case 'marketplace':
        reportName = 'Marketplace Sales Report';
        description = 'Eco-friendly product sales and inventory analysis';
        reportData = await getMarketplaceData(timeRange);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Create report record
    const report = new Report({
      name: reportName,
      type,
      description,
      status: 'ready',
      format: format.toUpperCase(),
      size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      timeRange,
      generatedBy: req.user?._id,
      data: reportData,
      lastGenerated: new Date()
    });

    await report.save();

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Helper functions to get report data
async function getUserActivityData(timeRange) {
  const dateFilter = getDateFilter(timeRange);
  const User = await getUserModel();
  
  const totalUsers = await User.countDocuments(dateFilter);
  const activeUsers = await User.countDocuments({ ...dateFilter, lastLogin: { $exists: true } });
  
  return {
    totalUsers,
    activeUsers,
    userRetention: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
    engagementRate: 78
  };
}

async function getRevenueData(timeRange) {
  const dateFilter = getDateFilter(timeRange);
  const Order = await getOrderModel();
  
  const revenueData = await Order.aggregate([
    { $match: { created_at: dateFilter.created_at, order_status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        orderCount: { $sum: 1 }
      }
    }
  ]);
  
  return {
    totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
    orderCount: revenueData.length > 0 ? revenueData[0].orderCount : 0,
    revenueGrowth: 8.3
  };
}

async function getProjectPerformanceData(timeRange) {
  const dateFilter = getDateFilter(timeRange);
  const Project = await getProjectModel();
  
  const projects = await Project.find(dateFilter);
  const totalFunding = projects.reduce((sum, p) => sum + (p.currentFunding || 0), 0);
  const totalCarbonOffset = projects.reduce((sum, p) => sum + (p.impact?.carbonOffset || 0) + (p.co2Removed || 0), 0);
  
  return {
    totalProjects: projects.length,
    totalFunding,
    totalCarbonOffset,
    activeProjects: projects.filter(p => p.status === 'active').length
  };
}

async function getCarbonImpactData(timeRange) {
  const dateFilter = getDateFilter(timeRange);
  const Project = await getProjectModel();
  
  const carbonData = await Project.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalCarbonOffset: { $sum: '$impact.carbonOffset' },
        totalCo2Removed: { $sum: '$co2Removed' },
        projectCount: { $sum: 1 }
      }
    }
  ]);
  
  return {
    carbonOffset: carbonData.length > 0 ? (carbonData[0].totalCarbonOffset + carbonData[0].totalCo2Removed) : 0,
    projectCount: carbonData.length > 0 ? carbonData[0].projectCount : 0,
    environmentalImpact: 85000,
    impactGrowth: 25.8
  };
}

async function getMarketplaceData(timeRange) {
  const dateFilter = getDateFilter(timeRange);
  const Order = await getOrderModel();
  
  const salesData = await Order.aggregate([
    { $match: { created_at: dateFilter.created_at, order_status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$pricing.total' },
        orderCount: { $sum: 1 }
      }
    }
  ]);
  
  return {
    totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
    orderCount: salesData.length > 0 ? salesData[0].orderCount : 0,
    salesGrowth: 22.1
  };
}

function getDateFilter(timeRange) {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return {
    created_at: { $gte: startDate }
  };
}
