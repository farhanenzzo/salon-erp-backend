import moment from "moment";
import { Appointment } from "../models/Appointments.js";
import { ERROR_MESSAGES } from "../constants.js";

export const getRevenueStats = async (req, res) => {
  const { companyId } = req;
  const { duration } = req.query;

  try {
    let startDate, endDate;

    // Determine start and end dates based on selected duration
    if (duration === "daily") {
      // Set the start date to the beginning of the current day
      startDate = moment().startOf("day").toDate(); // Convert to JavaScript Date object
      // Set the end date to the end of the current day
      endDate = moment().endOf("day").toDate(); // Convert to JavaScript Date object
    } else if (duration === "weekly") {
      startDate = moment().startOf("isoWeek").toDate();
      endDate = moment().endOf("isoWeek").toDate();
    } else if (duration === "monthly") {
      startDate = moment().startOf("month").toDate();
      endDate = moment().endOf("month").toDate();
    } else {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_DURATION });
    }

    // Fetch all paid appointments within the selected duration
    const appointments = await Appointment.find({
      companyId,
      status: "paid",
      isTrashed: false,
      date: {
        $gte: startDate, // Greater than or equal to the start date
        $lte: endDate, // Less than or equal to the end date
      },
    }).populate("service", "price serviceName");

    // Calculate revenue per service safely
    const revenuePerService = appointments.reduce((acc, appointment) => {
      const price = appointment.service?.price
        ? Number(appointment.service.price)
        : 0;
      const serviceName = appointment.service?.serviceName || "";

      if (!acc[serviceName]) {
        acc[serviceName] = 0; // Initialize if the service doesn't exist yet
      }

      acc[serviceName] += price; // Accumulate revenue for each service
      return acc;
    }, {});

    return res.json({
      duration,
      revenuePerService, // Sending service-wise revenue in the response
    });
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
