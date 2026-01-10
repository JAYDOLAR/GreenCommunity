'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield, 
  Mail,
  Save,
  RefreshCw,
  Database,
  Palette,
  Users,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Green Community',
    siteDescription: 'Empowering communities to create a sustainable future through carbon offset projects',
    contactEmail: 'admin@greencommunity.com',
    supportEmail: 'support@greencommunity.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    userReports: true,
    systemAlerts: true,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    loginAttempts: 5,
    ipWhitelist: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#10b981',
    accentColor: '#059669',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico'
  });

  const handleGeneralSettingChange = (key, value) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationSettingChange = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAppearanceSettingChange = (key, value) => {
    setAppearanceSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={generalSettings.siteName}
                onChange={(e) => handleGeneralSettingChange('siteName', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={generalSettings.siteDescription}
                onChange={(e) => handleGeneralSettingChange('siteDescription', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => handleGeneralSettingChange('contactEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => handleGeneralSettingChange('supportEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={generalSettings.timezone} onValueChange={(value) => handleGeneralSettingChange('timezone', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={generalSettings.language} onValueChange={(value) => handleGeneralSettingChange('language', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={generalSettings.maintenanceMode}
                onCheckedChange={(checked) => handleGeneralSettingChange('maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => handleNotificationSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) => handleNotificationSettingChange('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="projectUpdates">Project Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about project changes</p>
              </div>
              <Switch
                id="projectUpdates"
                checked={notificationSettings.projectUpdates}
                onCheckedChange={(checked) => handleNotificationSettingChange('projectUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="userReports">User Reports</Label>
                <p className="text-sm text-muted-foreground">Receive user report notifications</p>
              </div>
              <Switch
                id="userReports"
                checked={notificationSettings.userReports}
                onCheckedChange={(checked) => handleNotificationSettingChange('userReports', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemAlerts">System Alerts</Label>
                <p className="text-sm text-muted-foreground">Critical system notifications</p>
              </div>
              <Switch
                id="systemAlerts"
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => handleNotificationSettingChange('systemAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional content</p>
              </div>
              <Switch
                id="marketingEmails"
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => handleNotificationSettingChange('marketingEmails', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorAuth', checked)}
              />
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select value={securitySettings.sessionTimeout.toString()} onValueChange={(value) => handleSecuritySettingChange('sessionTimeout', parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="passwordPolicy">Password Policy</Label>
              <Select value={securitySettings.passwordPolicy} onValueChange={(value) => handleSecuritySettingChange('passwordPolicy', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                  <SelectItem value="strong">Strong (12+ chars, symbols)</SelectItem>
                  <SelectItem value="very-strong">Very Strong (16+ chars, mixed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="loginAttempts">Max Login Attempts</Label>
              <Select value={securitySettings.loginAttempts.toString()} onValueChange={(value) => handleSecuritySettingChange('loginAttempts', parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
              </div>
              <Switch
                id="ipWhitelist"
                checked={securitySettings.ipWhitelist}
                onCheckedChange={(checked) => handleSecuritySettingChange('ipWhitelist', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance Settings
            </CardTitle>
            <CardDescription>Customize platform appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={appearanceSettings.primaryColor}
                  onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <Input
                  id="accentColor"
                  type="color"
                  value={appearanceSettings.accentColor}
                  onChange={(e) => handleAppearanceSettingChange('accentColor', e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={appearanceSettings.logoUrl}
                onChange={(e) => handleAppearanceSettingChange('logoUrl', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={appearanceSettings.faviconUrl}
                onChange={(e) => handleAppearanceSettingChange('faviconUrl', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Settings
          </CardTitle>
          <CardDescription>Database configuration and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Database Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Size</span>
                  <span>2.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Tables</span>
                  <span>24</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Backup Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Last Backup</span>
                  <span>2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Backup</span>
                  <span>22 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Backup</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span>45ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span>99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Connections</span>
                  <span>12</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Optimize Database
            </Button>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
            <Button variant="outline">
              <Lock className="h-4 w-4 mr-2" />
              Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 