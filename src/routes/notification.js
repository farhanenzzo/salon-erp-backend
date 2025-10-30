import express from "express";
import {
  getNotifications,
  updateReadStatus,
} from "../controllers/notification.js";
import { NOTIFICATION_ROUTES } from "../constants.js";

const router = express.Router();

/**
 * Route to fetch notifications.
 * @route GET /api/notifications
 * @access Public
 */
router.get(NOTIFICATION_ROUTES.GET_NOTIFICATIONS, getNotifications);

/**
 * Route to update the read status of notifications.
 * @route PATCH /api/notifications/read
 * @access Public
 */
router.patch(NOTIFICATION_ROUTES.UPDATE_READ_STATUS, updateReadStatus);

export default router;
