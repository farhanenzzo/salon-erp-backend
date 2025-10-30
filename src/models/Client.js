import mongoose from "mongoose";
import { GENDER, GENERAL_CONSTANTS, MODELS } from "../constants.js";

/**
 * @typedef {Object} ClientIdTracker
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {number} lastClientId - The last client ID used for tracking.
 */

/**
 * Mongoose schema for tracking the last client ID.
 * @type {mongoose.Schema<ClientIdTracker>}
 */
const lastClientIdTrackerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  lastClientId: { type: Number, default: GENERAL_CONSTANTS.ZERO },
});

/**
 * Mongoose model for the Client ID Tracker schema.
 * @type {mongoose.Model<ClientIdTracker>}
 */
const ClientIdTracker = mongoose.model(
  MODELS.CLIENT_ID_TRACKER,
  lastClientIdTrackerSchema
);

/**
 * @typedef {Object} Client
 * @property {string} clientId - Unique identifier for the client.
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {string} name - Full name of the client.
 * @property {string} [email] - Email address of the client.
 * @property {string} phone - Phone number of the client.
 * @property {Date} [dob] - Date of birth of the client.
 * @property {string} [photo] - URL of the client's photo.
 * @property {string} gender - Gender of the client (Male, Female, or Other).
 * @property {string} [notes] - Additional notes about the client.
 * @property {string} address - Address of the client.
 * @property {boolean} isTrashed - Indicates if the client record is deleted.
 */

/**
 * Mongoose schema for the Client model.
 * @type {mongoose.Schema<Client>}
 */
const clientSchema = new mongoose.Schema(
  {
    clientId: { type: String, unique: true },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY, // Reference to the Company model
      required: true, // Ensure this is always set
    },
    firebaseUid: { type: String },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    dob: { type: Date },
    photo: { type: String },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.ROLE,
      // required: true,
    },
    gender: {
      type: String,
      enum: [GENDER.MALE, GENDER.FEMALE, GENDER.OTHER],
    },
    notes: { type: String },
    address: { type: String },
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Mongoose model for the Client schema.
 * @type {mongoose.Model<Client>}
 */
const Client = mongoose.model(MODELS.CLIENT, clientSchema);

export { Client, ClientIdTracker };
