import { CLOCK, ERROR_MESSAGES } from "../constants.js";

/**
 * Parses a duration string (e.g., "30 mins", "1 hour") and converts it into minutes.
 * @param {string} duration - Duration string to be parsed.
 * @returns {number} - Duration in minutes.
 * @throws {Error} - Throws if the format is invalid or unsupported.
 */
const parseDurationToMinutes = (duration) => {
  const match = duration.match(
    /^(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hour|h|m)$/i
  );
  if (!match) {
    throw new Error(ERROR_MESSAGES.INVALID_DURATION_FORMAT);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith(CLOCK.MINUTE)) return value; // Matches 'minutes' or 'mins'
  if (unit.startsWith(CLOCK.HOUR) || unit.startsWith("h")) return value * 60; // Matches 'hours', 'hour', or 'h'

  throw new Error(ERROR_MESSAGES.UNSUPPORTED_DURATION_UNIT);
};

export default parseDurationToMinutes;
