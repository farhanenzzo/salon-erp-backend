import mongoose from "mongoose";
import { CATEGORY_STATUS, MODELS } from "../constants.js";

/**
 * @typedef {Object} Category
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the User model who created the category.
 * @property {string} name - The name of the category.
 * @property {string} [image] - The URL of the category image.
 * @property {mongoose.Schema.Types.ObjectId[]} services - Array of references to the Services model.
 * @property {Date} createdAt - The date when the category was created.
 * @property {string} status - The status of the category, either active or inactive.
 * @property {boolean} isTrashed - Whether the category is marked as trashed.
 */

/**
 * Mongoose schema for the Category model.
 * @type {mongoose.Schema<Category>}
 */
const categorySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY, // Reference to the Company model
      required: true, // Ensure this is always set
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.USER,
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.SERVICES }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.USER, // Reference to the User model
      required: false,
    },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: [CATEGORY_STATUS.ACTIVE, CATEGORY_STATUS.INACTIVE],
      default: CATEGORY_STATUS.ACTIVE,
    },
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Mongoose model for the Category schema.
 * @type {mongoose.Model<Category>}
 */
const Category = mongoose.model(MODELS.CATEGORY, categorySchema);

export default Category;
