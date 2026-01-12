'use client';

import { useState, useRef } from 'react';

import { useRouter } from 'next/navigation';
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
  const [uploadedImage, setUploadedImage] = useState(null);
  const [driveLink, setDriveLink] = useState('');

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    status: 'draft',
    featured: false,
    shipping: '',
    weight: '',
    dimensions: '',
    tags: '',
    rating: '0',
    reviews: '0',
    sold: '0'
  });

  const handleInputChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          preview: e.target.result
        });
        setProduct(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setProduct(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async () => {

    if (!product.name || !product.category || !product.price || !product.stock) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare product data for API
      // Prefer Drive link if provided; otherwise use uploaded image preview or default
      const normalizeDriveLink = (url) => {
        if (!url) return url;
        try {
          if (/^https?:\/\//i.test(url) && url.includes('drive.google.com/uc')) return url;
          const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
          if (fileMatch && fileMatch[1]) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
          const openMatch = url.match(/[?&]id=([^&]+)/);
          if (openMatch && openMatch[1]) return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
          return url;
        } catch { return url; }
      };

      const selectedImage = driveLink ? normalizeDriveLink(driveLink) : (uploadedImage ? uploadedImage.preview : '/Marketplace/1.jpeg');

      const productData = {
        ...product,
        image: selectedImage,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        rating: parseFloat(product.rating),
        reviews: parseInt(product.reviews),
        sold: parseInt(product.sold),
        weight: product.weight ? parseFloat(product.weight) : null,
        shipping: product.shipping ? parseFloat(product.shipping) : null
      };


      // Save to API
      const response = await fetch('/api/admin/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product saved successfully:', result.product);

        // Navigate back to marketplace page
        router.push('/admin/marketplace');
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground">Create a new marketplace product</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} disabled={isLoading}>
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
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="sports">Sports & Outdoors</SelectItem>
                      <SelectItem value="books">Books & Media</SelectItem>
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
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview - Only show when image is uploaded */}
              {(uploadedImage || driveLink) && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                  <img
                    src={uploadedImage ? uploadedImage.preview : driveLink}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { handleRemoveImage(); setDriveLink(''); }}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload Image</span>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                        {uploadedImage ? 'Change Image' : 'Click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Or paste Google Drive link */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Or paste Google Drive link</label>
                  <Input
                    placeholder="https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                  />
                </div>

                {uploadedImage && (
                  <div className="text-xs text-muted-foreground">
                    <p>File: {uploadedImage.file.name}</p>
                    <p>Size: {(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
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