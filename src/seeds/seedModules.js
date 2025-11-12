import Module from "../models/Module.js";
import { sidebarModules } from "../utils/data.js";
import { closeDB, connectDB } from "../config/database.js";
import { BOOLEAN, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants.js";

/**
 * Seed the modules in the database if they do not already exist.
 * This function will only seed if the SEED_DATABASE environment variable is set to 'true'.
 * It checks if modules are already present and skips seeding if they are.
 * If the modules are not present, it will create them from the sidebarModules data.
 *
 * @returns {Promise<void>}
 */
export async function seedModules() {
  try {
    // Only seed if SEED_DATABASE is set to 'true'
    if (process.env.SEED_DATABASE !== BOOLEAN.TRUE) {
      console.log(SUCCESS_MESSAGES.SKIPPING_SEEDING_MODULES);
      return; // Skip seeding if SEED_DATABASE is not 'true'
    }

    // Connect to the database
    await connectDB();

    // Clear existing modules
    await Module.deleteMany({});

    // Check if modules exist and seed if not
    const existingModules = await Module.countDocuments();
    if (existingModules > 0) {
      console.log(SUCCESS_MESSAGES.MODULE_EXISTS_SKIP_SEEDING);
      return; // Skip seeding if modules are already present
    }

    // Loop through sidebarModules and create them if they don't exist
    for (let module of sidebarModules) {
      const existingModule = await Module.findOne({
        moduleName: module.moduleName,
      });

      if (!existingModule) {
        await Module.create(module);
        console.log(`${ERROR_MESSAGES.MODULE_CREATED} '${module.moduleName}'`);
      } else {
        console.log(
          `${ERROR_MESSAGES.MODULE_ALREADY_EXISTS} - '${module.moduleName}'`
        );
      }
    }
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_SEEDING_MODULES, error);
  }
}
