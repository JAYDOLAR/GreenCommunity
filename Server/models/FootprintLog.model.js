import { Schema } from "mongoose";
import mongoose from 'mongoose';
import { getConnection } from '../config/databases.js';

const FootprintLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activity: { type: String, required: true },
    activityType: {
      type: String,
      enum: ["transport", "energy", "food", "waste", "other"],
      default: "other",
      index: true,
    },
    category: { type: String },
    tags: [{ type: String, index: true }],
    emission: { type: Number, required: true }, // in kg CO2e
    calculation: {
      method: { type: String },
      source: { type: String },
      factors: { type: Schema.Types.Mixed },
    },
    location: {
      country: { type: String },
      city: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    metadata: { type: Schema.Types.Mixed },
    notes: { type: String },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    community: { type: Schema.Types.ObjectId, ref: "Community" },
  },
  {
    timestamps: true,
  }
);

FootprintLogSchema.index({ user: 1, activityType: 1, date: -1 });

// Get footprint log model with footprint database connection
const getFootprintLogModel = async () => {
  const footprintConnection = await getConnection('FOOTPRINT_DB');
  return footprintConnection.model('FootprintLog', FootprintLogSchema);
};

// For synchronous usage (when connection is already established)
const FootprintLog = mongoose.model('FootprintLog', FootprintLogSchema);

export { getFootprintLogModel };
export default FootprintLog;
