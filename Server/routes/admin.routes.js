import express from 'express';
import { adminLogin, adminVerify, getUsers, updateUser, deleteUser } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';

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

// Admin user management routes
router.get('/users', authenticate, requireAdmin, getUsers);
router.put('/users', authenticate, requireAdmin, updateUser);
router.delete('/users', authenticate, requireAdmin, deleteUser);

export default router;
