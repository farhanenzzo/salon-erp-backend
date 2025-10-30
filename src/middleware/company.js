import jwt from "jsonwebtoken";
import { AUTHORIZATION_SCHEME, ERROR_MESSAGES } from "../constants";

/**
 * Middleware to verify company authentication token.
 * Handles both cookies (for web) and Authorization header (for mobile).
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {void}
 *
 * @throws {Error} If the token is invalid or not found, an appropriate error response is sent.
 */
export const companyMiddleware = (req, res, next) => {
  let token;

  // Check for token in cookies (for web)
  if (req.cookies.companyToken) {
    // Changed from token to companyToken
    token = req.cookies.companyToken;
  }
  // Check for token in Authorization header (for mobile)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(AUTHORIZATION_SCHEME)
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log(ERROR_MESSAGES.COMPANY_TOKEN_NOT_FOUND, {
      cookies: req.cookies,
      authHeader: req.headers.authorization,
    });
    return res.status(401).json({
      message: ERROR_MESSAGES.COMPANY_TOKEN_NOT_FOUND,
      cookies: Object.keys(req.cookies),
      hasAuthHeader: !!req.headers.authorization,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.companyId) {
      return res.status(403).json({
        message: ERROR_MESSAGES.COMPANY_TOKEN_NOT_FOUND,
      });
    }

    req.companyId = decoded.companyId;
    next();
  } catch (error) {
    console.error(ERROR_MESSAGES.INVALID_COMPANY_TOKEN, error);
    return res.status(403).json({
      message: ERROR_MESSAGES.INVALID_COMPANY_TOKEN,
      error: error.message,
    });
  }
};
