'use client';

import { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { marketplaceApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  FileSpreadsheet,
  FileText as FileTextIcon,
  BarChart3,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const MarketplacePage = () => {
  const STATUS_OVERRIDES_KEY = 'admin_marketplace_status_overrides';
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const exportRef = useRef(null);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const applyStatusOverrides = (list) => {
    try {
      const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
      if (!raw) return list;
      const overrides = JSON.parse(raw || '{}');
      return list.map(p => {
        const pid = p.id || p._id;
        return overrides[pid] ? { ...p, status: overrides[pid] } : p;
      });
    } catch {
      return list;
    }
  };

  const fetchMarketplaceData = async () => {
    try {
      const result = await marketplaceApi.getProducts({ page: 1, limit: 1000, inStock: true });
      const list = result?.data?.products || [];
      setProducts(applyStatusOverrides(list));
      setOrders([]);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
      setProducts([]);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    const prevProducts = products;
    // Normalize id
    const normalize = (p) => (p.id || p._id);
    // Optimistic UI update
    setProducts(prev => prev.map(p => (normalize(p) === (productId || normalize(p)) && normalize(p) === (productId) ? { ...p, status: newStatus } : (normalize(p) === productId ? { ...p, status: newStatus } : p))));

    // Persist override locally for refresh fallback
    try {
      const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
      const overrides = raw ? JSON.parse(raw) : {};
      overrides[productId] = newStatus;
      localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
    } catch {}
    try {
      const product = prevProducts.find(p => (p.id || p._id) === productId);
      if (!product) return;
      const updatedProduct = { ...product, id: productId, status: newStatus };
      const response = await fetch(`/api/admin/marketplace?id=${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) throw new Error('Non-200 response');
      // Sync with server
      await fetchMarketplaceData();
    } catch (error) {
      console.error('Failed to update product status:', error);
      // Revert on failure
      setProducts(prevProducts);
      // Remove bad override
      try {
        const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
        const overrides = raw ? JSON.parse(raw) : {};
        delete overrides[productId];
        localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
      } catch {}
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/marketplace?id=${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProducts(products.filter(product => product.id !== productId));
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
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
      ...products.map(product => [
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

  const handleGenerateReport = async (type) => {
    try {
      setIsGeneratingReport(true);
      if (type === 'excel') {
        const csvContent = [
          ['Product Name', 'Category', 'Price', 'Stock', 'Sold', 'Status', 'Rating', 'Reviews'],
          ...products.map(product => [
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
        a.download = `marketplace-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (type === 'pdf') {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Marketplace Report</title></head><body><h1>Marketplace Report</h1><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th>Rating</th><th>Reviews</th></tr></thead><tbody>${products.map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${p.price}</td><td>${p.stock}</td><td>${p.sold}</td><td>${p.status}</td><td>${p.rating}</td><td>${p.reviews}</td></tr>`).join('')}</tbody></table></body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketplace-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      setShowExportOptions(false);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleViewAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      router.push('/admin/analytics?source=marketplace');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    const onClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportOptions(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleAddProduct = () => {
    router.push('/admin/marketplace/add');
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  return (
    <div className="p-6 space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace Management</h1>
          <p className="text-muted-foreground">Manage products and orders</p>
        </div>
        <div className="hidden md:grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <div className="relative" ref={exportRef}>
            <Button onClick={() => setShowExportOptions(!showExportOptions)} disabled={isGeneratingReport}>
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </Button>
            {showExportOptions && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleGenerateReport('excel')} disabled={isGeneratingReport}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleGenerateReport('pdf')} disabled={isGeneratingReport}>
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleViewAnalytics} disabled={isLoadingAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {isLoadingAnalytics ? 'Loading...' : 'View Analytics'}
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="md:hidden grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Button variant="outline" onClick={handleRefreshData} disabled={isLoading} className="w-full justify-center">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
        <div className="relative" ref={exportRef}>
          <Button onClick={() => setShowExportOptions(!showExportOptions)} disabled={isGeneratingReport} className="w-full justify-center">
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </Button>
          {showExportOptions && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
              <div className="p-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleGenerateReport('excel')} disabled={isGeneratingReport}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as Excel
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleGenerateReport('pdf')} disabled={isGeneratingReport}>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </div>
          )}
        </div>
        <Button onClick={handleViewAnalytics} disabled={isLoadingAnalytics} className="w-full justify-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          {isLoadingAnalytics ? 'Loading...' : 'View Analytics'}
        </Button>
        <Button onClick={handleAddProduct} className="w-full justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
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
              <div key={product.id || product._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors overflow-hidden">
                <div className="w-16 h-16 bg-accent rounded-lg overflow-hidden flex-shrink-0">
                  <img src={product.image || '/Marketplace/1.jpeg'} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/Marketplace/1.jpeg'; }} />
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                    <h3 className="font-medium leading-tight break-words max-w-full sm:max-w-[260px]">{product.name}</h3>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                    <Badge variant="outline">
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 break-words">{product.description}</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₹{product.price}
                    </span>
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

                <div className="mt-3 sm:mt-0 flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <Select value={product.status || 'inactive'} onValueChange={(value) => handleStatusChange(product.id || product._id, value)}>
                    <SelectTrigger className="w-full sm:w-36 min-w-[130px] justify-between bg-white">
                      <SelectValue placeholder={(product.status ? (product.status.charAt(0).toUpperCase() + product.status.slice(1)) : 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="ghost" size="sm" title="View Product">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" title="Edit Product">
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product.id || product._id)}
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
    </div>
  );
};

export default MarketplacePage; 