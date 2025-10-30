import express from "express";
import {
  createRole,
  getAllRoles,
  getAllModulesWithPermissions,
  getRolesForDropdown,
  updateRolePermissions,
  updateRole,
  trashRole,
} from "../controllers/role.js";
import { ROLE_ROUTES } from "../constants.js";

const router = express.Router();

/**
 * Route to create a role and get all roles.
 * @route POST /api/roles
 * @route GET /api/roles
 * @access Public
 */
router
  .route(ROLE_ROUTES.BASE)
  .post(createRole) // Create a new role
  .get(getAllRoles); // Get all roles

/**
 * Route to get roles for dropdown selection.
 * @route GET /api/roles/dropdown
 * @access Public
 */
router.route(ROLE_ROUTES.DROPDOWN).get(getRolesForDropdown);

/**
 * Routes to get and update permissions for a specific role.
 * @route GET /api/roles/:roleId/permissions
 * @route PATCH /api/roles/:roleId/permissions
 * @access Public
 */
router
  .route(ROLE_ROUTES.PERMISSIONS)
  .get(getAllModulesWithPermissions) // Get permissions for a specific role
  .patch(updateRolePermissions); // Update permissions for a specific role

/**
 * @route PATCH ROLE_ROUTES.UPDATE_ROLE
 * @desc Update an existing role
 * @access Private (Requires authentication)
 * @param {string} roleId - The ID of the role to update (included in the route).
 * @param {Object} req.body - The request body.
 * @param {string} req.body.roleName - The new name for the role.
 * @returns {Object} - Returns the updated role object or an error message.
 */
router.route(ROLE_ROUTES.UPDATE_ROLE).patch(updateRole);

router.route(ROLE_ROUTES.TRASH_ROLE).patch(trashRole);

export default router;
