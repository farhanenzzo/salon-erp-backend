import mongoose from "mongoose";
import { Employee } from "../models/Employee.js";
import { ServiceRoleMapping } from "../models/Services.js";
import {
  DEFAULT_PROFILE_IMAGE_URL,
  EMPLOYEE_STATUS,
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
  SUCCESS_MESSAGES,
} from "../constants.js";
import { uploadImageToBlob } from "../utils/azureUpload.js";
import { generateNextEmployeeId } from "../utils/idGenerator.js";

/**
 * Adds a new employee to the database.
 * Handles image upload for employee photo if provided.
 * @async
 * @param {Object} req - The request object containing the employee data.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with the created employee details.
 * @throws {Error} Throws an error if the image upload or employee creation fails.
 */
export const addEmployee = async (req, res) => {
  const {
    employeeName,
    employeeEmail,
    employeeRole,
    employeePhone,
    employeeJoiningData,
    employeeSalary,
    employeeAddress,
    employeeGender,
  } = req.body;

  const { companyId } = req;

  // Default to null if no photo is uploaded
  let employeePhoto = null;

  // Check if a file was uploaded
  if (req.file) {
    try {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      employeePhoto = await uploadImageToBlob(req.file.buffer, fileName); // Upload and get the URL
    } catch (error) {
      console.log(ERROR_MESSAGES.FAILED_IMAGE_UPLOAD, error);
      return res
        .status(500)
        .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
    }
  }

  try {
    // Generate employee ID

    // Create a new employee object
    const newEmployee = new Employee({
      employeeName,
      employeeEmail,
      employeeRole,
      employeePhone,
      employeePhoto: employeePhoto || DEFAULT_PROFILE_IMAGE_URL, // Use uploaded or default photo
      employeeJoiningData,
      employeeSalary,
      employeeAddress,
      employeeGender,
      companyId,
    });

    // Save the employee to the database
    await newEmployee.save();

    const employeeId = await generateNextEmployeeId(companyId);
    newEmployee.employeeId = employeeId;

    await newEmployee.save();

    // Respond with the created employee
    res.status(201).json(newEmployee);
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_ADDING_EMPLOYEE, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_ADDING_EMPLOYEE });
  }
};

/**
 * Retrieves a list of employees for a given company with pagination and role details.
 * @async
 * @param {Object} req - The request object containing the query parameters for pagination and the company ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with the list of employees, including pagination metadata if applicable.
 * @throws {Error} Throws an error if fetching employees fails.
 */
export const listEmployees = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Parse and validate page and limit
    const parsedPage =
      page && parseInt(page) > GENERAL_CONSTANTS.ZERO ? parseInt(page) : null;
    const parsedLimit =
      limit && parseInt(limit) > GENERAL_CONSTANTS.ZERO
        ? parseInt(limit)
        : null;

    // Base match criteria
    const matchStage = {
      $match: {
        isTrashed: false,
        companyId: req.companyId,
      },
    };

    // Get total count for pagination
    const totalCount = await Employee.aggregate([
      matchStage,
      {
        $count: "total",
      },
    ]);

    const pipeline = [
      matchStage,
      {
        // Use $lookup to join the 'Roles' collection with the 'employeeRole' field
        $lookup: {
          from: "roles", // Assuming the 'Roles' collection is called 'roles'
          localField: "employeeRole", // Employee's reference to role
          foreignField: "_id", // Role's _id field
          as: "role", // Output the role data in an array named 'role'
        },
      },
      {
        // Flatten the 'role' array to directly access the role object
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true, // This will preserve employees without a role
        },
      },
      {
        // Optionally, project the employee fields and include the role's name instead of the ID
        $project: {
          employeeId: 1,
          employeeName: 1,
          employeeEmail: 1,
          employeePhone: 1,
          employeePhoto: 1,
          employeeJoiningData: 1,
          employeeSalary: 1,
          employeeAddress: 1,
          employeeGender: 1,
          employeeStatus: 1,
          createdAt: 1,
          role: {
            roleName: "$role.roleName", // Include roleName from the 'role' object
            _id: "$role._id", // Include _id from the 'role' object
          },
        },
      },
      {
        $sort: { createdAt: -1 }, // 🔥 Sort by createdAt in descending order (latest first)
      },
    ];

    // Add pagination stages if page and limit are provided
    if (parsedPage && parsedLimit) {
      const skip = (parsedPage - 1) * parsedLimit;
      pipeline.push({ $skip: skip }, { $limit: parsedLimit });
    }

    // Execute the query
    const employees = await Employee.aggregate(pipeline);

    // Build response
    const response = {
      data: employees,
    };

    // Include pagination metadata only if applicable
    if (parsedPage && parsedLimit) {
      response.pagination = {
        total: totalCount[0]?.total || 0,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil((totalCount[0]?.total || 0) / parsedLimit),
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_TO_GET_EMPLOYEES, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_GET_EMPLOYEES });
  }
};

/**
 * Lists employees based on the roles associated with a given service.
 * Validates the service ID and fetches the relevant employees.
 * @async
 * @param {Object} req - The request object containing the serviceID query parameter and companyId.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with the list of employees associated with the service roles or appropriate error messages.
 * @throws {Error} Throws an error if fetching employees based on service fails.
 */
