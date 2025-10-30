import mongoose from "mongoose";
import { MODELS, ORDER_STATUS, PAYMENT_STATUS } from "../constants.js";

/**
 * @typedef {Object} OrderIdTracker
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the tracker.
 * @property {number} lastOrderId - The last generated order ID.
 */

/**
 * Mongoose schema for tracking the last order ID.
 * @type {mongoose.Schema<OrderIdTracker>}
 */
const orderIdTrackerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY, // Reference to the Company model
    required: true, // Ensure this is always set
  },
  lastOrderId: { type: Number, default: 0 },
});

/**
 * Mongoose model for the Order ID Tracker schema.
 * @type {mongoose.Model<OrderIdTracker>}
 */
const OrderIdTracker = mongoose.model(
  MODELS.ORDER_ID_TRACKER,
  orderIdTrackerSchema
);

/**
 * @typedef {Object} OrderItem
 * @property {number} sNo - Serial number of the item.
 * @property {string} productName - Name of the product.
 * @property {string} category - Category of the product.
 * @property {string} stockMFGDate - Manufacturing date of the stock.
 * @property {string} stockEXPDate - Expiry date of the stock.
 * @property {number} quantity - Quantity of the product in the order.
 * @property {string} price - Price of a single unit of the product.
 * @property {number} totalPrice - Total price for the product (quantity × price).
 */

/**
 * Mongoose schema for an item in an order.
 * @type {mongoose.Schema<OrderItem>}
 */
const orderItemSchema = new mongoose.Schema({
  sNo: { type: Number, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  stockMFGDate: { type: String, required: true },
  stockEXPDate: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: String, required: true },
  totalPrice: { type: Number, required: true },
});

/**
 * @typedef {Object} Order
 * @property {mongoose.Schema.Types.ObjectId} companyId - The ID of the company associated with the order.
 * @property {string} [orderId] - Unique order ID (optional).
 * @property {Date} orderDate - The date the order was created. Defaults to the current date.
 * @property {OrderItem[]} items - List of items in the order.
 * @property {string} paymentStatus - The payment status of the order. Can be "PAID", "UNPAID", or "PROCESSING".
 * @property {number} totalPrice - Overall total price of the order.
 * @property {string} status - The current status of the order. Can be "DRAFT", "PAID", or "COMPLETED".
 * @property {Object|null} paymentDetails - Payment details of the order (default is null).
 * @property {string} [trackingId] - Unique tracking ID for the order, required for "PAID" or "COMPLETED" statuses.
 * @property {boolean} isTrashed - Whether the order is soft-deleted. Defaults to false.
 */

/**
 * Mongoose schema for the Order model.
 * @type {mongoose.Schema<Order>}
 */
const orderSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.COMPANY,
    required: true,
  },
  orderId: { type: String, required: false, unique: true },
  orderDate: { type: Date, default: new Date() },
  items: [orderItemSchema], // Array of items
  paymentStatus: {
    type: String,
    enum: [
      PAYMENT_STATUS.PAID,
      PAYMENT_STATUS.UNPAID,
      PAYMENT_STATUS.PROCESSING,
    ],
    default: PAYMENT_STATUS.UNPAID,
  },
  totalPrice: { type: Number, required: true }, // Overall total for the order
  status: {
    type: String,
    enum: [ORDER_STATUS.DRAFT, ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED],
    default: ORDER_STATUS.DRAFT, // Default status is 'draft' when items are being added
  },
  paymentDetails: {
    type: Object,
    default: null, // Payment details will be added when the order is confirmed
  },
  trackingId: {
    type: String,
    required: function () {
      return (
        this.status === ORDER_STATUS.PAID ||
        this.status === ORDER_STATUS.COMPLETED
      ); // Only required when status is paid or completed
    },
    unique: true, // Make it unique to avoid duplication
  },
  isTrashed: { type: Boolean, default: false }, // For soft delete
});

/**
 * Mongoose model for the Order schema.
 * @type {mongoose.Model<Order>}
 */
const Order = mongoose.model(MODELS.ORDER, orderSchema);

export { Order, OrderIdTracker };
