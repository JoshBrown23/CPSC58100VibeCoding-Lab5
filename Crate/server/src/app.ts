import express from "express";
import cors from "cors";
import apiRouter from "./api";
import { requestLogger } from "./middleware/requestLogger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  // Open CORS for local development. Once the client is deployed
  // somewhere fixed, restrict this to that origin instead of "*".
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", apiRouter);

  // Order matters: notFoundHandler only runs if nothing above matched,
  // and errorHandler must be registered last to catch anything thrown
  // (including by notFoundHandler's neighbors) via asyncHandler/next().
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
