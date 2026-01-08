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
  featured: { type: Boolean, default: false },
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

const getProjectModel = async () => {
  const projectsConn = await getConnection('PROJECTS_DB');
  return projectsConn.model('Project', projectSchema);
};

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export { getProjectModel };
export default Project;
