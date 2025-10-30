import {
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
  SUCCESS_MESSAGES,
} from "../constants.js";
import { Payment } from "../models/Payment.js";

/**
 * Get a list of all payments for a company.
 * @param {Object} req - The request object containing companyId.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} - The list of payments or an error message.
 */
export const listPayments = async (req, res) => {
  const { companyId } = req;
  const { page, limit } = req.query;

  try {
    if (!companyId) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    const parsedPage =
      page && parseInt(page) > GENERAL_CONSTANTS.ZERO ? parseInt(page) : 1;
    const parsedLimit =
      limit && parseInt(limit) > GENERAL_CONSTANTS.ZERO ? parseInt(limit) : 10;

    const query = { companyId };
    const totalCount = await Payment.countDocuments(query);

    let paymentQuery = Payment.find(query)
      .populate({
        path: "appointmentId",
        populate: [
          {
            path: "client",
            select: "name",
          },
          {
            path: "stylistId",
            select: "employeeName",
          },
          {
            path: "service",
            select: "serviceName",
          },
        ],
      })
      .sort({ createdAt: -1 });

    const skip = (parsedPage - 1) * parsedLimit;
    paymentQuery = paymentQuery.skip(skip).limit(parsedLimit);

    let payments = await paymentQuery;

    // Transform the response to include names instead of IDs
    payments = payments.map((payment) => ({
      _id: payment._id,
      transactionId: payment.transactionId,
      clientName: payment.appointmentId?.client?.name || "",
      stylistName: payment.appointmentId?.stylistId?.employeeName || "",
      serviceName: payment.appointmentId?.service?.serviceName || "",
      appointmentId: payment.appointmentId?.appointmentId || "",
      amount: payment.amount,
      status: payment.status,
      dateAndTime: payment.dateAndTime,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));

    if (!payments || payments.length === 0) {
      return res
        .status(200)
        .json({ message: SUCCESS_MESSAGES.NO_PAYMENTS_FOUND });
    }

    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PAYMENTS_FETCHED_SUCCESSFULLY,
      payments,
      pagination: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.ERROR_FETCHING_PAYMENTS,
    });
  }
};
