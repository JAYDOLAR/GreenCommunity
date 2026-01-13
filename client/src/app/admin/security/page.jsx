'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import getAdminApiUrl from '@/lib/adminApi';
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
  const [securityThreats, setSecurityThreats] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch security data on mount
  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      const serverUrl = getAdminApiUrl();
      const token = localStorage.getItem('adminToken');
      
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      // Fetch threats
      const threatsResponse = await fetch(`${serverUrl}/api/admin/security/threats?limit=50`, {
        headers
      });
      
      // Fetch logs
      const logsResponse = await fetch(`${serverUrl}/api/admin/security/logs?limit=100`, {
        headers
      });

      if (threatsResponse.ok) {
        const threatsResult = await threatsResponse.json();
        if (threatsResult.success) {
          setSecurityThreats(threatsResult.data);
        }
      }

      if (logsResponse.ok) {
        const logsResult = await logsResponse.json();
        if (logsResult.success) {
          setAccessLogs(logsResult.data);
        }
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security</h1>
          <p className="text-muted-foreground">Monitor threats and manage security policies</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
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
                <div key={threat.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    threat.severity === 'critical' ? 'bg-red-500' :
                    threat.severity === 'high' ? 'bg-orange-500' :
                    threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{threat.description}</h3>
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
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {threat.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {threat.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
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
                <div key={log.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {log.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{log.user}</h3>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      IP: {log.ipAddress} • {log.location}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </span>
                      <span className="truncate max-w-32">
                        {log.userAgent}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
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