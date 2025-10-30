import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { COMPANY_TOKEN_HEADER, ERROR_MESSAGES } from "../constants.js";

/**
 * Middleware to decode and validate the company token.
 * Extracts the company token from cookies or headers, verifies it,
 * and attaches the companyId to the request object.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.cookies - Cookies from the request.
 * @param {Object} req.headers - Headers from the request.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - Sends a response with an error message if the token is missing or invalid, otherwise proceeds to the next middleware.
 */
export const decodeCompanyToken = (req, res, next) => {
  const companyToken =
    req.cookies.companyToken ||
    req.headers[COMPANY_TOKEN_HEADER]?.split(" ")[1]; // Extract token from cookies or headers

  if (!companyToken) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.COMPANY_TOKEN_NOT_FOUND });
  }

  try {
    const decodedToken = jwt.verify(companyToken, process.env.JWT_SECRET); // Verify token
    req.companyId = new mongoose.Types.ObjectId(decodedToken.companyId); // Attach companyId to request
    next();
  } catch (err) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.INVALID_COMPANY_TOKEN });
  }
};
