
import mongoose from "mongoose";
import Module from "../models/Module.js";
import Role from "../models/Role.js";
import RolePermission from "../models/RolePermission.js";
import { sidebarModules } from "../utils/data.js";
import { connectDB } from "../config/database.js";
import { USER_ROLES } from "../constants.js";

const seedPermissions = async () => {
  try {
    await connectDB();

    console.log("Clearing existing modules and permissions...");
    await Module.deleteMany({});
    await RolePermission.deleteMany({});

    console.log("Seeding new modules...");
    const seededModules = await Module.insertMany(sidebarModules);

    console.log("Finding Super Admin roles...");
    const superAdminRoles = await Role.find({ roleName: USER_ROLES.SUPERADMIN });

    if (!superAdminRoles || superAdminRoles.length === 0) {
      console.error("No Super Admin roles found. Please seed roles first.");
      return;
    }

    console.log(`Found ${superAdminRoles.length} Super Admin role(s). Granting permissions...`);

    for (const superAdminRole of superAdminRoles) {
      const permissions = seededModules.map((module) => ({
        companyId: superAdminRole.companyId,
        role: superAdminRole._id,
        module: module._id,
        canView: true,
        canEdit: true,
      }));

      await RolePermission.insertMany(permissions);
    }

    console.log("Permissions seeded successfully for all Super Admin roles.");
  } catch (error) {
    console.error("Error seeding permissions:", error);
  } finally {
    await mongoose.connection.close();
  }
};

seedPermissions();
