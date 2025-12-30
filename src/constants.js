export const ROUTES = {
  BASE_ROUTE: "/api",
  PAYMENT_SUCCESS_FRONTEND_URL: "/login",
};

export const REVENUE_ROUTES = {
  BASE: "/",
};

export const APPOINTMENT_ROUTES = {
  BASE: "/",
  BY_ID: "/:id",
  SOFT_DELETE: "/soft-delete/:id",
  COUNT: "/count",
  COUNT_BY_GENDER: "/count/gender",
  BY_EMPLOYEE: "/employee/:employeeId",
  BY_CLIENT: "/client/:id",
  STATS: "/stats",
};

export const PAYMENT_ROUTES = {
  CREATE_PAYMENT: "/create-payment",
  LIST_PAYMENTS: "/list-payments",
};

export const USER_ROUTES = {
  BASE: "/",
};

export const AUTH_ROUTES = {
  SET_TOKEN: "/set-token",
  SIGNUP: "/signup",
  MOBILE_SIGNUP: "/mobile-signup",
  ASSOCIATE_COMPANY: "/associate-company",
  LOGOUT: "/logout",
  LOGIN: "/login",
  LOGIN_MOBILE_USER: "/login-mobile-user",
  TRASH_USER: "/user/trash/:id",
  UPDATE_PASSWORD: "/update-password",
  CHECK_TOKEN: "/check-token",
  GET_USER_BY_ID: "/user/:id",
  CREATE_USER: "/users",
  CHECK_SUPER_ADMIN: "/check-super-admin",
  GET_USERS_BY_COMPANY: "/users",
  UPDATE_PROFILE: "/user/:userId",
};

export const CATEGORY_ROUTES = {
  BASE: "/",
  CATEGORY_OPTIONS: "/options",
  SOFT_DELETE: "/soft-delete/:id",
  TOGGLE_STATUS: "/status/:id",
  UPDATE: "/:id",
};

export const CLIENT_ROUTES = {
  BASE: "/",
  COUNT: "/count",
  SOFT_DELETE: "/soft-delete/:id",
  SEARCH_BY_CLIENT_ID: "/:clientId",
  UPDATE_CLIENT: "/:clientId",
};

export const COMPANY_ROUTES = {
  ADD_COMPANY: "/",
  GET_COMPANY_DETAILS: "/",
  UPDATE_COMPANY: "/",
  LIST_ALL_COMPANIES: "/list",
  GET_COMPANY_BY_ID: "/:companyId",
};

export const EMPLOYEE_ROUTES = {
  LIST_EMPLOYEES: "/",
  ADD_EMPLOYEE: "/",
  LIST_SERVICE_EMPLOYEES: "/service",
  UPDATE_EMPLOYEE: "/:id",
  SOFT_DELETE_EMPLOYEE: "/soft-delete/:id",
  SUMMARY: "/summary",
};

export const MODULE_ROUTES = {
  BASE_ROUTE: "/",
};

export const NOTIFICATION_ROUTES = {
  GET_NOTIFICATIONS: "/",
  UPDATE_READ_STATUS: "/read",
};

export const OFFERS_ROUTES = {
  LIST_OFFERS: "/",
  ADD_OFFERS: "/",
  SOFT_DELETE_OFFER: "/soft-delete/:id",
  UPDATE_OFFER_BY_ID: "/:id",
};

export const OTP_ROUTES = {
  SEND_OTP: "/",
  VERIFY_OTP: "/verify",
};

export const REVIEW_ROUTES = {
  BASE: "/",
  ADD_REPLY: "/:reviewId/reply",
  UPDATE_REPLY: "/:reviewId/replies/:replyId",
};

export const ROLE_ROUTES = {
  BASE: "/",
  DROPDOWN: "/dropdown",
  PERMISSIONS: "/:roleId/permissions",
  UPDATE_ROLE: "/:roleId",
  TRASH_ROLE: "/:roleId/trash",
};

export const SERVICE_ROUTES = {
  BASE: "/",
  COUNT: "/count",
  UPDATE: "/:id",
  SOFT_DELETE: "/soft-delete/:id",
  GET_SERVICES_WITH_RELATED_SERVICES: "/:serviceId/details",
  CHECK_SERVICE_COMPLETION: "/:serviceId/appointments/completed",
};

export const STOCK_ROUTES = {
  BASE: "/",
  GET_BY_ID: "/:id",
  SOFT_DELETE: "/soft-delete/:id",
  UPDATE: "/:id",
  COUNT: "/count",
};

