'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Activity,
  RefreshCw,
  Download
} from 'lucide-react';

const SecurityPage = () => {
  const [securityThreats, setSecurityThreats] = useState([
    {
      id: 1,
      type: 'failed_login',
      severity: 'medium',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      ipAddress: '192.168.1.100',
      user: 'unknown',
      timestamp: '2024-01-20 14:30:25',
      status: 'active',
      location: 'New York, USA'
    },
    {
      id: 2,
      type: 'suspicious_activity',
      severity: 'high',
      description: 'Unusual data access pattern detected',
      ipAddress: '203.45.67.89',
      user: 'john.doe@example.com',
      timestamp: '2024-01-20 13:15:42',
      status: 'investigating',
      location: 'London, UK'
    },
    {
      id: 3,
      type: 'brute_force',
      severity: 'critical',
      description: 'Brute force attack detected on admin account',
      ipAddress: '45.67.89.123',
      user: 'admin',
      timestamp: '2024-01-20 12:45:18',
      status: 'blocked',
      location: 'Moscow, Russia'
    },
    {
      id: 4,
      type: 'data_breach',
      severity: 'high',
      description: 'Unauthorized access to user database',
      ipAddress: '98.76.54.32',
      user: 'system',
      timestamp: '2024-01-20 11:20:33',
      status: 'resolved',
      location: 'Berlin, Germany'
    }
  ]);

  const [accessLogs, setAccessLogs] = useState([
    {
      id: 1,
      user: 'admin@greencommunity.com',
      action: 'login',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: '2024-01-20 15:30:25',
      status: 'success',
      location: 'New York, USA'
    },
    {
      id: 2,
      user: 'john.doe@example.com',
      action: 'project_update',
      ipAddress: '203.45.67.89',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: '2024-01-20 15:25:12',
      status: 'success',
      location: 'London, UK'
    },
    {
      id: 3,
      user: 'sarah.wilson@example.com',
      action: 'user_management',
      ipAddress: '45.67.89.123',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      timestamp: '2024-01-20 15:20:45',
      status: 'success',
      location: 'San Francisco, USA'
    },
    {
      id: 4,
      user: 'unknown',
      action: 'login',
      ipAddress: '98.76.54.32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: '2024-01-20 15:15:30',
      status: 'failed',
      location: 'Berlin, Germany'
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    firewallEnabled: true,
    intrusionDetection: true,
    rateLimiting: true,
    sslEnforcement: true,
    sessionEncryption: true,
    auditLogging: true
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login': return 'bg-blue-100 text-blue-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      case 'project_update': return 'bg-green-100 text-green-800';
      case 'user_management': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security</h1>
          <p className="text-muted-foreground">Monitor threats and manage security policies</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto justify-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="default" className="w-full sm:w-auto justify-center">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityThreats.filter(t => t.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Suspicious IPs blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Excellent security posture</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Threats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Threats
            </CardTitle>
            <CardDescription>Active and recent security threats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityThreats.map((threat) => (
                <div key={threat.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors overflow-hidden">
                  <div className={`w-3 h-3 rounded-full ${
                    threat.severity === 'critical' ? 'bg-red-500' :
                    threat.severity === 'high' ? 'bg-orange-500' :
                    threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                      <h3 className="font-medium break-words">{threat.description}</h3>
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      IP: {threat.ipAddress} • User: {threat.user}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {threat.timestamp}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <MapPin className="h-3 w-3" />
                        {threat.location}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Button variant="ghost" size="sm" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Block">
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Access Logs
            </CardTitle>
            <CardDescription>Recent user access and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessLogs.map((log) => (
                <div key={log.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors overflow-hidden">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {log.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                      <h3 className="font-medium break-words">{log.user}</h3>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2 break-words">
                      IP: {log.ipAddress} • {log.location}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </span>
                      <span className="truncate max-w-[200px] sm:max-w-[320px]">
                        {log.userAgent}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Button variant="ghost" size="sm" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Configuration
          </CardTitle>
          <CardDescription>Configure security policies and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Firewall & Network Security</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="firewallEnabled">Firewall Protection</Label>
                  <p className="text-sm text-muted-foreground">Enable network-level protection</p>
                </div>
                <Switch
                  id="firewallEnabled"
                  checked={securitySettings.firewallEnabled}
                  onCheckedChange={(checked) => handleSecuritySettingChange('firewallEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="intrusionDetection">Intrusion Detection</Label>
                  <p className="text-sm text-muted-foreground">Monitor for suspicious activities</p>
                </div>
                <Switch
                  id="intrusionDetection"
                  checked={securitySettings.intrusionDetection}
                  onCheckedChange={(checked) => handleSecuritySettingChange('intrusionDetection', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rateLimiting">Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Prevent brute force attacks</p>
                </div>
                <Switch
                  id="rateLimiting"
                  checked={securitySettings.rateLimiting}
                  onCheckedChange={(checked) => handleSecuritySettingChange('rateLimiting', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Data Protection</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sslEnforcement">SSL Enforcement</Label>
                  <p className="text-sm text-muted-foreground">Force HTTPS connections</p>
                </div>
                <Switch
                  id="sslEnforcement"
                  checked={securitySettings.sslEnforcement}
                  onCheckedChange={(checked) => handleSecuritySettingChange('sslEnforcement', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sessionEncryption">Session Encryption</Label>
                  <p className="text-sm text-muted-foreground">Encrypt user sessions</p>
                </div>
                <Switch
                  id="sessionEncryption"
                  checked={securitySettings.sessionEncryption}
                  onCheckedChange={(checked) => handleSecuritySettingChange('sessionEncryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auditLogging">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all security events</p>
                </div>
                <Switch
                  id="auditLogging"
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => handleSecuritySettingChange('auditLogging', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Blacklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            IP Blacklist
          </CardTitle>
          <CardDescription>Manage blocked IP addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input placeholder="Enter IP address" className="flex-1" />
              <Button>Add to Blacklist</Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">192.168.1.100</div>
                  <div className="text-sm text-muted-foreground">Added: 2024-01-20 14:30:25</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Blocked</Badge>
                  <Button variant="ghost" size="sm">
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">45.67.89.123</div>
                  <div className="text-sm text-muted-foreground">Added: 2024-01-20 12:45:18</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Blocked</Badge>
                  <Button variant="ghost" size="sm">
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage; 