import mongoose from 'mongoose';
import { getConnection, DB_NAMES } from '../config/databases.js';

const emissionFactorSchema = new mongoose.Schema({
  // Activity identification
  activityId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'transport',
      'energy',
      'diet',
      'shopping',
      'waste',
      'water',
      'digital',
      'home',
      'travel',
      'lifestyle'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Display information
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'activity'
  },
  
  // Emission factor details
  factor: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['km', 'hours', 'meals', 'items', 'kwh', 'liters', 'kg', 'count', 'minutes', 'days', 'flights']
  },
  unitLabel: {
    type: String,
    trim: true
  },
  
  // Additional metadata
  source: {
    type: String,
    trim: true,
    default: 'IPCC'
  },
  sourceYear: {
    type: Number,
    default: 2023
  },
  region: {
    type: String,
    default: 'global'
  },
  
  // Configuration
  inputType: {
    type: String,
    enum: ['number', 'slider', 'select', 'toggle'],
    default: 'number'
  },
  minValue: { type: Number, default: 0 },
  maxValue: { type: Number, default: 1000 },
  step: { type: Number, default: 1 },
  defaultValue: { type: Number, default: 0 },
  
  // For select type
  options: [{
    value: { type: Number, required: true },
    label: { type: String, required: true }
  }],
  
  // Ordering and visibility
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  
  // Tips for reducing emissions
  reductionTips: [{
    tip: { type: String, required: true },
    potentialSavings: { type: Number } // in kg CO2
  }],
  
  // Historical tracking
  previousFactors: [{
    factor: { type: Number },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    source: { type: String }
  }]
}, {
  timestamps: true,
  collection: 'emission_factors'
});

// Indexes
emissionFactorSchema.index({ activityId: 1 }, { unique: true });
emissionFactorSchema.index({ category: 1, isActive: 1 });
emissionFactorSchema.index({ order: 1 });

// Static method to get all active factors grouped by category
emissionFactorSchema.statics.getFactorsByCategory = async function() {
  const factors = await this.find({ isActive: true })
    .sort({ category: 1, order: 1 })
    .lean();
  
  const grouped = {};
  factors.forEach(factor => {
    if (!grouped[factor.category]) {
      grouped[factor.category] = [];
    }
    grouped[factor.category].push(factor);
  });
  
  return grouped;
};

// Static method to calculate emissions
emissionFactorSchema.statics.calculateEmission = async function(activityId, value) {
  const factor = await this.findOne({ activityId, isActive: true });
  if (!factor) {
    throw new Error(`Unknown activity: ${activityId}`);
  }
  
  return {
    emission: value * factor.factor,
    unit: 'kg CO2e',
    factor: factor.factor,
    category: factor.category
  };
};