export const STRIPE_ROUTES = {
  CREATE_PAYMENT_INTENT: "/create-payment-intent",
  WEBHOOK: "/webhook",
};

export const IMAGE_ROUTES = {
  UPLOAD_IMAGE: "/",
};

export const BASE_ROUTES = {
  OTP: "/otp",
  AUTH: "/auth",
  COMPANY: "/company",
  APPOINTMENTS: "/appointments",
  SERVICES: "/services",
  EMPLOYEES: "/employees",
  CLIENTS: "/clients",
  STOCKS: "/stocks",
  OFFERS: "/offers",
  REVIEW: "/review",
  CATEGORIES: "/categories",
  NOTIFICATIONS: "/notifications",
  PAYMENT: "/payment",
  MODULES: "/modules",
  ROLES: "/roles",
  REVENUE: "/revenue",
};

export const UPLOAD_IMAGE_FIELD = {
  IMAGE: "image",
  USER_PROFILE: "userProfile",
  PHOTO: "photo",
  EMPLOYEE_PHOTO: "employeePhoto",
  STOCK_IMAGE: "stockImage",
};

export const COMPANY_NAME = "Grotech";

export const EMAIL_TEXT = {
  VERIFY_EMAIL: "Verify Your Email Address",
};

export const COMPANY_PROFILE = "https://i.ibb.co/jzfYdcF/company-Profile.png";
export const DAY_BEGINNING = "T00:00:00.000Z";
export const DAY_END = "T23:59:59.999Z";
export const TIME_ZONE = "Asia/Kolkata";

