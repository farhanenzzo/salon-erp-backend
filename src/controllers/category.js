import mongoose from "mongoose";
import Category from "../models/Category.js";
import { validateCategoryInput } from "../validators/category.js";
import { ServiceRoleMapping, Services } from "../models/Services.js";
import {
  CATEGORY_FIELDS,
  CATEGORY_STATUS,
  DATA_TYPE,
  DEFAULT_PROFILE_IMAGE_URL,
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
  RESPONSE,
  SUCCESS_MESSAGES,
} from "../constants.js";
import { User } from "../models/User.js";
import { uploadImageToFirebase } from "../services/firebaseStorage.js";
import { generateNextSTId } from "../utils/idGenerator.js";

/**
 * @function addCategoryHandler
 * @description Handles the addition of a new category and optionally a service associated with it.
 * If the category already exists, it returns an error.
 * If a service is provided, it creates the service, associates it with the category, and maps the service to roles.
 * @param {Object} req - The request object containing `companyId`, `userId`, and category details in the body.
 * @param {Object} res - The response object used to send the result of the operation.
 * @throws {Error} Returns an error response if any database operation or validation fails.
 *
 * Request Body Example:
 * {
 *   "name": "Category Name",
 *   "image": "Image URL",
 *   "serviceName": "Service Name",
 *   "price": 100,
 *   "description": "Service Description",
 *   "duration": "1 hour",
 *   "roles": ["Role1", "Role2"]
 * }
 *
 * @returns {Object} JSON response containing the status, message, and data.
 *
 * Success Scenarios:
 * - Creates a new category with or without a service.
 * - Associates the created service with the category and maps it to roles if provided.
 *
 * Error Scenarios:
 * - Returns validation error if the input is invalid.
 * - Returns error if the category already exists.
 * - Returns internal server error if any operation fails.
 */
