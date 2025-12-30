import { response } from "express";
import { auth } from "../../firebaseAdmin.js";
import { User } from "../models/User.js";
import Role from "../models/Role.js";
import RolePermission from "../models/RolePermission.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { generateToken, setCookie, clearCookie } from "../utils/auth.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Module from "../models/Module.js";
import { sendEmail } from "../services/email.js";
import {
  CLIENT_FIELDS,
  DEFAULT_PROFILE_IMAGE_URL,
  DEV_ENV,
  EMAIL_TEXT,
  ERROR_MESSAGES,
  ERRORS,
  GENERAL_CONSTANTS,
  SUCCESS_MESSAGES,
  TOKENS,
  USER,
  USER_FIELDS,
  USER_ROLES,
} from "../constants.js";
import { generateVerificationEmail } from "../utils/emailTemplates.js";
import Company from "../models/Company.js";
import { uploadImageToFirebase } from "../services/firebaseStorage.js";
import {
  generateNextClientId,
  generateNextUserId,
} from "../utils/idGenerator.js";
import { Client } from "../models/Client.js";
import { handleFirebaseError } from "../helpers/firebaseErrorHandler.js";

/**
 * @function setTokenCookie
 * @description Sets a token as an HTTP-only cookie after verifying its validity.
 *              If the token is invalid or verification fails, an error response is sent,
 *              and any existing token cookie is cleared.
 * @param {Object} req - The request object containing the token in the body.
 * @param {Object} res - The response object, with a default value set to `response`.
 * @returns {Object} JSON response indicating success or failure.
 *
 * @throws {Error} If token verification fails, returns a 401 status with an error message.
 */

export const setTokenCookie = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: ERROR_MESSAGES.TOKEN_IS_REQUIRED });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user || !user.company) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    const companyId = user.company;

    // Generate a JWT token with user info
    const authToken = generateToken({ uid, email, companyId });
    const companyToken = generateToken({ companyId });

    // Set cookies
    setCookie(res, TOKENS.AUTHTOKEN, authToken);
    setCookie(res, TOKENS.COMPANY_TOKEN, companyToken);

    res.status(200).json({ message: SUCCESS_MESSAGES.TOKEN_SET_SUCCESSFULLY });
  } catch (error) {
    console.error("Error verifying token:", error);
    clearCookie(res, TOKENS.AUTHTOKEN);
    clearCookie(res, TOKENS.COMPANY_TOKEN);
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN });
  }
};

/**
 * @function updatePassword
 * @description Updates the password for a user identified by their email address.
 *              Validates the existence of the user in Firebase before updating the password.
 * @param {Object} req - The request object containing the email and newPassword in the body.
 * @param {Object} res - The response object used to send back the status and result.
 * @returns {Object} JSON response indicating success or failure.
 *
 * @throws {Error} If the user is not found, returns a 404 status with an error message.
 *                 For other errors, returns a 500 status with a general failure message.
 */
export const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .send({ error: ERROR_MESSAGES.EMAIL_NEWPASS_REQUIRES });
  }

  try {
    // Verify the user exists in Firebase
    const user = await auth.getUserByEmail(email);

    // Update the user's password
    await auth.updateUser(user.uid, { password: newPassword });

    res.status(200).send({ message: SUCCESS_MESSAGES.PASSWORD_UPDATE_SUCCESS });
  } catch (error) {
    console.error("Error updating password:", error);
    if (error.code === ERRORS.USER_NOT_FOUND) {
      // Clear the cookie if the user is not found
      clearCookie(res, TOKENS.AUTHTOKEN);
      return res.status(404).send({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    } else {
      res.status(500).send({ error: "Failed to update password" });
    }
  }
};

/**
 * @function checkToken
 * @description Verifies the authenticity of a token stored in the cookies.
 *              If valid, it returns the user ID (uid) associated with the token.
 * @param {Object} req - The request object containing cookies.
 * @param {Object} res - The response object used to send back the status and result.
 * @returns {Object} JSON response containing the user ID (uid) if the token is valid,
 *                   or an error message if invalid or missing.
 *
 * @throws {Error} If the token is invalid or expired, returns a 401 status with an error message.
 *                 If no token is found, also returns a 401 status with a specific error message.
 */
export const checkToken = async (req, res = response) => {
  const token = req.cookies.authToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ message: ERROR_MESSAGES.NO_TOKEN_FOUND });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return res.status(200).json({ uid: decodedToken.uid });
  } catch (error) {
    console.error(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN, error);
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN });
  }
};

