import mongoose from "mongoose";
import Role from "../models/Role.js";
import { connectDB } from "../config/database.js";
import { SUCCESS_MESSAGES, USER_ROLES } from "../constants.js";

/**
 * Seed the roles in the database if they do not already exist.
 * This function checks if the roles (SuperAdmin, Admin, and User) are already in the database.
 * If any of the roles do not exist, it creates them.
 *
 * @returns {Promise<void>}
 */
const seedRoles = async () => {
  await connectDB(); // Ensure DB connection before proceeding

  try {
    // Check if roles already exist, if not, create them
    const superAdminRole = await Role.findOne({
      roleName: USER_ROLES.SUPERADMIN,
    });
    if (!superAdminRole) {
      await Role.create({ roleName: USER_ROLES.SUPERADMIN });
      console.log(SUCCESS_MESSAGES.SUPER_ADMIN_ROLE_CREATED);
    }

    const adminRole = await Role.findOne({ roleName: USER_ROLES.ADMIN });
    if (!adminRole) {
      await Role.create({ roleName: USER_ROLES.ADMIN });
      console.log(SUCCESS_MESSAGES.ADMIN_ROLE_CREATED);
    }

    const userRole = await Role.findOne({ roleName: USER_ROLES.USER });
    if (!userRole) {
      await Role.create({ roleName: USER_ROLES.USER });
      console.log(SUCCESS_MESSAGES.USER_ROLE_CREATED);
    }
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_SEEDING_ROLES, error);
  } finally {
    // Close the DB connection after seeding
    mongoose.connection.close();
  }
};

seedRoles();
