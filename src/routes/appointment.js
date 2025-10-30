import express from "express";
import {
  getAppointmentCount,
  getAppointmentCountByGender,
  listAppointments,
  deleteAppointment,
  updateAppointment,
  getAppointmentsByEmployee,
  getAppointmentsByClient,
  scheduleAppointment,
  getAppointmentStats,
} from "../controllers/appointment.js";
import { APPOINTMENT_ROUTES } from "../constants.js";

// Import the APPOINTMENT_ROUTES constant from the constants file

const router = express.Router();

/**
 * @route GET /appointments
 * @route POST /appointments
 * @description Get all appointments or schedule a new one.
 */
router
  .route(APPOINTMENT_ROUTES.BASE)
  .get(listAppointments)
  .post(scheduleAppointment);

  /**
 * @desc    Get appointment stats (upcoming, completed, cancelled counts)
 * @route   GET /api/appointments/stats
 * @access  Private (Requires authentication)
 */
router.get(APPOINTMENT_ROUTES.STATS, getAppointmentStats);

/**
 * @route PATCH /appointments/:id
 * @description Update a specific appointment by its ID.
 */
router.route(APPOINTMENT_ROUTES.BY_ID).patch(updateAppointment);

/**
 * @route PATCH /appointments/soft-delete/:id
 * @description Soft delete a specific appointment by its ID.
 */
router.patch(APPOINTMENT_ROUTES.SOFT_DELETE, deleteAppointment);

/**
 * @route GET /appointments/count
 * @description Get the total number of appointments.
 */
router.get(APPOINTMENT_ROUTES.COUNT, getAppointmentCount);

/**
 * @route GET /appointments/count/gender
 * @description Get the number of appointments by gender.
 */
router.get(APPOINTMENT_ROUTES.COUNT_BY_GENDER, getAppointmentCountByGender);

/**
 * @route GET /appointments/employee/:employeeId
 * @description Get all appointments for a specific employee by their ID.
 */
router.get(APPOINTMENT_ROUTES.BY_EMPLOYEE, getAppointmentsByEmployee);

/**
 * @route GET /appointments/client/:id
 * @description Get all appointments for a specific client by their ID.
 */
router.get(APPOINTMENT_ROUTES.BY_CLIENT, getAppointmentsByClient);

export default router;
