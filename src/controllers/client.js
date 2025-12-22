import { Client } from "../models/Client.js";
import {
  DEFAULT_PROFILE_IMAGE_URL,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES,
} from "../constants.js";
import { uploadImageToFirebase } from "../services/firebaseStorage.js";
import { generateNextClientId } from "../utils/idGenerator.js";
import * as clientService from "../services/client.js";
import { auth } from "../../firebaseAdmin.js";
import Role from "../models/Role.js";

/**
 * Adds a new client to the database, including their details and optional photo upload.
 *
 * This function processes client information, uploads an image (if provided),
 * creates a new `Client` document in the database, and returns the saved client object.
 *
 * @async
 * @function addClient
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing client details.
 * @param {string} req.body.firstName - The client's first name.
 * @param {string} req.body.lastName - The client's last name.
 * @param {string} req.body.email - The client's email address.
 * @param {string} req.body.phone - The client's phone number.
 * @param {string} req.body.dob - The client's date of birth.
 * @param {string} req.body.gender - The client's gender.
 * @param {string} req.body.notes - Additional notes about the client.
 * @param {string} req.body.address - The client's address.
 * @param {Object} req.file - The uploaded file, if any, containing the client's photo.
 * @param {Object} req.companyId - The company ID of the client.
 * @param {Object} res - The response object.
 *
 * @returns {Object} - A JSON response containing the newly created client, or an error message.
 */
export const addClient = async (req, res) => {
  const { firstName, lastName, email, phone, dob, gender, notes, address } =
    req.body;

  const { companyId } = req;

  let photoToUse = "";

  // Check if a file was uploaded
  if (req.file) {
    try {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      photoToUse = await uploadImageToFirebase(req.file.buffer, fileName); // Upload and get the URL
    } catch (error) {
      return res
        .status(500)
        .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
    }
  }

  let role = await Role.findOne({ roleName: USER_ROLES.USER, companyId });

  if (!role) {
    // If the role doesn't exist, create a new one
    const newRole = new Role({
      roleName: USER_ROLES.USER,
      companyId,
    });

    await newRole.save();
    role = newRole; // Assign the newly created role to the user
  }

  const clientFullName = `${firstName} ${lastName}`;

  const newClient = new Client({
    name: clientFullName,
    email,
    phone,
    dob,
    photo: photoToUse || DEFAULT_PROFILE_IMAGE_URL,
    gender,
    notes,
    address,
    companyId,
    role: role._id,
  });

  try {
    await newClient.save();

    // Now, generate and assign the clientId after the client has been successfully saved
    const clientId = await generateNextClientId(companyId);
    newClient.clientId = clientId;

    await newClient.save();

    res.status(201).json(newClient);
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_ADD_CLIENT, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_ADD_CLIENT });
  }
};

/**
 * Retrieves a paginated list of clients for the specified company.
 *
 * @async
 * @function listClients
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @param {number} req.query.page - The page number for pagination.
 * @param {number} req.query.limit - The number of items per page for pagination.
 * @param {string} req.companyId - The ID of the company to retrieve clients for (provided by middleware).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response containing the clients data or an error message.
 * @throws {Error} If there is an issue retrieving the clients, sends a 500 response with an error message.
 */
export const listClients = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const companyId = req.companyId;

    // Call service function to get the clients data
    const clientsData = await clientService.getClients(companyId, page, limit);

    return res.status(200).json(clientsData);
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_TO_RETRIEVE_CLIENTS, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_CLIENTS });
  }
};

/**
 * Searches for a client by their client ID.
 *
 * @async
 * @function searchClientByClientId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - URL parameters.
 * @param {string} req.params.clientId - The client ID to search for.
 * @param {string} req.companyId - The ID of the company to which the client belongs (provided by middleware).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response containing the client details if found, or an error message.
 * @throws {Error} If there is an issue searching for the client, sends a 500 response with an error message.
 */
export const searchClientByClientId = async (req, res) => {
  const { clientId } = req.params;
  const { companyId } = req;

  try {
    const client = await Client.findOne({
      isTrashed: false,
      clientId: clientId,
      companyId
    });

    if (!client) {
      return res.status(404).json({ message: ERROR_MESSAGES.CLIENT_NOT_FOUND });
    }

    const { _id, name, email, phone, gender, photo } = client;
    res.status(200).json({ _id, name, email, phone, gender, photo });
  } catch (error) {
    console.error(ERROR_MESSAGES.FAILED_SEARCHING_CLIENT, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_SEARCHING_CLIENT });
  }
};

