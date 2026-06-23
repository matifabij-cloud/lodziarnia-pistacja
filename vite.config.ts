import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Bezwzględna ścieżka bazowa dla GitHub Pages (projekt = /<nazwa-repo>/).
  // Gwarantuje poprawne ładowanie /assets/... niezależnie od ukośnika na końcu URL.
  base: "/lodziarnia-pistacja/",
  plugins: [react()],
  build: {
    // STAŁE nazwy plików (bez zmiennego hasha). Dzięki temu zacache'owany w
    // przeglądarce index.html zawsze trafia w istniejący /assets/index.js i
    // /assets/index.css — eliminuje biały ekran (404 na starym pliku) po
    // każdej nowej publikacji na GitHub Pages.
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
