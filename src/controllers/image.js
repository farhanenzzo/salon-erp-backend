import { ERROR_MESSAGES } from "../constants.js";
import { uploadImageToBlob } from "../utils/azureUpload.js";

/**
 * Handles image upload, generates a unique file name, uploads the image to Azure Blob Storage,
 * and responds with the image URL.
 * @async
 * @param {Object} req - The request object containing the image file in the `file` property.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with the uploaded image's URL, or an error message if the upload fails.
 * @throws {Error} Throws an error if the image upload to Azure Blob fails or if no file is provided.
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: ERROR_MESSAGES.NO_FILE_FOUND });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`; // Generate a unique file name
    const imageUrl = await uploadImageToBlob(req.file.buffer, fileName);

    // Optionally, save image metadata in the database
    // await saveImageMetadata(req.companyId, imageUrl);

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_IMAGE_UPLOAD, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
  }
};
