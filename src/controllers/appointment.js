import mongoose from "mongoose";
import { Appointment } from "../models/Appointments.js";
import { Employee } from "../models/Employee.js";
import moment from "moment-timezone";
import { Client } from "../models/Client.js";
import {
  APPOINTMENT_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APPOINTMENT_FIELDS,
  EMPLOYEE_PROJECTION_FIELDS,
  GENERAL_CONSTANTS,
  EMPLOYEE_FIELDS,
  COLLECTION_NAMES,
  ROLE_PROJECTION_FIELDS,
  AGGREGATION_FIELDS,
  CLIENT_PROJECTION_FIELDS,
  SERVICE_PROJECTION_FIELDS,
  CLIENT_FIELDS,
  SERVICE_FIELDS,
} from "../constants.js";
import { validateAppointmentInput } from "../validators/appointment.js";
import {
  listAppointmentCountByGender,
  getAppointments,
  scheduleAppointments,
  updateAppointmentService,
} from "../services/appointment.js";

/**
 * Controller to handle scheduling a new appointment.
 * It validates the incoming request and calls the service to process the appointment.
 *
 * @param {Object} req - The request object containing the appointment details.
 * @param {Object} res - The response object to send the response.
 * @returns {Promise<void>} - Returns the response after processing the appointment.
 */
export const scheduleAppointment = async (req, res) => {
  console.log("req body in appointments", req.body);

  const { error } = validateAppointmentInput(req.body);

  if (error) {
    console.log("erorr in add appointment", error);
    return res.status(400).json({
      error: error.details.map((detail) => detail.message).join(", "),
    });
  }

  try {
    const result = await scheduleAppointments(req);
    return res.status(201).json(result);
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_CREATING_APPOINTMENT, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_ADD_APPOINTMENT });
  }
};

/**
 * @description Retrieves the count of active appointments for a specific company.
 * This function counts the number of appointments that are not marked as trashed and belong to the specified company.
 *
 * @route GET /appointments/count
 * @access Public
 *
 * @param {Object} req - The request object, containing the companyId in `req.companyId`.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {Object} The count of active appointments.
 * @throws {Error} If there is an issue fetching the appointment count, an error response is sent.
 */
export const getAppointmentCount = async (req, res) => {
  const { companyId } = req;
  try {
    const count = await Appointment.countDocuments({
      isTrashed: false,
      companyId,
    });

    res.status(200).json({ count });
  } catch (error) {
    // Log the error and send a response indicating failure
    console.error(ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT_COUNT, error);
    res
      .status(500)
      .json({ error: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT_COUNT });
  }
};

/**
 * Controller function to fetch appointment count by gender.
 * It extracts the filter parameter from the request query, and then calls the service to get the count.
 *
 * @param {Object} req - The request object containing the filter query parameter (day, week, month).
 * @param {Object} res - The response object to send the result back.
 * @returns {Promise<void>} - Sends the appointment count data or an error response.
 */
export const getAppointmentCountByGender = async (req, res) => {
  try {
    const countByGender = await listAppointmentCountByGender(req);

    res.status(200).json(countByGender);
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_FETCHING_APPOINTMENT_COUNT, error);
    res
      .status(500)
      .json({ error: ERROR_MESSAGES.ERROR_FETCHING_APPOINTMENT_COUNT });
  }
};

/**
 * Controller function to list appointments with optional filters (date, status, pagination).
 * It extracts the query parameters from the request and calls the service function to fetch the appointments.
 *
 * @param {Object} req - The request object containing query parameters (selectedDate, status, page, limit).
 * @param {Object} res - The response object to send the result back.
 * @returns {Promise<void>} - Sends the appointment data along with pagination metadata, or an error response.
 */
export const listAppointments = async (req, res) => {
  const { customerId } = req;
  try {
    const appointments = await getAppointments(req);

    res.status(200).json(appointments);
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS });
  }
};

/**
 * Deletes an appointment by marking it as trashed.
 *
 * @function deleteAppointment
 * @param {Object} req - The request object.
 * @param {Object} req.params - Contains the route parameters.
 * @param {string} req.params.id - The ID of the appointment to delete.
 * @param {string} req.companyId - The ID of the company to which the appointment belongs.
 * @param {Object} res - The response object.
 * @returns {void}
 *
 * @description
 * This function marks an appointment as trashed rather than completely removing it from the database.
 * It first validates the appointment ID, then checks if the appointment belongs to the user's company.
 * If found, it updates the `isTrashed` property of the appointment and saves the changes.
 *
 * @throws
 * - 400: If the ID format is invalid.
 * - 404: If the appointment is not found or does not belong to the company.
 * - 500: If there is a server error during the process.
 */
