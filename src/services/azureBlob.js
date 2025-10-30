import { BlobServiceClient } from "@azure/storage-blob";
import { ERROR_MESSAGES } from "../constants";

// Retrieve the Azure Storage connection string from environment variables
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

// Throw an error if the connection string is not found in environment variables
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error(ERROR_MESSAGES.AZURE_STORAGE_CONNECTION_STRING_NOT_FOUND);
}

/**
 * Initializes a connection to Azure Blob Storage using the connection string.
 * Throws an error if the connection string is not found.
 * @constant {BlobServiceClient} blobServiceClient - The BlobServiceClient instance to interact with Azure Blob Storage.
 * @throws {Error} If the AZURE_STORAGE_CONNECTION_STRING is not found in the environment variables.
 */
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

export default blobServiceClient;
