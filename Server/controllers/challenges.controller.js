import { getChallengeModel } from '../models/Challenge.model.js';
import { getUserPointsModel } from '../models/UserPoints.model.js';
import { getUserChallengeModel } from '../models/UserChallenge.model.js';

export const listChallenges = async (req, res) => {
  try {
    const Challenge = await getChallengeModel();
    const challenges = await Challenge.find({ active: true }).sort({ created_at: -1 });
    // Include completion info if authenticated
    try {
      const userId = req.user?._id;
      if (userId) {
        const UserChallenge = await getUserChallengeModel();
        const completed = await UserChallenge.find({ userId }).select('challengeId');
        const set = new Set(completed.map(c => String(c.challengeId)));
        return res.json(challenges.map(c => ({ ...c.toObject(), completed: set.has(String(c._id)) })));
      }
    } catch {}
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const Challenge = await getChallengeModel();
    const UserPoints = await getUserPointsModel();
    const UserChallenge = await getUserChallengeModel();

    const challenge = await Challenge.findById(id);
    if (!challenge || !challenge.active) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const userId = req.user._id;
    // Prevent duplicate completion
    const exists = await UserChallenge.findOne({ userId, challengeId: id });
    if (exists) {
      return res.status(409).json({ error: 'Challenge already completed' });
    }
    const pointsDoc = await UserPoints.findOneAndUpdate(
      { userId },
      {
        $inc: { totalPoints: challenge.points },
        $push: { history: { challengeId: challenge._id, points: challenge.points, title: challenge.title } }
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
    const top = await UserPoints.find({})
      .sort({ totalPoints: -1 })
      .limit(20)
      .select('userId totalPoints')
      .populate({ path: 'userId', select: 'name email profile.avatar.url' });
    res.json(top);
  } catch (error) {
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
    const points = await UserPoints.findOne({ userId: req.user._id }).select('totalPoints history');
    const totalPoints = points?.totalPoints || 0;
    const history = points?.history || [];
    res.json({ totalPoints, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


