import express from "express";
import {
  addEmployee,
  softDeleteEmployee,
  listEmployees,
  listServiceBasedEmployee,
  updateEmployee,
  listServiceBasedEmployeeSummary,
} from "../controllers/employee.js";
import upload from "../middleware/upload.js";
import { EMPLOYEE_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * Route to list all employees.
 * @route GET /api/employees
 * @access Public
 */
router.get(EMPLOYEE_ROUTES.LIST_EMPLOYEES, listEmployees);

/**
 * Route to add a new employee.
 * @route POST /api/employees
 * @access Public
 */
router.post(
  EMPLOYEE_ROUTES.ADD_EMPLOYEE,
  upload(UPLOAD_IMAGE_FIELD.EMPLOYEE_PHOTO),
  addEmployee
);

/**
 * Route to list employees based on their service.
 * @route GET /api/employees/service
 * @access Public
 */
router.get(EMPLOYEE_ROUTES.LIST_SERVICE_EMPLOYEES, listServiceBasedEmployee);

/**
 * Route to update an employee's details.
 * @route PATCH /api/employees/:id
 * @access Public
 */
router.patch(
  EMPLOYEE_ROUTES.UPDATE_EMPLOYEE,
  upload(UPLOAD_IMAGE_FIELD.EMPLOYEE_PHOTO),
  updateEmployee
);

/**
 * @route GET /api/v1/employees/summary
 * @description Lists employee name and photo based on the roles of the given service.
 * @access Public
 */

router.get(EMPLOYEE_ROUTES.SUMMARY, listServiceBasedEmployeeSummary);

/**
 * Route to soft delete an employee.
 * @route PATCH /api/employees/soft-delete/:id
 * @access Public
 */
router.patch(EMPLOYEE_ROUTES.SOFT_DELETE_EMPLOYEE, softDeleteEmployee);

export default router;
