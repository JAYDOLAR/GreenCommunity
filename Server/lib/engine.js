import units from './units.js';
import modifiers from './modifiers.js';

/**
 * Normalize your front-end activityType to engine {category, subtype}
 * You can expand this map as your UI grows.
 */
const UI_TO_ENGINE = {
    // Transportation
    'transport-car': { category: 'transportation', subtype: 'car_private' },
    'transport-bus': { category: 'transportation', subtype: 'bus' },
    'transport-train': { category: 'transportation', subtype: 'metro_subway' }, // use metro as proxy; replace with rail when you add a rail factor
    'transport-subway': { category: 'transportation', subtype: 'metro_subway' },
    'transport-taxi': { category: 'transportation', subtype: 'taxi_rideshare' },
    'transport-motorcycle': { category: 'transportation', subtype: 'motorcycle_two_wheeler' },
    'transport-flight': { category: 'transportation', subtype: 'flight' }, // we’ll pick short/long in code using distance
    'transport-ferry': { category: 'transportation', subtype: 'ferry' },  // not yet in factors.json — will fallback if absent
    'transport-bicycle': { category: 'transportation', subtype: 'bicycle' }, // treated as zero
    'transport-walking': { category: 'transportation', subtype: 'walking' }, // treated as zero

    // Energy
    'energy-electricity': { category: 'energy', subtype: 'electricity_grid' },
    'energy-gas': { category: 'energy', subtype: 'natural_gas' },
    'energy-heating-oil': { category: 'energy', subtype: 'heating_oil' },
    'energy-propane': { category: 'energy', subtype: 'propane_LPG' },
    'energy-coal': { category: 'energy', subtype: 'coal_generic' },
    'energy-wood': { category: 'energy', subtype: 'wood_burning' },

    // Food
    'food-beef': { category: 'food', subtype: 'beef' },
    'food-pork': { category: 'food', subtype: 'pork' },
    'food-chicken': { category: 'food', subtype: 'chicken' },
    'food-fish': { category: 'food', subtype: 'fish_seafood' },
    'food-dairy': { category: 'food', subtype: 'dairy_mixed' },
    'food-eggs': { category: 'food', subtype: 'eggs' },
    'food-rice': { category: 'food', subtype: 'rice' },
    'food-vegetables': { category: 'food', subtype: 'vegetables' },
    'food-fruits': { category: 'food', subtype: 'fruits' },

    // Waste
    'waste-general': { category: 'waste', subtype: 'municipal_solid_waste' },
    'waste-recycling': { category: 'waste', subtype: 'recycling_credit' },
    'waste-compost': { category: 'waste', subtype: 'composting' },

    // Water
    'water-usage': { category: 'water', subtype: 'treatment_pumping' },
    'water-shower': { category: 'water', subtype: 'shower' },
    'water-dishwasher': { category: 'water', subtype: 'treatment_pumping' }, // proxy by gallon per load in front-end
    'water-laundry': { category: 'water', subtype: 'treatment_pumping' },

    // Shopping
    'shopping-clothing': { category: 'shopping', subtype: 'clothing_item' },
    'shopping-electronics': { category: 'shopping', subtype: 'electronics_item' },
    'shopping-books': { category: 'shopping', subtype: 'books_media' },
    'shopping-furniture': { category: 'shopping', subtype: 'furniture_item' },
};

/**
 * Decide factor record & denominator unit for activity.
 * Handles the flight special case (short/long haul selection).
 */
