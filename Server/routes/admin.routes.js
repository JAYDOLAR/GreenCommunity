import express from 'express';
import { 
  adminLogin, 
  adminVerify, 
  adminLogout,
  getUsers, 
  updateUser, 
  deleteUser, 
  getDashboardStats, 
  createProjectAdmin, 
  updateProjectAdmin, 
  deleteProjectAdmin, 
  submitProjectForReview, 
  markProjectInReview, 
  approveAndRegisterProject, 
  rejectProject, 
  updateAutoRetireBps, 
  updateProjectAutoRetire,
  registerExistingProjectOnBlockchain,
  getProjectBlockchainStatus
} from '../controllers/admin.controller.js';
import { getAnalyticsMetrics } from '../controllers/analytics.controller.js';
import { 
  getSecurityThreats, 
  getSecurityLogs, 
  createSecurityThreat, 
  createSecurityLog, 
  updateSecurityThreat 
} from '../controllers/security.controller.js';
import { 
  getNotifications, 
  createNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../controllers/notification.controller.js';
import { 
  getDashboardStats as getDashboardStatsController, 
  getRecentActivities 
} from '../controllers/dashboard.controller.js';
import { 
  getReports, 
  getReportTemplates, 
  generateReport 
} from '../controllers/reports.controller.js';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/fileUpload.js';

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
router.post('/logout', adminLogout);

// Admin dashboard routes
router.get('/dashboard/stats', authenticateAdmin, requireAdmin, getDashboardStatsController);
router.get('/dashboard/activities', authenticateAdmin, requireAdmin, getRecentActivities);
router.get('/analytics/metrics', authenticateAdmin, requireAdmin, getAnalyticsMetrics);

// Reports routes
router.get('/reports', authenticateAdmin, requireAdmin, getReports);
router.get('/reports/templates', authenticateAdmin, requireAdmin, getReportTemplates);
router.post('/reports/generate', authenticateAdmin, requireAdmin, generateReport);

// Security routes
router.get('/security/threats', authenticateAdmin, requireAdmin, getSecurityThreats);
router.get('/security/logs', authenticateAdmin, requireAdmin, getSecurityLogs);
router.post('/security/threats', authenticateAdmin, requireAdmin, createSecurityThreat);
router.post('/security/logs', authenticateAdmin, requireAdmin, createSecurityLog);
router.put('/security/threats', authenticateAdmin, requireAdmin, updateSecurityThreat);

// Notification routes
router.get('/notifications', authenticateAdmin, requireAdmin, getNotifications);
router.post('/notifications', authenticateAdmin, requireAdmin, createNotification);
router.put('/notifications/read', authenticateAdmin, requireAdmin, markAsRead);
router.put('/notifications/read-all', authenticateAdmin, requireAdmin, markAllAsRead);
router.delete('/notifications', authenticateAdmin, requireAdmin, deleteNotification);

// Admin user management routes
router.get('/users', authenticateAdmin, requireAdmin, getUsers);
router.put('/users', authenticateAdmin, requireAdmin, updateUser);
router.delete('/users', authenticateAdmin, requireAdmin, deleteUser);

// Admin project management routes
router.post('/projects', authenticateAdmin, requireAdmin, createProjectAdmin);
router.put('/projects', authenticateAdmin, requireAdmin, updateProjectAdmin);
router.delete('/projects', authenticateAdmin, requireAdmin, deleteProjectAdmin);
router.post('/projects/submit', authenticateAdmin, requireAdmin, submitProjectForReview);
router.post('/projects/in-review', authenticateAdmin, requireAdmin, markProjectInReview);
router.post('/projects/approve', authenticateAdmin, requireAdmin, approveAndRegisterProject);
router.post('/projects/reject', authenticateAdmin, requireAdmin, rejectProject);

// New blockchain integration routes
router.post('/projects/:projectId/register-blockchain', authenticateAdmin, requireAdmin, registerExistingProjectOnBlockchain);
router.get('/projects/:projectId/blockchain-status', authenticateAdmin, requireAdmin, getProjectBlockchainStatus);
router.post('/blockchain/auto-retire', authenticateAdmin, requireAdmin, updateAutoRetireBps);
router.post('/blockchain/project-auto-retire', authenticateAdmin, requireAdmin, updateProjectAutoRetire);

// IPFS document upload route
router.post('/projects/upload-doc', authenticateAdmin, requireAdmin, upload.single('file'), async (req,res)=>{
  try {
    if(!req.file) return res.status(400).json({ success:false, message:'No file provided' });
    const { addFileFromBuffer } = await import('../services/localIpfs.service.js');
    const { cid, uri } = await addFileFromBuffer(req.file.buffer, req.file.originalname);
    return res.json({ success:true, name: req.file.originalname, size: req.file.size, cid, uri });
  } catch (e) {
    console.error('IPFS upload error', e);
    return res.status(500).json({ success:false, message:'Upload failed', error: e.message });
  }
});

// IPFS health route
router.get('/ipfs/health', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const { ipfsHealth } = await import('../services/localIpfs.service.js');
    const info = await ipfsHealth();
    res.json({ success: true, ...info });
  } catch (e) {
    res.status(500).json({ success: false, message: 'IPFS health check failed', error: e.message });
  }
});

export default router;
