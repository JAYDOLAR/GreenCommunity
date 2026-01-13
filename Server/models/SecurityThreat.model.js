import mongoose from 'mongoose';

const securityThreatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['failed_login', 'suspicious_activity', 'brute_force', 'data_breach', 'unauthorized_access', 'sql_injection', 'xss_attempt'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  user: {
    type: String,
    default: 'unknown'
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'blocked', 'resolved'],
    default: 'active'
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const SecurityThreat = mongoose.model('SecurityThreat', securityThreatSchema);

export default SecurityThreat;
