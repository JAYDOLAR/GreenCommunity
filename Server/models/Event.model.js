import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date },
  time: { type: String },
  location: { type: String, trim: true },
  attendees: { type: Number, default: 0 },
  maxAttendees: { type: Number, default: 0 },
  organizer: { type: String, trim: true },
  description: { type: String, trim: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const getEventModel = async () => {
  const communityConn = await getConnection('COMMUNITY_DB');
  return communityConn.model('Event', eventSchema);
};

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export { getEventModel };
export default Event;


