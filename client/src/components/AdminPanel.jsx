'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TreePine, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const adminStats = [
    { title: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-500' },
    { title: 'Active Projects', value: '45', change: '+5%', icon: TreePine, color: 'text-green-500' },
    { title: 'Marketplace Items', value: '89', change: '+8%', icon: ShoppingCart, color: 'text-purple-500' },
    { title: 'Revenue', value: '$12,450', change: '+15%', icon: TrendingUp, color: 'text-orange-500' },
  ];

  const recentActions = [
    { action: 'New user registered', user: 'john.doe@email.com', time: '2 minutes ago', status: 'success' },
    { action: 'Project approved', user: 'Eco Project #123', time: '15 minutes ago', status: 'success' },
    { action: 'Payment received', user: 'Sarah Wilson', time: '1 hour ago', status: 'success' },
    { action: 'Report generated', user: 'Monthly Analytics', time: '2 hours ago', status: 'info' },
  ];

  const pendingApprovals = [
    { type: 'User Registration', count: 5, priority: 'high' },
    { type: 'Project Submission', count: 3, priority: 'medium' },
    { type: 'Marketplace Item', count: 8, priority: 'low' },
    { type: 'Content Review', count: 12, priority: 'medium' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-muted-foreground">Manage your GreenCommunity platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Actions
            </CardTitle>
            <CardDescription>Latest admin activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(action.status)}
                    <div>
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-muted-foreground">{action.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{action.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.count} items</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TreePine className="h-6 w-6" />
              <span className="text-sm">Review Projects</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm">Marketplace</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel; 