import Joi from "joi";
import Company from "../models/Company.js";
import { generateToken } from "../utils/auth.js";
import mongoose from "mongoose";
import {
  COMPANY_FIELDS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../constants.js";

// Joi schema for validation
const companySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  country: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  logo: Joi.string().uri().allow("").optional(),
});

/**
 * Adds a new company to the database after validating the input data.
 * Generates a JWT token for the company.
 * @async
 * @param {Object} companyData - The data for the company being added, including request body.
 * @returns {Promise<Object>} An object containing the new company details and the JWT token.
 * @throws {Error} Throws an error if validation fails or saving to the database fails.
 */
export const addCompany = async (companyData) => {
  try {
    // Validate the company data
    const { error } = companySchema.validate(companyData.body);
    if (error) {
      return {
        validationError: true,
        message: error.details[0].message,
      };
    }

    // Save the new company
    const newCompany = new Company(companyData.body);
    try {
      await newCompany.save();
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_UPDATE_CLIENT, error);
      throw new Error(ERROR_MESSAGES.FAILED_TO_UPDATE_CLIENT);
    }

    // Generate JWT token
    let token;
    try {
      token = generateToken({ companyId: newCompany._id });
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TOKEN_GENERATION, error);
      throw new Error(ERROR_MESSAGES.FAILED_TOKEN_GENERATION);
    }

    return {
      message: SUCCESS_MESSAGES.COMPANY_ADDED_SUCCESSFULLY,
      company: newCompany,
      token: token,
    };
  } catch (error) {
    throw new Error(error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Retrieves the details of a specific company by its ID.
 * @async
 * @param {string} companyId - The ID of the company to retrieve.
 * @returns {Promise<Object>} The company details as an object.
 * @throws {Error} Throws an error if the company is not found.
 */
export const companyDetails = async (companyId) => {
  // Fetch company details from the database
  const company = await Company.findById(companyId);
  return company;
};

/**
 * Retrieves the details of a specific company by its ID.
 * @async
 * @param {string} companyId - The ID of the company to retrieve.
 * @returns {Promise<Object>} The company details as an object.
 * @throws {Error} Throws an error if the company is not found.
 */
export const getCompanyById = async (companyId) => {
  // Fetch company details from the database
  const company = await Company.findById(companyId);
  return company;
};

/**
 * Updates the details of a company in the database.
 * @async
 * @param {string} companyId - The ID of the company to update.
 * @param {Object} updatedData - The updated data for the company.
 * @returns {Promise<Object>} The updated company object.
 * @throws {Error} Throws an error if the ID format is invalid or the update fails.
 */
export const updateCompanyDetails = async (companyId, updatedData) => {
  const companyObjID = new mongoose.Types.ObjectId(companyId);

  if (!companyObjID) {
    throw new Error(ERROR_MESSAGES.INVALID_ID_FORMAT);
  }

  // Update company details in the database
  const updatedCompany = await Company.findByIdAndUpdate(
    { _id: companyObjID },
    updatedData,
    { new: true }
  );
  return updatedCompany;
};

/**
 * Retrieves a list of all companies from the database.
 * @async
 * @returns {Promise<Array>} A list of companies, each with selected fields.
 * @throws {Error} Throws an error if fetching companies fails.
 */
export const listCompanies = async () => {
  // Fetch all companies from the database
  const companies = await Company.find().select(
    `${COMPANY_FIELDS.NAME} ${COMPANY_FIELDS.COUNTRY} ${COMPANY_FIELDS.CITY} ${COMPANY_FIELDS.ADDRESS}`
  );
  return companies;
};
