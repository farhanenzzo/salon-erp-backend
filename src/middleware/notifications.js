import {
  NOTIFICATION_MESSAGES,
  REQUEST_METHOD,
  REQUEST_PATH,
} from "../constants.js";
import { saveNotificationToDatabase } from "../services/notification.js";

/**
 * Middleware to handle notifications based on the incoming request.
 * Generates and saves notifications for specific actions (e.g., creating appointments or adding clients).
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {Promise<void>}
 */
const notificationMiddleware = async (req, res, next) => {
  const { userId } = req.body;
  const { companyId } = req;

  let notificationMessage = "";

  // Determine the action being taken and set the notification message
  if (req.method === REQUEST_METHOD.POST) {
    switch (req.path) {
      case REQUEST_PATH.APPOINTMENTS:
        notificationMessage = NOTIFICATION_MESSAGES.NEW_APPOINTMENT_SCHEDULED;
        break;
      case REQUEST_PATH.CLIENT_SERVICE:
        notificationMessage = NOTIFICATION_MESSAGES.NEW_CLIENT_ADDED;
        break;
      // Add more cases as needed for other routes
      default:
        break;
    }

    // Create the notification if a relevant message was set
    if (notificationMessage) {
      const notification = {
        userId,
        companyId,
        message: notificationMessage,
        timestamp: new Date(),
        isRead: false,
      };

      // Save the notification to the database
      await saveNotificationToDatabase(notification);
    }
  }

  // Proceed to the next middleware or route handler
  next();
};

export default notificationMiddleware;
