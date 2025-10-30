import express from "express";
import { uploadImage } from "../controllers/image.js";
import { IMAGE_ROUTES } from "../constants.js";

const router = express.Router();

/**
 * Route to upload an image.
 * @route POST /api/image
 * @access Public
 */
router.post(IMAGE_ROUTES.UPLOAD_IMAGE, uploadImage);

export default router;
