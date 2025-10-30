/**
 * Generates the next client ID for a given company.
 * The ID format will be 'CL' followed by a 3-digit number, e.g., 'CL001'.
 * It uses the ClientIdTracker model to increment the `lastClientId` for the company.
 *
 * @param {string} companyId - The ID of the company for which to generate the client ID.
 * @returns {string} The next client ID in the format 'CLxxx' where xxx is a 3-digit number.
 * @throws {Error} If there's an error generating the client ID.
 */

import {
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
  SUCCESS_MESSAGES,
} from "../constants.js";
import { AppointmentIdTracker } from "../models/Appointments.js";
import { ClientIdTracker } from "../models/Client.js";
import { EmployeeIdTracker } from "../models/Employee.js";
import { TransactionIdTracker } from "../models/Payment.js";
import { ServicesIdTracker } from "../models/Services.js";
import { StockIdTracker } from "../models/Stocks.js";
import { UserIdTracker } from "../models/User.js";

export const generateNextClientId = async (companyId) => {
  try {
    // Find and update the tracker, incrementing the last client ID
    const tracker = await ClientIdTracker.findOneAndUpdate(
      { companyId },
      { $inc: { lastClientId: GENERAL_CONSTANTS.ONE } },
      { new: true, upsert: true }
    );

    // Extract the next client ID from the tracker
    const nextClientId = tracker.lastClientId;

    // Return the formatted client ID
    return `CL${nextClientId
      .toString()
      .padStart(GENERAL_CONSTANTS.THREE, "0")}`;
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_GENERATING_CLIENT_ID, error);
    throw new Error(ERROR_MESSAGES.FAILED_GENERATING_CLIENT_ID);
  }
};

/**
 * Resets the client ID tracker by setting the `lastClientId` to 0.
 * This function is useful for situations where you want to start generating IDs from 'CL000'.
 *
 * @returns {void}
 * @throws {Error} If there's an error resetting the client ID tracker.
 */
export const resetClientIdTracker = async () => {
  try {
    // Update the tracker to reset the last client ID to 0
    await ClientIdTracker.updateOne(
      {},
      { $set: { lastClientId: GENERAL_CONSTANTS.ZERO } },
      { upsert: true }
    );
    console.log(SUCCESS_MESSAGES.CLIENT_ID_RESET_SUCCESSFULLY);
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_RESETTING_CLIENT_ID_TRACKER, error);
  }
};

/**
 * Generates the next appointment ID for a given company.
 * The ID format will be '#APT' followed by a 3-digit number, e.g., '#APT001'.
 * It uses the AppointmentIdTracker model to increment the `lastAptId` for the company.
 *
 * @param {string} companyId - The ID of the company for which to generate the appointment ID.
 * @returns {string} The next appointment ID in the format '#APTxxx' where xxx is a 3-digit number.
 * @throws {Error} If there's an error generating the appointment ID.
 */
export const generateNextAptId = async (companyId) => {
  try {
    // Increment the ID tracker and get the updated value
    const tracker = await AppointmentIdTracker.findOneAndUpdate(
      { companyId },
      { $inc: { lastAptId: GENERAL_CONSTANTS.ONE } },
      { new: true, upsert: true }
    );

    // Extract the next appointment ID from the tracker
    const nextIdNumber = tracker.lastAptId;

    // Return the formatted appointment ID
    return `#APT${nextIdNumber
      .toString()
      .padStart(GENERAL_CONSTANTS.THREE, "0")}`;
  } catch (error) {
    console.error("Error generating appointment ID:", error);
    throw new Error(ERROR_MESSAGES.FAILED_GENERATING_APPOINTMENT_ID);
  }
};

/**
 * Resets the appointment ID tracker by setting the `lastAptId` to 0.
 * This function is useful for situations where you want to start generating IDs from '#APT000'.
 *
 * @returns {void}
 * @throws {Error} If there's an error resetting the appointment ID tracker.
 */
export const resetAppointmentIdTracker = async () => {
  try {
    // Update the tracker to reset the last appointment ID to 0
    await AppointmentIdTracker.updateOne(
      { companyId },
      { $set: { lastAptId: GENERAL_CONSTANTS.ZERO } },
      { upsert: true }
    );
    console.log(ERROR_MESSAGES.ERROR_RESETTING_APPOINTMENT_ID_TRACKER);
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_RESETTING_APPOINTMENT_ID_TRACKER, error);
  }
};

/**
 * @function generateNextUserId
 * @description Generates the next unique user ID, incrementing the tracker for the specified company or globally if no company is provided.
 * @param {String|null} companyId - The ID of the company to generate a user ID for, or null for global users.
 * @returns {Promise<String>} The generated user ID in the format "#USERXXX", where "XXX" is a zero-padded number.
 * @throws {Error} If the user ID generation fails due to a database or processing error.
 */
