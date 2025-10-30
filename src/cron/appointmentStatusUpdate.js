import cron from "node-cron";
import { updateAppointmentStatuses } from "../controllers/appointment.js";
import { Appointment } from "../models/Appointments.js";

export const startAppointmentStatusCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      //Fetch all company ids
      const companies = await Appointment.distinct("companyId", {
        isTrashed: false,
      });

      for (const companyId of companies) {
        // Call the update function and pass companyId as an argument
        await updateAppointmentStatuses(companyId);
      }

      console.log("Appointment statuses updated.");
    } catch (error) {
      console.error("Error updating appointment statuses:", error);
    }
  });
};