export const ERROR_MESSAGES = {
  STYLIST_NOT_FOUND: "Stylist not found",
  CLIENT_NOT_FOUND: "Client not found",
  FAILED_TO_ADD_APPOINTMENT: "Failed to add appointment",
  FAILED_TO_GET_APPOINTMENT_COUNT: "Failed to get appointment count",
  SERVICE_NOT_FOUND: "Service not found.",
  CLIENT_ALREADY_HAS_APPOINTMENT: "Client already has an appointment",
  INVALID_SERVICE_DURATION: "Invalid service duration format",
  INVALID_APPOINTMENT_DATE_TIME: "Invalid appointment date and time",
  INVALID_EXPIRE_TIME_CALCULATION: "Invalid expiry time calculation",
  ERROR_CREATING_APPOINTMENT: "Error creating appointment:",
  ERROR_FETCHING_APPOINTMENT_COUNT:
    "Error fetching appointment count by gender:",
  INVALID_DATE_FORMAT: "Invalid date format",
  FAILED_TO_GET_APPOINTMENTS: "Failed to retrieve appointments",
  INVALID_ID_FORMAT: "invalid id format",
  APPOINTMENT_NOT_FOUND:
    "Appointment not found or doesn't belong to your company.",
  FAILED_TO_DELETE_APPOINTMENT: "Failed to delete appointment",
  FAILED_TO_FETCH_APPOINTMENT_COUNT: "Failed to get appointment count",
  FAILED_TO_GET_APPOINTMENT_COUNT_BY_GENDER:
    "Failed to get appointment count by gender",
  INVALID_DATE_FORMAT: "Invalid date format",
  INVALID_SERVICE_DURATION_FORMAT: "Invalid service duration format",
  ONLY_UPCOMING_APPOINTMENTS_CAN_BE_CANCELLED:
    "Only upcoming appointments can be cancelled.",
  FAILED_TO_UPDATE_APPOINTMENT: "Failed to update appointment",
  ERROR_UPDATING_APPOINTMENT_STATUSES: "Error updating appointment statuses:",
  INVALID_EMPLOYEE_ID: "Invalid employee ID format",
  EMPLOYEE_NOT_FOUND: "Employee not found",
  ERROR_FETCHING_APPOINTMENTS: "Error retrieving appointments.",
  INVALID_CLIENT_ID: "Invalid client ID format",
  TOKEN_IS_REQUIRED: "Token is required",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
  EMAIL_NEWPASS_REQUIRES: "Email and new password are required",
  PASSWORD_UPDATE_SUCCESS: "Password updated successfully",
  USER_NOT_FOUND: "User not found",
  NO_TOKEN_FOUND: "No token found",
  COMPANY_TOKEN_NOT_FOUND: "Company token not found",
  FAILED_TO_CREATE_USER: "Failed to create user",
  FAILED_TO_ASSOCIATE_USER_WITH_COMPANY:
    "Failed to associate user with company",
  ALL_FIELDS_REQUIRED: "All fields are required",
  FAILED_TO_GENERATE_BRAND_ID: "Failed to generate brand ID",
  FAILED_TO_GENERATE_USER_ID: "Failed to generate user ID",
  ERROR_RESETTING_APPOINTMENT_ID_TRACKER:
    "Error resetting appointment ID tracker:",
  FAILED_GENERATING_APPOINTMENT_ID: "Failed to generate appointment ID",
  FAILED_GENERATING_TRANSACTION_ID: "Failed to generate transaction ID",
  ERROR_RESETTING_CLIENT_ID_TRACKER: "Error resetting client ID tracker:",
  FAILED_GENERATING_CLIENT_ID: "Failed to generate client ID",
  FAILED_GENERATING_SERVICE_ID: "Failed to generate services ID",
  VALIDATION_ERROR: "Validation error",
  CATEGORY_EXISTS: "Category already exists",
  INTERNAL_SERVER_ERROR: "Internal server error",
  REQUIRES_COMPANY_ID: "Company ID is required",
  UNAUTHORIZED: "Unauthorized",
  FAILED_IMAGE_UPLOAD: "Failed to upload image",
  CATEGORY_NAME_IS_REQUIRED_SHOULD_BE_STRING:
    "Category name is required and must be a string.",
  CATEGORY_ALREADY_EXISTS: "A category with this name already exists.",
  CATEGORY_NOT_FOUND: "category not found",
  FAILED_CATEGORY_UPDATION: "Failed to update category",
  ERROR_LOGGING_OUT: "Error logging out",
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_ASSOCIATED_WITH_A_COMPANY: "User is not associated with a company",
  USER_ID_REQUIRED: "User ID is required",
  ERROR_RETRIEVING_USER: "An error occurred while retrieving the user.",
  NO_COMPANY_ID_FOUND: "Unauthorized: No company ID found",
  USER_CREATION_FAILED: "Failed to create user",
  FAILED_TO_FETCH_USERS: "Failed to fetch users",
  ERROR_TRASHING_USER: "An error occurred while trashing the user.",
  FAILED_UPDATING_PROFILE: "Failed to update profile",
  CATEGORY_NOT_FOUND: "Category not found",
  FAILED_TOGGLING_STATUS: "Failed to toggle category status",
  FAILED_ADD_CLIENT: "Error adding client",
  INVALID_COMPANY_TOKEN: "Invalid company token",
  AUTH_TOKEN_MISSING: "Authentication token is missing",
  NOT_FIREBASE_TOKEN_CHECKING_JWT:
    "Not a Firebase token, checking as normal JWT:",
  INAVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
  ROLE_TOKEN_NOT_FOUND: "Role token not found",
  ROLE_ID_NOT_FOUND_IN_TOKEN: "Role ID not found in token",
  INVALID_ROLE_TOKEN: "Invalid role token",
  FAILED_TO_RETRIEVE_CLIENTS: "Failed to retrieve clients",
  FAILED_SEARCHING_CLIENT: "Failed to search client",
  ERROR_DELETING_CLIENT: "Error deleting client:",
  ERROR_COUNTING_CLIENTS: "An error occurred while counting clients.",
  FAILED_SAVING_COMPANY_DATA: "Failed to save company data",
  FAILED_TO_UPDATE_CLIENT: "Failed to update client",
  FAILED_TOKEN_GENERATION: "Token generation failed",
  FAILED_ADDING_EMPLOYEE: "Failed to add employee",
  FAILED_TO_GET_EMPLOYEES: "Failed to retrieve employees",
  SERVICE_ID_REQUIRED: "Service ID is required",
  NO_ROLES_FOR_GIVEN_SERVICE: "No roles found for the given service",
  NO_EMPLOYEES_FOR_GIVEN_SERVICE: "No employees found for the given service",
  ERROR_FETCHING_EMPLOYEES_BASED_ON_SERVICE:
    "Error fetching employees based on service",
  FAILED_TO_DELETE_EMPLOYEE: "Failed to delete employee",
  ERROR_UPDATING_EMPLOYEE: "Error updating employee",
  NO_FILE_FOUND: "No file uploaded",
  NO_MODULES_FOUND_FOR_THIS_ROLE: "No modules assigned to this role yet",
  NOTIFICATION_IDS_MUST_BE_ARRAY:
    "Notification IDs must be provided as an array",
  FAILED_UPDATING_NOTIFICATION_READ_STATUS:
    "Failed to update read status of notifications",
  FAILED_ADDING_OFFER: "Failed to add offer",
  FAILED_LISTING_OFFERS: "Failed to list offers",
  OFFER_NOT_FOUND: "Offer not found or already deleted",
  FAILED_DELETING_OFFER: "Failed to delete offer",
  FAILED_UPDATING_OFFER: "Failed to update offer",
  INVALID_ITEMS: "Invalid items data provided",
  EMAIL_REQUIRED: "Email is required",
  FAILED_SENDING_OTP: "Failed to send OTP",
  EMAIL_AND_OTP_REQUIRED: "Email and OTP are required",
  OTP_NOT_FOUND: "OTP not found",
  INVALID_OTP: "Invalid OTP",
  ERROR_LISTING_REVIEWS: "Error listing reviews",
  ROLE_NAME_SHOULD_BE_STRING: "Role name should be a string",
  ROLE_NAME_REQUIRED: "Role name is required",
  ROLE_EXISTS: "Role already exists",
  ERROR_FETCHING_MODULE_PERMISSIONS: "Error fetching module permissions",
  INVALID_PERMISSIONS: "Invalid permissions data",
  MODULE_NOT_FOUND: "Module not found",
  SERVICE_NAME_REQUIRED: "Service name is required",
  FAILED_ADDING_SERVICE: "Failed to add service",
  FAILED_FETCHING_SERVICES: "Failed to fetch services",
  FAILED_TO_GET_SERVICE_COUNT: "Failed to get services count",
  SERVICE_NOT_FOUND: "Service not found",
  FAILED_DELETING_SERVICE: "Failed to delete service",
  FAILED_UPDATING_SERVICE: "Failed to update service",
  FAILED_GENERATING_STOCK_ID: "Failed to generate next stock ID",
  ERROR_RESETTING_STOCK_ID: "Error resetting stock ID:",
  VALIDATION_ERROR: "Validation error",
  STOCK_ALREADY_EXISTS: "Stock already exists",
  STOCK_IMAGE_REQUIRED: "Stock image is required.",
  FAILED_TO_ADD_STOCK: "Failed to add stock",
  FAILED_TO_LIST_STOCK: "Failed to list stock",
  STOCK_NOT_FOUND_OR_DOESNT_BELONG_TO_YOUR_COMPANY:
    "Stock not found or doesn't belong to your company.",
  FAILED_DELETING_STOCK: "Failed to delete stock",
  ERROR_UPDATING_EXPIRED_STOCK: "Error updating expired stock:",
  STOCK_NOT_FOUND: "Stock not found",
  FAILED_TO_UPDATE_STOCK: "Failed to update stock",
  WEBHOOK_ERROR: "Webhook Error:",
  SOMETHING_WENT_WRONG: "Something went wrong!",
  STOCK_QUANTITY_MUST_BE_NUMBER: "Stock quantity must be a valid number.",
  NO_ROLE_TOKEN_PROVIDED: "Unauthorized: No token provided",
  SUPER_ADMIN_ROLE_NOT_FOUND: "Super Admin role not found",
  ACCESS_DENIED_NOT_A_SUPER_ADMIN: "Access denied: Not a Super Admin",
  ONLY_IMAGES_AND_FILES_ALLOWED: "Only image files are allowed",
  BOTH_START_AND_END_DATE_REQUIRED:
    "Both start and end dates must be provided.",
  START_DATE_MUST_BE_BEFORE_END_DATE: "Start date must be before end date.",
  SCHEDULED_DATE_TIME_SHOULD_NOT_BE_IN_PAST:
    "Scheduled date and time cannot be in the past",
  OFFER_NOT_FOUND: "Offer not found or has been deleted.",
  AZURE_STORAGE_CONNECTION_STRING_NOT_FOUND:
    "Azure Storage Connection string not found!",
  SMTP_ERROR: "Detailed SMTP Error:",
  COMPREHENSIVE_EMAIL_ERROR: "Comprehensive Email Error:",
  ERROR_FETCHING_MODULES: "Error fetching modules from database",
  FAILED_TO_SAVE_NOTIFICATION: "Failed to save notification",
  ERROR_FETCHING_NOTIFICATIONS: "Failed to get notifications: ",
  NOTIFICATION_ID_SHOULD_NOT_BE_EMPTY:
    "Notification IDs must be provided as a non-empty array",
  NO_MATCHING_NOTIFICATIONS_FOUND: "No matching notifications found",
  FAILED_UPDATING_NOTIFICATIONS: "Failed to update notifications:",
  INVALID_PRICE: "Invalid price",
  ITEMS_MUST_BE_A_NON_EMPTY_ARRAY: "Items must be a non-empty array",
  TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO: "Total amount must be greater than 0",
  FAILED_CREATING_PAYMENT_INTENT:
    "Failed to create payment intent. Please try again.",
  UNHANDLED_ERROR: "unhandled",
  UNHANDLED_EVENT_TYPE: "Unhandled event type:",
  ORDER_NOT_FOUND: "Order not found",
  PAYMENT_FAILED: "Payment failed",
  UNSUPPORTED_DURATION_UNIT: "Unsupported duration unit",
  INVALID_DURATION_FORMAT: "Invalid duration format",
  FAILED_STARTING_SERVER: "Failed to start server:",
  MODULE_ALREADY_EXISTS: "Module already exists",
  ERROR_SEEDING_MODULES: "Error seeding modules:",
  ERROR_SEEDING_ROLES: "Error seeding roles:",
  CUSTOMER_ID_TOKEN_MISSING: "Customer id token missing",
  FAILED_CHECKING_APPOINTMENT_COMPLETION:
    "Failed to check appointment completion. Please try again later.",
  REVIEW_NOT_FOUND: "Review not found.",
  MISSING_REQUIRED_FIELDS: "Missing required fields",
  ERROR_CREATING_PAYMENT: "Error creating  payment.",
  ERROR_FETCHING_PAYMENTS: "Error fetching payments.",
  ERROR_UPDATING_FIREBASE_DISPLAY_NAME:
    "Error updating Firebase user displayName",
  ROLE_NOT_FOUND: "Role not found",
  ROLE_ID_REQUIRED: "Role id required",
  FAILED_TO_GET_STOCKS_COUNT: "Error fetching stocks count",
  INVALID_DATE_FORMAT: "Invalid date format.",
  BOTH_START_AND_END_DATES_REQUIRED:
    "Both start and end dates must be provided.",
  SUPER_ADMIN_ALREADY_EXISTS: "A SuperAdmin already exists for this company.",
  EMAIL_ALREADY_IN_USE: "Email already in use.",
  PHONE_ALREADY_IN_USE: "Phone number already in use.",
  INVALID_DURATION: "Invalid duration",
  EMPLOYEE_EXISTS: "An employee with this email already exists."
};

