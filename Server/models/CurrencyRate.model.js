import mongoose from 'mongoose';
import { getConnection, DB_NAMES } from '../config/databases.js';

const currencyRateSchema = new mongoose.Schema({
  // Base currency (always USD for consistency)
  baseCurrency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  
  // Target currency
  currency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  
  // Exchange rate (1 USD = X target currency)
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Currency details
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Formatting
  decimalPlaces: {
    type: Number,
    default: 2
  },
  symbolPosition: {
    type: String,
    enum: ['before', 'after'],
    default: 'before'
  },
  thousandsSeparator: {
    type: String,
    default: ','
  },
  decimalSeparator: {
    type: String,
    default: '.'
  },
  
  // Source and timing
  source: {
    type: String,
    default: 'manual',
    enum: ['manual', 'api', 'bank']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Flags
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  
  // Historical rates (for trend analysis)
  history: [{
    rate: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  collection: 'currency_rates'
});

// Indexes
currencyRateSchema.index({ currency: 1 }, { unique: true });
currencyRateSchema.index({ isActive: 1 });

// Static method to get rate
currencyRateSchema.statics.getRate = async function(currency) {
  const rate = await this.findOne({ 
    currency: currency.toUpperCase(), 
    isActive: true 
  });
  
  if (!rate) {
    // Return default USD rate if not found
    if (currency.toUpperCase() === 'USD') {
      return { rate: 1, symbol: '$', currency: 'USD' };
    }
    throw new Error(`Currency not found: ${currency}`);
  }
  
  return rate;
};

// Static method to convert amount
currencyRateSchema.statics.convert = async function(amount, fromCurrency, toCurrency) {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount;
  }
  
  // Get both rates
  const [fromRate, toRate] = await Promise.all([
    this.getRate(fromCurrency),
    this.getRate(toCurrency)
  ]);
  
  // Convert via USD as base
  const usdAmount = amount / fromRate.rate;
  return usdAmount * toRate.rate;
};

// Static method to get all active currencies
currencyRateSchema.statics.getAllRates = async function() {
  return await this.find({ isActive: true })
    .select('currency rate symbol name symbolPosition decimalPlaces')
    .sort({ currency: 1 });
};

// Static method to format currency
currencyRateSchema.statics.format = async function(amount, currency) {
  const rate = await this.getRate(currency);
  
  const formatted = amount.toFixed(rate.decimalPlaces);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, rate.thousandsSeparator);
  const finalAmount = parts.join(rate.decimalSeparator);
  
  return rate.symbolPosition === 'before' 
    ? `${rate.symbol}${finalAmount}`
    : `${finalAmount}${rate.symbol}`;
};

// Static method to seed default currencies
currencyRateSchema.statics.seedDefaults = async function() {
  const defaults = [
    { currency: 'USD', rate: 1, symbol: '$', name: 'US Dollar', isDefault: true },
    { currency: 'EUR', rate: 0.92, symbol: '€', name: 'Euro' },
    { currency: 'GBP', rate: 0.79, symbol: '£', name: 'British Pound' },
    { currency: 'INR', rate: 83.5, symbol: '₹', name: 'Indian Rupee', symbolPosition: 'before', decimalPlaces: 0 },
    { currency: 'CAD', rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
    { currency: 'AUD', rate: 1.53, symbol: 'A$', name: 'Australian Dollar' },
    { currency: 'JPY', rate: 149.5, symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
    { currency: 'CNY', rate: 7.24, symbol: '¥', name: 'Chinese Yuan' },
    { currency: 'CHF', rate: 0.88, symbol: 'CHF', name: 'Swiss Franc' },
    { currency: 'SGD', rate: 1.34, symbol: 'S$', name: 'Singapore Dollar' },
    { currency: 'AED', rate: 3.67, symbol: 'AED', name: 'UAE Dirham', symbolPosition: 'after' },
    { currency: 'BRL', rate: 4.97, symbol: 'R$', name: 'Brazilian Real' },
    { currency: 'MXN', rate: 17.15, symbol: 'MX$', name: 'Mexican Peso' },
    { currency: 'KRW', rate: 1330, symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
    { currency: 'ZAR', rate: 18.5, symbol: 'R', name: 'South African Rand' }
  ];
  
  for (const currency of defaults) {
    await this.findOneAndUpdate(
      { currency: currency.currency },
      { ...currency, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
  }
  
  return defaults.length;
};

// Update rate with history tracking
currencyRateSchema.methods.updateRate = async function(newRate, source = 'manual') {
  // Add current rate to history
  this.history.push({
    rate: this.rate,
    date: this.lastUpdated
  });
  
  // Keep only last 30 days of history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.history = this.history.filter(h => h.date > thirtyDaysAgo);
  
  // Update rate
  this.rate = newRate;
  this.source = source;
  this.lastUpdated = new Date();
  
  await this.save();
  return this;
};

let CurrencyRate = null;

export const getCurrencyRateModel = async () => {
  if (CurrencyRate) return CurrencyRate;
  
  const conn = await getConnection(DB_NAMES.MAIN_DB);
  CurrencyRate = conn.models.CurrencyRate || 
    conn.model('CurrencyRate', currencyRateSchema);
  return CurrencyRate;
};

export default currencyRateSchema;
