import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    enum: [
      'login', 
      'logout', 
      'login_failed',
      'project_create', 
      'project_update', 
      'project_delete',
      'user_create',
      'user_update', 
      'user_delete', 
      'user_management',
      'settings_change',
      'role_change',
      'password_change',
      'password_reset',
      'data_export',
      'data_import'
    ],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'warning'],
    default: 'success'
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ userId: 1 });
securityLogSchema.index({ action: 1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

export default SecurityLog;
