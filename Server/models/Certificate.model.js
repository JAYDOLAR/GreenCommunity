import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

// Certificate minted via CertificateNFT (retirement proof)
const certificateSchema = new mongoose.Schema({
  tokenId: { type: Number, index: true, required: true, unique: true },
  projectId: { type: Number, index: true, required: true }, // ERC1155 project / token id
  owner: { type: String, index: true, required: true }, // wallet address (lowercase)
  amount: { type: Number, required: true }, // retired credits represented
  uri: { type: String },
  txHash: { type: String, index: true },
  mintedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

certificateSchema.index({ owner: 1, projectId: 1 });

const getCertificateModel = async () => {
  const conn = await getConnection('PROJECTS_DB');
  return conn.model('Certificate', certificateSchema);
};

export { getCertificateModel };
export default mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