export const listServiceBasedEmployee = async (req, res) => {
  const { serviceID } = req.query;

  // Validate query parameter
  if (!serviceID) {
    return res.status(400).json({ error: ERROR_MESSAGES.SERVICE_ID_REQUIRED });
  }

  try {
    // Step 1: Get the roles associated with the service
    const serviceRoleMapping = await ServiceRoleMapping.findOne({
      serviceID,
      companyId: req.companyId,
    });

    if (
      !serviceRoleMapping ||
      !serviceRoleMapping.roles ||
      serviceRoleMapping.roles.length === 0
    ) {
      return res
        .status(200)
        .json({ message: ERROR_MESSAGES.NO_ROLES_FOR_GIVEN_SERVICE });
    }

    // Step 2: Find employees with the roles for the service
    const employees = await Employee.find({
      employeeRole: { $in: serviceRoleMapping.roles },
      isTrashed: false, // Exclude employees marked as trashed
      employeeStatus: EMPLOYEE_STATUS.ACTIVE, // Include only active employees
      companyId: req.companyId,
    });

    // Step 3: Check if employees were found
    if (employees.length === GENERAL_CONSTANTS.ZERO) {
      return res
        .status(404)
        .json({ error: ERROR_MESSAGES.NO_EMPLOYEES_FOR_GIVEN_SERVICE });
    }

    // Respond with the list of employees
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      error: ERROR_MESSAGES.ERROR_FETCHING_EMPLOYEES_BASED_ON_SERVICE,
    });
  }
};

/**
 * Lists employees based on the roles associated with a given service,
 * but only retrieves the employee's name and photo.
 * Validates the service ID and fetches the relevant employees' summaries.
 * @async
 * @param {Object} req - The request object containing the serviceID query parameter and companyId.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with the list of employee names and photos associated with the service roles or appropriate error messages.
 * @throws {Error} Throws an error if fetching employee summaries based on service fails.
 */
export const listServiceBasedEmployeeSummary = async (req, res) => {
  const { serviceID } = req.query;

  // Validate query parameter
  if (!serviceID) {
    return res.status(400).json({ error: ERROR_MESSAGES.SERVICE_ID_REQUIRED });
  }

  try {
    // Step 1: Get the roles associated with the service
    const serviceRoleMapping = await ServiceRoleMapping.findOne({
      serviceID,
      companyId: req.companyId,
    });

    if (
      !serviceRoleMapping ||
      !serviceRoleMapping.roles ||
      serviceRoleMapping.roles.length === 0
    ) {
      return res
        .status(200)
        .json({ message: ERROR_MESSAGES.NO_ROLES_FOR_GIVEN_SERVICE });
    }

    // Step 2: Find employees with the roles for the service, but only retrieve name and photo
    const employees = await Employee.find(
      {
        employeeRole: { $in: serviceRoleMapping.roles },
        isTrashed: false, // Exclude employees marked as trashed
        employeeStatus: EMPLOYEE_STATUS.ACTIVE, // Include only active employees
        companyId: req.companyId,
      },
      { employeeName: 1, employeePhoto: 1 } // Only select name and photo
    );

    // Step 3: Check if employees were found
    if (employees.length === GENERAL_CONSTANTS.ZERO) {
      return res
        .status(404)
        .json({ error: ERROR_MESSAGES.NO_EMPLOYEES_FOR_GIVEN_SERVICE });
    }

    // Respond with the list of employees' names and photos
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      error: ERROR_MESSAGES.ERROR_FETCHING_EMPLOYEES_BASED_ON_SERVICE,
    });
  }
};

/**
 * Soft deletes an employee by setting their 'isTrashed' status to true.
 * Validates the employee ID and updates the employee record.
 * @async
 * @param {Object} req - The request object containing the employee ID in the params.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with a success or error message based on the result.
 * @throws {Error} Throws an error if deleting the employee fails.
 */
export const softDeleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID_FORMAT });
    }
    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    // Find and delete the employee by ObjectId
    const result = await Employee.findByIdAndUpdate(
      objectId,
      { isTrashed: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
    }
    res.status(200).json({ message: SUCCESS_MESSAGES.EMPLOYEE_DELETED });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_DELETE_EMPLOYEE, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_DELETE_EMPLOYEE });
  }
};

/**
 * Updates an existing employee's information, including the option to upload a new photo.
 * Validates and processes the uploaded data and updates the employee record in the database.
 * @async
 * @param {Object} req - The request object containing the employee ID in the params and the update data in the body.
 * @param {Object} res - The response object to send the result.
 * @returns {Promise<void>} Responds with a success message and the updated employee data, or an error message if the update fails.
 * @throws {Error} Throws an error if updating the employee fails.
 */
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  const updateData = { ...req.body }; // Clone req.body to avoid mutation

  try {
    if (!companyId) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    // Check if a file was uploaded and process it
    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const uploadedPhoto = await uploadImageToBlob(
          req.file.buffer,
          fileName
        ); // Upload and get URL
        updateData.employeePhoto = uploadedPhoto; // Include uploaded image URL in the update
      } catch (error) {
        console.error(ERROR_MESSAGES.FAILED_IMAGE_UPLOAD, error);
        return res
          .status(500)
          .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
      }
    }

    // If no new photo is provided, retain the current one
    if (!req.file && !updateData.employeePhoto) {
      const existingEmployee = await Employee.findById(id);
      if (!existingEmployee) {
        return res
          .status(404)
          .json({ message: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
      }
      updateData.employeePhoto = existingEmployee.employeePhoto; // Retain current photo
    }

    // Update the employee record with the final data
    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Apply schema validations
    });

    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND });
    }

    res.status(200).json({
      message: SUCCESS_MESSAGES.EMPLOYEE_UPDATED_SUCCESSFULLY,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_UPDATING_EMPLOYEE, error);
    res.status(500).json({ message: ERROR_MESSAGES.ERROR_UPDATING_EMPLOYEE });
  }
};
