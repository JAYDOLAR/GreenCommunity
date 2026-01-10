'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCcw
} from 'lucide-react';
import { blockchainApi } from '@/lib/blockchainApi';

const ProjectsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showEditProject, setShowEditProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProject, setEditingProject] = useState({});
  const [projects, setProjects] = useState([]);
  const [syncingId, setSyncingId] = useState(null);
  // Removed blockchain registration UI (now automatic in backend)
  const [saving, setSaving] = useState(false);
  // Registration flow moved to Add Project page

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'forestry': return 'bg-green-100 text-green-800';
      case 'renewable': return 'bg-blue-100 text-blue-800';
      case 'water': return 'bg-cyan-100 text-cyan-800';
      case 'agriculture': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects?limit=1000&page=1', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const json = text ? JSON.parse(text) : {};
      const list = (json?.data?.projects || json?.projects || []).map(p => ({ ...p, id: p._id || p.id }));
      setProjects(list);
    } catch (e) {
      console.error('Fetch projects failed', e);
      setProjects([]);
    } finally { setIsLoading(false); }
  };

  // Generic partial updater
  const updateProjectPartial = async (id, patch, { optimistic = true } = {}) => {
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    let rollback;
    if (optimistic) {
      rollback = projects[idx];
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    }
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch })
      });
      if (!res.ok) throw new Error(`Update failed ${res.status}`);
      const data = await res.json().catch(()=>({}));
      if (data.project) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data.project, id: data.project._id || data.project.id || id } : p));
      }
      return true;
    } catch (e) {
      console.error('Partial update error', e);
      if (rollback) setProjects(prev => prev.map(p => p.id === id ? rollback : p));
      alert(e.message || 'Update failed');
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
    router.push('/admin/projects/add');
  };

  const handleSyncProject = async (project) => {
    if(!project?._id && !project.id) return;
    try {
      setSyncingId(project._id || project.id);
      await blockchainApi.syncProject(project._id || project.id);
      await fetchProjects();
    } catch (e) { console.error('Sync failed', e); alert('Sync failed: '+ e.message); } finally { setSyncingId(null); }
  };

  const openRegisterForm = (project) => {
    setShowRegisterFormFor(project._id || project.id);
    setRegisterForm({ totalCredits:'', pricePerCreditWei:'', metadataURI:'' });
  };

  const submitRegister = async (project) => {
    if(!registerForm.totalCredits || !registerForm.pricePerCreditWei || !registerForm.metadataURI) {
      alert('Fill all fields'); return; }
    try {
      setRegisteringId(project._id || project.id);
      await blockchainApi.approveRegisterProject(project._id || project.id, {
        totalCredits: parseInt(registerForm.totalCredits),
        pricePerCreditWei: registerForm.pricePerCreditWei,
        metadataURI: registerForm.metadataURI
      });
      setShowRegisterFormFor(null);
      await fetchProjects();
    } catch (e) { console.error('Register failed', e); alert('Register failed: '+ e.message); } finally { setRegisteringId(null); }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditingProject({
      name: project.name || '',
      location: project.location || '',
      type: project.type || '',
      description: project.description || '',
      totalFunding: (project.totalFunding || 0).toString(),
      image: project.image || '',
      status: project.status || 'pending',
      verified: project.verified || false,
      featured: project.featured || false,
      expectedCompletion: project.expectedCompletion || '',
      teamSize: (project.teamSize || 0).toString(),
      carbonOffsetTarget: (project.carbonOffsetTarget || 0).toString()
    });
    setShowEditProject(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Delete this project?')) return;
    const prev = projects;
    setProjects(prev.filter(p => p.id !== projectId));
    try {
      const res = await fetch(`/api/admin/projects?id=${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed ${res.status}`);
    } catch (e) {
      console.error('Delete project failed', e);
      alert(e.message || 'Delete failed');
      setProjects(prev); // rollback
    }
  };

  const handleUpdateProject = async () => {
    if (selectedProject && editingProject.name && editingProject.location && editingProject.type) {
      try {
        setSaving(true);
        const payload = {
          name: editingProject.name,
          location: editingProject.location,
            type: editingProject.type,
            description: editingProject.description,
            totalFunding: parseFloat(editingProject.totalFunding),
            teamSize: editingProject.teamSize ? parseInt(editingProject.teamSize) : null,
            carbonOffsetTarget: editingProject.carbonOffsetTarget ? parseInt(editingProject.carbonOffsetTarget) : null,
            status: editingProject.status,
            image: editingProject.image,
            verified: editingProject.verified !== undefined ? editingProject.verified : selectedProject.verified,
            featured: editingProject.featured !== undefined ? editingProject.featured : selectedProject.featured,
            expectedCompletion: editingProject.expectedCompletion
        };
        const ok = await updateProjectPartial(selectedProject.id, payload, { optimistic: false });
        if (ok) {
          setShowEditProject(false);
          setSelectedProject(null);
          setEditingProject({});
          await fetchProjects(); // refresh to show any auto-registration
        }
      } catch (error) {
        console.error('Failed to update project:', error);
        alert('Failed to update project. Please try again.');
      } finally {
        setSaving(false);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleExportProjects = () => {
    const csvContent = [
      ['Name', 'Location', 'Type', 'Status', 'Total Funding', 'Current Funding', 'Contributors', 'CO2 Removed', 'Verified', 'Featured', 'Created Date', 'Expected Completion', 'Team Size', 'Carbon Offset Target'],
      ...projects.map(project => [
        project.name,
        project.location,
        project.type,
        project.status,
        project.totalFunding,
        project.currentFunding,
        project.contributors,
        project.co2Removed,
        project.verified ? 'Yes' : 'No',
        project.featured ? 'Yes' : 'No',
        project.createdDate,
        project.expectedCompletion || '',
        project.teamSize || '',
        project.carbonOffsetTarget || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
          <p className="text-muted-foreground">Manage carbon offset projects and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">75% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carbon Offset</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + (p.co2Removed || 0), 0).toLocaleString()} kg</div>
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

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>Manage project approvals and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project, idx) => (
              <div key={project.id || project._id || idx} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-16 h-16 bg-accent rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={project.image || '/tree1.jpg'}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/tree1.jpg'; }}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge className={getTypeColor(project.type)}>
                      {project.type}
                    </Badge>
                    {project.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {project.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">{Math.min(100, Math.round(((project.currentFunding || 0) / Math.max(1, project.fundingGoal || project.totalFunding || 0)) * 100))}%</span>
                    </div>
                    <Progress value={Math.min(100, Math.round(((project.currentFunding || 0) / Math.max(1, project.fundingGoal || project.totalFunding || 0)) * 100))} className="h-2" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ₹{(project.currentFunding/10000000).toFixed(1)}Cr raised
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {(project.contributors || 0).toLocaleString()} contributors
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {(((project.impact && project.impact.carbonOffset) || project.co2Removed || 0)).toLocaleString()} kg CO₂
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Blockchain status badge (hidden when off-chain) */}
                  {project.blockchain?.projectId && (
                    <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                      <Cpu className="h-3 w-3" />ID #{project.blockchain.projectId}
                    </Badge>
                  )}
                  <Select value={project.status} onValueChange={(value) => handleStatusChange(project.id, value)}>
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
                    onClick={() => handleVerificationChange(project.id, !project.verified)}
                    title={project.verified ? 'Unverify' : 'Verify'}
                  >
                    {project.verified ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFeaturedChange(project.id, !project.featured)}
                    title={project.featured ? 'Remove from featured' : 'Mark as featured'}
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
                  {/* Sync action (registration only at creation) */}
                  {project.blockchain?.projectId && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={syncingId === (project._id || project.id)}
                      onClick={() => handleSyncProject(project)}
                      title="Sync blockchain stats"
                    >
                      <RefreshCcw className={`h-4 w-4 mr-1 ${syncingId === (project._id || project.id) ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Modal */}
      {showEditProject && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Edit Project</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEditProject(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name *</label>
                  <Input 
                    value={editingProject.name || selectedProject.name}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <Input 
                    value={editingProject.location || selectedProject.location}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Type *</label>
                  <Select 
                    value={editingProject.type || selectedProject.type}
                    onValueChange={(value) => setEditingProject(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forestry">Forestry</SelectItem>
                      <SelectItem value="renewable">Renewable Energy</SelectItem>
                      <SelectItem value="water">Water Conservation</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Funding (₹) *</label>
                  <Input 
                    value={editingProject.totalFunding || selectedProject.totalFunding}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, totalFunding: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  value={editingProject.description || selectedProject.description}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select 
                    value={editingProject.status || selectedProject.status}
                    onValueChange={(value) => setEditingProject(prev => ({ ...prev, status: value }))}
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
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <Select 
                    value={editingProject.image || selectedProject.image}
                    onValueChange={(value) => setEditingProject(prev => ({ ...prev, image: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/tree1.jpg">Tree 1</SelectItem>
                      <SelectItem value="/tree2.jpg">Tree 2</SelectItem>
                      <SelectItem value="/tree3.jpg">Tree 3</SelectItem>
                      <SelectItem value="/tree4.jpg">Tree 4</SelectItem>
                      <SelectItem value="/tree5.jpg">Tree 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-verified"
                    checked={editingProject.verified !== undefined ? editingProject.verified : selectedProject.verified}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, verified: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="edit-verified" className="text-sm font-medium">Verified</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editingProject.featured !== undefined ? editingProject.featured : selectedProject.featured}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="edit-featured" className="text-sm font-medium">Featured</label>
                </div>
              </div>

              {/* Blockchain registration inputs removed (handled automatically server-side) */}
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowEditProject(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateProject} className="flex-1" disabled={saving}>
                <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Update Project'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 