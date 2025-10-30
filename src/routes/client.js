// routes/clientRoutes.js

import express from "express";
import {
  addClient,
  getClientCount,
  softDeleteClientById,
  listClients,
  searchClientByClientId,
  updateClient,
} from "../controllers/client.js";
import upload from "../middleware/upload.js";
import { CLIENT_ROUTES, UPLOAD_IMAGE_FIELD } from "../constants.js";

const router = express.Router();

/**
 * @route GET /
 * @description Fetch a list of all clients.
 */
router.get(CLIENT_ROUTES.BASE, listClients);

/**
 * @route POST /
 * @middleware upload
 * @description Add a new client with an uploaded photo.
 */
router.post(CLIENT_ROUTES.BASE, upload(UPLOAD_IMAGE_FIELD.PHOTO), addClient);

/**
 * @route GET /count
 * @description Fetch the count of non-trashed clients.
 */
router.get(CLIENT_ROUTES.COUNT, getClientCount);

/**
 * @route PATCH /soft-delete/:id
 * @description Soft delete a client by its ID.
 */
router.patch(CLIENT_ROUTES.SOFT_DELETE, softDeleteClientById);

/**
 * @route GET /:clientId
 * @description Search and fetch a client by their client ID.
 */
router.get(CLIENT_ROUTES.SEARCH_BY_CLIENT_ID, searchClientByClientId);

/**
 * @route PATCH /:clientId
 * @middleware upload
 * @description Update client details, including an uploaded photo.
 */
router.patch(
  CLIENT_ROUTES.UPDATE_CLIENT,
  upload(UPLOAD_IMAGE_FIELD.PHOTO),
  updateClient
);

export default router;
