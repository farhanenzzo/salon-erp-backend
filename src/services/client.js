import { Client } from "../models/Client.js";

/**
 * Service to get clients with last appointment and stylist info.
 * Supports pagination if both `page` and `limit` are provided.
 *
 * @param {string} companyId - The company ID to filter clients.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of records per page.
 *
 * @returns {Object} - The clients' data along with pagination info.
 */
export const getClients = async (companyId, page, limit) => {
  const baseStages = [
    { $match: { isTrashed: false, companyId } },
    {
      $lookup: {
        from: "appointments",
        let: { clientId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$client", "$$clientId"] },
                  { $eq: ["$appointmentStatus", "Completed"] },
                  { $ne: ["$isTrashed", true] },
                ],
              },
            },
          },
          { $sort: { date: -1 } },
          { $limit: 1 },
        ],
        as: "lastCompletedAppointment",
      },
    },
    {
      $addFields: {
        lastVisitedDate: {
          $ifNull: [
            { $arrayElemAt: ["$lastCompletedAppointment.date", 0] },
            null,
          ],
        },
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "preferredStylist",
        foreignField: "_id",
        as: "preferredStylistInfo",
      },
    },
    {
      $addFields: {
        preferredStylist: {
          $arrayElemAt: [
            {
              $map: {
                input: "$preferredStylistInfo",
                as: "stylist",
                in: { id: "$$stylist._id", name: "$$stylist.employeeName" },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        clientId: 1,
        name: 1,
        email: 1,
        photo: 1,
        phone: 1,
        dob: 1,
        gender: 1,
        address: 1,
        notes: 1,
        preferredStylist: 1,
        lastVisitedDate: 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  // Handle pagination if both page and limit are provided
  if (page && limit) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (parsedPage > 0 && parsedLimit > 0) {
      // Count total clients for pagination
      const totalCount = await Client.aggregate([
        { $match: { isTrashed: false, companyId } },
        { $count: "total" },
      ]);

      const skip = (parsedPage - 1) * parsedLimit;

      // Get clients with pagination
      const clients = await Client.aggregate([
        ...baseStages,
        { $skip: skip },
        { $limit: parsedLimit },
      ]);

      return {
        data: clients,
        pagination: {
          total: totalCount[0]?.total || 0,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil((totalCount[0]?.total || 0) / parsedLimit),
        },
      };
    }
  }

  // If no pagination, return all clients
  const clients = await Client.aggregate(baseStages);
  return { data: clients };
};
