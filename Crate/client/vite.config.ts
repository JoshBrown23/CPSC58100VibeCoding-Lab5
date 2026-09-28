import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests to the Express server during development, so
    // the client can call relative URLs and never hits a CORS issue.
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
