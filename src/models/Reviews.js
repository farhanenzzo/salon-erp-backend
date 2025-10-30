import mongoose from "mongoose";
import { GENERAL_CONSTANTS, MODELS } from "../constants.js";

/**
 * @typedef {Object} Review
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the review.
 * @property {mongoose.Schema.Types.ObjectId} appointmentId - The ID of the appointment associated with the review.
 * @property {mongoose.Schema.Types.ObjectId} clientId - The ID of the client who submitted the review.
 * @property {number} rating - The rating given by the client (1 to 5).
 * @property {string} [comment] - Optional comment provided by the client.
 * @property {Date} createdAt - The date and time when the review was created.
 * @property {Date} updatedAt - The date and time when the review was last updated.
 * @property {boolean} isTrashed - Flag indicating whether the review is soft-deleted. Defaults to false.
 */

/**
 * Mongoose schema for the Review model.
 * @type {mongoose.Schema<Review>}
 */
const reviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.APPOINTMENT, // Reference to the Appointment model
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.SERVICES, // Reference to the Appointment model
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.CLIENT, // Reference to the Client model
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: GENERAL_CONSTANTS.ONE, // Minimum rating
    max: GENERAL_CONSTANTS.FIVE, // Maximum rating
  },
  comment: {
    type: String,
    trim: true,
    maxlength: GENERAL_CONSTANTS.COMMENT_MAX_LENGTH, // Limit comment length
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isTrashed: { type: Boolean, default: false },
  // New field for replies
  replies: [
    {
      admin: {
        type: String,
      },
      companyProfile: { type: String },
      replyMessage: { type: String, default: "" },
      repliedAt: { type: String, default: "" }, // Changed to String to store formatted time
    },
  ],
});

/**
 * Middleware to update the `updatedAt` field on each save.
 */
reviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Mongoose model for the Review schema.
 * @type {mongoose.Model<Review>}
 */
const Review = mongoose.model(MODELS.REVIEW, reviewSchema);

export default Review;
