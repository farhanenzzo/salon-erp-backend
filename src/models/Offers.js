import mongoose from "mongoose";
import {
  MODELS,
  NOTIFICATION_STATUS,
  OFFER_TYPES,
  TARGET_AUDIENCE,
} from "../constants.js";

/**
 * @typedef {Object} Offers
 * @property {string} title - The title of the offer, must be unique.
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {string} message - The message content of the offer.
 * @property {string} type - The type of the offer (Offer or Announcement).
 * @property {string} targetAudience - The target audience for the offer (All Users, New Users, Returning Users).
 * @property {{ start: Date, end: Date }} dateRange - The start and end dates for the offer.
 * @property {string} image - The URL of the image associated with the offer.
 * @property {string} notificationStatus - The notification status (Scheduled or Draft).
 * @property {boolean} isExpired - Indicates whether the offer has expired.
 * @property {boolean} isTrashed - Indicates whether the offer has been trashed.
 * @property {Date} createdAt - The date and time when the offer was created (provided by timestamps).
 * @property {Date} updatedAt - The date and time when the offer was last updated (provided by timestamps).
 */

/**
 * Mongoose schema for the Offers model.
 * @type {mongoose.Schema<Offers>}
 */
const offersSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY, // Reference to the Company model
      required: true, // Ensure this is always set
    },
    message: { type: String, required: true },

    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    image: { type: String, required: true },

    isExpired: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Mongoose model for the Offers schema.
 * @type {mongoose.Model<Offers>}
 */
const Offers = mongoose.model(MODELS.OFFER, offersSchema);

export { Offers };
