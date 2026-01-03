import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  participants: { type: Number, default: 0 },
  timeRemaining: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  reward: { type: String },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  image: { type: String },
  category: { type: String },
  featured: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const getChallengeModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  return communityConn.model('Challenge', challengeSchema);
};

const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);

export { getChallengeModel };
export default Challenge;


