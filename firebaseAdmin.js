import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced service account reading function
const readServiceAccountFile = () => {
  try {
    const serviceAccountPath = resolve(
      __dirname,
      "./src/secrets/serviceAccount.json"
    );
    return JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  } catch (error) {
    console.error("Error reading service account file:", error);
    return null;
  }
};

// Singleton pattern for Firebase Admin initialization
class FirebaseAdminManager {
  static instance = null; // Static property for singleton instance
  firebaseApp = null; // Firebase App instance
  firebaseAuth = null; // Firebase Auth instance

  constructor() {
    if (FirebaseAdminManager.instance) {
      return FirebaseAdminManager.instance; // Return existing instance
    }
    this.initialize(); // Initialize Firebase Admin
    FirebaseAdminManager.instance = this; // Store instance
  }

  initialize() {
    try {
      // Prefer environment variable, fall back to file
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8'))
        : readServiceAccountFile();

      if (!serviceAccount) {
        throw new Error(
          "Firebase service account is not available. Please check your configuration."
        );
      }

      this.firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });

      this.firebaseAuth = getAuth(this.firebaseApp);

      console.log("Firebase Admin initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);

      // More graceful error handling
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
    }
  }

  // Method to get Auth instance
  getAuth() {
    if (!this.firebaseAuth) {
      throw new Error("Firebase Auth not initialized");
    }
    return this.firebaseAuth;
  }

  // Method to verify and refresh tokens
  async verifyAndRefreshToken(idToken) {
    try {
      // Verify the token
      const decodedToken = await this.getAuth().verifyIdToken(idToken, true);

      // Optional: Additional custom token validation
      if (!decodedToken.uid) {
        throw new Error("Invalid token");
      }

      // Return the decoded token
      return decodedToken;
    } catch (error) {
      console.error("Token verification failed:", error);
      throw error;
    }
  }

  // Method to revoke user tokens
  async revokeUserTokens(uid) {
    try {
      await this.getAuth().revokeRefreshTokens(uid);
      const user = await this.getAuth().getUser(uid);
      const tokensValidAfterTime = user.tokensValidAfterTime;
      console.log(`Tokens revoked for user ${uid} at ${tokensValidAfterTime}`);
    } catch (error) {
      console.error("Error revoking tokens:", error);
      throw error;
    }
  }
}

// Export the singleton instance
const firebaseAdminManager = new FirebaseAdminManager();
export const auth = firebaseAdminManager.getAuth();
export default firebaseAdminManager;
