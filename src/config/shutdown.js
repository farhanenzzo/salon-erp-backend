import { closeDB } from "./database.js";

export const setupGracefulShutdown = (server) => {
  const shutdown = async () => {
    console.log("Closing server gracefully...");
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};
