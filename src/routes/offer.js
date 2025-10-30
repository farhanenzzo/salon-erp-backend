import express from "express";
import {
  addOffers,
  listOffers,
  softDeleteOffer,
  updateOfferById,
} from "../controllers/offers.js";
import upload from "../middleware/upload.js";
import { OFFERS_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * Route to list all offers.
 * @route GET /api/offers
 * @access Public
 */
router.route(OFFERS_ROUTES.LIST_OFFERS).get(listOffers);

/**
 * Route to add a new offer.
 * @route POST /api/offers
 * @access Public
 */
router.post(
  OFFERS_ROUTES.ADD_OFFERS,
  upload(UPLOAD_IMAGE_FIELD.IMAGE),
  addOffers
);

/**
 * Route to soft-delete an offer by ID.
 * @route PATCH /api/offers/soft-delete/:id
 * @param {string} id - The ID of the offer to soft-delete (from URL params)
 * @access Public
 */
router.patch(OFFERS_ROUTES.SOFT_DELETE_OFFER, softDeleteOffer);

/**
 * Route to update an offer by ID.
 * @route PATCH /api/offers/:id
 * @param {string} id - The ID of the offer to update (from URL params)
 * @access Public
 */
router.patch(
  OFFERS_ROUTES.UPDATE_OFFER_BY_ID,
  upload(UPLOAD_IMAGE_FIELD.IMAGE),
  updateOfferById
);

export default router;
