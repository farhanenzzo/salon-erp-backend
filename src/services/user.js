import { User } from "../models/User.js";
import { ERROR_MESSAGES } from "../constants.js";

/**
 * Retrieves the total count of active users across all companies.
 * @async
 * @returns {Promise<number>} The total count of active users.
 * @throws {Error} Throws an error if fetching the user count fails.
 */
export const getGlobalUserCount = async () => {
  try {
    const userCount = await User.countDocuments({ isTrashed: false });
    return userCount;
  } catch (error) {
    console.error("Error fetching global user count:", error);
    throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
