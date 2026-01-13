'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceApi } from '@/lib/marketplaceApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ShoppingBag,
  ArrowLeft,
  Save,
  DollarSign,
  FileText,
  CheckCircle,
  Star,
  Package,
  TrendingUp,
  Tag,
  Truck,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

const AddProductPage = () => {

  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    discount_price: '',
    stock: '',
    description: '',
    status: 'draft',
    featured: false,
    shipping_cost: '',
    weight: '',
    dimensions: '',
    tags: '',
    certifications: [],
    carbon_footprint: '',
    eco_rating: '3'
  });

  const handleInputChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    
    // Check total images limit (max 5)
    if (uploadedImages.length + files.length > 5) {
      alert('Maximum 5 images allowed per product');
      return;
    }
    
    const validFiles = [];
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB size limit`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Create previews for valid files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          file: file,
          preview: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current && uploadedImages.length === 1) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!product.name || !product.category || !product.price || !product.stock) {
      alert('Please fill in all required fields: Name, Category, Price, and Stock');
      return;
    }

    if (uploadedImages.length === 0) {
      if (!confirm('No images uploaded. Continue without images?')) {
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare product data
      const productData = {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        discount_price: product.discount_price || null,
        stock: product.stock,
        featured: product.featured,
        sustainability: {
          carbon_footprint: product.carbon_footprint ? parseFloat(product.carbon_footprint) : 0,
          eco_rating: product.eco_rating ? parseInt(product.eco_rating) : 3,
          certifications: product.certifications || []
        },
        tags: product.tags ? product.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        specifications: {
          weight: product.weight || null,
          dimensions: product.dimensions || null
        },
        shipping: {
          cost: product.shipping_cost ? parseFloat(product.shipping_cost) : 0,
          estimated_days: 5
        }
      };

      // Extract image files from uploadedImages
      const imageFiles = uploadedImages.map(img => img.file);

      // Call API with FormData
      const response = await marketplaceApi.createProduct(productData, imageFiles);

      if (response.success) {
        alert('Product created successfully!');
        router.push('/admin/marketplace');
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/marketplace');
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground">Create a new marketplace product</p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleCancel} className="w-full justify-center md:w-auto md:justify-start">
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} disabled={isLoading} className="w-full justify-center md:w-auto md:justify-start">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Input
                    placeholder="Enter product name"
                    value={product.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={product.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solar">Solar Products</SelectItem>
                      <SelectItem value="reusable">Reusable Items</SelectItem>
                      <SelectItem value="zero_waste">Zero Waste</SelectItem>
                      <SelectItem value="local">Local Products</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="eco_fashion">Eco Fashion</SelectItem>
                      <SelectItem value="green_tech">Green Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <Input
                    placeholder="Enter price"
                    type="number"
                    value={product.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <Input
                    placeholder="Enter stock quantity"
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select
                    value={product.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <Input
                    placeholder="Enter tags (comma separated)"
                    value={product.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Enter detailed product description..."
                  value={product.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
              <CardDescription>Additional product specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <Input
                    placeholder="Product weight"
                    type="number"
                    step="0.1"
                    value={product.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dimensions</label>
                  <Input
                    placeholder="L x W x H (cm)"
                    value={product.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Cost (₹)</label>
                  <Input
                    placeholder="Shipping cost"
                    type="number"
                    value={product.shipping}
                    onChange={(e) => handleInputChange('shipping', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ratings & Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Ratings & Reviews
              </CardTitle>
              <CardDescription>Set initial ratings and review count</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Rating</label>
                  <Input
                    placeholder="0.0"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={product.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Review Count</label>
                  <Input
                    placeholder="0"
                    type="number"
                    min="0"
                    value={product.reviews}
                    onChange={(e) => handleInputChange('reviews', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sold Count</label>
                  <Input
                    placeholder="0"
                    type="number"
                    min="0"
                    value={product.sold}
                    onChange={(e) => handleInputChange('sold', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
              </CardTitle>
              <p className="text-xs text-muted-foreground">Upload up to 5 images</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={img.preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Section */}
              {uploadedImages.length < 5 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload Images ({uploadedImages.length}/5)</span>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB each
                        </p>
                      </div>
                    </label>
                  </div>

                  {uploadedImages.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      First image will be the primary product image
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Product Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Featured Product</span>
                </div>
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Product Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Name:</span> {product.name || 'Not set'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Category:</span> {product.category || 'Not set'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Price:</span> {product.price ? `₹${parseInt(product.price).toLocaleString()}` : 'Not set'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Stock:</span> {product.stock || 'Not set'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Status:</span>
                <Badge className={`ml-2 ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {product.status || 'draft'}
                </Badge>
              </div>
              <div className="text-sm flex items-center gap-1">
                <span className="font-medium">Rating:</span> {product.rating} <Star className="h-4 w-4 text-yellow-500 fill-current" /> ({product.reviews} reviews)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage; 