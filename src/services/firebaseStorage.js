import { bucket } from "../config/firebase.js";

/**
 * Uploads an image to Firebase Storage
 *
 * @param {Buffer} fileBuffer - The buffer containing the file data to upload
 * @param {string} fileName - The name of the file to store in Firebase Storage
 * @param {string} folder - Optional folder name
 * @returns {string} - The public URL of the uploaded image
 * @throws {Error} - Throws an error if the upload fails
 */
export const uploadImageToFirebase = async (fileBuffer, fileName, folder = "images") => {
    try {
        const file = bucket.file(`${folder}/${fileName}`);

        await file.save(fileBuffer, {
            metadata: {
                contentType: "image/jpeg", // Adjust if needed or detect mime type
            },
        });

        // Use getSignedUrl to generate a publicly accessible URL
        // Access control is managed via Uniform Bucket-Level Access, so we used a signed URL
        // with a far-future expiration date for "public" access behavior.
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
        });

        return signedUrl;
    } catch (error) {
        console.error("Firebase upload error:", error);
        throw new Error("Failed to upload image to Firebase Storage");
    }
};
