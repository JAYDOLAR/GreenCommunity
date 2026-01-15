// Country Codes Configuration
// This file contains country calling codes for phone number formatting
// Can be extended with dynamic API fetching if needed

import { siteConfigAPI } from '@/lib/api';

// Cache for country codes from API
let countryCodesCache = null;
let countryCodesCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Default static country codes (fallback)
export const DEFAULT_COUNTRY_CODES = {
  // North America
  US: "+1",
  CA: "+1",
  MX: "+52",
  
  // Europe
  GB: "+44",
  DE: "+49",
  FR: "+33",
  IT: "+39",
  ES: "+34",
  NL: "+31",
  SE: "+46",
  NO: "+47",
  DK: "+45",
  FI: "+358",
  CH: "+41",
  AT: "+43",
  BE: "+32",
  IE: "+353",
  PT: "+351",
  GR: "+30",
  PL: "+48",
  CZ: "+420",
  HU: "+36",
  RO: "+40",
  BG: "+359",
  HR: "+385",
  SI: "+386",
  SK: "+421",
  LT: "+370",
  LV: "+371",
  EE: "+372",
  MT: "+356",
  CY: "+357",
  LU: "+352",
  IS: "+354",
  LI: "+423",
  MC: "+377",
  SM: "+378",
  VA: "+379",
  AD: "+376",
  AL: "+355",
  BA: "+387",
  ME: "+382",
  MK: "+389",
  RS: "+381",
  XK: "+383",
  TR: "+90",
  UA: "+380",
  BY: "+375",
  MD: "+373",
  RU: "+7",
  
  // Asia Pacific
  AU: "+61",
  NZ: "+64",
  JP: "+81",
  CN: "+86",
  IN: "+91",
  KR: "+82",
  TW: "+886",
  HK: "+852",
  SG: "+65",
  MY: "+60",
  TH: "+66",
  ID: "+62",
  PH: "+63",
  VN: "+84",
  PK: "+92",
  BD: "+880",
  LK: "+94",
  NP: "+977",
  MV: "+960",
  BT: "+975",
  MM: "+95",
  KH: "+855",
  LA: "+856",
  MN: "+976",
  
  // Middle East
  SA: "+966",
  AE: "+971",
  QA: "+974",
  BH: "+973",
  KW: "+965",
  OM: "+968",
  YE: "+967",
  IL: "+972",
  JO: "+962",
  LB: "+961",
  SY: "+963",
  IQ: "+964",
  IR: "+98",
  AF: "+93",
  PS: "+970",
  
  // Central Asia
  KZ: "+7",
  KG: "+996",
  TJ: "+992",
  TM: "+993",
  UZ: "+998",
  GE: "+995",
  AM: "+374",
  AZ: "+994",
  
  // South America
  BR: "+55",
  AR: "+54",
  CL: "+56",
  CO: "+57",
  PE: "+51",
  VE: "+58",
  EC: "+593",
  BO: "+591",
  PY: "+595",
  UY: "+598",
  
  // Africa
  EG: "+20",
  ZA: "+27",
  NG: "+234",
  KE: "+254",
  ET: "+251",
  GH: "+233",
  TZ: "+255",
  UG: "+256",
  RW: "+250",
  ZW: "+263",
  MA: "+212",
  DZ: "+213",
  TN: "+216",
  LY: "+218",
  SD: "+249",
  SS: "+211",
};

// Get country code by country abbreviation
export const getCountryCode = (countryAbbr) => {
  if (!countryAbbr) return "";
  return DEFAULT_COUNTRY_CODES[countryAbbr.toUpperCase()] || "";
};

// Get all country codes
export const getAllCountryCodes = () => {
  return DEFAULT_COUNTRY_CODES;
};

// Fetch country codes from API (for future dynamic support)
export const fetchCountryCodes = async () => {
  try {
    const now = Date.now();
    if (countryCodesCache && countryCodesCacheTime && (now - countryCodesCacheTime) < CACHE_DURATION) {
      return countryCodesCache;
    }
    
    // Try to fetch from API if endpoint exists
    try {
      const response = await siteConfigAPI.getGeneralConfig();
      if (response.success && response.config?.countryCodes) {
        countryCodesCache = response.config.countryCodes;
        countryCodesCacheTime = now;
        return countryCodesCache;
      }
    } catch {
      // API endpoint might not exist yet
    }
    
    return DEFAULT_COUNTRY_CODES;
  } catch (error) {
    console.warn('Failed to fetch country codes from API, using defaults:', error);
    return DEFAULT_COUNTRY_CODES;
  }
};

// Get country name by code (useful for display)
export const COUNTRY_NAMES = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  CN: "China",
  IN: "India",
  KR: "South Korea",
  BR: "Brazil",
  AR: "Argentina",
  ZA: "South Africa",
  EG: "Egypt",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  // Add more as needed
};

// Get country name by abbreviation
export const getCountryName = (countryAbbr) => {
  if (!countryAbbr) return "";
  return COUNTRY_NAMES[countryAbbr.toUpperCase()] || countryAbbr;
};

// Format phone number with country code
export const formatPhoneWithCountryCode = (phone, countryAbbr) => {
  const countryCode = getCountryCode(countryAbbr);
  if (!countryCode || !phone) return phone;
  
  // Remove any existing country code or leading zeros
  let cleanPhone = phone.replace(/^[\+0]+/, '').replace(/\s/g, '');
  
  return `${countryCode}${cleanPhone}`;
};

// Validate phone number format
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  // Remove spaces and special characters except +
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Check if it's a valid format (7-15 digits, optionally starting with +)
  return /^\+?[0-9]{7,15}$/.test(cleaned);
};
