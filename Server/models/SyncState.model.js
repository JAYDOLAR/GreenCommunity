import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const syncStateSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  lastBlock: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const getSyncStateModel = async () => {
  const conn = await getConnection('PROJECTS_DB');
  return conn.model('SyncState', syncStateSchema);
};

export { getSyncStateModel };
export default mongoose.models.SyncState || mongoose.model('SyncState', syncStateSchema);
