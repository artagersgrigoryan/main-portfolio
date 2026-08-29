import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: vite-plugin-singlefile was removed here. It inlined every asset into a
// single index.html, which cannot coexist with one HTML file per route — and
// with several entry points, a shared JS bundle the browser caches once beats
// re-downloading an inlined copy on every route.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
