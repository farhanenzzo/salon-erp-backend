import mongoose from "mongoose";
import { ServiceRoleMapping, Services } from "../models/Services.js";
import { saveNotification } from "../services/notification.js";
import {
  DEFAULT_PROFILE_IMAGE_URL,
  NOTIFICATION_TYPES,
  NOTIFICATION_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APPOINTMENT_STATUS,
} from "../constants.js";
import { uploadImageToFirebase } from "../services/firebaseStorage.js";
import { generateNextSTId } from "../utils/idGenerator.js";
import { Appointment } from "../models/Appointments.js";

/**
 * Adds a new service to the system, including uploading an image (if provided),
 * creating a service entry, generating a service ID, saving a notification,
 * and mapping roles to the service.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing service details.
 * @param {string} req.body.serviceName - The name of the service.
 * @param {string} req.body.category - The category of the service.
 * @param {string} req.body.description - The description of the service.
 * @param {number} req.body.duration - The duration of the service.
 * @param {number} req.body.price - The price of the service.
 * @param {Array} req.body.roles - The list of roles that can access the service.
 * @param {Object} req.file - The uploaded file containing the service image (optional).
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The company ID.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object with the status and created service details.
 */

export const addServices = async (req, res) => {
  try {
    const { serviceName, category, description, duration, price, roles } =
      req.body;
    console.log("req body in service", req.body);
    const { companyId } = req;

    if (!serviceName) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.SERVICE_NAME_REQUIRED });
    }

    let photoToUse = "";
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        photoToUse = await uploadImageToFirebase(req.file.buffer, fileName);
      } catch (error) {
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    }

    // Convert category to ObjectId
    const categoryId = new mongoose.Types.ObjectId(category);

    // Generate serviceID before saving

    const newService = new Services({
      serviceName,
      category: categoryId,
      description,
      duration,
      price,
      serviceImage: photoToUse || DEFAULT_PROFILE_IMAGE_URL,
      companyId,
    });

    await newService.save();

    const serviceID = await generateNextSTId(companyId);

    newService.serviceID = serviceID;

    await newService.save();

    const notification = {
      companyId,
      message: NOTIFICATION_MESSAGES.SERVICE_ADDED,
      type: NOTIFICATION_TYPES.SERVICE,
      details: {
        serviceId: newService._id,
        id: newService.serviceID,
        serviceName: newService.serviceName,
      },
      timestamp: new Date(),
      isRead: false,
    };

    await saveNotification(notification);

    // **Handle roles if provided**
    if (roles) {
      let formattedRoles = [];

      if (Array.isArray(roles)) {
        formattedRoles = roles.map((role) => new mongoose.Types.ObjectId(role));
      } else if (typeof roles === "string") {
        formattedRoles = roles
          .split(",")
          .map((role) => new mongoose.Types.ObjectId(role.trim()));
      }

      // Ensure that the role array is not empty before updating
      if (formattedRoles.length > 0) {
        const existingMapping = await ServiceRoleMapping.findOne({
          serviceID: newService._id,
          companyId,
        });

        if (existingMapping) {
          existingMapping.roles = formattedRoles;
          await existingMapping.save();
        } else {
          const newMapping = new ServiceRoleMapping({
            serviceID: newService._id,
            roles: formattedRoles,
            companyId,
          });
          await newMapping.save();
        }
      }
    }

    res.status(201).json(newService);
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_ADDING_SERVICE });
  }
};

/**
 * Fetch services with optional filtering and pagination.
 * If a `serviceId` is provided in the query, it fetches details for that specific service.
 * Otherwise, it fetches all services with optional pagination and category filtering.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @param {string} [req.query.serviceId] - ID of the specific service to fetch.
 * @param {string} [req.query.categoryId] - ID of the category to filter services by.
 * @param {string} [req.query.page] - Page number for pagination (optional).
 * @param {string} [req.query.limit] - Limit of services per page for pagination (optional).
 * @param {Object} req.companyId - Company ID injected by middleware for filtering.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends JSON response with service(s) data.
 */