function resolveFactorForActivity(activity, store) {
    const ui = UI_TO_ENGINE[activity.activityType];
    if (!ui) throw new Error(`Unknown activityType: ${activity.activityType}`);

    // Determine desired factor units based on category
    let desiredUnits;
    switch (ui.category) {
        case 'transportation':
            if (ui.subtype === 'flight') {
                // choose short/long by distance (km). Threshold ~3,700 km commonly used.
                const km = activity.units === 'miles' ? activity.quantity * 1.609344 : activity.quantity;
                const subtype = (km >= 3700) ? 'flight_longhaul_economy' : 'flight_shorthaul_economy';
                // return specific flight factor units (pkm)
                const fLong = store.resolve({ category: 'transportation', subtype: 'flight_longhaul_economy', desiredUnits: 'kgCO2e_per_pkm', region: 'Global' });
                const fShort = store.resolve({ category: 'transportation', subtype: 'flight_shorthaul_economy', desiredUnits: 'kgCO2e_per_pkm', region: 'Global' });
                const factor = (km >= 3700 ? fLong : fShort);
                if (!factor) throw new Error('Flight factor not found.');
                return { factor, denom: 'pkm', perPassenger: true, flightClassAware: true };
            }
            // Non-flight transport → per passenger mile in our factors (Delhi TERI set)
            desiredUnits = 'kgCO2_per_passenger_mile';
            // Try exact; fall back to nearest
            const factor = store.resolve({ category: 'transportation', subtype: ui.subtype, desiredUnits, region: 'IN_Delhi' }) ||
                store.resolve({ category: 'transportation', subtype: ui.subtype, desiredUnits, region: 'IN' });
            if (!factor && (ui.subtype === 'bicycle' || ui.subtype === 'walking')) {
                return { factor: { id: 'zero', units: desiredUnits, value: 0, source: 'Zero emissions' }, denom: 'passenger_mile', perPassenger: true };
            }
            if (!factor) throw new Error(`Transport factor not found for ${ui.subtype}`);
            return { factor, denom: 'passenger_mile', perPassenger: true };

        case 'energy': {
            // Pull factor with native units from the file
            const candidates = store.resolve({ category: 'energy', subtype: ui.subtype, desiredUnits: undefined, region: activity.region || 'IN' })
                || store.resolve({ category: 'energy', subtype: ui.subtype, desiredUnits: undefined, region: 'Global' });
            if (!candidates) throw new Error(`Energy factor not found for ${ui.subtype}`);
            return { factor: candidates, denom: units.denominatorUnit(candidates.units), perPassenger: false };
        }

        case 'food': {
            const f = store.resolve({ category: 'food', subtype: ui.subtype, desiredUnits: 'kgCO2e_per_lb', region: 'Global' });
            if (!f) throw new Error(`Food factor not found for ${ui.subtype}`);
            return { factor: f, denom: 'lb', perPassenger: false };
        }

        case 'waste': {
            const wantUnits = (ui.subtype === 'recycling_credit' || ui.subtype === 'composting')
                ? 'kgCO2e_per_kg' : 'kgCO2e_per_kg';
            const f = store.resolve({ category: 'waste', subtype: ui.subtype, desiredUnits: wantUnits, region: 'Default' }) ||
                store.resolve({ category: 'waste', subtype: ui.subtype, desiredUnits: wantUnits, region: 'IN' }) ||
                store.resolve({ category: 'waste', subtype: ui.subtype, desiredUnits: wantUnits, region: 'Global' });
            if (!f) throw new Error(`Waste factor not found for ${ui.subtype}`);
            return { factor: f, denom: 'kg', perPassenger: false };
        }

        case 'water': {
            if (ui.subtype === 'shower') {
                const f = store.resolve({ category: 'water', subtype: 'shower', desiredUnits: 'kgCO2e_per_minute', region: 'IN' });
                if (!f) throw new Error('Water shower factor not found');
                return { factor: f, denom: 'minute', perPassenger: false };
            }
            const f = store.resolve({ category: 'water', subtype: 'treatment_pumping', desiredUnits: 'kgCO2e_per_gallon', region: 'IN' });
            if (!f) throw new Error('Water treatment factor not found');
            return { factor: f, denom: 'gallon', perPassenger: false };
        }

        case 'shopping': {
            const f = store.resolve({ category: 'shopping', subtype: ui.subtype, desiredUnits: 'kgCO2e_per_item', region: 'Global' });
            if (!f) throw new Error(`Shopping factor not found for ${ui.subtype}`);
            return { factor: f, denom: 'item', perPassenger: false };
        }

        default:
            throw new Error(`Unsupported category: ${ui.category}`);
    }
}

