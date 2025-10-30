import transporter from "../config/nodemailer.js";
import {
  COMPANY_NAME,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../constants.js";
import {
  generateOtpEmailContent,
  paymentConfirmationTemplate,
} from "../utils/emailTemplates.js";

/**
 * Function to send a generic email.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text content of the email.
 * @param {string} html - The HTML content of the email.
 *
 * @returns {Promise<Object>} - The information about the email sent.
 * @throws {Error} - Throws an error if email sending fails.
 */
export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `${COMPANY_NAME}<${process.env.EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    // Use await with sendMail since we're in an async function
    const info = await transporter.sendMail(mailOptions);
    console.log(SUCCESS_MESSAGES.EMAIL_SEND, info);
    return info;
  } catch (error) {
    console.error(ERROR_MESSAGES.SMTP_ERROR, {
      code: error.code,
      response: error.response,
      message: error.message,
    });
    throw error;
  }
};

/**
 * Function to send an OTP email.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The one-time password (OTP) to be sent.
 *
 * @returns {Promise<Object>} - The result of sending the OTP email.
 */
export const sendOtpEmail = async (email, otp) => {
  const { subject, text, html } = generateOtpEmailContent(otp);
  return await sendEmail(email, subject, text, html);
};

/**
 * Function to send a payment confirmation email.
 *
 * @param {string} email - The recipient's email address.
 * @param {Object} order - The order details for payment confirmation.
 * @param {string} order._id - The order ID.
 * @param {string} order.status - The status of the order.
 * @param {number} order.totalAmount - The total amount of the order.
 *
 * @returns {Promise<Object>} - The result of sending the payment confirmation email.
 */
export const sendPaymentConfirmationEmail = async (email, order) => {
  const { subject, text, html } = paymentConfirmationTemplate(order);

  return await sendEmail(email, subject, text, html);
};
