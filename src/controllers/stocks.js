import mongoose from "mongoose";
import { Stocks } from "../models/Stocks.js";
import {
  ERROR_MESSAGES,
  STOCK_STATUSES,
  SUCCESS_MESSAGES,
} from "../constants.js";
import { uploadImageToBlob } from "../utils/azureUpload.js";
import { stockValidationSchema } from "../validators/stock.js";
import { generateNextStockId } from "../utils/idGenerator.js";
import Category from "../models/Category.js";

/**
 * Adds a new stock item to the inventory, including image upload and stock status determination.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing stock details.
 * @param {string} req.body.stockName - The name of the stock item.
 * @param {string} req.body.stockCategory - The category of the stock item.
 * @param {number} req.body.stockQuantity - The quantity of the stock item.
 * @param {string} req.body.stockMFGDate - The manufacturing date of the stock item.
 * @param {string} req.body.stockEXPDate - The expiration date of the stock item.
 * @param {string} req.body.stockDescription - The description of the stock item.
 * @param {number} req.body.reorderQuantity - The quantity at which the stock should be reordered.
 * @param {number} req.body.price - The price of the stock item.
 * @param {Object} req.file - The uploaded file for the stock image.
 * @param {string} req.companyId - The ID of the company adding the stock.
 * @param {Object} res - The response object.
 * @returns {Object} - The response containing a success message and the added stock, or an error message.
 */
export const addNewStock = async (req, res) => {
  try {
    const {
      stockName,
      stockCategory, // This will now be the categoryId from frontend
      stockQuantity,
      stockMFGDate,
      stockEXPDate,
      stockDescription,
      reorderQuantity,
      price,
    } = req.body;

    // Validate the request body using Joi schema
    const { error } = stockValidationSchema.validate(req.body, {
      abortEarly: false, // Collect all errors, not just the first one
    });

    if (error) {
      const errorDetails = error.details.map((err) => err.message);
      return res.status(400).json({
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errorDetails,
      });
    }

    const { companyId } = req;

    // Ensure the category exists
    const categoryExists = await Category.findOne({
      _id: stockCategory,
      companyId,
    });
    if (!categoryExists) {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_CATEGORY });
    }

    const stockExists = await Stocks.findOne({
      stockName,
      companyId,
      stockCategory,
      isTrashed: false,
    });

    if (stockExists) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.STOCK_ALREADY_EXISTS });
    }

    // Validate the file (stockImage)
    if (!req.file) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.STOCK_IMAGE_REQUIRED });
    }

    let productImage = null;

    // Check if a file was uploaded
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        productImage = await uploadImageToBlob(req.file.buffer, fileName); // Upload and get the URL
      } catch (error) {
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    }

    const currentDate = new Date();
    const parsedStockQuantity = parseInt(stockQuantity, 10);
    const parsedReorderQuantity = parseInt(reorderQuantity, 10);
    const parsedStockEXPDate = new Date(stockEXPDate);

    const updatedStockStatus = (() => {
      if (parsedStockEXPDate < currentDate) {
        return STOCK_STATUSES.EXPIRED_STOCK;
      }
      if (parsedStockQuantity <= parsedReorderQuantity) {
        return STOCK_STATUSES.LOW_STOCK;
      }
      return STOCK_STATUSES.IN_STOCK;
    })();

    const newStock = new Stocks({
      stockName,
      stockCategory, // Store categoryId here
      stockQuantity,
      stockMFGDate,
      stockEXPDate,
      stockImage: productImage,
      stockDescription,
      stockStatus: updatedStockStatus,
      reorderQuantity,
      companyId,
      price,
    });

    await newStock.save();

    const generateStockId = await generateNextStockId(companyId);

    newStock.stockId = generateStockId;
    await newStock.save();

    res.status(201).json({
      message: SUCCESS_MESSAGES.STOCK_ADDED_SUCCESSFULLY,
      stock: newStock,
    });
  } catch (error) {
    res.status(500).json({
      message: ERROR_MESSAGES.FAILED_TO_ADD_STOCK,
      error: error.message,
    });
  }
};

