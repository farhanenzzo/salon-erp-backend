import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TOKEN_EXPIRY,
  TOKENS,
} from "../constants.js";
import {
  addCompany,
  companyDetails,
  listCompanies,
  updateCompanyDetails,
  getCompanyById,
} from "../services/company.js";

/**
 * Adds a new company and sets an auth token in the response cookie.
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 */
export const addCompanyController = async (req, res) => {
  try {
    const result = await addCompany(req);
    if (result.validationError) {
      return res.status(400).json({ message: result.message });
    }

    // Set the company token in the response cookie
    res.cookie(TOKENS.AUTHTOKEN, result.token, {
      httpOnly: true, // Secure the cookie
      maxAge: TOKEN_EXPIRY, // 1 hour expiration time
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Retrieves the details of a company by its ID.
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 */
export const companyDetailsController = async (req, res) => {
  try {
    const { companyId } = req;
    const company = await companyDetails(companyId);
    res.status(200).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieves the details of a company by its ID from the URL parameters.
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 */
export const getCompanyByIdController = async (req, res) => {
  try {
    const { companyId } = req.params; // Extract companyId from URL parameters
    const company = await getCompanyById(companyId);

    if (!company) {
      return res.status(404).json({ message: ERROR_MESSAGES.COMPANY_NOT_FOUND });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Updates the details of a specific company.
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 */
export const updateCompanyData = async (req, res) => {
  try {
    const { companyId } = req;
    const { updateData } = req.body;

    const updatedCompany = await updateCompanyDetails(companyId, updateData);

    // If no company is found to update
    if (!updatedCompany) {
      return res.status(404).json({ message: ERROR_MESSAGES.COMPANY });
    }
    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.COMPANY_DETAILS_UPDATED,
      data: updatedCompany, // The updated company object
    });
  } catch (error) {
    // Return error message
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves a list of all companies.
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 */
export const listAllCompanies = async (req, res) => {
  try {
    const companies = await listCompanies();
    if (!companies) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }
    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.COMPANIES_LISTED_SUCCESSFULLY,
      data: companies,
    });
  } catch (error) {
    // Return error message
    return res.status(400).json;
  }
};
