import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['user-activity', 'revenue', 'project-performance', 'carbon-impact', 'marketplace']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ready', 'generating', 'failed'],
    default: 'ready'
  },
  format: {
    type: String,
    enum: ['PDF', 'CSV', 'EXCEL'],
    default: 'PDF'
  },
  size: {
    type: String,
    required: true
  },
  timeRange: {
    type: String,
    default: '30d'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fileUrl: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  lastGenerated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
reportSchema.index({ lastGenerated: -1 });
reportSchema.index({ type: 1, status: 1 });

export default mongoose.model('Report', reportSchema);