/**
 * Soft deletes a client by marking it as trashed.
 *
 * @async
 * @function softDeleteClientById
 * @param {Object} req - Express request object.
 * @param {Object} req.params - URL parameters.
 * @param {string} req.params.id - The ID of the client to be soft deleted.
 * @param {string} req.companyId - The ID of the company to which the client belongs (provided by middleware).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a success message if the client is soft deleted, or an error message if the client is not found or an error occurs.
 * @throws {Error} If there is an issue soft deleting the client, sends a 500 response with an error message.
 */
export const softDeleteClientById = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;

  try {
    const client = await Client.findByIdAndUpdate(
      { _id: id },
      companyId,
      { isTrashed: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: ERROR_MESSAGES.CLIENT_NOT_FOUND });
    }

    client.isTrashed = true;
    await client.save();

    res.status(200).json({ message: SUCCESS_MESSAGES.CLIENT_DELETION_SUCCESS });
  } catch (error) {
    console.error(ERROR_MESSAGES.ERROR_DELETING_CLIENT, error);
    res.status(500).json({ error: ERROR_MESSAGES.ERROR_DELETING_CLIENT });
  }
};

/**
 * Retrieves the count of active (non-trashed) clients for the specified company.
 *
 * @async
 * @function getClientCount
 * @param {Object} req - Express request object.
 * @param {string} req.companyId - The ID of the company to filter clients (provided by middleware).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends the count of active clients as a JSON response.
 * Returns an error message if no companyId is found or if an error occurs.
 * @throws {Error} If there is an issue retrieving the client count, sends a 500 response with an error message.
 */
export const getClientCount = async (req, res) => {
  try {
    // Check if companyId exists
    if (!req.companyId) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
    }

    const count = await Client.countDocuments({
      isTrashed: false,
      companyId: req.companyId,
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.log(ERROR_MESSAGES.ERROR_COUNTING_CLIENTS, error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.ERROR_COUNTING_CLIENTS });
  }
};

/**
 * Controller to update client details.
 *
 * @param {Object} req - The request object, containing client data and the company ID.
 * @param {Object} res - The response object used to send back the updated client data or an error message.
 * @returns {void}
 */
export const updateClient = async (req, res) => {
  const { clientId } = req.params; // Get clientId from the route parameter
  const { firstName, lastName, ...restData } = req.body; // Extract firstName, lastName, and the rest of the data
  const { companyId } = req; // Extract companyId from the request object

  if (!companyId) {
    return res
      .status(404)
      .json({ message: ERROR_MESSAGES.NO_COMPANY_ID_FOUND });
  }

  let photoToUse = "";

  // Check if a file (photo) was uploaded
  if (req.file) {
    try {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      photoToUse = await uploadImageToFirebase(req.file.buffer, fileName); // Upload the photo and get the URL
    } catch (error) {
      console.log(ERROR_MESSAGES.FAILED_IMAGE_UPLOAD, error);
      return res
        .status(500)
        .json({ error: ERROR_MESSAGES.FAILED_IMAGE_UPLOAD });
    }
  }

  // Combine firstName and lastName to form the full name if they are provided
  let updatedData = { ...restData }; // Initialize with other fields
  if (firstName || lastName) {
    updatedData.name = `${firstName || ""} ${lastName || ""}`.trim(); // Combine, trimming any unnecessary spaces
  }

  try {
    // Find the existing client to retain their current photo if no new photo is provided
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: ERROR_MESSAGES.CLIENT_NOT_FOUND });
    }

    // If no new photo is uploaded, retain the current photo
    if (!photoToUse) {
      photoToUse = client.photo; // Keep the old image
    }

    updatedData.photo = photoToUse;

    // Find and update the client
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      updatedData,
      {
        new: true,
        runValidators: true,
        companyId,
      }
    );

    if (updatedClient.firebaseUid) {
      try {
        // Use the Firebase Admin Manager's auth instance to update the displayName
        const userRecord = await auth.updateUser(updatedClient.firebaseUid, {
          displayName: updatedClient.name,
          photoUrl: updatedClient.photo,
        });

        console.log("user record", userRecord);
      } catch (firebaseError) {
        console.error(
          ERROR_MESSAGES.ERROR_UPDATING_FIREBASE_DISPLAY_NAME,
          firebaseError
        );
        return res.status(500).json({
          error: `${ERROR_MESSAGES.ERROR_UPDATING_FIREBASE_DISPLAY_NAME}: ${firebaseError.message}`,
        });
      }
    }

    // If no client was found, return an error response
    if (!updatedClient) {
      return res.status(404).json({ message: ERROR_MESSAGES.CLIENT_NOT_FOUND });
    }
    updatedClient.photo = photoToUse;
    // Save the updated client
    await updatedClient.save();

    // Return the updated client data
    res.status(200).json(updatedClient);
  } catch (error) {
    console.log(ERROR_MESSAGES.FAILED_TO_UPDATE_CLIENT, error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_UPDATE_CLIENT });
  }
};
