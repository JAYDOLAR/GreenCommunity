import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';
import { ensureModelRegistered } from '../utils/modelRegistry.js';

const userGroupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create a compound index to prevent duplicate joins
userGroupSchema.index({ userId: 1, groupId: 1 }, { unique: true });

const getUserGroupModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  
  // Ensure User and Group models are registered for population
  await ensureModelRegistered('COMMUNITY_DB', 'User', '../models/User.model.js');
  await ensureModelRegistered('COMMUNITY_DB', 'Group', '../models/Group.model.js');
  
  return communityConn.model('UserGroup', userGroupSchema);
};

const UserGroup = mongoose.models.UserGroup || mongoose.model('UserGroup', userGroupSchema);

export { getUserGroupModel };
export default UserGroup;
