import {
  COMPANY_PROFILE,
  DEFAULT_PROFILE_IMAGE_URL,
  ERROR_MESSAGES,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "../constants.js";
import Review from "../models/Reviews.js";
import { User } from "../models/User.js";
import { saveNotification } from "../services/notification.js";
import { getRelativeTime } from "../utils/getRelativeTime.js";

/**
 * Adds a review for a specific appointment.
 * @async
 * @param {Object} req - The request object containing the appointmentId, clientId, rating, and comment in the body.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with the newly created review data or an error message.
 * @throws {Error} If there is an issue creating the review.
 */
export const addReview = async (req, res) => {
  const { appointmentId, rating, comment, serviceId } = req.body;
  const { companyId, customerId } = req;

  try {
    const newReview = new Review({
      appointmentId,
      clientId: customerId,
      rating,
      comment,
      companyId,
      serviceId,
    });

    const review = await newReview.save();

    const notification = {
      companyId,
      message: NOTIFICATION_MESSAGES.NEW_REVIEW_ADDED,
      type: NOTIFICATION_TYPES.REVIEWS,
      details: {
        appointmentId: review._id,
        clientName: review.clientId,
        rating: review.rating,
        service: review.serviceId,
      },
      timestamp: new Date(),
      isRead: false,
    };

    console.log("notification in backend", notification);

    await saveNotification(notification);

    res.status(200).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lists reviews for a company. If a serviceId is provided, it filters reviews for that specific service.
 *
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The ID of the company (injected by middleware).
 * @param {Object} req.query - The query parameters.
 * @param {string} [req.query.serviceId] - The optional ID of the service to filter reviews by.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with the list of reviews or an error message.
 */
export const listReviews = async (req, res) => {
  const { companyId } = req;
  const { serviceId, page, limit } = req.query;

  console.log("req querry", req.query);

  try {
    const filter = { companyId, isTrashed: false };

    if (serviceId) {
      filter.serviceId = serviceId;
    }

    // Parse page and limit for pagination
    const parsedPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const parsedLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

    // Calculate skip value
    const skip = (parsedPage - 1) * parsedLimit;

    // Fetch reviews with skip and limit
    const reviews = await Review.find(filter)
      .sort({ hasReply: 1, createdAt: -1 }) // Prioritize reviews without replies, then by latest date
      .skip(skip)
      .limit(parsedLimit)
      .populate({
        path: "clientId",
        select: "name photo",
      });

    // Add relative time to each review and its replies
    const reviewsWithFormattedReplies = reviews.map((review) => {
      const createdAtRelative = getRelativeTime(review.createdAt);

      // Format replies' repliedAt field to relative time
      const formattedReplies = review.replies.map((reply) => {
        const companyProfile = COMPANY_PROFILE || DEFAULT_PROFILE_IMAGE_URL; // Default profile image if none set

        return {
          ...reply.toObject(),
          repliedAtRelative: getRelativeTime(reply.repliedAt),
          companyProfile,
        };
      });

      return {
        ...review.toObject(),
        createdAtRelative,
        replies: formattedReplies, // Update replies with relative time
      };
    });

    const reviewsCount = await Review.countDocuments(filter); // Total count of reviews

    // Add pagination metadata to the response
    res.status(200).json({
      success: true,
      reviews: reviewsWithFormattedReplies,
      count: reviewsCount,
      pagination: {
        total: reviewsCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(reviewsCount / parsedLimit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.ERROR_LISTING_REVIEWS });
  }
};

export const addReply = async (req, res) => {
  const { reviewId } = req.params;
  const { replyMessage } = req.body;
  const { companyId, userId } = req;

  console.log("user id  in req", req);

  try {
    const review = await Review.findOne({ _id: reviewId, companyId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.REVIEW_NOT_FOUND,
      });
    }

    const admin = await User.findOne(
      {
        firebaseUid: userId,
        company: companyId,
      },
      "name"
    );
    console.log("admin in reply", admin);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    const companyProfile = COMPANY_PROFILE || DEFAULT_PROFILE_IMAGE_URL;

    const newReply = {
      admin: admin.name,
      replyMessage,
      repliedAt: new Date(), // Use new Date() instead of Date.now()
      companyProfile: companyProfile,
    };

    review.replies.push(newReply);
    await review.save();

    // Format the response
    const reviewObj = review.toObject();
    const formattedReview = {
      ...reviewObj,
      createdAtRelative: getRelativeTime(reviewObj.createdAt),
      replies: reviewObj.replies.map((reply) => ({
        ...reply, // Don't call toObject() here since it's already an object
        repliedAtRelative: getRelativeTime(reply.repliedAt),
      })),
    };

    res.status(200).json({
      success: true,
      review: formattedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReply = async (req, res) => {
  const { reviewId, replyId } = req.params; // Accept reviewId and replyId from the URL
  const { replyMessage } = req.body; // The updated reply message
  const { companyId, userId } = req; // Extract companyId and userId from req

  try {
    // Find the review that matches both reviewId and companyId
    const review = await Review.findOne({ _id: reviewId, companyId });

    if (!review) {
      return res.status(404).json({ message: ERROR_MESSAGES.REVIEW_NOT_FOUND });
    }

    // Find the specific reply within the review using replyId
    const reply = review.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({ message: ERROR_MESSAGES.REPLY_NOT_FOUND });
    }

    // Check if the user is authorized to edit the reply
    const admin = await User.findOne(
      {
        firebaseUid: userId,
        company: companyId,
      },
      "name userProfile"
    );

    if (!admin) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // Update the reply message and timestamp
    reply.replyMessage = replyMessage;
    reply.repliedAt = new Date(); // Use a proper Date object

    await review.save(); // Save the updated review with the updated reply

    // Format the response object with relative times
    const formattedReview = {
      ...review.toObject(),
      createdAtRelative: getRelativeTime(review.createdAt),
      replies: review.replies.map((r) => ({
        ...r.toObject(),
        repliedAtRelative: getRelativeTime(r.repliedAt),
      })),
    };

    res.status(200).json({ success: true, review: formattedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
