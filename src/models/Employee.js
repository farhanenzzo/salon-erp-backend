import mongoose from "mongoose";
import {
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
  GENDER,
  MODELS,
} from "../constants.js";

/**
 * @typedef {Object} EmployeeIdTracker
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the company.
 * @property {number} lastEmployeeId - The last generated employee ID.
 */

/**
 * Mongoose schema for tracking the last employee ID.
 * @type {mongoose.Schema<EmployeeIdTracker>}
 */
const employeeIdTrackerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  lastEmployeeId: { type: Number, default: 0 },
});

/**
 * Mongoose model for the Employee ID Tracker schema.
 * @type {mongoose.Model<EmployeeIdTracker>}
 */
const EmployeeIdTracker = mongoose.model(
  MODELS.EMPLOYEE_ID_TRACKER,
  employeeIdTrackerSchema
);

/**
 * @typedef {Object} Employee
 * @property {string} employeeId - Unique identifier for the employee.
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the company.
 * @property {string} employeeName - Full name of the employee.
 * @property {string} [employeeEmail] - Email address of the employee.
 * @property {mongoose.Schema.Types.ObjectId} employeeRole - Reference to the employee's role.
 * @property {number} employeePhone - Phone number of the employee.
 * @property {string} [employeePhoto] - Photo URL or path for the employee.
 * @property {string} employeeJoiningData - Joining date of the employee.
 * @property {number} employeeSalary - Salary of the employee.
 * @property {string} employeeAddress - Address of the employee.
 * @property {string} employeeGender - Gender of the employee (Male, Female, Other).
 * @property {boolean} [isTrashed] - Flag indicating if the employee is deleted.
 * @property {string} employeeStatus - Status of the employee (Active or Inactive).
 */

/**
 * Mongoose schema for the Employee model.
 * @type {mongoose.Schema<Employee>}
 */
const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY, // Reference to the Company model
      required: true, // Ensure this is always set
    },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String },
    employeeRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.ROLE,
      required: true,
    },
    employeePhone: { type: Number, required: true },
    employeePhoto: { type: String, required: false },
    employeeJoiningData: { type: String, required: true },
    employeeSalary: { type: Number, required: true },
    employeeAddress: { type: String, required: true },
    employeeGender: {
      type: String,
      enum: [GENDER.MALE, GENDER.FEMALE, GENDER.OTHER],
      required: true,
    },
    isTrashed: { type: Boolean, default: false }, // Deleted employee
    employeeStatus: {
      type: String,
      enum: [EMPLOYEE_STATUS.ACTIVE, EMPLOYEE_STATUS.INACTIVE],
      default: EMPLOYEE_STATUS.ACTIVE,
      required: true,
    },
  },
  { timestamps: true }
);

// Add a compound index to ensure employeeId is unique per company
employeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });

/**
 * Mongoose model for the Employee schema.
 * @type {mongoose.Model<Employee>}
 */
const Employee = mongoose.model(MODELS.EMPLOYEE, employeeSchema);

export { Employee, EmployeeIdTracker };
