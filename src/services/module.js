import { ERROR_MESSAGES, ROLE_PERMISSION_FIELDS } from "../constants.js";
import RolePermission from "../models/RolePermission.js"; // RolePermission model

/**
 * Fetches the modules allowed for a specific role.
 *
 * @param {string} roleId - The ID of the role for which to fetch allowed modules.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of modules allowed for the specified role.
 * @throws {Error} - Throws an error if fetching modules fails.
 */
export const getModulesForRole = async (roleId) => {
  try {
    const permissions = await RolePermission.find({
      role: roleId,
      canView: true,
    }).populate(ROLE_PERMISSION_FIELDS.MODULE); // Populate the 'module' field with module details

    // Extract the modules from the permissions
    const modules = permissions.map((permission) => permission.module);
    return modules;
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_FETCHING_MODULES, error);
    throw new Error(ERROR_MESSAGES.ERROR_FETCHING_MODULES);
  }
};
