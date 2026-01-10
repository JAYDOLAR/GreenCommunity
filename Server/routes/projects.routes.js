import express from 'express';
import {
  getProjects,
  getProjectById,
  getFeaturedProjects,
  getProjectsByRegion,
  getProjectStats,
  approveAndRegisterProject,
  grantFiatPurchaseController
} from '../controllers/projects.controller.js';
import { submitProjectForVerification, markProjectInReview, rejectProject, quoteCryptoPurchase, getRetireCalldata, retireCreditsUser } from '../controllers/projects.controller.js';
import { authenticateAdmin, authenticate } from '../middleware/auth.js';
import { validateApproveProject, validateGrantFiat } from '../middleware/validation.js';
import { validationResult } from 'express-validator';

function handleValidation(req, res, next){
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });
  next();
}
// TODO: add role-based admin check middleware

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/stats', getProjectStats);
router.get('/region/:region', getProjectsByRegion);
router.get('/:id', getProjectById);

// Admin blockchain actions
router.post('/:id/approve-register', authenticateAdmin, validateApproveProject, handleValidation, approveAndRegisterProject);
router.post('/:id/grant-fiat', authenticateAdmin, validateGrantFiat, handleValidation, grantFiatPurchaseController);
router.post('/:id/submit', authenticateAdmin, submitProjectForVerification); // assuming admin triggers; adjust auth if creators submit
router.post('/:id/in-review', authenticateAdmin, markProjectInReview);
router.post('/:id/reject', authenticateAdmin, rejectProject);
router.get('/:id/quote', quoteCryptoPurchase);
router.get('/:id/retire-calldata', authenticateAdmin, getRetireCalldata);
router.post('/:id/retire', authenticate, retireCreditsUser);

export default router;
