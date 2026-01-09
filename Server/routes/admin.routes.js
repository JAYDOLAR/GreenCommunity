import express from 'express';
import { adminLogin, adminVerify, getUsers, updateUser, deleteUser, getDashboardStats, createProjectAdmin, updateProjectAdmin, deleteProjectAdmin } from '../controllers/admin.controller.js';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied: Admin privileges required' 
    });
  }
};

// Admin authentication routes
router.post('/auth', adminLogin);
router.get('/verify', authenticate, adminVerify);

// Admin dashboard routes
router.get('/dashboard/stats', authenticateAdmin, requireAdmin, getDashboardStats);

// Admin user management routes
router.get('/users', authenticateAdmin, requireAdmin, getUsers);
router.put('/users', authenticateAdmin, requireAdmin, updateUser);
router.delete('/users', authenticateAdmin, requireAdmin, deleteUser);

// Admin project management routes
router.post('/projects', authenticateAdmin, requireAdmin, createProjectAdmin);
router.put('/projects', authenticateAdmin, requireAdmin, updateProjectAdmin);
router.delete('/projects', authenticateAdmin, requireAdmin, deleteProjectAdmin);

export default router;
