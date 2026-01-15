'use client';

import { Card } from '@/components/ui/card';

// Individual product card skeleton
const ProductCardSkeleton = ({ variant = 'grid' }) => {
  if (variant === 'list') {
    // Mobile list view - horizontal card
    return (
      <Card className="relative flex flex-row gap-3 items-start p-3 sm:p-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  // Grid view - vertical card
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-12 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

// Full marketplace page skeleton
const MarketplaceSkeleton = ({ variant = 'desktop' }) => {
  const isMobile = variant === 'mobile';
  const isTablet = variant === 'tablet';

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-gradient-to-b from-background to-accent/5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="h-6 sm:h-7 w-40 sm:w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 sm:w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-full sm:w-40 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Products Grid/List */}
      {isMobile ? (
        // Mobile: List view
        <div className="flex flex-col gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} variant="list" />
          ))}
        </div>
      ) : isTablet ? (
        // Tablet: 2-column grid
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} variant="grid" />
          ))}
        </div>
      ) : (
        // Desktop: 3-column grid
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

export { ProductCardSkeleton };
export default MarketplaceSkeleton;
