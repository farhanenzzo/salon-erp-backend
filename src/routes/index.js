import express from "express";
import otpRoutes from "./otp.js";
import authRoutes from "./auth.js";
import appointmentRoutes from "./appointment.js";
import servicesRoutes from "./services.js";
import employeeRoutes from "./employee.js";
import clientRoutes from "./client.js";
import stockRoutes from "./stock.js";
import offerRoutes from "./offer.js";
import reviewRoutes from "./review.js";
import companyRoutes from "./company.js";
import { authMiddleware, isAuthenticated } from "../middleware/auth.js";
import { decodeCompanyToken } from "../middleware/decodeCompanyToken.js";
import categoryRoutes from "./category.js";
import notificationRoutes from "./notification.js";
// import stripeRoutes from "./stripe.js";
import moduleRoutes from "./module.js";
import roleRoutes from "./role.js";
import paymentRoutes from "../routes/payment.js";
import { BASE_ROUTES } from "../constants.js";
import revenueRoutes from "../routes/revenue.js";
import grotechAdminRoutes from "./grotechAdmin.js";

const router = express.Router();

/**
 * Define the base routes for the application.
 *
 * This router handles all the routes in the application, including public routes and protected routes
 * which require authentication and company token decoding.
 *
 * @returns {Router} The configured Express router
 */
router.use(BASE_ROUTES.OTP, otpRoutes);
router.use(BASE_ROUTES.AUTH, authRoutes);
router.use("/grotech-admin", grotechAdminRoutes);

// Public route to add a company (no authentication required)
router.use(BASE_ROUTES.COMPANY, companyRoutes);

router.use(
  BASE_ROUTES.APPOINTMENTS,
  isAuthenticated,
  decodeCompanyToken,
  appointmentRoutes
);
router.use(
  BASE_ROUTES.SERVICES,
  isAuthenticated,
  decodeCompanyToken,
  servicesRoutes
);
router.use(
  BASE_ROUTES.EMPLOYEES,
  isAuthenticated,
  decodeCompanyToken,
  employeeRoutes
);
router.use(
  BASE_ROUTES.CLIENTS,
  isAuthenticated,
  decodeCompanyToken,
  clientRoutes
);
router.use(
  BASE_ROUTES.STOCKS,
  isAuthenticated,
  decodeCompanyToken,
  stockRoutes
);
router.use(
  BASE_ROUTES.OFFERS,
  isAuthenticated,
  decodeCompanyToken,
  offerRoutes
);
router.use(
  BASE_ROUTES.REVIEW,
  isAuthenticated,
  decodeCompanyToken,
  reviewRoutes
);
router.use(
  BASE_ROUTES.CATEGORIES,
  isAuthenticated,
  decodeCompanyToken,
  categoryRoutes
);

router.use(
  BASE_ROUTES.NOTIFICATIONS,
  isAuthenticated,
  decodeCompanyToken,
  notificationRoutes
);
/*
router.use(
  BASE_ROUTES.PAYMENT,
  isAuthenticated,
  decodeCompanyToken,
  stripeRoutes
);
*/

router.use(
  BASE_ROUTES.PAYMENT,
  isAuthenticated,
  decodeCompanyToken,
  paymentRoutes
);

router.use(
  BASE_ROUTES.REVENUE,
  isAuthenticated,
  decodeCompanyToken,
  revenueRoutes
);

router.use(BASE_ROUTES.MODULES, isAuthenticated, authMiddleware, moduleRoutes);

router.use(BASE_ROUTES.ROLES, isAuthenticated, decodeCompanyToken, roleRoutes);

export default router;
