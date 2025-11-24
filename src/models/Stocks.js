import mongoose from "mongoose";
import { GENERAL_CONSTANTS, MODELS, STOCK_STATUSES } from "../constants.js";

/**
 * @typedef {Object} StockIdTrackerSchema
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {number} lastStockId - Tracks the last stock ID. Defaults to 0.
 */
const stockIdTrackerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  lastStockId: { type: Number, default: GENERAL_CONSTANTS.ZERO },
});

/**
 * @typedef {mongoose.Model} StockIdTracker - Mongoose model for tracking stock IDs.
 */
const StockIdTracker = mongoose.model(
  MODELS.STOCK_ID_TRACKER,
  stockIdTrackerSchema
);

/**
 * @typedef {Object} StockSchema
 * @property {string} stockId - Unique identifier for the stock.
 * @property {string} stockName - Name of the stock.
 * @property {mongoose.Schema.Types.ObjectId} companyId - Reference to the Company model.
 * @property {mongoose.Schema.Types.ObjectId} stockCategory - Reference to the Category model.
 * @property {number} price - Price of the stock.
 * @property {number} stockQuantity - Quantity of the stock.
 * @property {Date} stockMFGDate - Manufacturing date of the stock.
 * @property {Date} stockEXPDate - Expiration date of the stock.
 * @property {number} reorderQuantity - Quantity threshold for reordering the stock.
 * @property {string} stockStatus - Current status of the stock (e.g., in stock, low stock).
 * @property {string} stockImage - Image URL of the stock.
 * @property {string} [stockDescription] - Description of the stock.
 * @property {boolean} [isTrashed=false] - Indicates whether the stock is soft-deleted.
 */
const stockSchema = new mongoose.Schema({
  stockId: { type: String, required: true },
  stockName: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  stockCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.CATEGORY, // Reference to the Category model
    required: true,
  },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  stockMFGDate: { type: Date, required: true },
  stockEXPDate: { type: Date, required: true },
  reorderQuantity: { type: Number, required: true },
  stockStatus: {
    type: String,
    enum: [
      STOCK_STATUSES.IN_STOCK,
      STOCK_STATUSES.LOW_STOCK,
      STOCK_STATUSES.OUT_OF_STOCK,
      STOCK_STATUSES.EXPIRED_STOCK,
    ],
    default: STOCK_STATUSES.IN_STOCK,
  },
  stockImage: { type: String, required: true },
  stockDescription: { type: String },
  isTrashed: { type: Boolean, default: false },
});

stockSchema.index({ companyId: 1, stockId: 1 }, { unique: true });

/**
 * @typedef {mongoose.Model} Stocks - Mongoose model for managing stock information.
 */
const Stocks = mongoose.model(MODELS.STOCK, stockSchema);

export { Stocks, StockIdTracker };
