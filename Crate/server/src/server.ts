import { createApp } from "./app";
import { config } from "./config/env";
import { prisma } from "./db/prismaClient";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Crate API listening on http://localhost:${config.port}`);
});

// tsx watch restarts the process on every file save, which otherwise
// leaves the previous run's SQLite connection open. Closing both the
// HTTP server and the Prisma connection on shutdown keeps that clean.
async function shutdown() {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
