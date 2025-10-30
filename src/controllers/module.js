import { ERROR_MESSAGES } from "../constants.js";
import { getModulesForRole } from "../services/module.js";

export const getModulesByRole = async (req, res) => {
  try {
    const roleId = req.query.roleId || req.roleId;

    // Fetch modules for the role using the service
    const modules = await getModulesForRole(roleId); // Call the function directly

    if (!modules || modules.length === 0) {
      return res.status(200).json({
        success: true,
        modules: [], // Return an empty array_
        message: ERROR_MESSAGES.NO_MODULES_FOUND_FOR_THIS_ROLE,
      });
    }

    return res.status(200).json({
      success: true,
      modules,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
