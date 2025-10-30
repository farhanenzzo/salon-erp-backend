import {
  BOOLEAN,
  ERROR_MESSAGES,
  GENERAL_CONSTANTS,
  INPUT_TYPE,
  ROLE_FIELDS,
  SUCCESS_MESSAGES,
  USER_ROLES,
} from "../constants.js";
import Module from "../models/Module.js";
import Role from "../models/Role.js";
import RolePermission from "../models/RolePermission.js";
import { User } from "../models/User.js";

/**
 * Creates a new role for a company.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing role details.
 * @param {string} req.body.roleName - The name of the role to be created.
 * @param {Object} req - The request object.
 * @param {string} req.userId - The user ID from the authenticated user.
 * @param {string} req.companyId - The company ID from the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object with the success or error message.
 */
export const createRole = async (req, res) => {
  const { companyId } = req;
  const { roleName } = req.body;
  const userId = req.userId;

  if (typeof roleName !== INPUT_TYPE.STRING) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.ROLE_NAME_SHOULD_BE_STRING });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  if (!companyId) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
  }

  if (!roleName) {
    return res
      .status(400)
      .json({ success: false, message: ERROR_MESSAGES.ROLE_NAME_REQUIRED });
  }

  try {
    // Check if the role already exists for the specific company
    const existingRole = await Role.findOne({ roleName, companyId });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.ROLE_EXISTS,
      });
    }

    const createdBy = await User.findOne({ firebaseUid: userId }).select("_id");

    // Create a new role
    const newRole = new Role({ roleName, companyId, createdBy });
    await newRole.save();

    const emptyPermissions = []; // No modules initially
    for (const moduleId of emptyPermissions) {
      await RolePermission.create({
        companyId: companyId,
        role: newRole._id,
        module: moduleId,
        canView: false,
        canEdit: false,
      });
    }

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.ROLE_CREATED,
      role: newRole,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const trashRole = async (req, res) => {
  const { roleId } = req.params;
  const { companyId } = req;

  try {
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND,
      });
    }

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.ROLE_ID_REQUIRED,
      });
    }

    const role = await Role.findOneAndUpdate(
      { _id: roleId, companyId, isTrashed: false },
      { isTrashed: true },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.ROLE_NOT_FOUND,
      });
    }

    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.ROLE_TRASHED,
    });
  } catch (error) {
    console.error("Error trashing role:", error);
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.ERROR_TRASHING_ROLE,
    });
  }
};

/**
 * Fetches all roles for a given company.
 *
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The company ID from the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object containing a list of roles for the company.
 */
