import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

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

const getSecurityThreatModel = async () => {
  const conn = await getConnection('MAIN_DB');
  return conn.model('SecurityThreat', securityThreatSchema);
};

const SecurityThreat = mongoose.models.SecurityThreat || mongoose.model('SecurityThreat', securityThreatSchema);

export { getSecurityThreatModel };
export default SecurityThreat;
