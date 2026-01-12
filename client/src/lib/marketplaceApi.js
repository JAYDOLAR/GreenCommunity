import { apiRequest, API_BASE_URL } from './api';
import {
  CATEGORY_MAPPING,
  CLIENT_TO_BACKEND_CATEGORIES,
  DEFAULT_PRODUCT_IMAGE,
  getVendorType,
  calculateCO2Savings
} from '@/config/marketplaceConfig';

// Convert Google Drive share links to direct-view links with better CORS handling
const normalizeDriveLink = (url) => {
  if (!url) return url;
  try {
    // Already a direct link with uc?export=view
    if (/^https?:\/\//i.test(url) && url.includes('drive.google.com/uc?export=view')) return url;
    
    // Already a direct link with uc?id=
    if (/^https?:\/\//i.test(url) && url.includes('drive.google.com/uc?id=')) {
      // Convert to export=view format for better compatibility
      const idMatch = url.match(/[?&]id=([^&]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }
      return url;
    }

    // Matches: https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing or similar
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
    }

    // Matches: https://drive.google.com/open?id=<FILE_ID>
    const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch && openMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
    }

    return url;
  } catch (error) {
    console.error('Error normalizing drive link:', error);
    return url;
  }
};

// Transform backend product to client format
const transformProduct = (backendProduct) => {
  const seller = backendProduct.seller_id;

  // Calculate CO2 saved from carbon footprint (if available)
  const co2Saved = calculateCO2Savings(backendProduct.sustainability?.carbon_footprint);

  // Determine vendor type based on certifications
  const vendorType = getVendorType(backendProduct.sustainability?.certifications);

  // Resolve image url - backend images are always full URLs (validated in schema)
  const firstImage = backendProduct.images?.[0];
  let resolvedImage = DEFAULT_PRODUCT_IMAGE;
  
  if (firstImage) {
    if (typeof firstImage === 'string') {
      // Images from backend are full URLs
      if (firstImage.startsWith('http')) {
        // Normalize Google Drive links for better compatibility
        resolvedImage = normalizeDriveLink(firstImage);
      } else {
        // Fallback: if somehow a relative path exists, convert it
        resolvedImage = `${API_BASE_URL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
      }
    } else if (typeof firstImage === 'object') {
      // Handle object format (url or path property)
      const imageUrl = firstImage?.url || firstImage?.path || '';
      if (imageUrl) {
        resolvedImage = imageUrl.startsWith('http') 
          ? normalizeDriveLink(imageUrl)
          : `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
    }
  }
  
  // Log for debugging
  console.log('Product image transformation:', {
    productName: backendProduct.name,
    originalImage: firstImage,
    resolvedImage: resolvedImage
  });

  return {
    id: backendProduct._id,
    name: backendProduct.name,
    price: backendProduct.pricing.discount_price || backendProduct.pricing.base_price,
    originalPrice: backendProduct.pricing.discount_price ? backendProduct.pricing.base_price : null,
    rating: backendProduct.reviews?.average_rating || 4.5,
    reviews: backendProduct.reviews?.total_reviews || Math.floor(Math.random() * 300) + 50,
    image: resolvedImage,
    category: CATEGORY_MAPPING[backendProduct.category] || 'tech',
    vendor: seller?.name || 'EcoStore',
    vendorType,
    tags: backendProduct.tags?.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)) ||
      backendProduct.sustainability?.certifications || ['Eco-Friendly'],
    co2Saved: parseFloat(co2Saved.toFixed(1)),
    description: backendProduct.description,
    inStock: backendProduct.is_available !== false && backendProduct.inventory?.stock_quantity > 0,
    featured: backendProduct.featured || false,
    // Keep original backend data for detailed operations
    _original: backendProduct
  };
};

// Marketplace API service
export const marketplaceApi = {
  // Get all products with filtering
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Transform client filters to backend format
      if (filters.category && filters.category !== 'all') {
        const backendCategories = CLIENT_TO_BACKEND_CATEGORIES[filters.category];
        if (backendCategories && backendCategories.length > 0) {
          // For now, just use the first matching category
          params.append('category', backendCategories[0]);
        }
      }

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }

      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }

      if (filters.minRating) {
        params.append('minRating', filters.minRating);
      }

      if (filters.featured) {
        params.append('featured', 'true');
      }

      if (filters.inStock !== false) {
        params.append('inStock', 'true');
      }

      // Set defaults
      params.append('page', filters.page || 1);
      params.append('limit', filters.limit || 20);
      params.append('sortBy', filters.sortBy || 'created_at');
      params.append('sortOrder', filters.sortOrder || 'desc');

      const response = await apiRequest(`/api/marketplace/products?${params.toString()}`);

      return {
        ...response,
        data: {
          ...response.data,
          products: (response.data?.products || []).map(transformProduct)
        }
      };
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
      
      // Return fallback data structure if API fails
      return {
        success: false,
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalProducts: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        error: error.message
      };
    }
  },

  // Get single product by ID
  async getProductById(id) {
    try {
      const response = await apiRequest(`/api/marketplace/products/${id}`);
      return {
        ...response,
        data: transformProduct(response.data)
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    try {
      const response = await apiRequest(`/api/marketplace/featured?limit=${limit}`);
      return {
        ...response,
        data: response.data.map(transformProduct)
      };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get categories with product counts
  async getCategories() {
    try {
      const response = await apiRequest('/api/marketplace/categories');

      // Transform backend categories to client format
      const clientCategories = [
        { value: 'all', label: 'All Products', count: 0 }
      ];

      let totalCount = 0;
      const categoryMap = {};

      // Group backend categories by client categories
      response.data.forEach(backendCat => {
        const clientCategory = CATEGORY_MAPPING[backendCat._id];
        if (clientCategory) {
          if (!categoryMap[clientCategory]) {
            categoryMap[clientCategory] = { count: 0, subcategories: [] };
          }
          categoryMap[clientCategory].count += backendCat.count;
          categoryMap[clientCategory].subcategories.push(...backendCat.subcategories);
          totalCount += backendCat.count;
        }
      });

      // Convert to client format
      const categoryLabels = {
        'personal-care': 'Personal Care',
        'home-garden': 'Home & Garden',
        'clothing': 'Sustainable Clothing',
        'food-drink': 'Food & Drink',
        'tech': 'Eco Tech',
        'travel': 'Travel Essentials'
      };

      Object.entries(categoryMap).forEach(([key, data]) => {
        clientCategories.push({
          value: key,
          label: categoryLabels[key] || key,
          count: data.count
        });
      });

      clientCategories[0].count = totalCount;

      return {
        ...response,
        data: clientCategories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchOptions) {
    try {
      const response = await apiRequest('/api/marketplace/search', {
        method: 'POST',
        body: JSON.stringify(searchOptions)
      });

      return {
        ...response,
        data: response.data.map(transformProduct)
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get sustainable products
  async getSustainableProducts(criteria = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await apiRequest(`/api/marketplace/sustainable?${params.toString()}`);

      return {
        ...response,
        data: response.data.map(transformProduct)
      };
    } catch (error) {
      console.error('Error fetching sustainable products:', error);
      throw error;
    }
  }
};

export default marketplaceApi;
