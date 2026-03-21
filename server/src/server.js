import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./config/logger.js";

dotenv.config({ path: "../.env" });

const port = Number(process.env.PORT);
console.log("port", port);
async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(port, () => {
      logger.info({ port }, `Server is running on http://localhost:${port}`);
    });

    const shutdown = (signal) => {
      logger.warn({ signal }, "Gracefully shutting down server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

startServer();
