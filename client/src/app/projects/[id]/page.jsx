"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Heart, Share2, MapPin, Users, Calendar, Target, Trees, Wind, Sun, Droplets } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import BuyCreditsButton from '@/components/BuyCreditsButton';
import RetireCreditsForm from '@/components/RetireCreditsForm';
import MyCertificates from '@/components/MyCertificates';
import { useWallet } from '@/context/WalletContext';
import { apiRequest } from '@/lib/api';

const ProjectDetailContent = ({ params }) => {
  const router = useRouter();
  const urlParams = useParams();
  const [contributionAmount, setContributionAmount] = useState([50]);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedParams, setResolvedParams] = useState(null);
  const { address, connect } = useWallet();
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadError, setLoadError] = useState(undefined);
  
  // Handle params resolution for client component
  useEffect(() => {
    const resolveParams = async () => {
      try {
        if (params && typeof params.then === 'function') {
          // params is a Promise
          const resolved = await params;
          setResolvedParams(resolved);
        } else {
          // params is already resolved or use URL params as fallback
          setResolvedParams(params || urlParams);
        }
      } catch (error) {
        console.error('Error resolving params:', error);
        // Fallback: use URL params
        setResolvedParams(urlParams);
      }
    };
    
    resolveParams();
  }, [params, urlParams]);
  // Load project data once we have resolved params
  useEffect(()=>{
    if(!resolvedParams?.id) return;
    const load = async () => {
      setLoadingProject(true); setLoadError(undefined);
      try {
        const res = await apiRequest(`/api/projects/${resolvedParams.id}`);
        const data = res.data || res.project || res; // tolerate different shapes
        if(!data || data.success === false) throw new Error(data?.message||'Not found');
        setProject(data);
      } catch(e){ setLoadError(e.message); } finally { setLoadingProject(false); }
    };
    load();
  },[resolvedParams]);

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (loadingProject) {
    return <div className="p-10 text-center text-muted-foreground">Loading project...</div>;
  }
  if (loadError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">{loadError || "The project you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Numeric safety guards
  const totalFundingVal = Number(project.totalFunding) || 0;
  const currentFundingVal = Number(project.currentFunding) || 0;
  const contributorsVal = Number(project.contributors) || 0;
  const co2RemovedVal = Number(project.co2Removed) || 0;
  const fundingPercentage = totalFundingVal ? (currentFundingVal / totalFundingVal) * 100 : 0;

  const getProjectIcon = (type) => {
    switch (type) {
      case 'forestry': return Trees;
      case 'solar': return Sun;
      case 'wind': return Wind;
      case 'water': return Droplets;
      default: return Trees;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'forestry': return 'text-green-600';
      case 'solar': return 'text-yellow-600';
      case 'wind': return 'text-blue-600';
      case 'water': return 'text-cyan-600';
      default: return 'text-green-600';
    }
  };

  const calculateImpact = (amount) => {
    if(!project.co2PerRupee) return '0.00';
    return (amount * project.co2PerRupee).toFixed(2);
  };

  const ProjectIcon = getProjectIcon(project.type || 'forestry');
  // Defensive arrays
  const benefitsArr = Array.isArray(project.benefits) ? project.benefits : [];
  const certificationsArr = Array.isArray(project.certifications) ? project.certifications : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Image */}
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-lg border">
              <img
                src={project.image || '/tree1.jpg'}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/tree1.jpg'; // Fallback
                }}
              />
            </div>

            {/* Data below the main photo */}
            <div className="space-y-4">
              {/* Project Overview */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Project Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">{project.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">CO₂ Offset</p>
                        <p className="text-sm font-medium text-green-600">-{co2RemovedVal.toLocaleString()} tons</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Contributors</p>
                        <p className="text-sm font-medium">{contributorsVal.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time Left</p>
                        <p className="text-sm font-medium">{project.timeRemaining}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{fundingPercentage.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Funded</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">₹{(currentFundingVal / 10000000).toFixed(1)}Cr</p>
                      <p className="text-xs text-muted-foreground">Raised</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">₹{((totalFundingVal - currentFundingVal) / 10000000).toFixed(1)}Cr</p>
                      <p className="text-xs text-muted-foreground">Needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Highlights */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Project Highlights</h3>
                  <div className="space-y-2">
                    {benefitsArr.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {(project.type || 'forestry').replace('-', ' ').toUpperCase()}
                </Badge>
                {project.featured && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Featured
                  </Badge>
                )}
                {project.verified && (
                  <Badge className="bg-green-600 text-white text-xs">
                    Verified
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {project.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{project.location}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">-{co2RemovedVal.toLocaleString()} tons CO₂</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{contributorsVal.toLocaleString()} contributors</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{project.timeRemaining} remaining</span>
                </div>
              </div>
            </div>

            {/* Funding Progress */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Funding Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Funding</span>
                  <span className="font-medium">
                    ₹{(currentFundingVal / 10000000).toFixed(1)}Cr / ₹{(totalFundingVal / 10000000).toFixed(1)}Cr
                  </span>
                </div>
                <Progress value={fundingPercentage} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  {fundingPercentage.toFixed(0)}% funded
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Environmental Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {benefitsArr.map((benefit) => (
                  <Badge key={benefit} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contribution */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Make a Contribution</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Contribution Amount: ₹{(contributionAmount[0] * 83).toLocaleString()}</Label>
                  <Slider
                    value={contributionAmount}
                    onValueChange={setContributionAmount}
                    max={50000}
                    min={1000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Your Impact</div>
                    <div className="text-2xl font-bold text-primary">
                      {calculateImpact(contributionAmount[0])} tons CO₂
                    </div>
                    <div className="text-sm text-muted-foreground">will be offset</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="flex-1 btn-hero"
                    onClick={() => {
                      setContributionAmount([50]);
                      setIsLoading(false);
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Contribute
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Support {project.name}</DialogTitle>
                    <DialogDescription className="text-sm">
                      Choose your contribution amount to help offset carbon emissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-sm">Contribution Amount: ₹{(contributionAmount[0] * 83).toLocaleString()}</Label>
                      <Slider
                        value={contributionAmount}
                        onValueChange={setContributionAmount}
                        max={50000}
                        min={1000}
                        step={1000}
                        className="mt-2"
                      />
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Your Impact</div>
                        <div className="text-2xl font-bold text-primary">
                          {calculateImpact(contributionAmount[0])} tons CO₂
                        </div>
                        <div className="text-sm text-muted-foreground">will be offset</div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="w-full btn-hero"
                      onClick={() => {
                        setIsLoading(true);
                        try {
                          router.push(`/payment?project=${encodeURIComponent(project.name)}&amount=${contributionAmount[0] * 83}`);
                        } catch (error) {
                          console.error('Navigation error:', error);
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : `Contribute ₹${(contributionAmount[0] * 83).toLocaleString()}`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="flex-1">
                Learn More
              </Button>
            </div>

            {/* Blockchain actions if available */}
            {project.blockchain?.projectId && project.blockchain?.pricePerCreditWei && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Blockchain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">On-Chain ID:</span> {project.blockchain.projectId}</div>
                    <div><span className="text-muted-foreground">Sold:</span> {project.blockchain.soldCredits}/{project.blockchain.totalCredits}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Price (wei):</span> {project.blockchain.pricePerCreditWei}</div>
                  </div>
                  <BuyCreditsButton
                    projectMongoId={project._id || project.id}
                    projectIdOnChain={project.blockchain.projectId}
                    pricePerCreditWei={project.blockchain.pricePerCreditWei}
                  />
                  <RetireCreditsForm projectMongoId={project._id || project.id} />
                  <MyCertificates />
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {certificationsArr.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetailPage = ({ params }) => {
  return (
    <AuthGuard intent="project-detail">
      <Layout>
        <ProjectDetailContent params={params} />
      </Layout>
    </AuthGuard>
  );
};

export default ProjectDetailPage;
