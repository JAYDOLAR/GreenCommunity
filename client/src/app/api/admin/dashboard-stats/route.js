import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate real-time data fetching
    // In a real application, this would fetch from your database
    const realTimeStats = {
      totalUsers: Math.floor(Math.random() * 2000) + 1000, // Random between 1000-3000
      activeUsers: Math.floor(Math.random() * 1000) + 500, // Random between 500-1500
      totalProjects: Math.floor(Math.random() * 100) + 20, // Random between 20-120
      activeProjects: Math.floor(Math.random() * 80) + 15, // Random between 15-95
      totalRevenue: Math.floor(Math.random() * 2000000) + 500000, // Random between 500k-2.5M
      monthlyRevenue: Math.floor(Math.random() * 200000) + 50000, // Random between 50k-250k
      carbonOffset: Math.floor(Math.random() * 200000) + 50000, // Random between 50k-250k
      pendingApprovals: Math.floor(Math.random() * 20) + 5 // Random between 5-25
    };

    // Add timestamp for real-time tracking
    const response = {
      ...realTimeStats,
      lastUpdated: new Date().toISOString(),
      dataSource: 'real-time'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 