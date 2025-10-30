import express from "express";
import {
  addNewStock,
  softDeleteStock,
  listStocks,
  updateStock,
  getStockById,
  getStockCount,
} from "../controllers/stocks.js";
import stockStatusMiddleware from "../middleware/stockStatus.js";
import upload from "../middleware/upload.js";
import { STOCK_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * Route to add new stock.
 * @route POST /api/stocks
 * @access Public
 */
router.post(
  STOCK_ROUTES.BASE,
  upload(UPLOAD_IMAGE_FIELD.STOCK_IMAGE),
  stockStatusMiddleware,
  addNewStock
);

/**
 * Route to get all stocks.
 * @route GET /api/stocks
 * @access Public
 */
router.get(STOCK_ROUTES.BASE, listStocks);

router.get(STOCK_ROUTES.COUNT, getStockCount);

/**
 * Route to get a specific stock by ID.
 * @route GET /api/stocks/:id
 * @access Public
 */
router.get(STOCK_ROUTES.GET_BY_ID, getStockById);

/**
 * Route to soft delete a specific stock by ID.
 * @route PATCH /api/stocks/soft-delete/:id
 * @access Public
 */
router.patch(STOCK_ROUTES.SOFT_DELETE, softDeleteStock);

/**
 * Route to update an existing stock.
 * @route PATCH /api/stocks/:id
 * @access Public
 */
router.patch(
  STOCK_ROUTES.UPDATE,
  upload(UPLOAD_IMAGE_FIELD.STOCK_IMAGE),
  updateStock
);

export default router;
