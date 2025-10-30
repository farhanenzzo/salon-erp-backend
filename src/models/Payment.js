// import mongoose from "mongoose";
// import { GENERAL_CONSTANTS, MODELS, PAYMENT_STATUS } from "../constants.js";

// /**
//  * Payment schema for storing payment details.
//  * @typedef {Object} Payment
//  * @property {mongoose.Types.ObjectId} clientId - The ID of the client making the payment.
//  * @property {mongoose.Types.ObjectId} stylistId - The ID of the stylist receiving the payment.
//  * @property {number} amount - The amount to be paid.
//  * @property {('PENDING' | 'PAID' | 'FAILED')} status - The status of the payment (default is 'PENDING').
//  * @property {mongoose.Types.ObjectId} serviceId - The ID of the service being paid for.
//  * @property {Date} dateAndTime - The date and time of the payment. Defaults to the current date and time.
//  * @property {string} clientSecret - The client secret for the payment process.
//  */

// const transactionIdTrackerSchema = new mongoose.Schema({
//   companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
//   lastTxnId: { type: Number, default: GENERAL_CONSTANTS.ZERO },
// });

// const TransactionIdTracker = mongoose.model(
//   MODELS.TRANSACTION_ID_TRACKER,
//   transactionIdTrackerSchema
// );

// // Define the schema for payment data
// const paymentSchema = new mongoose.Schema(
//   {
//     transactionId: { type: String, unique: true },
//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: MODELS.COMPANY, // Reference to the Company model
//       required: true, // Ensure this is always set
//     },
//     /**
//      * The ID of the client making the payment.
//      * @type {mongoose.Schema.Types.ObjectId}
//      */
//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: MODELS.CLIENT,
//     },

//     /**
//      * The ID of the stylist receiving the payment.
//      * @type {mongoose.Schema.Types.ObjectId}
//      */
//     stylistId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: MODELS.EMPLOYEE,
//     },

//     /**
//      * The amount to be paid.
//      * @type {number}
//      */
//     amount: { type: Number },

//     /**
//      * The status of the payment.
//      * @type {string}
//      * @enum {PENDING, PAID, FAILED}
//      * @default 'PENDING'
//      */
//     status: {
//       type: String,
//       enum: [
//         PAYMENT_STATUS.PENDING,
//         PAYMENT_STATUS.UNPAID,
//         PAYMENT_STATUS.PAID,
//         PAYMENT_STATUS.FAILED,
//       ],
//       default: PAYMENT_STATUS.UNPAID,
//     },

//     /**
//      * The ID of the service being paid for.
//      * @type {mongoose.Schema.Types.ObjectId}
//      */
//     serviceId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: MODELS.SERVICES,
//     },

//     /**
//      * The date and time of the payment.
//      * @type {Date}
//      * @default Date.now
//      */
//     dateAndTime: { type: Date, required: true, default: Date.now },

//     /**
//      * The client secret for the payment process.
//      * @type {string}
//      */
//   },
//   { timestamps: true }
// );

// // Export the Payment model based on the schema
// const Payment = mongoose.model(MODELS.PAYMENT, paymentSchema);

// export { Payment, TransactionIdTracker };

import mongoose from "mongoose";
import { GENERAL_CONSTANTS, MODELS, PAYMENT_STATUS } from "../constants.js";

/**
 * Transaction ID tracker schema for storing the last used transaction ID.
 */
const transactionIdTrackerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  lastTxnId: { type: Number, default: GENERAL_CONSTANTS.ZERO },
});

const TransactionIdTracker = mongoose.model(
  MODELS.TRANSACTION_ID_TRACKER,
  transactionIdTrackerSchema
);

// Define the schema for payment data
const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.COMPANY,
      required: true,
    },
    transactionId: { type: String, unique: true }, // Unique Transaction ID

    /**
     * The ID of the appointment linked to this payment.
     * All other details (client, stylist, service, company) can be fetched from the appointment.
     */
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.APPOINTMENT, // Reference to the Appointment model
      required: true,
    },

    /**
     * The amount to be paid.
     * @type {number}
     */
    amount: { type: Number, required: true },

    /**
     * The status of the payment.
     * @type {string}
     * @enum {PENDING, PAID, FAILED}
     * @default 'PENDING'
     */
    status: {
      type: String,
      enum: [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.UNPAID,
        PAYMENT_STATUS.PAID,
        PAYMENT_STATUS.FAILED,
      ],
      default: PAYMENT_STATUS.UNPAID,
    },

    /**
     * The date and time of the payment.
     * @type {Date}
     * @default Date.now
     */
    dateAndTime: { type: Date, required: true, default: Date.now },

    /**
     * The client secret for the payment process (if using Stripe or another payment gateway).
     * @type {string}
     */
    clientSecret: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model(MODELS.PAYMENT, paymentSchema);

export { Payment, TransactionIdTracker };
