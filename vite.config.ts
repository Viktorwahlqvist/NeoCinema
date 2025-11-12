import { defineConfig } from "vitest/config";   
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

test: {
  include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  environment: "jsdom",
  globals: true,
  setupFiles: "./src/setupTests.ts",
},
});