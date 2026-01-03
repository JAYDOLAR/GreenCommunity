/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Challenge from './models/Challenge.model.js';
import Group from './models/Group.model.js';
import Event from './models/Event.model.js';

dotenv.config({ path: './Server/.env' });

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not set in Server/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { dbName: 'greencommunity-community' });
  console.log('Connected. Seeding data...');

  // Challenges from Community page dummy data
  const challenges = [
    {
      title: 'Zero Waste Week',
      description: 'Reduce household waste to near zero for one week',
      participants: 1250,
      timeRemaining: '5 days left',
      difficulty: 'Medium',
      reward: '50 eco-points',
      progress: 65,
      image: '🗑️',
      category: 'Waste Reduction',
      featured: true,
      points: 50,
      active: true,
    },
    {
      title: 'Plant-Based February',
      description: 'Commit to plant-based meals for the entire month',
      participants: 2840,
      timeRemaining: '12 days left',
      difficulty: 'Hard',
      reward: '100 eco-points',
      progress: 40,
      image: '🌱',
      category: 'Diet & Food',
      featured: true,
      points: 100,
      active: true,
    },
    {
      title: 'Bike to Work Challenge',
      description: 'Use bicycle or public transport for daily commuting',
      participants: 890,
      timeRemaining: '3 weeks left',
      difficulty: 'Easy',
      reward: '25 eco-points',
      progress: 80,
      image: '🚲',
      category: 'Transportation',
      featured: false,
      points: 25,
      active: true,
    },
    {
      title: 'Energy Saver Month',
      description: 'Reduce home energy consumption by 20%',
      participants: 1560,
      timeRemaining: '2 weeks left',
      difficulty: 'Medium',
      reward: '75 eco-points',
      progress: 55,
      image: '⚡',
      category: 'Energy',
      featured: true,
      points: 75,
      active: true,
    }
  ];

  // Groups from Community page dummy data
  const groups = [
    {
      name: 'Zero Waste Warriors',
      members: 4250,
      description: 'Community focused on reducing waste and promoting circular economy',
      category: 'Waste Reduction',
      location: 'Global',
      avatar: '♻️',
      active: true,
      posts: 156,
    },
    {
      name: 'Solar Enthusiasts',
      members: 2180,
      description: 'Share experiences and tips about solar energy adoption',
      category: 'Renewable Energy',
      location: 'North America',
      avatar: '☀️',
      active: true,
      posts: 89,
    },
    {
      name: 'Urban Gardeners',
      members: 1890,
      description: 'Growing food sustainably in urban environments',
      category: 'Food & Agriculture',
      location: 'Global',
      avatar: '🌿',
      active: false,
      posts: 245,
    },
    {
      name: 'Eco Travelers',
      members: 3420,
      description: 'Sustainable travel tips and carbon-neutral adventures',
      category: 'Travel',
      location: 'Global',
      avatar: '🌍',
      active: true,
      posts: 178,
    }
  ];

  // Events from Community page dummy data
  const events = [
    {
      title: 'Community Beach Cleanup',
      date: new Date('2024-02-15'),
      time: '9:00 AM',
      location: 'Santa Monica Beach, CA',
      attendees: 45,
      maxAttendees: 100,
      organizer: 'Ocean Guardians',
      description: 'Join us for a morning of beach cleaning and ocean conservation'
    },
    {
      title: 'Sustainable Living Workshop',
      date: new Date('2024-02-18'),
      time: '2:00 PM',
      location: 'Community Center, Portland',
      attendees: 28,
      maxAttendees: 50,
      organizer: 'Green Living Collective',
      description: 'Learn practical tips for reducing your environmental footprint'
    },
    {
      title: 'Tree Planting Day',
      date: new Date('2024-02-22'),
      time: '8:00 AM',
      location: 'Central Park, NYC',
      attendees: 120,
      maxAttendees: 200,
      organizer: 'NYC Green Initiative',
      description: 'Help us plant 500 trees to improve urban air quality'
    }
  ];

  await Promise.all([
    Challenge.deleteMany({}),
    Group.deleteMany({}),
    Event.deleteMany({})
  ]);

  await Challenge.insertMany(challenges);
  await Group.insertMany(groups);
  await Event.insertMany(events);

  console.log('Seed completed.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});