export const addCategoryHandler = async (req, res) => {
  const { companyId } = req; // Assuming `companyId` is added by middleware
  const { error } = validateCategoryInput(req.body);
  const userId = req.userId;

  if (error) {
    return res.status(400).json({
      status: RESPONSE.ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.details.map((detail) => detail.message),
    });
  }

  const { name, image, serviceName, price, description, duration, roles } =
    req.body;

  try {
    // Check if category already exists
    let category = await Category.findOne({
      companyId,
      name,
    });

    if (category) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.CATEGORY_EXISTS,
      });
    }

    const createdBy = await User.findOne({ firebaseUid: userId }).select("_id");

    if (!category) {
      // Create a new category if it doesn't exist
      category = new Category({
        companyId,
        name,
        createdBy: createdBy._id,
        image: image || null,
        services: [],
      });

      await category.save();
    }

    // If a service is provided, create the service and associate it with the category
    if (serviceName && price) {
      const serviceId = await generateNextSTId(companyId);

      const newService = new Services({
        companyId,
        serviceID: serviceId,
        serviceName,
        price,
        duration: duration || "",
        description: description || "",
        categoryId: category._id, // Associate service with category
      });

      const createdService = await newService.save();

      // Create or update the ServiceRoleMapping for the service
      if (roles && roles.length > GENERAL_CONSTANTS.ZERO) {
        let serviceRoleMapping = await ServiceRoleMapping.findOne({
          companyId,
          serviceID: createdService._id,
        });

        if (!serviceRoleMapping) {
          // Create new ServiceRoleMapping if it doesn't exist
          serviceRoleMapping = new ServiceRoleMapping({
            companyId,
            serviceID: createdService._id,
            roles: roles,
          });
          await serviceRoleMapping.save();
        } else {
          // Update existing ServiceRoleMapping
          serviceRoleMapping.roles = roles;
          await serviceRoleMapping.save();
        }
      }

      category.services.push(createdService._id);
      await category.save();

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.CATEGORY_AND_SERVICE_ADDED,
        data: category,
      });
    } else {
      // If no service is provided, just return the category
      res.status(201).json({
        success: false,
        message: SUCCESS_MESSAGES.CATEGORY_ADDED_WITHOUT_SERVICE,
        data: category,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: RESPONSE.ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
};

/**
 * Handler to list all categories for a specific company.
 *
 * This function retrieves all categories associated with the given company ID,
 * excluding trashed categories. The response includes populated fields for
 * the category creator and name.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.companyId - The ID of the company, added by middleware.
 * @param {Object} res - The HTTP response object.
 * @returns {void} Sends a JSON response containing the categories data or an error message.
 *
 * HTTP Responses:
 * - 200: Success with categories data or an empty array if no categories exist.
 * - 400: Missing required companyId in the request.
 * - 500: Internal server error.
 */
export const listCategoriesHandler = async (req, res) => {
  const { companyId } = req;
  const { status } = req.query;

  try {
    if (!companyId)
      res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.REQUIRES_COMPANY_ID,
      });

    const query = { companyId, isTrashed: false };
    if (status) {
      query.status = status;
    }
    const categories = await Category.find(query).populate(
      CATEGORY_FIELDS.CREATED_BY,
      CATEGORY_FIELDS.NAME
    );
    if (!categories || categories.length === GENERAL_CONSTANTS.ZERO) {
      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.NO_CATEGORIES_FOUND_FOR_THIS_COMPANY,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
};

/**
 * @description Handles the creation of a new category for a company.
 *              Allows for an optional category image upload.
 * @param {Object} req - The HTTP request object containing `companyId`, `userId`, and category details in `body`.
 * @param {Object} res - The HTTP response object for sending back API responses.
 * @returns {Object} JSON response with the status and details of the created category or error.
 */
export const createCategory = async (req, res) => {
  const { companyId } = req;
  const { name } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  let categoryPhoto = "";

  if (req.file) {
    try {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      categoryPhoto = await uploadImageToFirebase(req.file.buffer, fileName); // Upload and get the URL
    } catch (error) {
      console.log(ERROR_MESSAGES.FAILED_IMAGE_UPLOAD, error);
      return res
        .status(500)
        .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
    }
  }

  // Fallback image URL
  const fallbackImage = DEFAULT_PROFILE_IMAGE_URL;
  const createdBy = await User.findOne({ firebaseUid: userId }).select("_id");

  if (!name || typeof name !== DATA_TYPE.STRING) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.CATEGORY_NAME_IS_REQUIRED_SHOULD_BE_STRING,
    });
  }

  try {
    // Check if a category with the same name exists for the company
    let category = await Category.findOne({
      companyId,
      name,
      isTrashed: false,
    });

    if (category) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS,
      });
    }

    // Create a new category without services
    category = new Category({
      companyId,
      createdBy: createdBy,
      name,
      image: categoryPhoto || fallbackImage, // Assign the fallback image
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_CREATION_SUCCESS_WITHOUT_SERVICE,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: err.message,
    });
  }
};

/**
 * @description Retrieves a list of active categories for a dropdown, based on the provided company ID.
 * @param {Object} req - The HTTP request object containing `companyId` added by middleware.
 * @param {Object} res - The HTTP response object for sending back API responses.
 * @returns {Object} JSON response with the status, message, and list of categories or error details.
 */
