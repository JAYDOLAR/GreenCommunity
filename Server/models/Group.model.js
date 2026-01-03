import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  members: { type: Number, default: 0 },
  description: { type: String, trim: true },
  category: { type: String, trim: true },
  location: { type: String, trim: true },
  avatar: { type: String, trim: true },
  active: { type: Boolean, default: true },
  posts: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const getGroupModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  return communityConn.model('Group', groupSchema);
};

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);

export { getGroupModel };
export default Group;