export const SUCCESS_MESSAGES = {
  APPOINTMENT_DELETED: "Appointment deleted successfully.",
  APPOINTMENT_UPDATED_SUCCESSFULLY: "Appointment updated successfully",
  TOKEN_SET_SUCCESSFULLY: "Token set successfully",
  USER_CREATED: "User created and linked to company",
  USER_CREATED_SUCCESSFULLY: "User created successfully",
  CLIENT_ID_RESET_SUCCESSFULLY: "Client ID tracker has been reset.",
  CATEGORY_AND_SERVICE_ADDED: "Category and service added successfully",
  CATEGORY_ADDED_WITHOUT_SERVICE: "Category added successfully without service",
  NO_CATEGORIES_FOUND_FOR_THIS_COMPANY: "No categories found for this company",
  CATEGORY_CREATION_SUCCESS_WITHOUT_SERVICE:
    "Category created successfully without a service.",
  CATEGORIES_RETRIEVED_SUCCESSFULLY: "Categories retrieved successfully",
  CATEGORY_AND_RELATED_SERVICES_DELETED:
    "Category and its associated services deleted successfully",
  LOGOUT_SUCCESS: "Successfully logged out",
  USER_CREATED_VERIFICATION_EMAIL_SEND:
    "User created successfully, verification email sent",
  FIREBASE_ERROR: "Firebase error",
  USER_TRASHED_AND_REMOVED_FROM_FIREBASE:
    "has been trashed and removed from Firebase Auth.",
  PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
  CLIENT_DELETION_SUCCESS: "Client deleted successfully",
  COMPANY_DETAILS_UPDATED: "Company details updated successfully",
  COMPANIES_LISTED_SUCCESSFULLY: "Companies listed successfully",
  COMPANY_ADDED_SUCCESSFULLY: "Company added successfully",
  EMPLOYEE_DELETED: "Employee deleted successfully.",
  EMPLOYEE_UPDATED_SUCCESSFULLY: "Employee updated successfully",
  OFFER_ADDED: "Offer added successfully",
  DRAFT_ADDED: "Draft order created/updated successfully",
  OTP_SEND: "OTP sent successfully",
  OTP_VERIFIED: "OTP verified successfully",
  ROLE_CREATED: "Role created successfully",
  FETCHING_ROLES_SUCCESS: "Fetching roles success",
  PARTIAL_UPDATE_COMPLETE: "Partial update completed",
  PERMISSIONS_UPDATED: "Permissions updated successfully",
  ERROR_UPDATING_PERMISSIONS: "Error updating permissions",
  SUCCESS_DELETING_SERVICE: "Service soft deleted successfully",
  SERVICE_UPDATED_SUCCESSFULLY: "Service updated successfully",
  RESET_STOCK_ID_SUCCESS: "Stock ID reset successfully",
  STOCK_ADDED_SUCCESSFULLY: "Stock added successfully",
  STOCK_DELETING_SUCCESS: "Stock deleted successfully.",
  STOCK_UPDATED_SUCCESSFULLY: "Stock updated successfully",
  OFFERS_MARKED_EXPIRED: "offers marked as expired.",
  EMAIL_SEND: "Email sent successfully:",
  PAYMENT_PROCESSED_SUCCESSFULLY: "Payment processed successfully",
  PAYMENT_REFUNDED: "Payment refunded",
  SKIPPING_SEEDING_MODULES: "Seeding is skipped in this environment.",
  MODULE_EXISTS_SKIP_SEEDING: "Modules already exist. Skipping seeding.",
  MODULE_CREATED: "Module created successfully",
  SUPER_ADMIN_ROLE_CREATED: "Super admin role created!",
  ADMIN_ROLE_CREATED: "Admin role created!",
  USER_ROLE_CREATED: "User role created!",
  USER_HAS_COMPLETED_APPOINTMENT_FOR_THIS_SERVICE:
    "User has completed an appointment for this service.",
  USER_HAS_NOT_COMPLETED_APPOINTMENT_FOR_THIS_SERVICE:
    "User has not completed an appointment for this service.",
  PAYMENT_CREATED_SUCCESSFULLY: "Payment created successfully",
  NO_PAYMENTS_FOUND: "No payments found",
  PAYMENTS_FETCHED_SUCCESSFULLY: "Payments fetched successfully",
  ROLE_TRASHED: "Role deleted successfully",
  ERROR_TRASHING_ROLE: "Error trashing role",
};

