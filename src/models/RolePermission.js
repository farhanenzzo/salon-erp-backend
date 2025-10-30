import mongoose from "mongoose";
import { MODELS } from "../constants.js";

/**
 * @typedef {Object} RolePermission
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the role permission.
 * @property {mongoose.Schema.Types.ObjectId} role - The ID of the role associated with the permission.
 * @property {mongoose.Schema.Types.ObjectId} module - The ID of the module associated with the permission.
 * @property {boolean} canView - Indicates whether the role has view access to the module. Defaults to false.
 * @property {boolean} canEdit - Indicates whether the role has edit access to the module. Defaults to false.
 */

/**
 * Mongoose schema for the RolePermission model.
 * @type {mongoose.Schema<RolePermission>}
 */
const rolePermissionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.ROLE,
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.MODULE,
    required: true,
  },
  canView: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
});

/**
 * Mongoose model for the RolePermission schema.
 * @type {mongoose.Model<RolePermission>}
 */
const RolePermission = mongoose.model(
  MODELS.ROLE_PERMISSION,
  rolePermissionSchema
);

export default RolePermission;
