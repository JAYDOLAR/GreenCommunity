import { getProjectModel } from '../models/Project.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all projects with filtering and pagination
export const getProjects = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    
    const {
      page = 1,
      limit = 10,
      type,
      region,
      status,
      category,
      featured,
      search
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [projects, totalProjects] = await Promise.all([
      Project.find(filter)
        .sort({ featured: -1, created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalProjects / limitNum);
    
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProjects,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get single project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    const { id } = req.params;
    
    const project = await Project.findById(id).lean();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Get featured projects
export const getFeaturedProjects = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    const limit = parseInt(req.query.limit) || 6;
    
    const projects = await Project.find({ featured: true, status: 'active' })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects',
      error: error.message
    });
  }
});

// Get projects by region
export const getProjectsByRegion = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    const { region } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const projects = await Project.find({ 
      region: { $regex: region, $options: 'i' },
      status: 'active'
    })
      .sort({ featured: -1, created_at: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects by region',
      error: error.message
    });
  }
});

// Get project statistics
export const getProjectStats = asyncHandler(async (req, res) => {
  try {
    const Project = await getProjectModel();
    
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalCarbonOffset: { $sum: '$impact.carbonOffset' },
          totalArea: { $sum: '$impact.area' },
          totalBeneficiaries: { $sum: '$impact.beneficiaries' },
          totalFunding: { $sum: '$currentFunding' }
        }
      }
    ]);
    
    const projectsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const projectsByRegion = await Project.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byCategory: projectsByCategory,
        byRegion: projectsByRegion
      }
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
});