export const PORT = "3000";
export const HOST = "0.0.0.0";
export const INPUT_TYPE = { STRING: "string" };

export const STRIPE_PAYMENT_INTENT_TYPES = {
  PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
  CHARGE_REFUNDED: "charge.refunded",
};

export const CLOCK = {
  MINUTE: "min",
  HOUR: "hour",
};

export const PAYMENT_STATUSES = {
  PAID: "paid",
  COMPLETED: "completed",
  PAYMENT_FAILED: "payment_failed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const TOKEN_EXPIRY = 60 * 60 * 1000;
export const COMPANY_TOKEN_HEADER = "x-company-token";
// export const STRIPE_SIGNATURE_HEADER = "stripe-signature";
export const AUTHORIZATION_SCHEME = "Bearer";
export const BOOLEAN_VALUE = "boolean";

export const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPE: "image/", // Prefix for allowed MIME types
};

export const USER = "User";

export const CATEGORY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "in-active",
};

export const PRICE_FORMAT_OPTIONS = {
  style: "currency",
  currency: "USD",
};

export const CURRENCY_CODE = "USD";
export const CURRENCY = "usd";

export const BOOLEAN = {
  TRUE: "true",
  FALSE: "false",
};

export const EMPLOYEE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "In-active",
};

export const DATA_TYPE = {
  STRING: "string",
};

