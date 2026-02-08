"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { projectsApi } from '@/lib/projectsApi';
import { blockchainApi } from '@/lib/blockchainApi';
import { API_BASE_URL } from '@/lib/api';
import useCurrency from '@/hooks/useCurrency';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Cpu,
  Link2,
  Pin,
  AlertTriangle,
} from "lucide-react";

const AddProjectPage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { formatPrice } = useCurrency();
  const formatINR = (amount) => formatPrice(amount, 'INR');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null); // { file, preview }
  const [registerOnBlockchain, setRegisterOnBlockchain] = useState(false);
  const [project, setProject] = useState({
    name: "",
    location: "",
    type: "",
    description: "",
    totalFunding: "",
    image: "",
    status: "draft",
    verified: false,
    featured: false,
    expectedCompletion: "",
    teamSize: "",
    carbonOffsetTarget: "",
  // documents & credits
  documents: [],
  computedCredits: 0,
  });
  const [savedDocs, setSavedDocs] = useState([]);

  const handleInputChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 10MB for projects)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          preview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const docInputRef = useRef(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const handleDocsSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newDocs = files.map(f=>({ name: f.name, size: f.size, status: 'pending', progress: 0 }));
    setProject(prev=> ({ ...prev, documents: [...prev.documents, ...newDocs] }));
    // Upload sequentially to show progress; could parallelize with Promise.all
    for (let i=0;i<files.length;i++) {
      const f = files[i];
      // update status uploading
      setProject(prev=>{
        const docs=[...prev.documents];
        const idx = docs.findIndex(d=>d.name===f.name && d.status==='pending');
        if(idx>-1) docs[idx] = { ...docs[idx], status:'uploading', progress: 10 };
        return { ...prev, documents: docs };
      });
      try {
        const form = new FormData();
        form.append('file', f);
        const xhr = new XMLHttpRequest();
        const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('token')) : null;
        const res = await new Promise((resolve,reject)=>{
          xhr.open('POST', `${API_BASE_URL}/api/admin/projects/upload-doc`);
          // Send auth token so authenticateAdmin middleware accepts the request
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.withCredentials = true; // include cookies as well
          xhr.upload.onprogress = (ev)=>{
            if(ev.lengthComputable){
              const pct = Math.round((ev.loaded/ev.total)*90)+10; // 10-100
              setProject(prev=>{
                const docs=[...prev.documents];
                const idx = docs.findIndex(d=>d.name===f.name);
                if(idx>-1) docs[idx] = { ...docs[idx], progress:pct>100?100:pct };
                return { ...prev, documents: docs };
              });
            }
          };
          xhr.onreadystatechange = ()=>{
            if(xhr.readyState===4){
              if(xhr.status>=200 && xhr.status<300) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                // Parse server error message for better feedback
                let errMsg = 'Upload failed';
                try {
                  const body = JSON.parse(xhr.responseText);
                  errMsg = body.message || body.error || errMsg;
                } catch { errMsg = xhr.status === 401 ? 'Not authorised — please log in again' : errMsg; }
                reject(new Error(errMsg));
              }
            }
          };
          xhr.send(form);
        });
        setProject(prev=>{
          const docs=[...prev.documents];
          const idx = docs.findIndex(d=>d.name===f.name);
          if(idx>-1) docs[idx] = { ...docs[idx], status:'uploaded', progress:100, cid: res.cid, uri: res.uri };
          return { ...prev, documents: docs };
        });
      } catch(err){
        setProject(prev=>{
          const docs=[...prev.documents];
          const idx = docs.findIndex(d=>d.name===f.name);
            if(idx>-1) docs[idx] = { ...docs[idx], status:'error', error: err.message, progress:0 };
          return { ...prev, documents: docs };
        });
      }
    }
    e.target.value='';
  };

  const removeDoc = (idx) => {
    setProject(prev => ({ ...prev, documents: prev.documents.filter((_,i)=>i!==idx) }));
  };

  // compute credits: 1 ton CO2 == 1 credit; carbonOffsetTarget entered in kg
  const derivedCredits = project.carbonOffsetTarget ? Math.floor(Number(project.carbonOffsetTarget)/1000) : 0;
  if (project.computedCredits !== derivedCredits) {
    // keep in sync
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setTimeout(()=>setProject(prev=> prev.computedCredits===derivedCredits? prev : { ...prev, computedCredits: derivedCredits }),0);
  }

  const handleSaveProject = async () => {
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
      const { documents, computedCredits, ...base } = project;
      const projectData = {
        ...base,
        totalFunding: parseFloat(project.totalFunding),
        teamSize: project.teamSize ? parseInt(project.teamSize) : undefined,
        carbonOffsetTarget: project.carbonOffsetTarget
          ? parseInt(project.carbonOffsetTarget)
          : undefined,
        credits: computedCredits,
      };

      // Use projectsApi with image file (single image for projects)
      const response = await projectsApi.createProject(
        projectData,
        uploadedImage?.file || null
      );

      if (response.success) {
        const projectId = response?.data?._id || response?.data?.id;
        
        // If blockchain registration is requested, register the project
        if (registerOnBlockchain && derivedCredits > 0 && projectId) {
          try {
            // Server auto-computes credits from carbonOffsetTarget and pins metadata to IPFS
            await blockchainApi.approveRegisterProject(projectId, {});
            alert(`Project created and registered on blockchain!\n\n${derivedCredits} carbon credits minted on Sepolia\nMetadata pinned to IPFS`);
          } catch (blockchainError) {
            console.error('Blockchain registration failed:', blockchainError);
            alert(`Project created successfully, but blockchain registration failed: ${blockchainError.message}`);
          }
        } else {
          alert('Project created successfully!');
        }
        
        router.push("/admin/projects");
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/projects");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Add New Project
          </h1>
          <p className="text-muted-foreground">
            Create a new carbon offset project
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleCancel} className="w-full justify-center md:w-auto md:justify-start">
            Cancel
          </Button>
          <Button onClick={handleSaveProject} disabled={isLoading} className="w-full justify-center md:w-auto md:justify-start">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Project"}
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
              <CardDescription>
                Enter the basic details of your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <Input
                    placeholder="Enter project name"
                    value={project.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter location"
                      value={project.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Type *
                  </label>
                  <Select
                    value={project.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forestry">Forestry</SelectItem>
                      <SelectItem value="renewable">
                        Renewable Energy
                      </SelectItem>
                      <SelectItem value="water">Water Conservation</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="waste">Waste Management</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <Select
                    value={project.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
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
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Enter detailed project description..."
                  value={project.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
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
              <CardDescription>
                Set up funding and financial details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Funding Required (₹) *
                  </label>
                  <Input
                    placeholder="Enter amount"
                    type="number"
                    value={project.totalFunding}
                    onChange={(e) =>
                      handleInputChange("totalFunding", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expected Completion Date
                  </label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    type="date"
                    value={project.expectedCompletion}
                    onChange={(e) =>
                      handleInputChange("expectedCompletion", e.target.value)
                    }
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
              <CardDescription>
                Additional project specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Team Size
                  </label>
                  <Input
                    placeholder="Number of team members"
                    type="number"
                    value={project.teamSize}
                    onChange={(e) =>
                      handleInputChange("teamSize", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Carbon Offset Target (kg)
                  </label>
                  <Input
                    placeholder="Target CO₂ reduction"
                    type="number"
                    value={project.carbonOffsetTarget}
                    onChange={(e) =>
                      handleInputChange("carbonOffsetTarget", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents & Credits (IPFS) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" /> Project Documents & Credits
              </CardTitle>
              <CardDescription>Upload supporting docs (stored on local IPFS). Credits auto-computed: 1 credit per 1 ton CO₂ (1000 kg). Carbon Offset Target set above.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-2">Upload Documents</label>
                  <input ref={docInputRef} type="file" multiple onChange={handleDocsSelect} className="border rounded p-2" />
                  {uploadingDocs && <p className="text-xs text-muted-foreground mt-1">Processing files...</p>}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Computed Credits (from Carbon Offset Target above): <span className="font-semibold">{derivedCredits}</span></p>
              </div>
              {project.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Documents</p>
                  <ul className="space-y-1 text-xs max-h-40 overflow-auto border rounded p-2 bg-muted/30">
                    {project.documents.map((d,i)=>(
                      <li key={i} className="flex items-center justify-between gap-2">
                        <div className="flex-1 truncate">
                          {d.name} {d.status==='uploaded' && d.cid && (<span className='text-green-600'>[{d.cid.slice(0,8)}]</span>)}
                          {d.status==='error' && (<span className='text-red-600'>(error)</span>)}
                        </div>
                        <div className="flex items-center gap-2">
                          {d.status!=='uploaded' && d.status!=='error' && (
                            <div className="w-24 h-1 bg-gray-200 rounded overflow-hidden">
                              <div style={{width:`${d.progress}%`}} className="h-full bg-blue-500 transition-all"></div>
                            </div>
                          )}
                          {d.status==='uploaded' && <span className='text-green-700'>Done</span>}
                          {d.status==='error' && <span className='text-red-700'>Fail</span>}
                          {d.status!=='uploading' && <Button size='xs' variant='ghost' onClick={()=>removeDoc(i)}>X</Button>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Documents will be stored via your running local IPFS node on save.</p>
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
              {/* Image Preview - Only show when image is uploaded */}
              {uploadedImage && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                  <img
                    src={uploadedImage.preview || "/tree1.jpg"}
                    alt="Project preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
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
                        {uploadedImage ? "Change Image" : "Click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verified Project</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={project.verified}
                    onChange={(e) => handleInputChange("verified", e.target.checked)}
                    className="rounded"
                  />
                </div>
                {uploadedImage && (
                  <div className="text-xs text-muted-foreground">
                    <p>File: {uploadedImage.file.name}</p>
                    <p>
                      Size: {(uploadedImage.file.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </p>
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
                <input
                  type="checkbox"
                  checked={project.featured}
                  onChange={(e) =>
                    handleInputChange("featured", e.target.checked)
                  }
                  className="rounded"
                />
              </div>
              
              {/* Blockchain Registration Option */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm font-medium">Register on Blockchain</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={registerOnBlockchain}
                    onChange={(e) => {
                      if (e.target.checked && derivedCredits <= 0) {
                        alert('Set Carbon Offset Target (min 1000 kg) before enabling blockchain registration.');
                        return;
                      }
                      setRegisterOnBlockchain(e.target.checked);
                    }}
                    className="rounded"
                  />
                </div>
                
                {registerOnBlockchain && (
                  <div className="space-y-3 ml-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium flex items-center gap-1">
                      <Link2 className="h-4 w-4" /> Blockchain Registration Summary
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Carbon Offset Target:</span>
                        <div className="font-bold">{Number(project.carbonOffsetTarget || 0).toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Credits to Mint:</span>
                        <div className="font-bold text-green-700">{derivedCredits.toLocaleString()} credits</div>
                        <span className="text-xs text-gray-500">(1 credit = 1 ton CO₂)</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Price per Credit:</span>
                        <div className="font-bold">0.01 ETH</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Network:</span>
                        <div className="font-bold">Sepolia Testnet</div>
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-1">
                      <Pin className="h-3 w-3 mt-0.5 shrink-0" /> Project metadata (name, description, certifications, documents) will be pinned to IPFS automatically during registration.
                    </div>
                    {project.documents.length > 0 && (
                      <div className="p-2 bg-green-100 rounded text-xs text-green-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 shrink-0" /> {project.documents.filter(d => d.status === 'uploaded').length} document(s) uploaded — will be referenced in blockchain metadata
                      </div>
                    )}
                    {project.documents.length === 0 && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" /> Upload supporting documents (e.g., Verra Gold Standard certificate) above for stronger verification
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {project.name || "Not set"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Location:</span>{" "}
                {project.location || "Not set"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Type:</span>{" "}
                {project.type || "Not set"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Funding:</span>{" "}
                {project.totalFunding
                  ? formatINR(parseInt(project.totalFunding))
                  : "Not set"}
              </div>
              {registerOnBlockchain && derivedCredits > 0 && (
                <div className="text-sm space-y-1 border-t pt-2">
                  <div>
                    <span className="font-medium">Carbon Credits:</span>{" "}
                    {derivedCredits.toLocaleString()} credits
                  </div>
                  <div>
                    <span className="font-medium">Price per Credit:</span>{" "}
                    0.01 ETH
                  </div>
                  <div>
                    <span className="font-medium">Network:</span>{" "}
                    Sepolia Testnet
                  </div>
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">Status:</span>
                <Badge
                  className={`ml-2 ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : project.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status || "draft"}
                </Badge>
              </div>
              {savedDocs.length > 0 && (
                <div className="text-xs border-t pt-2 space-y-1">
                  <p className="font-medium">Stored Documents (IPFS)</p>
                  {savedDocs.map((d,i)=>(
                    <div key={i} className="truncate">{d.name}: <span className="text-blue-600">{d.hash || d.url}</span></div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProjectPage;
