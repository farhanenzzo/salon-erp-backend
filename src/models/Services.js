import mongoose from "mongoose";
import { MODELS, SERVICE_STATUS } from "../constants.js";

/**
 * @typedef {Object} ServicesIdTracker
 * @property {number} lastSTId - The last service ID generated. Defaults to 0.
 */

/**
 * Mongoose schema for tracking the last service ID.
 * @type {mongoose.Schema<ServicesIdTracker>}
 */
const servicesIdTrackerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY,
    required: true,
  },
  lastSTId: { type: Number, default: 0 },
});

/**
 * Mongoose model for the ServicesIdTracker schema.
 * @type {mongoose.Model<ServicesIdTracker>}
 */
const ServicesIdTracker = mongoose.model(
  MODELS.SERVICES_ID_TRACKER,
  servicesIdTrackerSchema
);

/**
 * @typedef {Object} Services
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the service.
 * @property {string} serviceID - The unique service ID.
 * @property {string} serviceName - The name of the service.
 * @property {string} serviceImage - The image URL of the service.
 * @property {mongoose.Schema.Types.ObjectId} category - The ID of the category associated with the service.
 * @property {string} [description] - A description of the service.
 * @property {string} duration - The duration of the service.
 * @property {string} price - The price of the service.
 * @property {string} serviceStatus - The status of the service. Defaults to active.
 * @property {boolean} isTrashed - Indicates if the service is soft deleted. Defaults to false.
 */

/**
 * Mongoose schema for the Services model.
 * @type {mongoose.Schema<Services>}
 */
const servicesSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY, // Reference to the Company model
      required: true, // Ensure this is always set
    },
    serviceID: {
      type: String,
    },
    serviceName: { type: String, required: true },
    serviceImage: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.CATEGORY,
      required: true,
    },
    description: { type: String },
    duration: { type: String, required: true },
    price: { type: String, required: true },
    serviceStatus: {
      type: String,
      enum: [SERVICE_STATUS.ACTIVE, SERVICE_STATUS.INACTIVE],
      default: SERVICE_STATUS.ACTIVE,
    },
    isTrashed: { type: Boolean, default: false }, // Soft delete mechanism
  },
  { timestamps: true }
);

servicesSchema.index({ companyId: 1, serviceID: 1 }, { unique: true });

/**
 * Mongoose model for the Services schema.
 * @type {mongoose.Model<Services>}
 */
const Services = mongoose.model(MODELS.SERVICES, servicesSchema);

/**
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the mapping.
 * @property {mongoose.Schema.Types.ObjectId} serviceID - The ID of the service.
 * @property {mongoose.Schema.Types.ObjectId} roles - The ID of the role associated with the service.
 */

/**
 * Mongoose schema for the ServiceRoleMapping model.
 * @type {mongoose.Schema<ServiceRoleMapping>}
 */
const serviceRoleMappingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  serviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.SERVICES,
    required: true,
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.ROLE,
    },
  ],
});

/**
 * Mongoose model for the ServiceRoleMapping schema.
 * @type {mongoose.Model<ServiceRoleMapping>}
 */
const ServiceRoleMapping = mongoose.model(
  MODELS.SERVICE_ROLE_MAPPING,
  serviceRoleMappingSchema
);

export { Services, ServicesIdTracker, ServiceRoleMapping };
