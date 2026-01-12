'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { marketplaceApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Star,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const MarketplacePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchMarketplaceData = async () => {
    try {
      const result = await marketplaceApi.getProducts({ page: 1, limit: 1000, inStock: true });
      const list = result?.data?.products || [];
      setProducts(list);
      setOrders([]);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
      setProducts([]);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      // Optimistically update UI
      setProducts(products.map(product => 
        product.id === productId ? { ...product, status: newStatus } : product
      ));

      const response = await marketplaceApi.updateProduct(productId, { status: newStatus });
      
      if (!response.success) {
        // Revert on failure
        await fetchMarketplaceData();
        alert('Failed to update product status');
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
      await fetchMarketplaceData(); // Revert
      alert('Failed to update product status: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product? This will also delete all associated images from Cloudinary.')) {
      try {
        // Optimistically update UI
        const previousProducts = [...products];
        setProducts(products.filter(product => product.id !== productId));

        await marketplaceApi.deleteProduct(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
        // Revert on failure
        await fetchMarketplaceData();
        alert('Failed to delete product: ' + error.message);
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.inventory?.quantity || product.stock || '',
      category: product.category || '',
      status: product.status || 'active',
    });
    setEditImages([]);
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (editImages.length + validFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setEditImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveEditImage = (index) => {
    setEditImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.price) {
      alert('Name and price are required');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        category: editForm.category,
        status: editForm.status,
        inventory: {
          quantity: parseInt(editForm.stock) || 0,
        },
      };

      const imageFiles = editImages.length > 0 ? editImages.map(img => img.file) : null;
      
      const response = await marketplaceApi.updateProduct(editingProduct.id, updateData, imageFiles);
      
      if (response.success) {
        await fetchMarketplaceData();
        setEditDialogOpen(false);
        setEditingProduct(null);
        setEditForm({});
        setEditImages([]);
        alert('Product updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await fetchMarketplaceData();
    setIsLoading(false);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Price', 'Stock', 'Sold', 'Status', 'Rating', 'Reviews'],
      ...(products || []).map(product => [
        product.name,
        product.category,
        product.price,
        product.stock,
        product.sold,
        product.status,
        product.rating,
        product.reviews
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketplace-products-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleAddProduct = () => {
    router.push('/admin/marketplace/add');
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace Management</h1>
          <p className="text-muted-foreground">Manage products and orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0 ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>Manage product inventory and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="border hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={product.image || '/Marketplace/1.jpeg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/Marketplace/1.jpeg'; }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Action Buttons */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <Select
                            value={product.status}
                            onValueChange={(value) => handleStatusChange(product.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button variant="ghost" size="sm" title="View Product">
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                        {product.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Pricing Section */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{product.price}
                        </span>
                        {product._original?.pricing?.discount_price && (
                          <span className="text-lg line-through text-muted-foreground">
                            ₹{product._original.pricing.base_price}
                          </span>
                        )}
                      </div>

                      {/* Product Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {product.stock} in stock
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {product.sold} sold
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>Track order status and fulfillment</CardDescription>
            </div>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  {getOrderStatusIcon(order.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{order.customerName}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{order.customerEmail}</p>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-1">
                      <span className="font-medium">Products:</span> {order.products.map(p => `${p.name} (${p.quantity})`).join(', ')}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Shipping:</span> {order.shippingAddress}
                    </p>
                    <p>
                      <span className="font-medium">Order Date:</span> {order.orderDate}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold">₹{order.total}</div>
                  <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" title="View Order Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Select value={order.status} onValueChange={(value) => {
                    // Handle order status change
                    setOrders(orders.map(o => o.id === order.id ? { ...o, status: value } : o));
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details and images (up to 5 images, 5MB each)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price || ''}
                  onChange={(e) => handleEditFormChange('price', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description || ''}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editForm.category || ''}
                  onValueChange={(value) => handleEditFormChange('category', value)}
                >
                  <SelectTrigger id="edit-category">
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

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editForm.stock || ''}
                  onChange={(e) => handleEditFormChange('stock', e.target.value)}
                  placeholder="Stock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status || 'active'}
                  onValueChange={(value) => handleEditFormChange('status', value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Images (optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditImageUpload}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label
                  htmlFor="edit-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {editImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editImages.length}/5 images • PNG, JPG up to 5MB each
                  </p>
                </label>
              </div>

              {editImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {editImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveEditImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      >
                        ×
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {editImages.length > 0 
                  ? 'New images will replace existing ones. Leave empty to keep current images.'
                  : 'Current images will be kept if you don\'t upload new ones.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingProduct(null);
                setEditForm({});
                setEditImages([]);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplacePage; 