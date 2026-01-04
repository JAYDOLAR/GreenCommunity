
import engine from './engine.js';
import factorStore from './factorStore.js';
import units from './units.js';
import modifiers from './modifiers.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let store;
let emissionFactors;

// Load emission factors from JSON file
async function loadEmissionFactors() {
  if (!emissionFactors) {
    try {
      // Try to load JSON file using fs.readFileSync
      const jsonPath = join(__dirname, '../data/emissionFactors.json');
      const jsonData = readFileSync(jsonPath, 'utf8');
      emissionFactors = JSON.parse(jsonData);
      store = new factorStore.FactorStore(emissionFactors);
    } catch (error) {
      console.error('Failed to load emission factors:', error.message);
      // Fallback to empty factors if file doesn't exist
      emissionFactors = { factors: [] };
      store = new factorStore.FactorStore(emissionFactors);
    }
  }
  return store;
}

/**
 * Calculate carbon footprint for a single activity
 * @param {Object} activity - Activity descriptor from UI
 * @returns {Promise<Object>} - Calculation result
 */
export async function calculateCarbonFootprint(activity) {
  const store = await loadEmissionFactors();
  return engine.calculate(activity, store);
}

/**
 * Calculate carbon footprint for a batch of activities
 * @param {Array} activities - Array of activity descriptors
 * @returns {Promise<Object>} - Batch calculation result
 */
export async function calculateBatchCarbonFootprint(activities) {
  const store = await loadEmissionFactors();
  return engine.calculateBatch(activities, store);
}

export { loadEmissionFactors, units, modifiers };