export const generateNextUserId = async (companyId = null) => {
  try {
    let tracker;

    if (companyId) {
      // Increment the ID tracker for a specific company
      tracker = await UserIdTracker.findOneAndUpdate(
        { companyId },
        { $inc: { lastUserId: GENERAL_CONSTANTS.ONE } },
        { new: true, upsert: true }
      );
    } else {
      // Increment the global ID tracker for users without a company
      tracker = await UserIdTracker.findOneAndUpdate(
        { companyId: null },
        { $inc: { lastUserId: GENERAL_CONSTANTS.ONE } },
        { new: true, upsert: true }
      );
    }

    const nextIdNumber = tracker.lastUserId;
    return `#USER${nextIdNumber
      .toString()
      .padStart(GENERAL_CONSTANTS.THREE, "0")}`;
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_GENERATE_USER_ID, error);
    throw new Error(ERROR_MESSAGES.FAILED_TO_GENERATE_USER_ID);
  }
};

/**
 * @function generateNextBrandId
 * @description Generates the next unique brand ID for a specified company, incrementing the tracker.
 * @param {String} companyId - The ID of the company to generate a brand ID for.
 * @returns {Promise<String>} The generated brand ID in the format "#BRXXX", where "XXX" is a zero-padded number.
 * @throws {Error} If the brand ID generation fails due to a database or processing error.
 */
export const generateNextBrandId = async (companyId) => {
  try {
    const tracker = await BrandIdTracker.findOneAndUpdate(
      { companyId },
      { $inc: { lastBrandId: GENERAL_CONSTANTS.ONE } },
      { new: true, upsert: true }
    );
    const nextIdNumber = tracker.lastBrandId;
    return `#BR${nextIdNumber
      .toString()
      .padStart(GENERAL_CONSTANTS.THREE, "0")}`;
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_GENERATE_BRAND_ID);
    throw new Error(ERROR_MESSAGES.FAILED_TO_GENERATE_BRAND_ID);
  }
};

export const generateNextSTId = async (companyId) => {
  try {
    // Increment the ID tracker and get the updated value
    const tracker = await ServicesIdTracker.findOneAndUpdate(
      { companyId },
      { $inc: { lastSTId: GENERAL_CONSTANTS.ONE } },
      { new: true, upsert: true }
    );
    const nextIdNumber = tracker.lastSTId;
    return `#ST${nextIdNumber
      .toString()
      .padStart(GENERAL_CONSTANTS.THREE, "0")}`;
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_GENERATING_SERVICE_ID, error);
    throw new Error(ERROR_MESSAGES.FAILED_GENERATING_SERVICE_ID);
  }
};

// Function to generate the next employee ID
export const generateNextEmployeeId = async (companyId) => {
  const tracker = await EmployeeIdTracker.findOneAndUpdate(
    { companyId },
    { $inc: { lastEmployeeId: GENERAL_CONSTANTS.ONE } },
    { new: true, upsert: true }
  );
  const nextIdNumber = tracker.lastEmployeeId;
  return `EMP${nextIdNumber.toString().padStart(GENERAL_CONSTANTS.FOUR, "0")}`;
};

export const generateNextStockId = async (companyId) => {
  try {
    const tracker = await StockIdTracker.findOneAndUpdate(
      { companyId },
      { $inc: { lastStockId: GENERAL_CONSTANTS.ONE } },
      { new: true, upsert: true }
    );

    const nextStockId = tracker.lastStockId;
    return `#ST${nextStockId
      .toString()
      .padStart(GENERAL_CONSTANTS.THREE, "0")}`;
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_GENERATING_STOCK_ID, error);
    throw new Error(ERROR_MESSAGES.FAILED_GENERATING_STOCK_ID);
  }
};

export const resetStockId = async () => {
  try {
    await StockIdTracker.updateOne(
      {},
      { $set: { lastStockId: GENERAL_CONSTANTS.ONE } },
      { upsert: true }
    );
    console.log(SUCCESS_MESSAGES.RESET_STOCK_ID_SUCCESS);
  } catch (error) {
    console.log(ERROR_MESSAGES.ERROR_RESETTING_STOCK_ID, error);
  }
};

export const generateNextTransactionId = async (companyId) => {
  try {
    // Increment the ID tracker and get the updated value
    const tracker = await TransactionIdTracker.findOneAndUpdate(
      { companyId },
      { $inc: { lastTxnId: GENERAL_CONSTANTS.ONE } },
      { new: true, upsert: true }
    );

    // Extract the next appointment ID from the tracker
    const nextIdNumber = tracker.lastTxnId;

    // Return the formatted appointment ID
    return `#TXN${nextIdNumber
      .toString()
      .padStart(GENERAL_CONSTANTS.FOUR, "0")}`;
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_GENERATING_TRANSACTION_ID, error);
    throw new Error(ERROR_MESSAGES.FAILED_GENERATING_TRANSACTION_ID);
  }
};
