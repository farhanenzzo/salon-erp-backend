import mongoose from "mongoose";
import { MODELS } from "../constants.js";

/**
 * @typedef {Object} Module
 * @property {string} moduleName - The name of the module. Must be unique.
 * @property {Date} createdAt - The date when the module was created.
 */

/**
 * Mongoose schema for the Module model.
 * @type {mongoose.Schema<Module>}
 */
const moduleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
});

/**
 * Mongoose model for the Module schema.
 * @type {mongoose.Model<Module>}
 */
export default mongoose.model(MODELS.MODULE, moduleSchema);
