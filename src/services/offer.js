import { format } from "date-fns";
import { Offers } from "../models/Offers.js";
import {
  DATA_TYPE,
  DATE_AND_TIME_FORMAT,
  DATE_FORMAT,
  DAY_BEGINNING,
  DAY_END,
  ERROR_MESSAGES,
  MOMENT_DATE_FORMAT,
  SUCCESS_MESSAGES,
  TIME_FORMAT,
  TIME_ZONE,
} from "../constants.js";
import { uploadImageToBlob } from "../utils/azureUpload.js";
import moment from "moment-timezone";

/**
 * Creates a new offer in the database.
 * @async
 * @param {Object} offerData - The offer data, including start and end dates.
 * @param {ObjectId} companyId - The company ID associated with the offer.
 * @returns {Promise<Object>} The created offer document.
 * @throws {Error} If any validation fails or the offer cannot be saved.
 */
export const createOffer = async (offerData, companyId, file) => {
  if (!companyId) {
    throw new Error(ERROR_MESSAGES.NO_COMPANY_ID_FOUND);
  }

  const { dateRange, ...otherData } = offerData;
  let startDate, endDate;
  let photoToUse = "";

  if (!dateRange || typeof dateRange !== DATA_TYPE.STRING) {
    throw new Error(ERROR_MESSAGES.BOTH_START_AND_END_DATES_REQUIRED);
  }

  try {
    const [start, end] = dateRange
      .split(",")
      .map((date) => new Date(date.trim()));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format.");
    }

    if (start >= end) {
      throw new Error("Start date must be before end date.");
    }

    startDate = start.toISOString();
    endDate = end.toISOString();
  } catch (error) {
    throw new Error("Invalid date format.");
  }

  if (file) {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      photoToUse = await uploadImageToBlob(file.buffer, fileName);
    } catch (error) {
      throw new Error("Image upload failed.");
    }
  }

  const newOfferData = {
    ...otherData,
    dateRange: { start: startDate, end: endDate },
    image: photoToUse,
    companyId: companyId,
  };

  const newOffer = new Offers(newOfferData);
  return await newOffer.save();
};

export const fetchOffers = async (companyId) => {
  const offers = await Offers.find({
    isTrashed: false,
    isExpired: false,
    companyId: companyId,
  }).sort({ createdAt: -1 });

  return offers.map((offer) => {
    const startDate = moment
      .utc(offer.dateRange.start)
      .tz(TIME_ZONE)
      .format(MOMENT_DATE_FORMAT);
    const endDate = moment
      .utc(offer.dateRange.end)
      .tz(TIME_ZONE)
      .format(MOMENT_DATE_FORMAT);

    return {
      ...offer._doc,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      createdAt: moment
        .utc(offer.createdAt)
        .tz(TIME_ZONE)
        .format(DATE_AND_TIME_FORMAT),
      updatedAt: moment
        .utc(offer.updatedAt)
        .tz(TIME_ZONE)
        .format(DATE_AND_TIME_FORMAT),
    };
  });
};

export const getOfferById = async (id) => {
  const offer = await Offers.findById(id);
  if (!offer || offer.isTrashed) {
    throw new Error(ERROR_MESSAGES.OFFER_NOT_FOUND);
  }
  return offer;
};

/**
 * Updates an offer by its ID and companyId.
 * Validates that the scheduled date is not in the past.
 * @async
 * @param {string} id - The ID of the offer to update.
 * @param {Object} updateData - The data to update the offer with.
 * @param {string} companyId - The company ID associated with the offer.
 * @returns {Promise<Object>} The updated offer document.
 * @throws {Error} If the scheduled date is in the past.
 */
export const updateOffer = async (id, updateData, companyId) => {
  const { scheduledDate } = updateData;

  // Ensure the scheduled date is not in the past
  if (scheduledDate && new Date(scheduledDate) < new Date()) {
    throw new Error(ERROR_MESSAGES.SCHEDULED_DATE_TIME_SHOULD_NOT_BE_IN_PAST);
  }

  // Find and update the offer
  return await Offers.findOneAndUpdate(
    { _id: id, companyId: companyId }, // Query with both id and companyId
    updateData, // Data to update
    { new: true } // Return the updated document
  );
};

/**
 * Soft deletes an offer by marking it as trashed.
 * @async
 * @param {string} id - The ID of the offer to delete.
 * @param {string} companyId - The company ID associated with the offer.
 * @returns {Promise<Object>} The updated offer document with the trashed status.
 */
export const deleteOffer = async (id, companyId) => {
  // Find and update the offer, marking it as trashed
  return await Offers.findOneAndUpdate(
    { _id: id, companyId: companyId }, // Query with both id and companyId
    { isTrashed: true }, // Mark the offer as trashed
    { new: true } // Return the updated document
  );
};

/**
 * Updates offers to mark them as expired if the end date is in the past.
 * @async
 * @param {string} companyId - The company ID associated with the offers.
 * @returns {Promise<Object>} The result message, indicating how many offers were marked as expired.
 */
export const updateExpiredOffers = async (companyId) => {
  const now = new Date();

  // Update offers that are not trashed and have a past end date
  const result = await Offers.updateMany(
    {
      isTrashed: false,
      isExpired: false,
      companyId: companyId,
      dateRange: {
        end: { $lt: now }, // End date is in the past
      },
    },
    { $set: { isExpired: true } } // Mark the offer as expired
  );

  // Return a message with the number of expired offers
  return {
    message: `${result.modifiedCount} ${SUCCESS_MESSAGES.OFFERS_MARKED_EXPIRED}`,
  };
};
