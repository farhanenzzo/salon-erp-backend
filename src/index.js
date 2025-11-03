import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { startAppointmentStatusCron } from "./cron/appointmentStatusUpdate.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startServer } from "./config/server.js";
import { startOfferStatusCron } from "./cron/offerStatusUpdate.js";
import { startStockStatusCron } from "./cron/stockStatusUpdate.js";
import { seedModules } from "./seeds/seedModules.js";
import {
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
  HOST,
  PORT,
  ROUTES,
} from "./constants.js";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || PORT, GENERAL_CONSTANTS.TEN);
const host = process.env.HOST || HOST;

const corsOptions = {
  // FIX APPLIED HERE: Use the nullish coalescing operator (?? '')
  // If CORS_ALLOWED_ORIGINS is null or undefined, it defaults to an empty string,
  // preventing the "Cannot read properties of undefined (reading 'split')" error.
  origin: (process.env.CORS_ALLOWED_ORIGINS ?? "").split(",").map((origin) =>
    origin.trim()
  ),
  credentials: true, // Allow credentials (cookies, authorization headers)
};

/**
 * Set up CORS configuration with allowed origins and credentials.
 */
app.use(cors(corsOptions));

/**
 * Middleware to parse cookies from the request.
 */
app.use(cookieParser());

/**
 * Middleware to parse JSON requests.
 */
app.use(express.json());

/**
 * Middleware to parse URL-encoded requests.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Set up security headers with Helmet.
 */
app.use(helmet()); // Security headers with Helmet

/**
 * Mounting all API routes under the base route.
 * @see ROUTES.BASE_ROUTE
 */
app.use(ROUTES.BASE_ROUTE, routes); // Mounting all API routes

/**
 * Global error handling middleware to catch and handle errors.
 */
app.use(errorHandler);

/**
 * Starts the server and runs the cron jobs once the server is ready.
 * @param {Express} app - The Express application instance.
 * @param {number} port - The port number for the server to listen on.
 * @param {string} host - The host address for the server.
 */
startServer(app, port, host)
  .then(() => {
    // Start the cron job after the server starts
    seedModules();
    startAppointmentStatusCron();
    startOfferStatusCron();
    startStockStatusCron();
  })
  .catch((error) => {
    console.error(ERROR_MESSAGES.FAILED_STARTING_SERVER, error);
    process.exit(1);
  });

export default app;