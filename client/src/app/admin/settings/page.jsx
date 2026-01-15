'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Save,
  RefreshCw,
  Database,
  Plus,
  Trash2,
  Loader2,
  Home,
  MessageSquare,
  Layout,
  Share2,
  Star,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { adminConfigAPI, siteConfigAPI } from '@/lib/api';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  
  // Site Config Data
  const [landingConfig, setLandingConfig] = useState(null);
  const [footerConfig, setFooterConfig] = useState(null);
  const [socialConfig, setSocialConfig] = useState(null);
  const [chatbotConfig, setChatbotConfig] = useState(null);
  const [generalConfig, setGeneralConfig] = useState(null);
  
  // New item forms
  const [newFeature, setNewFeature] = useState({ icon: '', title: '', description: '' });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '', rating: 5, avatar: '' });
  const [newFooterLink, setNewFooterLink] = useState({ category: 'Company', label: '', href: '' });
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '', icon: '' });
  const [newQuickReply, setNewQuickReply] = useState({ text: '', action: '' });

  // Load all configs on mount
  useEffect(() => {
    loadAllConfigs();
  }, []);

  const loadAllConfigs = async () => {
    setIsLoading(true);
    try {
      const [landing, footer, social, chatbot, general] = await Promise.all([
        siteConfigAPI.getLandingConfig(),
        siteConfigAPI.getFooterConfig(),
        siteConfigAPI.getSocialConfig(),
        siteConfigAPI.getChatbotConfig(),
        siteConfigAPI.getGeneralConfig()
      ]);
      
      setLandingConfig(landing.success ? landing.data : null);
      setFooterConfig(footer.success ? footer.data : null);
      setSocialConfig(social.success ? social.data : null);
      setChatbotConfig(chatbot.success ? chatbot.data : null);
      setGeneralConfig(general.success ? general.data : null);
    } catch (error) {
      console.error('Failed to load configs:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Feature CRUD
  const handleAddFeature = async () => {
    if (!newFeature.title || !newFeature.description) {
      toast.error('Please fill in title and description');
      return;
    }
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.addFeature(newFeature);
      if (result.success) {
        toast.success('Feature added successfully');
        setNewFeature({ icon: '', title: '', description: '' });
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to add feature');
      }
    } catch (error) {
      toast.error('Failed to add feature');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFeature = async (id) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.deleteFeature(id);
      if (result.success) {
        toast.success('Feature deleted');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to delete feature');
      }
    } catch (error) {
      toast.error('Failed to delete feature');
    } finally {
      setIsSaving(false);
    }
  };

  // Testimonial CRUD
  const handleAddTestimonial = async () => {
    if (!newTestimonial.name || !newTestimonial.content) {
      toast.error('Please fill in name and content');
      return;
    }
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.addTestimonial(newTestimonial);
      if (result.success) {
        toast.success('Testimonial added successfully');
        setNewTestimonial({ name: '', role: '', content: '', rating: 5, avatar: '' });
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to add testimonial');
      }
    } catch (error) {
      toast.error('Failed to add testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.deleteTestimonial(id);
      if (result.success) {
        toast.success('Testimonial deleted');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to delete testimonial');
      }
    } catch (error) {
      toast.error('Failed to delete testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  // Hero Section Update
  const handleUpdateHero = async () => {
    if (!landingConfig?.hero) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.updateLandingHero(landingConfig.hero);
      if (result.success) {
        toast.success('Hero section updated');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to update hero section');
      }
    } catch (error) {
      toast.error('Failed to update hero section');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats Update
  const handleUpdateStats = async () => {
    if (!landingConfig?.stats) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.updateLandingStats(landingConfig.stats);
      if (result.success) {
        toast.success('Stats updated');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to update stats');
      }
    } catch (error) {
      toast.error('Failed to update stats');
    } finally {
      setIsSaving(false);
    }
  };

  // Footer Info Update
  const handleUpdateFooterInfo = async () => {
    if (!footerConfig) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.updateFooterInfo({
        companyName: footerConfig.companyName,
        description: footerConfig.description,
        copyright: footerConfig.copyright
      });
      if (result.success) {
        toast.success('Footer info updated');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to update footer info');
      }
    } catch (error) {
      toast.error('Failed to update footer info');
    } finally {
      setIsSaving(false);
    }
  };

  // Chatbot Settings Update
  const handleUpdateChatbotSettings = async () => {
    if (!chatbotConfig) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.updateChatbotSettings({
        initialMessage: chatbotConfig.initialMessage,
        botName: chatbotConfig.botName,
        welcomeText: chatbotConfig.welcomeText
      });
      if (result.success) {
        toast.success('Chatbot settings updated');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to update chatbot settings');
      }
    } catch (error) {
      toast.error('Failed to update chatbot settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Reply CRUD
  const handleAddQuickReply = async () => {
    if (!newQuickReply.text) {
      toast.error('Please enter quick reply text');
      return;
    }
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.addQuickReply(newQuickReply);
      if (result.success) {
        toast.success('Quick reply added');
        setNewQuickReply({ text: '', action: '' });
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to add quick reply');
      }
    } catch (error) {
      toast.error('Failed to add quick reply');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuickReply = async (id) => {
    if (!confirm('Delete this quick reply?')) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.deleteQuickReply(id);
      if (result.success) {
        toast.success('Quick reply deleted');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to delete quick reply');
      }
    } catch (error) {
      toast.error('Failed to delete quick reply');
    } finally {
      setIsSaving(false);
    }
  };

  // Social Link CRUD
  const handleAddSocialLink = async () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      toast.error('Please fill platform and URL');
      return;
    }
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.addSocialLink(newSocialLink);
      if (result.success) {
        toast.success('Social link added');
        setNewSocialLink({ platform: '', url: '', icon: '' });
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to add social link');
      }
    } catch (error) {
      toast.error('Failed to add social link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSocialLink = async (id) => {
    if (!confirm('Delete this social link?')) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.deleteSocialLink(id);
      if (result.success) {
        toast.success('Social link deleted');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to delete social link');
      }
    } catch (error) {
      toast.error('Failed to delete social link');
    } finally {
      setIsSaving(false);
    }
  };

  // Footer Link CRUD
  const handleAddFooterLink = async () => {
    if (!newFooterLink.category || !newFooterLink.label || !newFooterLink.href) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.addFooterLink(newFooterLink);
      if (result.success) {
        toast.success('Footer link added');
        setNewFooterLink({ category: 'Company', label: '', href: '' });
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to add footer link');
      }
    } catch (error) {
      toast.error('Failed to add footer link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFooterLink = async (id) => {
    if (!confirm('Delete this footer link?')) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.deleteFooterLink(id);
      if (result.success) {
        toast.success('Footer link deleted');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to delete footer link');
      }
    } catch (error) {
      toast.error('Failed to delete footer link');
    } finally {
      setIsSaving(false);
    }
  };

  // Seed All Defaults
  const handleSeedDefaults = async () => {
    if (!confirm('This will reset ALL site configs to defaults. Continue?')) return;
    setIsSaving(true);
    try {
      const result = await adminConfigAPI.seedAllDefaults();
      if (result.success) {
        toast.success('All configs reset to defaults');
        loadAllConfigs();
      } else {
        toast.error(result.message || 'Failed to reset configs');
      }
    } catch (error) {
      toast.error('Failed to reset configs');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground">Manage your site content and configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAllConfigs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleSeedDefaults} disabled={isSaving}>
            <Database className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="landing">
            <Home className="h-4 w-4 mr-2" />
            Landing
          </TabsTrigger>
          <TabsTrigger value="features">
            <Layout className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="testimonials">
            <Star className="h-4 w-4 mr-2" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="footer">
            <FileText className="h-4 w-4 mr-2" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="chatbot">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chatbot
          </TabsTrigger>
        </TabsList>

        {/* Landing Page Tab */}
        <TabsContent value="landing" className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Hero Section
              </CardTitle>
              <CardDescription>Configure the main hero banner on the landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Title</Label>
                <Input
                  id="heroTitle"
                  value={landingConfig?.hero?.title || ''}
                  onChange={(e) => setLandingConfig(prev => ({
                    ...prev,
                    hero: { ...prev?.hero, title: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={landingConfig?.hero?.subtitle || ''}
                  onChange={(e) => setLandingConfig(prev => ({
                    ...prev,
                    hero: { ...prev?.hero, subtitle: e.target.value }
                  }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    value={landingConfig?.hero?.ctaText || ''}
                    onChange={(e) => setLandingConfig(prev => ({
                      ...prev,
                      hero: { ...prev?.hero, ctaText: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLink">CTA Button Link</Label>
                  <Input
                    id="ctaLink"
                    value={landingConfig?.hero?.ctaLink || ''}
                    onChange={(e) => setLandingConfig(prev => ({
                      ...prev,
                      hero: { ...prev?.hero, ctaLink: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateHero} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Hero Section
              </Button>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Numbers shown on the landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {landingConfig?.stats?.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <Label>Stat {index + 1} Value</Label>
                    <Input
                      value={stat.value || ''}
                      onChange={(e) => {
                        const newStats = [...(landingConfig?.stats || [])];
                        newStats[index] = { ...newStats[index], value: e.target.value };
                        setLandingConfig(prev => ({ ...prev, stats: newStats }));
                      }}
                    />
                    <Label>Label</Label>
                    <Input
                      value={stat.label || ''}
                      onChange={(e) => {
                        const newStats = [...(landingConfig?.stats || [])];
                        newStats[index] = { ...newStats[index], label: e.target.value };
                        setLandingConfig(prev => ({ ...prev, stats: newStats }));
                      }}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleUpdateStats} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Stats
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Feature</CardTitle>
              <CardDescription>Features displayed on the landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="featureIcon">Icon Name (e.g., Leaf, Globe)</Label>
                  <Input
                    id="featureIcon"
                    value={newFeature.icon}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="Leaf"
                  />
                </div>
                <div>
                  <Label htmlFor="featureTitle">Title</Label>
                  <Input
                    id="featureTitle"
                    value={newFeature.title}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Feature Title"
                  />
                </div>
                <div>
                  <Label htmlFor="featureDesc">Description</Label>
                  <Input
                    id="featureDesc"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Feature description..."
                  />
                </div>
              </div>
              <Button onClick={handleAddFeature} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Feature
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {landingConfig?.features?.map((feature, index) => (
                  <div key={feature._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{feature.icon || 'No icon'}</Badge>
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteFeature(feature._id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!landingConfig?.features || landingConfig.features.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No features added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Testimonial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testimonialName">Name</Label>
                  <Input
                    id="testimonialName"
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="testimonialRole">Role</Label>
                  <Input
                    id="testimonialRole"
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="CEO, Company"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="testimonialContent">Content</Label>
                <Textarea
                  id="testimonialContent"
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What they said about your service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testimonialRating">Rating (1-5)</Label>
                  <Select
                    value={newTestimonial.rating?.toString()}
                    onValueChange={(value) => setNewTestimonial(prev => ({ ...prev, rating: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} Star{n > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="testimonialAvatar">Avatar URL (optional)</Label>
                  <Input
                    id="testimonialAvatar"
                    value={newTestimonial.avatar}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="/avatars/user.jpg"
                  />
                </div>
              </div>
              <Button onClick={handleAddTestimonial} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Testimonial
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {landingConfig?.testimonials?.map((testimonial, index) => (
                  <div key={testimonial._id || index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{testimonial.name}</p>
                        <Badge variant="secondary">{testimonial.role}</Badge>
                        <div className="flex">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonial.content}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteTestimonial(testimonial._id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!landingConfig?.testimonials || landingConfig.testimonials.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No testimonials added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer" className="space-y-6">
          {/* Footer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={footerConfig?.companyName || ''}
                  onChange={(e) => setFooterConfig(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="footerDescription">Description</Label>
                <Textarea
                  id="footerDescription"
                  value={footerConfig?.description || ''}
                  onChange={(e) => setFooterConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input
                  id="copyright"
                  value={footerConfig?.copyright || ''}
                  onChange={(e) => setFooterConfig(prev => ({ ...prev, copyright: e.target.value }))}
                />
              </div>
              <Button onClick={handleUpdateFooterInfo} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Footer Info
              </Button>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <Card>
            <CardHeader>
              <CardTitle>Add Footer Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newFooterLink.category}
                    onValueChange={(value) => setNewFooterLink(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Resources">Resources</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Label</Label>
                  <Input
                    value={newFooterLink.label}
                    onChange={(e) => setNewFooterLink(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="About Us"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={newFooterLink.href}
                    onChange={(e) => setNewFooterLink(prev => ({ ...prev, href: e.target.value }))}
                    placeholder="/about"
                  />
                </div>
              </div>
              <Button onClick={handleAddFooterLink} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Footer Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {footerConfig?.links?.map((link, index) => (
                  <div key={link._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge>{link.category}</Badge>
                      <span className="font-medium">{link.label}</span>
                      <span className="text-sm text-muted-foreground">{link.href}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteFooterLink(link._id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!footerConfig?.links || footerConfig.links.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No footer links added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Add Social Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Platform</Label>
                  <Select
                    value={newSocialLink.platform}
                    onValueChange={(value) => setNewSocialLink(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={newSocialLink.url}
                    onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Icon (optional)</Label>
                  <Input
                    value={newSocialLink.icon}
                    onChange={(e) => setNewSocialLink(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="Facebook"
                  />
                </div>
              </div>
              <Button onClick={handleAddSocialLink} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Social Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {socialConfig?.links?.map((link, index) => (
                  <div key={link._id || index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium capitalize">{link.platform}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteSocialLink(link._id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {(!socialConfig?.links || socialConfig.links.length === 0) && (
                  <p className="text-muted-foreground">No social links added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
              <CardDescription>Configure the AI chatbot behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="botName">Bot Name</Label>
                <Input
                  id="botName"
                  value={chatbotConfig?.botName || ''}
                  onChange={(e) => setChatbotConfig(prev => ({ ...prev, botName: e.target.value }))}
                  placeholder="Eco Assistant"
                />
              </div>
              <div>
                <Label htmlFor="welcomeText">Welcome Text</Label>
                <Input
                  id="welcomeText"
                  value={chatbotConfig?.welcomeText || ''}
                  onChange={(e) => setChatbotConfig(prev => ({ ...prev, welcomeText: e.target.value }))}
                  placeholder="Welcome message..."
                />
              </div>
              <div>
                <Label htmlFor="initialMessage">Initial Message</Label>
                <Textarea
                  id="initialMessage"
                  value={chatbotConfig?.initialMessage || ''}
                  onChange={(e) => setChatbotConfig(prev => ({ ...prev, initialMessage: e.target.value }))}
                  placeholder="Hello! How can I help you today?"
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateChatbotSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Chatbot Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Replies */}
          <Card>
            <CardHeader>
              <CardTitle>Add Quick Reply</CardTitle>
              <CardDescription>Suggested replies shown to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Text</Label>
                  <Input
                    value={newQuickReply.text}
                    onChange={(e) => setNewQuickReply(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Calculate my footprint"
                  />
                </div>
                <div>
                  <Label>Action (optional)</Label>
                  <Input
                    value={newQuickReply.action}
                    onChange={(e) => setNewQuickReply(prev => ({ ...prev, action: e.target.value }))}
                    placeholder="calculate_footprint"
                  />
                </div>
              </div>
              <Button onClick={handleAddQuickReply} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Quick Reply
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Quick Replies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {chatbotConfig?.quickReplies?.map((reply, index) => (
                  <div key={reply._id || index} className="flex items-center gap-2 p-2 border rounded-lg bg-accent/50">
                    <MessageSquare className="h-4 w-4" />
                    <span>{reply.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteQuickReply(reply._id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {(!chatbotConfig?.quickReplies || chatbotConfig.quickReplies.length === 0) && (
                  <p className="text-muted-foreground">No quick replies added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Help Categories</CardTitle>
              <CardDescription>Categories shown in the chatbot help tab</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chatbotConfig?.helpCategories?.map((cat, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{cat.title}</p>
                    <p className="text-sm text-muted-foreground">{cat.count}</p>
                  </div>
                ))}
                {(!chatbotConfig?.helpCategories || chatbotConfig.helpCategories.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No help categories configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
