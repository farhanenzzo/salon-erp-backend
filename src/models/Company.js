import mongoose from "mongoose";
import { MODELS } from "../constants.js";

/**
 * @typedef {Object} Company
 * @property {string} name - Name of the company.
 * @property {Array<mongoose.Schema.Types.ObjectId>} users - Array of user IDs associated with the company.
 * @property {string} country - Country where the company is located.
 * @property {string} city - City where the company is located.
 * @property {string} address - Address of the company.
 */

/**
 * Mongoose schema for the Company model.
 * @type {mongoose.Schema<Company>}
 */
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.USER, // Make sure this matches your User model name
    },
  ],
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

/**
 * Mongoose model for the Company schema.
 * @type {mongoose.Model<Company>}
 */
const Company = mongoose.model(MODELS.COMPANY, companySchema);

export default Company;
