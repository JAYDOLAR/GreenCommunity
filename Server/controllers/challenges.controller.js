import { getChallengeModel } from '../models/Challenge.model.js';
import { getUserPointsModel } from '../models/UserPoints.model.js';
import { getUserChallengeModel } from '../models/UserChallenge.model.js';
import { getUserModel } from '../models/User.model.js';
import mongoose from 'mongoose';

export const listChallenges = async (req, res) => {
  try {
    const Challenge = await getChallengeModel();
    const challenges = await Challenge.find({ active: true }).sort({ created_at: -1 });
    
    // Include completion info if authenticated
    try {
      const userId = req.user?._id;
      if (userId) {
        const UserChallenge = await getUserChallengeModel();
        const completed = await UserChallenge.find({ userId }).select('challengeId completedAt');
        const completedMap = new Map();
        completed.forEach(c => {
          completedMap.set(String(c.challengeId), c.completedAt);
        });
        
        return res.json(challenges.map(c => ({ 
          ...c.toObject(), 
          completed: completedMap.has(String(c._id)),
          completedAt: completedMap.get(String(c._id))
        })));
      }
    } catch (err) {
      console.error('Error getting user completions:', err);
    }
    
    res.json(challenges);
  } catch (error) {
    console.error('Error listing challenges:', error);
    res.status(500).json({ error: error.message });
  }
};

