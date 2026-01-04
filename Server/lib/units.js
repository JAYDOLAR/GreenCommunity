// src/engine/units.js
// Minimal, explicit conversions used by the engine.

const KM_PER_MI = 1.609344;
const LB_PER_KG = 2.20462262185;
const GAL_PER_LITER = 0.26417205236;
const LITER_PER_GAL = 1 / GAL_PER_LITER;

function toMatchUnit(value, from, to) {
    if (from === to) return value;

    // Distance
    if (from === 'miles' && to === 'km') return value * KM_PER_MI;
    if (from === 'km' && to === 'miles') return value / KM_PER_MI;

    // Mass
    if (from === 'kg' && to === 'lb') return value * LB_PER_KG;
    if (from === 'lb' && to === 'kg') return value / LB_PER_KG;

    // Volume
    if (from === 'gallons' && to === 'liters') return value * LITER_PER_GAL;
    if (from === 'liters' && to === 'gallons') return value * GAL_PER_LITER;

    // Energy
    if (from === 'kWh' && to === 'kWh') return value; // identity
    if (from === 'therms' && to === 'therms') return value;

    // Counts / durations
    if (from === 'minutes' && to === 'minutes') return value;
    if (from === 'loads' && to === 'loads') return value;
    if (from === 'items' && to === 'items') return value;
    if (from === 'dozen' && to === 'dozen') return value;

    // If we get here, we don’t convert implicitly
    throw new Error(`No conversion rule: ${from} -> ${to}`);
}

/**
 * Factor unit schemas are like:
 *  - "kgCO2_per_kWh"
 *  - "kgCO2e_per_kg"
 *  - "kgCO2_per_passenger_mile"
 *  - "kgCO2e_per_pkm"
 * We only care about the denominator unit (right of 'per_').
 */
function denominatorUnit(factorUnits) {
    if (!factorUnits || !factorUnits.includes('_per_')) return null;
    return factorUnits.split('_per_')[1]; // e.g., "kWh", "kg", "passenger_mile", "pkm"
}

export default {
    toMatchUnit,
    denominatorUnit,
    KM_PER_MI,
    LB_PER_KG,
    GAL_PER_LITER,
    LITER_PER_GAL,
};
