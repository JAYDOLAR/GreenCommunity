// In-memory storage for demo purposes
let products = [
  {
    id: 1,
    name: 'Bamboo Toothbrush Set',
    price: 300,
    originalPrice: 399,
    rating: 4.8,
    reviews: 156,
    image: '/Marketplace/1.jpeg',
    category: 'lifestyle',
    vendor: 'EcoLife India',
    vendorType: 'Certified',
    tags: ['Plastic-Free', 'Biodegradable', 'Organic'],
    co2Saved: 0.5,
    description: 'Set of 4 bamboo toothbrushes with soft bristles',
    inStock: true,
    featured: true,
    status: 'active',
    stock: 50,
    sold: 120,
    weight: 0.2,
    dimensions: '15 x 5 x 2 cm',
    shipping: 50,
    rating: 4.8,
    reviews: 156,
    sold: 120
  },
  {
    id: 2,
    name: 'Reusable Steel Water Bottle',
    price: 350,
    rating: 4.9,
    reviews: 298,
    image: '/Marketplace/2.jpeg',
    category: 'lifestyle',
    vendor: 'HydroGreen',
    vendorType: 'Local',
    tags: ['BPA-Free', 'Recycled Steel', 'Lifetime Warranty'],
    co2Saved: 2.1,
    description: 'Insulated stainless steel water bottle, 1L capacity',
    inStock: true,
    featured: false,
    status: 'active',
    stock: 75,
    sold: 89,
    weight: 0.5,
    dimensions: '25 x 8 x 8 cm',
    shipping: 60,
    rating: 4.9,
    reviews: 298,
    sold: 89
  },
  {
    id: 3,
    name: 'Organic Cotton Tote Bag',
    price: 700,
    rating: 4.7,
    reviews: 87,
    image: '/Marketplace/3.jpeg',
    category: 'fashion',
    vendor: 'FairTrade India',
    vendorType: 'Nonprofit',
    tags: ['Fair Trade', 'Organic Cotton', 'Reusable'],
    co2Saved: 1.2,
    description: 'Durable organic cotton shopping bag',
    inStock: true,
    featured: true,
    status: 'active',
    stock: 30,
    sold: 45,
    weight: 0.3,
    dimensions: '40 x 35 x 5 cm',
    shipping: 40,
    rating: 4.7,
    reviews: 87,
    sold: 45
  },
  {
    id: 4,
    name: 'Home Compost Bin Kit',
    price: 950,
    rating: 4.9,
    reviews: 203,
    image: '/Marketplace/4.jpeg',
    category: 'home',
    vendor: 'Garden Green',
    vendorType: 'Local',
    tags: ['Composting', 'Recycled Materials', 'Easy Setup'],
    co2Saved: 12.5,
    description: 'Complete home composting system with instructions',
    inStock: true,
    featured: true,
    status: 'active',
    stock: 25,
    sold: 67,
    weight: 2.5,
    dimensions: '30 x 30 x 40 cm',
    shipping: 100,
    rating: 4.9,
    reviews: 203,
    sold: 67
  },
  {
    id: 5,
    name: 'Beeswax Food Wraps',
    price: 220,
    rating: 4.8,
    reviews: 167,
    image: '/Marketplace/5.jpeg',
    category: 'home',
    vendor: 'BeePure India',
    vendorType: 'Certified',
    tags: ['Plastic-Free', 'Reusable', 'Natural Beeswax'],
    co2Saved: 0.8,
    description: 'Set of 6 reusable food storage wraps made from natural beeswax',
    inStock: true,
    featured: false,
    status: 'active',
    stock: 100,
    sold: 234,
    weight: 0.4,
    dimensions: '20 x 15 x 2 cm',
    shipping: 30,
    rating: 4.8,
    reviews: 167,
    sold: 234
  },
  {
    id: 6,
    name: 'Solar Power Bank 10000mAh',
    price: 1200,
    rating: 4.6,
    reviews: 134,
    image: '/Marketplace/6.jpeg',
    category: 'technology',
    vendor: 'SolarTech India',
    vendorType: 'Certified',
    tags: ['Solar Powered', 'Waterproof', '10000mAh'],
    co2Saved: 3.8,
    description: 'Portable solar charger with wireless charging capability',
    inStock: true,
    featured: false,
    status: 'active',
    stock: 15,
    sold: 28,
    weight: 0.8,
    dimensions: '12 x 6 x 2 cm',
    shipping: 80,
    rating: 4.6,
    reviews: 134,
    sold: 28
  }
];

let orders = [
  {
    id: 1,
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@email.com',
    status: 'completed',
    total: 650,
    products: [
      { name: 'Bamboo Toothbrush Set', quantity: 1, price: 300 },
      { name: 'Reusable Steel Water Bottle', quantity: 1, price: 350 }
    ],
    shippingAddress: '123 Green Street, Mumbai, Maharashtra',
    orderDate: '2024-01-15'
  },
  {
    id: 2,
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@email.com',
    status: 'shipped',
    total: 950,
    products: [
      { name: 'Home Compost Bin Kit', quantity: 1, price: 950 }
    ],
    shippingAddress: '456 Eco Avenue, Delhi, NCR',
    orderDate: '2024-01-14'
  },
  {
    id: 3,
    customerName: 'Anita Patel',
    customerEmail: 'anita.patel@email.com',
    status: 'processing',
    total: 440,
    products: [
      { name: 'Beeswax Food Wraps', quantity: 2, price: 220 }
    ],
    shippingAddress: '789 Sustainable Road, Bangalore, Karnataka',
    orderDate: '2024-01-13'
  }
];

export async function GET() {
  try {
    return Response.json({
      products: products,
      orders: orders
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch marketplace data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const productData = await request.json();
    
    // Generate new ID
    const newId = Math.max(...products.map(p => p.id)) + 1;
    
    // Create new product
    const newProduct = {
      id: newId,
      ...productData,
      inStock: productData.stock > 0,
      co2Saved: Math.random() * 15, // Random CO2 saved for demo
      vendor: 'Admin Added',
      vendorType: 'Certified',
      tags: productData.tags ? productData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Add to products array
    products.push(newProduct);
    
    return Response.json({
      success: true,
      product: newProduct,
      message: 'Product added successfully'
    });
  } catch (error) {
    return Response.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const updatedProduct = await request.json();
    
    // Find and update the product
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct };
      return Response.json({
        success: true,
        product: products[index],
        message: 'Product updated successfully'
      });
    } else {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    // Find and remove the product
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      return Response.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 