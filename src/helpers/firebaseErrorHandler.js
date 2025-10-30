export const FIREBASE_ERRORS = {
  "auth/email-already-exists":
    "This email address is already registered. Please use a different email address.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/user-not-found":
    "No account found with this email. Please check or sign up.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many login attempts. Please try again later.",
  "auth/network-request-failed":
    "Network connection failed. Please check your internet connection.",
  "auth/invalid-credential": "Invalid login credentials. Please try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/weak-password": "Password should be at least 6 characters long.",
  "auth/operation-not-allowed":
    "This operation is not allowed. Please contact support.",

  // Storage Errors
  "storage/unauthorized": "You are not authorized to perform this action.",
  "storage/canceled": "Upload was canceled.",
  "storage/unknown": "An unknown error occurred during file upload.",

  // Generic Errors
  "auth/unknown": "An unexpected error occurred. Please try again.",
  default: "Something went wrong. Please try again later.",
};

export const getFirebaseErrorMessage = (error) => {
  // If error is a Firebase error object
  if (error?.code) {
    return FIREBASE_ERRORS[error.code] || FIREBASE_ERRORS.default;
  }

  // If error is just the error code string
  if (typeof error === "string" && FIREBASE_ERRORS[error]) {
    return FIREBASE_ERRORS[error];
  }

  // If error message is provided directly
  if (error?.message) {
    return error.message;
  }

  return FIREBASE_ERRORS.default;
};

// Helper to handle Firebase errors in API responses
export const handleFirebaseError = (error) => {
  const errorMessage = getFirebaseErrorMessage(error);

  return {
    success: false,
    message: errorMessage,
    code: error?.code || "unknown",
  };
};
