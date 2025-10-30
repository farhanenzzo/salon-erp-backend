import multer from "multer";
import { ERROR_MESSAGES, FILE_UPLOAD_CONSTANTS } from "../constants.js";

const storage = multer.memoryStorage();

const upload = (fieldName) => {
  /**
   * Middleware to handle file uploads using Multer.
   *
   * - Allows only image files based on MIME type.
   * - Restricts file size to 5 MB.
   * - Handles errors gracefully and sends an appropriate response.
   *
   * @param {string} fieldName - The name of the field to handle file uploads for.
   * @returns {Function} Middleware function to handle file uploads.
   */
  const uploadMiddleware = multer({
    storage,
    limits: { fileSize: FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith(FILE_UPLOAD_CONSTANTS.ALLOWED_MIME_TYPE)) {
        cb(null, true);
      } else {
        cb(new Error(ERROR_MESSAGES.ONLY_IMAGES_AND_FILES_ALLOWED), false);
      }
    },
  }).single(fieldName);

  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

export default upload;
