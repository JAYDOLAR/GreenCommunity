import { getFootprintLogModel } from "../models/FootprintLog.model.js";
import { getUserModel } from "../models/User.model.js";
import * as ipcc from "../lib/ipccEmissionCalculator.js";

// Fallback emission calculation for when IPCC calculation fails
function calculateFallbackEmission(activityData) {
  const { activityType, quantity = 0, details = {} } = activityData;

  // Handle special annual assessment activity types
  if (activityType === "food-diet-annual") {
    return calculateDietEmissions(details);
  }
  
  if (activityType === "home-energy-annual") {
    return calculateHousingEmissions(quantity, details);
  }

  // Simple fallback emission factors (kg CO2e per unit)
  const fallbackFactors = {
    // Transportation (per km)
    "transport-car": 0.4,
    "transport-bus": 0.15,
    "transport-train": 0.12,
    "transport-subway": 0.08,
    "transport-taxi": 0.45,
    "transport-motorcycle": 0.25,
    "transport-flight": 0.2,
    "transport-ferry": 0.35,
    "transport-bicycle": 0,
    "transport-walking": 0,

    // Energy
    "energy-electricity": 0.5, // per kWh
    "energy-gas": 5.3, // per therm
    "energy-heating-oil": 22.4, // per gallon
    "energy-propane": 12.7, // per gallon
    "energy-coal": 2.0, // per lb
    "energy-wood": 0.1, // per cord (low emissions)

    // Food (per lb)
    "food-beef": 27.0,
    "food-pork": 12.1,
    "food-chicken": 6.9,
    "food-fish": 5.4,
    "food-dairy": 3.2,
    "food-eggs": 4.8, // per dozen
    "food-rice": 2.7,
    "food-vegetables": 0.4,
    "food-fruits": 0.3,

    // Waste (per lb)
    "waste-general": 0.94,
    "waste-recycling": -0.5, // negative = saves emissions
    "waste-compost": -0.2,

    // Water
    "water-usage": 0.006, // per gallon
    "water-shower": 0.125, // per minute
    "water-dishwasher": 1.8, // per load
    "water-laundry": 2.3, // per load

    // Shopping (per item)
    "shopping-clothing": 15.0,
    "shopping-electronics": 300.0,
    "shopping-books": 2.5,
    "shopping-furniture": 250.0,
    
    // Annual assessment types
    "food-diet-annual": 800.0, // Average annual diet emissions (kg CO2e)
    "home-energy-annual": 2.5, // Per square foot per year
    
    // Assessment (client-computed aggregate, quantity = total kg CO2e)
    "assessment-annual": 1.0,
  };

  const factor = fallbackFactors[activityType] || 1.0;
  const baseEmission = parseFloat(quantity) * factor;

  return Math.max(0, baseEmission); // Ensure non-negative
}

// Helper function to calculate diet emissions based on diet type and preferences
function calculateDietEmissions(details) {
  const { diet_type, red_meat_frequency = "moderate", dairy_consumption = "moderate" } = details;
  
  // Base diet emissions (kg CO2e per year)
  const dietBaseEmissions = {
    vegan: 550,
    vegetarian: 650,
    pescatarian: 750,
    flexitarian: 850,
    omnivore: 1000
  };
  
  let totalEmissions = dietBaseEmissions[diet_type] || 800;
  
  // Red meat frequency multiplier (for omnivore/flexitarian)
  if (diet_type === "omnivore" || diet_type === "flexitarian") {
    const redMeatMultiplier = {
      never: 0.7,
      rarely: 0.8,
      occasionally: 0.9,
      moderate: 1.0,
      often: 1.2,
      daily: 1.4
    };
    totalEmissions *= (redMeatMultiplier[red_meat_frequency] || 1.0);
  }
  
  // Dairy consumption multiplier (for non-vegan diets)
  if (diet_type !== "vegan") {
    const dairyMultiplier = {
      never: 0.8,
      low: 0.9,
      moderate: 1.0,
      high: 1.2,
      very_high: 1.4
    };
    totalEmissions *= (dairyMultiplier[dairy_consumption] || 1.0);
  }
  
  return Math.max(0, totalEmissions);
}

// Helper function to calculate housing emissions
function calculateHousingEmissions(quantity, details) {
  const { home_size = "medium", household_members = 1, energy_usage = "average" } = details;
  
  // Base emissions per square foot per year (kg CO2e)
  const baseEmissionPerSqFt = 2.5;
  
  // Home size in square feet
  const homeSizeSqFt = {
    small: 1000,
    medium: 2000,
    large: 3000
  };
  
  const sqFt = homeSizeSqFt[home_size] || quantity || 2000;
  const householdSize = parseFloat(household_members) || 1;
  
  // Energy usage multiplier
  const energyMultiplier = {
    low: 0.7,
    average: 1.0,
    high: 1.3,
    very_high: 1.6
  };
  
  const multiplier = energyMultiplier[energy_usage] || 1.0;
  const totalEmissions = (sqFt * baseEmissionPerSqFt * multiplier) / householdSize;
  
  return Math.max(0, totalEmissions);
}

