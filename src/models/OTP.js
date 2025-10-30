import mongoose from "mongoose";
import { MODELS } from "../constants.js";

const { Schema } = mongoose;

/**
 * @typedef {Object} OTP
 * @property {string} email - The email address associated with the OTP.
 * @property {string} otp - The one-time password.
 * @property {Date} createdAt - The creation timestamp of the OTP. Automatically set to the current date.
 *                               The document will expire 300 seconds (5 minutes) after creation.
 */

/**
 * Mongoose schema for the OTP model.
 * @type {mongoose.Schema<OTP>}
 */
const otpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

/**
 * Mongoose model for the OTP schema.
 * @type {mongoose.Model<OTP>}
 */
const OTP = mongoose.model(MODELS.OTP, otpSchema);

export default OTP;
