import { getUserModel } from '../models/User.model.js';
import { getProjectModel } from '../models/Project.model.js';
import { getOrderModel } from '../models/Order.model.js';
import ActivityLog from '../models/ActivityLog.model.js';

// Get real-time dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get model instances
    const User = await getUserModel();
    const Project = await getProjectModel();
    const Order = await getOrderModel();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total projects
    const totalProjects = await Project.countDocuments();
    
    // Get active projects
    const activeProjects = await Project.countDocuments({ status: 'active' });
    
    // Get pending projects (could be 'planned' status based on schema)
    const pendingProjects = await Project.countDocuments({ 
      status: { $in: ['planned', 'on-hold'] } 
    });
    
    // Calculate total revenue from orders
    const revenueData = await Order.aggregate([
      {
        $match: {
          payment_status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' }
        }
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Calculate carbon offset from all projects (using impact.carbonOffset field)
    const carbonData = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalCarbonOffset: { $sum: '$impact.carbonOffset' },
          totalCo2Removed: { $sum: '$co2Removed' }
        }
      }
    ]);
    const carbonOffset = carbonData.length > 0 
      ? (carbonData[0].totalCarbonOffset || 0) + (carbonData[0].totalCo2Removed || 0)
      : 0;
    
    // Count total contributors from projects
    const contributorsData = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalContributors: { $sum: '$contributors' }
        }
      }
    ]);
    const totalContributors = contributorsData.length > 0 
      ? contributorsData[0].totalContributors || 0 
      : 0;
    
    // Calculate monthly growth (users created in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const previousUsers = await User.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
    });
    
    const monthlyGrowth = previousUsers > 0 
      ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100) 
      : 0;

    console.log('📊 Dashboard Stats:', {
      totalUsers,
      totalProjects,
      totalRevenue,
      carbonOffset,
      activeProjects,
      pendingProjects,
      totalContributors,
      monthlyGrowth
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        totalRevenue: Math.round(totalRevenue),
        carbonOffset: Math.round(carbonOffset),
        activeProjects,
        pendingProjects,
        totalContributors,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get recent activity logs
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .lean();

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

// Create activity log (for internal use)
export const createActivity = async (activityData) => {
  try {
    const activity = new ActivityLog(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
};
