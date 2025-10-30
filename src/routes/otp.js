import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.js";
import { OTP_ROUTES } from "../constants.js";

const router = Router();

/**
 * Route to send an OTP.
 * @route POST /api/otp
 * @access Public
 */
router.post(OTP_ROUTES.SEND_OTP, sendOtp);

/**
 * Route to verify an OTP.
 * @route POST /api/otp/verify
 * @access Public
 */
router.post(OTP_ROUTES.VERIFY_OTP, verifyOtp);

export default router;