export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID_FORMAT });
    }

    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    // Check if the appointment belongs to the user's company
    const appointment = await Appointment.findOne({
      _id: objectId,
      companyId: req.companyId,
    });

    if (!appointment) {
      return res.status(404).json({
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      });
    }

    // Mark the appointment as trashed
    appointment.isTrashed = true;
    await appointment.save();

    res.status(200).json({ message: SUCCESS_MESSAGES.APPOINTMENT_DELETED });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_DELETE_APPOINTMENT, error);
    res
      .status(500)
      .json({ error: ERROR_MESSAGES.FAILED_TO_DELETE_APPOINTMENT });
  }
};

/**
 * Controller function to update an appointment.
 * It receives the request to update appointment details and calls the service to handle the update logic.
 * It also saves a notification about the update.
 *
 * @param {Object} req - The request object containing appointment update data (body) and appointment ID (params).
 * @param {Object} res - The response object to send the result back.
 * @returns {Promise<void>} - Sends a success or error response based on the result of the appointment update.
 */
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const { companyId } = req;

  try {
    const updatedAppointment = await updateAppointmentService(
      id,
      updateData,
      companyId
    );

    res.status(200).json({
      message: SUCCESS_MESSAGES.APPOINTMENT_UPDATED_SUCCESSFULLY,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT, error);
    res
      .status(500)
      .json({ message: ERROR_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT });
  }
};

/**
 * Updates appointment statuses for a specific company based on their current time and state.
 *
 * @param {String} companyId - The unique identifier for the company.
 *
 * @description This function performs bulk updates on appointment statuses:
 * - Marks appointments as "Completed" if their expiration time is in the past.
 * - Marks appointments as "Ongoing" if their current time falls between the start and end times.
 * - Marks appointments as "Upcoming" if their start time is in the future.
 *
 * @throws Logs an error message if there is an issue during the status update process.
 *
 * @returns {void} This function does not return a value but updates the appointment documents in the database.
 */
export const updateAppointmentStatuses = async (companyId) => {
  try {
    // Get current time in UTC
    const nowUTC = moment.utc();
    // console.log("Current date and time in UTC:", nowUTC.format());

    // Fetch all appointments that may need a status update (to log their details)
    const appointments = await Appointment.find({
      isTrashed: false,
      companyId,
    });

    const completedResult = await Appointment.updateMany(
      {
        isTrashed: false,
        companyId,

        expiresAt: { $lte: nowUTC.toDate() }, // End time is in the past or now
        appointmentStatus: {
          $nin: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED],
        },
      },
      { $set: { appointmentStatus: APPOINTMENT_STATUS.COMPLETED } }
    );

    // Update appointments to "Ongoing"
    // Only appointments not already marked "Completed" and whose `date` and `expiresAt` are around now
    const ongoingResult = await Appointment.updateMany(
      {
        isTrashed: false,
        companyId,

        date: { $lte: nowUTC.toDate() }, // Start time is in the past or now
        expiresAt: { $gt: nowUTC.toDate() }, // End time is in the future
        appointmentStatus: {
          $nin: [APPOINTMENT_STATUS.ONGOING, APPOINTMENT_STATUS.CANCELLED],
        }, // Avoid unnecessary updates
      },
      { $set: { appointmentStatus: APPOINTMENT_STATUS.ONGOING } }
    );

    // Appointments whose `date` is in the future are "Upcoming"
    const upcomingResult = await Appointment.updateMany(
      {
        isTrashed: false,
        companyId,

        date: { $gt: nowUTC.toDate() }, // Start time is in the future
        appointmentStatus: {
          $nin: [APPOINTMENT_STATUS.UPCOMING, APPOINTMENT_STATUS.CANCELLED],
        }, // Avoid unnecessary updates
      },
      { $set: { appointmentStatus: APPOINTMENT_STATUS.UPCOMING } }
    );
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_UPDATING_APPOINTMENT_STATUSES, error);
  }
};

/**
 * Retrieves appointments associated with a specific employee for a given company.
 *
 * @param {Object} req - The HTTP request object, containing the `employeeId` in `req.params` and `companyId` in `req`.
 * @param {Object} res - The HTTP response object used to send the response.
 *
 * @description This function validates the provided `employeeId`, ensures the employee exists, and retrieves appointments
 * associated with the employee. It performs the following:
 * - Validates the employee ID format.
 * - Fetches employee details, including their role, based on the provided `employeeId` and `companyId`.
 * - Retrieves appointments linked to the employee, including client and service details.
 * - Combines employee details with appointments into a single response object.
 *
 * @throws Returns an appropriate error response in case of validation failure, missing employee, or unexpected errors.
 *
 * @returns {void} Sends the combined employee and appointment data as a JSON response.
 */