export const RESPONSE = {
  ERROR: "error",
  SUCCESS: "success",
};
export const ERRORS = {
  USER_NOT_FOUND: "user-not-found",
  JSON_WEB_TOKEN_ERROR: "JsonWebTokenError",
};

export const APPOINTMENT_STATUS = {
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  ONGOING: "Ongoing",
  CANCELLED: "Cancelled",
};

export const TOKENS = {
  AUTHTOKEN: "authToken",
  ROLE_TOKEN: "role_token",
  COMPANY_TOKEN: "companyToken",
  CUSTOMER_ID: "customerIdToken",
};

export const AZURE_IMAGE_CONTAINER = "admin-images";

export const DEV_ENV = {
  PRODUCTION: "production",
};

export const SAME_SITE = {
  LAX: "lax",
  STRICT: "strict",
};

export const APPOINTMENT_FIELDS = {
  IS_TRASHED: "isTrashed",
  COMPANY_ID: "companyId",
  STYLIST_ID: "stylistId",
  CLIENT: "client",
  SERVICE: "service",
  ID: "_id",
  APPOINTMENT_ID: "appointmentId",
  DATE: "date",
  TIME: "time",
  NOTE: "note",
  STATUS: "appointmentStatus",
};

export const ROLE_PERMISSION_FIELDS = {
  MODULE: "module",
};

