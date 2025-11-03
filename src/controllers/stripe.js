// import Stripe from "stripe";
// import {
//   createPaymentIntent,
//   handleStripeWebhook,
// } from "../services/stripe.js";
// import { ERROR_MESSAGES, STRIPE_SIGNATURE_HEADER } from "../constants.js";

// /**
//  * Controller to create a payment intent for a company.
//  * @async
//  * @function createPaymentIntentController
//  * @param {Object} req - The HTTP request object.
//  * @param {string} req.companyId - The ID of the company making the request.
//  * @param {Object} req.body - The request body.
//  * @param {Array} req.body.items - The list of items for the payment intent.
//  * @param {Object} res - The HTTP response object.
//  * @returns {Promise<void>} Sends a JSON response containing the client secret or an error message.
//  */

// export const createPaymentIntentController = async (req, res) => {
//   try {
//     const { companyId } = req;
//     const { price } = req.body; // Just price, no need for "type"

//     if (!companyId) {
//       return res
//         .status(403)
//         .json({ error: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
//     }

//     // Create payment intent for both products and appointments without the 'type' distinction
//     const clientSecret = await createPaymentIntent(companyId, price);

//     res.status(200).json({ clientSecret });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error.message });
//   }
// };

// /**
//  * Controller to handle Stripe webhook events.
//  * @async
//  * @function stripeWebhookController
//  * @param {Object} req - The HTTP request object.
//  * @param {Object} req.headers - The request headers.
//  * @param {string} req.headers[STRIPE_SIGNATURE_HEADER] - The Stripe signature header for webhook verification.
//  * @param {Buffer} req.body - The raw request body for Stripe webhook verification.
//  * @param {Object} res - The HTTP response object.
//  * @returns {Promise<void>} Sends a JSON response confirming the webhook was received or an error message.
//  */
// export const stripeWebhookController = async (req, res) => {
//   try {
//     const sig = req.headers[STRIPE_SIGNATURE_HEADER];
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       return res
//         .status(400)
//         .json({ error: `${ERROR_MESSAGES.WEBHOOK_ERROR} ${err.message}` });
//     }

//     const result = await handleStripeWebhook(event);

//     res.status(200).json({ received: true, result });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
