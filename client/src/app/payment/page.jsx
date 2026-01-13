"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Lock,
  Shield,
  Leaf,
  CheckCircle,
  Heart,
  Trees,
  Award,
  Calculator,
  Globe,
  Zap,
  Star,
  IndianRupee
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';

const Payment = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = searchParams.get('project');
  const projectName = searchParams.get('name') || 'Climate Project';
  const co2PerDollar = parseFloat(searchParams.get('co2Rate') || '2.5');

  const [contributionAmount, setContributionAmount] = useState([50]); // in USD
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    address: '',
    city: '',
    country: 'India',
    zipCode: ''
  });

  const calculateImpact = (amount) => {
    return (amount * co2PerDollar).toFixed(1);
  };

  const calculateTrees = (amount) => {
    // Rough estimate: 1 tree absorbs ~48 lbs CO2 per year (0.02 tons)
    const co2Tons = amount * co2PerDollar;
    return Math.round(co2Tons / 0.02);
  };

  // Check if all billing info is completed and valid
  const isFormComplete = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const zipRegex = /^[1-9][0-9]{5}$/;
    const cityRegex = /^[a-zA-Z\s]+$/;
    
    return (
      billingInfo.email && 
      emailRegex.test(billingInfo.email) &&
      billingInfo.address && 
      billingInfo.city && 
      cityRegex.test(billingInfo.city) &&
      billingInfo.country && 
      billingInfo.country.toLowerCase() === 'india' &&
      billingInfo.zipCode && 
      zipRegex.test(billingInfo.zipCode)
    );
  };

  const USD_TO_INR = 83;
  const processingFee = Math.round(contributionAmount[0] * 0.029 + 0.3); // in USD
  const totalAmountUSD = contributionAmount[0] + processingFee;
  const totalAmountINR = Math.round(totalAmountUSD * USD_TO_INR);

  // Razorpay configuration
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('Not in browser environment');
        resolve(false);
        return;
      }

      // Check if Razorpay is already loaded
      if (window.Razorpay || isRazorpayLoaded) {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }

      // If script is loaded via Script component, it should be available
      if (typeof window !== 'undefined' && window.Razorpay) {
        setIsRazorpayLoaded(true);
        resolve(true);
        return;
      }

      // Fallback to dynamic loading
      console.log('Loading Razorpay SDK...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        setIsRazorpayLoaded(true);
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Razorpay SDK:', error);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    try {
      const res = await loadRazorpay();

      if (!res) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // Convert USD to INR (approximate rate)
      const usdToInr = 83;
      const amountInINR = contributionAmount[0] * usdToInr;
      const amountInPaise = Math.round(amountInINR * 100); // Convert to paise

      // Razorpay minimum amount is ₹1 (100 paise)
      if (amountInPaise < 100) {
        toast.error('Minimum payment amount is ₹1. Please increase your contribution.');
        setIsProcessing(false);
        return;
      }

      console.log('Payment Details:', {
        amount: amountInINR,
        amountInPaise: amountInPaise,
        projectName: projectName,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      });

      // For development, create a mock order directly
      const mockOrder = {
        id: `order_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR'
      };

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'GreenCommunity',
        description: `Climate contribution to ${projectName}`,
        image: '/logo.png',
        handler: async function (response) {
          console.log('Payment Success Response:', response);
          
          // Call payment verification API with invoice email
          try {
            const verificationResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amountInINR.toFixed(0),
                projectName,
                userEmail: user?.email || billingInfo.email,
                userName: user?.name || 'Valued Contributor',
                co2Impact: `${calculateImpact(contributionAmount[0])} tons`
              })
            });

            if (verificationResponse.ok) {
              console.log('Payment verified and invoice email sent');
            } else {
              console.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
          }
          
          toast.success(
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Payment Successful! Thank you for contributing ₹{amountInINR.toFixed(0)} to {projectName}. You've helped offset {calculateImpact(contributionAmount[0])} tons of CO₂!
            </div>
          );
          
          setIsProcessing(false);
          
          // Navigate back to projects with success message
          setTimeout(() => {
            router.push('/projects?payment=success');
          }, 2000);
        },
        prefill: {
          name: 'Climate Contributor',
          email: 'contributor@greencommunity.com',
          contact: '9999999999'
        },
        notes: {
          address: 'GreenCommunity Climate Initiative',
          project: projectName,
          amount_usd: contributionAmount[0]
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
            toast('Payment cancelled', {
              icon: '⚠️',
              style: {
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fbbf24',
              },
            });
          },
          escape: true,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      // Validate Razorpay key
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Razorpay key not configured. Please check environment variables.');
        setIsProcessing(false);
        return;
      }

      console.log('Razorpay Options:', {
        ...options,
        key: razorpayKey.substring(0, 10) + '...' // Log partial key for security
      });

      if (window.Razorpay) {
        const paymentObject = new window.Razorpay(options);
        
        paymentObject.on('payment.failed', function (response) {
          console.error('Payment Failed Response:', response);
          setIsProcessing(false);
          
          let errorMsg = 'Payment failed. Please try again.';
          if (response.error) {
            if (response.error.code === 'BAD_REQUEST_ERROR') {
              errorMsg = 'Invalid payment request. Please check the amount and try again.';
            } else if (response.error.code === 'GATEWAY_ERROR') {
              errorMsg = 'Gateway error. Please try a different payment method.';
            } else if (response.error.description) {
              errorMsg = response.error.description;
            }
          }
          
          toast.error(`Payment Failed: ${errorMsg}`);
        });

        console.log('Opening Razorpay payment modal...');
        paymentObject.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }

    } catch (error) {
      console.error('Payment initialization error:', error);
      setIsProcessing(false);
      toast.error(`Payment failed to initialize: ${error.message}`);
    }
  };

  const handlePayment = async () => {
    console.log('Payment button clicked!'); // Debug log
    console.log('Current billing info:', billingInfo); // Debug log
    
    if (isProcessing) {
      console.log('Payment already processing, returning');
      return; // Prevent double-clicking
    }
    
    // Validate all required fields are filled
    if (!billingInfo.email || !billingInfo.address || !billingInfo.city || !billingInfo.country || !billingInfo.zipCode) {
      console.log('Validation failed - missing fields');
      toast.error('Please fill in all billing information fields before proceeding.');
      return;
    }

    // Email validation - strict pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(billingInfo.email)) {
      console.log('Email format validation failed');
      toast.error('Please enter a valid email address (e.g., user@example.com).');
      return;
    }

    // Country validation - must be India
    if (billingInfo.country.toLowerCase() !== 'india') {
      console.log('Country validation failed - not India');
      toast.error('Currently, payments are only accepted from India.');
      return;
    }

    // ZIP code validation for India (6 digits)
    const zipRegex = /^[1-9][0-9]{5}$/;
    if (!zipRegex.test(billingInfo.zipCode)) {
      console.log('ZIP code validation failed');
      toast.error('Please enter a valid Indian PIN code (6 digits).');
      return;
    }

    // City validation - should not be empty and contain only letters and spaces
    const cityRegex = /^[a-zA-Z\s]+$/;
    if (!cityRegex.test(billingInfo.city)) {
      console.log('City validation failed');
      toast.error('Please enter a valid city name (letters only).');
      return;
    }
    
    console.log('All validations passed, starting payment process');
    setIsProcessing(true);
    
    console.log('Razorpay payment initiated:', {
      amount: contributionAmount[0],
      project: projectName,
      env_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Present' : 'Missing'
    });

    try {
      await handleRazorpayPayment();
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast.error("There was an issue processing your payment. Please try again.");
    }
  };



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 p-0 overflow-x-hidden">
      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          console.log('Razorpay SDK loaded via Script component');
          setIsRazorpayLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load Razorpay SDK via Script component:', e);
        }}
        strategy="afterInteractive"
      />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-24 h-24 bg-teal-200/40 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-full px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center space-y-2 sm:space-y-4">
          <Button variant="ghost" onClick={() => router.back()} className="absolute left-0 top-0 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Climate Action Payment</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Complete Your Impact
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of climate warriors supporting <span className="font-semibold text-green-600">{projectName}</span>
            and help create a sustainable future for our planet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-6">


            {/* Billing Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  Billing Information
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div>
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                    className="mt-2 h-10 sm:h-12 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs sm:text-sm font-medium">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="123, MG Road, Sector 15"
                    value={billingInfo.address}
                    onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                    className="mt-2 h-10 sm:h-12 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label htmlFor="city" className="text-xs sm:text-sm font-medium">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={billingInfo.city}
                      onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                      className="mt-2 h-10 sm:h-12 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-xs sm:text-sm font-medium">
                      PIN Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="400001"
                      value={billingInfo.zipCode}
                      onChange={(e) => setBillingInfo({ ...billingInfo, zipCode: e.target.value })}
                      className="mt-2 h-10 sm:h-12 text-sm"
                      required
                      maxLength={6}
                      pattern="[1-9][0-9]{5}"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country" className="text-xs sm:text-sm font-medium">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="country"
                    value={billingInfo.country}
                    onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                    className="mt-2 h-10 sm:h-12 text-sm w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Order Summary */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 sticky top-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                    <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  Your Climate Impact
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  See the real difference you're making
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 relative p-3 sm:p-6">
                {/* Impact Metrics */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative p-4 sm:p-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-xs sm:text-sm font-medium">CO₂ Offset</span>
                        </div>
                        <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="text-xl sm:text-3xl font-bold">
                        {calculateImpact(contributionAmount[0])} tons
                      </div>
                      <div className="text-emerald-100 text-xs sm:text-sm">
                        Removed from atmosphere
                      </div>
                    </div>
                  </div>

                  <div className="relative p-4 sm:p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Trees className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-xs sm:text-sm font-medium">Trees Equivalent</span>
                        </div>
                        <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="text-xl sm:text-3xl font-bold">
                        {calculateTrees(contributionAmount[0])}
                      </div>
                      <div className="text-green-100 text-xs sm:text-sm">
                        Trees planted impact
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Payment Summary</h4>
                  <div className="flex justify-between text-sm sm:text-lg">
                    <span>Contribution</span>
                    <span className="font-semibold">₹{contributionAmount[0] * USD_TO_INR}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>₹{Math.round(processingFee * USD_TO_INR)}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between font-bold text-lg sm:text-xl">
                    <span>Total</span>
                    <span className="text-green-600">₹{totalAmountINR}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Project Info */}
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <h4 className="font-semibold text-base sm:text-lg">Supporting Project</h4>
                  <p className="text-muted-foreground text-sm">{projectName}</p>
                  <div className="flex gap-1 sm:gap-2">
                    <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-100 border-green-300 text-green-700">
                      <Award className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Verified Project
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs bg-blue-100 border-blue-300 text-blue-700">
                      <Shield className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Climate Certified
                    </Badge>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <Button
                  className="w-full h-12 sm:h-14 text-sm sm:text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={() => {
                    console.log('Button clicked - onClick triggered');
                    handlePayment();
                  }}
                  disabled={isProcessing || !isFormComplete()}
                  type="button"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : !isFormComplete() ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                      Complete Billing Details First
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                      Complete Payment ₹{totalAmountINR}
                    </div>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground p-2 sm:p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg backdrop-blur-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <AuthGuard intent="payment">
      <Layout>
        <Payment />
      </Layout>
    </AuthGuard>
  );
};

export default PaymentPage;
