import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "src/server.ts" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    hmr: process.env['DISABLE_HMR'] !== 'true',
    watch: process.env['DISABLE_HMR'] === 'true' ? null : {},
  },
});
