import mongoose from "mongoose";
import { MODELS } from "../constants";

/**
 * @typedef {Object} Image
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the company.
 * @property {string} imageUrl - URL of the uploaded image.
 * @property {Date} uploadedAt - Date when the image was uploaded.
 * @property {Date} createdAt - Timestamp when the document was created (added by timestamps).
 * @property {Date} updatedAt - Timestamp when the document was last updated (added by timestamps).
 */

/**
 * Mongoose schema for the Image model.
 * @type {mongoose.Schema<Image>}
 */
const imageSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming companyId is an ObjectId in MongoDB
      required: true,
      ref: MODELS.COMPANY, // You can reference your Company model if necessary
    },
    imageUrl: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

/**
 * Mongoose model for the Image schema.
 * @type {mongoose.Model<Image>}
 */
const Image = mongoose.model(MODELS.IMAGE, imageSchema);

export default Image;
