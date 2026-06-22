import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Bezwzględna ścieżka bazowa dla GitHub Pages (projekt = /<nazwa-repo>/).
  // Gwarantuje poprawne ładowanie /assets/... niezależnie od ukośnika na końcu URL.
  base: "/lodziarnia-pistacja/",
  plugins: [react()],
});
