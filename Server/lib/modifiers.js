// Centralized handling of your UI multipliers, so the engine stays declarative.

const DEFAULTS = {
    fuelTypes: {
        petrol: 1.0,
        diesel: 1.2,
        cng: 0.7,
        electric: 0.3,
        hybrid: 0.6,
    },
    flightClasses: {
        economy: 1.0,
        business: 2.5,
        first: 4.0,
    },
    energySources: {
        grid: 1.0,
        solar: 0.1,
        wind: 0.1,
        hydro: 0.2,
    },
    foodTypes: { // optional dietary modifiers
        beef: 1.5, pork: 1.0, chicken: 0.6, fish: 0.5,
        milk: 1.0, cheese: 1.2, yogurt: 0.8,
        'grass-fed': 1.2, organic: 0.9, local: 0.7,
    },
    wasteTypes: {
        general: 1.0, plastic: 1.2, paper: 0.8, glass: 0.6, metal: 0.5, organic: 1.1, electronics: 2.0,
    },
    waterTemperatures: {
        cold: 0.5, warm: 1.0, hot: 1.5,
    },
    clothingTypes: {
        't-shirt': 0.8, jeans: 2.0, dress: 1.5, jacket: 3.0, shoes: 1.8, underwear: 0.3,
        synthetic: 1.2, cotton: 1.0, wool: 1.8,
    },
    electronicsTypes: {
        smartphone: 0.8, laptop: 1.5, tablet: 0.6, tv: 2.0, appliance: 3.0, gaming: 1.2, camera: 0.9,
    },
    furnitureTypes: {
        chair: 0.8, table: 1.2, sofa: 2.0, bed: 1.8, dresser: 1.5, bookshelf: 1.0, desk: 1.1,
    },
};

function multiplierFrom(activity) {
    let m = 1.0;
    const notes = [];

    // Transport/energy sources/fuels/class
    if (activity.fuelType && DEFAULTS.fuelTypes[activity.fuelType]) {
        m *= DEFAULTS.fuelTypes[activity.fuelType];
        notes.push(`fuelType=${activity.fuelType} (x${DEFAULTS.fuelTypes[activity.fuelType]})`);
    }
    if (activity.flightClass && DEFAULTS.flightClasses[activity.flightClass]) {
        m *= DEFAULTS.flightClasses[activity.flightClass];
        notes.push(`flightClass=${activity.flightClass} (x${DEFAULTS.flightClasses[activity.flightClass]})`);
    }
    if (activity.energySource && DEFAULTS.energySources[activity.energySource]) {
        m *= DEFAULTS.energySources[activity.energySource];
        notes.push(`energySource=${activity.energySource} (x${DEFAULTS.energySources[activity.energySource]})`);
    }

    // Food & shopping & waste & water
    if (activity.foodType && DEFAULTS.foodTypes[activity.foodType]) {
        m *= DEFAULTS.foodTypes[activity.foodType];
        notes.push(`foodType=${activity.foodType} (x${DEFAULTS.foodTypes[activity.foodType]})`);
    }
    if (activity.wasteType && DEFAULTS.wasteTypes[activity.wasteType]) {
        m *= DEFAULTS.wasteTypes[activity.wasteType];
        notes.push(`wasteType=${activity.wasteType} (x${DEFAULTS.wasteTypes[activity.wasteType]})`);
    }
    if (activity.waterTemp && DEFAULTS.waterTemperatures[activity.waterTemp]) {
        m *= DEFAULTS.waterTemperatures[activity.waterTemp];
        notes.push(`waterTemp=${activity.waterTemp} (x${DEFAULTS.waterTemperatures[activity.waterTemp]})`);
    }
    if (activity.clothingType && DEFAULTS.clothingTypes[activity.clothingType]) {
        m *= DEFAULTS.clothingTypes[activity.clothingType];
        notes.push(`clothingType=${activity.clothingType} (x${DEFAULTS.clothingTypes[activity.clothingType]})`);
    }
    if (activity.electronicsType && DEFAULTS.electronicsTypes[activity.electronicsType]) {
        m *= DEFAULTS.electronicsTypes[activity.electronicsType];
        notes.push(`electronicsType=${activity.electronicsType} (x${DEFAULTS.electronicsTypes[activity.electronicsType]})`);
    }
    if (activity.furnitureType && DEFAULTS.furnitureTypes[activity.furnitureType]) {
        m *= DEFAULTS.furnitureTypes[activity.furnitureType];
        notes.push(`furnitureType=${activity.furnitureType} (x${DEFAULTS.furnitureTypes[activity.furnitureType]})`);
    }

    return { multiplier: m, note: notes.join(', ') };
}

export default { multiplierFrom, DEFAULTS };
