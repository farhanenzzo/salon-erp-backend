import { connectDB } from "./database.js";
import { setupGracefulShutdown } from "./shutdown.js";

export const startServer = (app, port, host) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Connect to the database
      await connectDB();

      // Start the server
      const server = app.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
        console.log(`For local access, use: http://localhost:${port}`);
        resolve(server);
      });

      // Setup graceful shutdown handling
      setupGracefulShutdown(server);
    } catch (error) {
      console.error("Error starting server:", error);
      reject(error);
    }
  });
};
