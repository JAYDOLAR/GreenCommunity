"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { projectsApi } from "@/lib/projectsApi";
import { blockchainApi } from "@/lib/blockchainApi";
import useCurrency from '@/hooks/useCurrency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Upload,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  Star,
  Target,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Cpu,
  RefreshCcw,
  Eye,
} from "lucide-react";

const EditProjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params || {};
  const fileInputRef = useRef(null);
  const { formatPrice } = useCurrency();
  const formatINR = (amount) => formatPrice(amount, 'INR');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null); // { file, preview }
  const [existingImage, setExistingImage] = useState("");
  const [syncingBlockchain, setSyncingBlockchain] = useState(false);
  const [fullProject, setFullProject] = useState(null);
  const [project, setProject] = useState({
    name: "",
    location: "",
    type: "",
    description: "",
    totalFunding: "",
    image: "",
    status: "pending",
    verified: false,
    featured: false,
    expectedCompletion: "",
    teamSize: "",
    carbonOffsetTarget: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsFetching(true);
        const res = await projectsApi.getProjectById(id);
        const p = res?.data;
        const b = p?._original || {};

        setFullProject(p); // Store full project for blockchain info
        setProject({
          name: p?.name || "",
          location: p?.location || "",
          type: p?.type || "",
          description: p?.description || "",
          totalFunding: (p?.totalFunding || p?.fundingGoal || "").toString(),
          image: p?.image || "",
          status: p?.status || "pending",
          verified: !!p?.verified,
          featured: !!p?.featured,
          expectedCompletion: p?.expectedCompletion || "",
          teamSize: (p?.teamSize || "").toString(),
          carbonOffsetTarget: (p?.carbonOffsetTarget || "").toString(),
        });

        // derive existing image url from transformed or backend
        let img = p?.image;
        if (!img) {
          if (typeof b?.image === 'string') img = b.image; else if (b?.image?.url) img = b.image.url;
        }
        setExistingImage(img || "/tree1.jpg");
      } catch (e) {
        console.error("Fetch project failed", e);
        alert("Failed to load project");
        router.push("/admin/projects");
      } finally {
        setIsFetching(false);
      }
    };
    if (id) fetchProject();
  }, [id, router]);

  const handleInputChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({ file, preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSyncBlockchain = async () => {
    if (!fullProject?._id) return;
    try {
      setSyncingBlockchain(true);
      await blockchainApi.syncProject(fullProject._id);
      // Refresh project data
      const res = await projectsApi.getProjectById(id);
      setFullProject(res?.data);
      alert('Blockchain data synced successfully!');
    } catch (error) {
      console.error('Blockchain sync failed:', error);
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncingBlockchain(false);
    }
  };

  const handleRegisterBlockchain = async () => {
    if (!fullProject?._id) return;
    
    const totalCredits = prompt('Enter total carbon credits available:');
    const priceWei = prompt('Enter price per credit in Wei (e.g. 10000000000000000 for 0.01 ETH):');
    
    if (!totalCredits || !priceWei) return;
    
    // Validate inputs
    if (isNaN(parseInt(totalCredits)) || parseInt(totalCredits) <= 0) {
      alert('Total credits must be a positive number');
      return;
    }
    
    if (isNaN(priceWei) || priceWei <= 0) {
      alert('Price must be a positive number in Wei');
      return;
    }
    
    try {
      setSyncingBlockchain(true);
      await blockchainApi.approveRegisterProject(fullProject._id, {
        totalCredits: parseInt(totalCredits),
        pricePerCreditWei: priceWei.toString(), // Ensure it's a string
        metadataURI: `https://green-community.app/api/projects/metadata/${fullProject._id}`
      });
      
      // Refresh project data
      const res = await projectsApi.getProjectById(id);
      setFullProject(res?.data);
      alert('Project registered on blockchain successfully!');
    } catch (error) {
      console.error('Blockchain registration failed:', error);
      alert('Registration failed: ' + error.message);
    } finally {
      setSyncingBlockchain(false);
    }
  };

  const handleSave = async () => {
    const errors = [];
    if (!project.name) errors.push("Project name required");
    if (!project.location) errors.push("Location required");
    if (!project.type) errors.push("Type required");
    if (!project.totalFunding) errors.push("Total funding required");
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: project.name,
        location: project.location,
        type: project.type,
        description: project.description,
        totalFunding: parseFloat(project.totalFunding) || 0,
        teamSize: project.teamSize ? parseInt(project.teamSize) : undefined,
        carbonOffsetTarget: project.carbonOffsetTarget ? parseInt(project.carbonOffsetTarget) : undefined,
        status: project.status,
        verified: project.verified,
        featured: project.featured,
        expectedCompletion: project.expectedCompletion,
      };

      const res = await projectsApi.updateProject(id, payload, uploadedImage?.file || null);
      if (res?.success) {
        alert("Project updated successfully!");
        router.push("/admin/projects");
      } else {
        throw new Error(res?.message || "Failed to update project");
      }
    } catch (e) {
      console.error("Update project failed", e);
      alert(e.message || "Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push("/admin/projects");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
          <p className="text-muted-foreground">Update project details</p>
        </div>
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
        <div className="text-sm text-muted-foreground">Loading project...</div>
      ) : (
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
                <CardDescription>Edit the basic details of your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Name *</label>
                    <Input
                      placeholder="Enter project name"
                      value={project.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter location"
                        value={project.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Type *</label>
                    <Select value={project.type} onValueChange={(v) => handleInputChange("type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forestry">Forestry</SelectItem>
                        <SelectItem value="renewable">Renewable Energy</SelectItem>
                        <SelectItem value="water">Water Conservation</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="waste">Waste Management</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select value={project.status} onValueChange={(v) => handleInputChange("status", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Enter detailed project description..."
                    value={project.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
                <CardDescription>Update funding and financial details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Funding Required (₹) *</label>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      value={project.totalFunding}
                      onChange={(e) => handleInputChange("totalFunding", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Completion Date</label>
                    <Input
                      placeholder="YYYY-MM-DD"
                      type="date"
                      value={project.expectedCompletion}
                      onChange={(e) => handleInputChange("expectedCompletion", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Project Details
                </CardTitle>
                <CardDescription>Additional project specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Size</label>
                    <Input
                      placeholder="Number of team members"
                      type="number"
                      value={project.teamSize}
                      onChange={(e) => handleInputChange("teamSize", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Carbon Offset Target (kg)</label>
                    <Input
                      placeholder="Target CO₂ reduction"
                      type="number"
                      value={project.carbonOffsetTarget}
                      onChange={(e) => handleInputChange("carbonOffsetTarget", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Project Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Image */}
                {existingImage && !uploadedImage && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                    <img src={existingImage} alt="Project" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* New Image Preview */}
                {uploadedImage && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                    <img src={uploadedImage.preview || "/tree1.jpg"} alt="Project preview" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="sm" onClick={handleRemoveImage} className="absolute top-2 right-2 h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{uploadedImage ? "Change Image" : "Upload Image"}</span>
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
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Click to upload</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Verified Project</span>
                    </div>
                    <input type="checkbox" checked={project.verified} onChange={(e) => handleInputChange("verified", e.target.checked)} className="rounded" />
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

            {/* Project Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">Featured Project</span>
                  </div>
                  <input type="checkbox" checked={project.featured} onChange={(e) => handleInputChange("featured", e.target.checked)} className="rounded" />
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Blockchain Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fullProject?.blockchain?.projectId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-800">Project Registered on Blockchain</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Project ID:</span>
                          <div className="font-mono font-bold text-lg">#{fullProject.blockchain.projectId}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Available Credits:</span>
                          <div className="font-bold text-lg">
                            {((fullProject.blockchain.totalCredits || 0) - (fullProject.blockchain.soldCredits || 0)).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Price per Credit:</span>
                          <div className="font-mono text-sm">{fullProject.blockchain.pricePerCreditWei} wei</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Credits:</span>
                          <div className="font-bold">{(fullProject.blockchain.totalCredits || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSyncBlockchain}
                        disabled={syncingBlockchain}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className={`h-4 w-4 ${syncingBlockchain ? 'animate-spin' : ''}`} />
                        {syncingBlockchain ? 'Syncing...' : 'Sync Blockchain'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(`https://sepolia.etherscan.io/address/0x462EA24B63bf09f522652c1B6550c8B65AfF99E4`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Contract
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        This project is not yet registered on the blockchain. Register it to enable carbon credit trading with crypto payments.
                      </p>
                    </div>
                    <Button
                      onClick={handleRegisterBlockchain}
                      disabled={syncingBlockchain}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Cpu className="h-4 w-4" />
                      {syncingBlockchain ? 'Registering...' : 'Register on Blockchain'}
                    </Button>
                    <p className="text-xs text-gray-500">
                      Registration will create an ERC1155 token for carbon credits on Sepolia testnet and enable MetaMask payments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Blockchain Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fullProject?.blockchain?.projectId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-800">Project Registered on Blockchain</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Project ID:</span>
                          <div className="font-mono font-bold text-lg">#{fullProject.blockchain.projectId}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Available Credits:</span>
                          <div className="font-bold text-lg">
                            {((fullProject.blockchain.totalCredits || 0) - (fullProject.blockchain.soldCredits || 0)).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Price per Credit:</span>
                          <div className="font-mono text-sm">{fullProject.blockchain.pricePerCreditWei} wei</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Credits:</span>
                          <div className="font-bold">{(fullProject.blockchain.totalCredits || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSyncBlockchain}
                        disabled={syncingBlockchain}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className={`h-4 w-4 ${syncingBlockchain ? 'animate-spin' : ''}`} />
                        {syncingBlockchain ? 'Syncing...' : 'Sync Blockchain'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(`https://sepolia.etherscan.io/address/0x462EA24B63bf09f522652c1B6550c8B65AfF99E4`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Contract
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        This project is not yet registered on the blockchain. Register it to enable carbon credit trading with crypto payments.
                      </p>
                    </div>
                    <Button
                      onClick={handleRegisterBlockchain}
                      disabled={syncingBlockchain}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Cpu className="h-4 w-4" />
                      {syncingBlockchain ? 'Registering...' : 'Register on Blockchain'}
                    </Button>
                    <p className="text-xs text-gray-500">
                      Registration will create an ERC1155 token for carbon credits on Sepolia testnet and enable MetaMask payments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm"><span className="font-medium">Name:</span> {project.name || "Not set"}</div>
                <div className="text-sm"><span className="font-medium">Location:</span> {project.location || "Not set"}</div>
                <div className="text-sm"><span className="font-medium">Type:</span> {project.type || "Not set"}</div>
                <div className="text-sm"><span className="font-medium">Funding:</span> {project.totalFunding ? formatINR(parseInt(project.totalFunding)) : "Not set"}</div>
                <div className="text-sm"><span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : project.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {project.status || 'draft'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProjectPage;
