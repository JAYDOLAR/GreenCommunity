import mongoose from 'mongoose';
import Notification from '../models/Notification.model.js';
import SecurityLog from '../models/SecurityLog.model.js';
import SecurityThreat from '../models/SecurityThreat.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import Report from '../models/Report.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  process.exit(1);
}

async function seedAdminData() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'greencommunity-auth',
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Notification.deleteMany({});
    await SecurityLog.deleteMany({});
    await SecurityThreat.deleteMany({});
    await ActivityLog.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Cleared existing admin data');

    // Create sample notifications
    const notifications = [
      {
        type: 'user',
        title: 'New User Registration',
        message: 'New user has joined the GreenCommunity platform',
        priority: 'medium',
        isRead: false
      },
      {
        type: 'project',
        title: 'Project Created',
        message: 'Green India Mission project has been created',
        priority: 'high',
        isRead: false
      },
      {
        type: 'project',
        title: 'Project Milestone',
        message: 'Bhadla Solar Park reached 80% funding goal',
        priority: 'medium',
        isRead: false
      },
      {
        type: 'order',
        title: 'New Marketplace Order',
        message: 'New order received for eco-friendly products',
        priority: 'medium',
        isRead: true
      },
      {
        type: 'system',
        title: 'System Update',
        message: 'Platform maintenance completed successfully',
        priority: 'low',
        isRead: true
      },
      {
        type: 'security',
        title: 'Security Alert',
        message: 'Suspicious login attempt detected and blocked',
        priority: 'urgent',
        isRead: false
      }
    ];

    await Notification.insertMany(notifications);
    console.log('✅ Created sample notifications');

    // Create sample security logs
    const securityLogs = [
      {
        user: 'admin@greencommunity.com',
        action: 'login',
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success',
        location: 'Mumbai, India'
      },
      {
        user: 'user@example.com',
        action: 'project_create',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        location: 'Delhi, India'
      },
      {
        user: 'moderator@greencommunity.com',
        action: 'user_update',
        ipAddress: '45.67.89.123',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
        status: 'success',
        location: 'Bangalore, India'
      },
      {
        user: 'unknown',
        action: 'login_failed',
        ipAddress: '98.76.54.32',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        status: 'failed',
        location: 'Unknown'
      },
      {
        user: 'admin@greencommunity.com',
        action: 'settings_change',
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success',
        location: 'Mumbai, India'
      }
    ];

    await SecurityLog.insertMany(securityLogs);
    console.log('✅ Created sample security logs');

    // Create sample security threats
    const securityThreats = [
      {
        type: 'failed_login',
        severity: 'medium',
        description: 'Multiple failed login attempts detected',
        ipAddress: '98.76.54.32',
        user: 'unknown',
        status: 'active',
        location: 'Unknown'
      },
      {
        type: 'suspicious_activity',
        severity: 'high',
        description: 'Unusual data access pattern detected',
        ipAddress: '45.67.89.123',
        user: 'suspicious_user@example.com',
        status: 'investigating',
        location: 'Unknown'
      },
      {
        type: 'brute_force',
        severity: 'critical',
        description: 'Brute force attack detected and blocked',
        ipAddress: '123.45.67.89',
        user: 'admin',
        status: 'blocked',
        location: 'Unknown'
      }
    ];

    await SecurityThreat.insertMany(securityThreats);
    console.log('✅ Created sample security threats');

    // Create sample activity logs
    const activityLogs = [
      {
        type: 'user',
        action: 'registration',
        title: 'New user registration',
        description: 'A new user has registered on the platform',
        icon: 'Users',
        iconColor: 'green',
        createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      },
      {
        type: 'project',
        action: 'approved',
        title: 'Project approved',
        description: 'Solar Panel Installation project has been approved',
        icon: 'TreePine',
        iconColor: 'blue',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        type: 'payment',
        action: 'received',
        title: 'Payment received',
        description: 'Payment of ₹5,000 received for project contribution',
        icon: 'DollarSign',
        iconColor: 'purple',
        createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      },
      {
        type: 'carbon',
        action: 'milestone',
        title: 'Carbon offset milestone',
        description: 'Platform has offset 100,000 kg of CO₂',
        icon: 'Target',
        iconColor: 'orange',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: 'user',
        action: 'login',
        title: 'Admin login',
        description: 'Admin user logged in from new location',
        icon: 'Users',
        iconColor: 'blue',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        type: 'project',
        action: 'created',
        title: 'New project created',
        description: 'Wind Energy Farm project has been created',
        icon: 'TreePine',
        iconColor: 'green',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        type: 'marketplace',
        action: 'order',
        title: 'New marketplace order',
        description: 'Order placed for eco-friendly products worth ₹2,500',
        icon: 'DollarSign',
        iconColor: 'purple',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        type: 'security',
        action: 'threat',
        title: 'Security threat detected',
        description: 'Multiple failed login attempts detected',
        icon: 'Activity',
        iconColor: 'red',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      }
    ];

    await ActivityLog.insertMany(activityLogs);
    console.log('✅ Created sample activity logs');

    // Create sample reports
    const reports = [
      {
        name: 'User Activity Report',
        type: 'user-activity',
        description: 'Comprehensive user engagement and activity metrics',
        status: 'ready',
        format: 'PDF',
        size: '2.3 MB',
        timeRange: '30d',
        data: {
          totalUsers: 1247,
          activeUsers: 892,
          userRetention: 71,
          engagementRate: 78
        },
        lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        name: 'Revenue Analysis Report',
        type: 'revenue',
        description: 'Detailed revenue breakdown and financial performance',
        status: 'ready',
        format: 'PDF',
        size: '1.8 MB',
        timeRange: '30d',
        data: {
          totalRevenue: 1250000,
          orderCount: 342,
          revenueGrowth: 8.3
        },
        lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        name: 'Project Performance Report',
        type: 'project-performance',
        description: 'Carbon offset projects performance and metrics',
        status: 'ready',
        format: 'PDF',
        size: '3.1 MB',
        timeRange: '30d',
        data: {
          totalProjects: 45,
          totalFunding: 2100000,
          totalCarbonOffset: 125000,
          activeProjects: 32
        },
        lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        name: 'Carbon Offset Impact Report',
        type: 'carbon-impact',
        description: 'Environmental impact and carbon offset achievements',
        status: 'ready',
        format: 'PDF',
        size: '4.2 MB',
        timeRange: '90d',
        data: {
          carbonOffset: 125000,
          projectCount: 45,
          environmentalImpact: 85000,
          impactGrowth: 25.8
        },
        lastGenerated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        name: 'Marketplace Sales Report',
        type: 'marketplace',
        description: 'Eco-friendly product sales and inventory analysis',
        status: 'ready',
        format: 'CSV',
        size: '1.5 MB',
        timeRange: '30d',
        data: {
          totalSales: 450000,
          orderCount: 156,
          salesGrowth: 22.1
        },
        lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];

    await Report.insertMany(reports);
    console.log('✅ Created sample reports');

    console.log('\n🎉 Successfully seeded admin data!');
    console.log('📊 Created:');
    console.log(`   - ${notifications.length} notifications`);
    console.log(`   - ${securityLogs.length} security logs`);
    console.log(`   - ${securityThreats.length} security threats`);
    console.log(`   - ${activityLogs.length} activity logs`);
    console.log(`   - ${reports.length} reports`);

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedAdminData();