export const completeChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format with more detailed error
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid challenge ID format: ${id}`);
      return res.status(400).json({ 
        error: 'Invalid challenge ID format',
        details: `The provided ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    
    const Challenge = await getChallengeModel();
    const UserPoints = await getUserPointsModel();
    const UserChallenge = await getUserChallengeModel();

    // Find and update the challenge with atomic increment of participants
    const challenge = await Challenge.findByIdAndUpdate(
      id,
      { $inc: { participants: 1 } }, // Increment participants count
      { new: true } // Return updated document
    );
    
    if (!challenge || !challenge.active) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const userId = req.user._id;
    // Prevent duplicate completion
    const exists = await UserChallenge.findOne({ userId, challengeId: id });
    if (exists) {
      // Return a more helpful error with completion time
      return res.status(409).json({ 
        error: 'Challenge already completed',
        details: {
          completedAt: exists.completedAt,
          userId: userId,
          challengeId: id
        }
      });
    }
    
    // Update user points and add to history
    const pointsDoc = await UserPoints.findOneAndUpdate(
      { userId },
      {
        $inc: { totalPoints: challenge.points },
        $push: { history: { 
          challengeId: challenge._id, 
          points: challenge.points, 
          title: challenge.title 
        }}
      },
      { upsert: true, new: true }
    );

    // Record completion
    await UserChallenge.create({ userId, challengeId: id });

    res.json({ success: true, totalPoints: pointsDoc.totalPoints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const UserPoints = await getUserPointsModel();
    const User = await getUserModel();
    
    // Get the top entries from COMMUNITY_DB
    const top = await UserPoints.find({})
      .sort({ totalPoints: -1 })
      .limit(20)
      .select('userId totalPoints history');
    
    // Get all user IDs from the leaderboard entries
    const userIds = top.map(entry => entry.userId).filter(Boolean);
    
    // Fetch user data from AUTH_DB separately
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email profile.avatar_url')
      .lean();
    
    // Create a map for quick user lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });
    
    // Combine UserPoints data with User data
    const leaderboardData = top.map((entry, index) => {
      const entryObject = entry.toObject ? entry.toObject() : { ...entry };
      const userId = entryObject.userId ? entryObject.userId.toString() : null;
      const user = userMap.get(userId);
      
      if (user) {
        // Transform the user data to match the expected client format
        entryObject.userId = {
          name: user.name,
          email: user.email,
          profile: {
            avatar: {
              url: user.profile?.avatar_url
            }
          }
        };
      } else {
        // User not found - create placeholder
        console.log(`Warning: User not found for UserPoints entry ${entryObject._id}, userId: ${userId}`);
        entryObject.userId = {
          name: `User ${entryObject._id.toString().slice(-4)}`,
          email: `user-${entryObject._id.toString().slice(-4)}@example.com`
        };
      }
      
      return entryObject;
    });
    
    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const seedChallenges = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Seeding not allowed in production' });
    }
    const Challenge = await getChallengeModel();
    const count = await Challenge.countDocuments();
    if (count > 0) {
      const existing = await Challenge.find({}).sort({ created_at: -1 });
      return res.json({ seeded: false, challenges: existing });
    }
    const defaults = [
      { title: 'Zero Waste Week', description: 'Reduce household waste to near zero for one week', points: 50 },
      { title: 'Plant-Based February', description: 'Eat plant-based meals for a week', points: 100 },
      { title: 'Bike to Work', description: 'Use cycle or public transit for daily commute', points: 25 },
      { title: 'Energy Saver Month', description: 'Reduce home energy use by 20%', points: 75 },
    ];
    await Challenge.insertMany(defaults);
    const challenges = await Challenge.find({}).sort({ created_at: -1 });
    res.json({ seeded: true, challenges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const UserPoints = await getUserPointsModel();
    const User = await getUserModel();
    
    const userId = req.user._id;
    
    // Get user points and history
    const points = await UserPoints.findOne({ userId }).select('totalPoints history');
    const totalPoints = points?.totalPoints || 0;
    const history = points?.history || [];
    
    // Calculate user rank
    const usersAbove = await UserPoints.countDocuments({ totalPoints: { $gt: totalPoints } });
    const rank = usersAbove + 1;
    
    // Get user's streak data
    const user = await User.findById(userId).select('streakData');
    const currentStreak = user?.streakData?.currentStreak || 0;
    const longestStreak = user?.streakData?.longestStreak || 0;
    
    // Calculate badges based on achievements
    const badges = calculateUserBadges(totalPoints, history.length, currentStreak, longestStreak);
    
    res.json({ 
      totalPoints, 
      history, 
      rank,
      currentStreak,
      longestStreak,
      badges: badges.length,
      badgesList: badges
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate badges
function calculateUserBadges(totalPoints, challengesCompleted, currentStreak, longestStreak) {
  const badges = [];
  
  // Points-based badges
  if (totalPoints >= 10) badges.push({ id: 'first_points', name: 'Getting Started', description: 'Earned 10 eco-points' });
  if (totalPoints >= 50) badges.push({ id: 'eco_starter', name: 'Eco Starter', description: 'Earned 50 eco-points' });
  if (totalPoints >= 100) badges.push({ id: 'eco_warrior', name: 'Eco Warrior', description: 'Earned 100 eco-points' });
  if (totalPoints >= 250) badges.push({ id: 'eco_champion', name: 'Eco Champion', description: 'Earned 250 eco-points' });
  if (totalPoints >= 500) badges.push({ id: 'eco_hero', name: 'Eco Hero', description: 'Earned 500 eco-points' });
  if (totalPoints >= 1000) badges.push({ id: 'eco_legend', name: 'Eco Legend', description: 'Earned 1000 eco-points' });
  
  // Challenge-based badges
  if (challengesCompleted >= 1) badges.push({ id: 'first_challenge', name: 'First Step', description: 'Completed first challenge' });
  if (challengesCompleted >= 5) badges.push({ id: 'challenge_seeker', name: 'Challenge Seeker', description: 'Completed 5 challenges' });
  if (challengesCompleted >= 10) badges.push({ id: 'challenge_master', name: 'Challenge Master', description: 'Completed 10 challenges' });
  
  // Streak-based badges
  if (currentStreak >= 3) badges.push({ id: 'streak_3', name: 'On Fire', description: '3 day logging streak' });
  if (currentStreak >= 7) badges.push({ id: 'streak_7', name: 'Week Warrior', description: '7 day logging streak' });
  if (longestStreak >= 14) badges.push({ id: 'streak_14', name: 'Dedicated', description: '14 day streak achieved' });
  if (longestStreak >= 30) badges.push({ id: 'streak_30', name: 'Month Master', description: '30 day streak achieved' });
  
  return badges;
}

// Get extended leaderboard with user stats
export const getLeaderboardExtended = async (req, res) => {
  try {
    const UserPoints = await getUserPointsModel();
    const User = await getUserModel();
    
    // Get the top entries from COMMUNITY_DB
    const top = await UserPoints.find({})
      .sort({ totalPoints: -1 })
      .limit(20)
      .select('userId totalPoints history');
    
    // Get all user IDs from the leaderboard entries
    const userIds = top.map(entry => entry.userId).filter(Boolean);
    
    // Fetch user data from AUTH_DB separately (including streak data)
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email profile.avatar_url streakData')
      .lean();
    
    // Create a map for quick user lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });
    
    // Combine UserPoints data with User data including badges
    const leaderboardData = top.map((entry, index) => {
      const entryObject = entry.toObject ? entry.toObject() : { ...entry };
      const userId = entryObject.userId ? entryObject.userId.toString() : null;
      const user = userMap.get(userId);
      
      const currentStreak = user?.streakData?.currentStreak || 0;
      const longestStreak = user?.streakData?.longestStreak || 0;
      const badges = calculateUserBadges(
        entryObject.totalPoints, 
        entryObject.history?.length || 0, 
        currentStreak, 
        longestStreak
      );
      
      return {
        rank: index + 1,
        totalPoints: entryObject.totalPoints,
        currentStreak,
        badgeCount: badges.length,
        userId: user ? {
          name: user.name,
          email: user.email,
          profile: {
            avatar: {
              url: user.profile?.avatar_url
            }
          }
        } : {
          name: `User ${index + 1}`,
          email: null
        }
      };
    });
    
    res.json(leaderboardData);
  } catch (error) {
    console.error('Extended leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
};


