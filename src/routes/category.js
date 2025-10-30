import express from "express";
import {
  createCategory,
  listCategoriesHandler,
  listCategoryDropdown,
  softDeleteCategory,
  toggleCategoryStatus,
  updateCategoryDetails,
} from "../controllers/category.js";
import upload from "../middleware/upload.js";
import { CATEGORY_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * @route GET /
 * @description Fetch a list of all categories.
 */
router.get(CATEGORY_ROUTES.BASE, listCategoriesHandler);

/**
 * @route POST /
 * @middleware upload
 * @description Create a new category with an uploaded image.
 */
router.post(
  CATEGORY_ROUTES.BASE,
  upload(UPLOAD_IMAGE_FIELD.IMAGE),
  createCategory
);

/**
 * @route GET /options
 * @description Fetch a dropdown list of categories.
 */
router.get(CATEGORY_ROUTES.CATEGORY_OPTIONS, listCategoryDropdown);

/**
 * @route PATCH /soft-delete/:id
 * @description Soft delete a category by its ID.
 */
router.patch(CATEGORY_ROUTES.SOFT_DELETE, softDeleteCategory);

/**
 * @route PATCH /status/:id
 * @description Toggle the status (active/inactive) of a category by its ID.
 */
router.patch(CATEGORY_ROUTES.TOGGLE_STATUS, toggleCategoryStatus);

router.patch(
  CATEGORY_ROUTES.UPDATE,
  upload(UPLOAD_IMAGE_FIELD.IMAGE),
  updateCategoryDetails
);

export default router;
