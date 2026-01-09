import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';
import { ensureModelRegistered } from '../utils/modelRegistry.js';

const userEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create a compound index to prevent duplicate joins
userEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const getUserEventModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  
  // Ensure User and Event models are registered for population
  await ensureModelRegistered('COMMUNITY_DB', 'User', '../models/User.model.js');
  await ensureModelRegistered('COMMUNITY_DB', 'Event', '../models/Event.model.js');
  
  return communityConn.model('UserEvent', userEventSchema);
};

const UserEvent = mongoose.models.UserEvent || mongoose.model('UserEvent', userEventSchema);

export { getUserEventModel };
export default UserEvent;
