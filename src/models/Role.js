import mongoose from "mongoose";
import { GENERAL_CONSTANTS, MODELS, ROLE_STATUS } from "../constants.js";

/**
 * @typedef {Object} Role
 * @property {string} roleName - The name of the role. Must be unique within the company.
 * @property {mongoose.Schema.Types.ObjectId} [createdBy] - The ID of the user who created the role.
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the role.
 * @property {Date} createdAt - The date and time when the role was created.
 * @property {string} status - The status of the role, either "ACTIVE" or "INACTIVE". Defaults to "ACTIVE".
 */

/**
 * Mongoose schema for the Role model.
 * @type {mongoose.Schema<Role>}
 */
const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [ROLE_STATUS.ACTIVE, ROLE_STATUS.INACTIVE],
    default: ROLE_STATUS.ACTIVE,
  },
  isTrashed: {
    type: Boolean,
    default: false,
  },
});

/**
 * Compound unique index for roleName and companyId.
 */
roleSchema.index(
  { roleName: GENERAL_CONSTANTS.ONE, companyId: GENERAL_CONSTANTS.ONE },
  { unique: true }
);

/**
 * Mongoose model for the Role schema.
 * @type {mongoose.Model<Role>}
 */
const Role = mongoose.model(MODELS.ROLE, roleSchema);

export default Role;
