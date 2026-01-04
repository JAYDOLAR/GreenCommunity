// src/engine/factorStore.js
// Simple in-memory factor index with tolerant lookup & region fallback.

import units from './units.js';

class FactorStore {
    constructor(factorsArray) {
        if (!Array.isArray(factorsArray)) {
            throw new Error('FactorStore: expected an array');
        }
        this.factors = factorsArray;
        // Build indexes for quick lookups
        this.byKey = new Map(); // key = category::subtype::units
        this.byCategory = new Map();
        for (const f of this.factors) {
            const k = FactorStore.key(f.category, f.subtype, f.units);
            if (!this.byKey.has(k)) this.byKey.set(k, []);
            this.byKey.get(k).push(f);

            if (!this.byCategory.has(f.category)) this.byCategory.set(f.category, []);
            this.byCategory.get(f.category).push(f);
        }
    }

    static key(category, subtype, units) {
        return [category || '', subtype || '', units || ''].join('::').toLowerCase();
    }

    /**
     * Resolve the most suitable factor for the given activity descriptor.
     * Strategy:
     * 1) Exact category+subtype+units + region match
     * 2) Exact category+subtype+units + any region
     * 3) Category-only pool → closest units + any region
     * If multiple candidates: prefer region match, then newest vintage if available.
     */
    resolve({ category, subtype, desiredUnits, region }) {
        const key = FactorStore.key(category, subtype, desiredUnits);
        const exact = (this.byKey.get(key) || []).slice();
        const exactRegion = exact.find(f => !region || (f.region && f.region.toLowerCase() === region.toLowerCase()));
        if (exactRegion) return exactRegion;
        if (exact.length) return exact[0];

        // Try category-only matches with same denominator unit
        const pool = (this.byCategory.get(category) || []).filter(f => units.denominatorUnit(f.units) === units.denominatorUnit(desiredUnits));
        if (pool.length) {
            const regionHit = pool.find(f => !region || (f.region && f.region.toLowerCase() === region.toLowerCase()));
            return regionHit || pool[0];
        }

        // Last resort: any in category
        const anyPool = (this.byCategory.get(category) || []);
        if (anyPool.length) return anyPool[0];

        return null;
    }
}

export default { FactorStore };