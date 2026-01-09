import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';
import { ensureModelRegistered } from '../utils/modelRegistry.js';

const userChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const getUserChallengeModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  
  // Ensure User and Challenge models are registered for population
  await ensureModelRegistered('COMMUNITY_DB', 'User', '../models/User.model.js');
  await ensureModelRegistered('COMMUNITY_DB', 'Challenge', '../models/Challenge.model.js');
  
  return communityConn.model('UserChallenge', userChallengeSchema);
};

const UserChallenge = mongoose.models.UserChallenge || mongoose.model('UserChallenge', userChallengeSchema);

export { getUserChallengeModel };
export default UserChallenge;


