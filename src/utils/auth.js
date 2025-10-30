import jwt from "jsonwebtoken";
import { DEV_ENV, SAME_SITE } from "../constants.js";

/**
 * Generate a JWT token with a dynamic payload and expiration.
 * @param {Object} payload - The payload to include in the token.
 * @param {string} expiresIn - The token expiration time (e.g., "1d").
 * @returns {string} - The generated JWT token.
 */
export const generateToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Set a cookie with the given name and value.
 * @param {Object} res - The response object.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie (e.g., a token).
 * @param {Object} options - Additional cookie options.
 */
export const setCookie = (res, name, value, options = {}) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === DEV_ENV.PRODUCTION,
    sameSite: SAME_SITE.LAX,
    maxAge: 24 * 60 * 60 * 1000,
    ...options, // Allow overriding default options
  });
};

/**
 * Clear a cookie by setting its value to an empty string and its maxAge to 0.
 * @param {Object} res - The response object.
 * @param {string} name - The name of the cookie to clear.
 */
export const clearCookie = (res, name) => {
  res.cookie(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === DEV_ENV.PRODUCTION,
    sameSite: SAME_SITE.LAX,
    maxAge: 0, // Immediately expire the cookie
  });
};
