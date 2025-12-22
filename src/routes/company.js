import express from "express";
import {
  addCompanyController,
  companyDetailsController,
  listAllCompanies,
  updateCompanyData,
  getCompanyByIdController,
} from "../controllers/company.js";
import { isAuthenticated } from "../middleware/auth.js";
import { decodeCompanyToken } from "../middleware/decodeCompanyToken.js";
import { checkGrotechAdmin } from "../middleware/checkGrotechAdmin.js";
import { COMPANY_ROUTES } from "../constants.js";

const router = express.Router();

/**
 * Public route to add a company (no authentication required)
 * @route POST /api/company
 * @access Public
 */
router.post(COMPANY_ROUTES.ADD_COMPANY, addCompanyController);

/**
 * Protected route to get company details
 * @route GET /api/company
 * @access Private
 */
router.get(
  COMPANY_ROUTES.GET_COMPANY_DETAILS,
  isAuthenticated,
  decodeCompanyToken,
  companyDetailsController
);

/**
 * Protected route to update company data
 * @route PATCH /api/company
 * @access Private
 */
router.patch(
  COMPANY_ROUTES.UPDATE_COMPANY,
  isAuthenticated,
  decodeCompanyToken,
  updateCompanyData
);

/**
 * Public route to list all companies
 * @route GET /api/company/list
 * @access Public
 */
router.get(COMPANY_ROUTES.LIST_ALL_COMPANIES, checkGrotechAdmin, listAllCompanies);

/**
 * Public route to get company details by ID
 * @route GET /api/company/:companyId
 * @access Public
 */
router.get(COMPANY_ROUTES.GET_COMPANY_BY_ID, getCompanyByIdController);

export default router;
