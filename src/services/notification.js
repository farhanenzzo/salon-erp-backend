import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import {
  BOOLEAN_VALUE,
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
} from "../constants.js";

/**
 * Saves a new notification to the database.
 *
 * @param {Object} notificationData - The data of the notification to be saved.
 * @throws {Error} - Throws an error if the notification saving fails.
 */
export const saveNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_SAVE_NOTIFICATION, error);
    throw new Error(ERROR_MESSAGES.FAILED_TO_SAVE_NOTIFICATION);
  }
};

/**
 * Lists notifications for a given company with an optional read status filter.
 *
 * @param {string} companyId - The ID of the company for which to list notifications.
 * @param {boolean} [readStatus] - The read status of the notifications to filter by.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of notifications.
 * @throws {Error} - Throws an error if the companyId is not provided or fetching notifications fails.
 */
export const listNotifications = async (companyId, readStatus) => {
  try {
    if (!companyId) {
      throw new Error(ERROR_MESSAGES.NO_COMPANY_ID_FOUND);
    }

    // Get the current date
    const currentDate = new Date();

    // Get the first day of the current month
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get the last day of the current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Build the query object dynamically
    const query = {
      companyId,
      timestamp: {
        $gte: firstDayOfMonth, // Greater than or equal to the first day of the month
        $lte: lastDayOfMonth, // Less than or equal to the last day of the month
      },
    };

    // If readStatus is provided, add it to the query
    if (typeof readStatus === "boolean") {
      query.isRead = readStatus;
    }

    const notifications = await Notification.find(query).sort({
      timestamp: -1,
    });

    return notifications;
  } catch (error) {
    throw new Error(
      ERROR_MESSAGES.ERROR_FETCHING_NOTIFICATIONS + error.message
    );
  }
};

/**
 * Updates the read status of specified notifications for a given company.
 *
 * @param {string} companyId - The ID of the company for which to update notifications.
 * @param {Array<string>} notificationIds - The IDs of the notifications to be updated.
 *
 * @returns {Promise<Object>} - A promise that resolves to the result of the update operation.
 * @throws {Error} - Throws an error if the companyId or notificationIds are invalid or the update operation fails.
 */
export const updateNotification = async (companyId, notificationIds) => {
  try {
    if (!companyId) {
      throw new Error(ERROR_MESSAGES.NO_COMPANY_ID_FOUND);
    }

    if (
      !Array.isArray(notificationIds) ||
      notificationIds.length === GENERAL_CONSTANTS.ZERO
    ) {
      throw new Error(ERROR_MESSAGES.NOTIFICATION_ID_SHOULD_NOT_BE_EMPTY);
    }

    // Convert notificationIds to ObjectId
    const objectIds = notificationIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`${ERROR_MESSAGES.INVALID_ID_FORMAT} ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const result = await Notification.updateMany(
      {
        companyId,
        _id: { $in: objectIds },
      },
      {
        $set: {
          isRead: true,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(ERROR_MESSAGES.NO_MATCHING_NOTIFICATIONS_FOUND);
    }

    return result;
  } catch (error) {
    throw new Error(`${FAILED_UPDATING_NOTIFICATIONS} ${error.message}`);
  }
};