/**
 * Lists stocks based on filters like status and pagination.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters for filtering and pagination.
 * @param {string} [req.query.status] - The stock status to filter by (e.g., LOW_STOCK, EXPIRED_STOCK).
 * @param {number} [req.query.page] - The page number for pagination.
 * @param {number} [req.query.limit] - The number of items per page for pagination.
 * @param {string} req.companyId - The ID of the company requesting the stocks.
 * @param {Object} res - The response object.
 * @returns {Object} - The response containing the list of stocks, or an error message in case of failure.
 */
export const listStocks = async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    // Base match criteria
    let matchCriteria = {
      isTrashed: false,
      companyId: req.companyId,
    };

    // Handle different status filters
    switch (status) {
      case STOCK_STATUSES.LOW_STOCK:
        matchCriteria = {
          ...matchCriteria,
          $expr: { $lt: ["$stockQuantity", "$reorderQuantity"] },
        };
        break;
      case STOCK_STATUSES.EXPIRED_STOCK:
        matchCriteria.stockEXPDate = { $lt: new Date() }; // Handle expired stocks
        break;
      case STOCK_STATUSES.IN_STOCK:
        matchCriteria = {
          ...matchCriteria,
          $expr: { $gt: ["$stockQuantity", "$reorderQuantity"] },
        };
        break;
      case STOCK_STATUSES.OUT_OF_STOCK:
        matchCriteria.stockQuantity = { $lt: 1 };
        break;
      default:
        break;
    }

    // Base pipeline stages for aggregation
    const baseStages = [
      {
        $match: matchCriteria,
      },
      {
        $lookup: {
          from: "categories", // Ensure this matches your collection name
          localField: "stockCategory",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true, // In case a category is missing
        },
      },
      {
        $project: {
          _id: 1,
          stockId: 1,
          stockName: 1,
          stockCategory: {
            id: "$stockCategory", // Category ID
            name: "$categoryInfo.name", // Category Name
          },
          stockQuantity: 1,
          reorderQuantity: 1,
          stockMFGDate: 1,
          stockEXPDate: 1,
          stockDescription: 1,
          stockStatus: 1,
          stockImage: 1,
          price: 1,
        },
      },
    ];

    // Handle pagination if both page and limit are provided
    if (page && limit) {
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);

      if (parsedPage > 0 && parsedLimit > 0) {
        // Get total count for pagination
        const totalCount = await Stocks.aggregate([
          { $match: matchCriteria },
          { $count: "total" },
        ]);

        const skip = (parsedPage - 1) * parsedLimit;

        // Execute query with pagination
        const stocks = await Stocks.aggregate([
          ...baseStages,
          { $skip: skip },
          { $limit: parsedLimit },
        ]);

        // Return paginated response
        return res.status(200).json({
          data: stocks,
          pagination: {
            total: totalCount[0]?.total || 0,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil((totalCount[0]?.total || 0) / parsedLimit),
          },
        });
      }
    }

    // If no pagination or invalid params, return all records
    const stocks = await Stocks.aggregate(baseStages);
    return res.status(200).json({ data: stocks });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_LIST_STOCK, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_LIST_STOCK });
  }
};

/**
 * Soft deletes a stock by marking it as trashed.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the stock to be deleted.
 * @param {string} req.companyId - The ID of the company associated with the request.
 * @param {Object} res - The response object.
 * @returns {Object} - A response indicating the success or failure of the operation.
 */
export const softDeleteStock = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID_FORMAT });
    }

    if (!companyId) {
      return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }

    // Check if the stock belongs to the user's company
    const stock = await Stocks.findOne({
      _id: id,
      companyId,
    });

    if (!stock) {
      return res.status(404).json({
        error: ERROR_MESSAGES.STOCK_NOT_FOUND_OR_DOESNT_BELONG_TO_YOUR_COMPANY,
      });
    }

    // Perform the soft delete
    await Stocks.updateOne({ _id: id, companyId }, { isTrashed: true });

    res.status(200).json({ message: SUCCESS_MESSAGES.STOCK_DELETING_SUCCESS });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_DELETING_STOCK, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_DELETING_STOCK });
  }
};