/**
 * Compute emission for a single activity record.
 * activity shape (from your UI):
 * {
 *   activityType: 'transport-car',
 *   quantity: 100,
 *   units: 'miles',
 *   region: 'IN',
 *   passengers?: 2,
 *   fuelType?: 'petrol',
 *   flightClass?: 'economy',
 *   energySource?: 'grid',
 *   ...other modifiers...
 * }
 */
function calculate(activity, store, { debug = false } = {}) {
    if (!activity || typeof activity !== 'object') throw new Error('activity is required');
    if (typeof activity.quantity !== 'number' || activity.quantity < 0) throw new Error('quantity must be a non-negative number');

    // Resolve factor (and denominator)
    const { factor, denom, perPassenger, flightClassAware } = resolveFactorForActivity(activity, store);

    // Convert activity quantity to factor denominator
    let qty = activity.quantity;
    try {
        // Map UI units to denominator when they differ
        const map = {
            passenger_mile: 'miles', // for transport factors in passenger_mile
            pkm: 'km',
            kWh: 'kWh',
            kg: 'kg',
            gallon: 'gallons',
            minute: 'minutes',
            item: 'items',
            lb: 'lbs',
            therms: 'therms',
        };
        const actUnits = activity.units || map[denom] || denom;
        const targetUnits = map[denom] || denom;
        qty = units.toMatchUnit(qty, actUnits, targetUnits);
    } catch (e) {
        // If we can’t convert, fail loudly (better than silently wrong numbers)
        throw new Error(`Unit mismatch: activity has ${activity.units}, factor requires ${denom}`);
    }

    // If the factor is per passenger and user logged group vehicle-miles with passengers,
    // your UI is per-person distance, so do NOT divide. Only divide when factor is per VEHICLE-mile (we don’t use those here).
    if (!perPassenger && activity.passengers && activity.passengers > 0) {
        qty = qty / activity.passengers;
    }

    let emission = qty * factor.value;

    // Apply modifiers
    const { multiplier, note } = modifiers.multiplierFrom(activity);
    if (multiplier !== 1) emission *= multiplier;

    // Flight class (already included via multipliers.js if flightClass present)
    const notes = [];
    if (note) notes.push(`modifiers: ${note}`);
    if (flightClassAware && activity.flightClass) {
        notes.push(`flightClass applied`);
    }

    return {
        success: true,
        activityType: activity.activityType,
        input_quantity: activity.quantity,
        input_units: activity.units,
        standardized_quantity: qty,
        standardized_units: denom,
        factor: {
            id: factor.id || 'inline',
            value: factor.value,
            units: factor.units,
            source: factor.source,
            region: factor.region || null,
            vintage: factor.vintage || null,
        },
        calculated_kgCO2e: Math.round(emission * 1000) / 1000,
        notes,
    };
}

function calculateBatch(activities, store, { debug = false } = {}) {
    const results = activities.map(a => {
        try {
            return calculate(a, store, { debug });
        } catch (err) {
            return { success: false, error: err.message, activityType: a && a.activityType };
        }
    });
    const total = results.reduce((s, r) => s + (r.success ? r.calculated_kgCO2e : 0), 0);
    const byCategory = {};
    for (const r of results) {
        if (!r.success) continue;
        const cat = (UI_TO_ENGINE[r.activityType] || {}).category || 'unknown';
        byCategory[cat] = (byCategory[cat] || 0) + r.calculated_kgCO2e;
    }
    return {
        success: true,
        total_kgCO2e: Math.round(total * 1000) / 1000,
        byCategory,
        results,
    };
}

export default {
    calculate,
    calculateBatch,
    resolveFactorForActivity, // exported for tests
    UI_TO_ENGINE,
};
