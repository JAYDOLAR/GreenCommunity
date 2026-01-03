import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  ts: { type: Date, default: Date.now }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profile: {
    name: String,
    goals: String,
    location: String,
    style: String
  },
  history: { type: [messageSchema], default: [] },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const getChatSessionModel = async () => {
  const aiConn = await getConnection('AI_DB');
  return aiConn.model('ChatSession', chatSessionSchema);
};

const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);

export { getChatSessionModel };
export default ChatSession;