export const ROLE_FIELDS = {
  CREATED_BY: "createdBy",
  NAME: "name",
  ROLE_NAME: "roleName",
  ID: "_id",
};

export const USER_FIELDS = {
  COMAPNY: "company",
  ROLE: "role",
  ROLE_NAME: "roleName",
};

export const COMPANY_FIELDS = {
  NAME: "name",
  COUNTRY: "country",
  CITY: "city",
  ADDRESS: "address",
};

export const NOTIFICATION_MESSAGES = {
  NEW_APPOINTMENT_SCHEDULED: "You have a new appointment scheduled.",
  NEW_CLIENT_ADDED: "A new client service has been added.",
  STAFF_UPDATE: "Staff Update",
  SERVICE_ADDED: "Service Added",
  NEW_REVIEW_ADDED: "New Review Added",
};

export const REQUEST_METHOD = {
  PUT: "PUT",
  POST: "POST",
};

export const REQUEST_PATH = {
  APPOINTMENTS: "/appointments",
  CLIENT_SERVICE: "/client-service",
};

export const FILTER_BY = {
  DAY: "daily",
  WEEK: "weekly",
  MONTH: "monthly",
};

export const COLLECTION_NAMES = {
  EMPLOYEES: "employees",
  ROLES: "Role",
  CLIENTS: "clients",
  SERVICES: "services",
};

export const USER_ROLES = {
  SUPERADMIN: "superAdmin",
  USER: "user",
  ADMIN: "admin",
};

export const SERVICE_FIELDS = {
  ID: "_id",
  SERVICE_NAME: "serviceName",
  SERVICE_PRICE: "price",
};

export const CLIENT_FIELDS = {
  ID: "_id",
  CLIENT_NAME: "name",
  COMPANY: "companyId",
};

export const AGGREGATION_FIELDS = {
  STYLIST_ID: "stylistId",
  ROLE_DETAILS: "roleDetails",
  CLIENT: "client",
  SERVICE_DETAILS: "serviceDetails",
};

export const CATEGORY_FIELDS = {
  CREATED_BY: "createdBy",
  NAME: "name",
  IMAGE: "image",
  ID: "_id",
};

export const FILED_NAMES = {
  COMPANY_ID: "companyId",
};

export const NOTIFICATION_TYPES = {
  APPOINTMENT: "appointment",
  SERVICE: "service",
  EMPLOYEE: "employee",
  REVIEWS: "reviews",
};

export const IST_OFFSET = "+05:30";
export const DATE_AND_TIME_FORMAT = "YYYY-MM-DD HH:mm";
export const MOMENT_DATE_FORMAT = "YYYY-MM-DD";
export const DATE_FORMAT = "yyyy-MM-dd";
export const TIME_FORMAT = "HH:mm";
export const DEFAULT_PROFILE_IMAGE_URL = "https://i.ibb.co/LPxR7gw/blank-profile-picture-973460-1280.png";

export const STOCK_STATUS_CRON_UPDATION = {
  DAILY: "0 0 * * *",
};