/**
 * @function signupUser
 * @description Handles the signup process for a new user, associating the user with a company and assigning roles.
 *              If it's the first user for the company, creates a 'superAdmin' role and assigns full permissions.
 * @param {Object} req - The request object containing user details in the body and companyToken in cookies.
 * @param {Object} res - The response object used to send the response status and messages.
 *
 * @throws {Error} Returns appropriate error messages for missing companyToken, invalid JWT, or database operation failures.
 *
 * @returns {Object} JSON response with success message upon successful user creation and association with the company.
 */
export const signupUser = async (req, res) => {
  const { name, firebaseUid, email, companyId, role } = req.body;

  if (!companyId) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.COMPANY_TOKEN_NOT_FOUND });
  }

  try {
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    // Count the number of users in the company
    const userCount = await User.countDocuments({ company: companyObjectId });

    const existingUser = await User.findOne({
      email,
      company: companyObjectId,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE });
    }

    // Find or create the 'SuperAdmin' role
    let superAdminRole = await Role.findOne({
      roleName: USER_ROLES.SUPERADMIN,
      companyId: companyObjectId,
    });

    if (!superAdminRole) {
      superAdminRole = new Role({
        roleName: USER_ROLES.SUPERADMIN,
        companyId: companyObjectId,
      });
      await superAdminRole.save();
    }

    // If this is the first user, assign SuperAdmin role
    let assignedRole = superAdminRole._id;

    if (userCount > 0) {
      // If users already exist, prevent another SuperAdmin from being created
      if (role === USER_ROLES.SUPERADMIN) {
        return res.status(400).json({
          message: ERROR_MESSAGES.SUPER_ADMIN_ALREADY_EXISTS,
        });
      }
      // Otherwise, use the provided role or a default role
      assignedRole = await Role.findOne({
        roleName: role || USER_ROLES.DEFAULT_USER,
        companyId: companyObjectId,
      });
    }

    const userId = await generateNextUserId(companyId);

    // Create new user with the assigned role
    const newUser = new User({
      name,
      firebaseUid,
      email,
      userId,
      role: assignedRole._id,
      company: companyObjectId,
    });

    await newUser.save();

    const company = await Company.findById(companyObjectId);
    company.users.push(newUser._id);
    await company.save();

    // Assign full permissions for SuperAdmin only if it's the first user
    if (userCount === 0) {
      const modules = await Module.find();
      for (const module of modules) {
        const existingPermission = await RolePermission.findOne({
          companyId: companyObjectId,
          role: superAdminRole._id,
          module: module._id,
        });

        if (!existingPermission) {
          const rolePermission = new RolePermission({
            role: superAdminRole._id,
            companyId: companyObjectId,
            module: module._id,
            canView: true,
            canEdit: true,
          });
          await rolePermission.save();
        }
      }
    }

    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.USER_CREATED_AND_LINKED_TO_COMPANY });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_CREATE_USER, error);
    res.status(500).json({ message: ERROR_MESSAGES.FAILED_TO_CREATE_USER });
  }
};

/**
 * Associates a user with a company in a mobile application context.
 *
 * @function mobileAssociateCompany
 * @param {Object} req - The request object.
 * @param {string} req.body.userId - The ID of the user to associate with the company.
 * @param {string} req.body.companyId - The ID of the company to associate the user with.
 * @param {Object} res - The response object.
 *
 * @description
 * This function updates a user by setting their company association using the company ID.
 * It also updates the company document to include the user in its list of associated users.
 *
 * @returns {Object} - A JSON response with a success message and the updated user object
 * on successful association, or an error message if the operation fails.
 *
 * @throws {Error} - Returns a 404 status if the user is not found.
 * Returns a 500 status if there is an error during the association process.
 */
