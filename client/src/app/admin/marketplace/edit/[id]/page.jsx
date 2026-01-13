"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { marketplaceApi } from "@/lib/marketplaceApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  FileText,
  Star,
  Package,
  Image as ImageIcon,
  Upload,
  X,
  ArrowLeft
} from "lucide-react";

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params || {};
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    discount_price: "",
    stock: "",
    description: "",
    status: "active",
    featured: false,
    tags: "",
    weight: "",
    dimensions: "",
    shipping_cost: "",
    rating: "",
    reviews: "",
    sold: ""
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsFetching(true);
        const res = await marketplaceApi.getProductById(id);
        const p = res?.data;
        const b = p?._original || {};

        // derive fields from backend structure when available
        const basePrice = b?.pricing?.base_price ?? p?.price ?? "";
        const discount = b?.pricing?.discount_price ?? "";
        const stockQty = b?.inventory?.stock_quantity ?? b?.inventory?.quantity ?? p?.stock ?? "";
        const cat = b?.category ?? "";
        const status = b?.status ?? p?.status ?? "active";

        setProduct({
          name: p?.name || "",
          category: cat,
          price: basePrice,
          discount_price: discount || "",
          stock: stockQty,
          description: p?.description || "",
          status,
          featured: b?.featured ?? p?.featured ?? false,
          tags: (b?.tags || []).join(", "),
          weight: b?.specifications?.weight ?? "",
          dimensions: b?.specifications?.dimensions ?? "",
          shipping_cost: b?.shipping?.cost ?? "",
          rating: p?.rating ?? "",
          reviews: p?.reviews ?? "",
          sold: p?.sold ?? ""
        });

        const imgs = Array.isArray(b?.images) ? b.images : [];
        const normalized = imgs.map((img) => {
          if (typeof img === "string") return img;
          if (img?.url) return img.url;
          if (img?.path) return img.path;
          return null;
        }).filter(Boolean);
        setExistingImages(normalized);
      } catch (err) {
        console.error("Failed to fetch product", err);
        alert("Failed to fetch product details");
        router.push("/admin/marketplace");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router]);

  const handleInputChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);

    if (uploadedImages.length + files.length > 5) {
      alert("Maximum 5 images allowed per product");
      return;
    }

    const validFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB size limit`);
        return;
      }
      validFiles.push(file);
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [
          ...prev,
          {
            file,
            preview: e.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current && uploadedImages.length === 1) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!product.name || !product.category || !product.price) {
      alert("Please fill in all required fields: Name, Category, and Price");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        status: product.status,
        featured: !!product.featured,
        inventory: {
          quantity: parseInt(product.stock || 0),
        },
        specifications: {
          weight: product.weight || null,
          dimensions: product.dimensions || null,
        },
        shipping: {
          cost: product.shipping_cost ? parseFloat(product.shipping_cost) : 0,
        },
        tags: product.tags
          ? product.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const imageFiles = uploadedImages.map((img) => img.file);

      const res = await marketplaceApi.updateProduct(id, payload, imageFiles.length > 0 ? imageFiles : null);

      if (res?.success) {
        alert("Product updated successfully!");
        router.push("/admin/marketplace");
      } else {
        throw new Error(res?.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Failed to update product", err);
      alert("Failed to update product: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push("/admin/marketplace");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground">Update marketplace product details</p>
        </div>
        {/* Actions */}
        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleCancel} className="w-full justify-center md:w-auto md:justify-start">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isFetching} className="w-full justify-center md:w-auto md:justify-start">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="text-sm text-muted-foreground">Loading product...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Edit the basic product information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <Input
                      placeholder="Enter product name"
                      value={product.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <Select
                      value={product.category}
                      onValueChange={(value) => handleInputChange("category", value)}
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
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Price (₹)</label>
                    <Input
                      placeholder="Enter discount price"
                      type="number"
                      value={product.discount_price}
                      onChange={(e) => handleInputChange("discount_price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                    <Input
                      placeholder="Enter stock quantity"
                      type="number"
                      value={product.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select
                      value={product.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <Input
                    placeholder="Enter tags (comma separated)"
                    value={product.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Enter detailed product description..."
                    value={product.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

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
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Dimensions</label>
                    <Input
                      placeholder="L x W x H (cm)"
                      value={product.dimensions}
                      onChange={(e) => handleInputChange("dimensions", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Shipping Cost (₹)</label>
                    <Input
                      placeholder="Shipping cost"
                      type="number"
                      value={product.shipping_cost}
                      onChange={(e) => handleInputChange("shipping_cost", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </CardTitle>
                <p className="text-xs text-muted-foreground">Upload up to 5 new images. Uploading new images will replace existing ones.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Current images</p>
                    <div className="grid grid-cols-2 gap-2">
                      {existingImages.map((src, index) => (
                        <div key={index} className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={src} alt={`Existing ${index + 1}`} className="w-full h-full object-cover" />
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={img.preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveNewImage(index)}
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
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Click to upload</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB each</p>
                        </div>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <p className="text-xs text-muted-foreground">First image will be the primary product image</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Name:</span> {product.name || "Not set"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Category:</span> {product.category || "Not set"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Price:</span> {product.price ? `₹${parseInt(product.price).toLocaleString()}` : "Not set"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Stock:</span> {product.stock || "Not set"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${product.status === "active" ? "bg-green-100 text-green-800" : product.status === "inactive" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                    {product.status || "draft"}
                  </Badge>
                </div>
                <div className="text-sm flex items-center gap-1">
                  <span className="font-medium">Rating:</span> {product.rating} <Star className="h-4 w-4 text-yellow-500 fill-current" /> ({product.reviews} reviews)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductPage;
