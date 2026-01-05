import ProductView from '@/components/ProductView';

const products = [
  {
    id: 1,
    name: 'Bamboo Toothbrush Set',
    price: 300,
    originalPrice: 399,
    rating: 4.8,
    reviews: 156,
    image: '/marketplace/1.jpeg',
    category: 'personal-care',
    vendor: 'EcoLife',
    vendorType: 'Certified',
    tags: ['Plastic-Free', 'Biodegradable', 'Organic'],
    co2Saved: 0.5,
    description: 'Set of 4 bamboo toothbrushes with soft bristles',
    inStock: true,
    featured: true,
    detailedDescription: 'Our premium bamboo toothbrush set includes 4 eco-friendly toothbrushes made from sustainable bamboo. Each brush features soft, BPA-free bristles that are gentle on gums while effectively cleaning teeth. The bamboo handle is naturally antibacterial and biodegradable, making it the perfect sustainable alternative to plastic toothbrushes.',
    specifications: {
      'Material': 'Bamboo handle, BPA-free bristles',
      'Quantity': '4 toothbrushes per set',
      'Bristle Type': 'Soft',
      'Handle Length': '18cm',
      'Certification': 'FSC Certified Bamboo',
      'Packaging': '100% Recycled Cardboard'
    },
    benefits: [
      'Reduces plastic waste',
      'Biodegradable and compostable',
      'Naturally antibacterial',
      'Gentle on gums',
      'FSC certified sustainable bamboo'
    ],
    shipping: {
      'Standard': '3-5 business days',
      'Express': '1-2 business days',
      'Free Shipping': 'Orders over ₹2000'
    }
  },
  {
    id: 2,
    name: 'Reusable Water Bottle',
    price: 350,
    rating: 4.9,
    reviews: 298,
    image: '/marketplace/2.jpeg',
    category: 'personal-care',
    vendor: 'HydroGreen',
    vendorType: 'Local',
    tags: ['BPA-Free', 'Recycled Steel', 'Lifetime Warranty'],
    co2Saved: 2.1,
    description: 'Insulated stainless steel water bottle, 32oz',
    inStock: true,
    featured: false,
    detailedDescription: 'Stay hydrated while saving the planet with our premium insulated stainless steel water bottle. This 32oz bottle keeps drinks cold for up to 24 hours and hot for up to 12 hours. Made from food-grade 18/8 stainless steel with a BPA-free lid, it\'s perfect for daily use, gym sessions, or outdoor adventures.',
    specifications: {
      'Capacity': '32oz (946ml)',
      'Material': '18/8 Stainless Steel',
      'Insulation': 'Double-wall vacuum insulation',
      'Lid Type': 'BPA-free screw cap',
      'Dimensions': '10.5" x 3.5"',
      'Weight': '450g'
    },
    benefits: [
      'Eliminates single-use plastic bottles',
      'Keeps drinks cold for 24 hours',
      'Keeps drinks hot for 12 hours',
      'Lifetime warranty',
      'Made from recycled materials'
    ],
    shipping: {
      'Standard': '3-5 business days',
      'Express': '1-2 business days',
      'Free Shipping': 'Orders over ₹2000'
    }
  },
  {
    id: 3,
    name: 'Organic Cotton Tote Bag',
    price: 200,
    rating: 4.7,
    reviews: 87,
    image: '/marketplace/3.jpeg',
    category: 'clothing',
    vendor: 'FairTrade Co',
    vendorType: 'Nonprofit',
    tags: ['Fair Trade', 'Organic Cotton', 'Reusable'],
    co2Saved: 1.2,
    description: 'Durable organic cotton shopping bag',
    inStock: true,
    featured: true,
    detailedDescription: 'Make a sustainable choice with our organic cotton tote bag. Made from 100% certified organic cotton, this durable shopping bag is perfect for groceries, library books, or everyday use. The reinforced handles and spacious interior make it both practical and environmentally friendly.',
    specifications: {
      'Material': '100% Organic Cotton',
      'Dimensions': '16" x 14" x 4"',
      'Weight Capacity': 'Up to 20 lbs',
      'Certification': 'GOTS Certified',
      'Care': 'Machine washable',
      'Origin': 'Fair Trade Certified'
    },
    benefits: [
      'Replaces single-use plastic bags',
      'Supports fair trade practices',
      'Made from organic materials',
      'Durable and long-lasting',
      'Supports local communities'
    ],
    shipping: {
      'Standard': '3-5 business days',
      'Express': '1-2 business days',
      'Free Shipping': 'Orders over ₹2000'
    }
  },
  {
    id: 5,
    name: 'Beeswax Food Wraps',
    price: 220,
    rating: 4.5,
    reviews: 203,
    image: '/marketplace/5.jpeg',
    category: 'food-drink',
    vendor: 'BeeNatural',
    vendorType: 'Local',
    tags: ['Beeswax', 'Reusable', 'Plastic-Free'],
    co2Saved: 0.8,
    description: 'Set of 6 reusable beeswax food wraps',
    inStock: true,
    featured: true,
    detailedDescription: 'Keep your food fresh while reducing plastic waste with our natural beeswax food wraps. Made from organic cotton infused with beeswax, jojoba oil, and tree resin, these wraps are a sustainable alternative to plastic cling film. They\'re reusable, washable, and biodegradable.',
    specifications: {
      'Material': 'Organic cotton with beeswax',
      'Set Contents': '6 wraps (various sizes)',
      'Sizes': 'Small, Medium, Large',
      'Care': 'Hand wash with cold water',
      'Lifespan': '6-12 months with proper care',
      'Certification': 'Organic cotton certified'
    },
    benefits: [
      'Replaces plastic cling film',
      'Natural and biodegradable',
      'Reusable and washable',
      'Keeps food fresh longer',
      'Supports local beekeepers'
    ],
    shipping: {
      'Standard': '3-5 business days',
      'Express': '1-2 business days',
      'Free Shipping': 'Orders over ₹2000'
    }
  },
  {
    id: 6,
    name: 'Bamboo Cutlery Set',
    price: 950,
    rating: 4.4,
    reviews: 89,
    image: '/marketplace/6.jpeg',
    category: 'food-drink',
    vendor: 'EcoUtensils',
    vendorType: 'Certified',
    tags: ['Bamboo', 'Travel-Friendly', 'Compostable'],
    co2Saved: 1.0,
    description: 'Portable bamboo cutlery set with carrying case',
    inStock: true,
    featured: false,
    detailedDescription: 'Ditch disposable plastic cutlery with our portable bamboo cutlery set. This travel-friendly set includes a fork, knife, spoon, and chopsticks, all made from sustainable bamboo. The included carrying case keeps your utensils clean and organized.',
    specifications: {
      'Material': 'Bamboo',
      'Set Contents': 'Fork, Knife, Spoon, Chopsticks',
      'Case': 'Included carrying case',
      'Length': '7.5 inches',
      'Weight': 'Lightweight',
      'Care': 'Hand wash with mild soap'
    },
    benefits: [
      'Eliminates single-use plastic cutlery',
      'Lightweight and portable',
      'Durable and long-lasting',
      'Compostable at end of life',
      'Perfect for travel and picnics'
    ],
    shipping: {
      'Standard': '3-5 business days',
      'Express': '1-2 business days',
      'Free Shipping': 'Orders over ₹2000'
    }
  }
];

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

const ProductDetailPage = ({ params }) => {
  const productId = parseInt(params.id);
  const product = products.find(p => p.id === productId);

  return <ProductView product={product} allProducts={products} />;
};

export default ProductDetailPage;