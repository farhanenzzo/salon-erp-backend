import express from "express";
import {
  checkIfSuperAdmin,
  checkToken,
  createUser,
  getUserById,
  getUsersByCompany,
  loginMobileUser,
  loginUser,
  logoutUser,
  mobileAssociateCompany,
  mobileSignupUser,
  setTokenCookie,
  signupUser,
  trashUser,
  updatePassword,
  updateProfile,
} from "../controllers/auth.js";
import { isAuthenticated } from "../middleware/auth.js";
import { decodeCompanyToken } from "../middleware/decodeCompanyToken.js";
import upload from "../middleware/upload.js";
import { AUTH_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * @route POST /set-token
 * @description Set a token cookie for the user.
 */
router.post(AUTH_ROUTES.SET_TOKEN, setTokenCookie);

/**
 * @route POST /signup
 * @description Register a new user.
 */
router.post(AUTH_ROUTES.SIGNUP, signupUser);

/**
 * @route POST /mobile-signup
 * @description Register a new mobile user.
 */
router.post(AUTH_ROUTES.MOBILE_SIGNUP, mobileSignupUser);

/**
 * @route POST /associate-company
 * @description Associate a mobile user with a company.
 */
router.post(AUTH_ROUTES.ASSOCIATE_COMPANY, mobileAssociateCompany);

/**
 * @route POST /logout
 * @description Logout the user.
 */
router.post(AUTH_ROUTES.LOGOUT, logoutUser);

/**
 * @route POST /login
 * @description Authenticate and log in the user.
 */
router.post(AUTH_ROUTES.LOGIN, loginUser);

router.post(AUTH_ROUTES.LOGIN_MOBILE_USER, loginMobileUser);

/**
 * @route PATCH /user/trash/:id
 * @description Soft delete (trash) a user by their ID.
 */
router.patch(AUTH_ROUTES.TRASH_USER, decodeCompanyToken, trashUser);

/**
 * @route PATCH /update-password
 * @description Update the user's password.
 */
router.patch(AUTH_ROUTES.UPDATE_PASSWORD, updatePassword);

/**
 * @route GET /check-token
 * @description Verify the validity of the user's token.
 */
router.get(AUTH_ROUTES.CHECK_TOKEN, checkToken);

/**
 * @route GET /user/:id
 * @description Get user details by their ID.
 */
router.get(AUTH_ROUTES.GET_USER_BY_ID, getUserById);

/**
 * @route POST /users
 * @middleware decodeCompanyToken
 * @description Create a new user for a company.
 */
router.post(AUTH_ROUTES.CREATE_USER, decodeCompanyToken, createUser);

/**
 * @route GET /check-super-admin
 * @description Check if the current user is a super admin.
 */
router.get(AUTH_ROUTES.CHECK_SUPER_ADMIN, checkIfSuperAdmin);

/**
 * @route GET /users
 * @middleware isAuthenticated, decodeCompanyToken
 * @description Get all users for a company (accessible to super admin).
 */
router.get(
  AUTH_ROUTES.GET_USERS_BY_COMPANY,
  isAuthenticated,
  decodeCompanyToken,
  getUsersByCompany
);

/**
 * @route PATCH /user/:userId
 * @middleware upload, isAuthenticated, decodeCompanyToken
 * @description Update the profile of a user by their user ID.
 */
router.patch(
  AUTH_ROUTES.UPDATE_PROFILE,
  upload(UPLOAD_IMAGE_FIELD.USER_PROFILE),
  isAuthenticated,
  decodeCompanyToken,
  updateProfile
);

export default router;
