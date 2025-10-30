import { format, parseISO } from "date-fns";
import { DATE_FORMAT, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants.js";
import {
  createOffer,
  deleteOffer,
  fetchOffers,
  updateOffer,
} from "../services/offer.js";
import { uploadImageToBlob } from "../utils/azureUpload.js";

/**
 * Adds a new offer, optionally including an uploaded image.
 * The dateRange from the frontend is split into start and end dates before saving.
 * @async
 * @param {Object} req - The request object containing offer data and optional file.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with the created offer data or an error message.
 * @throws {Error} If an error occurs during offer creation or image upload.
 */
export const addOffers = async (req, res) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    const offer = await createOffer(req.body, companyId, req.file);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.OFFER_ADDED,
      offer: offer,
    });
  } catch (error) {
    console.error("Add Offer Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves all offers for a specific company.
 * @async
 * @param {Object} req - The request object containing companyId.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with the list of offers or an error message.
 * @throws {Error} If an error occurs while fetching the offers.
 */
export const listOffers = async (req, res) => {
  try {
    const { companyId } = req;
    const offers = await fetchOffers(companyId);
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: ERROR_MESSAGES.FAILED_LISTING_OFFERS,
      error: error.message,
    });
  }
};

/**
 * Soft deletes an offer by its ID.
 * @async
 * @param {Object} req - The request object containing the offer ID.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with the deleted offer data or an error message.
 * @throws {Error} If an error occurs while deleting the offer.
 */
export const softDeleteOffer = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;

  try {
    const offer = await deleteOffer(id, companyId);
    if (!offer) {
      return res.status(404).json({ message: ERROR_MESSAGES.OFFER_NOT_FOUND });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({
      message: ERROR_MESSAGES.FAILED_DELETING_OFFER,
      error: error.message,
    });
  }
};

/**
 * Updates an offer by its ID, optionally including a new image.
 * @async
 * @param {Object} req - The request object containing the offer ID, update data, and optional file.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with the updated offer data or an error message.
 * @throws {Error} If an error occurs while updating the offer or image upload.
 */
export const updateOfferById = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const { companyId } = req;

    let photoToUse = "";
    // Check if a file was uploaded
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        photoToUse = await uploadImageToBlob(req.file.buffer, fileName); // Upload and get the URL
      } catch (error) {
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    }

    const dataWithIMG = {
      ...req.body,
      image: photoToUse || updateData.image, // Use the uploaded image URL or the existing image URL
    };

    const offer = await updateOffer(id, dataWithIMG, companyId);
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_UPDATING_OFFER, error);
    res.status(500).json({
      message: ERROR_MESSAGES.FAILED_UPDATING_OFFER,
      error: error.message,
    });
  }
};