/**
 * Updates the status of expired stocks for a given company.
 *
 * @param {string} companyId - The ID of the company whose stocks need to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const updateExpiredStocks = async (companyId) => {
  try {
    const result = await Stocks.updateMany(
      {
        companyId: companyId,
        stockEXPDate: { $lt: new Date() },
        stockStatus: { $ne: STOCK_STATUSES.EXPIRED_STOCK },
        isTrashed: false,
      },
      {
        $set: { stockStatus: STOCK_STATUSES.EXPIRED_STOCK },
      }
    );
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_UPDATING_EXPIRED_STOCK, error);
  }
};

/**
 * Update an existing stock.
 * This controller handles updating stock details, including image updates.
 *
 * @param {Object} req - The request object containing updated stock details.
 * @param {Object} res - The response object used to send the response.
 * @returns {Object} The updated stock object or an error message.
 */
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params; // Stock ID from the URL
    const updateData = req.body; // Updated stock data from the request body
    const { companyId } = req; // Company ID from the request

    // Validate the request body using Joi schema
    const { error } = stockValidationSchema.validate(updateData, {
      abortEarly: false, // Collect all errors, not just the first one
    });

    if (error) {
      const errorDetails = error.details.map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation error", errors: errorDetails });
    }

    // Find the stock to update
    const stock = await Stocks.findOne({
      _id: id,
      companyId,
      isTrashed: false,
    });

    if (!stock) {
      return res.status(404).json({ message: ERROR_MESSAGES.STOCK_NOT_FOUND });
    }

    let productImage = stock.stockImage; // Default to the current image

    // Check if a new image was uploaded
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        productImage = await uploadImageToBlob(req.file.buffer, fileName); // Upload and get the URL
      } catch (error) {
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    }

    const currentDate = new Date();
    const parsedStockQuantity = parseInt(updateData.stockQuantity, 10);
    const parsedReorderQuantity = parseInt(updateData.reorderQuantity, 10);
    const parsedStockEXPDate = new Date(updateData.stockEXPDate);

    const updatedStockStatus = (() => {
      if (parsedStockEXPDate < currentDate) {
        return STOCK_STATUSES.EXPIRED_STOCK;
      }
      if (parsedStockQuantity <= parsedReorderQuantity) {
        return STOCK_STATUSES.LOW_STOCK;
      }
      return STOCK_STATUSES.IN_STOCK;
    })();

    // Update the stock document with new data
    const updatedStock = await Stocks.findByIdAndUpdate(
      id,
      {
        ...updateData, // Spread the update data
        stockImage: productImage, // Update the image URL if provided
        stockStatus: updatedStockStatus, // Update the stock status based on the new data
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: SUCCESS_MESSAGES.STOCK_UPDATED_SUCCESSFULLY,
      stock: updatedStock,
    });
  } catch (error) {
    res.status(500).json({
      message: ERROR_MESSAGES.FAILED_TO_UPDATE_STOCK,
      error: error.message,
    });
  }
};

/**
 * @function getStockById
 * @description Retrieves the details of a single stock by its ID.
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - The ID of the stock to retrieve.
 * @param {Object} req.companyId - The ID of the company (provided by middleware).
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing the stock details or an error message.
 */
export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find stock by ID and ensure it belongs to the same company
    const stock = await Stocks.findOne({
      _id: id,
      isTrashed: false,
      companyId: req.companyId, 
    }).populate("stockCategory" , "_id name")

    if (!stock) {
      // If stock is not found, return a 404 response
      return res.status(404).json({ message: ERROR_MESSAGES.STOCK_NOT_FOUND });
    }

    // Return stock details as JSON response
    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    // Return a 500 response in case of server error
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.FAILED_TO_LIST_STOCK });
  }
};

export const getStockCount = async (req, res) => {
  const { companyId } = req;
  try {
    if (!companyId) {
      return res
        .status(404)
        .json({ success: false, message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }
    const count = await Stocks.countDocuments({ companyId, isTrashed: false });

    return res.status(200).json({ success: true, data: count });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
