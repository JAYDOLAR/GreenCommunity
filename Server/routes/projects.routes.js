import express from 'express';
import {
  getProjects,
  getProjectById,
  getFeaturedProjects,
  getProjectsByRegion,
  getProjectStats
} from '../controllers/projects.controller.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/stats', getProjectStats);
router.get('/region/:region', getProjectsByRegion);
router.get('/:id', getProjectById);

export default router;
