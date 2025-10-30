import { PRICE_FORMAT_OPTIONS } from "../constants";

/**
 * Formats a numeric amount into a price string with currency formatting.
 * @function formatPrice
 * @param {number} amount - The numeric amount to format.
 * @returns {string} The formatted price string.
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-US", PRICE_FORMAT_OPTIONS).format(amount);
};

/**
 * Cleans a price string by removing any non-numeric characters except for the decimal point.
 * @function cleanPrice
 * @param {string|number} price - The price value to clean.
 * @returns {number} The numeric representation of the cleaned price.
 */
export const cleanPrice = (price) => {
  return Number(String(price).replace(/[^0-9.]/g, ""));
};