export const listCategoryDropdown = async (req, res) => {
  const { companyId } = req;

  try {
    if (!companyId)
      res.status(400).json({
        status: RESPONSE.ERROR,
        message: ERROR_MESSAGES.REQUIRES_COMPANY_ID,
      });
    const categories = await Category.find({
      companyId,
      status: CATEGORY_STATUS.ACTIVE,
      isTrashed: false,
    }).select(
      `${CATEGORY_FIELDS.ID} ${CATEGORY_FIELDS.NAME} ${CATEGORY_FIELDS.IMAGE}`
    );

    res.status(200).json({
      status: RESPONSE.SUCCESS,
      message: SUCCESS_MESSAGES.CATEGORIES_RETRIEVED_SUCCESSFULLY,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: RESPONSE.ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

/**
 * @description Soft deletes a category and its related services for a given company ID.
 * @param {Object} req - The HTTP request object containing the `companyId` added by middleware and the `id` of the category to be deleted in `req.params`.
 * @param {Object} res - The HTTP response object for sending back API responses.
 * @returns {Object} JSON response indicating success or failure, along with details about the operation.
 *
 * @throws Will return a 400 status if `companyId` is missing.
 * @throws Will return a 404 status if the category is not found.
 * @throws Will return a 500 status if there is an internal server error.
 *
 * @notes This function performs the soft deletion of a category by setting `isTrashed` to `true`
 *        and updates all related services within a database transaction to ensure consistency.
 */
export const softDeleteCategory = async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;

  const session = await mongoose.startSession();

  try {
    // Start a transaction
    await session.startTransaction();

    if (!companyId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.REQUIRES_COMPANY_ID,
      });
    }

    // Find and soft delete the category
    const category = await Category.findOneAndUpdate(
      { _id: id, companyId },
      { isTrashed: true },
      { session, new: true } // Ensure we use the session
    );

    if (!category) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
      });
    }

    // Only update services if category deletion succeeds
    const serviceUpdateResult = await Services.updateMany(
      {
        category: id,
        companyId: companyId,
      },
      {
        isTrashed: true,
      },
      { session } // Use the same session
    );

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.CATEGORY_AND_RELATED_SERVICES_DELETED,
      details: {
        categoryUpdated: !!category,
        servicesUpdated: serviceUpdateResult.modifiedCount,
      },
    });
  } catch (error) {
    // Ensure transaction is aborted in case of any error
    await session.abortTransaction();

    res.status(500).json({
      success: false,

      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  } finally {
    // Always end the session
    session.endSession();
  }
};

/**
 * Updates category details including name, status, and optionally updates the category image.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - ID of the category to update
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Updated category name
 * @param {string} req.body.status - Updated category status
 * @param {Object} req.file - Uploaded file (if provided)
 * @param {Object} req.companyId - Company ID extracted from middleware
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */

export const updateCategoryDetails = async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { name, status } = req.body;

  console.log("uploading file", req.file);

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "Company ID is required",
    });
  }

  try {
    // Fetch the existing category first
    const existingCategory = await Category.findOne({ _id: id, companyId });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let categoryPhoto = existingCategory.image; // Keep existing image by default

    // Check if a new image is provided in req.file
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        categoryPhoto = await uploadImageToFirebase(req.file.buffer, fileName);

        if (!categoryPhoto) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
          });
        }
      } catch (error) {
        console.error("Image Upload Failed:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: error.message,
        });
      }
    }

    // Create update object
    const updateData = {
      name,
      status,
      image: categoryPhoto, // Use the new image or existing one
    };

    // Update category details
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, companyId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found during update",
      });
    }

    // Save the changes
    await updatedCategory.save();

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Category Update Failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

/**
 * Toggles the status of a category between ACTIVE and INACTIVE.
 *
 * @async
 * @function toggleCategoryStatus
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The company ID from the middleware.
 * @param {string} req.params.id - The ID of the category to toggle.
 * @param {Object} res - The response object.
 *
 * @description
 * This function allows toggling the status of a category (ACTIVE or INACTIVE)
 * within a specified company. It validates the existence of the category,
 * determines the new status, updates the database, and returns the updated category.
 *
 * @returns {Object} - A JSON response with the updated category on success,
 * or an error message on failure.
 *
 * @throws {Error} - Throws an error if the category is not found, or there are
 * database issues during the status update.
 */
export const toggleCategoryStatus = async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;

  try {
    const category = await Category.findOne({ _id: id, companyId });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
      });
    }

    // Toggle status
    const newStatus =
      category.status === CATEGORY_STATUS.ACTIVE
        ? CATEGORY_STATUS.INACTIVE
        : CATEGORY_STATUS.ACTIVE;

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, companyId },
      {
        status: newStatus,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.FAILED_TOGGLING_STATUS,
      error: error.message,
    });
  }
};
