import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import GrotechAdmin from "../models/GrotechAdmin.js";
import Company from "../models/Company.js";
import { ERROR_MESSAGES, TOKENS, TOKEN_EXPIRY, COMPANY_NAME } from "../constants.js";
import { getGlobalUserCount as getGlobalUserCountService } from "../services/user.js";
import { generateToken, setCookie } from "../utils/auth.js";

/**
 * Super Admin Login
 * @param {Object} req
 * @param {Object} res
 */
export const login = async (req, res) => {
    try {
        const { passcode } = req.body;

        if (!passcode) {
            return res.status(400).json({ message: "Passcode is required" });
        }

        // Find the grotech admin (assuming single admin for now)
        const grotechAdmin = await GrotechAdmin.findOne();

        if (!grotechAdmin) {
            return res.status(404).json({ message: "Grotech Admin not initialized" });
        }

        const isMatch = await bcrypt.compare(passcode, grotechAdmin.passcode);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid passcode" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: grotechAdmin._id, role: "GROTECH_ADMIN" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Fetch Grotech company to generate companyToken
        const grotechCompany = await Company.findOne({ name: COMPANY_NAME });
        let companyToken = null;
        if (grotechCompany) {
            companyToken = generateToken({ companyId: grotechCompany._id.toString() });
            setCookie(res, TOKENS.COMPANY_TOKEN, companyToken);
        }

        // Set cookie for grotech admin
        res.cookie("grotechAdminToken", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            // secure: process.env.NODE_ENV === 'production', // Uncomment in production
        });

        res.status(200).json({ message: "Login successful", token, companyToken });
    } catch (error) {
        console.error("Super Admin Login Error:", error);
        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Get Global User Count for Grotech Admin
 * @param {Object} req
 * @param {Object} res
 */
export const getGlobalUserCount = async (req, res) => {
    try {
        const userCount = await getGlobalUserCountService();
        res.status(200).json({ success: true, count: userCount });
    } catch (error) {
        console.error("Grotech Admin Global User Count Error:", error);
        res.status(500).json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};
