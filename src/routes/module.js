import express from "express";
import { getModulesByRole } from "../controllers/module.js";
import { MODULE_ROUTES } from "../constants.js";

const router = express.Router();

/**
 * Route to fetch allowed modules for the user's role.
 * @route GET /api/modules
 * @access Public
 */
router.get(MODULE_ROUTES.BASE_ROUTE, getModulesByRole);

export default router;
