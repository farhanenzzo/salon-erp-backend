import mongoose from "mongoose";
import { APPOINTMENT_STATUS, GENERAL_CONSTANTS, MODELS, PAYMENT_STATUS } from "../constants.js";

/**
 * @typedef {Object} AppointmentIdTracker
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {number} lastAptId - The last appointment ID used for tracking.
 */

/**
 * Mongoose schema for tracking the last appointment ID.
 * @type {mongoose.Schema<AppointmentIdTracker>}
 */
const appointmentIdTrackerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  lastAptId: { type: Number, default: GENERAL_CONSTANTS.ZERO },
});

/**
 * Mongoose model for the Appointment ID Tracker schema.
 * @type {mongoose.Model<AppointmentIdTracker>}
 */
const AppointmentIdTracker = mongoose.model(
  MODELS.APPOINTMENT_ID_TRACKER,
  appointmentIdTrackerSchema
);

/**
 * @typedef {Object} Appointment
 * @property {string} appointmentId - Unique identifier for the appointment.
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {string} clientId - Identifier for the client.
 * @property {mongoose.Schema.Types.ObjectId} client - Reference to the Client model.
 * @property {mongoose.Schema.Types.ObjectId} service - Reference to the Services model.
 * @property {mongoose.Schema.Types.ObjectId} stylistId - Reference to the Employee model.
 * @property {Date} date - Date of the appointment.
 * @property {string} time - Time of the appointment.
 * @property {string} [note] - Optional note for the appointment.
 * @property {Date} expiresAt - Expiry date of the appointment.
 * @property {boolean} isTrashed - Whether the appointment is trashed or deleted.
 * @property {string} appointmentStatus - Current status of the appointment.
 */

/**
 * Mongoose schema for the Appointment model.
 * @type {mongoose.Schema<Appointment>}
 */
const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY, // Reference to the Company model
      required: true, // Ensure this is always set
    },
    clientId: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
      ref: MODELS.CLIENT, // Reference the Client model
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.SERVICES,
      required: true,
    },
    stylistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.EMPLOYEE,
      required: true,
    }, // Foreign key to Employee
    date: { type: Date, required: true },
    time: { type: String, required: true },
    note: { type: String },
    expiresAt: { type: Date, required: true },
    isTrashed: { type: Boolean, default: false }, // Deleted appointment
    status: {
      type: String,
      enum: [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.UNPAID,
        PAYMENT_STATUS.PAID,
        PAYMENT_STATUS.FAILED,
      ],
      default: PAYMENT_STATUS.UNPAID,
    }, // Default to un-paid
    appointmentStatus: {
      type: String,
      enum: [
        APPOINTMENT_STATUS.UPCOMING,
        APPOINTMENT_STATUS.COMPLETED,
        APPOINTMENT_STATUS.CANCELLED,
        APPOINTMENT_STATUS.ONGOING,
      ],
      default: APPOINTMENT_STATUS.UPCOMING,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ appointmentId: 1, companyId: 1 }, { unique: true });

/**
 * Mongoose model for the Appointment schema.
 * @type {mongoose.Model<Appointment>}
 */
const Appointment = mongoose.model(MODELS.APPOINTMENT, appointmentSchema);

export { Appointment, AppointmentIdTracker };
