import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate real-time analytics data
    // In a real application, this would fetch from your database
    const generateRandomData = (min, max, count) => {
      return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
      );
    };

    const realTimeMetrics = {
      users: {
        total: Math.floor(Math.random() * 2000) + 1000,
        growth: (Math.random() * 20 + 5).toFixed(1),
        trend: Math.random() > 0.3 ? 'up' : 'down',
        data: generateRandomData(100, 300, 12)
      },
      revenue: {
        total: Math.floor(Math.random() * 2000000) + 500000,
        growth: (Math.random() * 15 + 3).toFixed(1),
        trend: Math.random() > 0.2 ? 'up' : 'down',
        data: generateRandomData(80000, 130000, 12)
      },
      projects: {
        total: Math.floor(Math.random() * 100) + 20,
        growth: (Math.random() * 25 + 8).toFixed(1),
        trend: Math.random() > 0.25 ? 'up' : 'down',
        data: generateRandomData(30, 50, 12)
      },
      carbonOffset: {
        total: Math.floor(Math.random() * 200000) + 50000,
        growth: (Math.random() * 25 + 10).toFixed(1),
        trend: Math.random() > 0.15 ? 'up' : 'down',
        data: generateRandomData(80000, 160000, 12)
      }
    };

    const response = {
      metrics: realTimeMetrics,
      lastUpdated: new Date().toISOString(),
      dataSource: 'real-time-analytics',
      refreshInterval: '5 minutes'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 