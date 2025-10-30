import cron from "node-cron";
import { updateExpiredOffers } from "../services/offer.js";

// Function to start the cron job for updating expired offers
export const startOfferStatusCron = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running cron job to update expired offers...");
    try {
      const updateResult = await updateExpiredOffers();
      console.log(updateResult.message);
    } catch (error) {
      console.error(`Error updating offers: ${error.message}`);
    }
  });
};
