import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['user', 'project', 'payment', 'carbon', 'system', 'security', 'marketplace']
  },
  action: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedId: {
    type: String
  },
  icon: {
    type: String,
    default: 'Activity'
  },
  iconColor: {
    type: String,
    default: 'blue'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });

const getActivityLogModel = async () => {
  const conn = await getConnection('ANALYTICS_DB');
  return conn.model('ActivityLog', activityLogSchema);
};

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

export { getActivityLogModel };
export default ActivityLog;
