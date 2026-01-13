import { apiRequest, API_BASE_URL } from './api';

// Transform backend project to client format
const transformProject = (backendProject) => {
  // Handle image format (can be string or object with url/publicId)
  let imageUrl = '/tree1.jpg'; // Default fallback
  
  if (backendProject.image) {
    if (typeof backendProject.image === 'string') {
      imageUrl = backendProject.image.startsWith('http') 
        ? backendProject.image
        : `${API_BASE_URL}${backendProject.image}`;
    } else if (typeof backendProject.image === 'object' && backendProject.image.url) {
      imageUrl = backendProject.image.url;
    }
  }

  return {
    id: backendProject._id,
    _id: backendProject._id,
    name: backendProject.name,
    description: backendProject.description,
    location: backendProject.location,
    type: backendProject.type,
    status: backendProject.status || 'pending',
    image: imageUrl,
    totalFunding: backendProject.totalFunding || backendProject.fundingGoal || 0,
    fundingGoal: backendProject.fundingGoal || backendProject.totalFunding || 0,
    currentFunding: backendProject.currentFunding || 0,
    contributors: backendProject.contributors || 0,
    co2Removed: backendProject.co2Removed || backendProject.impact?.carbonOffset || 0,
    verified: backendProject.verified || false,
    featured: backendProject.featured || false,
    createdDate: backendProject.created_at || backendProject.createdAt,
    expectedCompletion: backendProject.expectedCompletion || backendProject.endDate,
    teamSize: backendProject.teamSize || 0,
    carbonOffsetTarget: backendProject.carbonOffsetTarget || 0,
    co2PerRupee: backendProject.co2PerRupee || 0.001,
    benefits: backendProject.benefits || [],
    certifications: backendProject.certifications || [],
    impact: backendProject.impact || {},
    blockchain: backendProject.blockchain || null,
    credits: backendProject.credits || 0,
    documents: backendProject.documents || [],
    region: backendProject.region,
    category: backendProject.category,
    coordinates: backendProject.coordinates,
    organization: backendProject.organization,
    verification: backendProject.verification,
    _original: backendProject
  };
};

// Projects API service
export const projectsApi = {
  // Get all projects with filtering
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters.region) {
        params.append('region', filters.region);
      }

      if (filters.verified !== undefined) {
        params.append('verified', filters.verified);
      }

      if (filters.featured !== undefined) {
        params.append('featured', filters.featured);
      }

      params.append('page', filters.page || 1);
      params.append('limit', filters.limit || 20);

      const response = await apiRequest(`/api/projects?${params.toString()}`);

      return {
        ...response,
        data: {
          ...response.data,
          projects: (response.data?.projects || []).map(transformProject)
        }
      };
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return {
        success: false,
        data: {
          projects: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalProjects: 0
          }
        },
        error: error.message
      };
    }
  },

  // Get single project by ID
  async getProjectById(id) {
    try {
      const response = await apiRequest(`/api/projects/${id}`);
      return {
        ...response,
        data: transformProject(response.data)
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Get featured projects
  async getFeaturedProjects(limit = 6) {
    try {
      const response = await apiRequest(`/api/projects/featured?limit=${limit}`);
      return {
        ...response,
        data: (response.data || []).map(transformProject)
      };
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
  },

  // Get projects by region
  async getProjectsByRegion(region) {
    try {
      const response = await apiRequest(`/api/projects/region/${region}`);
      return {
        ...response,
        data: (response.data || []).map(transformProject)
      };
    } catch (error) {
      console.error('Error fetching projects by region:', error);
      throw error;
    }
  },

  // Get project statistics
  async getProjectStats() {
    try {
      const response = await apiRequest('/api/projects/stats');
      return response;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  },

  // Get nearby working projects
  async getNearbyWorkingProjects(lat, lng, radius = 50) {
    try {
      const params = new URLSearchParams({ lat, lng, radius });
      const response = await apiRequest(`/api/projects/nearby-working?${params.toString()}`);
      return {
        ...response,
        data: (response.data || []).map(transformProject)
      };
    } catch (error) {
      console.error('Error fetching nearby projects:', error);
      throw error;
    }
  },

  // Admin operations - Create Project with Cloudinary image
  async createProject(projectData, imageFile = null, documentFiles = []) {
    try {
      const formData = new FormData();
      
      // Add single project image
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Add project data
      formData.append('name', projectData.name);
      formData.append('description', projectData.description || '');
      formData.append('location', projectData.location);
      formData.append('type', projectData.type);
      formData.append('status', projectData.status || 'pending');
      formData.append('totalFunding', parseFloat(projectData.totalFunding || 0));
      
      if (projectData.verified !== undefined) {
        formData.append('verified', projectData.verified);
      }
      
      if (projectData.featured !== undefined) {
        formData.append('featured', projectData.featured);
      }
      
      if (projectData.expectedCompletion) {
        formData.append('expectedCompletion', projectData.expectedCompletion);
      }
      
      if (projectData.teamSize) {
        formData.append('teamSize', parseInt(projectData.teamSize));
      }
      
      if (projectData.carbonOffsetTarget) {
        formData.append('carbonOffsetTarget', parseInt(projectData.carbonOffsetTarget));
      }

      if (projectData.credits) {
        formData.append('credits', parseInt(projectData.credits));
      }

      // Add documents for IPFS (if any)
      if (projectData.documents && projectData.documents.length > 0) {
        formData.append('documents', JSON.stringify(projectData.documents));
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create project: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: transformProject(result.data),
        documents: result.documents || []
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update Project with Cloudinary image
  async updateProject(projectId, projectData, imageFile = null) {
    try {
      const formData = new FormData();
      
      // Add new image if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Add updated project data
      Object.keys(projectData || {}).forEach(key => {
        const value = projectData[key];
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update project: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: transformProject(result.data)
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete Project (also deletes Cloudinary image)
  async deleteProject(projectId) {
    try {
      const response = await apiRequest(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Blockchain operations
  async syncProject(projectId) {
    try {
      const response = await apiRequest(`/api/blockchain/projects/${projectId}/sync`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error syncing project:', error);
      throw error;
    }
  },

  async approveAndRegisterProject(projectId, blockchainData) {
    try {
      const response = await apiRequest(`/api/projects/${projectId}/approve-register`, {
        method: 'POST',
        body: JSON.stringify(blockchainData)
      });
      return response;
    } catch (error) {
      console.error('Error approving project:', error);
      throw error;
    }
  },

  async grantFiatPurchase(projectId, purchaseData) {
    try {
      const response = await apiRequest(`/api/projects/${projectId}/grant-fiat`, {
        method: 'POST',
        body: JSON.stringify(purchaseData)
      });
      return response;
    } catch (error) {
      console.error('Error granting fiat purchase:', error);
      throw error;
    }
  }
};

export default projectsApi;
