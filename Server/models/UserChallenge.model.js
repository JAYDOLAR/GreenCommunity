import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const userChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const getUserChallengeModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  // Ensure Challenge and User models are registered for population if needed
  if (!communityConn.models.Challenge) {
    const Challenge = await import('./Challenge.model.js');
    const challengeSchema = Challenge.default.schema;
    communityConn.model('Challenge', challengeSchema);
  }
  if (!communityConn.models.User) {
    const User = await import('./User.model.js');
    const userSchema = User.default.schema;
    communityConn.model('User', userSchema);
  }
  return communityConn.model('UserChallenge', userChallengeSchema);
};

const UserChallenge = mongoose.models.UserChallenge || mongoose.model('UserChallenge', userChallengeSchema);

export { getUserChallengeModel };
export default UserChallenge;