export const MODELS = {
  APPOINTMENT_ID_TRACKER: "AppointmentIdTracker",
  TRANSACTION_ID_TRACKER: "TransactionIdTracker",
  CLIENT_ID_TRACKER: "ClientIdTracker",
  EMPLOYEE_ID_TRACKER: "EmployeeIdTracker",
  ORDER_ID_TRACKER: "OrderIdTracker",
  COMPANY: "Company",
  SERVICES: "Services",
  EMPLOYEE: "Employee",
  APPOINTMENT: "Appointment",
  USER: "User",
  CLIENT: "Client",
  CATEGORY: "Category",
  ROLE: "Role",
  IMAGE: "Image",
  MODULE: "Module",
  NOTIFICATION: "Notification",
  OFFER: "Offer",
  OTP: "OTP",
  ORDER: "Order",
  REVIEW: "Review",
  ROLE_PERMISSION: "RolePermission",
  SERVICES_ID_TRACKER: "ServicesIdTracker",
  SERVICE_ROLE_MAPPING: "ServiceRoleMapping",
  USER_ID_TRACKER: "UserIdTracker",
  STOCK_ID_TRACKER: "StockIdTracker",
  STOCK: "Stocks",
  PAYMENT: "Payment",
};

export const ROLE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const ORDER_STATUS = {
  DRAFT: "draft",
  PAID: "paid",
  COMPLETED: "completed",
};

export const PAYMENT_STATUS = {
  PAID: "paid",
  UNPAID: "un-paid",
  PROCESSING: "processing",
  PENDING: "pending",
  FAILED: "failed",
};

export const OFFER_TYPES = {
  OFFER: "Offer",
  ANNOUNCEMENT: "Announcement",
};

export const TARGET_AUDIENCE = {
  ALL_USERS: "All users",
  NEW_USERS: "New users",
  RETURNING_USERS: "Returning users",
};

export const NOTIFICATION_STATUS = {
  SCHEDULED: "Scheduled",
  DRAFT: "Draft",
};

export const EMPLOYMENT_TYPE = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
};

export const GENDER = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const STOCK_STATUSES = {
  LOW_STOCK: "Low Stock",
  IN_STOCK: "In Stock",
  OUT_OF_STOCK: "Out of Stock",
  EXPIRED_STOCK: "Expired Stock",
};

export const CLIENT = {
  COLLECTION: "clients", // The name of the clients collection
  FIELD: "client", // The field that references the client in the appointment
  INFO_FIELD: "clientInfo", // The field that will store the client info in aggregation
  GENDER_FIELD: "gender", // The field for the client's gender
  EMAIL_FIELD: "email",
  PHONE_FIELD: "phone",
  NAME_FIELD: "name",
  PHOTO_FIELD: "photo",
  ADDRESS_FIELD: "address",
  DOB_FIELD: "dob",
};

export const EMPLOYEE_PROJECTION_FIELDS = {
  ID: "_id",
  EMPLOYEE_ID: "employeeId",
  EMPLOYEE_NAME: "employeeName",
  EMPLOYEE_EMAIL: "employeeEmail",
  EMPLOYEE_ROLE: "employeeRole",
  EMPLOYEE_PHONE: "employeePhone",
  EMPLOYEE_PHOTO: "employeePhoto",
  EMPLOYEE_JOINING_DATE: "employeeJoiningData",
  EMPLOYEE_SALARY: "employeeSalary",
  EMPLOYEE_ADDRESS: "employeeAddress",
  EMPLOYEE_STATUS: "employeeStatus",
};

export const GENERAL_CONSTANTS = {
  ZERO: 0,
  ONE: 1,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  TEN: 10,
  COMMENT_MAX_LENGTH: 500,
  USER_NAME_MIN_LENGHT: 2,
  USER_NAME_MAX_LENGHT: 50,
};

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "in-active",
  PENDING: "pending",
};

export const ROLE_PROJECTION_FIELDS = {
  ROLE_NAME: "roleName",
};

export const CLIENT_PROJECTION_FIELDS = {
  NAME: "name",
};

export const SERVICE_PROJECTION_FIELDS = {
  SERVICE_NAME: "serviceName",
  SERVICE_PRICE: "price",
};

export const SERVICE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "In-active",
};

export const EMPLOYEE_FIELDS = {
  ID: "_id",
  EMPLOYEE_ROLE: "employeeRole",
};
export const ROLE_SCHEMA = {
  SCHEMA_NAME: "Role",
  ROLE_NAME_FIELD: "roleName",
};

export const TIME_CONSTANTS = {
  TWO_HOURS_IN_MS: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
};

export const STYLIST = {
  COLLECTION: "stylistId", // The name of the stylist field in the appointment
  EMPLOYEE_NAME: "employeeName", // The field for the stylist's name
  EMPLOYEE_PHOTO: "employeePhoto", // The field for the stylist's photo
};

export const SERVICE = {
  COLLECTION: "service", // The name of the service field in the appointment
  FIELD: "serviceName", // The field for the service's name
};