export const getServices = async (req, res) => {
  try {
    const { serviceId, page, limit, categoryId } = req.query;

    if (serviceId) {
      try {
        const service = await Services.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(serviceId),
              isTrashed: false,
              companyId: req.companyId,
            },
          },
          {
            $lookup: {
              from: "servicerolemappings",
              localField: "_id",
              foreignField: "serviceID",
              as: "roleMapping",
            },
          },
          {
            $unwind: { path: "$roleMapping", preserveNullAndEmptyArrays: true },
          },
          {
            $lookup: {
              from: "roles",
              localField: "roleMapping.roles",
              foreignField: "_id",
              as: "roleDetails",
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "categoryDetails",
            },
          },
          {
            $addFields: {
              roles: {
                $map: {
                  input: "$roleDetails",
                  as: "role",
                  in: { _id: "$$role._id", roleName: "$$role.roleName" },
                },
              },
              categoryName: { $arrayElemAt: ["$categoryDetails.name", 0] },
            },
          },
          {
            $project: {
              roleMapping: 0,
              roleDetails: 0,
              categoryDetails: 0,
            },
          },
        ]);

        if (service.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Service not found." });
        }

        return res.status(200).json({ success: true, data: service[0] });
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid service ID." });
      }
    }

    const matchQuery = {
      isTrashed: false,
      companyId: req.companyId,
      ...(categoryId && { category: new mongoose.Types.ObjectId(categoryId) }),
    };

    const baseStages = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "servicerolemappings",
          localField: "_id",
          foreignField: "serviceID",
          as: "roleMapping",
        },
      },
      { $unwind: { path: "$roleMapping", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "roleMapping.roles",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $addFields: {
          roles: {
            $map: {
              input: "$roleDetails",
              as: "role",
              in: { _id: "$$role._id", roleName: "$$role.roleName" },
            },
          },
          categoryName: { $arrayElemAt: ["$categoryDetails.name", 0] },
        },
      },
      {
        $project: {
          roleMapping: 0,
          roleDetails: 0,
          categoryDetails: 0,
        },
      },
    ];

    if (page && limit) {
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);

      if (parsedPage > 0 && parsedLimit > 0) {
        const totalCount = await Services.countDocuments(matchQuery);

        const services = await Services.aggregate([
          ...baseStages,
          { $sort: { createdAt: -1 } },
          { $skip: (parsedPage - 1) * parsedLimit },
          { $limit: parsedLimit },
        ]);

        return res.status(200).json({
          success: true,
          data: services,
          pagination: {
            total: totalCount,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(totalCount / parsedLimit),
          },
        });
      }
    }

    const services = await Services.aggregate(baseStages);
    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch services." });
  }
};
/**
 * Fetches the details of a specific service and related services from the same category.
 *
 * @param {object} req - The request object, containing the service ID as a query parameter.
 * @param {object} res - The response object, used to send the service details and related services back to the client.
 *
 * @returns {object} - The response contains the service details and an array of related services.
 */
export const getServiceDetails = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const serviceDetails = await Services.findById(serviceId);

    // Fetch related services for this specific service based on the same category
    const relatedServices = await Services.find({
      category: serviceDetails.category,
      _id: { $ne: serviceId }, // Exclude the current service
    });

    // Send service details along with related services
    res.status(200).json({
      success: true,
      serviceDetails,
      relatedServices,
    });
  } catch (error) {
    // If an error occurs, send an error response
    res.status(500).json({ error: "Error fetching service details" });
  }
};

/**
 * Retrieves the count of services that are not trashed for a specific company.
 *
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The company ID.
 * @param {Object} res - The response object.
 * @returns {Object} - The response containing the count of non-trashed services.
 */
export const getServicesCount = async (req, res) => {
  try {
    const count = await Services.countDocuments({
      isTrashed: false,
      companyId: req.companyId,
    });
    res.status(201).json({ count });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_GET_SERVICE_COUNT });
  }
};

/**
 * Performs a soft delete of a service by setting the `isTrashed` field to true.
 *
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the service to be soft deleted.
 * @param {string} req.companyId - The company ID.
 * @param {Object} res - The response object.
 * @returns {Object} - The response containing a success message or an error message.
 */
