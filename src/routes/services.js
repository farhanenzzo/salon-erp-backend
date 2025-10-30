import express from "express";
import {
  addServices,
  softDeleteService,
  getServicesCount,
  getServices,
  updateService,
  getServiceDetails,
  checkAppointmentCompletion,
} from "../controllers/service.js";
import upload from "../middleware/upload.js";
import { SERVICE_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * Route to get all services and add a new service.
 * @route GET /api/services
 * @route POST /api/services
 * @access Public
 */
router
  .route(SERVICE_ROUTES.BASE)
  .get(getServices)
  .post(upload(UPLOAD_IMAGE_FIELD.IMAGE), addServices);

/**
 * @function getServiceDetails
 * @description Fetches the details of a specific service based on the serviceId.
 *              It also returns related services from the same category.
 * @route GET /api/services/:serviceId/details
 * @param {string} serviceId - The ID of the service whose details are to be fetched.
 * @returns {object} 200 - Service details along with related services.
 * @returns {object} 400 - Bad request, missing or invalid parameters.
 * @returns {object} 500 - Internal server error if fetching service details fails.
 */
router.get(
  SERVICE_ROUTES.GET_SERVICES_WITH_RELATED_SERVICES,
  getServiceDetails
);

/**
 * Route to get the count of services.
 * @route GET /api/services/count
 * @access Public
 */
router.route(SERVICE_ROUTES.COUNT).get(getServicesCount);

/**
 * Route to update a specific service by ID.
 * @route PATCH /api/services/:id
 * @access Public
 */
router
  .route(SERVICE_ROUTES.UPDATE)
  .patch(upload(UPLOAD_IMAGE_FIELD.IMAGE), updateService);

/**
 * Route to soft delete a specific service by ID.
 * @route PATCH /api/services/soft-delete/:id
 * @access Public
 */
router.route(SERVICE_ROUTES.SOFT_DELETE).patch(softDeleteService);

router
  .route(SERVICE_ROUTES.CHECK_SERVICE_COMPLETION)
  .get(checkAppointmentCompletion);

export default router;
