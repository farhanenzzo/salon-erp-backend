import { BlobServiceClient } from "@azure/storage-blob";
import { AZURE_IMAGE_CONTAINER } from "../constants.js";

// Initialize the BlobServiceClient using the connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = AZURE_IMAGE_CONTAINER;
const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Uploads an image to Azure Blob Storage
 *
 * @param {Buffer} fileBuffer - The buffer containing the file data to upload
 * @param {string} fileName - The name of the file to store in Blob Storage
 * @returns {string} - The URL of the uploaded image in Blob Storage
 * @throws {Error} - Throws an error if the upload fails
 */
export const uploadImageToBlob = async (fileBuffer, fileName) => {
  try {
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.upload(fileBuffer, fileBuffer.length);
    return blobClient.url; // This will be the image URL
  } catch (error) {
    throw error;
  }
};