export const getAppointmentsByEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const { companyId } = req;

  try {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INVALID_EMPLOYEE_ID });
    }

    const employee = await Employee.findById({
      [EMPLOYEE_FIELDS.ID]: employeeId,
      [APPOINTMENT_FIELDS.COMPANY_ID]: companyId,
    })
      .lean()
      .populate({
        path: EMPLOYEE_FIELDS.EMPLOYEE_ROLE,
        model: COLLECTION_NAMES.ROLES,
        select: ROLE_PROJECTION_FIELDS.ROLE_NAME,
      });

    if (!employee) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
    }

    const appointments = await Appointment.aggregate([
      {
        $match: {
          [APPOINTMENT_FIELDS.IS_TRASHED]: false,
          [APPOINTMENT_FIELDS.COMPANY_ID]: companyId,
          [APPOINTMENT_FIELDS.STYLIST_ID]: new mongoose.Types.ObjectId(
            employeeId
          ),
        },
      },
      {
        $lookup: {
          from: COLLECTION_NAMES.EMPLOYEES,
          localField: APPOINTMENT_FIELDS.STYLIST_ID,
          foreignField: EMPLOYEE_FIELDS.ID,
          as: AGGREGATION_FIELDS.STYLIST_ID,
        },
      },
      { $unwind: `$${AGGREGATION_FIELDS.STYLIST_ID}` },
      {
        $lookup: {
          from: COLLECTION_NAMES.ROLES,
          localField: `${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_FIELDS.EMPLOYEE_ROLE}`,
          foreignField: EMPLOYEE_FIELDS.ID,
          as: AGGREGATION_FIELDS.ROLE_DETAILS,
        },
      },
      {
        $unwind: {
          path: `$${AGGREGATION_FIELDS.ROLE_DETAILS}`,
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: COLLECTION_NAMES.CLIENTS,
          localField: APPOINTMENT_FIELDS.CLIENT,
          foreignField: EMPLOYEE_FIELDS.ID,
          as: AGGREGATION_FIELDS.CLIENT,
        },
      },
      {
        $unwind: {
          path: `$${AGGREGATION_FIELDS.CLIENT}`,
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: COLLECTION_NAMES.SERVICES,
          localField: APPOINTMENT_FIELDS.SERVICE,
          foreignField: EMPLOYEE_FIELDS.ID,
          as: AGGREGATION_FIELDS.SERVICE_DETAILS,
        },
      },
      {
        $unwind: {
          path: `$${AGGREGATION_FIELDS.SERVICE_DETAILS}`,
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: GENERAL_CONSTANTS.ONE,
          appointmentId: GENERAL_CONSTANTS.ONE,
          date: GENERAL_CONSTANTS.ONE,
          time: GENERAL_CONSTANTS.ONE,
          note: GENERAL_CONSTANTS.ONE,
          appointmentStatus: GENERAL_CONSTANTS.ONE,
          stylistId: {
            [EMPLOYEE_PROJECTION_FIELDS.ID]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.ID}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_ID]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_ID}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_NAME]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_NAME}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_EMAIL]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_EMAIL}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_ROLE]: `$${AGGREGATION_FIELDS.ROLE_DETAILS}.${ROLE_PROJECTION_FIELDS.ROLE_NAME}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_PHONE]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_PHONE}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_PHOTO]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_PHOTO}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_JOINING_DATE]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_JOINING_DATE}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_SALARY]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_SALARY}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_ADDRESS]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_ADDRESS}`,
            [EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_STATUS]: `$${AGGREGATION_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_STATUS}`,
          },
          client: {
            [CLIENT_PROJECTION_FIELDS.NAME]: `$${AGGREGATION_FIELDS.CLIENT}.${CLIENT_PROJECTION_FIELDS.NAME}`,
          },
          service: {
            [SERVICE_PROJECTION_FIELDS.SERVICE_NAME]: `$${AGGREGATION_FIELDS.SERVICE_DETAILS}.${SERVICE_PROJECTION_FIELDS.SERVICE_NAME}`,
            [SERVICE_PROJECTION_FIELDS.SERVICE_PRICE]: `$${AGGREGATION_FIELDS.SERVICE_DETAILS}.${SERVICE_PROJECTION_FIELDS.SERVICE_PRICE}`,
          },
        },
      },
    ]);

    const response = {
      employee,
      appointments,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_FETCHING_APPOINTMENTS, error);
    res
      .status(500)
      .json({ message: ERROR_MESSAGES.ERROR_FETCHING_APPOINTMENTS });
  }
};

