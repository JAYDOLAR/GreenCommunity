"use client";

import { Leaf, Waves, Sun, Mountain } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-50 via-white to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 via-transparent to-transparent"></div>
      
      {/* Logo at the top */}
      <img src="/logo.png" alt="GreenCommunity Logo" className="h-16 mb-8 relative z-10" />
      
      {/* Main content card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-green-100 p-16 flex flex-col items-center relative z-10">
        {/* Main title with gradient effect */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center leading-tight">
          <span className="text-green-600">Building a</span>
          <br />
          <span className="text-green-500">Sustainable</span>
          <br />
          <span className="text-green-600">Future Together</span>
        </h1>
        
        {/* Description */}
        <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed max-w-2xl">
          Calculate your carbon footprint, discover reduction strategies, offset your impact, and join a community committed to environmental stewardship.
        </p>
        
        {/* Call-to-action buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12 w-full justify-center">
          <Link href="/CarbonCalculator">
            <button className="h-14 w-72 rounded-full bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-3 group">
              Calculate My Carbon Footprint
              <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
          
          <Link href="/Signup">
            <button className="h-14 w-72 rounded-full border-2 border-green-600 text-green-600 bg-white font-semibold shadow-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-3 group">
              Join the Community
              <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="text-gray-500 text-sm mb-6 text-center">
          Trusted by environmentally conscious individuals and forward-thinking businesses
        </div>
        
        {/* Icons row */}
        <div className="flex gap-12 justify-center w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Waves className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Sun className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Mountain className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 