export const mobileAssociateCompany = async (req, res) => {
  const { userId, companyId } = req.body;

  try {
    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { company: companyObjectId },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    const company = await Company.findById(companyObjectId);
    company.users.push(user._id);
    await company.save();

    res.status(200).json({ message: SUCCESS_MESSAGES.USER_CREATED, user });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_ASSOCIATE_USER_WITH_COMPANY, error);
    res
      .status(500)
      .json({ message: ERROR_MESSAGES.FAILED_TO_ASSOCIATE_USER_WITH_COMPANY });
  }
};

/**
 * Logs out the user by clearing authentication-related cookies.
 *
 * @function logoutUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @description
 * This function clears the authentication, role, and company tokens stored in cookies.
 * It sends a success response if the logout operation is successful or an error message if it fails.
 *
 * @returns {Object} - A JSON response with a success message if logout is successful,
 * or an error message if the operation fails.
 *
 * @throws {Error} - Returns a 500 status with an error message if there is an issue during the logout process.
 */
export const logoutUser = (req, res) => {
  try {
    clearCookie(res, TOKENS.AUTHTOKEN);
    clearCookie(res, TOKENS.ROLE_TOKEN);
    clearCookie(res, TOKENS.COMPANY_TOKEN);

    res.status(200).json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.ERROR_LOGGING_OUT });
  }
};

/**
 * Logs in a user by verifying their credentials, generating tokens, and setting them as cookies.
 *
 * @async
 * @function loginUser
 * @param {Object} req - The request object, containing the user's login details.
 * @param {string} req.body.email - The email of the user attempting to log in.
 * @param {Object} res - The response object.
 *
 * @description
 * This function validates the user's email, retrieves the user and associated company from the database,
 * generates authentication tokens for the user's company and role, and sets these tokens as cookies.
 * If the login is successful, a success response with the token and user details is returned.
 *
 * @returns {Object} - A JSON response containing the authentication token and user details on success,
 * or an error message on failure.
 *
 * @throws {Error} - Throws an error if the user is not found, not associated with a company,
 * or if an unexpected issue occurs during the login process.
 */
export const loginUser = async (req, res) => {
  const { email } = req.body;
  console.log("email in req", email);
  try {
    const user = await User.findOne({ email }).populate(USER_FIELDS.COMAPNY);
    console.log("user in login", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "No account found with this email. Please check your credentials.",
      });
    }

    if (!user.company) {
      throw new Error(ERROR_MESSAGES.USER_NOT_ASSOCIATED_WITH_A_COMPANY);
    }

    const companyId = user.company._id.toString();
    const roleId = user.role.toString();
    const customerId = user._id.toString();

    const token = generateToken({ companyId: companyId });
    const roleToken = generateToken({ roleId: roleId });
    const customerIdToken = generateToken({ customerId: customerId });

    console.log("customer id token in login", customerIdToken);

    const companyToken = token; // Using same token for company auth

    // Set cookies
    setCookie(res, TOKENS.COMPANY_TOKEN, companyToken);
    setCookie(res, TOKENS.ROLE_TOKEN, roleToken);
    setCookie(res, TOKENS.CUSTOMER_ID, customerIdToken);

    return res.status(200).json({
      success: true,
      token,
      roleToken, // Include role token in response
      companyToken, // Include company token in response
      user: {
        email: user.email,
        company: user.company.name,
        id: user._id,
        customId: user.userId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Retrieves a user by their Firebase UID.
 *
 * @async
 * @function getUserById
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The Firebase UID of the user to retrieve.
 * @param {Object} res - The response object.
 *
 * @description
 * This function fetches a user from the database using their Firebase UID.
 * If the UID is not provided, it returns a 400 Bad Request response.
 * If the user is not found, it returns a 404 Not Found response.
 * The user's role is populated and returned along with the user data.
 *
 * @returns {Object} - A JSON response containing the user details on success,
 * or an error message on failure.
 *
 * @throws {Error} - Throws an error if an unexpected issue occurs during the database query.
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: ERROR_MESSAGES.USER_ID_REQUIRED });
    }

    const user = await User.findOne({ firebaseUid: id }).populate(
      USER_FIELDS.ROLE,
      USER_FIELDS.ROLE_NAME
    );

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: ERROR_MESSAGES.ERROR_RETRIEVING_USER,
    });
  }
};

