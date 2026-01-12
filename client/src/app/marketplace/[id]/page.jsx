"use client";

import ProductView from "@/components/ProductView";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Leaf,
  Recycle,
  Award,
  MapPin,
  Plus,
  Minus,
  Truck,
  Shield,
  Heart,
  Share2,
  CheckCircle,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { marketplaceApi } from "@/lib/marketplaceApi";

const ProductDetail = ({ params }) => {
  const router = useRouter();
  const urlParams = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rawId, setRawId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Resolve params (handles Promise in Next.js 15)
  useEffect(() => {
    let cancelled = false;
    const resolveParams = async () => {
      try {
        if (params && typeof params.then === "function") {
          const resolved = await params;
          if (!cancelled) setRawId(resolved?.id || urlParams?.id);
        } else {
          if (!cancelled) setRawId(params?.id || urlParams?.id);
        }
      } catch (e) {
        console.error("Failed to resolve route params:", e);
        if (!cancelled) setRawId(urlParams?.id || null);
      }
    };
    resolveParams();
    return () => {
      cancelled = true;
    };
  }, [params, urlParams]);

  // Fetch product from API
  useEffect(() => {
    if (!rawId) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch from API
        const response = await marketplaceApi.getProductById(rawId);
        if (response && response.data) {
          // Transform API data to match expected format
          const apiProduct = {
            ...response.data,
            detailedDescription:
              response.data.description ||
              response.data._original?.description ||
              "",
            specifications: response.data._original?.specifications || {
              Material: "Eco-friendly materials",
              Certification:
                response.data.tags?.join(", ") || "Certified sustainable",
            },
            benefits: response.data._original?.benefits || [
              "Reduces environmental impact",
              "Sustainable and eco-friendly",
              "High quality materials",
              "Supports green initiatives",
            ],
            shipping: response.data._original?.shipping || {
              Standard: "3-5 business days",
              Express: "1-2 business days",
              "Free Shipping": "Orders over ₹2000",
            },
          };
          setProduct(apiProduct);

          // Fetch related products (same category)
          if (response.data.category) {
            try {
              const relatedResponse = await marketplaceApi.getProducts({
                category: response.data.category,
                limit: 4,
              });
              if (
                relatedResponse &&
                relatedResponse.data &&
                relatedResponse.data.products
              ) {
                setRelatedProducts(
                  relatedResponse.data.products.filter((p) => p.id !== rawId)
                );
              }
            } catch (relatedError) {
              console.error("Failed to fetch related products:", relatedError);
            }
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [rawId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || "Product Not Found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/marketplace")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const images = product.image ? [product.image] : ["/tree1.jpg"]; // In a real app, you'd have multiple images from API
  
  // Log for debugging
  console.log('Product images:', images);
  console.log('Selected image:', images[selectedImage]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/marketplace")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted/10">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', images[selectedImage]);
                  e.target.src = "/tree1.jpg"; // Fallback
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', images[selectedImage]);
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-20 overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/tree1.jpg"; // Fallback
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category.replace("-", " ").toUpperCase()}
                </Badge>
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Leaf className="h-4 w-4" />
                  <span className="text-sm">
                    Saves {product.co2Saved}kg CO₂
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.detailedDescription}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Availability
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Vendor Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vendor</span>
                  <span className="font-medium">{product.vendor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline" className="text-xs">
                    {product.vendorType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 space-y-8">
          {/* Specifications */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Specifications
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-border/30 last:border-b-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {key}
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Environmental Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Shipping Information
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Object.entries(product.shipping).map(([type, info]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {info}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* More Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                More Products You Might Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts
                  .slice(0, 4) // Show only 4 products
                  .map((relatedProduct) => (
                    <Card
                      key={relatedProduct.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() =>
                        router.push(`/marketplace/${relatedProduct.id}`)
                      }
                    >
                      <div className="relative">
                        <div className="aspect-square overflow-hidden rounded-t-lg bg-muted/10">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error('Related product image failed:', relatedProduct.image);
                              e.target.src = "/tree1.jpg"; // Fallback
                            }}
                          />
                        </div>
                        {relatedProduct.featured && (
                          <Badge className="absolute top-2 left-2 bg-success text-white text-xs">
                            Featured
                          </Badge>
                        )}
                        {!relatedProduct.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                            <Badge variant="secondary">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                              {relatedProduct.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {relatedProduct.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">
                                {relatedProduct.rating}
                              </span>
                            </div>
                            <span className="font-bold text-foreground text-sm">
                              ₹{relatedProduct.price}
                            </span>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-1 text-green-600">
                              <Leaf className="h-3 w-3" />
                              <span className="text-xs">
                                -{relatedProduct.co2Saved}kg CO₂
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = ({ params }) => {
  return (
    <AuthGuard intent="marketplace-product">
      <ProductDetail params={params} />
    </AuthGuard>
  );
};

export default ProductDetailPage;
