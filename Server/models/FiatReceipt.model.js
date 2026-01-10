import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const fiatReceiptSchema = new mongoose.Schema({
  receiptId: { type: String, unique: true, index: true },
  projectId: { type: Number, index: true },
  projectMongoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  walletAddress: { type: String, index: true },
  amount: { type: Number },
  txHash: { type: String },
  retireImmediately: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','onchain','error'], default: 'pending' },
  error: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const getFiatReceiptModel = async () => {
  const conn = await getConnection('PROJECTS_DB');
  return conn.model('FiatReceipt', fiatReceiptSchema);
};

export { getFiatReceiptModel };
export default mongoose.models.FiatReceipt || mongoose.model('FiatReceipt', fiatReceiptSchema);
