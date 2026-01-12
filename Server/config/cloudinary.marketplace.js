import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary (uses same credentials as avatars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Product Images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'greencommunity/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto:good',
        format: 'webp'
      }
    ],
    public_id: (req, file) => {
      const userId = req.user?.id || 'anonymous';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 7);
      return `product_${userId}_${timestamp}_${random}`;
    }
  }
});

// Configure multer for product images (multiple files)
const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
    files: 5 // Maximum 5 images per product
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
      return;
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
      return;
    }

    cb(null, true);
  }
});

// Configure Cloudinary storage for Project Images
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'greencommunity/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: 'limit',
        quality: 'auto:good',
        format: 'webp'
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 7);
      return `project_${timestamp}_${random}`;
    }
  }
});

// Configure multer for project images (single file)
const uploadProjectImage = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for project images
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
      return;
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
      return;
    }

    cb(null, true);
  }
});

// Helper function to delete multiple images from Cloudinary
const deleteImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) return null;
    
    const results = await Promise.all(
      publicIds.map(publicId => cloudinary.uploader.destroy(publicId))
    );
    
    console.log('Images deleted from Cloudinary:', results);
    return results;
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete single image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export { 
  cloudinary, 
  uploadProductImages,
  uploadProjectImage,
  deleteImage,
  deleteImages
};

export default cloudinary;
