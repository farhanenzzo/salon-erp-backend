import mongoose from "mongoose";
import { GENERAL_CONSTANTS, MODELS, USER_STATUS } from "../constants.js";

// Schema for tracking the last user ID
const userIdTrackerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId },
  lastUserId: { type: Number, default: GENERAL_CONSTANTS.ZERO },
});

const UserIdTracker = mongoose.model(
  MODELS.USER_ID_TRACKER,
  userIdTrackerSchema
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  userProfile: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.ROLE, // Reference to the Role model
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
  },
  firebaseUid: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.PENDING],
    default: USER_STATUS.ACTIVE, // Default status for a new user
  },
  isTrashed: { type: Boolean, default: false }, // Soft delete mechanism
});

userSchema.index({ company: 1, userId: 1 }, { unique: true });

const User = mongoose.model(MODELS.USER, userSchema);

export { User, UserIdTracker };
