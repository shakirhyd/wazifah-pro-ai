import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    hmr: process.env['DISABLE_HMR'] !== 'true',
    watch: process.env['DISABLE_HMR'] === 'true' ? null : {},
  },
});