/**
 * @function getAppointmentsByClient
 * @description Retrieves appointments for a given client from the database.
 * @param {Object} req - The request object containing clientId in params and companyId in the middleware.
 * @param {Object} res - The response object to return the client and appointment data.
 * @returns {Object} JSON response containing client details and their appointments.
 */
export const getAppointmentsByClient = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;

  try {
    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INVALID_CLIENT_ID });
    }

    // Fetch the client using the ObjectId
    const client = await Client.findOne({
      [CLIENT_FIELDS.ID]: id,
      companyId: companyId,
    });
    if (!client) {
      return res.status(404).json({ message: ERROR_MESSAGES.CLIENT_NOT_FOUND });
    }

    // Fetch appointments using the client ObjectId
    const appointments = await Appointment.aggregate([
      {
        $match: {
          isTrashed: false,
          companyId: req.companyId,
          client: new mongoose.Types.ObjectId(id), // Use client ObjectId
        },
      },
      {
        $lookup: {
          from: COLLECTION_NAMES.EMPLOYEES,
          localField: APPOINTMENT_FIELDS.STYLIST_ID,
          foreignField: CLIENT_FIELDS.ID,
          as: APPOINTMENT_FIELDS.STYLIST_ID,
        },
      },
      {
        $unwind: `$${APPOINTMENT_FIELDS.STYLIST_ID}`,
      },
      {
        $lookup: {
          from: COLLECTION_NAMES.SERVICES,
          localField: APPOINTMENT_FIELDS.SERVICE,
          foreignField: SERVICE_FIELDS.ID,
          as: APPOINTMENT_FIELDS.SERVICE,
        },
      },
      {
        $unwind: {
          path: `$${APPOINTMENT_FIELDS.SERVICE}`,
          preserveNullAndEmptyArrays: true,
        }, // Allow empty services
      },
      {
        $project: {
          [APPOINTMENT_FIELDS.ID]: 1,
          [APPOINTMENT_FIELDS.APPOINTMENT_ID]: 1,
          [APPOINTMENT_FIELDS.DATE]: 1,
          [APPOINTMENT_FIELDS.TIME]: 1,
          [APPOINTMENT_FIELDS.NOTE]: 1,
          [APPOINTMENT_FIELDS.STATUS]: 1,
          [`${APPOINTMENT_FIELDS.STYLIST_ID}.${CLIENT_FIELDS.ID}`]: 1,
          [`${APPOINTMENT_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_NAME}`]: 1,
          [`${APPOINTMENT_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_PHONE}`]: 1,
          [`${APPOINTMENT_FIELDS.STYLIST_ID}.${EMPLOYEE_PROJECTION_FIELDS.EMPLOYEE_EMAIL}`]: 1,
          [`${APPOINTMENT_FIELDS.SERVICE}.${SERVICE_FIELDS.SERVICE_NAME}`]: 1,
          [`${APPOINTMENT_FIELDS.SERVICE}.${SERVICE_FIELDS.SERVICE_PRICE}`]: 1,
        },
      },
    ]);

    // Combine client data with appointments
    const response = {
      client, // Include the client details
      appointments, // Include appointments (empty array if none exist)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_FETCHING_APPOINTMENTS, error);
    res
      .status(500)
      .json({ message: ERROR_MESSAGES.ERROR_FETCHING_APPOINTMENTS });
  }
};

/**
 * @desc    Get appointment stats (count of upcoming, completed, and cancelled)
 * @route   GET /api/appointments/stats
 * @access  Private (Requires authentication)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with appointment counts
 */
export const getAppointmentStats = async (req, res) => {
  const { companyId } = req;
  try {
    // Count appointments based on their status
    const upcomingCount = await Appointment.countDocuments({
      isTrashed: false,
      companyId,
      appointmentStatus: APPOINTMENT_STATUS.UPCOMING,
    });

    const completedCount = await Appointment.countDocuments({
      isTrashed: false,
      companyId,
      appointmentStatus: APPOINTMENT_STATUS.COMPLETED,
    });

    const cancelledCount = await Appointment.countDocuments({
      isTrashed: false,
      companyId,
      appointmentStatus: APPOINTMENT_STATUS.CANCELLED,
    });

    // Send back the counts
    res.status(200).json({
      success: true,
      upcoming: upcomingCount,
      completed: completedCount,
      cancelled: cancelledCount,
    });
  } catch (error) {
    console.error("Failed to get appointment stats", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get appointment stats" });
  }
};
