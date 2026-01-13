"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { projectsApi } from "@/lib/projectsApi";
import { blockchainApi } from "@/lib/blockchainApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  TreePine,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Target,
  Users,
  MapPin,
  Calendar,
  Plus,
  Download,
  RefreshCw,
  Trash2,
  Save,
  Upload,
  Cpu,
  RefreshCcw,
  X,
} from "lucide-react";

const ProjectsPage = () => {
  const router = useRouter();
  const editImageInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showEditProject, setShowEditProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProject, setEditingProject] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [syncingId, setSyncingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "forestry":
        return "bg-green-100 text-green-800";
      case "renewable":
        return "bg-blue-100 text-blue-800";
      case "water":
        return "bg-cyan-100 text-cyan-800";
      case "agriculture":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = (projects || []).filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectsApi.getProjects({ limit: 1000, page: 1 });
      const list = response?.data?.projects || [];
      setProjects(list);
    } catch (e) {
      console.error("Fetch projects failed", e);
      setProjects([]);
      alert("Failed to fetch projects: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generic partial updater
  const updateProjectPartial = async (
    id,
    patch,
    { optimistic = true } = {}
  ) => {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    let rollback;
    if (optimistic) {
      rollback = projects[idx];
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    }
    try {
      const response = await projectsApi.updateProject(id, patch);
      if (response.success && response.data) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...response.data } : p))
        );
      }
      return true;
    } catch (e) {
      console.error("Partial update error", e);
      if (rollback)
        setProjects((prev) => prev.map((p) => (p.id === id ? rollback : p)));
      alert(e.message || "Update failed");
      return false;
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    await updateProjectPartial(projectId, { status: newStatus });
  };

  const handleVerificationChange = async (projectId, verified) => {
    await updateProjectPartial(projectId, { verified });
  };

  const handleFeaturedChange = async (projectId, featured) => {
    await updateProjectPartial(projectId, { featured });
  };

  const handleAddProject = () => {
    router.push("/admin/projects/add");
  };

  const handleSyncProject = async (project) => {
    if (!project?._id && !project.id) return;
    try {
      setSyncingId(project._id || project.id);
      await blockchainApi.syncProject(project._id || project.id);
      await fetchProjects();
    } catch (e) {
      console.error("Sync failed", e);
      alert("Sync failed: " + e.message);
    } finally {
      setSyncingId(null);
    }
  };

  const openRegisterForm = (project) => {
    setShowRegisterFormFor(project._id || project.id);
    setRegisterForm({
      totalCredits: "",
      pricePerCreditWei: "",
      metadataURI: "",
    });
  };

  const submitRegister = async (project) => {
    if (
      !registerForm.totalCredits ||
      !registerForm.pricePerCreditWei ||
      !registerForm.metadataURI
    ) {
      alert("Fill all fields");
      return;
    }
    try {
      setRegisteringId(project._id || project.id);
      await blockchainApi.approveRegisterProject(project._id || project.id, {
        totalCredits: parseInt(registerForm.totalCredits),
        pricePerCreditWei: registerForm.pricePerCreditWei,
        metadataURI: registerForm.metadataURI,
      });
      setShowRegisterFormFor(null);
      await fetchProjects();
    } catch (e) {
      console.error("Register failed", e);
      alert("Register failed: " + e.message);
    } finally {
      setRegisteringId(null);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditingProject({
      name: project.name || "",
      location: project.location || "",
      type: project.type || "",
      description: project.description || "",
      totalFunding: (project.totalFunding || 0).toString(),
      image: project.image || "",
      status: project.status || "pending",
      verified: project.verified || false,
      featured: project.featured || false,
      expectedCompletion: project.expectedCompletion || "",
      teamSize: (project.teamSize || 0).toString(),
      carbonOffsetTarget: (project.carbonOffsetTarget || 0).toString(),
    });
    setEditImageFile(null);
    setEditImagePreview(null);
    setShowEditProject(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !confirm(
        "Delete this project? This will also delete the project image from Cloudinary."
      )
    )
      return;
    const prev = projects;
    setProjects(prev.filter((p) => p.id !== projectId));
    try {
      await projectsApi.deleteProject(projectId);
    } catch (e) {
      console.error("Delete project failed", e);
      alert(e.message || "Delete failed");
      setProjects(prev); // rollback
    }
  };

  const handleEditImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }

    setEditImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  };

  const handleUpdateProject = async () => {
    if (
      !selectedProject ||
      !editingProject.name ||
      !editingProject.location ||
      !editingProject.type
    ) {
      alert("Please fill in all required fields (Name, Location, Type)");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: editingProject.name,
        location: editingProject.location,
        type: editingProject.type,
        description: editingProject.description,
        totalFunding: parseFloat(editingProject.totalFunding) || 0,
        teamSize: editingProject.teamSize
          ? parseInt(editingProject.teamSize)
          : undefined,
        carbonOffsetTarget: editingProject.carbonOffsetTarget
          ? parseInt(editingProject.carbonOffsetTarget)
          : undefined,
        status: editingProject.status,
        verified: editingProject.verified,
        featured: editingProject.featured,
        expectedCompletion: editingProject.expectedCompletion,
      };

      const response = await projectsApi.updateProject(
        selectedProject.id,
        payload,
        editImageFile || null
      );

      if (response.success) {
        setShowEditProject(false);
        setSelectedProject(null);
        setEditingProject({});
        setEditImageFile(null);
        setEditImagePreview(null);
        await fetchProjects();
        alert("Project updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportProjects = () => {
    const csvContent = [
      [
        "Name",
        "Location",
        "Type",
        "Status",
        "Total Funding",
        "Current Funding",
        "Contributors",
        "CO2 Removed",
        "Verified",
        "Featured",
        "Created Date",
        "Expected Completion",
        "Team Size",
        "Carbon Offset Target",
      ],
      ...(projects || []).map((p) => [
        p.name || "",
        p.location || "",
        p.type || "",
        p.status || "",
        p.totalFunding || p.fundingGoal || 0,
        p.currentFunding || 0,
        p.contributors || 0,
        p.co2Removed || p.impact?.carbonOffset || 0,
        p.verified ? "Yes" : "No",
        p.featured ? "Yes" : "No",
        p.createdDate || p.created_at || "",
        p.expectedCompletion || p.endDate || "",
        p.teamSize || 0,
        p.carbonOffsetTarget || 0,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await fetchProjects();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Project Management
          </h1>
          <p className="text-muted-foreground">
            Manage carbon offset projects and approvals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportProjects}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">75% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Carbon Offset
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects
                .reduce((sum, p) => sum + (p.co2Removed || 0), 0)
                .toLocaleString()}{" "}
              kg
            </div>
            <p className="text-xs text-muted-foreground">CO₂ removed</p>
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="forestry">Forestry</SelectItem>
                <SelectItem value="renewable">Renewable Energy</SelectItem>
                <SelectItem value="water">Water Conservation</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>
            Manage project approvals and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project, idx) => (
              <Card
                key={project.id || project._id || idx}
                className="border hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-4">
                    {/* Project Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={project.image || "/tree1.jpg"}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/tree1.jpg";
                        }}
                      />
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Badges */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{project.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <Select
                            value={project.status}
                            onValueChange={(value) =>
                              handleStatusChange(project.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVerificationChange(project.id, !project.verified)
                            }
                            title={project.verified ? "Unverify" : "Verify"}
                          >
                            {project.verified ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleFeaturedChange(project.id, !project.featured)
                            }
                            title={
                              project.featured
                                ? "Remove from featured"
                                : "Mark as featured"
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProject(project)}
                            title="Edit Project"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            title="Delete Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getTypeColor(project.type)}>
                          {project.type}
                        </Badge>
                        {project.verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {project.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Featured
                          </Badge>
                        )}
                        {project.blockchain?.projectId && (
                          <Badge className="bg-emerald-600 text-white">
                            <Cpu className="h-3 w-3 mr-1" />
                            ID #{project.blockchain.projectId}
                          </Badge>
                        )}
                      </div>

                      {/* Funding Progress */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">
                            Funding Progress
                          </span>
                          <span className="font-semibold text-green-600">
                            {Math.min(
                              100,
                              Math.round(
                                ((project.currentFunding || 0) /
                                  Math.max(
                                    1,
                                    project.fundingGoal || project.totalFunding || 0
                                  )) *
                                  100
                              )
                            )}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            Math.round(
                              ((project.currentFunding || 0) /
                                Math.max(
                                  1,
                                  project.fundingGoal || project.totalFunding || 0
                                )) *
                                100
                            )
                          )}
                          className="h-2"
                        />
                      </div>

                      {/* Project Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ₹{(project.currentFunding / 10000000).toFixed(1)}Cr raised
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {(project.contributors || 0).toLocaleString()} contributors
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {(
                            (project.impact && project.impact.carbonOffset) ||
                            project.co2Removed ||
                            0
                          ).toLocaleString()} kg CO₂
                        </span>
                        {project.teamSize && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Team: {project.teamSize}
                          </span>
                        )}
                        {project.expectedCompletion && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.expectedCompletion).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sync Action (if blockchain registered) */}
                  {project.blockchain?.projectId && (
                    <div className="px-4 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={syncingId === (project._id || project.id)}
                        onClick={() => handleSyncProject(project)}
                        title="Sync blockchain stats"
                      >
                        <RefreshCcw
                          className={`h-4 w-4 mr-2 ${
                            syncingId === (project._id || project.id)
                              ? "animate-spin"
                              : ""
                          }`}
                        />
                        Sync Blockchain Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Modal */}
      <Dialog open={showEditProject} onOpenChange={setShowEditProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to the project details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="overflow-y-auto max-h-[60vh] p-1">
              <div className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-right">
                      Project Name *
                    </Label>
                    <Input
                      id="name"
                      value={editingProject.name || selectedProject?.name}
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-right">
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={
                        editingProject.location || selectedProject?.location
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-right">
                      Project Type *
                    </Label>
                    <Select
                      value={editingProject.type || selectedProject?.type}
                      onValueChange={(value) =>
                        setEditingProject((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forestry">Forestry</SelectItem>
                        <SelectItem value="renewable">
                          Renewable Energy
                        </SelectItem>
                        <SelectItem value="water">
                          Water Conservation
                        </SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="funding" className="text-right">
                      Total Funding (₹) *
                    </Label>
                    <Input
                      id="funding"
                      value={
                        editingProject.totalFunding ||
                        selectedProject?.totalFunding
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          totalFunding: e.target.value,
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={
                      editingProject.description || selectedProject?.description
                    }
                    onChange={(e) =>
                      setEditingProject((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={editingProject.status || selectedProject?.status}
                      onValueChange={(value) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="completion" className="text-right">
                      Expected Completion
                    </Label>
                    <Input
                      id="completion"
                      type="date"
                      value={
                        editingProject.expectedCompletion ||
                        selectedProject?.expectedCompletion ||
                        ""
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          expectedCompletion: e.target.value,
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="team-size" className="text-right">
                      Team Size
                    </Label>
                    <Input
                      id="team-size"
                      type="number"
                      value={
                        editingProject.teamSize ||
                        selectedProject?.teamSize ||
                        ""
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          teamSize: e.target.value,
                        }))
                      }
                      placeholder="Number of team members"
                      className="col-span-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offset-target" className="text-right">
                      Carbon Offset Target (kg)
                    </Label>
                    <Input
                      id="offset-target"
                      type="number"
                      value={
                        editingProject.carbonOffsetTarget ||
                        selectedProject?.carbonOffsetTarget ||
                        ""
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          carbonOffsetTarget: e.target.value,
                        }))
                      }
                      placeholder="Target CO₂ reduction"
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">
                    Project Image
                  </Label>
                  <div className="space-y-2">
                    {/* Current Image Display */}
                    {!editImagePreview && selectedProject?.image && (
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={selectedProject.image}
                          alt="Current project"
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2">
                          Current Image
                        </Badge>
                      </div>
                    )}

                    {/* New Image Preview */}
                    {editImagePreview && (
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={editImagePreview}
                          alt="New project"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveEditImage}
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                        <Badge className="absolute top-2 left-2 bg-blue-600">
                          New Image
                        </Badge>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        ref={editImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label
                        htmlFor="edit-image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {editImageFile
                            ? "Change Image"
                            : editImagePreview
                            ? "Upload Different Image"
                            : "Upload New Image"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB • Leave empty to keep current
                          image
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-verified"
                      checked={
                        editingProject.verified !== undefined
                          ? editingProject.verified
                          : selectedProject?.verified
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          verified: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <label
                      htmlFor="edit-verified"
                      className="text-sm font-medium"
                    >
                      Verified
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={
                        editingProject.featured !== undefined
                          ? editingProject.featured
                          : selectedProject?.featured
                      }
                      onChange={(e) =>
                        setEditingProject((prev) => ({
                          ...prev,
                          featured: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <label
                      htmlFor="edit-featured"
                      className="text-sm font-medium"
                    >
                      Featured
                    </label>
                  </div>
                </div>

                {/* Blockchain registration inputs removed (handled automatically server-side) */}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowEditProject(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={saving}
            >
              <Save
                className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`}
              />
              {saving ? "Saving..." : "Update Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
