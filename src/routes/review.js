import express from "express";
import {
  addReply,
  addReview,
  listReviews,
  updateReply,
} from "../controllers/review.js";
import { REVIEW_ROUTES } from "../constants.js";

const router = express.Router();

/**
 * Route to add a review.
 * @route POST /api/reviews
 * @access Public
 */
router.post(REVIEW_ROUTES.BASE, addReview);

/**
 * Route to list all reviews.
 * @route GET /api/reviews
 * @access Public
 */
router.get(REVIEW_ROUTES.BASE, listReviews);

/** 
@param {string} reviewId - The ID of the review to which the admin is replying
@param {string} reply - The reply message from the admin
@returns {object} 200 - Success response with updated review data
 @returns {object} 404 - Review not found error
 @returns {object} 500 - Server error
 */
router.patch(REVIEW_ROUTES.ADD_REPLY, addReply);

router.patch(REVIEW_ROUTES.UPDATE_REPLY, updateReply); // Define the route for updating a reply

export default router;