export const getAllRoles = async (req, res) => {
  const { companyId } = req;
  try {
    const roles = await Role.find({ companyId, isTrashed: false }).populate(
      ROLE_FIELDS.CREATED_BY,
      ROLE_FIELDS.NAME
    );

    res.status(200).json({
      success: true,
      data: roles,
      message: SUCCESS_MESSAGES.FETCHING_ROLES_SUCCESS,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Retrieves roles for the dropdown, excluding the 'SUPERADMIN' role.
 *
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The company ID from the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object with the filtered roles for the dropdown.
 */
export const getRolesForDropdown = async (req, res) => {
  const { companyId } = req;

  try {
    // Fetch roles for the given company
    const roles = await Role.find({ companyId, isTrashed: false }).select([
      ROLE_FIELDS.ROLE_NAME,
      ROLE_FIELDS.ID,
    ]);

    // Filter out the 'SUPERADMIN' role
    const filteredRoles = roles.filter(
      (role) => role.roleName !== USER_ROLES.SUPERADMIN
    );

    res.status(200).json(filteredRoles);
  } catch (error) {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Retrieves all modules with their permissions for a specific role.
 *
 * @param {Object} req - The request object.
 * @param {string} req.params.roleId - The ID of the role to fetch permissions for.
 * @param {Object} req.query - The query object containing optional filters.
 * @param {string} req.query.showCanViewModules - Filter to show only modules that can be viewed.
 * @param {string} req.query.showCanEditModules - Filter to show only modules that can be edited.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object with the modules and their permissions.
 */
export const getAllModulesWithPermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(roleId);
    const { showCanViewModules, showCanEditModules } = req.query;

    // Fetch ALL modules (this ensures we get every module)
    const allModules = await Module.find({});

    // Fetch existing role permissions for this specific role
    const existingRolePermissions = await RolePermission.find({
      role: roleId,
    });

    // Map ALL modules with their current permissions
    let modulesWithPermissions = allModules.map((module) => {
      // Find the permission for this specific module and role
      const modulePermission = existingRolePermissions.find(
        (p) => p.module.toString() === module._id.toString()
      );

      return {
        moduleId: module._id,
        moduleName: module.moduleName,
        // If no specific permission exists, default to false
        canView: modulePermission ? modulePermission.canView : false,
        canEdit: modulePermission ? modulePermission.canEdit : false,
      };
    });

    // Apply optional filtering if query params are passed
    if (showCanViewModules === BOOLEAN.TRUE) {
      modulesWithPermissions = modulesWithPermissions.filter(
        (module) => module.canView
      );
    }
    if (showCanEditModules === BOOLEAN.TRUE) {
      modulesWithPermissions = modulesWithPermissions.filter(
        (module) => module.canEdit
      );
    }

    res.json(modulesWithPermissions);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: ERROR_MESSAGES.ERROR_FETCHING_MODULE_PERMISSIONS });
  }
};

/**
 * Updates the permissions for a specific role across multiple modules.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.roleId - The ID of the role whose permissions are being updated.
 * @param {Object} req - The request object.
 * @param {string} req.companyId - The company ID for the role and modules.
 * @param {Array} req.body.permissions - The array of permission updates, each containing a module ID and permission flags.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object with the status and message indicating success or partial success.
 */
export const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { companyId } = req;
    const { permissions } = req.body; // Array of permission updates

    // Validate input
    if (
      !Array.isArray(permissions) ||
      permissions.length === GENERAL_CONSTANTS.ZERO
    ) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INVALID_PERMISSIONS });
    }

    // Bulk update results
    const updatedPermissions = [];
    const errors = [];

    // Process each permission update
    for (const permissionUpdate of permissions) {
      const { moduleId, canView, canEdit } = permissionUpdate;

      try {
        // Verify that the module exists
        const moduleExists = await Module.findById(moduleId);
        if (!moduleExists) {
          errors.push({
            moduleId,
            message: ERROR_MESSAGES.MODULE_NOT_FOUND,
          });
          continue;
        }

        // Find or create a permission entry
        let permission = await RolePermission.findOne({
          companyId,
          role: roleId,
          module: moduleId,
        });

        const updatedCanView = canEdit ? true : canView;

        if (permission) {
          // Update existing permission
          permission.canView = canView;
          if (canEdit !== undefined) permission.canEdit = canEdit;
          await permission.save();
        } else {
          // Create new permission entry
          permission = new RolePermission({
            companyId,
            role: roleId,
            module: moduleId,
            canView: updatedCanView,
            canEdit: canEdit || false,
          });
          await permission.save();
        }

        updatedPermissions.push(permission);
      } catch (permissionError) {
        errors.push({
          moduleId,
          message: permissionError.message,
        });
      }
    }

    // Respond with results
    if (errors.length > 0) {
      return res.status(206).json({
        message: SUCCESS_MESSAGES.PARTIAL_UPDATE_COMPLETE,
        updatedPermissions,
        errors,
      });
    }

    res.json({
      message: SUCCESS_MESSAGES.PERMISSIONS_UPDATED,
      permissions: updatedPermissions,
    });
  } catch (error) {
    res.status(500).json({
      message: ERROR_MESSAGES.ERROR_UPDATING_PERMISSIONS,
      error: error.message,
    });
  }
};

/**
 * Updates an existing role in the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.roleId - The ID of the role to update.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.roleName - The new name for the role.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response indicating the update status.
 */
export const updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { roleName } = req.body;
  const { companyId } = req;
  const userId = req.userId;

  console.log("req  params", req.params);
  console.log("req  body", req.body);

  if (typeof roleName !== INPUT_TYPE.STRING) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.ROLE_NAME_SHOULD_BE_STRING });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  if (!companyId) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
  }

  if (!roleId) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.ROLE_ID_REQUIRED,
    });
  }

  if (!roleName) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.ROLE_NAME_REQUIRED,
    });
  }

  try {
    // Check if the role exists
    const existingRole = await Role.findOne({ _id: roleId, companyId });
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.ROLE_NOT_FOUND,
      });
    }

    // Check if another role with the same name exists
    const duplicateRole = await Role.findOne({
      roleName,
      companyId,
      _id: { $ne: roleId },
    });
    if (duplicateRole) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.ROLE_EXISTS_FOR_THIS_COMPANY,
      });
    }

    // Update role
    existingRole.roleName = roleName;
    await existingRole.save();

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.ROLE_UPDATED,
      role: existingRole,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
