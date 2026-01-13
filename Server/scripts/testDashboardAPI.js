import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getDashboardStats, getRecentActivities } from '../controllers/dashboard.controller.js';

dotenv.config();

const testDashboardAPI = async () => {
  try {
    console.log('🔍 Testing Dashboard API...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Mock request and response objects
    const mockReq = { query: { limit: 10 } };
    let statsResult = null;
    let activitiesResult = null;
    
    const mockStatsRes = {
      json: (data) => {
        statsResult = data;
        console.log('📊 Dashboard Stats Response:');
        console.log(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.error(`❌ Error (${code}):`, data);
        }
      })
    };
    
    const mockActivitiesRes = {
      json: (data) => {
        activitiesResult = data;
        console.log('\n📋 Recent Activities Response:');
        console.log(`Found ${data.activities?.length || 0} activities`);
        if (data.activities?.length > 0) {
          data.activities.forEach((activity, index) => {
            console.log(`  ${index + 1}. ${activity.title} (${activity.type})`);
          });
        }
      },
      status: (code) => ({
        json: (data) => {
          console.error(`❌ Error (${code}):`, data);
        }
      })
    };
    
    // Test getDashboardStats
    await getDashboardStats(mockReq, mockStatsRes);
    
    // Test getRecentActivities
    await getRecentActivities(mockReq, mockActivitiesRes);
    
    console.log('\n✅ Dashboard API test completed successfully!');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

testDashboardAPI();
