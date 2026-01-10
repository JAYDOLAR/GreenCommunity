import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  region: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  image: { type: String },
  impact: {
    carbonOffset: { type: Number, default: 0 }, // in tons CO2
    area: { type: Number, default: 0 }, // in hectares or sq km
    beneficiaries: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'planned', 'on-hold'], 
    default: 'active' 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  fundingGoal: { type: Number, default: 0 },
  currentFunding: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  // Detailed verification workflow
  verification: {
    status: { type: String, enum: ['draft','submitted','in-review','approved','rejected'], default: 'draft', index: true },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: [{ at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, note: String }],
    documents: [{
      name: String,
      url: String,
      hash: String,
      uploadedAt: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false },
      verificationNote: String
    }]
  },
  featured: { type: Boolean, default: false },
  // Blockchain integration
  blockchain: {
    projectId: { type: Number, index: true }, // tokenId on chain
    totalCredits: { type: Number, default: 0 },
    soldCredits: { type: Number, default: 0 },
    pricePerCreditWei: { type: String }, // store as string to preserve big int
    certificateBaseURI: { type: String },
    contractAddress: { type: String }, // marketplace contract
    network: { type: String, default: 'localhost' },
    lastSyncAt: { type: Date },
    transactions: [{
      txHash: { type: String, index: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: { type: Date, default: Date.now }
    }]
  },
  category: { 
    type: String, 
    enum: ['reforestation', 'renewable-energy', 'conservation', 'clean-water', 'sustainable-agriculture', 'waste-management', 'other'],
    default: 'other'
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  organization: {
    name: { type: String },
    contact: { type: String },
    website: { type: String }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Add indexes for better query performance
projectSchema.index({ location: 1, type: 1 });
projectSchema.index({ region: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ featured: 1 });
// NOTE: Do NOT add an additional index for blockchain.projectId here because
// the field definition already sets index: true. Adding both causes Mongoose
// to emit a duplicate index warning.

const getProjectModel = async () => {
  const projectsConn = await getConnection('PROJECTS_DB');
  return projectsConn.model('Project', projectSchema);
};

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export { getProjectModel };
export default Project;
