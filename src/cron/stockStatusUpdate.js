import cron from "node-cron";
import { updateExpiredStocks } from "../controllers/stocks.js";
import { Stocks } from "../models/Stocks.js";
import { FILED_NAMES, STOCK_STATUS_CRON_UPDATION } from "../constants.js";

export const startStockStatusCron = () => {
  cron.schedule(STOCK_STATUS_CRON_UPDATION.DAILY, async () => {
    try {
      // Fetch all company IDs with non-trashed stocks
      const companies = await Stocks.distinct(FILED_NAMES.COMPANY_ID, {
        isTrashed: false,
      });

      for (const companyId of companies) {
        await updateExpiredStocks(companyId);
      }

      console.log("Stock statuses updated.");
    } catch (error) {
      console.error("Error updating stock statuses:", error);
    }
  });
};