// Static method to seed default factors
emissionFactorSchema.statics.seedDefaults = async function() {
  const defaults = [
    // Transport
    { activityId: 'car_driving', category: 'transport', label: 'Car Driving', icon: 'car', factor: 0.21, unit: 'km', unitLabel: 'kilometers', description: 'Private car travel' },
    { activityId: 'public_transit', category: 'transport', label: 'Public Transit', icon: 'train', factor: 0.089, unit: 'km', unitLabel: 'kilometers', description: 'Bus, metro, train travel' },
    { activityId: 'cycling', category: 'transport', label: 'Cycling', icon: 'bike', factor: 0, unit: 'km', unitLabel: 'kilometers', description: 'Zero emission travel' },
    { activityId: 'walking', category: 'transport', label: 'Walking', icon: 'footprints', factor: 0, unit: 'km', unitLabel: 'kilometers', description: 'Zero emission travel' },
    { activityId: 'motorcycle', category: 'transport', label: 'Motorcycle', icon: 'bike', factor: 0.103, unit: 'km', unitLabel: 'kilometers' },
    { activityId: 'electric_car', category: 'transport', label: 'Electric Car', icon: 'zap', factor: 0.053, unit: 'km', unitLabel: 'kilometers' },
    { activityId: 'domestic_flight', category: 'transport', label: 'Domestic Flight', icon: 'plane', factor: 255, unit: 'flights', unitLabel: 'flights' },
    { activityId: 'international_flight', category: 'transport', label: 'International Flight', icon: 'plane', factor: 1100, unit: 'flights', unitLabel: 'flights' },
    
    // Energy
    { activityId: 'electricity', category: 'energy', label: 'Electricity Usage', icon: 'zap', factor: 0.5, unit: 'kwh', unitLabel: 'kWh', description: 'Home electricity consumption' },
    { activityId: 'natural_gas', category: 'energy', label: 'Natural Gas', icon: 'flame', factor: 2.0, unit: 'kg', unitLabel: 'kg' },
    { activityId: 'solar_energy', category: 'energy', label: 'Solar Energy', icon: 'sun', factor: 0.05, unit: 'kwh', unitLabel: 'kWh' },
    { activityId: 'heating_oil', category: 'energy', label: 'Heating Oil', icon: 'flame', factor: 2.52, unit: 'liters', unitLabel: 'liters' },
    
    // Diet
    { activityId: 'meat_meals', category: 'diet', label: 'Meat Meals', icon: 'utensils', factor: 3.3, unit: 'meals', unitLabel: 'meals', description: 'Beef, pork, lamb meals' },
    { activityId: 'vegetarian_meals', category: 'diet', label: 'Vegetarian Meals', icon: 'salad', factor: 0.9, unit: 'meals', unitLabel: 'meals' },
    { activityId: 'vegan_meals', category: 'diet', label: 'Vegan Meals', icon: 'leaf', factor: 0.7, unit: 'meals', unitLabel: 'meals' },
    { activityId: 'fish_meals', category: 'diet', label: 'Fish Meals', icon: 'fish', factor: 1.5, unit: 'meals', unitLabel: 'meals' },
    { activityId: 'dairy', category: 'diet', label: 'Dairy Products', icon: 'milk', factor: 1.1, unit: 'items', unitLabel: 'servings' },
    { activityId: 'local_produce', category: 'diet', label: 'Local Produce', icon: 'apple', factor: 0.3, unit: 'items', unitLabel: 'items' },
    
    // Shopping
    { activityId: 'new_clothing', category: 'shopping', label: 'New Clothing', icon: 'shirt', factor: 22, unit: 'items', unitLabel: 'items' },
    { activityId: 'secondhand_clothing', category: 'shopping', label: 'Secondhand Clothing', icon: 'recycle', factor: 2.2, unit: 'items', unitLabel: 'items' },
    { activityId: 'electronics', category: 'shopping', label: 'Electronics', icon: 'smartphone', factor: 75, unit: 'items', unitLabel: 'items' },
    { activityId: 'furniture', category: 'shopping', label: 'Furniture', icon: 'sofa', factor: 90, unit: 'items', unitLabel: 'items' },
    
    // Waste
    { activityId: 'recycling', category: 'waste', label: 'Recycling', icon: 'recycle', factor: -0.5, unit: 'kg', unitLabel: 'kg', description: 'Negative = reduces emissions' },
    { activityId: 'composting', category: 'waste', label: 'Composting', icon: 'leaf', factor: -0.2, unit: 'kg', unitLabel: 'kg' },
    { activityId: 'landfill_waste', category: 'waste', label: 'Landfill Waste', icon: 'trash', factor: 0.58, unit: 'kg', unitLabel: 'kg' },
    { activityId: 'plastic_waste', category: 'waste', label: 'Plastic Waste', icon: 'package', factor: 6.0, unit: 'kg', unitLabel: 'kg' },
    
    // Water
    { activityId: 'shower', category: 'water', label: 'Shower', icon: 'droplet', factor: 0.1, unit: 'minutes', unitLabel: 'minutes' },
    { activityId: 'bath', category: 'water', label: 'Bath', icon: 'bath', factor: 1.5, unit: 'count', unitLabel: 'baths' },
    { activityId: 'laundry', category: 'water', label: 'Laundry', icon: 'shirt', factor: 0.3, unit: 'count', unitLabel: 'loads' },
    
    // Digital
    { activityId: 'streaming', category: 'digital', label: 'Video Streaming', icon: 'tv', factor: 0.036, unit: 'hours', unitLabel: 'hours' },
    { activityId: 'video_calls', category: 'digital', label: 'Video Calls', icon: 'video', factor: 0.01, unit: 'hours', unitLabel: 'hours' },
    { activityId: 'cloud_storage', category: 'digital', label: 'Cloud Storage', icon: 'cloud', factor: 0.02, unit: 'hours', unitLabel: 'GB/month' },
    
    // Lifestyle
    { activityId: 'tree_planting', category: 'lifestyle', label: 'Tree Planting', icon: 'tree-pine', factor: -21, unit: 'count', unitLabel: 'trees', description: 'Carbon offset activity' },
    { activityId: 'renewable_energy', category: 'lifestyle', label: 'Renewable Energy Switch', icon: 'sun', factor: -500, unit: 'count', unitLabel: 'household', description: 'Annual savings from switching' },
    { activityId: 'work_from_home', category: 'lifestyle', label: 'Work From Home', icon: 'home', factor: -3.5, unit: 'days', unitLabel: 'days', description: 'Emissions saved vs commuting' }
  ];
  
  for (const factor of defaults) {
    await this.findOneAndUpdate(
      { activityId: factor.activityId },
      { ...factor, order: defaults.indexOf(factor) },
      { upsert: true, new: true }
    );
  }
  
  return defaults.length;
};

let EmissionFactor = null;

export const getEmissionFactorModel = async () => {
  if (EmissionFactor) return EmissionFactor;
  
  const conn = await getConnection(DB_NAMES.MAIN_DB);
  EmissionFactor = conn.models.EmissionFactor || 
    conn.model('EmissionFactor', emissionFactorSchema);
  return EmissionFactor;
};

export default emissionFactorSchema;
