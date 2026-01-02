"use client";

import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Star, 
  Leaf
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ChatBot from '@/components/ChatBot';

const USD_TO_INR = 83;

// Shared data and logic
const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'technology', label: 'Technology' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'books', label: 'Books & Media' },
];

function MobileMarketplaceView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/marketplace');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId) => {
    router.push(`/marketplace/${productId}`);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        {/* Heading and description instead of logo */}
        <div className="flex flex-col flex-1">
          <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">Eco Marketplace</h1>
          <span className="text-xs text-muted-foreground">Discover sustainable products that make a difference</span>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs sm:text-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Products List */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {isLoading ? (
          <div className="text-center py-6">
            <div className="text-muted-foreground text-sm">Loading products...</div>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Card
              key={product.id}
              className="relative flex flex-row gap-2 items-center p-2 sm:p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProductClick(product.id)}
            >
              {product.featured && (
                <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10 bg-success text-white text-[10px] sm:text-xs">Featured</Badge>
              )}
              <img src={product.image} alt={product.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-foreground leading-tight">{product.name}</h3>
                  <span className="font-bold text-xs text-foreground">₹{product.price}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {product.tags.slice(0, 1).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                  {product.tags.length > 1 && (
                    <Badge variant="secondary" className="text-[10px]">+{product.tags.length - 1}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-muted-foreground text-sm sm:text-base">No products found</div>
            <p className="text-muted-foreground text-xs">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabletMarketplaceView() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/marketplace');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId) => {
    router.push(`/marketplace/${productId}`);
  };

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-5 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Eco Marketplace</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Discover sustainable products</p>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search eco-friendly products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Products Grid */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
        : 'space-y-3 sm:space-y-4'}>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-base">Loading products...</div>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
          <Card
            key={product.id}
            className={`card-gradient hover-lift cursor-pointer ${viewMode === 'list' ? 'flex-row' : ''}`}
            onClick={() => handleProductClick(product.id)}
          >

            <div className={viewMode === 'list' ? 'w-32 shrink-0' : ''}>
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Out of Stock</Badge>
                  </div>
                )}
              </div>
            </div>
            <CardContent className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="space-y-2">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-tight text-sm sm:text-base">{product.name}</h3>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-foreground text-sm sm:text-base">₹{product.price}</div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{product.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews})</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {product.vendorType}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 2 && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      +{product.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1 text-success">
                    <Leaf className="h-4 w-4" />
                    <span className="text-sm font-medium">-{product.co2Saved}kg CO₂</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-base">No products found</div>
            <p className="text-muted-foreground text-xs">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopMarketplaceView() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/marketplace');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId) => {
    router.push(`/marketplace/${productId}`);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Eco Marketplace</h1>
          <p className="text-muted-foreground">Discover sustainable products that make a difference</p>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search eco-friendly products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Products Grid */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'}>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">Loading products...</div>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
          <Card
            key={product.id}
            className={`card-gradient hover-lift cursor-pointer ${viewMode === 'list' ? 'flex-row' : ''}`}
            onClick={() => handleProductClick(product.id)}
          >
            {product.featured && (
              <Badge className="absolute top-3 left-3 z-10 bg-success text-white">Featured</Badge>
            )}
            <div className={viewMode === 'list' ? 'w-48 shrink-0' : ''}>
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Out of Stock</Badge>
                  </div>
                )}
              </div>
            </div>
            <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-tight">{product.name}</h3>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-foreground">₹{product.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  <Badge variant="outline" className="ml-auto">
                    {product.vendorType}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1 text-success">
                    <Leaf className="h-4 w-4" />
                    <span className="text-sm font-medium">-{product.co2Saved}kg CO₂</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">No products found</div>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

const Marketplace = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const view = isMobile
    ? <MobileMarketplaceView />
    : isTablet
      ? <TabletMarketplaceView />
      : <DesktopMarketplaceView />;

  return (
    <div className="relative">
      {view}
      <ChatBot />
    </div>
  );
};
export default Marketplace;
