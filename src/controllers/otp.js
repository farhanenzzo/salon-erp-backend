import { auth } from "../../firebaseAdmin.js";
import OTP from "../models/OTP.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../services/email.js";
import { ERROR_MESSAGES, ERRORS, SUCCESS_MESSAGES } from "../constants.js";

/**
 * Sends an OTP to the user's email after verifying if the user exists in Firebase.
 * @async
 * @param {Object} req - The request object containing the email in the body.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with a success or error message.
 * @throws {Error} If the user is not found or there is an issue sending the OTP.
 */
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: ERROR_MESSAGES.EMAIL_REQUIRED });
  }

  try {
    // Verify the user exists in Firebase
    await auth.getUserByEmail(email);

    // Generate a random 6-digit OTP
    const otp = generateOtp();

    // Save OTP to database
    await OTP.create({ email, otp });

    // Send the OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).send({ message: SUCCESS_MESSAGES.OTP_SEND });
  } catch (error) {
    if (error.code === ERRORS.USER_NOT_FOUND) {
      res.status(404).send({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    } else {
      res.status(500).send({ error: ERROR_MESSAGES.FAILED_SENDING_OTP });
    }
  }
};

/**
 * Verifies the OTP sent to the user's email.
 * @async
 * @param {Object} req - The request object containing the email and OTP in the body.
 * @param {Object} res - The response object used to send the result or error response.
 * @returns {Promise<void>} Responds with a success or error message.
 * @throws {Error} If the OTP verification fails or there is an issue accessing the database.
 */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;


  if (!email || !otp) {
    return res
      .status(400)
      .send({ error: ERROR_MESSAGES.EMAIL_AND_OTP_REQUIRED });
  }

  try {
    // Fetch the OTP from the database
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(404).send({ error: ERROR_MESSAGES.OTP_NOT_FOUND });
    }

    // Check if the provided OTP matches the stored OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).send({ error: ERROR_MESSAGES.INVALID_OTP });
    }

    // Clear the OTP after successful verification
    await OTP.deleteOne({ email });

    res.status(200).send({ message: SUCCESS_MESSAGES.OTP_VERIFIED });
  } catch (error) {
    res.status(500).send({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
