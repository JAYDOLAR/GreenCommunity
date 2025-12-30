// Import the same data from admin marketplace API
import { GET as adminGET } from '../admin/marketplace/route.js';

export async function GET() {
  try {
    // Use the same data source as admin marketplace
    const adminResponse = await adminGET();
    const data = await adminResponse.json();
    
    // Filter only active products for public marketplace
    const activeProducts = data.products.filter(product => product.status === 'active');
    
    return Response.json({
      products: activeProducts
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch marketplace data' }, { status: 500 });
  }
} 