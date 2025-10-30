import Stripe from "stripe";
import { Order } from "../models/Orders.js";
import { STRIPE_SECRET_KEY } from "../config/env.js";
import {
  ERROR_MESSAGES,
  PAYMENT_STATUSES,
  RESPONSE,
  STRIPE_PAYMENT_INTENT_TYPES,
  SUCCESS_MESSAGES,
} from "../constants.js";

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Utility function to clean and parse the price
/**
 * Cleans and parses the price to ensure it's a valid number.
 *
 * @param {number|string} price - The price to be cleaned and parsed.
 * @returns {number} - The cleaned price as a float.
 * @throws {Error} - Throws an error if the price is invalid.
 */
const cleanPrice = (price) => {
  // Ensure price is treated as a string, in case it's passed as a number
  const priceString = price.toString();

  const cleanedPrice = parseFloat(priceString.replace(/[^\d.-]/g, ""));
  if (isNaN(cleanedPrice) || cleanedPrice <= 0) {
    throw new Error(ERROR_MESSAGES.INVALID_PRICE);
  }
  return cleanedPrice;
};

/**
 * Creates a payment intent for the given items and company.
 *
 * @param {string} companyId - The ID of the company making the payment.
 * @param {Array} items - The items to be purchased, each containing a price and quantity.
 * @returns {Promise<string>} - The client secret for the payment intent to be used in the frontend.
 * @throws {Error} - Throws an error if the payment intent creation fails.
 */
// export const createPaymentIntent = async (companyId, items) => {
//   // Validate that items is a non-empty array
//   if (!Array.isArray(items) || items.length === 0) {
//     throw new Error(ERROR_MESSAGES.ITEMS_MUST_BE_A_NON_EMPTY_ARRAY);
//   }

//   // Calculate total amount based on items array
//   let totalAmount = 0;
//   for (const item of items) {
//     const price = cleanPrice(item.totalPrice);
//     totalAmount += price * (item.quantity || 1); // Use quantity if provided, otherwise default to 1
//   }

//   if (totalAmount <= 0) {
//     throw new Error(ERROR_MESSAGES.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO);
//   }

//   // Create the payment intent using USD as the currency (default)
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(totalAmount * 100), // Convert to cents
//       currency: CURRENCY, // Default to USD
//       metadata: {
//         order_details: JSON.stringify(items),
//         companyId: String(companyId),
//       },
//     });

//     return paymentIntent.client_secret; // Return the client secret for frontend to process payment
//   } catch (error) {
//     // Error handling in case something goes wrong with Stripe's API
//     console.error(ERROR_MESSAGES.FAILED_CREATING_PAYMENT_INTENT, error);
//     throw new Error(ERROR_MESSAGES.FAILED_CREATING_PAYMENT_INTENT);
//   }
// };

/**
 * Handles Stripe webhooks for payment intent updates.
 *
 * @param {Object} event - The Stripe event object.
 * @returns {Promise<Object>} - The status of the event handling.
 */
export const handleStripeWebhook = async (event) => {
  switch (event.type) {
    case STRIPE_PAYMENT_INTENT_TYPES.PAYMENT_INTENT_SUCCEEDED:
      return await handlePaymentSucceeded(event.data.object);

    case STRIPE_PAYMENT_INTENT_TYPES.PAYMENT_INTENT_FAILED:
      return await handlePaymentFailed(event.data.object);

    case STRIPE_PAYMENT_INTENT_TYPES.CHARGE_REFUNDED:
      return await handleRefund(event.data.object);

    default:
      console.log(`${ERROR_MESSAGES.UNHANDLED_EVENT_TYPE} ${event.type}`);
      return { status: ERROR_MESSAGES.UNHANDLED_ERROR, eventType: event.type };
  }
};

/**
 * Handles a successful payment intent and updates the order status.
 *
 * @param {Object} paymentIntent - The payment intent object from Stripe.
 * @returns {Object} - The result of the payment handling.
 * @throws {Error} - Throws an error if the order is not found or any other issue occurs.
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const companyId = paymentIntent.metadata.companyId;
    // Update order status in your database
    const order = await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        status: PAYMENT_STATUSES.PAID,
        paymentStatus: PAYMENT_STATUSES.COMPLETED,
        companyId: companyId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Optional: Send confirmation email
    await sendPaymentConfirmationEmail(order.customerEmail, order);

    return {
      status: RESPONSE.SUCCESS,
      orderId: order._id,
      message: SUCCESS_MESSAGES.PAYMENT_PROCESSED_SUCCESSFULLY,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Handles a failed payment intent and updates the order status.
 *
 * @param {Object} paymentIntent - The payment intent object from Stripe.
 * @returns {Object} - The result of the payment handling.
 * @throws {Error} - Throws an error if the order is not found or any other issue occurs.
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const companyId = paymentIntent.metadata.companyId;

    const order = await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        status: PAYMENT_STATUSES.PAYMENT_FAILED,
        paymentStatus: PAYMENT_STATUSES.FAILED,
        failureReason: paymentIntent.last_payment_error?.message,
        companyId: companyId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    return {
      status: PAYMENT_STATUSES.FAILED,
      orderId: order._id,
      message: ERROR_MESSAGES.PAYMENT_FAILED,
      reason: paymentIntent.last_payment_error?.message,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Handles a refund event and updates the order status.
 *
 * @param {Object} charge - The charge object from Stripe.
 * @returns {Object} - The result of the refund handling.
 * @throws {Error} - Throws an error if the order is not found or any other issue occurs.
 */
const handleRefund = async (charge) => {
  try {
    const companyId = charge.metadata.companyId;

    const order = await Order.findOneAndUpdate(
      { chargeId: charge.id },
      {
        status: PAYMENT_STATUSES.REFUNDED,
        paymentStatus: PAYMENT_STATUSES.REFUNDED,
        companyId: companyId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    return {
      status: PAYMENT_STATUSES.REFUNDED,
      orderId: order._id,
      message: SUCCESS_MESSAGES.PAYMENT_REFUNDED,
    };
  } catch (error) {
    throw error;
  }
};

export const createPaymentIntent = async (companyId, price) => {
  const companyIdString = companyId.toString();
  // Common payment intent creation logic for both products and appointments
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price * 100, // Convert price to cents
    currency: "usd",
    description: "Payment",
    metadata: { companyId: companyIdString },
  });
  console.log("payment intend", paymentIntent);
  return paymentIntent.client_secret;
};
