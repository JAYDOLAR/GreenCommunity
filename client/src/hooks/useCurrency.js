"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { siteConfigAPI } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";

/**
 * Custom hook for currency management
 * Provides currency conversion, formatting, and rate data
 */
export function useCurrency() {
  const { preferences } = usePreferences();
  const [currencyRates, setCurrencyRates] = useState([]);
  const [ratesMap, setRatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User's preferred currency (uppercase) - always INR
  const userCurrency = useMemo(() => {
    return "INR";
  }, []);

  // Fetch all currency rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await siteConfigAPI.getCurrencyRates();
        if (response.success && response.data) {
          setCurrencyRates(response.data);
          
          // Create a map for quick lookup
          const map = {};
          response.data.forEach((rate) => {
            map[rate.currency] = rate;
          });
          // Ensure INR is always in the map
          if (!map["INR"]) {
            map["INR"] = { currency: "INR", rate: 83.5, symbol: "₹", name: "Indian Rupee", decimalPlaces: 0 };
          }
          setRatesMap(map);
        }
      } catch (err) {
        console.error("Error fetching currency rates:", err);
        setError(err.message);
        // Set default rate on error - INR only
        setRatesMap({
          INR: { currency: "INR", rate: 83.5, symbol: "₹", name: "Indian Rupee", decimalPlaces: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code (e.g., 'USD', 'INR')
   * @param {string} toCurrency - Target currency code (defaults to user preference)
   * @returns {number} Converted amount
   */
  const convert = useCallback(
    (amount, fromCurrency, toCurrency = userCurrency) => {
      if (!amount || isNaN(amount)) return 0;
      
      const from = fromCurrency?.toUpperCase() || "INR";
      const to = toCurrency?.toUpperCase() || "INR";
      
      if (from === to) return amount;
      
      const fromRate = ratesMap[from]?.rate || 1;
      const toRate = ratesMap[to]?.rate || 1;
      
      // Convert via USD as base
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    },
    [ratesMap, userCurrency]
  );

  /**
   * Format amount in user's preferred currency
   * @param {number} amount - Amount to format
   * @param {string} fromCurrency - Source currency (defaults to USD)
   * @param {object} options - Formatting options
   * @returns {string} Formatted currency string
   */
  const formatPrice = useCallback(
    (amount, fromCurrency = "INR", options = {}) => {
      const { showSymbol = true, convertToUserCurrency = true } = options;
      
      const targetCurrency = convertToUserCurrency ? userCurrency : fromCurrency.toUpperCase();
      const convertedAmount = convertToUserCurrency 
        ? convert(amount, fromCurrency, targetCurrency)
        : amount;
      
      const rateInfo = ratesMap[targetCurrency] || ratesMap["INR"] || { symbol: "₹", decimalPlaces: 0 };
      const symbol = rateInfo.symbol || "₹";
      const decimals = rateInfo.decimalPlaces ?? 2;
      const symbolPosition = rateInfo.symbolPosition || "before";
      
      const formatted = convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      
      if (!showSymbol) return formatted;
      
      return symbolPosition === "after" 
        ? `${formatted} ${symbol}` 
        : `${symbol}${formatted}`;
    },
    [convert, ratesMap, userCurrency]
  );

  /**
   * Get symbol for a currency
   * @param {string} currency - Currency code
   * @returns {string} Currency symbol
   */
  const getSymbol = useCallback(
    (currency = userCurrency) => {
      const curr = currency?.toUpperCase() || "INR";
      return ratesMap[curr]?.symbol || "₹";
    },
    [ratesMap, userCurrency]
  );

  /**
   * Get current user's currency info
   */
  const currentCurrency = useMemo(() => {
    return ratesMap[userCurrency] || { currency: "INR", symbol: "₹", rate: 83.5, decimalPlaces: 0 };
  }, [ratesMap, userCurrency]);

  return {
    // State
    loading,
    error,
    currencyRates,
    ratesMap,
    userCurrency,
    currentCurrency,
    
    // Functions
    convert,
    formatPrice,
    getSymbol,
  };
}

export default useCurrency;
