import moment from "moment";
import {
  ERROR_MESSAGES,
  DATE_AND_TIME_FORMAT,
  IST_OFFSET,
  APPOINTMENT_STATUS,
  DATE_FORMAT,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
  FILTER_BY,
  CLIENT,
  GENERAL_CONSTANTS,
  SERVICE,
  STYLIST,
  TIME_FORMAT,
  TIME_CONSTANTS,
} from "../constants.js";
import parseDurationToMinutes from "../utils/duration.js";
import { Employee } from "../models/Employee.js";
import { Client } from "../models/Client.js";
import { Services } from "../models/Services.js";
import {
  generateNextAptId,
  generateNextTransactionId,
} from "../utils/idGenerator.js";
import { Appointment } from "../models/Appointments.js";
import { saveNotification } from "./notification.js";
import mongoose from "mongoose";
import { format } from "date-fns";
import { Payment } from "../models/Payment.js";

/**
 * Service function to handle the business logic of scheduling an appointment.
 * It validates, processes, and stores appointment details, along with sending a notification.
 *
 * @param {Object} req - The request object containing the appointment details.
 * @returns {Promise<Object>} - Returns the newly created appointment details and notification response.
 * @throws {Error} - Throws an error if any validation or processing fails.
 */

export const scheduleAppointments = async (req) => {
  const { clientId, service, note, stylistId, paidStatus } = req.body;
  const { companyId } = req;

  // Extract date and time inputs
  const { appointmentDateTime, date, time } = req.body;

  let appointmentMoment;

  // Handle Mobile input: `appointmentDateTime`
  if (appointmentDateTime) {
    appointmentMoment = moment.tz(appointmentDateTime, "Asia/Kolkata");
  }
  // Handle Web/Dashboard input: separate `date` and `time`
  else if (date && time) {
    const combinedDateTime = `${date} ${time}`;

    appointmentMoment = moment.tz(
      combinedDateTime,
      "YYYY-MM-DD HH:mm",
      "Asia/Kolkata"
    );
  } else {
    throw new Error(ERROR_MESSAGES.INVALID_APPOINTMENT_DATE_TIME);
  }

  // Validate the date-time
  if (!appointmentMoment.isValid()) {
    throw new Error(ERROR_MESSAGES.INVALID_APPOINTMENT_DATE_TIME);
  }

  // Extract formatted date and time
  const formattedDate = appointmentMoment.format(DATE_FORMAT);
  const formattedTime = appointmentMoment.format(TIME_FORMAT);

  // Validate stylist
  const employee = await Employee.findById(stylistId);
  if (!employee) {
    throw new Error(ERROR_MESSAGES.STYLIST_NOT_FOUND);
  }

  const formattedClientId = clientId.toUpperCase();

  // Validate client
  const client = await Client.findOne({
    clientId: formattedClientId,
    companyId,
  });
  if (!client) {
    throw new Error(ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Validate service and get duration
  const serviceDetails = await Services.findById(service);
  if (!serviceDetails) {
    throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND);
  }
  const { duration, price } = serviceDetails;
  const durationInMinutes = parseDurationToMinutes(duration);

  // Convert date-time to UTC
  const appointmentDateTimeUTC = appointmentMoment.utc().toDate();

  if (!appointmentDateTimeUTC || isNaN(appointmentDateTimeUTC.getTime())) {
    throw new Error(ERROR_MESSAGES.INVALID_APPOINTMENT_DATE_TIME);
  }

  // Calculate expiry time
  const expiresAt = new Date(
    appointmentDateTimeUTC.getTime() + durationInMinutes * 60 * 1000
  );
  if (!expiresAt || isNaN(expiresAt.getTime())) {
    throw new Error(ERROR_MESSAGES.INVALID_EXPIRE_TIME_CALCULATION);
  }

  // Determine appointment status
  const nowUTC = new Date();
  let appointmentStatus;
  if (nowUTC < appointmentDateTimeUTC) {
    appointmentStatus = APPOINTMENT_STATUS.UPCOMING;
  } else if (nowUTC >= appointmentDateTimeUTC && nowUTC <= expiresAt) {
    appointmentStatus = APPOINTMENT_STATUS.ONGOING;
  } else {
    appointmentStatus = APPOINTMENT_STATUS.COMPLETED;
  }

  // Generate appointment ID
  const appointmentId = await generateNextAptId(companyId);

  // Create appointment document
  const newAppointment = new Appointment({
    appointmentId,
    clientId,
    client: client._id,
    clientName: client.name,
    service,
    date: appointmentDateTimeUTC,
    time: formattedTime,
    note,
    expiresAt,
    stylistName: employee.employeeName,
    stylistId,
    status: paidStatus,
    appointmentStatus,
    companyId,
  });

  await newAppointment.save();

  let payment = "";
  if (price && price > 0) {
    payment = new Payment({
      companyId,
      clientId,
      appointmentId: newAppointment._id,
      amount: price,
      status: paidStatus,
    });
    // Step 3: Generate transactionId
    const transactionId = await generateNextTransactionId(companyId);
    payment.transactionId = transactionId;
    await payment.save();
  }

  // Step 3: Generate transactionId
  const transactionId = await generateNextTransactionId(companyId);
  payment.transactionId = transactionId;

  // Format date for notification
  const formattedDateUTC = format(
    new Date(appointmentDateTimeUTC),
    DATE_FORMAT
  );

  // Create and save notification
  const notification = {
    companyId,
    message: NOTIFICATION_MESSAGES.NEW_APPOINTMENT_SCHEDULED,
    type: NOTIFICATION_TYPES.APPOINTMENT,
    details: {
      appointmentId: newAppointment._id,
      clientName: client.name,
      status: appointmentStatus,
      appointmentDate: formattedDateUTC,
      time: formattedTime,
      paidStatus: newAppointment.paidStatus,
    },
    timestamp: new Date(),
    isRead: false,
  };

  await saveNotification(notification);

  return {
    appointment: newAppointment,
    selectedTime: appointmentDateTime || `${date} ${time}`,
    appointmentDateTimeUTC: formattedDateUTC,
  };
};

/**
 * Service function to get appointment count by gender.
 * It applies the filter (day, week, month) and aggregates the appointment count by gender.
 *
 * @param {Object} req - The request object containing the filter query parameter (day, week, month).
 * @returns {Promise<Object[]>} - Returns the aggregated count of appointments by gender.
 * @throws {Error} - Throws an error if the aggregation or filtering fails.
 */
export const listAppointmentCountByGender = async (req) => {
  const { filter } = req.query;
  let dateFilter = {};

  // Get the current date and calculate the start of the day
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Apply the filter based on the provided query (day, week, or month)
  switch (filter) {
    case FILTER_BY.DAY:
      dateFilter = {
        date: {
          $gte: startOfDay,
          $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        },
      };
      break;
    case FILTER_BY.WEEK:
      const startOfWeek = new Date(
        startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000
      );
      dateFilter = {
        date: {
          $gte: startOfWeek,
          $lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      };
      break;
    case FILTER_BY.MONTH:
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      };
      break;
    default:
      break;
  }

  // Aggregate the appointments by gender with the applied filters
  const countByGender = await Appointment.aggregate([
    {
      $match: {
        isTrashed: false, // Only include appointments that are not trashed
        ...dateFilter, // Apply the date filter based on the query parameter
        companyId: req.companyId, // Filter by companyId
      },
    },
    {
      $lookup: {
        from: CLIENT.COLLECTION, // Join with the clients collection to access client gender
        localField: CLIENT.FIELD,
        foreignField: "_id",
        as: CLIENT.INFO_FIELD, // This will store client info in a new array field
      },
    },
    {
      $unwind: `$${CLIENT.INFO_FIELD}`, // Flatten the clientInfo array for easier access
    },
    {
      $group: {
        _id: `$${CLIENT.INFO_FIELD}.${CLIENT.GENDER_FIELD}`, // Group by the client's gender
        count: { $sum: 1 }, // Count the number of appointments for each gender
      },
    },
  ]);

  return countByGender;
};

/**
 * Service function to fetch a list of appointments with optional filters (date, status, pagination).
 * It builds the query based on the provided parameters, fetches the appointments, and formats the `expiresAt` date to IST.
 *
 * @param {Object} req - The request object containing query parameters (selectedDate, status, page, limit).
 * @returns {Promise<Object>} - Returns the appointment data, including pagination metadata if applicable.
 * @throws {Error} - Throws an error if the query or appointment fetching fails.
 */
export const getAppointments = async (req) => {
  const { selectedDate, status, page, limit, clientId, isMobile } = req.query;

  // Parse and validate page and limit only if provided
  const parsedPage =
    page && parseInt(page) > GENERAL_CONSTANTS.ZERO ? parseInt(page) : null;
  const parsedLimit =
    limit && parseInt(limit) > GENERAL_CONSTANTS.ZERO ? parseInt(limit) : null;

  let query = {
    isTrashed: false,
    companyId: req.companyId,
    appointmentStatus: status ? status : { $exists: true },
    client: clientId ? clientId : { $exists: true },
  };

  // Add client filter if provided
  if (clientId) {
    query.client = clientId;
  } else if (!clientId && isMobile) {
    // If no clientId and it's a mobile request, return no appointments
    return { data: [], pagination: {} };
  }

  // Filter by selected date
  if (selectedDate) {
    const date = new Date(selectedDate);
    if (isNaN(date.getTime())) {
      throw new Error(ERROR_MESSAGES.INVALID_DATE_FORMAT);
    }
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  // Fetch total count (for pagination metadata if needed)
  const totalCount = await Appointment.countDocuments(query);

  // Build query with optional pagination
  let appointmentQuery = Appointment.find(query)
    .sort({ createdAt: -1 })
    .populate(
      CLIENT.FIELD,
      `${CLIENT.GENDER_FIELD} ${CLIENT.EMAIL_FIELD} ${CLIENT.PHONE_FIELD} ${CLIENT.PHOTO_FIELD} ${CLIENT.NAME_FIELD} ${CLIENT.ADDRESS_FIELD} ${CLIENT.DOB_FIELD}`
    )
    .populate(
      STYLIST.COLLECTION,
      `${STYLIST.EMPLOYEE_NAME} ${STYLIST.EMPLOYEE_PHOTO}`
    )
    .populate(SERVICE.COLLECTION, SERVICE.FIELD);

  if (parsedPage && parsedLimit) {
    const skip = (parsedPage - 1) * parsedLimit;
    appointmentQuery = appointmentQuery.skip(skip).limit(parsedLimit);
  }

  const appointments = await appointmentQuery;

  // Format the expiresAt date to include both date and time, and convert it to IST
  const formattedAppointments = appointments.map((appointment) => {
    const expiresAtIST = moment(appointment.expiresAt)
      .utcOffset(IST_OFFSET) // Convert to IST
      .format(DATE_AND_TIME_FORMAT);

    return {
      ...appointment._doc,
      expiresAt: expiresAtIST, // Set formatted expiresAt to IST
    };
  });

  // Build response
  const response = {
    success: true,
    data: formattedAppointments,
  };

  // Include pagination metadata only if applicable
  if (parsedPage && parsedLimit) {
    response.pagination = {
      total: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalCount / parsedLimit),
    };
  }

  return response;
};

/**
 * Service function to update an appointment based on the provided data.
 * It validates the appointment ID, checks the appointment status, and updates the appointment.
 * It also handles status updates and saves a notification about the update.
 *
 * @param {string} id - The ID of the appointment to be updated.
 * @param {Object} updateData - The data to update the appointment with.
 * @param {string} companyId - The ID of the company to which the appointment belongs.
 * @returns {Promise<Object>} - Returns the updated appointment object after the update is successful.
 * @throws {Error} - Throws an error if the appointment is not found or if there is any issue with the update.
 */
export const updateAppointmentService = async (id, updateData, companyId) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(ERROR_MESSAGES.INVALID_ID_FORMAT);
  }

  // Check if the appointment belongs to the user's company
  const appointment = await Appointment.findOne({
    _id: id,
    companyId,
  }).populate(CLIENT.FIELD, CLIENT.NAME_FIELD);

  if (!appointment) {
    throw new Error(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND);
  }

  // Handle status updates
  const now = new Date();
  if (updateData.appointmentStatus === APPOINTMENT_STATUS.CANCELLED) {
    if (appointment.appointmentStatus !== APPOINTMENT_STATUS.UPCOMING) {
      throw new Error(
        ERROR_MESSAGES.ONLY_UPCOMING_APPOINTMENTS_CAN_BE_CANCELLED
      );
    }
  } else if (updateData.date && updateData.time) {
    const appointmentDateTime = new Date(
      `${updateData.date}T${updateData.time}Z`
    );
    const expiresAt = new Date(
      appointmentDateTime.getTime() + TIME_CONSTANTS.TWO_HOURS_IN_MS
    );

    if (now >= appointmentDateTime && now <= expiresAt) {
      updateData.appointmentStatus = APPOINTMENT_STATUS.ONGOING;
    } else if (now > expiresAt) {
      updateData.appointmentStatus = APPOINTMENT_STATUS.COMPLETED;
    } else {
      updateData.appointmentStatus = APPOINTMENT_STATUS.UPCOMING;
    }
  }

  await Appointment.findByIdAndUpdate(id, updateData, { runValidators: true });

  const updatedAppointment = await Appointment.findOne({
    _id: id,
    companyId,
  }).populate(CLIENT.FIELD, CLIENT.NAME_FIELD);

  if (!updatedAppointment) {
    throw new Error(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND);
  }

  const formattedDate = updatedAppointment.date
    ? format(new Date(updatedAppointment.date), DATE_FORMAT)
    : null;
  const formattedTime = updatedAppointment.time
    ? format(new Date(`1970-01-01T${updatedAppointment.time}Z`), TIME_FORMAT)
    : null;

  const clientName = updatedAppointment.client?.name || "";

  const notification = {
    companyId,
    message: NOTIFICATION_MESSAGES.NEW_APPOINTMENT_SCHEDULED,
    type: NOTIFICATION_TYPES.APPOINTMENT,
    details: {
      appointmentId: updatedAppointment._id,
      clientName: clientName,
      status: updatedAppointment.appointmentStatus,
      appointmentDate: formattedDate,
      time: formattedTime,
    },
    timestamp: new Date(),
    isRead: false,
  };

  await saveNotification(notification);

  return updatedAppointment;
};