export const softDeleteService = async (req, res) => {
  const { id } = req.params; // Extract serviceID from request params
  const { companyId } = req;
  try {
    // Check if the ID is a valid 24-character hexadecimal string (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID_FORMAT });
    }
    if (!companyId) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID });
    }
    // Perform the soft delete by updating isTrashed field
    const service = await Services.findOneAndUpdate(
      { _id: id, companyId },
      { $set: { isTrashed: true } },
      { new: true } // Return the updated document
    );

    if (!service) {
      return res.status(404).json({ error: ERROR_MESSAGES.SERVICE_NOT_FOUND });
    }

    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.SUCCESS_DELETING_SERVICE });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_DELETING_SERVICE, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_DELETING_SERVICE });
  }
};

/**
 * Updates a service with new data, including the option to upload or update an image.
 *
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the service to be updated.
 * @param {Object} req.body - The updated service data.
 * @param {string} req.companyId - The company ID.
 * @param {Object} res - The response object.
 * @returns {Object} - The response containing a success message and updated service data, or an error message.
 */
export const updateService = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const { companyId } = req;

  try {
    if (!companyId) {
      return res.status(403).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }

    let photoToUse = "";

    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        photoToUse = await uploadImageToFirebase(req.file.buffer, fileName);
      } catch (error) {
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    } else if (updatedData.serviceImage) {
      photoToUse = updatedData.serviceImage;
    }

    const service = await Services.findOne({ _id: id, companyId });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (photoToUse) {
      updatedData.serviceImage = photoToUse;
    }

    // Convert roles to ObjectId array if provided
    let formattedRoles = [];

    if (updatedData.roles) {
      if (Array.isArray(updatedData.roles)) {
        formattedRoles = updatedData.roles.map(
          (role) => new mongoose.Types.ObjectId(role)
        );
      } else if (typeof updatedData.roles === "string") {
        formattedRoles = updatedData.roles
          .split(",")
          .map((role) => new mongoose.Types.ObjectId(role.trim()));
      }
    }

    // Update the service
    const updatedService = await Services.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    // ✅ Ensure the role mapping gets updated
    if (formattedRoles.length > 0) {
      await ServiceRoleMapping.findOneAndUpdate(
        { serviceID: id, companyId },
        { $set: { roles: formattedRoles } },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      message: SUCCESS_MESSAGES.SERVICE_UPDATED_SUCCESSFULLY,
      updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_UPDATING_SERVICE });
  }
};

export const checkAppointmentCompletion = async (req, res) => {
  const { serviceId } = req.params; // Service ID from the request URL
  const { customerId } = req; // User ID from the request (e.g., via authentication middleware)
  const { companyId } = req;

  if (!serviceId) {
    return res.status(400).json({ error: ERROR_MESSAGES.SERVICE_ID_REQUIRED });
  }

  if (!companyId) {
    return res.status(400).json({ error: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
  }

  try {
    // Check if the appointment exists and is completed
    const completedAppointment = await Appointment.findOne({
      service: serviceId,
      client: customerId,
      companyId,
      appointmentStatus: APPOINTMENT_STATUS.COMPLETED,
    });

    if (completedAppointment) {
      return res.status(200).json({
        success: true,
        canReview: true,
        appointmentId: completedAppointment._id, // Include the appointment ID
        message:
          SUCCESS_MESSAGES.USER_HAS_COMPLETED_APPOINTMENT_FOR_THIS_SERVICE,
      });
    } else {
      return res.status(200).json({
        success: true,
        canReview: false,
        message:
          SUCCESS_MESSAGES.USER_HAS_NOT_COMPLETED_APPOINTMENT_FOR_THIS_SERVICE,
      });
    }
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_CHECKING_APPOINTMENT_COMPLETION, error); // Log the error for debugging
    res.status(500).json({
      error: ERROR_MESSAGES.FAILED_CHECKING_APPOINTMENT_COMPLETION,
    });
  }
};
