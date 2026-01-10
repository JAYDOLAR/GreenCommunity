"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const AddProjectPage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
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

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          preview: e.target.result,
        });
        setProject((prev) => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setProject((prev) => ({ ...prev, image: "" }));
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
        const res = await new Promise((resolve,reject)=>{
          xhr.open('POST','/api/admin/projects/upload-doc');
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
              if(xhr.status>=200 && xhr.status<300) resolve(JSON.parse(xhr.responseText)); else reject(new Error(xhr.statusText||'Upload failed'));
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
        teamSize: project.teamSize ? parseInt(project.teamSize) : null,
        carbonOffsetTarget: project.carbonOffsetTarget
          ? parseInt(project.carbonOffsetTarget)
          : null,
        credits: computedCredits,
      };
      // Attach documents as base64 to send; server will push to IPFS
      if (documents?.length) {
        const toBase64 = (arrayBuffer) => {
          // Browser-friendly base64 (avoids relying on Node Buffer in Next.js edge/client)
            let binary = '';
            const bytes = new Uint8Array(arrayBuffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        };
        projectData.documents = await Promise.all(documents.map(async d => {
          try {
            if (!d.file || typeof d.file.arrayBuffer !== 'function') {
              return { name: d.name, size: d.size, skipped: true, reason: 'original file reference lost' };
            }
            const buf = await d.file.arrayBuffer();
            return { name: d.name, size: d.size, base64: toBase64(buf) };
          } catch (err) {
            console.error('Doc encode failed', d.name, err);
            return { name: d.name, size: d.size, error: err.message };
          }
        }));
      }
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error("Failed to save project");
      const json = await response.json();
      setSavedDocs(json.documents || []);
      router.push("/admin/projects");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Add New Project
          </h1>
          <p className="text-muted-foreground">
            Create a new carbon offset project
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveProject} disabled={isLoading}>
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
                  ? `₹${parseInt(project.totalFunding).toLocaleString()}`
                  : "Not set"}
              </div>
              {project.registerOnBlockchain && (
                <div className="text-sm space-y-1 border-t pt-2">
                  <div>
                    <span className="font-medium">Credits:</span>{" "}
                    {project.totalCredits || "n/a"}
                  </div>
                  <div>
                    <span className="font-medium">Price (wei):</span>{" "}
                    {project.pricePerCreditWei || "n/a"}
                  </div>
                  <div>
                    <span className="font-medium">Metadata URI:</span>{" "}
                    {project.metadataURI || "n/a"}
                  </div>
                  <div>
                    <span className="font-medium">AutoRetire Bps:</span>{" "}
                    {project.autoRetireBps || "0"}
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
