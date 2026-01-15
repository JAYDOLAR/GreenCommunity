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
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import { MARKETPLACE_CATEGORIES, USD_TO_INR } from '@/config/marketplaceConfig';
import { marketplaceApi } from '@/lib/marketplaceApi';
import { useTranslation } from 'react-i18next';
import useCurrency from '@/hooks/useCurrency';
import { ProductCardSkeleton } from '@/components/MarketplaceSkeleton';

// Shared data and logic
const categories = MARKETPLACE_CATEGORIES;

function MobileMarketplaceView() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await marketplaceApi.getProducts();
        setProducts(response.data?.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]); // Set empty array on error to prevent crashes
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
    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Heading and description instead of logo */}
        <div className="flex flex-col flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">{t('marketplace:eco_marketplace')}</h1>
          <span className="text-xs sm:text-sm text-muted-foreground">{t('marketplace:discover_sustainable_products')}</span>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-9 text-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full h-10 sm:h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Products List */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => <ProductCardSkeleton key={i} variant="list" />)
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Card
              key={product.id}
              className="relative flex flex-row gap-3 items-start p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProductClick(product.id)}
            >
              {product.featured && (
                <Badge className="absolute top-2 left-2 z-10 bg-success text-white text-xs pointer-events-none">Featured</Badge>
              )}
              <img src={product.image || '/tree1.jpg'} alt={product.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded" onError={(e) => { e.currentTarget.src = '/tree1.jpg'; }} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h3>
                  <span className="font-bold text-sm text-foreground">{formatPrice(product.price, product.currency || 'INR')}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                {product.reviews > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews} reviews)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">No reviews yet</span>
                  </div>
                )}
                <div className="flex gap-1 flex-wrap">
                  {product.tags.slice(0, 1).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                  {product.tags.length > 1 && (
                    <Badge variant="secondary" className="text-xs">+{product.tags.length - 1}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-muted-foreground text-sm sm:text-base">No products found</div>
            <p className="text-muted-foreground text-xs sm:text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabletMarketplaceView() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await marketplaceApi.getProducts();
        setProducts(response.data?.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]); // Set empty array on error to prevent crashes
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
    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{t('marketplace:eco_marketplace')}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{t('marketplace:discover_sustainable_products')}</p>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search eco-friendly products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-9 text-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 h-10 sm:h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
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
        ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6'
        : 'space-y-3 sm:space-y-4 md:space-y-6'}>
        {isLoading ? (
          [...Array(6)].map((_, i) => <ProductCardSkeleton key={i} variant={viewMode === 'grid' ? 'grid' : 'list'} />)
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
                    src={product.image || '/tree1.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = '/tree1.jpg'; }}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </div>
              <CardContent className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight">{product.name}</h3>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm sm:text-base text-foreground">{formatPrice(product.price, product.currency || 'INR')}</div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.reviews > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews} reviews)</span>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm text-muted-foreground">No reviews yet</span>
                    )}
                    <Badge variant="outline" className="ml-auto text-xs">
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
                      <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">-{product.co2Saved}kg CO₂</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-10">
            <div className="text-muted-foreground text-sm sm:text-base md:text-lg">No products found</div>
            <p className="text-muted-foreground text-xs sm:text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopMarketplaceView() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await marketplaceApi.getProducts();
        setProducts(response.data?.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]); // Set empty array on error to prevent crashes
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">{t('marketplace:eco_marketplace')}</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">{t('marketplace:discover_sustainable_products')}</p>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search eco-friendly products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 h-10 sm:h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
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
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'
        : 'space-y-4 sm:space-y-6'}>
        {isLoading ? (
          [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} variant={viewMode === 'grid' ? 'grid' : 'list'} />)
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Card
              key={product.id}
              className={`card-gradient hover-lift cursor-pointer ${viewMode === 'list' ? 'flex-row' : ''}`}
              onClick={() => handleProductClick(product.id)}
            >
              {product.featured && (
                <Badge className="absolute top-3 left-3 z-10 bg-success text-white pointer-events-none">Featured</Badge>
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
              <CardContent className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight">{product.name}</h3>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm sm:text-base text-foreground">{formatPrice(product.price, product.currency || 'INR')}</div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.reviews > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews} reviews)</span>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm text-muted-foreground">No reviews yet</span>
                    )}
                    <Badge variant="outline" className="ml-auto text-xs">
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
                      <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">-{product.co2Saved}kg CO₂</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 sm:py-10 lg:py-12">
            <div className="text-muted-foreground text-base sm:text-lg lg:text-xl">No products found</div>
            <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your search or filters</p>
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

const MarketplacePage = () => {
  return (
    <AuthGuard intent="marketplace">
      <Layout>
        <Marketplace />
      </Layout>
    </AuthGuard>
  );
};

export default MarketplacePage;
