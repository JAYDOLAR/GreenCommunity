'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Calendar,
  Activity,
  Shield,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText as FileTextIcon,
  BarChart3,
  User
} from 'lucide-react';

const UsersPage = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState({});

  // Dashboard-like actions
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [users, setUsers] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const updatedUser = await updateUser({ id: userId, status: newStatus });
      if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updatedUser.status, isEmailVerified: updatedUser.isEmailVerified } : u));
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (e) {
      console.error('Failed to change status:', e);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await updateUser({ id: userId, role: newRole });
      if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updatedUser.role } : u));
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (e) {
      console.error('Failed to change role:', e);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      }
    }
  };

  const handleExportUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch fresh data from API before exporting
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users?limit=1000&page=1', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`Invalid response (HTTP ${response.status})`);
      }
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { throw new Error(`Invalid response (HTTP ${response.status})`); }
      
      if (data.users && data.users.length > 0) {
        const csvContent = [
          ['Name', 'Email', 'Role', 'Status', 'Join Date', 'Last Login', 'Contributions', 'Carbon Offset'],
          ...data.users.map(user => [
            user.name,
            user.email,
            user.role,
            user.status,
            user.joinDate,
            user.lastLogin,
            user.totalContributions,
            user.carbonOffset
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Update the local state with fresh data
        setUsers(data.users);
      } else {
        alert('No users found to export');
      }
    } catch (error) {
      console.error('Failed to export users:', error);
      alert('Failed to export users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token:', adminToken ? 'exists' : 'missing');
      
      const response = await fetch('/api/admin/users?limit=1000&page=1', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`Invalid response (HTTP ${response.status})`);
      }
      console.log('Response status:', response.status);
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { console.error('Non-JSON response body preview:', String(text).slice(0,200)); throw new Error(`Invalid response (HTTP ${response.status})`); }
      console.log('Response data:', data);
      
      if (data.success && data.users) {
        setUsers(data.users);
        console.log('Users set:', data.users.length, 'users');
      } else {
        console.error('API Error:', data.message || 'No users in response');
        setUsers([]); // Ensure empty array if API fails
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]); // Ensure empty array if fetch fails
    }
  };

  const updateUser = async (userData) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`Invalid response (HTTP ${response.status})`);
      }
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { throw new Error(`Invalid response (HTTP ${response.status})`); }
      if (data.user) {
        setUsers(prev => prev.map(user => user.id === data.user.id ? data.user : user));
        return data.user;
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
      });
      if (!response.ok) {
        throw new Error(`Invalid response (HTTP ${response.status})`);
      }
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { throw new Error(`Invalid response (HTTP ${response.status})`); }
      if (data.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        return true;
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await fetchUsers();
    setIsLoading(false);
  };

  // Dashboard-like report generation
  const handleGenerateReport = async (format) => {
    setIsGeneratingReport(true);
    try {
      await fetchUsers();
      if (format === 'excel') {
        await generateUsersExcelReport();
      } else if (format === 'pdf') {
        await generateUsersPDFReport();
      }
    } catch (e) {
      console.error('Failed to generate users report:', e);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
      setShowExportOptions(false);
    }
  };

  const generateUsersExcelReport = async () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Join Date', 'Last Login', 'Contributions', 'Carbon Offset'],
      ...users.map(u => [u.name, u.email, u.role, u.status, u.joinDate, u.lastLogin, u.totalContributions, u.carbonOffset])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generateUsersPDFReport = async () => {
    const html = `<!DOCTYPE html><html><head><meta charset=\\"utf-8\\"/><title>Users Report</title>
      <style>body{font-family:Arial,sans-serif;margin:32px}h1{margin:0 0 8px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f8fafc;text-align:left}</style></head>
      <body><h1>Users Report</h1><p>Generated on ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Join Date</th><th>Last Login</th><th>Contrib.</th><th>CO₂ (kg)</th></tr></thead><tbody>
      ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.status}</td><td>${u.joinDate}</td><td>${u.lastLogin}</td><td>${u.totalContributions}</td><td>${u.carbonOffset}</td></tr>`).join('')}
      </tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleViewAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      router.push('/admin/analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDetails && !event.target.closest('.user-details-dropdown')) {
        setShowUserDetails(false);
      }
      if (showExportOptions && !event.target.closest('.export-options')) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserDetails, showExportOptions]);

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage existing users and their permissions. New users can only register through the signup process.</p>
        </div>
        {/* Desktop buttons */}
        <div className="hidden md:flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <div className="relative export-options">
            <Button onClick={() => setShowExportOptions(!showExportOptions)} disabled={isGeneratingReport}>
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </Button>
            {showExportOptions && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
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
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading} className="w-full justify-center">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <div className="relative export-options">
            <Button onClick={() => setShowExportOptions(!showExportOptions)} disabled={isGeneratingReport} className="w-full justify-center">
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </Button>
            {showExportOptions && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">85% of total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'suspended').length}</div>
            <p className="text-xs text-muted-foreground">2% of total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carbon Offset</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.reduce((sum, user) => sum + user.carbonOffset, 0).toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">Average 1,250 kg per user</p>
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
                placeholder="Search users..."
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full" onClick={() => alert('Advanced filters coming soon!')}>
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage existing user accounts and permissions. New users register through the signup process.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {users.length === 0 ? 'No Users Found' : 'No Matching Users'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {users.length === 0 
                    ? 'No users have registered yet, or there was an error loading user data.' 
                    : 'Try adjusting your search criteria or filters.'}
                </p>
                {users.length === 0 && (
                  <Button variant="outline" onClick={fetchUsers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Loading Users
                  </Button>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors relative overflow-hidden">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                    <h3 className="font-medium truncate max-w-full sm:max-w-[260px] break-words">{user.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground break-words">{user.email}</div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {user.joinDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {user.totalContributions} contributions
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {user.carbonOffset} kg CO₂
                    </span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <Select value={user.status} onValueChange={(value) => handleStatusChange(user.id, value)}>
                    <SelectTrigger className="w-full sm:w-32 min-w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                    <SelectTrigger className="w-full sm:w-32 min-w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* User Details Dropdown */}
                    {showUserDetails && selectedUser && selectedUser.id === user.id && (
                      <div className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl z-50 user-details-dropdown">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">User Details</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowUserDetails(false)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                                {selectedUser.avatar ? (
                                  <img
                                    src={selectedUser.avatar}
                                    alt={selectedUser.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold">{selectedUser.name}</h3>
                                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Role:</span>
                                <Badge className={`ml-2 ${getRoleColor(selectedUser.role)}`}>
                                  {selectedUser.role}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge className={`ml-2 ${getStatusColor(selectedUser.status)}`}>
                                  {selectedUser.status}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Joined:</span>
                                <span className="ml-2">{selectedUser.joinDate}</span>
                              </div>
                              <div>
                                <span className="font-medium">Last Login:</span>
                                <span className="ml-2">{selectedUser.lastLogin}</span>
                              </div>
                              <div>
                                <span className="font-medium">Contributions:</span>
                                <span className="ml-2">{selectedUser.totalContributions}</span>
                              </div>
                              <div>
                                <span className="font-medium">Carbon Offset:</span>
                                <span className="ml-2">{selectedUser.carbonOffset} kg</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                            <Button 
                              onClick={() => {
                                setShowUserDetails(false);
                                handleEditUser(selectedUser);
                              }} 
                              size="sm"
                              className="flex-1"
                            >
                              Edit User
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title="Edit User">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} title="Delete User">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={editingUser.name || selectedUser.name} 
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  value={editingUser.email || selectedUser.email} 
                  type="email"
                  onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select 
                  value={editingUser.role || selectedUser.role}
                  onValueChange={(value) => setEditingUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select 
                  value={editingUser.status || selectedUser.status}
                  onValueChange={(value) => setEditingUser(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowEditUser(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  const updatedUser = { ...selectedUser, ...editingUser };
                  await updateUser(updatedUser);
                  setEditingUser({});
                  setShowEditUser(false);
                }} 
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Delete User</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmDeleteUser} variant="destructive" className="flex-1">
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage; 