/**
 * Creates a new user and associates them with a company.
 *
 * @async
 * @function createUser
 * @param {Object} req - The request object.
 * @param {string} req.body.name - The name of the new user.
 * @param {string} req.body.email - The email of the new user.
 * @param {string} req.body.role - The role of the new user.
 * @param {string} req.companyId - The ID of the company to associate the user with.
 * @param {Object} res - The response object.
 *
 * @description
 * This function creates a new user with a generated password in Firebase, sends an email verification link,
 * and saves the user in the database with a hashed password. The user is associated with the provided company ID.
 * If the company ID is missing, a 403 Forbidden response is returned.
 *
 * @returns {Object} - A JSON response indicating success or failure, including an email verification message on success.
 *
 * @throws {Error} - Throws an error if an issue occurs during Firebase user creation, password hashing, or database operations.
 */
export const createUser = async (req, res) => {
  const { name, email, role } = req.body;
  const { companyId } = req;

  try {
    if (!companyId) {
      return res
        .status(403)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    // Generate a random password for the new user
    const generatedPassword = crypto.randomBytes(8).toString("hex");

    // Create the user in Firebase
    const firebaseUser = await auth.createUser({
      email,
      password: generatedPassword,
      displayName: name,
      photoURL: DEFAULT_PROFILE_IMAGE_URL,
    });

    // Send the email verification link
    const emailVerificationLink = await auth.generateEmailVerificationLink(
      firebaseUser.email
    );

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const userId = await generateNextUserId(companyId);

    const newUser = new User({
      name,
      email,
      userId,
      password: hashedPassword,
      role,
      company: companyId,
      firebaseUid: firebaseUser.uid, // Store Firebase UID for reference
    });

    await newUser.save();

    const { subject, text, html } = generateVerificationEmail(
      name,
      emailVerificationLink,
      email,
      generatedPassword
    );

    await sendEmail(email, subject, text, html);

    return res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED_VERIFICATION_EMAIL_SEND,
    });
  } catch (error) {
    console.error("User creation error:", error);

    if (error.code?.startsWith("auth/")) {
      return res.status(400).json(handleFirebaseError(error));
    }

    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.USER_CREATION_FAILED,
    });
  }
};

/**
 * Retrieves all active users associated with a specific company.
 *
 * @async
 * @function getUsersByCompany
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The ID of the company provided via middleware.
 * @param {Object} res - The response object.
 *
 * @description
 * This function fetches all users associated with the provided company ID, excluding trashed users.
 * If the company ID is missing, a 400 Bad Request response is returned.
 * The retrieved users are populated with their associated roles for additional details.
 *
 * @returns {Object} - A JSON response containing an array of user objects or an error message.
 *
 * @throws {Error} - Throws an error if an issue occurs during database operations.
 */
export const getUsersByCompany = async (req, res) => {
  const { companyId } = req;

  if (!companyId) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.COMPANY_TOKEN_NOT_FOUND });
  }

  try {
    const users = await User.find({
      company: companyId,
      isTrashed: false,
    }).populate(USER_FIELDS.ROLE);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.FAILED_TO_FETCH_USERS });
  }
};

/**
 * Checks if a user is a super admin.
 *
 * @async
 * @function checkIfSuperAdmin
 * @param {Object} req - The request object.
 * @param {string} req.query.email - The email of the user sent as a query parameter.
 * @param {Object} res - The response object.
 *
 * @description
 * This function verifies whether a user with the given email has the role of "superAdmin".
 * If the user exists and their role is "superAdmin", it returns a success response with `isSuperAdmin: true`.
 * Otherwise, it returns `isSuperAdmin: false`.
 * Handles errors during the process and provides appropriate error responses.
 *
 * @returns {Object} - A JSON response indicating whether the user is a super admin or an error message.
 *
 * @throws {Error} - Throws an error if an issue occurs during database operations.
 */
