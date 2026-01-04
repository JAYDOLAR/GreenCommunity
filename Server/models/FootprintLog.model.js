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
      enum: [
        // Transportation
        "transport-car", "transport-bus", "transport-train", "transport-subway",
        "transport-taxi", "transport-motorcycle", "transport-flight", "transport-ferry",
        "transport-bicycle", "transport-walking",
        // Energy
        "energy-electricity", "energy-gas", "energy-heating-oil", "energy-propane",
        "energy-coal", "energy-wood",
        // Food
        "food-beef", "food-pork", "food-chicken", "food-fish", "food-dairy",
        "food-eggs", "food-rice", "food-vegetables", "food-fruits",
        // Waste
        "waste-general", "waste-recycling", "waste-compost",
        // Water
        "water-usage", "water-shower", "water-dishwasher", "water-laundry",
        // Shopping
        "shopping-clothing", "shopping-electronics", "shopping-books", "shopping-furniture",
        // Legacy support
        "transport", "energy", "food", "waste", "other"
      ],
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
    selectedDate: { type: Date }, // User's selected date for the activity
    quantity: { type: Number }, // Quantity of the activity
    details: { type: Schema.Types.Mixed }, // Additional activity details
  },
  {
    timestamps: true,
  }
);

FootprintLogSchema.index({ user: 1, activityType: 1, createdAt: -1 });

// Get footprint log model with footprint database connection
const getFootprintLogModel = async () => {
  const footprintConnection = await getConnection('FOOTPRINT_DB');
  return footprintConnection.model('FootprintLog', FootprintLogSchema);
};

// For synchronous usage (when connection is already established)
const FootprintLog = mongoose.model('FootprintLog', FootprintLogSchema);

export { getFootprintLogModel };
export default FootprintLog;
