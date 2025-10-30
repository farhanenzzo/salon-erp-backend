import mongoose from "mongoose";
import { MODELS } from "../constants.js";

/**
 * @typedef {Object} Notification
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {string} type - The type of notification.
 * @property {Object} details - Additional details about the notification.
 * @property {string} message - The message content of the notification.
 * @property {Date} timestamp - The time the notification was created.
 * @property {boolean} isRead - Indicates whether the notification has been read.
 */

/**
 * Mongoose schema for the Notification model.
 * @type {mongoose.Schema<Notification>}
 */
const notificationSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY,
    required: true,
  },
  type: { type: String, required: true },
  details: { type: Object, default: {} },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

/**
 * Mongoose model for the Notification schema.
 * @type {mongoose.Model<Notification>}
 */
const Notification = mongoose.model(MODELS.NOTIFICATION, notificationSchema);

export default Notification;