export const checkIfSuperAdmin = async (req, res) => {
  const { email } = req.query; // Assuming the email is sent as a query parameter

  try {
    const user = await User.findOne({ email }).populate(USER_FIELDS.ROLE);

    // If the user is not found, return false
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (user.role && user.role.roleName === USER_ROLES.SUPERADMIN) {
      // Assuming role has a `name` field
      return res.json({ success: true, isSuperAdmin: true });
    }

    // If not a super admin, return false
    return res.json({ success: true, isSuperAdmin: false });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Trashes a user by marking them as trashed in the database and deleting them from Firebase Auth.
 *
 * @async
 * @function trashUser
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the user to be trashed, passed as a route parameter.
 * @param {Object} res - The response object.
 *
 * @description
 * This function finds a user by their ID, updates their `isTrashed` field to `true` in the database,
 * and deletes the user's record from Firebase Authentication using their `firebaseUid`.
 * It handles errors during the process and provides appropriate responses for success or failure scenarios.
 *
 * @returns {Object} - A JSON response indicating the success or failure of the operation.
 *
 * @throws {Error} - Throws an error if an issue occurs during database or Firebase operations.
 */
export const trashUser = async (req, res) => {
  const { id } = req.params; // Assuming userId is passed as a route paramete
  const { companyId } = req;
  console.log("copany id i req", companyId);

  console.log("id in params", id);

  try {
    // Find the user in the database
    const user = await User.findOne({
      _id: id,
      company: companyId,
      isTrashed: false,
    });

    console.log("user in trashing", user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // Update the user's isTrashed field in the database
    user.isTrashed = true;
    await user.save();

    // Delete the user from Firebase Auth
    await auth.deleteUser(user.firebaseUid); // Assuming `firebaseUid` is stored in your database

    return res.status(200).json({
      success: true,
      message: `${USER} ${user.name} ${SUCCESS_MESSAGES.USER_TRASHED_AND_REMOVED_FROM_FIREBASE}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.ERROR_TRASHING_USER,
      error: error.message,
    });
  }
};

/**
 * Updates the profile of a user, including their username, email, and profile image.
 *
 * @async
 * @function updateProfile
 * @param {Object} req - The request object.
 * @param {string} req.params.userId - The Firebase UID of the user, passed as a URL parameter.
 * @param {Object} req.body - The body of the request containing updated profile details.
 * @param {string} [req.body.username] - The new username for the user.
 * @param {string} [req.body.email] - The new email for the user.
 * @param {string} [req.body.userProfile] - The existing or new profile image URL (optional).
 * @param {Object} [req.file] - The uploaded image file (if provided).
 * @param {Object} res - The response object.
 *
 * @description
 * This function allows a user to update their profile, including their username, email,
 * and profile image. If an image file is uploaded, it is processed and stored in Azure Blob Storage.
 * If no image is uploaded, the existing profile image is retained.
 *
 * @returns {Object} - A JSON response with the updated user data on success, or an error message on failure.
 *
 * @throws {Error} - Throws an error if the user is not found, the image upload fails, or there are database issues.
 */

export const updateProfile = async (req, res) => {
  const { userId } = req.params; // This is the firebaseUid
  const {
    firstName,
    lastName,
    email,
    phone,
    gender,
    dob,
    notes,
    address
  } = req.body;

  let profileIMG = null;
  if (req.file) {
    try {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      profileIMG = await uploadImageToFirebase(req.file.buffer, fileName);
    } catch (error) {
      return res.status(500).json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
    }
  }

  try {
    // 1. Check User table first (for Admin/Staff)
    let user = await User.findOne({ firebaseUid: userId });

    // 2. If not found, check Client table
    if (!user) {
      user = await Client.findOne({ firebaseUid: userId });
    }

    if (!user) {
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // Update common fields
    if (firstName || lastName) {
      const currentName = user.name || "";
      const [fName, ...lNames] = currentName.split(" ");
      user.name = `${firstName || fName} ${lastName || lNames.join(" ")}`.trim();
    }

    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;

    // Client-specific fields (Will only save if they exist on the model instance)
    if (dob) user.dob = dob;
    if (notes) user.notes = notes;
    if (address) user.address = address;

    // Handle photo mapping (Client uses 'photo', User might use 'userProfile')
    const finalPhoto = profileIMG || req.body.photo || req.body.userProfile;
    if (finalPhoto) {
      if ('photo' in user.schema.paths) user.photo = finalPhoto;
      if ('userProfile' in user.schema.paths) user.userProfile = finalPhoto;
    }

    await user.save();

    res.status(200).json({
      message: SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
      updatedUser: user,
    });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_UPDATING_PROFILE });
  }
};

/**
 * @function mobileSignupUser
 * @description Handles the signup process for mobile users, creating a new user with default role and associating the user with a company.
 * @param {Object} req - The request object containing the user's name, email, firebaseUid, and companyId in the body.
 * @param {Object} res - The response object used to send the response status and messages.
 *
 * @throws {Error} Returns appropriate error messages for missing required fields or database operation failures.
 *
 * @returns {Object} JSON response with success message and the created user's details upon successful signup.
 */

export const mobileSignupUser = async (req, res) => {
  const { firstName, lastName, phone, firebaseUid } = req.body;

  console.log("req body in mobile signup", req.body);

  try {
    // Validate required fields
    if (!firstName || !lastName || !phone || !firebaseUid) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.ALL_FIELDS_REQUIRED });
    }

    // Check if the phone number is already in use
    const existingClient = await Client.findOne({ phone });
    if (existingClient) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.PHONE_ALREADY_IN_USE });
    }

    // Check if the 'USER' role already exists in the database
    let role = await Role.findOne({
      roleName: USER_ROLES.USER,
      companyId: null,
    });

    console.log("role in roleess", role);

    if (!role) {
      // If the role doesn't exist, create a new one
      const newRole = new Role({
        roleName: USER_ROLES.USER,
        companyId: null,
      });

      await newRole.save();
      role = newRole; // Assign the newly created role to the user
    }

    // Generate the next user ID
    const clientId = await generateNextClientId();

    // Create a new ObjectId for both User and Client (same ObjectId)
    const sharedObjectId = new mongoose.Types.ObjectId(); // Generate a shared ObjectId

    // Create the client (use the same _id)
    const clientFullName = `${firstName} ${lastName}`;

    let photoToUse = "";

    // Check if a file was uploaded for the client profile
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        photoToUse = await uploadImageToBlob(req.file.buffer, fileName); // Upload and get the URL
      } catch (error) {
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    }

    const newClient = new Client({
      _id: sharedObjectId, // Use the same ObjectId as the User
      name: clientFullName,
      photo: photoToUse || DEFAULT_PROFILE_IMAGE_URL,
      clientId,
      firebaseUid,
      phone,
      role: role._id, // Map the role ID here
    });

    console.log("new newClient", newClient);

    // Save the client to the database
    await newClient.save();

    // Respond with success and return both the user and client details
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
      client: newClient,
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_CREATE_USER, error);
    res.status(500).json({ message: ERROR_MESSAGES.FAILED_TO_CREATE_USER });
  }
};

export const loginMobileUser = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await Client.findOne({ phone }).populate("role");

    console.log("user in login", user);

    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const roleId = user.role ? user.role.toString() : null;
    const customerId = user._id.toString();

    const roleToken = generateToken({ roleId: roleId });
    const customerIdToken = generateToken({ customerId: customerId });

    // Set cookies
    setCookie(res, TOKENS.ROLE_TOKEN, roleToken);
    setCookie(res, TOKENS.CUSTOMER_ID, customerIdToken);

    console.log("user custom id", user.clientId);

    return res.status(200).json({
      success: true,
      roleToken, // Include role token in response
      user: {
        email: user.email,
        id: user._id,
        customId: user.clientId,
        mobile: user.phone,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.log("Error in mobile login", error);
    return res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
