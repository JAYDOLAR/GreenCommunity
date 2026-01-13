import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Order from '../models/Order.model.js';
import FootprintLog from '../models/FootprintLog.model.js';

/**
 * Get analytics metrics for admin dashboard
 * Aggregates real data from database for user growth, revenue, projects, carbon offset
 */
export const getAnalyticsMetrics = async (req, res) => {
  try {
    const { timeRange = '30d', month, year } = req.query;

    // Calculate date ranges
    const now = new Date();
    let startDate, endDate;

    if (month !== undefined && year) {
      // Specific month/year
      startDate = new Date(parseInt(year), parseInt(month), 1);
      endDate = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59);
    } else {
      // Time range
      endDate = now;
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
    }

    // Get total users
    const totalUsers = await User.countDocuments();
    const usersInRange = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get previous period for growth calculation
    const periodDuration = endDate - startDate;
    const previousStart = new Date(startDate.getTime() - periodDuration);
    const usersInPreviousPeriod = await User.countDocuments({
      createdAt: { $gte: previousStart, $lt: startDate }
    });

    const userGrowth = usersInPreviousPeriod > 0
      ? ((usersInRange - usersInPreviousPeriod) / usersInPreviousPeriod) * 100
      : 100;

    // Get user registration trend (monthly data for the year)
    const userTrendData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Fill in missing months with 0
    const userDataByMonth = Array(12).fill(0);
    userTrendData.forEach(item => {
      userDataByMonth[item._id - 1] = item.count;
    });

    // Get revenue metrics from orders
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get previous revenue for growth
    const previousRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStart, $lt: startDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    const prevRevenue = previousRevenue.length > 0 ? previousRevenue[0].total : 0;
    const revenueGrowth = prevRevenue > 0
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
      : 100;

    // Get monthly revenue trend
    const revenueTrendData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), 0, 1) },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const revenueDataByMonth = Array(12).fill(0);
    revenueTrendData.forEach(item => {
      revenueDataByMonth[item._id - 1] = item.total;
    });

    // Get project metrics
    const totalProjects = await Project.countDocuments({ status: 'active' });
    const projectsInRange = await Project.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const previousProjects = await Project.countDocuments({
      createdAt: { $gte: previousStart, $lt: startDate }
    });

    const projectGrowth = previousProjects > 0
      ? ((projectsInRange - previousProjects) / previousProjects) * 100
      : 100;

    // Get monthly project trend
    const projectTrendData = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const projectDataByMonth = Array(12).fill(0);
    projectTrendData.forEach(item => {
      projectDataByMonth[item._id - 1] = item.count;
    });

    // Get carbon offset metrics
    const carbonOffsetData = await Project.aggregate([
      {
        $match: {
          status: 'active',
          'metrics.carbonOffset': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$metrics.carbonOffset' }
        }
      }
    ]);

    const totalCarbonOffset = carbonOffsetData.length > 0 ? carbonOffsetData[0].total : 0;

    // Carbon offset growth (simplified - using project growth as proxy)
    const carbonGrowth = projectGrowth;

    // Monthly carbon offset trend
    const carbonDataByMonth = projectDataByMonth.map(count => count * 2500); // Average offset per project

    // Get top projects by carbon offset
    const topProjects = await Project.find({ status: 'active' })
      .sort({ 'metrics.carbonOffset': -1 })
      .limit(5)
      .select('name metrics.carbonOffset funding.currentAmount funding.targetAmount createdAt')
      .lean();

    const formattedTopProjects = topProjects.map(project => {
      // Count unique contributors (from orders)
      const fundingPercentage = project.funding?.targetAmount > 0
        ? (project.funding.currentAmount / project.funding.targetAmount) * 100
        : 0;

      return {
        name: project.name,
        carbonOffset: project.metrics?.carbonOffset || 0,
        funding: Math.round(fundingPercentage),
        contributors: 0, // Would need to aggregate from orders
        growth: 0 // Would need historical data
      };
    });

    // Get user activity data (last 7 days)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const userActivityData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format user activity for last 7 days
    const formattedUserActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const activity = userActivityData.find(a => a._id === dateStr);

      formattedUserActivity.push({
        date: dateStr,
        newUsers: activity ? activity.newUsers : 0,
        activeUsers: totalUsers, // Simplified - would need login tracking
        contributions: 0 // Would need to aggregate from orders/donations
      });
    }

    res.json({
      success: true,
      data: {
        metrics: {
          users: {
            total: totalUsers,
            growth: Math.round(userGrowth * 10) / 10,
            trend: userGrowth >= 0 ? 'up' : 'down',
            data: userDataByMonth
          },
          revenue: {
            total: Math.round(totalRevenue),
            growth: Math.round(revenueGrowth * 10) / 10,
            trend: revenueGrowth >= 0 ? 'up' : 'down',
            data: revenueDataByMonth
          },
          projects: {
            total: totalProjects,
            growth: Math.round(projectGrowth * 10) / 10,
            trend: projectGrowth >= 0 ? 'up' : 'down',
            data: projectDataByMonth
          },
          carbonOffset: {
            total: Math.round(totalCarbonOffset),
            growth: Math.round(carbonGrowth * 10) / 10,
            trend: carbonGrowth >= 0 ? 'up' : 'down',
            data: carbonDataByMonth
          }
        },
        topProjects: formattedTopProjects,
        userActivity: formattedUserActivity
      }
    });
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics metrics',
      error: error.message
    });
  }
};
