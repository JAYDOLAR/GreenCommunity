import { getProductModel } from '../models/Product.model.js';
import { getUserModel } from '../models/User.model.js';
import { getCategoryModel } from '../models/Category.model.js';
import { getConnection } from '../config/databases.js';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (imagePath, productName) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'greencommunity/products',
      transformation: [
        {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          format: 'webp'
        }
      ],
      public_id: `product_${productName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error);
    throw error;
  }
};

// Sample product data with marketplace images
const productsData = [
  {
    name: 'Eco-Friendly Reusable Water Bottle',
    description: 'Premium stainless steel water bottle that keeps drinks cold for 24 hours and hot for 12 hours. BPA-free, leak-proof, and designed for everyday use. Perfect for reducing single-use plastic waste.',
    category: 'reusable',
    subcategory: 'Drinkware',
    imageFile: '1.jpeg',
    pricing: {
      base_price: 29.99,
      currency: 'USD',
      discount_price: 24.99
    },
    inventory: {
      stock_quantity: 150,
      weight: 500,
      dimensions: {
        length: 25,
        width: 8,
        height: 8,
        unit: 'cm'
      }
    },
    sustainability: {
      certifications: [], // BPA Free is not in the enum, using boolean flags instead
      eco_rating: 5,
      recyclable: true,
      renewable_materials: true
    },
    shipping: {
      free_shipping_threshold: 50,
      shipping_cost: 5.99,
      processing_time: 2
    },
    tags: ['sustainable', 'reusable', 'water-bottle', 'eco-friendly', 'stainless-steel'],
    featured: true
  },
  {
    name: 'Organic Cotton Reusable Shopping Bags (Set of 3)',
    description: 'Durable, washable shopping bags made from 100% organic cotton. Each set includes three different sizes perfect for groceries, farmers markets, or everyday errands. Strong enough to hold up to 40 lbs.',
    category: 'reusable',
    subcategory: 'Bags & Totes',
    imageFile: '2.jpeg',
    pricing: {
      base_price: 19.99,
      currency: 'USD',
      discount_price: 16.99
    },
    inventory: {
      stock_quantity: 200,
      weight: 300,
      dimensions: {
        length: 40,
        width: 35,
        height: 2,
        unit: 'cm'
      }
    },
    sustainability: {
      certifications: ['USDA Organic', 'Fair Trade'],
      eco_rating: 5,
      recyclable: true,
      biodegradable: true,
      renewable_materials: true,
      local_sourced: false
    },
    shipping: {
      free_shipping_threshold: 50,
      shipping_cost: 4.99,
      processing_time: 1
    },
    tags: ['organic', 'cotton', 'reusable-bags', 'shopping', 'eco-friendly'],
    featured: true
  },
  {
    name: 'Bamboo Cutlery Set with Travel Case',
    description: 'Portable bamboo cutlery set including fork, knife, spoon, chopsticks, and metal straw. Comes in a compact carrying case perfect for lunch boxes, camping, or travel. Say goodbye to single-use plastic utensils!',
    category: 'zero_waste',
    subcategory: 'Dining',
    imageFile: '3.jpeg',
    pricing: {
      base_price: 15.99,
      currency: 'USD',
      discount_price: 12.99
    },
    inventory: {
      stock_quantity: 300,
      weight: 150,
      dimensions: {
        length: 20,
        width: 5,
        height: 3,
        unit: 'cm'
      }
    },
    sustainability: {
      certifications: ['FSC Certified'],
      eco_rating: 5,
      recyclable: true,
      biodegradable: true,
      renewable_materials: true
    },
    shipping: {
      free_shipping_threshold: 50,
      shipping_cost: 3.99,
      processing_time: 2
    },
    tags: ['bamboo', 'cutlery', 'zero-waste', 'travel', 'reusable'],
    featured: false
  },
  {
    name: 'Solar-Powered LED Garden Lights (Pack of 4)',
    description: 'Elegant solar-powered LED lights for gardens, pathways, and outdoor spaces. Automatically turns on at dusk and provides up to 8 hours of soft illumination. Weather-resistant and easy to install.',
    category: 'solar',
    subcategory: 'Outdoor Lighting',
    imageFile: '4.jpeg',
    pricing: {
      base_price: 39.99,
      currency: 'USD',
      discount_price: 34.99
    },
    inventory: {
      stock_quantity: 100,
      weight: 800,
      dimensions: {
        length: 40,
        width: 8,
        height: 8,
        unit: 'cm'
      }
    },
    sustainability: {
      certifications: ['Energy Star'],
      eco_rating: 5,
      carbon_offset_included: true,
      renewable_materials: true
    },
    shipping: {
      free_shipping_threshold: 50,
      shipping_cost: 7.99,
      processing_time: 3
    },
    tags: ['solar', 'led', 'garden', 'outdoor', 'energy-efficient'],
    featured: true
  },
  {
    name: 'Compost Bin for Kitchen - Odor-Free Design',
    description: 'Sleek countertop compost bin with activated charcoal filter to eliminate odors. 1.3-gallon capacity perfect for daily kitchen scraps. Dishwasher-safe inner bucket makes cleanup easy. Start composting today!',
    category: 'zero_waste',
    subcategory: 'Kitchen & Dining',
    imageFile: '5.jpeg',
    pricing: {
      base_price: 34.99,
      currency: 'USD',
      discount_price: 29.99
    },
    inventory: {
      stock_quantity: 80,
      weight: 1200,
      dimensions: {
        length: 28,
        width: 19,
        height: 28,
        unit: 'cm'
      }
    },
    sustainability: {
      certifications: [],
      eco_rating: 5,
      recyclable: true,
      carbon_offset_included: false
    },
    shipping: {
      free_shipping_threshold: 50,
      shipping_cost: 6.99,
      processing_time: 2
    },
    tags: ['compost', 'kitchen', 'zero-waste', 'odor-free', 'recycling'],
    featured: false
  },
  {
    name: 'Organic Herb Garden Starter Kit',
    description: 'Everything you need to grow fresh herbs at home! Kit includes organic seeds (basil, cilantro, parsley, mint), biodegradable pots, organic soil, and care instructions. Perfect for beginners and urban gardeners.',
    category: 'organic',
    subcategory: 'Gardening',
    imageFile: '6.jpeg',
    pricing: {
      base_price: 27.99,
      currency: 'USD',
      discount_price: 22.99
    },
    inventory: {
      stock_quantity: 120,
      weight: 2000,
      dimensions: {
        length: 30,
        width: 20,
        height: 15,
        unit: 'cm'
      }
    },
    sustainability: {
      certifications: ['USDA Organic'],
      eco_rating: 5,
      recyclable: true,
      biodegradable: true,
      renewable_materials: true,
      local_sourced: true
    },
    shipping: {
      free_shipping_threshold: 50,
      shipping_cost: 8.99,
      processing_time: 3
    },
    tags: ['organic', 'herbs', 'garden', 'seeds', 'growing-kit'],
    featured: true
  }
];

// Main seeding function
const seedProducts = async () => {
  try {
    console.log('🌱 Starting marketplace products seeding...\n');

    // Get database connections
    const Product = await getProductModel();
    const User = await getUserModel();
    const Category = await getCategoryModel();

    // Define categories
    const categoriesData = [
      { name: 'solar', slug: 'solar', description: 'Solar-powered products for sustainable energy' },
      { name: 'reusable', slug: 'reusable', description: 'Reusable products to reduce waste' },
      { name: 'zero_waste', slug: 'zero_waste', description: 'Zero waste lifestyle products' },
      { name: 'local', slug: 'local', description: 'Locally sourced and produced items' },
      { name: 'organic', slug: 'organic', description: 'Certified organic products' },
      { name: 'eco_fashion', slug: 'eco_fashion', description: 'Sustainable and ethical fashion' },
      { name: 'green_tech', slug: 'green_tech', description: 'Eco-friendly technology products' }
    ];

    // Create or find categories
    console.log('📁 Setting up categories...');
    const categoryMap = {};
    
    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
        console.log(`   ✅ Created category: ${catData.name}`);
      } else {
        console.log(`   ✅ Found category: ${catData.name}`);
      }
      categoryMap[catData.slug] = category._id;
    }
    console.log('');

    // Find or create a seller user
    let seller = await User.findOne({ email: 'seller@greencommunity.com' });
    
    if (!seller) {
      console.log('👤 Creating seller user...');
      seller = await User.create({
        name: 'GreenCommunity Store',
        email: 'seller@greencommunity.com',
        password: 'SecurePassword123!',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Seller user created\n');
    } else {
      console.log('✅ Seller user found\n');
    }

    // Clear existing products (optional)
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing products. Clearing...`);
      await Product.deleteMany({});
      console.log('✅ Existing products cleared\n');
    }

    // Path to marketplace images
    const imagesPath = path.join(__dirname, '../../client/public/Marketplace');

    // Check if images directory exists
    if (!fs.existsSync(imagesPath)) {
      console.error(`❌ Images directory not found: ${imagesPath}`);
      console.log('Please ensure the Marketplace images are in client/public/Marketplace/');
      process.exit(1);
    }

    console.log('📸 Uploading images to Cloudinary and creating products...\n');

    // Create products with uploaded images
    const createdProducts = [];
    
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      const imagePath = path.join(imagesPath, productData.imageFile);

      console.log(`[${i + 1}/${productsData.length}] Processing: ${productData.name}`);

      // Check if image file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`   ⚠️  Image file not found: ${productData.imageFile}, skipping...`);
        continue;
      }

      try {
        // Upload image to Cloudinary
        console.log(`   📤 Uploading image to Cloudinary...`);
        const uploadedImage = await uploadToCloudinary(imagePath, productData.name);
        console.log(`   ✅ Image uploaded: ${uploadedImage.url}`);

        // Get category_id
        const categoryId = categoryMap[productData.category];
        if (!categoryId) {
          console.log(`   ⚠️  Category not found: ${productData.category}, skipping...`);
          continue;
        }

        // Create product with uploaded image
        const product = await Product.create({
          seller_id: seller._id,
          category_id: categoryId,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          subcategory: productData.subcategory,
          images: [uploadedImage],
          pricing: productData.pricing,
          inventory: productData.inventory,
          sustainability: productData.sustainability,
          shipping: productData.shipping,
          tags: productData.tags,
          featured: productData.featured,
          status: 'active'
        });

        createdProducts.push(product);
        console.log(`   ✅ Product created: ${product._id}\n`);

      } catch (error) {
        console.error(`   ❌ Error processing ${productData.name}:`, error.message);
        console.log('   Continuing with next product...\n');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Seeding completed!`);
    console.log(`✅ ${createdProducts.length} products created successfully`);
    console.log('='.repeat(60) + '\n');

    // Display summary
    console.log('📊 Summary:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.pricing.base_price} (${product.category})`);
    });

    console.log('\n✨ Marketplace is ready!\n');

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    // Close database connection
    process.exit(0);
  }
};

// Run the seeder
seedProducts();
