import admin from "firebase-admin";

const getServiceAccount = () => {
    const value = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!value) return null;
    try {
        // Try parsing as plain JSON first
        return JSON.parse(value);
    } catch (e) {
        try {
            // If that fails, try decoding from base64
            return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
        } catch (err) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT as JSON or Base64", err);
            return null;
        }
    }
};

const serviceAccount = getServiceAccount();
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageBucket,
    });
}

const bucket = admin.storage().bucket(storageBucket);

export { admin, bucket };
