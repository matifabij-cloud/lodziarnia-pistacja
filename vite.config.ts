import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Ścieżki względne — działa pod dowolnym podkatalogiem (GitHub Pages,
  // np. /lodziarnia-pistacja/) oraz przy otwieraniu builda lokalnie.
  base: "./",
  plugins: [react()],
});
