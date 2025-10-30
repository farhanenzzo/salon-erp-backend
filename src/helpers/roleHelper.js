import Role from "../models/Role.js";

/**
 * Assigns a role to a user by finding or creating the specified role for a company.
 * @function assignRoleToUser
 * @param {string} roleName - The name of the role to assign.
 * @param {string} companyId - The ID of the company to associate the role with.
 * @returns {Promise<string>} The ID of the assigned or created role.
 * @throws {Error} If there is an issue with finding or saving the role.
 */
export const assignRoleToUser = async (roleName, companyId) => {
  // Find or create the role
  let role = await Role.findOne({ roleName, companyId });

  if (!role) {
    role = new Role({
      roleName,
      companyId,
    });
    await role.save();
  }

  return role._id;
};
