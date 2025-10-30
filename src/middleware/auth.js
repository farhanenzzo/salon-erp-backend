import { auth } from "../../firebaseAdmin.js";
import jwt from "jsonwebtoken";
import { ERROR_MESSAGES, ERRORS } from "../constants.js";

/**
 * Middleware to authenticate a user using Firebase or JWT tokens.
 * Checks for the token in cookies (web apps) or Authorization header (mobile apps),
 * validates it as either a Firebase ID token or a JWT token, and attaches the userId to the request object.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.cookies - Cookies from the request.
 * @param {Object} req.headers - Headers from the request, including Authorization.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - Sends an error response if the token is invalid or missing, otherwise proceeds to the next middleware.
 */
export const isAuthenticated = async (req, res, next) => {
  const token =
    req.cookies.authToken ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]); // For mobile (Bearer token format)

  const customerIdToken =
    req.cookies.customerIdToken || req.headers["x-customer-id"]; // Access the customerIdToken

  if (!token) {
    return res.status(401).json({ message: ERROR_MESSAGES.AUTH_TOKEN_MISSING });
  }

  try {
    // First, try verifying the token as a Firebase token
    try {
      const decodedToken = await auth.verifyIdToken(token);

      // Directly assign the customerIdToken if available
      if (customerIdToken) {
        req.customerId = customerIdToken; // Directly assign the customerId to the request object
      }

      req.userId = decodedToken.uid; // Firebase token will have `uid`
      return next(); // Proceed to the next middleware if Firebase token is valid
    } catch (firebaseError) {
      // If the token is not a valid Firebase token, proceed to check as normal JWT token
      // console.log(
      //   ERROR_MESSAGES.NOT_FIREBASE_TOKEN_CHECKING_JWT,
      //   firebaseError
      // );

      // Now check as a normal JWT
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Normal JWT verification
      req.userId = decodedToken.uid; // Your normal JWT will have `userId`

      if (customerIdToken) {
        req.customerId = customerIdToken; // Directly assign the customerId to the request object
      }

      return next(); // Proceed to the next middleware if JWT is valid
    }
  } catch (error) {
    return res
      .status(403)
      .json({ message: ERROR_MESSAGES.INAVALID_OR_EXPIRED_TOKEN });
  }
};

/**
 * Middleware to authenticate a user's role using a role token.
 * Verifies the role token from cookies, decodes it, and attaches the roleId to the request object.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.cookies - Cookies from the request, including role_token.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - Sends an error response if the role token is invalid or missing, otherwise proceeds to the next middleware.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get the role token from cookies
    const roleToken = req.cookies.role_token;
    if (!roleToken) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.ROLE_TOKEN_NOT_FOUND });
    }

    // Verify the role token and decode it
    const decodedRole = jwt.verify(roleToken, process.env.JWT_SECRET);

    // Extract the roleId from the decoded token
    const roleId = decodedRole.roleId;
    if (!roleId) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.ROLE_ID_NOT_FOUND_IN_TOKEN });
    }

    // Attach the roleId to the request object
    req.roleId = roleId;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // Return specific error messages
    if (error.name === ERRORS.JSON_WEB_TOKEN_ERROR) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.INVALID_ROLE_TOKEN });
    }

    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
