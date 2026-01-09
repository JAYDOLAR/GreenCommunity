import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { getUserModel } from '../models/User.model.js';
import { initializeUserInfoModel } from '../models/UserInfo.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// Import model functions for dashboard stats
import { getUserPointsModel } from '../models/UserPoints.model.js';
import { getEventModel } from '../models/Event.model.js';
import { getChallengeModel } from '../models/Challenge.model.js';
import { getGroupModel } from '../models/Group.model.js';
import { getProjectModel } from '../models/Project.model.js';

/**
 * Admin login handler
 * This authenticates admins by checking their role in the database
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  try {
    // Get the User model
    const User = await getUserModel();
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    
    // Create admin token with admin flag
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );
    
    // Set token in cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

/**
 * Admin verification handler
 * This verifies the admin token and returns the admin user info
 */
export const adminVerify = asyncHandler(async (req, res) => {
  // The authenticate middleware already verified the token
  // We just need to check if the user is an admin
  const user = req.user;
  
  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }
  
  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * Update user
 * This allows admins to update user details
 */
export const updateUser = asyncHandler(async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate user ID
    if (!userData.id || !mongoose.Types.ObjectId.isValid(userData.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    // Get user model
    const User = await getUserModel();
    
    // Find the user
    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update allowed fields only
    const allowedFields = ['name', 'email', 'role', 'isEmailVerified'];
    allowedFields.forEach(field => {
      if (userData[field] !== undefined) {
        user[field] = userData[field];
      }
    });

    // Map requested status to underlying fields
    if (userData.status !== undefined) {
      const status = String(userData.status).toLowerCase();
      if (status === 'active') {
        user.isEmailVerified = true;
        user.lockUntil = undefined;
      } else if (status === 'inactive') {
        user.isEmailVerified = false;
        user.lockUntil = undefined;
      } else if (status === 'suspended') {
        // Lock account for a long time (1 year) to represent suspension
        const oneYearMs = 365 * 24 * 60 * 60 * 1000;
        user.lockUntil = new Date(Date.now() + oneYearMs);
      }
    }
    
    // Save the updated user
    await user.save();
    
    // Return the updated user
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        status: user.lockUntil && user.lockUntil > new Date() ? 'suspended' : (user.isEmailVerified ? 'active' : 'inactive'),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

/**
 * Delete user
 * This allows admins to delete users
 */
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;
    
    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Get user model
    const User = await getUserModel();
    
    // Delete the user
    const result = await User.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

/**
 * Get dashboard statistics for admin overview
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const User = await getUserModel();
    const UserPoints = await getUserPointsModel();
    const Event = await getEventModel();
    const Challenge = await getChallengeModel();
    const Group = await getGroupModel();
    
    // Time ranges for statistics
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isEmailVerified: true });
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: yesterday } 
    });
    const newUsersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: lastWeek } 
    });
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: lastMonth } 
    });
    
    // Community statistics
    const totalChallenges = await Challenge.countDocuments();
    const activeChallenges = await Challenge.countDocuments({ 
      status: 'active',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ 
      date: { $gte: today } 
    });
    const totalGroups = await Group.countDocuments();
    
    // Points and engagement statistics
    const totalPointsAwarded = await UserPoints.aggregate([
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$points' } 
        } 
      }
    ]);
    
    const activeUsersWithPoints = await UserPoints.distinct('userId');
    
    // User growth over time (last 30 days)
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);
    
    // User role distribution
    const userRoleDistribution = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Top users by points
    const topUsers = await UserPoints.aggregate([
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$points" }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get user details for top users
    const topUserIds = topUsers.map(u => u._id);
    const topUserDetails = await User.find({ 
      _id: { $in: topUserIds } 
    }).select('name email');
    
    const topUsersWithDetails = topUsers.map(pointsUser => {
      const userDetail = topUserDetails.find(u => u._id.toString() === pointsUser._id.toString());
      return {
        userId: pointsUser._id,
        name: userDetail?.name || 'Unknown User',
        email: userDetail?.email || 'Unknown Email',
        totalPoints: pointsUser.totalPoints
      };
    });
    
    // Recent activity summary
    const recentActivity = {
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeChallenges,
      upcomingEvents
    };
    
    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          growth: {
            today: newUsersToday,
            week: newUsersThisWeek,
            month: newUsersThisMonth
          },
          roleDistribution: userRoleDistribution
        },
        community: {
          challenges: {
            total: totalChallenges,
            active: activeChallenges
          },
          events: {
            total: totalEvents,
            upcoming: upcomingEvents
          },
          groups: {
            total: totalGroups
          }
        },
        engagement: {
          totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
          activeUsersWithPoints: activeUsersWithPoints.length,
          topUsers: topUsersWithDetails
        },
        growth: userGrowthData,
        recentActivity
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get all users (for admin dashboard)
 * This returns a paginated list of all users in the system with filtering
 */
export const getUsers = asyncHandler(async (req, res) => {
  try {
    // Get pagination and filter parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'all';
    const roleFilter = req.query.role || 'all';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Get user model
    const User = await getUserModel();
    
    // Build search query
    let searchQuery = {};
    
    // Add text search
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter (assuming we'll add a status field to User model)
    if (statusFilter !== 'all') {
      // For now, we'll use isEmailVerified as a status indicator
      if (statusFilter === 'active') {
        searchQuery.isEmailVerified = true;
      } else if (statusFilter === 'inactive') {
        searchQuery.isEmailVerified = false;
      }
      // We can add more status types later when we add a proper status field
    }
    
    // Add role filter
    if (roleFilter !== 'all') {
      searchQuery.role = roleFilter;
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Count total users matching the query
    const total = await User.countDocuments(searchQuery);
    
    // Get users with pagination, filtering, and sorting
    const users = await User.find(searchQuery)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -trustedDevices')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    // Fetch UserInfo records for avatars (Cloudinary URLs) in parallel
    const UserInfo = await initializeUserInfoModel();
    const userIds = users.map(u => u._id);
    let userInfos = [];
    if (userIds.length > 0) {
      userInfos = await UserInfo.find({ userId: { $in: userIds } })
        .select('userId avatar.url')
        .lean();
    }
    const userIdToAvatarUrl = new Map(
      userInfos.map(ui => [String(ui.userId), ui.avatar?.url || null])
    );
    
    // Calculate statistics
    const totalStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { 
            $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] } 
          },
          adminUsers: { 
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } 
          },
          moderatorUsers: { 
            $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } 
          },
          regularUsers: { 
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } 
          }
        }
      }
    ]);
    
    // Format users for admin display
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: (user.lockUntil && user.lockUntil > new Date()) ? 'suspended' : (user.isEmailVerified ? 'active' : 'inactive'),
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Avatar for admin list (Cloudinary or other)
      avatar: user.profile?.avatar_url || userIdToAvatarUrl.get(String(user._id)) || null,
      // Add marketplace profile info if available
      isSeller: user.marketplace_profile?.is_seller || false,
      sellerStatus: user.marketplace_profile?.seller_status || null,
      // Add basic profile info
      location: user.profile?.location || null,
      totalPoints: 0 // Will be populated from UserPoints if needed
    }));
    
    // Get recent activity stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Return comprehensive results
    return res.status(200).json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: totalStats[0]?.totalUsers || 0,
        active: totalStats[0]?.activeUsers || 0,
        admin: totalStats[0]?.adminUsers || 0,
        moderator: totalStats[0]?.moderatorUsers || 0,
        regular: totalStats[0]?.regularUsers || 0,
        recentSignups: recentUsers
      },
      filters: {
        search,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Admin: Create project
 * Uses existing Project model and database
 */
export const createProjectAdmin = asyncHandler(async (req, res) => {
  const Project = await getProjectModel();
  const body = req.body || {};

  // Map incoming admin fields to Project schema
  const mapped = {
    name: body.name,
    location: body.location,
    type: body.type,
    region: body.region || 'unknown',
    description: body.description || '',
    image: body.image || '',
    status: (body.status === 'active') ? 'active' : (body.status === 'rejected' ? 'on-hold' : 'planned'),
    fundingGoal: body.totalFunding != null ? Number(body.totalFunding) : (body.fundingGoal != null ? Number(body.fundingGoal) : 0),
    currentFunding: body.currentFunding != null ? Number(body.currentFunding) : 0,
    verified: !!body.verified,
    featured: !!body.featured,
    endDate: body.expectedCompletion ? new Date(body.expectedCompletion) : undefined,
  };

  // Basic validation
  if (!mapped.name || !mapped.location || !mapped.type) {
    return res.status(400).json({ success: false, message: 'Missing required fields: name, location, type' });
  }

  const project = new Project(mapped);
  await project.save();

  return res.status(201).json({ success: true, message: 'Project created', project });
});

/**
 * Admin: Update project
 */
export const updateProjectAdmin = asyncHandler(async (req, res) => {
  const Project = await getProjectModel();
  const body = req.body || {};
  const id = body.id || body._id;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Project id is required' });
  }

  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.location !== undefined) updates.location = body.location;
  if (body.type !== undefined) updates.type = body.type;
  if (body.region !== undefined) updates.region = body.region || 'unknown';
  if (body.description !== undefined) updates.description = body.description;
  if (body.image !== undefined) updates.image = body.image;
  if (body.status !== undefined) updates.status = (body.status === 'active') ? 'active' : (body.status === 'rejected' ? 'on-hold' : 'planned');
  if (body.totalFunding !== undefined) updates.fundingGoal = Number(body.totalFunding);
  if (body.fundingGoal !== undefined) updates.fundingGoal = Number(body.fundingGoal);
  if (body.currentFunding !== undefined) updates.currentFunding = Number(body.currentFunding);
  if (body.verified !== undefined) updates.verified = !!body.verified;
  if (body.featured !== undefined) updates.featured = !!body.featured;
  if (body.expectedCompletion !== undefined) updates.endDate = body.expectedCompletion ? new Date(body.expectedCompletion) : undefined;

  const updated = await Project.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  return res.status(200).json({ success: true, message: 'Project updated', project: updated });
});

/**
 * Admin: Delete project
 */
export const deleteProjectAdmin = asyncHandler(async (req, res) => {
  const Project = await getProjectModel();
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Project id is required' });
  }
  const deleted = await Project.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  return res.status(200).json({ success: true, message: 'Project deleted' });
});