// Create a new footprint log with IPCC-verified calculation
export async function createLog(req, res) {
  try {
    let calculation, emission;

    // Always calculate fallback emission first
    const fallbackEmission = calculateFallbackEmission(req.body);

    // Try IPCC calculation but don't fail if it doesn't work
    try {
      calculation = await ipcc.calculateCarbonFootprint({ ...req.body });
      emission = calculation.calculated_kgCO2e || fallbackEmission;
    } catch (calcError) {
      console.log(
        "IPCC calculation failed, using fallback:",
        calcError.message
      );
      emission = fallbackEmission;
      calculation = {
        method: "fallback",
        source: "client",
        factors: {},
        error: calcError.message,
      };
    }

    // Ensure emission is always a positive number
    if (!emission || isNaN(emission) || emission < 0) {
      emission = fallbackEmission;
    }

    const FootprintLog = await getFootprintLogModel();
    const log = await FootprintLog.create({
      ...req.body,
      user: req.user._id,
      emission,
      calculation,
    });

    // Update user streak after successful log creation
    try {
      const User = await getUserModel();
      const user = await User.findById(req.user._id);
      if (user) {
        await user.updateStreak(new Date());
      }
    } catch (streakError) {
      console.error("Error updating streak:", streakError.message);
      // Don't fail the log creation if streak update fails
    }

    res.status(201).json({
      success: true,
      log: log.toObject(),
      calculation,
      emission,
    });
  } catch (err) {
    console.error("Error creating log:", err);
    res.status(400).json({ error: err.message });
  }
}

// Preview emissions calculation without saving to database
export async function previewEmissions(req, res) {
  try {
    let calculation, emission;

    // Always calculate fallback emission first
    const fallbackEmission = calculateFallbackEmission(req.body);

    // Try IPCC calculation but don't fail if it doesn't work
    try {
      calculation = await ipcc.calculateCarbonFootprint({ ...req.body });
      emission = calculation.calculated_kgCO2e || fallbackEmission;
    } catch (calcError) {
      console.log(
        "IPCC preview calculation failed, using fallback:",
        calcError.message
      );
      emission = fallbackEmission;
      calculation = {
        method: "fallback",
        source: "client",
        factors: {},
        error: calcError.message,
      };
    }

    // Ensure emission is always a positive number
    if (!emission || isNaN(emission) || emission < 0) {
      emission = fallbackEmission;
    }

    res.json({
      success: true,
      emission,
      calculation,
      preview: true,
      activityType: req.body.activityType,
      quantity: req.body.quantity,
    });
  } catch (err) {
    console.error("Error previewing emissions:", err);
    res.status(400).json({ error: err.message });
  }
}

// Get all logs for the authenticated user with advanced filtering
export async function getUserLogs(req, res) {
  try {
    const {
      activityType,
      category,
      tags,
      startDate,
      endDate,
      location,
      project,
      community,
    } = req.query;

    let query = { user: req.user._id };
    if (activityType) query.activityType = activityType;
    if (category) query.category = category;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (project) query.project = project;
    if (community) query.community = community;
    if (location) {
      if (location.country) query["location.country"] = location.country;
      if (location.city) query["location.city"] = location.city;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const FootprintLog = await getFootprintLogModel();
    const logs = await FootprintLog.find(query).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single log by ID
export async function getLogById(req, res) {
  try {
    const FootprintLog = await getFootprintLogModel();
    const log = await FootprintLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a log
export async function updateLog(req, res) {
  try {
    const FootprintLog = await getFootprintLogModel();
    const log = await FootprintLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Delete a log
export async function deleteLog(req, res) {
  try {
    const FootprintLog = await getFootprintLogModel();
    const log = await FootprintLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get total emissions for the user with optional filters
export async function getTotalEmissions(req, res) {
  try {
    const {
      activityType,
      category,
      tags,
      startDate,
      endDate,
      project,
      community,
    } = req.query;

    let match = { user: req.user._id };
    if (activityType) match.activityType = activityType;
    if (category) match.category = category;
    if (tags) match.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (project) match.project = project;
    if (community) match.community = community;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const FootprintLog = await getFootprintLogModel();
    const result = await FootprintLog.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$emission" } } },
    ]);
    const total = result[0]?.total || 0;

    // Calculate simple equivalents (you can expand this)
    const equivalents = {
      trees_planted: Math.round(total / 0.021), // ~21kg CO2 per tree per year
      car_miles_avoided: Math.round(total / 0.404), // ~0.404 kg CO2 per mile
      plastic_bottles_avoided: Math.round(total / 0.003), // ~3g CO2 per bottle
    };

    res.json({ total, equivalents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get emissions breakdown by activityType
export async function getEmissionsByActivityType(req, res) {
  try {
    const match = { user: req.user._id };
    const FootprintLog = await getFootprintLogModel();
    const result = await FootprintLog.aggregate([
      { $match: match },
      { $group: { _id: "$activityType", total: { $sum: "$emission" } } },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get emissions breakdown by category
export async function getEmissionsByCategory(req, res) {
  try {
    const match = { user: req.user._id };
    const FootprintLog = await getFootprintLogModel();
    const result = await FootprintLog.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$emission" } } },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
