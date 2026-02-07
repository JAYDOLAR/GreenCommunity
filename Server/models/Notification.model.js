import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'project', 'order', 'system', 'security', 'marketplace'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });

const getNotificationModel = async () => {
  const conn = await getConnection('MAIN_DB');
  return conn.model('Notification', notificationSchema);
};

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export { getNotificationModel };
export default Notification;
