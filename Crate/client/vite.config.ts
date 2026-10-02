import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const clientDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests to the Express server during development, so
    // the client can call relative URLs and never hits a CORS issue.
    proxy: {
      "/api": "http://localhost:4000",
    },
    // shared/album.ts lives one directory up from the Vite root.
    fs: {
      allow: [path.resolve(clientDir, "..")],
    },
  },
});
