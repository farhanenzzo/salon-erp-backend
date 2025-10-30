import { BOOLEAN, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants.js";
import {
  listNotifications,
  updateNotification,
} from "../services/notification.js";

/**
 * Fetches notifications for a company, optionally filtering by read status.
 * @async
 * @param {Object} req - The request object containing the companyId and optional readStatus query parameter.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with a list of notifications for the company.
 * @throws {Error} If an error occurs while fetching notifications.
 */
export const getNotifications = async (req, res) => {
  const { companyId } = req;
  const { readStatus } = req.query;

  try {
    if (!companyId) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    // Convert readStatus to boolean if it's provided, otherwise keep it undefined
    let isReadStatus;
    if (readStatus === BOOLEAN.TRUE) {
      isReadStatus = true;
    } else if (readStatus === BOOLEAN.FALSE) {
      isReadStatus = false;
    }

    const notifications = await listNotifications(companyId, isReadStatus);
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Updates the read status of multiple notifications for a company.
 * @async
 * @param {Object} req - The request object containing notificationIds to update.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with a success message or an error message if the update fails.
 * @throws {Error} If an error occurs while updating the notification read status.
 */
export const updateReadStatus = async (req, res) => {
  const { notificationIds } = req.body;
  const { companyId } = req;

  try {
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.NOTIFICATION_IDS_MUST_BE_ARRAY,
      });
    }

    await updateNotification(companyId, notificationIds);

    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.EMPLOYEE_UPDATED_SUCCESSFULLY,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.FAILED_UPDATING_NOTIFICATION_READ_STATUS,
      error: error.message,
    });
  }
};
