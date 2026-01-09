import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { getUserModel } from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';

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
    const allowedFields = ['name', 'email', 'role', 'status', 'isEmailVerified'];
    allowedFields.forEach(field => {
      if (userData[field] !== undefined) {
        user[field] = userData[field];
      }
    });
    
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
        status: user.status,
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
 * Get all users (for admin dashboard)
 * This returns a paginated list of all users in the system
 */
export const getUsers = asyncHandler(async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Get user model
    const User = await getUserModel();
    
    // Build search query
    const searchQuery = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ] 
        } 
      : {};
    
    // Count total users
    const total = await User.countDocuments(searchQuery);
    
    // Get users with pagination and sorting
    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return paginated results
    return res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});
