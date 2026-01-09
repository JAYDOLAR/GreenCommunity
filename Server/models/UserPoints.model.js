import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';
import { ensureModelRegistered } from '../utils/modelRegistry.js';

const userPointsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
  totalPoints: { type: Number, default: 0, min: 0 },
  history: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    points: { type: Number, required: true },
    title: String,
    completedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const getUserPointsModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  
  // Ensure User and Challenge models are registered for population
  await ensureModelRegistered('COMMUNITY_DB', 'User', '../models/User.model.js');
  await ensureModelRegistered('COMMUNITY_DB', 'Challenge', '../models/Challenge.model.js');
  
  return communityConn.model('UserPoints', userPointsSchema);
};

const UserPoints = mongoose.models.UserPoints || mongoose.model('UserPoints', userPointsSchema);

export { getUserPointsModel };
export default UserPoints;


