import mongoose from 'mongoose';

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

export default mongoose.model('ActivityLog', activityLogSchema);
